/**
 * Node activity persistence (Neon Postgres)
 */

export function createActivityId() {
  return `activity-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function entryPayload(entry) {
  const {
    text,
    fromValue,
    toValue,
    relatedNodeId,
    relatedNodeName,
    relatedNodeType,
    direction,
  } = entry;
  return JSON.stringify({
    text: text ?? null,
    fromValue: fromValue ?? null,
    toValue: toValue ?? null,
    relatedNodeId: relatedNodeId ?? null,
    relatedNodeName: relatedNodeName ?? null,
    relatedNodeType: relatedNodeType ?? null,
    direction: direction ?? null,
  });
}

export function rowToActivityEntry(row) {
  const payload =
    typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload ?? {};

  const entry = {
    id: row.id,
    kind: row.kind,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at,
    text: payload.text ?? undefined,
    fromValue: payload.fromValue ?? undefined,
    toValue: payload.toValue ?? undefined,
    relatedNodeId: payload.relatedNodeId ?? undefined,
    relatedNodeName: payload.relatedNodeName ?? undefined,
    relatedNodeType: payload.relatedNodeType ?? undefined,
    direction: payload.direction ?? undefined,
  };

  if (row.updated_at) {
    entry.updatedAt =
      row.updated_at instanceof Date
        ? row.updated_at.toISOString()
        : row.updated_at;
  }

  return entry;
}

export async function getActivitiesForNode(client, nodeId) {
  const result = await client.query(
    `SELECT id, node_id, kind, payload, created_at, updated_at
     FROM node_activity
     WHERE node_id = $1
     ORDER BY created_at ASC`,
    [nodeId]
  );
  return result.rows.map(rowToActivityEntry);
}

export async function insertActivities(client, entries) {
  if (!entries?.length) return [];

  const inserted = [];

  for (const item of entries) {
    const { nodeId, ...entry } = item;
    if (!nodeId || !entry?.kind) continue;

    const id = entry.id || createActivityId();
    const createdAt = entry.createdAt || new Date().toISOString();
    const updatedAt = entry.updatedAt || null;

    const result = await client.query(
      `INSERT INTO node_activity (id, node_id, kind, payload, created_at, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, $5::timestamptz, $6::timestamptz)
       RETURNING id, node_id, kind, payload, created_at, updated_at`,
      [id, nodeId, entry.kind, entryPayload(entry), createdAt, updatedAt]
    );

    inserted.push(rowToActivityEntry(result.rows[0]));
  }

  return inserted;
}

export async function updateActivityComment(client, nodeId, activityId, text) {
  const result = await client.query(
    `UPDATE node_activity
     SET payload = jsonb_set(COALESCE(payload, '{}'::jsonb), '{text}', to_jsonb($3::text)),
         updated_at = NOW()
     WHERE id = $1 AND node_id = $2 AND kind = 'comment'
     RETURNING id, node_id, kind, payload, created_at, updated_at`,
    [activityId, nodeId, text]
  );

  if (!result.rows.length) {
    return null;
  }

  return rowToActivityEntry(result.rows[0]);
}

export async function deleteActivityComment(client, nodeId, activityId) {
  const result = await client.query(
    `DELETE FROM node_activity
     WHERE id = $1 AND node_id = $2 AND kind = 'comment'
     RETURNING id`,
    [activityId, nodeId]
  );

  return result.rows.length > 0;
}
