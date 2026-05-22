// Local API server - connects to production Neon database
// Run with: node local-api.js
// Then run: npm run dev (in another terminal)

import express from 'express';
import cors from 'cors';
import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';
import { resetGraphToBaseline } from './api/graphReset.js';
import {
  getActivitiesForNode,
  insertActivities,
  updateActivityComment,
  deleteActivityComment,
} from './api/nodeActivityDb.js';

// Setup WebSocket for Neon
global.WebSocket = ws;
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Create database pool connecting to YOUR production Neon database
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

console.log('🔗 Connecting to Neon database...');

// Test connection
pool.query('SELECT 1')
  .then(() => console.log('✅ Database connected!'))
  .catch(err => console.error('❌ Database connection failed:', err.message));

// API Routes
app.get('/api/db', async (req, res) => {
  const { action } = req.query;
  
  try {
    if (action === 'getRisks') {
      const result = await pool.query('SELECT * FROM risks ORDER BY sort_order');
      return res.json(result.rows);
    }

    if (action === 'getUsers') {
      const result = await pool.query(
        `SELECT id, first_name, last_name, email, role, availability
         FROM users
         ORDER BY first_name, last_name`
      );
      return res.json(result.rows);
    }
    
    if (action === 'getNodes') {
      const result = await pool.query(`
        SELECT
          n.*,
          (SELECT json_build_object(
            'id', u.id, 'first_name', u.first_name, 'last_name', u.last_name,
            'email', u.email, 'role', u.role, 'availability', u.availability,
            'gender', u.gender, 'avatar_url', u.avatar_url
          ) FROM users u WHERE u.id = n.created_by) as creator,
          (SELECT json_build_object(
            'id', u.id, 'first_name', u.first_name, 'last_name', u.last_name,
            'email', u.email, 'role', u.role, 'availability', u.availability,
            'gender', u.gender, 'avatar_url', u.avatar_url
          ) FROM users u WHERE u.id = n.updated_by) as updater
        FROM nodes n
        ORDER BY n.created_at DESC
      `);
      return res.json(result.rows);
    }
    
    if (action === 'getEdges') {
      const result = await pool.query('SELECT * FROM edges ORDER BY created_at DESC');
      return res.json(result.rows);
    }

    if (action === 'getNodeActivity') {
      const nodeId = req.query.nodeId;
      if (!nodeId) {
        return res.status(400).json({ error: 'nodeId is required' });
      }
      const client = await pool.connect();
      try {
        const activities = await getActivitiesForNode(client, nodeId);
        return res.json(activities);
      } finally {
        client.release();
      }
    }
    
    res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST endpoint for mutations
app.post('/api/db', async (req, res) => {
  const { action } = req.query;
  const body = req.body;
  
  try {
    if (action === 'createNode') {
      const result = await pool.query(
        `INSERT INTO nodes (id, type, node_type, name, description, potential, total_contribution, risk, success_potential, created_by, updated_by, position_x, position_y)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
        [body.id, body.type, body.node_type, body.name, body.description, body.potential, body.total_contribution, body.risk, body.success_potential, body.created_by, body.updated_by, body.position_x, body.position_y]
      );
      return res.json(result.rows[0]);
    }
    
    if (action === 'updateNode') {
      const { id, updates } = body;
      const keys = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
      const result = await pool.query(
        `UPDATE nodes SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
        [id, ...values]
      );
      return res.json(result.rows[0]);
    }
    
    if (action === 'deleteNode') {
      await pool.query('DELETE FROM nodes WHERE id = $1', [body.id]);
      return res.json({ success: true });
    }
    
    if (action === 'createEdge') {
      const result = await pool.query(
        'INSERT INTO edges (id, source_node_id, target_node_id, type) VALUES ($1, $2, $3, $4) RETURNING *',
        [body.id, body.source_node_id, body.target_node_id, body.type]
      );
      return res.json(result.rows[0]);
    }
    
    if (action === 'deleteEdge') {
      await pool.query('DELETE FROM edges WHERE id = $1', [body.id]);
      return res.json({ success: true });
    }

    if (action === 'resetGraph') {
      const client = await pool.connect();
      try {
        const result = await resetGraphToBaseline(client);
        return res.json(result);
      } finally {
        client.release();
      }
    }

    if (action === 'createNodeActivities') {
      const { entries } = body ?? {};
      if (!Array.isArray(entries) || entries.length === 0) {
        return res.status(400).json({ error: 'entries array is required' });
      }
      const client = await pool.connect();
      try {
        const created = await insertActivities(client, entries);
        return res.status(201).json(created);
      } finally {
        client.release();
      }
    }

    if (action === 'updateNodeActivity') {
      const { nodeId, id, text } = body ?? {};
      if (!nodeId || !id || text == null) {
        return res.status(400).json({ error: 'nodeId, id, and text are required' });
      }
      const client = await pool.connect();
      try {
        const updated = await updateActivityComment(client, nodeId, id, text.trim());
        if (!updated) {
          return res.status(404).json({ error: 'Comment not found' });
        }
        return res.json(updated);
      } finally {
        client.release();
      }
    }

    if (action === 'deleteNodeActivity') {
      const { nodeId, id } = body ?? {};
      if (!nodeId || !id) {
        return res.status(400).json({ error: 'nodeId and id are required' });
      }
      const client = await pool.connect();
      try {
        const deleted = await deleteActivityComment(client, nodeId, id);
        if (!deleted) {
          return res.status(404).json({ error: 'Comment not found' });
        }
        return res.json({ success: true });
      } finally {
        client.release();
      }
    }
    
    res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Local API Server running!`);
  console.log(`📊 Endpoint: http://localhost:${PORT}/api/db`);
  console.log(`🔗 Connected to: ${process.env.DATABASE_URL?.split('@')[1] || 'Neon DB'}`);
  console.log(`\n📝 Test: curl http://localhost:${PORT}/api/db?action=getRisks`);
  console.log('   POST actions: createNode, updateNode, deleteNode, createEdge, deleteEdge, resetGraph, createNodeActivities, updateNodeActivity, deleteNodeActivity');
  console.log('   GET actions: getRisks, getNodes, getEdges, getNodeActivity?nodeId=<id>');
  console.log('\n✅ Now run: npm run dev (Vite proxies /api → this server)\n');
});
