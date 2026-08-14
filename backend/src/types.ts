export const CATEGORIES = [
  "Coding",
  "SQL",
  "Marketing",
  "Content Writing",
  "Email",
  "Resume",
  "Design",
  "Social Media",
  "Productivity",
  "Others",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: Category;
  tags: string[];
  description: string;
  isFavorite: boolean;
  isPinned: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type PromptInput = Omit<
  Prompt,
  "id" | "createdAt" | "updatedAt" | "order"
> & { order?: number };
