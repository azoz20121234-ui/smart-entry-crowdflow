import {
  createDefaultAlerts,
  createDefaultGates,
  type ExecutiveKPI,
  type ExecutivePrediction,
  type ExecutiveSafetyMetric,
  type ExecutiveStateResponse,
  type GateStatus,
  type OperatorStateResponse,
} from "@shared/operator";

function nowIso() {
  return new Date().toISOString();
}

function toRiskLevel(density: number): ExecutiveSafetyMetric["riskLevel"] {
  if (density >= 85) return "critical";
  if (density >= 70) return "danger";
  if (density >= 50) return "caution";
  return "safe";
}

function toPredictionRisk(density: number): ExecutivePrediction["riskLevel"] {
  if (density >= 85) return "critical";
  if (density >= 70) return "high";
  if (density >= 50) return "medium";
  return "low";
}

function buildKpis(gates: GateStatus[]): ExecutiveKPI[] {
  const totalQueued = gates.reduce((sum, gate) => sum + gate.currentQueue, 0);
  const totalFlow = gates.reduce((sum, gate) => sum + gate.flowRate, 0);
  const averageWait = Math.round(
    gates.reduce((sum, gate) => sum + gate.averageWaitTime, 0) / Math.max(1, gates.length),
  );
  const averageEfficiency = Math.round(
    gates.reduce((sum, gate) => sum + gate.efficiency, 0) / Math.max(1, gates.length),
  );

  return [
    {
      label: "إجمالي الحاضرين",
      value: totalQueued,
      unit: "شخص",
      change: 0,
      trend: totalQueued > 220 ? "up" : "stable",
    },
    {
      label: "معدل الدخول",
      value: totalFlow,
      unit: "شخص/دقيقة",
      change: 0,
      trend: totalFlow < 150 ? "down" : "up",
    },
    {
      label: "متوسط وقت الانتظار",
      value: averageWait,
      unit: "دقائق",
      change: 0,
      trend: averageWait > 10 ? "up" : "down",
    },
    {
      label: "كفاءة التشغيل",
      value: averageEfficiency,
      unit: "%",
      change: 0,
      trend: averageEfficiency >= 80 ? "up" : "stable",
    },
  ];
}

function buildPredictions(gates: GateStatus[]): ExecutivePrediction[] {
  const now = new Date();
  const averageQueue = Math.round(
    gates.reduce((sum, gate) => sum + gate.currentQueue, 0) / Math.max(1, gates.length),
  );

  return Array.from({ length: 6 }, (_, index) => {
    const time = new Date(now);
    time.setMinutes(now.getMinutes() + index * 15);
    const predictedDensity = Math.max(20, Math.min(100, averageQueue + index * 2));
    return {
      time: time.toLocaleTimeString("ar-SA", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      predictedDensity,
      confidence: 85,
      riskLevel: toPredictionRisk(predictedDensity),
    };
  });
}

export function getFallbackOperatorState(): OperatorStateResponse {
  return {
    source: "server",
    generatedAt: nowIso(),
    gates: createDefaultGates(),
    alerts: createDefaultAlerts(),
  };
}

export function getFallbackExecutiveState(): ExecutiveStateResponse {
  const gates = createDefaultGates();
  const alerts = createDefaultAlerts();
  return {
    source: "server",
    generatedAt: nowIso(),
    kpis: buildKpis(gates),
    safetyMetrics: gates.map(gate => ({
      gateId: gate.id,
      density: gate.currentQueue,
      riskLevel: toRiskLevel(gate.currentQueue),
    })),
    alerts: alerts.map(alert => alert.message),
    predictions: buildPredictions(gates),
  };
}
