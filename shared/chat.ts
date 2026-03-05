export interface FanChatMessage {
  id: string;
  room: string;
  fanId: string;
  fanName: string;
  message: string;
  createdAt: string;
}

export interface FanChatMessagesResponse {
  source: "server" | "local";
  generatedAt: string;
  room: string;
  messages: FanChatMessage[];
}

export interface FanChatSendResponse {
  source: "server" | "local";
  generatedAt: string;
  success: boolean;
  room: string;
  message?: FanChatMessage;
}

export interface FanChatSendRequest {
  room?: string;
  fanId: string;
  fanName: string;
  message: string;
}
