export type FlashPollStatus = "active" | "closed";

export interface FlashPollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

export interface FlashPoll {
  id: string;
  question: string;
  status: FlashPollStatus;
  createdAt: string;
  options: FlashPollOption[];
}

export interface FlashPollStateResponse {
  source: "server" | "local";
  generatedAt: string;
  poll: FlashPoll | null;
}

export interface FlashPollVoteRequest {
  pollId: string;
  fanId: string;
  optionId: string;
}

export interface FlashPollVoteResponse {
  source: "server" | "local";
  generatedAt: string;
  success: boolean;
  message: string;
  poll: FlashPoll | null;
}
