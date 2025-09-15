#!/usr/bin/env node

// Simple Database Content Test
// Checks what data is actually in the database

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('📊 Database Content Check');
console.log('==========================');
console.log('');

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabaseContent() {
  try {
    console.log('🔍 Fetching nodes from database...');
    
    const { data: nodes, error: nodesError } = await supabase
      .from('nodes')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (nodesError) {
      console.log('❌ Failed to fetch nodes:', nodesError.message);
      return false;
    }
    
    console.log(`✅ Found ${nodes.length} nodes in database:`);
    console.log('');
    
    nodes.forEach((node, index) => {
      console.log(`${index + 1}. ${node.name}`);
      console.log(`   Type: ${node.node_type}`);
      console.log(`   ID: ${node.id}`);
      console.log(`   Position: (${node.position_x}, ${node.position_y})`);
      console.log(`   Risk: ${node.risk}`);
      console.log('');
    });
    
    console.log('🔗 Fetching edges from database...');
    
    const { data: edges, error: edgesError } = await supabase
      .from('edges')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (edgesError) {
      console.log('❌ Failed to fetch edges:', edgesError.message);
      return false;
    }
    
    console.log(`✅ Found ${edges.length} edges in database:`);
    console.log('');
    
    edges.forEach((edge, index) => {
      // Find the source and target node names
      const sourceNode = nodes.find(n => n.id === edge.source_node_id);
      const targetNode = nodes.find(n => n.id === edge.target_node_id);
      
      console.log(`${index + 1}. ${edge.id}`);
      console.log(`   ${sourceNode?.name || edge.source_node_id} → ${targetNode?.name || edge.target_node_id}`);
      console.log('');
    });
    
    console.log('📋 Summary:');
    console.log(`Total Nodes: ${nodes.length}`);
    console.log(`Total Edges: ${edges.length}`);
    
    // Check node types distribution
    const nodeTypes = {};
    nodes.forEach(node => {
      nodeTypes[node.node_type] = (nodeTypes[node.node_type] || 0) + 1;
    });
    
    console.log('');
    console.log('Node Type Distribution:');
    Object.entries(nodeTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
    console.log('');
    console.log('✅ Your React app should be loading this data!');
    console.log('If you see a loading spinner or the old hardcoded data,');
    console.log('check the browser console for any errors.');
    
    return true;
    
  } catch (error) {
    console.log('❌ Database check error:', error.message);
    return false;
  }
}

// Run the check
checkDatabaseContent()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.log('❌ Script error:', error.message);
    process.exit(1);
  });
