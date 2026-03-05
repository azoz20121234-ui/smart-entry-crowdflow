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

export interface ExecutiveKPI {
  label: string;
  value: number;
  unit: string;
  change: number;
  trend: GateTrend;
}

export interface ExecutiveSafetyMetric {
  gateId: number;
  density: number;
  riskLevel: "safe" | "caution" | "danger" | "critical";
}

export interface ExecutivePrediction {
  time: string;
  predictedDensity: number;
  confidence: number;
  riskLevel: "low" | "medium" | "high" | "critical";
}

export interface ExecutiveStateResponse {
  source: "server";
  generatedAt: string;
  kpis: ExecutiveKPI[];
  safetyMetrics: ExecutiveSafetyMetric[];
  alerts: string[];
  predictions: ExecutivePrediction[];
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

export const createDefaultAlerts = (): SystemAlert[] => {
  const now = Date.now();
  return [
    {
      id: `seed-critical-${now}`,
      type: "critical",
      message: "البوابة 4 تتجاوز السعة المقررة. معدل التدفق منخفض جداً.",
      timestamp: new Date(now - 5 * 60000).toISOString(),
      actionRequired: true,
    },
    {
      id: `seed-warning-${now}`,
      type: "warning",
      message: "البوابة 2 تقترب من الحد الأقصى. يوصى بتحويل بعض الجماهير.",
      timestamp: new Date(now - 10 * 60000).toISOString(),
      actionRequired: true,
    },
    {
      id: `seed-info-${now}`,
      type: "info",
      message: "البوابة 3 تعمل بكفاءة عالية جداً.",
      timestamp: new Date(now - 15 * 60000).toISOString(),
      actionRequired: false,
    },
  ];
};
