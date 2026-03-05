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

const require = createRequire(import.meta.url);
const wasmPath = require.resolve("sql.js/dist/sql-wasm.wasm");
const DB_DIR = path.resolve(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "smart-entry.sqlite");
const MAX_ALERTS = 25;

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

    await fs.mkdir(DB_DIR, { recursive: true });
    try {
      const fileData = await fs.readFile(DB_FILE);
      this.db = new this.sql.Database(new Uint8Array(fileData));
    } catch {
      this.db = new this.sql.Database();
      this.createSchema();
      this.seedData();
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
    `);
  }

  private seedData() {
    const gates = createDefaultGates();
    const alerts = createDefaultAlerts();
    const updatedAt = nowIso();

    this.db.run("BEGIN");
    try {
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
      this.db.run("COMMIT");
    } catch (error) {
      this.db.run("ROLLBACK");
      throw error;
    }
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
