// Quick local database test
import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';

global.WebSocket = ws;
dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

console.log('🔍 Testing Neon Database Connection...\n');

try {
  // Test risks
  const risks = await pool.query('SELECT * FROM risks ORDER BY sort_order');
  console.log('✅ Risks:', risks.rows.length, 'found');
  risks.rows.forEach(r => console.log(`   - ${r.level}: ${r.label}`));
  
  // Test nodes
  const nodes = await pool.query('SELECT COUNT(*) FROM nodes');
  console.log('\n✅ Nodes:', nodes.rows[0].count, 'found');
  
  // Test edges
  const edges = await pool.query('SELECT COUNT(*) FROM edges');
  console.log('✅ Edges:', edges.rows[0].count, 'found');
  
  await pool.end();
  console.log('\n✅ Database connection working perfectly!');
} catch (error) {
  console.error('❌ Error:', error.message);
  await pool.end();
  process.exit(1);
}
