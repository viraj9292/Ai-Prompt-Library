import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDb } from "./db";
import promptsRouter from "./routes/prompts";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/prompts", promptsRouter);

app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`AI Prompt Library API running on http://localhost:${PORT}`);
  });
});
