import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import { v4 as uuid } from "uuid";
import { Prompt } from "./types";

interface DbSchema {
  prompts: Prompt[];
}

const file = path.join(__dirname, "..", "data", "db.json");
const adapter = new JSONFile<DbSchema>(file);
export const db = new Low<DbSchema>(adapter, { prompts: [] });

const now = () => new Date().toISOString();

const seed: Prompt[] = [
  {
    id: uuid(),
    title: "Explain Code Like I'm Five",
    content:
      "Explain the following code as if you were teaching a complete beginner. Break down what each part does in plain language, avoid jargon, and use an analogy if it helps:\n\n{code}",
    category: "Coding",
    tags: ["explanation", "learning", "beginner"],
    description: "Get a beginner-friendly walkthrough of any code snippet.",
    isFavorite: true,
    isPinned: true,
    order: 0,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: uuid(),
    title: "Optimize SQL Query",
    content:
      "Review the following SQL query and suggest optimizations for performance, indexing, and readability. Explain the reasoning behind each change:\n\n{query}",
    category: "SQL",
    tags: ["optimization", "performance"],
    description: "Analyze and improve a slow or messy SQL query.",
    isFavorite: false,
    isPinned: false,
    order: 1,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: uuid(),
    title: "Weekly Marketing Email",
    content:
      "Write a warm, conversational weekly newsletter email for {product}. Highlight one key update, include a clear call to action, and keep it under 200 words.",
    category: "Email",
    tags: ["newsletter", "copywriting"],
    description: "Draft a short, friendly newsletter email in minutes.",
    isFavorite: true,
    isPinned: false,
    order: 2,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: uuid(),
    title: "Resume Bullet Rewriter",
    content:
      "Rewrite the following resume bullet points to be more results-driven, using strong action verbs and quantifiable outcomes where possible:\n\n{bullets}",
    category: "Resume",
    tags: ["career", "rewrite"],
    description: "Turn flat resume bullets into achievement-focused lines.",
    isFavorite: false,
    isPinned: false,
    order: 3,
    createdAt: now(),
    updatedAt: now(),
  },
];

export async function initDb() {
  await db.read();
  db.data ||= { prompts: [] };
  if (db.data.prompts.length === 0) {
    db.data.prompts = seed;
    await db.write();
  }
}
