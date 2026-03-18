import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket for local development
if (typeof global.WebSocket === 'undefined') {
  global.WebSocket = ws;
}

let pool;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    console.log('Creating database pool');
    pool = new Pool({ 
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method } = req;
  const { action } = req.query;

  console.log('=== Database API Called ===');
  console.log('Action:', action);

  let client;
  
  try {
    const pool = getPool();
    client = await pool.connect();

    // --------------------------------------------------------
    // RISKS (simplest query to test)
    // --------------------------------------------------------
    if (action === 'getRisks') {
      console.log('Fetching risks...');
      const result = await client.query('SELECT * FROM risks ORDER BY sort_order');
      console.log('Risks fetched:', result.rows.length);
      return res.status(200).json(result.rows);
    }

    // --------------------------------------------------------
    // NODES
    // --------------------------------------------------------
    if (action === 'getNodes') {
      console.log('Fetching nodes...');
      const result = await client.query(`
        SELECT
          n.*,
          (SELECT json_build_object(
            'id', u.id,
            'first_name', u.first_name,
            'last_name', u.last_name,
            'email', u.email,
            'role', u.role,
            'availability', u.availability,
            'gender', u.gender,
            'avatar_url', u.avatar_url
          ) FROM users u WHERE u.id = n.created_by) as creator,
          (SELECT json_build_object(
            'id', u.id,
            'first_name', u.first_name,
            'last_name', u.last_name,
            'email', u.email,
            'role', u.role,
            'availability', u.availability,
            'gender', u.gender,
            'avatar_url', u.avatar_url
          ) FROM users u WHERE u.id = n.updated_by) as updater
        FROM nodes n
        ORDER BY n.created_at DESC
      `);
      console.log('Nodes fetched:', result.rows.length);
      return res.status(200).json(result.rows);
    }

    if (action === 'createNode' && method === 'POST') {
      const nodeData = req.body;
      console.log('Creating node:', nodeData.id);
      const result = await client.query(
        `INSERT INTO nodes (id, type, node_type, name, description, potential, total_contribution, risk, success_potential, created_by, updated_by, position_x, position_y)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [
          nodeData.id, nodeData.type, nodeData.node_type, nodeData.name,
          nodeData.description, nodeData.potential, nodeData.total_contribution,
          nodeData.risk, nodeData.success_potential, nodeData.created_by,
          nodeData.updated_by, nodeData.position_x, nodeData.position_y
        ]
      );
      return res.status(201).json(result.rows[0]);
    }

    if (action === 'updateNode' && method === 'POST') {
      const { id, updates } = req.body;
      const keys = Object.keys(updates);
      const values = Object.values(updates);

      const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
      const result = await client.query(
        `UPDATE nodes SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
        [id, ...values]
      );
      return res.status(200).json(result.rows[0]);
    }

    if (action === 'deleteNode' && method === 'POST') {
      const { id } = req.body;
      await client.query('DELETE FROM nodes WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
    }

    // --------------------------------------------------------
    // EDGES
    // --------------------------------------------------------
    if (action === 'getEdges') {
      console.log('Fetching edges...');
      const result = await client.query('SELECT * FROM edges ORDER BY created_at DESC');
      console.log('Edges fetched:', result.rows.length);
      return res.status(200).json(result.rows);
    }

    if (action === 'createEdge' && method === 'POST') {
      const edgeData = req.body;
      const result = await client.query(
        'INSERT INTO edges (id, source_node_id, target_node_id, type) VALUES ($1, $2, $3, $4) RETURNING *',
        [edgeData.id, edgeData.source_node_id, edgeData.target_node_id, edgeData.type]
      );
      return res.status(201).json(result.rows[0]);
    }

    if (action === 'deleteEdge' && method === 'POST') {
      const { id } = req.body;
      await client.query('DELETE FROM edges WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Invalid action or method' });

  } catch (error) {
    console.error('Database API Error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      error: error.message,
      details: error.toString(),
      hint: 'Check database connection and table existence'
    });
  } finally {
    if (client) {
      client.release();
    }
  }
}
