import type {
  FlashPoll,
  FlashPollStateResponse,
  FlashPollVoteRequest,
  FlashPollVoteResponse,
} from "@shared/polls";

const REQUEST_TIMEOUT_MS = 2500;
const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") ?? "";
const LOCAL_STORAGE_KEY = "smart-entry-flash-poll";

interface LocalFlashPollStore {
  poll: FlashPoll | null;
  votesByFan: Record<string, string>;
}

function nowIso() {
  return new Date().toISOString();
}

function withPercentages(poll: FlashPoll): FlashPoll {
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
  return {
    ...poll,
    options: poll.options.map(option => ({
      ...option,
      percentage: totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0,
    })),
  };
}

function createDefaultLocalStore(): LocalFlashPollStore {
  const pollId = "local-flash-poll-main";
  return {
    poll: {
      id: pollId,
      question: "هل كان قرار الحكم في آخر لقطة صحيحًا؟",
      status: "active",
      createdAt: nowIso(),
      options: [
        { id: `${pollId}-yes`, text: "نعم", votes: 0, percentage: 0 },
        { id: `${pollId}-no`, text: "لا", votes: 0, percentage: 0 },
      ],
    },
    votesByFan: {},
  };
}

function getLocalStore(): LocalFlashPollStore {
  if (typeof window === "undefined") return createDefaultLocalStore();
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return createDefaultLocalStore();
    const parsed = JSON.parse(raw) as LocalFlashPollStore;
    if (!parsed || typeof parsed !== "object") return createDefaultLocalStore();
    return {
      poll: parsed.poll ? withPercentages(parsed.poll) : null,
      votesByFan: parsed.votesByFan ?? {},
    };
  } catch {
    return createDefaultLocalStore();
  }
}

function setLocalStore(store: LocalFlashPollStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store));
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

export async function fetchCurrentFlashPoll(): Promise<FlashPollStateResponse> {
  try {
    return await withTimeout(async signal => {
      const response = await fetch(`${API_BASE}/api/polls/flash/current`, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal,
      });
      if (!response.ok) {
        throw new Error(`Flash poll API failed with status ${response.status}`);
      }
      return (await response.json()) as FlashPollStateResponse;
    });
  } catch {
    const store = getLocalStore();
    return {
      source: "local",
      generatedAt: nowIso(),
      poll: store.poll ? withPercentages(store.poll) : null,
    };
  }
}

export async function voteFlashPoll(request: FlashPollVoteRequest): Promise<FlashPollVoteResponse> {
  const normalizedRequest: FlashPollVoteRequest = {
    pollId: request.pollId.trim(),
    fanId: request.fanId.trim() || "fan-anonymous",
    optionId: request.optionId.trim(),
  };

  try {
    return await withTimeout(async signal => {
      const response = await fetch(`${API_BASE}/api/polls/flash/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(normalizedRequest),
        signal,
      });
      if (!response.ok) {
        throw new Error(`Flash poll vote API failed with status ${response.status}`);
      }
      return (await response.json()) as FlashPollVoteResponse;
    });
  } catch {
    const store = getLocalStore();
    const poll = store.poll ? withPercentages(store.poll) : null;
    if (!poll || poll.status !== "active") {
      return {
        source: "local",
        generatedAt: nowIso(),
        success: false,
        message: "لا يوجد تصويت نشط حالياً.",
        poll,
      };
    }
    if (store.votesByFan[normalizedRequest.fanId]) {
      return {
        source: "local",
        generatedAt: nowIso(),
        success: false,
        message: "تم تسجيل تصويتك مسبقاً في هذا الاستطلاع.",
        poll,
      };
    }

    const nextOptions = poll.options.map(option =>
      option.id === normalizedRequest.optionId
        ? { ...option, votes: option.votes + 1 }
        : option,
    );
    const optionExists = nextOptions.some(option => option.id === normalizedRequest.optionId);
    if (!optionExists) {
      return {
        source: "local",
        generatedAt: nowIso(),
        success: false,
        message: "الخيار المحدد غير موجود.",
        poll,
      };
    }

    const nextPoll = withPercentages({ ...poll, options: nextOptions });
    const nextStore: LocalFlashPollStore = {
      poll: nextPoll,
      votesByFan: {
        ...store.votesByFan,
        [normalizedRequest.fanId]: normalizedRequest.optionId,
      },
    };
    setLocalStore(nextStore);

    return {
      source: "local",
      generatedAt: nowIso(),
      success: true,
      message: "تم تسجيل صوتك بنجاح.",
      poll: nextPoll,
    };
  }
}
