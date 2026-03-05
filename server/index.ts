import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { OperatorDatabase } from "./operatorDatabase";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STEP_INTERVAL_MS = 3000;

function nowIso() {
  return new Date().toISOString();
}

function getBodyString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function getBodyNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function getQueryNumber(value: unknown, fallback = 0): number {
  if (typeof value !== "string") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function startServer() {
  const operatorDatabase = await OperatorDatabase.create();
  const app = express();
  const server = createServer(app);
  app.use(express.json());

  setInterval(async () => {
    try {
      await operatorDatabase.tickOperatorState();
    } catch (error) {
      console.error("Failed to tick operator state", error);
    }
  }, STEP_INTERVAL_MS);

  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      service: "smart-entry-crowdflow-api",
      timestamp: nowIso(),
    });
  });

  app.get("/api/operator/state", async (_req, res) => {
    const payload = await operatorDatabase.getOperatorState();
    res.json(payload);
  });

  app.get("/api/executive/state", async (_req, res) => {
    const payload = await operatorDatabase.getExecutiveState();
    res.json(payload);
  });

  app.post("/api/operator/tick", async (_req, res) => {
    await operatorDatabase.tickOperatorState();
    res.status(200).json({ success: true, generatedAt: nowIso() });
  });

  app.get("/api/loyalty/wallet", async (req, res) => {
    const fanId = typeof req.query.fanId === "string" ? req.query.fanId : "fan-default";
    const payload = await operatorDatabase.getLoyaltyWallet(fanId);
    res.json(payload);
  });

  app.post("/api/loyalty/check-in", async (req, res) => {
    const fanId = getBodyString(req.body?.fanId, "fan-default");
    const minutesBeforeKickoff = getBodyNumber(req.body?.minutesBeforeKickoff, 0);
    const payload = await operatorDatabase.claimEarlyArrivalReward(fanId, minutesBeforeKickoff);
    res.json(payload);
  });

  app.post("/api/loyalty/check-out", async (req, res) => {
    const fanId = getBodyString(req.body?.fanId, "fan-default");
    const minutesAfterWhistle = getBodyNumber(req.body?.minutesAfterWhistle, 0);
    const payload = await operatorDatabase.claimDelayedExitReward(fanId, minutesAfterWhistle);
    res.json(payload);
  });

  app.post("/api/loyalty/spend", async (req, res) => {
    const fanId = getBodyString(req.body?.fanId, "fan-default");
    const tokens = getBodyNumber(req.body?.tokens, 0);
    const description = getBodyString(req.body?.description, "شراء داخل الملعب");
    const payload = await operatorDatabase.spendLoyaltyTokens(fanId, tokens, description);
    res.json(payload);
  });

  app.get("/api/chat/messages", async (req, res) => {
    const room = getBodyString(req.query.room, "match-main");
    const limit = getQueryNumber(req.query.limit, 40);
    const payload = await operatorDatabase.getChatMessages(room, limit);
    res.json(payload);
  });

  app.post("/api/chat/messages", async (req, res) => {
    const room = getBodyString(req.body?.room, "match-main");
    const fanId = getBodyString(req.body?.fanId, "fan-anonymous");
    const fanName = getBodyString(req.body?.fanName, "مشجع");
    const message = getBodyString(req.body?.message, "");
    const payload = await operatorDatabase.sendChatMessage(room, fanId, fanName, message);
    if (!payload.success) {
      res.status(400).json(payload);
      return;
    }
    res.status(201).json(payload);
  });

  app.get("/api/polls/flash/current", async (_req, res) => {
    const payload = await operatorDatabase.getCurrentFlashPoll();
    res.json(payload);
  });

  app.post("/api/polls/flash/vote", async (req, res) => {
    const pollId = getBodyString(req.body?.pollId, "");
    const fanId = getBodyString(req.body?.fanId, "fan-anonymous");
    const optionId = getBodyString(req.body?.optionId, "");
    const payload = await operatorDatabase.voteInFlashPoll(pollId, fanId, optionId);
    if (!payload.success) {
      res.status(400).json(payload);
      return;
    }
    res.status(200).json(payload);
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
