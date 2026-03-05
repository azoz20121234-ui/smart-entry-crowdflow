export type LoyaltyEventType = "early_arrival" | "delayed_exit" | "spend";

export interface LoyaltyLedgerEntry {
  id: string;
  eventType: LoyaltyEventType;
  tokens: number;
  title: string;
  description: string;
  timestamp: string;
}

export interface LoyaltyWalletResponse {
  source: "server";
  generatedAt: string;
  fanId: string;
  balance: number;
  entries: LoyaltyLedgerEntry[];
}

export interface LoyaltyClaimResult {
  source: "server";
  generatedAt: string;
  fanId: string;
  eventType: LoyaltyEventType;
  awarded: boolean;
  tokensAwarded: number;
  balance: number;
  message: string;
}

