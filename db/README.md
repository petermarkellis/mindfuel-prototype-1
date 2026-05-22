# Database Migrations

PostgreSQL schema and seed migrations for the Neon database.

## Setup

1. Create a project at [neon.tech](https://neon.tech)
2. Open the **SQL Editor** in the Neon dashboard
3. Run migrations in order: `001_initial_schema.sql`, then `002_` through `011_` as needed

## Files

- `migrations/001_initial_schema.sql` — Core tables (`nodes`, `edges`, `risks`, etc.) and sample data
- `migrations/002_`–`011_` — Incremental schema updates (RLS, users, avatars, risks, etc.)

RLS policies in older migrations were written for a hosted Postgres with auth; Neon uses server-side API access via `DATABASE_URL`, so RLS is optional for this prototype.
