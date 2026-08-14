import { Router, Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../db";
import { CATEGORIES, Prompt } from "../types";

const router = Router();

function validatePromptBody(body: any): string | null {
  if (!body || typeof body !== "object") return "Request body is required.";
  if (!body.title || typeof body.title !== "string" || !body.title.trim())
    return "Title is required.";
  if (!body.content || typeof body.content !== "string" || !body.content.trim())
    return "Prompt content is required.";
  if (!body.category || !CATEGORIES.includes(body.category))
    return `Category must be one of: ${CATEGORIES.join(", ")}.`;
  if (body.tags && !Array.isArray(body.tags))
    return "Tags must be an array of strings.";
  return null;
}

// GET /api/prompts - fetch all prompts
router.get("/", async (_req: Request, res: Response) => {
  await db.read();
  res.json({ data: db.data?.prompts ?? [] });
});

// GET /api/prompts/:id
router.get("/:id", async (req: Request, res: Response) => {
  await db.read();
  const prompt = db.data?.prompts.find((p) => p.id === req.params.id);
  if (!prompt) return res.status(404).json({ error: "Prompt not found." });
  res.json({ data: prompt });
});

// POST /api/prompts - create
router.post("/", async (req: Request, res: Response) => {
  const error = validatePromptBody(req.body);
  if (error) return res.status(400).json({ error });

  await db.read();
  db.data ||= { prompts: [] };

  const now = new Date().toISOString();
  const maxOrder = db.data.prompts.reduce((m, p) => Math.max(m, p.order), -1);

  const newPrompt: Prompt = {
    id: uuid(),
    title: req.body.title.trim(),
    content: req.body.content.trim(),
    category: req.body.category,
    tags: (req.body.tags ?? []).map((t: string) => t.trim()).filter(Boolean),
    description: (req.body.description ?? "").trim(),
    isFavorite: Boolean(req.body.isFavorite),
    isPinned: Boolean(req.body.isPinned),
    order: maxOrder + 1,
    createdAt: now,
    updatedAt: now,
  };

  db.data.prompts.push(newPrompt);
  await db.write();
  res.status(201).json({ data: newPrompt });
});

// PUT /api/prompts/:id - update
router.put("/:id", async (req: Request, res: Response) => {
  await db.read();
  db.data ||= { prompts: [] };
  const idx = db.data.prompts.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Prompt not found." });

  const merged = { ...db.data.prompts[idx], ...req.body };
  const error = validatePromptBody(merged);
  if (error) return res.status(400).json({ error });

  const updated: Prompt = {
    ...db.data.prompts[idx],
    title: merged.title.trim(),
    content: merged.content.trim(),
    category: merged.category,
    tags: (merged.tags ?? []).map((t: string) => t.trim()).filter(Boolean),
    description: (merged.description ?? "").trim(),
    isFavorite: Boolean(merged.isFavorite),
    isPinned: Boolean(merged.isPinned),
    order: typeof merged.order === "number" ? merged.order : db.data.prompts[idx].order,
    updatedAt: new Date().toISOString(),
  };

  db.data.prompts[idx] = updated;
  await db.write();
  res.json({ data: updated });
});

// PATCH /api/prompts/reorder - bulk reorder
router.patch("/reorder/bulk", async (req: Request, res: Response) => {
  const { order } = req.body as { order: string[] };
  if (!Array.isArray(order)) return res.status(400).json({ error: "order must be an array of ids." });

  await db.read();
  db.data ||= { prompts: [] };
  order.forEach((id, index) => {
    const p = db.data!.prompts.find((pr) => pr.id === id);
    if (p) p.order = index;
  });
  await db.write();
  res.json({ data: db.data.prompts });
});

// DELETE /api/prompts/:id
router.delete("/:id", async (req: Request, res: Response) => {
  await db.read();
  db.data ||= { prompts: [] };
  const idx = db.data.prompts.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Prompt not found." });

  const [removed] = db.data.prompts.splice(idx, 1);
  await db.write();
  res.json({ data: removed });
});

export default router;
