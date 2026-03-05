export type GateTrend = "up" | "down" | "stable";
export type GateHealthStatus = "normal" | "warning" | "critical";

export interface GateStatus {
  id: number;
  name: string;
  currentQueue: number;
  averageWaitTime: number;
  flowRate: number;
  capacity: number;
  efficiency: number;
  trend: GateTrend;
  status: GateHealthStatus;
}

export type AlertType = "warning" | "critical" | "info";

export interface SystemAlert {
  id: string;
  type: AlertType;
  message: string;
  timestamp: string;
  actionRequired: boolean;
}

export interface OperatorStateResponse {
  source: "server";
  generatedAt: string;
  gates: GateStatus[];
  alerts: SystemAlert[];
}

export const createDefaultGates = (): GateStatus[] => [
  {
    id: 1,
    name: "البوابة 1",
    currentQueue: 45,
    averageWaitTime: 8,
    flowRate: 42,
    capacity: 2500,
    efficiency: 84,
    trend: "stable",
    status: "normal",
  },
  {
    id: 2,
    name: "البوابة 2",
    currentQueue: 78,
    averageWaitTime: 12,
    flowRate: 38,
    capacity: 2500,
    efficiency: 76,
    trend: "up",
    status: "warning",
  },
  {
    id: 3,
    name: "البوابة 3",
    currentQueue: 32,
    averageWaitTime: 6,
    flowRate: 48,
    capacity: 2500,
    efficiency: 96,
    trend: "stable",
    status: "normal",
  },
  {
    id: 4,
    name: "البوابة 4",
    currentQueue: 95,
    averageWaitTime: 18,
    flowRate: 32,
    capacity: 2500,
    efficiency: 64,
    trend: "down",
    status: "critical",
  },
];
