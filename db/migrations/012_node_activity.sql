-- Per-node activity log (comments + system events)
-- Run after 001_initial_schema.sql

CREATE TABLE IF NOT EXISTS node_activity (
  id TEXT PRIMARY KEY,
  node_id TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_node_activity_node_id ON node_activity(node_id);
CREATE INDEX IF NOT EXISTS idx_node_activity_node_created ON node_activity(node_id, created_at);
