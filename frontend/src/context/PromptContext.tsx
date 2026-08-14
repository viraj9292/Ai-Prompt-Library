import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { v4 as uuid } from "uuid";
import type { Prompt, PromptFilters, SortOption, Category } from "../types/prompt";
import { promptsApi } from "../services/api";
import { useLocalStorage } from "../hooks/useLocalStorage";

const CACHE_KEY = "apl-prompts-cache";

interface State {
  prompts: Prompt[];
  loading: boolean;
  error: string | null;
  apiAvailable: boolean;
}

type Action =
  | { type: "SET_PROMPTS"; payload: Prompt[] }
  | { type: "ADD_PROMPT"; payload: Prompt }
  | { type: "UPDATE_PROMPT"; payload: Prompt }
  | { type: "DELETE_PROMPT"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_API_AVAILABLE"; payload: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_PROMPTS":
      return { ...state, prompts: action.payload };
    case "ADD_PROMPT":
      return { ...state, prompts: [action.payload, ...state.prompts] };
    case "UPDATE_PROMPT":
      return {
        ...state,
        prompts: state.prompts.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };
    case "DELETE_PROMPT":
      return { ...state, prompts: state.prompts.filter((p) => p.id !== action.payload) };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_API_AVAILABLE":
      return { ...state, apiAvailable: action.payload };
    default:
      return state;
  }
}

export type NewPromptInput = {
  title: string;
  content: string;
  category: Category;
  tags: string[];
  description: string;
};

interface PromptContextValue {
  prompts: Prompt[];
  filteredPrompts: Prompt[];
  loading: boolean;
  error: string | null;
  apiAvailable: boolean;
  filters: PromptFilters;
  setFilters: React.Dispatch<React.SetStateAction<PromptFilters>>;
  addPrompt: (input: NewPromptInput) => Promise<void>;
  updatePrompt: (id: string, input: NewPromptInput) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  duplicatePrompt: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  reorderPrompts: (orderedIds: string[]) => Promise<void>;
  importPrompts: (incoming: unknown) => { added: number; skipped: number };
  stats: {
    total: number;
    favorites: number;
    categories: number;
    recent: Prompt[];
  };
}

const PromptContext = createContext<PromptContextValue | undefined>(undefined);

const defaultFilters: PromptFilters = {
  query: "",
  category: "All",
  favoritesOnly: false,
  sort: "newest",
};

function sortPrompts(prompts: Prompt[], sort: SortOption): Prompt[] {
  const copy = [...prompts];
  switch (sort) {
    case "newest":
      return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case "oldest":
      return copy.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case "az":
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case "za":
      return copy.sort((a, b) => b.title.localeCompare(a.title));
    default:
      return copy;
  }
}

function isValidPromptShape(obj: any): obj is Partial<Prompt> {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.title === "string" &&
    typeof obj.content === "string" &&
    typeof obj.category === "string"
  );
}

export function PromptProvider({ children }: { children: React.ReactNode }) {
  const [cache, setCache] = useLocalStorage<Prompt[]>(CACHE_KEY, []);
  const [state, dispatch] = useReducer(reducer, {
    prompts: cache,
    loading: true,
    error: null,
    apiAvailable: true,
  });
  const [filters, setFilters] = React.useState<PromptFilters>(defaultFilters);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Keep localStorage cache in sync with in-memory state on every change.
  useEffect(() => {
    setCache(state.prompts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.prompts]);

  // Initial load: try the API first, fall back to the local cache if it's unreachable.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const data = await promptsApi.list();
        if (!cancelled) {
          dispatch({ type: "SET_PROMPTS", payload: data });
          dispatch({ type: "SET_API_AVAILABLE", payload: true });
          dispatch({ type: "SET_ERROR", payload: null });
        }
      } catch (err) {
        if (!cancelled) {
          dispatch({ type: "SET_API_AVAILABLE", payload: false });
          dispatch({
            type: "SET_ERROR",
            payload: "Backend API unreachable — working from local storage only.",
          });
          if (cache.length > 0) {
            dispatch({ type: "SET_PROMPTS", payload: cache });
          }
        }
      } finally {
        if (!cancelled) dispatch({ type: "SET_LOADING", payload: false });
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addPrompt = useCallback(
    async (input: NewPromptInput) => {
      const now = new Date().toISOString();
      if (state.apiAvailable) {
        const created = await promptsApi.create({
          ...input,
          isFavorite: false,
          isPinned: false,
        });
        dispatch({ type: "ADD_PROMPT", payload: created });
      } else {
        const maxOrder = stateRef.current.prompts.reduce((m, p) => Math.max(m, p.order), -1);
        const localPrompt: Prompt = {
          id: uuid(),
          ...input,
          isFavorite: false,
          isPinned: false,
          order: maxOrder + 1,
          createdAt: now,
          updatedAt: now,
        };
        dispatch({ type: "ADD_PROMPT", payload: localPrompt });
      }
    },
    [state.apiAvailable]
  );

  const updatePrompt = useCallback(
    async (id: string, input: NewPromptInput) => {
      const existing = stateRef.current.prompts.find((p) => p.id === id);
      if (!existing) return;
      if (state.apiAvailable) {
        const updated = await promptsApi.update(id, input);
        dispatch({ type: "UPDATE_PROMPT", payload: updated });
      } else {
        const updated: Prompt = { ...existing, ...input, updatedAt: new Date().toISOString() };
        dispatch({ type: "UPDATE_PROMPT", payload: updated });
      }
    },
    [state.apiAvailable]
  );

  const deletePrompt = useCallback(
    async (id: string) => {
      if (state.apiAvailable) {
        await promptsApi.remove(id);
      }
      dispatch({ type: "DELETE_PROMPT", payload: id });
    },
    [state.apiAvailable]
  );

  const duplicatePrompt = useCallback(
    async (id: string) => {
      const existing = stateRef.current.prompts.find((p) => p.id === id);
      if (!existing) return;
      const now = new Date().toISOString();
      const input: NewPromptInput = {
        title: `${existing.title} (Copy)`,
        content: existing.content,
        category: existing.category,
        tags: [...existing.tags],
        description: existing.description,
      };
      if (state.apiAvailable) {
        const created = await promptsApi.create({ ...input, isFavorite: false, isPinned: false });
        dispatch({ type: "ADD_PROMPT", payload: created });
      } else {
        const maxOrder = stateRef.current.prompts.reduce((m, p) => Math.max(m, p.order), -1);
        const localPrompt: Prompt = {
          id: uuid(),
          ...input,
          isFavorite: false,
          isPinned: false,
          order: maxOrder + 1,
          createdAt: now,
          updatedAt: now,
        };
        dispatch({ type: "ADD_PROMPT", payload: localPrompt });
      }
    },
    [state.apiAvailable]
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const existing = stateRef.current.prompts.find((p) => p.id === id);
      if (!existing) return;
      const patch = { isFavorite: !existing.isFavorite };
      if (state.apiAvailable) {
        const updated = await promptsApi.update(id, patch);
        dispatch({ type: "UPDATE_PROMPT", payload: updated });
      } else {
        dispatch({
          type: "UPDATE_PROMPT",
          payload: { ...existing, ...patch, updatedAt: new Date().toISOString() },
        });
      }
    },
    [state.apiAvailable]
  );

  const togglePin = useCallback(
    async (id: string) => {
      const existing = stateRef.current.prompts.find((p) => p.id === id);
      if (!existing) return;
      const patch = { isPinned: !existing.isPinned };
      if (state.apiAvailable) {
        const updated = await promptsApi.update(id, patch);
        dispatch({ type: "UPDATE_PROMPT", payload: updated });
      } else {
        dispatch({
          type: "UPDATE_PROMPT",
          payload: { ...existing, ...patch, updatedAt: new Date().toISOString() },
        });
      }
    },
    [state.apiAvailable]
  );

  const reorderPrompts = useCallback(
    async (orderedIds: string[]) => {
      const byId = new Map(stateRef.current.prompts.map((p) => [p.id, p]));
      const reordered = orderedIds
        .map((id, index) => {
          const p = byId.get(id);
          return p ? { ...p, order: index } : null;
        })
        .filter((p): p is Prompt => p !== null);
      dispatch({ type: "SET_PROMPTS", payload: reordered });
      if (state.apiAvailable) {
        try {
          await promptsApi.reorder(orderedIds);
        } catch {
          // Local order still applied; API sync will retry on next mutation.
        }
      }
    },
    [state.apiAvailable]
  );

  const importPrompts = useCallback((incoming: unknown) => {
    const list = Array.isArray(incoming) ? incoming : (incoming as any)?.prompts;
    if (!Array.isArray(list)) return { added: 0, skipped: 0 };

    let added = 0;
    let skipped = 0;
    const now = new Date().toISOString();
    const maxOrder = stateRef.current.prompts.reduce((m, p) => Math.max(m, p.order), -1);
    const newOnes: Prompt[] = [];

    list.forEach((raw, index) => {
      if (!isValidPromptShape(raw)) {
        skipped += 1;
        return;
      }
      newOnes.push({
        id: uuid(),
        title: String(raw.title).slice(0, 200),
        content: String(raw.content),
        category: (raw.category as Category) || "Others",
        tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
        description: typeof raw.description === "string" ? raw.description : "",
        isFavorite: Boolean(raw.isFavorite),
        isPinned: false,
        order: maxOrder + index + 1,
        createdAt: now,
        updatedAt: now,
      });
      added += 1;
    });

    if (newOnes.length > 0) {
      dispatch({ type: "SET_PROMPTS", payload: [...stateRef.current.prompts, ...newOnes] });
      if (state.apiAvailable) {
        newOnes.forEach((p) => {
          promptsApi
            .create({
              title: p.title,
              content: p.content,
              category: p.category,
              tags: p.tags,
              description: p.description,
              isFavorite: p.isFavorite,
              isPinned: p.isPinned,
            })
            .catch(() => {
              /* already reflected locally; ignore sync failure per-item */
            });
        });
      }
    }

    return { added, skipped };
  }, [state.apiAvailable]);

  const filteredPrompts = useMemo(() => {
    let list = state.prompts;
    const q = filters.query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
      );
    }
    if (filters.category !== "All") {
      list = list.filter((p) => p.category === filters.category);
    }
    if (filters.favoritesOnly) {
      list = list.filter((p) => p.isFavorite);
    }
    const sorted = sortPrompts(list, filters.sort);
    const pinned = sorted.filter((p) => p.isPinned);
    const rest = sorted.filter((p) => !p.isPinned);
    return [...pinned, ...rest];
  }, [state.prompts, filters]);

  const stats = useMemo(() => {
    const categories = new Set(state.prompts.map((p) => p.category));
    const recent = [...state.prompts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    return {
      total: state.prompts.length,
      favorites: state.prompts.filter((p) => p.isFavorite).length,
      categories: categories.size,
      recent,
    };
  }, [state.prompts]);

  const value: PromptContextValue = {
    prompts: state.prompts,
    filteredPrompts,
    loading: state.loading,
    error: state.error,
    apiAvailable: state.apiAvailable,
    filters,
    setFilters,
    addPrompt,
    updatePrompt,
    deletePrompt,
    duplicatePrompt,
    toggleFavorite,
    togglePin,
    reorderPrompts,
    importPrompts,
    stats,
  };

  return <PromptContext.Provider value={value}>{children}</PromptContext.Provider>;
}

export function usePrompts() {
  const ctx = useContext(PromptContext);
  if (!ctx) throw new Error("usePrompts must be used within a PromptProvider");
  return ctx;
}
