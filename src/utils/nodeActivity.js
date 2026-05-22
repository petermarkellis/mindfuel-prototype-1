import { activityService } from '../lib/neon.js';

function createActivityId() {
  return `activity-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const ACTIVITY_STORAGE_KEY = 'mindfuel_node_activity';
const ACTIVITY_MIGRATED_KEY = 'mindfuel_activity_migrated';
const ACTIVITY_UPDATED_EVENT = 'mindfuel-activity-updated';

export const ACTIVITY_KIND = {
  COMMENT: 'comment',
  TITLE_CHANGED: 'title_changed',
  RISK_CHANGED: 'risk_changed',
  TYPE_CHANGED: 'type_changed',
  CONNECTION_ADDED: 'connection_added',
  CONNECTION_REMOVED: 'connection_removed',
  NODE_DELETED: 'node_deleted',
};

function emitActivityUpdated(nodeIds) {
  if (typeof window === 'undefined') return;
  const ids = Array.isArray(nodeIds) ? nodeIds : [nodeIds];
  window.dispatchEvent(
    new CustomEvent(ACTIVITY_UPDATED_EVENT, { detail: { nodeIds: ids.filter(Boolean) } })
  );
}

/**
 * Clear browser activity cache and notify open drawers to reload (empty) after demo reset.
 */
export function purgeActivityOnDemoReset() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACTIVITY_STORAGE_KEY);
    localStorage.removeItem(ACTIVITY_MIGRATED_KEY);
  }
  emitActivityUpdated([]);
}

export function subscribeToNodeActivity(callback) {
  if (typeof window === 'undefined') return () => {};
  const handler = (event) => callback(event.detail?.nodeIds ?? []);
  window.addEventListener(ACTIVITY_UPDATED_EVENT, handler);
  return () => window.removeEventListener(ACTIVITY_UPDATED_EVENT, handler);
}

function loadLocalActivitiesByNode() {
  try {
    const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeLegacyEntry(entry) {
  if (!entry || typeof entry !== 'object') return null;
  return {
    id: entry.id || createActivityId(),
    kind: entry.kind || ACTIVITY_KIND.COMMENT,
    createdAt: entry.createdAt || new Date().toISOString(),
    updatedAt: entry.updatedAt,
    text: entry.text,
    fromValue: entry.fromValue,
    toValue: entry.toValue,
    relatedNodeId: entry.relatedNodeId,
    relatedNodeName: entry.relatedNodeName,
    relatedNodeType: entry.relatedNodeType,
    direction: entry.direction,
  };
}

/**
 * One-time migration of browser-local activity into Neon.
 */
export async function migrateLocalStorageActivities() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(ACTIVITY_MIGRATED_KEY) === 'true') return;

  const byNode = loadLocalActivitiesByNode();
  const entries = [];

  for (const [nodeId, list] of Object.entries(byNode)) {
    if (!Array.isArray(list)) continue;
    for (const raw of list) {
      const entry = normalizeLegacyEntry(raw);
      if (entry) entries.push({ nodeId, ...entry });
    }
  }

  if (entries.length === 0) {
    localStorage.setItem(ACTIVITY_MIGRATED_KEY, 'true');
    return;
  }

  try {
    await activityService.createBatch(entries);
    localStorage.removeItem(ACTIVITY_STORAGE_KEY);
    localStorage.setItem(ACTIVITY_MIGRATED_KEY, 'true');
    const nodeIds = [...new Set(entries.map((e) => e.nodeId))];
    emitActivityUpdated(nodeIds);
    console.log(`Migrated ${entries.length} activity entries to Neon`);
  } catch (error) {
    console.warn('Activity migration skipped (API unavailable):', error.message);
  }
}

export async function getNodeActivities(nodeId) {
  if (!nodeId) return [];
  try {
    const rows = await activityService.getForNode(nodeId);
    return [...rows].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  } catch (error) {
    console.error('Failed to load node activity:', error);
    const local = loadLocalActivitiesByNode()[nodeId] ?? [];
    return local
      .map(normalizeLegacyEntry)
      .filter(Boolean)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
}

async function persistActivities(entries) {
  const normalized = entries
    .filter((item) => item?.nodeId && item?.kind)
    .map(({ nodeId, ...entry }) => ({
      nodeId,
      id: entry.id || createActivityId(),
      createdAt: entry.createdAt || new Date().toISOString(),
      ...entry,
    }));

  if (!normalized.length) return;

  await activityService.createBatch(
    normalized.map(({ nodeId, ...entry }) => ({ nodeId, ...entry }))
  );

  emitActivityUpdated([...new Set(normalized.map((e) => e.nodeId))]);
}

export function logNodeActivity(nodeId, entry) {
  if (!nodeId || !entry) return null;
  persistActivities([{ nodeId, ...entry }]).catch((err) => {
    console.error('Failed to log node activity:', err);
  });
  return { nodeId, ...entry };
}

export function logNodeActivities(entries) {
  if (!entries?.length) return;
  persistActivities(entries).catch((err) => {
    console.error('Failed to log node activities:', err);
  });
}

function formatRiskLabel(risk) {
  if (!risk || risk === 'notset') return 'Not set';
  return String(risk).charAt(0).toUpperCase() + String(risk).slice(1).toLowerCase();
}

export function formatActivityTimestamp(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatActivityMessage(entry) {
  if (!entry) return '';
  const name = entry.relatedNodeName || 'Unknown';
  const type = entry.relatedNodeType ? ` (${entry.relatedNodeType})` : '';

  switch (entry.kind) {
    case ACTIVITY_KIND.COMMENT:
      return entry.text || '';
    case ACTIVITY_KIND.TITLE_CHANGED:
      return `Title changed from "${entry.fromValue}" to "${entry.toValue}".`;
    case ACTIVITY_KIND.RISK_CHANGED:
      return `Risk changed from ${formatRiskLabel(entry.fromValue)} to ${formatRiskLabel(entry.toValue)}.`;
    case ACTIVITY_KIND.TYPE_CHANGED:
      return `Type changed from ${entry.fromValue} to ${entry.toValue}.`;
    case ACTIVITY_KIND.CONNECTION_ADDED:
      return entry.direction === 'upstream'
        ? `Connection from ${name}${type} was added.`
        : `Connection to ${name}${type} was added.`;
    case ACTIVITY_KIND.CONNECTION_REMOVED:
      return entry.direction === 'upstream'
        ? `Connection from ${name}${type} was removed.`
        : `Connection to ${name}${type} was removed.`;
    case ACTIVITY_KIND.NODE_DELETED:
      return `Node "${name}"${type} was deleted.`;
    default:
      return entry.text || 'Activity recorded.';
  }
}

export function isUserComment(entry) {
  return entry?.kind === ACTIVITY_KIND.COMMENT;
}

export async function addNodeComment(nodeId, text) {
  const entry = {
    kind: ACTIVITY_KIND.COMMENT,
    text,
    id: createActivityId(),
    createdAt: new Date().toISOString(),
  };
  await persistActivities([{ nodeId, ...entry }]);
  return entry;
}

export async function updateNodeComment(nodeId, commentId, text) {
  await activityService.updateComment(nodeId, commentId, text);
  emitActivityUpdated(nodeId);
  return true;
}

export async function deleteNodeComment(nodeId, commentId) {
  await activityService.deleteComment(nodeId, commentId);
  emitActivityUpdated(nodeId);
  return true;
}

function getNodeSnapshot(node) {
  return {
    relatedNodeId: node?.id,
    relatedNodeName: node?.data?.name || 'Unknown',
    relatedNodeType: node?.data?.type,
  };
}

export function logTitleChange(nodeId, fromValue, toValue) {
  if (!nodeId || fromValue === toValue) return;
  logNodeActivity(nodeId, {
    kind: ACTIVITY_KIND.TITLE_CHANGED,
    fromValue,
    toValue,
  });
}

export function logRiskChange(nodeId, fromValue, toValue) {
  if (!nodeId || fromValue === toValue) return;
  logNodeActivity(nodeId, {
    kind: ACTIVITY_KIND.RISK_CHANGED,
    fromValue,
    toValue,
  });
}

export function logTypeChange(nodeId, fromValue, toValue) {
  if (!nodeId || fromValue === toValue) return;
  logNodeActivity(nodeId, {
    kind: ACTIVITY_KIND.TYPE_CHANGED,
    fromValue,
    toValue,
  });
}

export function logConnectionAddedBetween(sourceNode, targetNode) {
  logNodeActivities([
    {
      nodeId: sourceNode.id,
      kind: ACTIVITY_KIND.CONNECTION_ADDED,
      direction: 'downstream',
      ...getNodeSnapshot(targetNode),
    },
    {
      nodeId: targetNode.id,
      kind: ACTIVITY_KIND.CONNECTION_ADDED,
      direction: 'upstream',
      ...getNodeSnapshot(sourceNode),
    },
  ]);
}

export function logConnectionRemovedBetween(nodeA, nodeB, edge) {
  if (!edge || !nodeA || !nodeB) return;
  const isAtoB = edge.source === nodeA.id && edge.target === nodeB.id;
  logNodeActivities([
    {
      nodeId: nodeA.id,
      kind: ACTIVITY_KIND.CONNECTION_REMOVED,
      direction: isAtoB ? 'downstream' : 'upstream',
      ...getNodeSnapshot(nodeB),
    },
    {
      nodeId: nodeB.id,
      kind: ACTIVITY_KIND.CONNECTION_REMOVED,
      direction: isAtoB ? 'upstream' : 'downstream',
      ...getNodeSnapshot(nodeA),
    },
  ]);
}

export function logNodeDeletedOnNeighbors(deletedNode, parentNodes, childNodes) {
  const snapshot = getNodeSnapshot(deletedNode);
  const entries = [];

  for (const parent of parentNodes) {
    entries.push({
      nodeId: parent.id,
      kind: ACTIVITY_KIND.CONNECTION_REMOVED,
      direction: 'downstream',
      ...snapshot,
    });
  }

  for (const child of childNodes) {
    entries.push({
      nodeId: child.id,
      kind: ACTIVITY_KIND.CONNECTION_REMOVED,
      direction: 'upstream',
      ...snapshot,
    });
  }

  logNodeActivities(entries);
}
