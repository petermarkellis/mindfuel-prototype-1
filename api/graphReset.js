/**
 * Canonical graph baseline for "Reset view".
 * Derived from src/data/initialData.js so nodes, positions, and edges stay in sync.
 */

import { initNodes, initEdges } from '../src/data/initialData.js';

function toBaselineNode(node) {
  return {
    id: node.id,
    type: node.type,
    node_type: node.data.type,
    name: node.data.name,
    description: node.data.description ?? '',
    potential: node.data.potential ?? 0,
    total_contribution: node.data.totalContribution ?? 0,
    risk: node.data.risk ?? 'notset',
    success_potential: node.data.successPotential ?? 0,
    position_x: node.position?.x ?? 0,
    position_y: node.position?.y ?? 0,
  };
}

export const BASELINE_NODES = initNodes.map(toBaselineNode);

export const BASELINE_EDGES = initEdges.map((edge) => ({
  id: edge.id,
  source_node_id: edge.source,
  target_node_id: edge.target,
  type: edge.type ?? 'custom',
}));

const INSERT_NODE_SQL = `
  INSERT INTO nodes (
    id, type, node_type, name, description, potential, total_contribution,
    risk, success_potential, created_by, updated_by, position_x, position_y
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
`;

const INSERT_EDGE_SQL = `
  INSERT INTO edges (id, source_node_id, target_node_id, type)
  VALUES ($1, $2, $3, $4)
`;

/**
 * Replace all graph data with the baseline snapshot (transactional).
 * Removes every node/edge in the DB and restores the original 8 nodes, 7 connections, and positions.
 */
export async function resetGraphToBaseline(client) {
  const userResult = await client.query(
    "SELECT id FROM users WHERE email = 'peter@mindfuel.ai' LIMIT 1"
  );
  const fallbackUser = await client.query('SELECT id FROM users ORDER BY id LIMIT 1');
  const defaultUserId = userResult.rows[0]?.id ?? fallbackUser.rows[0]?.id ?? null;

  await client.query('BEGIN');

  try {
    await client.query('DELETE FROM edges');
    await client.query('DELETE FROM nodes');

    for (const node of BASELINE_NODES) {
      await client.query(INSERT_NODE_SQL, [
        node.id,
        node.type,
        node.node_type,
        node.name,
        node.description,
        node.potential,
        node.total_contribution,
        node.risk,
        node.success_potential,
        defaultUserId,
        defaultUserId,
        node.position_x,
        node.position_y,
      ]);
    }

    for (const edge of BASELINE_EDGES) {
      await client.query(INSERT_EDGE_SQL, [
        edge.id,
        edge.source_node_id,
        edge.target_node_id,
        edge.type,
      ]);
    }

    await client.query('COMMIT');

    return {
      success: true,
      nodeCount: BASELINE_NODES.length,
      edgeCount: BASELINE_EDGES.length,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}
