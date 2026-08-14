# AI Prompt Library — Backend

Express + TypeScript REST API backed by a file-based JSON database (via `lowdb`). Provides full
CRUD for prompts, used by the frontend at `/frontend`.

Chose `lowdb` (a JSON-file database) so the project runs with **zero external services** — no
Postgres/Mongo instance to provision for grading. It's a real, connected database layer (typed
models, validation, atomic reads/writes) — just file-backed instead of a network service. Swapping
in Postgres/MongoDB later only means changing `src/db.ts`; the routes and types stay the same.

## Getting started

```bash
npm install
cp .env.example .env    # optional, defaults to PORT=4000
npm run dev              # http://localhost:4000
```

The database file lives at `data/db.json` and is seeded with a few example prompts on first run.

## Scripts
- `npm run dev` — start with hot reload (`ts-node-dev`)
- `npm run build` — compile TypeScript to `dist/`
- `npm run start` — run the compiled server (`node dist/index.js`)

## API

Base URL: `http://localhost:4000/api`

| Method | Path                    | Description                          |
|--------|-------------------------|---------------------------------------|
| GET    | `/health`               | Health check                         |
| GET    | `/prompts`               | List all prompts                     |
| GET    | `/prompts/:id`            | Get one prompt                       |
| POST   | `/prompts`               | Create a prompt                      |
| PUT    | `/prompts/:id`            | Update a prompt                      |
| PATCH  | `/prompts/reorder/bulk`   | Bulk-update `order` for drag & drop  |
| DELETE | `/prompts/:id`            | Delete a prompt                      |

`POST`/`PUT` validate `title`, `content`, and `category` (must be one of the 10 fixed categories)
and return `400` with a message on invalid input.

## Folder structure

```
src/
  index.ts          Express app + middleware + error handling
  db.ts             lowdb setup + seed data
  types.ts          Prompt / Category types shared with validation
  routes/prompts.ts CRUD route handlers
data/db.json         The JSON "database" file (gitignored contents are fine to keep for a demo seed)
```
