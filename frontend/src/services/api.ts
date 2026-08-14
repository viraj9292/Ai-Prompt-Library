import type { Prompt } from "../types/prompt";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    // no body
  }

  if (!res.ok) {
    throw new ApiError(body?.error || `Request failed (${res.status})`, res.status);
  }
  return body?.data as T;
}

export const promptsApi = {
  list: () => request<Prompt[]>("/prompts"),
  create: (payload: Omit<Prompt, "id" | "createdAt" | "updatedAt" | "order">) =>
    request<Prompt>("/prompts", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: string, payload: Partial<Prompt>) =>
    request<Prompt>(`/prompts/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id: string) => request<Prompt>(`/prompts/${id}`, { method: "DELETE" }),
  reorder: (order: string[]) =>
    request<Prompt[]>("/prompts/reorder/bulk", {
      method: "PATCH",
      body: JSON.stringify({ order }),
    }),
};
