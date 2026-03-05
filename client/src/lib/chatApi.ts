import type {
  FanChatMessage,
  FanChatMessagesResponse,
  FanChatSendRequest,
  FanChatSendResponse,
} from "@shared/chat";

const REQUEST_TIMEOUT_MS = 2500;
const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") ?? "";
const LOCAL_STORAGE_KEY = "smart-entry-fan-chat";
const DEFAULT_ROOM = "match-main";

interface LocalChatStore {
  [room: string]: FanChatMessage[];
}

function nowIso() {
  return new Date().toISOString();
}

function sanitizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeRoom(room?: string): string {
  const normalized = room?.trim();
  return normalized && normalized.length > 0 ? normalized : DEFAULT_ROOM;
}

function getLocalStore(): LocalChatStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as LocalChatStore;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function setLocalStore(store: LocalChatStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store));
}

function getRoomMessages(room: string): FanChatMessage[] {
  const store = getLocalStore();
  const roomMessages = store[room] ?? [];
  return roomMessages
    .slice()
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

function setRoomMessages(room: string, messages: FanChatMessage[]) {
  const store = getLocalStore();
  store[room] = messages.slice(-200);
  setLocalStore(store);
}

function toLocalMessagesResponse(room: string, limit = 40): FanChatMessagesResponse {
  const messages = getRoomMessages(room).slice(-Math.max(1, Math.min(limit, 100)));
  return {
    source: "local",
    generatedAt: nowIso(),
    room,
    messages,
  };
}

function toLocalSendResponse(
  request: FanChatSendRequest,
): FanChatSendResponse {
  const room = normalizeRoom(request.room);
  const messageText = sanitizeText(request.message);
  if (!messageText) {
    return {
      source: "local",
      generatedAt: nowIso(),
      success: false,
      room,
    };
  }

  const chatMessage: FanChatMessage = {
    id: `local-chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    room,
    fanId: request.fanId.trim() || "fan-anonymous",
    fanName: request.fanName.trim() || "مشجع",
    message: messageText.slice(0, 280),
    createdAt: nowIso(),
  };

  const messages = getRoomMessages(room);
  messages.push(chatMessage);
  setRoomMessages(room, messages);

  return {
    source: "local",
    generatedAt: nowIso(),
    success: true,
    room,
    message: chatMessage,
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

export async function fetchChatMessages(
  room = DEFAULT_ROOM,
  limit = 40,
): Promise<FanChatMessagesResponse> {
  const normalizedRoom = normalizeRoom(room);
  const normalizedLimit = Math.max(1, Math.min(limit, 100));
  try {
    return await withTimeout(async signal => {
      const response = await fetch(
        `${API_BASE}/api/chat/messages?room=${encodeURIComponent(normalizedRoom)}&limit=${normalizedLimit}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
          signal,
        },
      );
      if (!response.ok) {
        throw new Error(`Chat messages API failed with status ${response.status}`);
      }
      return (await response.json()) as FanChatMessagesResponse;
    });
  } catch {
    return toLocalMessagesResponse(normalizedRoom, normalizedLimit);
  }
}

export async function sendChatMessage(request: FanChatSendRequest): Promise<FanChatSendResponse> {
  const normalizedRequest: FanChatSendRequest = {
    room: normalizeRoom(request.room),
    fanId: request.fanId,
    fanName: request.fanName,
    message: request.message,
  };

  try {
    return await withTimeout(async signal => {
      const response = await fetch(`${API_BASE}/api/chat/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(normalizedRequest),
        signal,
      });
      if (!response.ok) {
        throw new Error(`Chat send API failed with status ${response.status}`);
      }
      return (await response.json()) as FanChatSendResponse;
    });
  } catch {
    return toLocalSendResponse(normalizedRequest);
  }
}
