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
