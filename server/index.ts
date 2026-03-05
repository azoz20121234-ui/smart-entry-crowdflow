import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import {
  createDefaultGates,
  type GateStatus,
  type OperatorStateResponse,
  type SystemAlert,
} from "../shared/operator";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_ALERTS = 25;
const STEP_INTERVAL_MS = 3000;

let gates: GateStatus[] = createDefaultGates();
let alerts: SystemAlert[] = [];

function nowIso() {
  return new Date().toISOString();
}

function pushAlert(type: SystemAlert["type"], message: string, actionRequired: boolean) {
  alerts = [
    ...alerts,
    {
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      message,
      timestamp: nowIso(),
      actionRequired,
    },
  ].slice(-MAX_ALERTS);
}

function seedAlerts() {
  pushAlert("critical", "البوابة 4 تتجاوز السعة المقررة. معدل التدفق منخفض جداً.", true);
  pushAlert("warning", "البوابة 2 تقترب من الحد الأقصى. يوصى بتحويل بعض الجماهير.", true);
  pushAlert("info", "البوابة 3 تعمل بكفاءة عالية جداً.", false);
}

function computeStatus(queue: number): GateStatus["status"] {
  if (queue > 80) return "critical";
  if (queue > 50) return "warning";
  return "normal";
}

function stepGate(gate: GateStatus): GateStatus {
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
  const status = computeStatus(nextQueue);

  return {
    ...gate,
    currentQueue: nextQueue,
    flowRate: nextFlowRate,
    averageWaitTime,
    efficiency,
    trend,
    status,
  };
}

function stepOperatorState() {
  const previous = gates;
  gates = gates.map(stepGate);

  const criticalNow = gates.filter(g => g.status === "critical");
  const criticalBefore = previous.filter(g => g.status === "critical");
  if (criticalNow.length > criticalBefore.length) {
    pushAlert("critical", `${criticalNow.length} بوابة تتجاوز السعة المقررة`, true);
  }
}

seedAlerts();
setInterval(stepOperatorState, STEP_INTERVAL_MS);

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      service: "smart-entry-crowdflow-api",
      timestamp: nowIso(),
    });
  });

  app.get("/api/operator/state", (_req, res) => {
    const payload: OperatorStateResponse = {
      source: "server",
      generatedAt: nowIso(),
      gates,
      alerts,
    };
    res.json(payload);
  });

  app.post("/api/operator/tick", (_req, res) => {
    stepOperatorState();
    res.status(200).json({ success: true, generatedAt: nowIso() });
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
