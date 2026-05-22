# Database Migrations

PostgreSQL schema and seed migrations for the Neon database.

## Setup

1. Create a project at [neon.tech](https://neon.tech)
2. Open the **SQL Editor** in the Neon dashboard
3. Run migrations in order: `001_initial_schema.sql`, then `002_` through `012_` as needed

## Files

- `migrations/001_initial_schema.sql` — Core tables (`nodes`, `edges`, `risks`, etc.) and sample data
- `migrations/002_`–`011_` — Incremental schema updates (RLS, users, avatars, risks, etc.)
- `migrations/012_node_activity.sql` — Per-node activity log (comments and change history)

## Node activity API

After running `012_node_activity.sql`, the app persists activity via `/api/db`:

| Action | Method | Description |
|--------|--------|-------------|
| `getNodeActivity` | GET | `?nodeId=<id>` — list activity for a node |
| `createNodeActivities` | POST | body `{ entries: [{ nodeId, kind, ... }] }` |
| `updateNodeActivity` | POST | body `{ nodeId, id, text }` — edit a comment |
| `deleteNodeActivity` | POST | body `{ nodeId, id }` — delete a comment |

Local dev: `npm run dev:full` (API on port 3001 + Vite proxy).

**Reset demo:** `resetGraph` also runs `DELETE FROM node_activity` so activity history is cleared with the graph.

RLS policies in older migrations were written for a hosted Postgres with auth; Neon uses server-side API access via `DATABASE_URL`, so RLS is optional for this prototype.
