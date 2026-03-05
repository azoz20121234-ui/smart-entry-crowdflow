import type {
  LoyaltyClaimResult,
  LoyaltyEventType,
  LoyaltyLedgerEntry,
  LoyaltyWalletResponse,
} from "@shared/loyalty";

const REQUEST_TIMEOUT_MS = 2500;
const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") ?? "";
const LOCAL_STORAGE_KEY = "smart-entry-loyalty-wallets";

interface LocalWalletStore {
  [fanId: string]: {
    balance: number;
    entries: LoyaltyLedgerEntry[];
  };
}

function nowIso() {
  return new Date().toISOString();
}

function getLocalStore(): LocalWalletStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as LocalWalletStore;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function setLocalStore(store: LocalWalletStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store));
}

function getOrCreateLocalWallet(fanId: string) {
  const store = getLocalStore();
  if (!store[fanId]) {
    store[fanId] = { balance: 0, entries: [] };
    setLocalStore(store);
  }
  return { store, wallet: store[fanId] };
}

function toWalletResponse(fanId: string): LoyaltyWalletResponse {
  const { wallet } = getOrCreateLocalWallet(fanId);
  return {
    source: "server",
    generatedAt: nowIso(),
    fanId,
    balance: wallet.balance,
    entries: wallet.entries.slice(0, 20),
  };
}

function hasLocalEvent(fanId: string, eventType: LoyaltyEventType): boolean {
  const { wallet } = getOrCreateLocalWallet(fanId);
  return wallet.entries.some(entry => entry.eventType === eventType && entry.tokens > 0);
}

function appendLocalEvent(
  fanId: string,
  eventType: LoyaltyEventType,
  tokens: number,
  title: string,
  description: string,
) {
  const { store, wallet } = getOrCreateLocalWallet(fanId);
  const entry: LoyaltyLedgerEntry = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    eventType,
    tokens,
    title,
    description,
    timestamp: nowIso(),
  };
  wallet.balance += tokens;
  wallet.entries = [entry, ...wallet.entries].slice(0, 50);
  store[fanId] = wallet;
  setLocalStore(store);
}

function localClaimResult(
  fanId: string,
  eventType: LoyaltyEventType,
  awarded: boolean,
  tokensAwarded: number,
  message: string,
): LoyaltyClaimResult {
  return {
    source: "server",
    generatedAt: nowIso(),
    fanId,
    eventType,
    awarded,
    tokensAwarded,
    balance: toWalletResponse(fanId).balance,
    message,
  };
}

async function withTimeout<T>(executor: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await executor(controller.signal);
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchLoyaltyWallet(fanId: string): Promise<LoyaltyWalletResponse> {
  try {
    return await withTimeout(async signal => {
      const response = await fetch(
        `${API_BASE}/api/loyalty/wallet?fanId=${encodeURIComponent(fanId)}`,
        { method: "GET", signal },
      );
      if (!response.ok) {
        throw new Error(`Wallet API failed with status ${response.status}`);
      }
      return (await response.json()) as LoyaltyWalletResponse;
    });
  } catch {
    return toWalletResponse(fanId);
  }
}

export async function claimEarlyArrivalReward(
  fanId: string,
  minutesBeforeKickoff: number,
): Promise<LoyaltyClaimResult> {
  try {
    return await withTimeout(async signal => {
      const response = await fetch(`${API_BASE}/api/loyalty/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ fanId, minutesBeforeKickoff }),
        signal,
      });
      if (!response.ok) {
        throw new Error(`Check-in API failed with status ${response.status}`);
      }
      return (await response.json()) as LoyaltyClaimResult;
    });
  } catch {
    if (minutesBeforeKickoff < 60) {
      return localClaimResult(
        fanId,
        "early_arrival",
        false,
        0,
        "المكافأة تتطلب حضورًا قبل المباراة بـ 60 دقيقة على الأقل.",
      );
    }
    if (hasLocalEvent(fanId, "early_arrival")) {
      return localClaimResult(fanId, "early_arrival", false, 0, "تم احتساب مكافأة الحضور المبكر مسبقًا.");
    }
    appendLocalEvent(
      fanId,
      "early_arrival",
      40,
      "مكافأة الحضور المبكر",
      `حضرت قبل المباراة بـ ${minutesBeforeKickoff} دقيقة`,
    );
    return localClaimResult(fanId, "early_arrival", true, 40, "تمت إضافة مكافأة الحضور المبكر إلى محفظتك.");
  }
}

export async function claimDelayedExitReward(
  fanId: string,
  minutesAfterWhistle: number,
): Promise<LoyaltyClaimResult> {
  try {
    return await withTimeout(async signal => {
      const response = await fetch(`${API_BASE}/api/loyalty/check-out`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ fanId, minutesAfterWhistle }),
        signal,
      });
      if (!response.ok) {
        throw new Error(`Check-out API failed with status ${response.status}`);
      }
      return (await response.json()) as LoyaltyClaimResult;
    });
  } catch {
    if (minutesAfterWhistle < 20) {
      return localClaimResult(
        fanId,
        "delayed_exit",
        false,
        0,
        "المكافأة تتطلب الانتظار 20 دقيقة بعد صافرة النهاية.",
      );
    }
    if (hasLocalEvent(fanId, "delayed_exit")) {
      return localClaimResult(fanId, "delayed_exit", false, 0, "تم احتساب مكافأة الخروج الذكي مسبقًا.");
    }
    appendLocalEvent(
      fanId,
      "delayed_exit",
      30,
      "مكافأة الخروج الذكي",
      `غادرت بعد صافرة النهاية بـ ${minutesAfterWhistle} دقيقة`,
    );
    return localClaimResult(fanId, "delayed_exit", true, 30, "تمت إضافة مكافأة الخروج الذكي إلى محفظتك.");
  }
}

export async function spendLoyaltyTokens(
  fanId: string,
  tokens: number,
  description: string,
): Promise<LoyaltyClaimResult> {
  try {
    return await withTimeout(async signal => {
      const response = await fetch(`${API_BASE}/api/loyalty/spend`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ fanId, tokens, description }),
        signal,
      });
      if (!response.ok) {
        throw new Error(`Spend API failed with status ${response.status}`);
      }
      return (await response.json()) as LoyaltyClaimResult;
    });
  } catch {
    const wallet = toWalletResponse(fanId);
    if (tokens <= 0) {
      return localClaimResult(fanId, "spend", false, 0, "عدد العملات المطلوب خصمها غير صالح.");
    }
    if (wallet.balance < tokens) {
      return localClaimResult(fanId, "spend", false, 0, "رصيدك غير كافٍ لإتمام العملية.");
    }
    appendLocalEvent(fanId, "spend", -tokens, "استخدام العملات داخل الملعب", description);
    return localClaimResult(fanId, "spend", true, -tokens, "تم خصم العملات بنجاح.");
  }
}

