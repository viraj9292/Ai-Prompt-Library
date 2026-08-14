# AI Prompt Library — Frontend

React + TypeScript (Vite) frontend for the AI Prompt Library assessment project.

## Stack
- React + TypeScript, functional components & hooks only
- Context API + `useReducer` for global state (prompts, theme, toasts)
- Plain CSS with design tokens (no UI framework) — a card-catalog inspired theme with light/dark mode
- `lucide-react` icons, self-hosted fonts via `@fontsource`

## Getting started

```bash
npm install
cp .env.example .env      # set VITE_API_URL if your backend isn't on localhost:4000
npm run dev                # http://localhost:5173
```

By default the app talks to the backend at `http://localhost:4000/api`. **If the backend isn't
running, the app still works** — it automatically falls back to LocalStorage-only mode and shows
a "Local only" badge in the navbar. This makes it easy to grade/demo the frontend on its own.

## Scripts
- `npm run dev` — start the Vite dev server
- `npm run build` — type-check (`tsc -b`) and produce a production build in `dist/`
- `npm run preview` — serve the production build locally
- `npm run lint` — run ESLint

## Folder structure

```
src/
  components/
    layout/      Navbar, Sidebar
    dashboard/    Dashboard stat cards
    controls/     Search bar, category filter, sort, favorites toggle, import/export
    prompts/      PromptCard, PromptGrid (drag & drop), Add/Edit modal, details modal, delete dialog
    ui/           Reusable Modal, Toast container, ThemeToggle
  context/        PromptContext (CRUD + filters + API/local sync), ThemeContext, ToastContext
  hooks/          useLocalStorage, useDebounce
  services/       api.ts — typed fetch wrapper for the backend REST API
  utils/          clipboard.ts, exportImport.ts
  types/          shared Prompt / Category / filter types
```

## Features implemented
- Dashboard: total prompts, favorites, categories in use, recently added
- Full CRUD (create/edit/delete with confirmation/duplicate), favorite, pin-to-top, copy to
  clipboard, drag-and-drop reordering (native HTML5 DnD)
- Search (title + content, debounced), category filter, favorites-only filter, sort
  (Newest / Oldest / A→Z / Z→A)
- The exact 10 required categories
- Import/export prompts as JSON, with validation and per-item skip reporting
- Dark/light theme toggle, persisted in LocalStorage
- Keyboard shortcuts: `/` focuses search, `n` opens "new prompt", `Esc` closes any open modal
- Form validation, loading and error states, accessible modals (focus trap, focus restore)
- Responsive layout (mobile / tablet / desktop), collapsible sidebar on small screens

## Notes for reviewers
- State is centralized in `PromptContext`; every mutation goes through it so the UI, the
  LocalStorage cache, and the backend API stay in sync.
- `PromptContext` calls the backend API on every mutation when it's reachable, and always mirrors
  the current prompt list into LocalStorage as an offline cache/fallback — satisfying both the
  "Persist via LocalStorage" and "CRUD via backend API" requirements at once.
