import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import {
  createDefaultAlerts,
  createDefaultGates,
  type ExecutiveKPI,
  type ExecutivePrediction,
  type ExecutiveSafetyMetric,
  type ExecutiveStateResponse,
  type GateStatus,
  type OperatorStateResponse,
  type SystemAlert,
} from "../shared/operator";
import {
  type LoyaltyClaimResult,
  type LoyaltyEventType,
  type LoyaltyLedgerEntry,
  type LoyaltyWalletResponse,
} from "../shared/loyalty";
import {
  type FanChatMessage,
  type FanChatMessagesResponse,
  type FanChatSendResponse,
} from "../shared/chat";
import {
  type FlashPoll,
  type FlashPollOption,
  type FlashPollStateResponse,
  type FlashPollVoteResponse,
} from "../shared/polls";

const require = createRequire(import.meta.url);
const wasmPath = require.resolve("sql.js/dist/sql-wasm.wasm");
const DB_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "smart-entry.sqlite");
const MAX_ALERTS = 25;
const EARLY_ARRIVAL_REWARD_TOKENS = 40;
const DELAYED_EXIT_REWARD_TOKENS = 30;
const EARLY_ARRIVAL_THRESHOLD_MINUTES = 60;
const DELAYED_EXIT_THRESHOLD_MINUTES = 20;
const CHAT_DEFAULT_ROOM = "match-main";
const FLASH_POLL_DEFAULT_ID = "flash-poll-main";

function nowIso() {
  return new Date().toISOString();
}

function toGateStatusStatus(queue: number): GateStatus["status"] {
  if (queue > 80) return "critical";
  if (queue > 50) return "warning";
  return "normal";
}

function toRiskLevel(density: number): ExecutiveSafetyMetric["riskLevel"] {
  if (density >= 85) return "critical";
  if (density >= 70) return "danger";
  if (density >= 50) return "caution";
  return "safe";
}

function toPredictionRisk(
  density: number,
): ExecutivePrediction["riskLevel"] {
  if (density >= 85) return "critical";
  if (density >= 70) return "high";
  if (density >= 50) return "medium";
  return "low";
}

function mapRows<T extends Record<string, unknown>>(db: Database, query: string): T[] {
  const stmt = db.prepare(query);
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return rows;
}

function escapeSqlValue(value: string): string {
  return value.replace(/'/g, "''");
}

function sanitizeChatText(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

export class OperatorDatabase {
  private sql!: SqlJsStatic;
  private db!: Database;

  static async create(): Promise<OperatorDatabase> {
    const instance = new OperatorDatabase();
    await instance.initialize();
    return instance;
  }

  private async initialize() {
    this.sql = await initSqlJs({
      locateFile: () => wasmPath,
    });

    let shouldPersist = false;
    await fs.mkdir(DB_DIR, { recursive: true });
    try {
      const fileData = await fs.readFile(DB_FILE);
      this.db = new this.sql.Database(new Uint8Array(fileData));
    } catch {
      this.db = new this.sql.Database();
      shouldPersist = true;
    }

    this.createSchema();
    if (this.ensureSeedData()) {
      shouldPersist = true;
    }

    if (shouldPersist) {
      await this.persist();
    }
  }

  private createSchema() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS gates (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        current_queue INTEGER NOT NULL,
        average_wait_time INTEGER NOT NULL,
        flow_rate INTEGER NOT NULL,
        capacity INTEGER NOT NULL,
        efficiency INTEGER NOT NULL,
        trend TEXT NOT NULL,
        status TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        action_required INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS loyalty_wallets (
        fan_id TEXT PRIMARY KEY,
        token_balance INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS loyalty_events (
        id TEXT PRIMARY KEY,
        fan_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        tokens INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        timestamp TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        room TEXT NOT NULL,
        fan_id TEXT NOT NULL,
        fan_name TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS flash_polls (
        id TEXT PRIMARY KEY,
        question TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS flash_poll_options (
        id TEXT PRIMARY KEY,
        poll_id TEXT NOT NULL,
        text TEXT NOT NULL,
        votes INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS flash_poll_votes (
        id TEXT PRIMARY KEY,
        poll_id TEXT NOT NULL,
        fan_id TEXT NOT NULL,
        option_id TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
  }

  private rowCount(tableName: string): number {
    const rows = mapRows<{ total: number }>(
      this.db,
      `SELECT COUNT(*) AS total FROM ${tableName}`,
    );
    return Number(rows[0]?.total ?? 0);
  }

  private ensureSeedData(): boolean {
    const gates = createDefaultGates();
    const alerts = createDefaultAlerts();
    let changed = false;

    if (this.rowCount("gates") === 0) {
      const updatedAt = nowIso();
      gates.forEach(gate => {
        this.db.run(
          `
            INSERT INTO gates (
              id, name, current_queue, average_wait_time, flow_rate,
              capacity, efficiency, trend, status, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            gate.id,
            gate.name,
            gate.currentQueue,
            gate.averageWaitTime,
            gate.flowRate,
            gate.capacity,
            gate.efficiency,
            gate.trend,
            gate.status,
            updatedAt,
          ],
        );
      });
      changed = true;
    }

    if (this.rowCount("alerts") === 0) {
      alerts.forEach(alert => {
        this.db.run(
          `
            INSERT INTO alerts (id, type, message, timestamp, action_required)
            VALUES (?, ?, ?, ?, ?)
          `,
          [
            alert.id,
            alert.type,
            alert.message,
            alert.timestamp,
            alert.actionRequired ? 1 : 0,
          ],
        );
      });
      changed = true;
    }

    if (this.rowCount("chat_messages") === 0) {
      const now = Date.now();
      const samples: Array<Pick<FanChatMessage, "fanId" | "fanName" | "message">> = [
        {
          fanId: "fan-guest-1",
          fanName: "مشجع 1",
          message: "أجواء رائعة اليوم! من جاهز للمباراة؟",
        },
        {
          fanId: "fan-guest-2",
          fanName: "مشجع 2",
          message: "أنا قريب من البوابة 3، الازدحام ممتاز.",
        },
      ];
      samples.forEach((sample, index) => {
        this.db.run(
          `
            INSERT INTO chat_messages (id, room, fan_id, fan_name, message, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `,
          [
            `chat-seed-${index}-${now}`,
            CHAT_DEFAULT_ROOM,
            sample.fanId,
            sample.fanName,
            sample.message,
            new Date(now - (samples.length - index) * 60_000).toISOString(),
          ],
        );
      });
      changed = true;
    }

    if (this.rowCount("flash_polls") === 0) {
      const pollId = FLASH_POLL_DEFAULT_ID;
      const createdAt = nowIso();
      this.db.run(
        `
          INSERT INTO flash_polls (id, question, status, created_at)
          VALUES (?, ?, ?, ?)
        `,
        [pollId, "هل كان قرار الحكم في آخر لقطة صحيحًا؟", "active", createdAt],
      );
      this.db.run(
        `
          INSERT INTO flash_poll_options (id, poll_id, text, votes)
          VALUES (?, ?, ?, ?)
        `,
        [`${pollId}-yes`, pollId, "نعم", 0],
      );
      this.db.run(
        `
          INSERT INTO flash_poll_options (id, poll_id, text, votes)
          VALUES (?, ?, ?, ?)
        `,
        [`${pollId}-no`, pollId, "لا", 0],
      );
      changed = true;
    }

    return changed;
  }

  private async persist() {
    const exported = this.db.export();
    await fs.writeFile(DB_FILE, Buffer.from(exported));
  }

  private readGates(): GateStatus[] {
    const rows = mapRows<{
      id: number;
      name: string;
      current_queue: number;
      average_wait_time: number;
      flow_rate: number;
      capacity: number;
      efficiency: number;
      trend: GateStatus["trend"];
      status: GateStatus["status"];
    }>(
      this.db,
      `
        SELECT
          id, name, current_queue, average_wait_time, flow_rate,
          capacity, efficiency, trend, status
        FROM gates
        ORDER BY id ASC
      `,
    );

    return rows.map(row => ({
      id: Number(row.id),
      name: String(row.name),
      currentQueue: Number(row.current_queue),
      averageWaitTime: Number(row.average_wait_time),
      flowRate: Number(row.flow_rate),
      capacity: Number(row.capacity),
      efficiency: Number(row.efficiency),
      trend: row.trend,
      status: row.status,
    }));
  }

  private readAlerts(limit = MAX_ALERTS): SystemAlert[] {
    const rows = mapRows<{
      id: string;
      type: SystemAlert["type"];
      message: string;
      timestamp: string;
      action_required: number;
    }>(
      this.db,
      `
        SELECT id, type, message, timestamp, action_required
        FROM alerts
        ORDER BY timestamp DESC
        LIMIT ${limit}
      `,
    );

    return rows.map(row => ({
      id: String(row.id),
      type: row.type,
      message: String(row.message),
      timestamp: String(row.timestamp),
      actionRequired: Number(row.action_required) === 1,
    }));
  }

  private ensureWallet(fanId: string): boolean {
    const rows = mapRows<{ fan_id: string }>(
      this.db,
      `SELECT fan_id FROM loyalty_wallets WHERE fan_id = '${fanId.replace(/'/g, "''")}' LIMIT 1`,
    );
    if (rows.length > 0) return false;
    const ts = nowIso();
    this.db.run(
      `
        INSERT INTO loyalty_wallets (fan_id, token_balance, created_at, updated_at)
        VALUES (?, ?, ?, ?)
      `,
      [fanId, 0, ts, ts],
    );
    return true;
  }

  private getWalletBalance(fanId: string): number {
    const rows = mapRows<{ token_balance: number }>(
      this.db,
      `
        SELECT token_balance
        FROM loyalty_wallets
        WHERE fan_id = '${fanId.replace(/'/g, "''")}'
        LIMIT 1
      `,
    );
    return Number(rows[0]?.token_balance ?? 0);
  }

  private hasClaimedReward(fanId: string, eventType: LoyaltyEventType): boolean {
    const rows = mapRows<{ total: number }>(
      this.db,
      `
        SELECT COUNT(*) AS total
        FROM loyalty_events
        WHERE fan_id = '${fanId.replace(/'/g, "''")}'
          AND event_type = '${eventType}'
      `,
    );
    return Number(rows[0]?.total ?? 0) > 0;
  }

  private readLoyaltyEntries(fanId: string, limit = 20): LoyaltyLedgerEntry[] {
    const rows = mapRows<{
      id: string;
      event_type: LoyaltyEventType;
      tokens: number;
      title: string;
      description: string;
      timestamp: string;
    }>(
      this.db,
      `
        SELECT id, event_type, tokens, title, description, timestamp
        FROM loyalty_events
        WHERE fan_id = '${fanId.replace(/'/g, "''")}'
        ORDER BY timestamp DESC
        LIMIT ${limit}
      `,
    );

    return rows.map(row => ({
      id: String(row.id),
      eventType: row.event_type,
      tokens: Number(row.tokens),
      title: String(row.title),
      description: String(row.description),
      timestamp: String(row.timestamp),
    }));
  }

  private appendLoyaltyEntry(
    fanId: string,
    eventType: LoyaltyEventType,
    tokens: number,
    title: string,
    description: string,
  ) {
    this.db.run(
      `
        INSERT INTO loyalty_events (id, fan_id, event_type, tokens, title, description, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        `loyalty-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        fanId,
        eventType,
        tokens,
        title,
        description,
        nowIso(),
      ],
    );
  }

  private updateWalletBalance(fanId: string, nextBalance: number) {
    this.db.run(
      `
        UPDATE loyalty_wallets
        SET token_balance = ?, updated_at = ?
        WHERE fan_id = ?
      `,
      [nextBalance, nowIso(), fanId],
    );
  }

  async getLoyaltyWallet(fanId: string): Promise<LoyaltyWalletResponse> {
    if (this.ensureWallet(fanId)) {
      await this.persist();
    }
    return {
      source: "server",
      generatedAt: nowIso(),
      fanId,
      balance: this.getWalletBalance(fanId),
      entries: this.readLoyaltyEntries(fanId),
    };
  }

  async claimEarlyArrivalReward(
    fanId: string,
    minutesBeforeKickoff: number,
  ): Promise<LoyaltyClaimResult> {
    let shouldPersist = false;
    this.db.run("BEGIN");
    try {
      if (this.ensureWallet(fanId)) shouldPersist = true;

      if (minutesBeforeKickoff < EARLY_ARRIVAL_THRESHOLD_MINUTES) {
        this.db.run("COMMIT");
        if (shouldPersist) await this.persist();
        return {
          source: "server",
          generatedAt: nowIso(),
          fanId,
          eventType: "early_arrival",
          awarded: false,
          tokensAwarded: 0,
          balance: this.getWalletBalance(fanId),
          message: `المكافأة تتطلب حضورًا قبل المباراة بـ ${EARLY_ARRIVAL_THRESHOLD_MINUTES} دقيقة على الأقل.`,
        };
      }

      if (this.hasClaimedReward(fanId, "early_arrival")) {
        this.db.run("COMMIT");
        if (shouldPersist) await this.persist();
        return {
          source: "server",
          generatedAt: nowIso(),
          fanId,
          eventType: "early_arrival",
          awarded: false,
          tokensAwarded: 0,
          balance: this.getWalletBalance(fanId),
          message: "تم احتساب مكافأة الحضور المبكر مسبقًا.",
        };
      }

      const nextBalance = this.getWalletBalance(fanId) + EARLY_ARRIVAL_REWARD_TOKENS;
      this.updateWalletBalance(fanId, nextBalance);
      this.appendLoyaltyEntry(
        fanId,
        "early_arrival",
        EARLY_ARRIVAL_REWARD_TOKENS,
        "مكافأة الحضور المبكر",
        `حضرت قبل المباراة بـ ${minutesBeforeKickoff} دقيقة`,
      );
      shouldPersist = true;
      this.db.run("COMMIT");

      if (shouldPersist) await this.persist();
      return {
        source: "server",
        generatedAt: nowIso(),
        fanId,
        eventType: "early_arrival",
        awarded: true,
        tokensAwarded: EARLY_ARRIVAL_REWARD_TOKENS,
        balance: nextBalance,
        message: "تمت إضافة مكافأة الحضور المبكر إلى محفظتك.",
      };
    } catch (error) {
      this.db.run("ROLLBACK");
      throw error;
    }
  }

  async claimDelayedExitReward(
    fanId: string,
    minutesAfterWhistle: number,
  ): Promise<LoyaltyClaimResult> {
    let shouldPersist = false;
    this.db.run("BEGIN");
    try {
      if (this.ensureWallet(fanId)) shouldPersist = true;

      if (minutesAfterWhistle < DELAYED_EXIT_THRESHOLD_MINUTES) {
        this.db.run("COMMIT");
        if (shouldPersist) await this.persist();
        return {
          source: "server",
          generatedAt: nowIso(),
          fanId,
          eventType: "delayed_exit",
          awarded: false,
          tokensAwarded: 0,
          balance: this.getWalletBalance(fanId),
          message: `المكافأة تتطلب الانتظار ${DELAYED_EXIT_THRESHOLD_MINUTES} دقيقة بعد صافرة النهاية.`,
        };
      }

      if (this.hasClaimedReward(fanId, "delayed_exit")) {
        this.db.run("COMMIT");
        if (shouldPersist) await this.persist();
        return {
          source: "server",
          generatedAt: nowIso(),
          fanId,
          eventType: "delayed_exit",
          awarded: false,
          tokensAwarded: 0,
          balance: this.getWalletBalance(fanId),
          message: "تم احتساب مكافأة الخروج الذكي مسبقًا.",
        };
      }

      const nextBalance = this.getWalletBalance(fanId) + DELAYED_EXIT_REWARD_TOKENS;
      this.updateWalletBalance(fanId, nextBalance);
      this.appendLoyaltyEntry(
        fanId,
        "delayed_exit",
        DELAYED_EXIT_REWARD_TOKENS,
        "مكافأة الخروج الذكي",
        `غادرت بعد صافرة النهاية بـ ${minutesAfterWhistle} دقيقة`,
      );
      shouldPersist = true;
      this.db.run("COMMIT");

      if (shouldPersist) await this.persist();
      return {
        source: "server",
        generatedAt: nowIso(),
        fanId,
        eventType: "delayed_exit",
        awarded: true,
        tokensAwarded: DELAYED_EXIT_REWARD_TOKENS,
        balance: nextBalance,
        message: "تمت إضافة مكافأة الخروج الذكي إلى محفظتك.",
      };
    } catch (error) {
      this.db.run("ROLLBACK");
      throw error;
    }
  }

  async spendLoyaltyTokens(
    fanId: string,
    tokens: number,
    description: string,
  ): Promise<LoyaltyClaimResult> {
    if (tokens <= 0) {
      return {
        source: "server",
        generatedAt: nowIso(),
        fanId,
        eventType: "spend",
        awarded: false,
        tokensAwarded: 0,
        balance: this.getWalletBalance(fanId),
        message: "عدد العملات المطلوب خصمها غير صالح.",
      };
    }

    let shouldPersist = false;
    this.db.run("BEGIN");
    try {
      if (this.ensureWallet(fanId)) shouldPersist = true;
      const balance = this.getWalletBalance(fanId);
      if (balance < tokens) {
        this.db.run("COMMIT");
        if (shouldPersist) await this.persist();
        return {
          source: "server",
          generatedAt: nowIso(),
          fanId,
          eventType: "spend",
          awarded: false,
          tokensAwarded: 0,
          balance,
          message: "رصيدك غير كافٍ لإتمام العملية.",
        };
      }

      const nextBalance = balance - tokens;
      this.updateWalletBalance(fanId, nextBalance);
      this.appendLoyaltyEntry(
        fanId,
        "spend",
        -tokens,
        "استخدام العملات داخل الملعب",
        description,
      );
      shouldPersist = true;
      this.db.run("COMMIT");

      if (shouldPersist) await this.persist();
      return {
        source: "server",
        generatedAt: nowIso(),
        fanId,
        eventType: "spend",
        awarded: true,
        tokensAwarded: -tokens,
        balance: nextBalance,
        message: "تم خصم العملات بنجاح.",
      };
    } catch (error) {
      this.db.run("ROLLBACK");
      throw error;
    }
  }

  private readChatMessages(room: string, limit = 40): FanChatMessage[] {
    const safeRoom = escapeSqlValue(room);
    const rows = mapRows<{
      id: string;
      room: string;
      fan_id: string;
      fan_name: string;
      message: string;
      created_at: string;
    }>(
      this.db,
      `
        SELECT id, room, fan_id, fan_name, message, created_at
        FROM chat_messages
        WHERE room = '${safeRoom}'
        ORDER BY created_at DESC
        LIMIT ${limit}
      `,
    );

    return rows
      .map(row => ({
        id: String(row.id),
        room: String(row.room),
        fanId: String(row.fan_id),
        fanName: String(row.fan_name),
        message: String(row.message),
        createdAt: String(row.created_at),
      }))
      .reverse();
  }

  async getChatMessages(room: string, limit = 40): Promise<FanChatMessagesResponse> {
    const normalizedRoom = room.trim() || CHAT_DEFAULT_ROOM;
    return {
      source: "server",
      generatedAt: nowIso(),
      room: normalizedRoom,
      messages: this.readChatMessages(normalizedRoom, Math.max(1, Math.min(limit, 100))),
    };
  }

  async sendChatMessage(
    room: string,
    fanId: string,
    fanName: string,
    message: string,
  ): Promise<FanChatSendResponse> {
    const normalizedRoom = room.trim() || CHAT_DEFAULT_ROOM;
    const normalizedFanId = fanId.trim() || "fan-anonymous";
    const normalizedFanName = fanName.trim() || "مشجع";
    const normalizedMessage = sanitizeChatText(message);

    if (!normalizedMessage) {
      return {
        source: "server",
        generatedAt: nowIso(),
        success: false,
        room: normalizedRoom,
      };
    }

    const chatMessage: FanChatMessage = {
      id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      room: normalizedRoom,
      fanId: normalizedFanId,
      fanName: normalizedFanName,
      message: normalizedMessage.slice(0, 280),
      createdAt: nowIso(),
    };

    this.db.run(
      `
        INSERT INTO chat_messages (id, room, fan_id, fan_name, message, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        chatMessage.id,
        chatMessage.room,
        chatMessage.fanId,
        chatMessage.fanName,
        chatMessage.message,
        chatMessage.createdAt,
      ],
    );

    this.db.run(
      `
        DELETE FROM chat_messages
        WHERE id IN (
          SELECT id
          FROM chat_messages
          WHERE room = ?
          ORDER BY created_at DESC
          LIMIT -1 OFFSET 200
        )
      `,
      [normalizedRoom],
    );

    await this.persist();

    return {
      source: "server",
      generatedAt: nowIso(),
      success: true,
      room: normalizedRoom,
      message: chatMessage,
    };
  }

  private readFlashPollById(pollId: string): FlashPoll | null {
    const safePollId = escapeSqlValue(pollId);
    const pollRows = mapRows<{
      id: string;
      question: string;
      status: string;
      created_at: string;
    }>(
      this.db,
      `
        SELECT id, question, status, created_at
        FROM flash_polls
        WHERE id = '${safePollId}'
        LIMIT 1
      `,
    );

    const pollRow = pollRows[0];
    if (!pollRow) return null;

    const optionRows = mapRows<{
      id: string;
      text: string;
      votes: number;
    }>(
      this.db,
      `
        SELECT id, text, votes
        FROM flash_poll_options
        WHERE poll_id = '${safePollId}'
        ORDER BY id ASC
      `,
    );

    const totalVotes = optionRows.reduce((sum, row) => sum + Number(row.votes), 0);
    const options: FlashPollOption[] = optionRows.map(row => {
      const votes = Number(row.votes);
      return {
        id: String(row.id),
        text: String(row.text),
        votes,
        percentage: totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0,
      };
    });

    return {
      id: String(pollRow.id),
      question: String(pollRow.question),
      status: pollRow.status === "closed" ? "closed" : "active",
      createdAt: String(pollRow.created_at),
      options,
    };
  }

  async getCurrentFlashPoll(): Promise<FlashPollStateResponse> {
    const pollRows = mapRows<{ id: string }>(
      this.db,
      `
        SELECT id
        FROM flash_polls
        WHERE status = 'active'
        ORDER BY created_at DESC
        LIMIT 1
      `,
    );
    const activePollId = String(pollRows[0]?.id ?? "");
    return {
      source: "server",
      generatedAt: nowIso(),
      poll: activePollId ? this.readFlashPollById(activePollId) : null,
    };
  }

  async voteInFlashPoll(pollId: string, fanId: string, optionId: string): Promise<FlashPollVoteResponse> {
    const normalizedPollId = pollId.trim();
    const normalizedFanId = fanId.trim() || "fan-anonymous";
    const normalizedOptionId = optionId.trim();

    if (!normalizedPollId || !normalizedOptionId) {
      return {
        source: "server",
        generatedAt: nowIso(),
        success: false,
        message: "بيانات التصويت غير مكتملة.",
        poll: null,
      };
    }

    const safePollId = escapeSqlValue(normalizedPollId);
    const safeFanId = escapeSqlValue(normalizedFanId);

    this.db.run("BEGIN");
    try {
      const pollRows = mapRows<{ id: string }>(
        this.db,
        `
          SELECT id
          FROM flash_polls
          WHERE id = '${safePollId}' AND status = 'active'
          LIMIT 1
        `,
      );
      if (pollRows.length === 0) {
        this.db.run("COMMIT");
        return {
          source: "server",
          generatedAt: nowIso(),
          success: false,
          message: "هذا الاستطلاع غير متاح حالياً.",
          poll: this.readFlashPollById(normalizedPollId),
        };
      }

      const votedRows = mapRows<{ total: number }>(
        this.db,
        `
          SELECT COUNT(*) AS total
          FROM flash_poll_votes
          WHERE poll_id = '${safePollId}' AND fan_id = '${safeFanId}'
        `,
      );
      if (Number(votedRows[0]?.total ?? 0) > 0) {
        this.db.run("COMMIT");
        return {
          source: "server",
          generatedAt: nowIso(),
          success: false,
          message: "تم تسجيل تصويتك مسبقاً في هذا الاستطلاع.",
          poll: this.readFlashPollById(normalizedPollId),
        };
      }

      const optionRows = mapRows<{ id: string }>(
        this.db,
        `
          SELECT id
          FROM flash_poll_options
          WHERE poll_id = '${safePollId}' AND id = '${escapeSqlValue(normalizedOptionId)}'
          LIMIT 1
        `,
      );
      if (optionRows.length === 0) {
        this.db.run("COMMIT");
        return {
          source: "server",
          generatedAt: nowIso(),
          success: false,
          message: "الخيار المحدد غير موجود.",
          poll: this.readFlashPollById(normalizedPollId),
        };
      }

      this.db.run(
        `
          INSERT INTO flash_poll_votes (id, poll_id, fan_id, option_id, created_at)
          VALUES (?, ?, ?, ?, ?)
        `,
        [
          `poll-vote-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          normalizedPollId,
          normalizedFanId,
          normalizedOptionId,
          nowIso(),
        ],
      );
      this.db.run(
        `
          UPDATE flash_poll_options
          SET votes = votes + 1
          WHERE id = ? AND poll_id = ?
        `,
        [normalizedOptionId, normalizedPollId],
      );
      this.db.run("COMMIT");
      await this.persist();

      return {
        source: "server",
        generatedAt: nowIso(),
        success: true,
        message: "تم تسجيل صوتك بنجاح.",
        poll: this.readFlashPollById(normalizedPollId),
      };
    } catch (error) {
      this.db.run("ROLLBACK");
      throw error;
    }
  }

  async getOperatorState(): Promise<OperatorStateResponse> {
    return {
      source: "server",
      generatedAt: nowIso(),
      gates: this.readGates(),
      alerts: this.readAlerts(MAX_ALERTS),
    };
  }

  async tickOperatorState(): Promise<void> {
    const previous = this.readGates();
    const nextGates = previous.map(gate => {
      const nextQueue = Math.round(
        Math.max(0, Math.min(220, gate.currentQueue + (Math.random() - 0.5) * 14)),
      );
      const nextFlowRate = Math.round(
        Math.max(20, Math.min(55, gate.flowRate + (Math.random() - 0.5) * 4)),
      );
      const averageWaitTime = Math.max(1, Math.round(nextQueue / Math.max(nextFlowRate, 1)));
      const efficiency = Math.round((nextFlowRate / 50) * 100);
      const trend: GateStatus["trend"] =
        nextQueue > gate.currentQueue + 5
          ? "up"
          : nextQueue < gate.currentQueue - 5
            ? "down"
            : "stable";
      const status = toGateStatusStatus(nextQueue);

      return {
        ...gate,
        currentQueue: nextQueue,
        flowRate: nextFlowRate,
        averageWaitTime,
        efficiency,
        trend,
        status,
      };
    });

    this.db.run("BEGIN");
    try {
      const updatedAt = nowIso();
      nextGates.forEach(gate => {
        this.db.run(
          `
            UPDATE gates
            SET
              current_queue = ?,
              average_wait_time = ?,
              flow_rate = ?,
              efficiency = ?,
              trend = ?,
              status = ?,
              updated_at = ?
            WHERE id = ?
          `,
          [
            gate.currentQueue,
            gate.averageWaitTime,
            gate.flowRate,
            gate.efficiency,
            gate.trend,
            gate.status,
            updatedAt,
            gate.id,
          ],
        );
      });

      const previousCritical = previous.filter(g => g.status === "critical").length;
      const nextCritical = nextGates.filter(g => g.status === "critical").length;
      if (nextCritical > previousCritical) {
        this.db.run(
          `
            INSERT INTO alerts (id, type, message, timestamp, action_required)
            VALUES (?, ?, ?, ?, ?)
          `,
          [
            `alert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            "critical",
            `${nextCritical} بوابة تتجاوز السعة المقررة`,
            nowIso(),
            1,
          ],
        );
      }

      this.db.run(
        `
          DELETE FROM alerts
          WHERE id IN (
            SELECT id
            FROM alerts
            ORDER BY timestamp DESC
            LIMIT -1 OFFSET ?
          )
        `,
        [MAX_ALERTS],
      );

      this.db.run("COMMIT");
      await this.persist();
    } catch (error) {
      this.db.run("ROLLBACK");
      throw error;
    }
  }

  async getExecutiveState(): Promise<ExecutiveStateResponse> {
    const gates = this.readGates();
    const alerts = this.readAlerts(10);

    const totalQueued = gates.reduce((sum, gate) => sum + gate.currentQueue, 0);
    const totalFlow = gates.reduce((sum, gate) => sum + gate.flowRate, 0);
    const averageWait = Math.round(
      gates.reduce((sum, gate) => sum + gate.averageWaitTime, 0) / Math.max(1, gates.length),
    );
    const averageEfficiency = Math.round(
      gates.reduce((sum, gate) => sum + gate.efficiency, 0) / Math.max(1, gates.length),
    );

    const kpis: ExecutiveKPI[] = [
      {
        label: "إجمالي الحاضرين",
        value: totalQueued,
        unit: "شخص",
        change: Number(((Math.random() - 0.5) * 10).toFixed(1)),
        trend: totalQueued > 220 ? "up" : "stable",
      },
      {
        label: "معدل الدخول",
        value: totalFlow,
        unit: "شخص/دقيقة",
        change: Number(((Math.random() - 0.5) * 6).toFixed(1)),
        trend: totalFlow < 150 ? "down" : "up",
      },
      {
        label: "متوسط وقت الانتظار",
        value: averageWait,
        unit: "دقائق",
        change: Number(((Math.random() - 0.5) * 4).toFixed(1)),
        trend: averageWait > 10 ? "up" : "down",
      },
      {
        label: "كفاءة التشغيل",
        value: averageEfficiency,
        unit: "%",
        change: Number(((Math.random() - 0.5) * 8).toFixed(1)),
        trend: averageEfficiency >= 80 ? "up" : "stable",
      },
    ];

    const safetyMetrics: ExecutiveSafetyMetric[] = gates.map(gate => ({
      gateId: gate.id,
      density: gate.currentQueue,
      riskLevel: toRiskLevel(gate.currentQueue),
    }));

    const now = new Date();
    const predictions: ExecutivePrediction[] = Array.from({ length: 6 }, (_, index) => {
      const time = new Date(now);
      time.setMinutes(now.getMinutes() + index * 15);
      const predictedDensity = Math.max(
        20,
        Math.min(
          100,
          Math.round(
            (gates.reduce((sum, gate) => sum + gate.currentQueue, 0) / Math.max(1, gates.length)) +
              (Math.random() - 0.5) * 15,
          ),
        ),
      );
      return {
        time: time.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit", hour12: false }),
        predictedDensity,
        confidence: Math.max(70, Math.min(95, Math.round(86 + (Math.random() - 0.5) * 8))),
        riskLevel: toPredictionRisk(predictedDensity),
      };
    });

    return {
      source: "server",
      generatedAt: nowIso(),
      kpis,
      safetyMetrics,
      alerts: alerts.map(alert => {
        const icon = alert.type === "critical" ? "🔴" : alert.type === "warning" ? "⚠️" : "✓";
        return `${icon} ${alert.message}`;
      }),
      predictions,
    };
  }
}
