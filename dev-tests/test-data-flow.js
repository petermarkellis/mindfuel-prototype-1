#!/usr/bin/env node

// Test Data Flow from Database to React Components
// This script tests if the data transformation is working correctly

import { createClient } from '@supabase/supabase-js';
import { transformNodeFromDatabase, transformEdgeFromDatabase } from '../src/utils/dataMigration.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔄 Testing Data Flow: Database → React Components');
console.log('==================================================');
console.log('');

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDataFlow() {
  try {
    console.log('📊 Step 1: Fetching raw data from database...');
    
    // Fetch raw data from Supabase
    const { data: dbNodes, error: nodesError } = await supabase
      .from('nodes')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (nodesError) {
      console.log('❌ Failed to fetch nodes:', nodesError.message);
      return false;
    }
    
    const { data: dbEdges, error: edgesError } = await supabase
      .from('edges')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (edgesError) {
      console.log('❌ Failed to fetch edges:', edgesError.message);
      return false;
    }
    
    console.log(`✅ Fetched ${dbNodes.length} nodes and ${dbEdges.length} edges from database`);
    console.log('');
    
    console.log('🔄 Step 2: Testing data transformation...');
    
    // Transform data for React Flow
    const transformedNodes = dbNodes.map(transformNodeFromDatabase);
    const transformedEdges = dbEdges.map(transformEdgeFromDatabase);
    
    console.log(`✅ Transformed ${transformedNodes.length} nodes and ${transformedEdges.length} edges`);
    console.log('');
    
    console.log('🔍 Step 3: Validating transformed data structure...');
    
    // Validate first node structure
    const firstNode = transformedNodes[0];
    if (firstNode) {
      console.log('Sample Node Structure:');
      console.log(`  ID: ${firstNode.id}`);
      console.log(`  Type: ${firstNode.type}`);
      console.log(`  Name: ${firstNode.data.name}`);
      console.log(`  Node Type: ${firstNode.data.type}`);
      console.log(`  Position: (${firstNode.position.x}, ${firstNode.position.y})`);
      console.log(`  Risk: ${firstNode.data.risk}`);
      console.log('');
      
      // Check required ReactFlow properties
      const requiredProps = ['id', 'type', 'data', 'position'];
      const missingProps = requiredProps.filter(prop => !(prop in firstNode));
      
      if (missingProps.length === 0) {
        console.log('✅ Node structure is valid for ReactFlow');
      } else {
        console.log('❌ Missing required props:', missingProps.join(', '));
      }
      
      // Check data properties
      const requiredDataProps = ['type', 'name'];
      const missingDataProps = requiredDataProps.filter(prop => !(prop in firstNode.data));
      
      if (missingDataProps.length === 0) {
        console.log('✅ Node data structure is complete');
      } else {
        console.log('❌ Missing data props:', missingDataProps.join(', '));
      }
    }
    
    // Validate first edge structure
    const firstEdge = transformedEdges[0];
    if (firstEdge) {
      console.log('');
      console.log('Sample Edge Structure:');
      console.log(`  ID: ${firstEdge.id}`);
      console.log(`  Source: ${firstEdge.source}`);
      console.log(`  Target: ${firstEdge.target}`);
      console.log(`  Type: ${firstEdge.type}`);
      
      // Check required ReactFlow edge properties
      const requiredEdgeProps = ['id', 'source', 'target', 'type'];
      const missingEdgeProps = requiredEdgeProps.filter(prop => !(prop in firstEdge));
      
      if (missingEdgeProps.length === 0) {
        console.log('✅ Edge structure is valid for ReactFlow');
      } else {
        console.log('❌ Missing required edge props:', missingEdgeProps.join(', '));
      }
    }
    
    console.log('');
    console.log('📋 Step 4: Summary');
    console.log(`Database Nodes: ${dbNodes.length}`);
    console.log(`Transformed Nodes: ${transformedNodes.length}`);
    console.log(`Database Edges: ${dbEdges.length}`);
    console.log(`Transformed Edges: ${transformedEdges.length}`);
    
    // Check if all nodes have unique IDs
    const nodeIds = new Set(transformedNodes.map(n => n.id));
    const uniqueNodeIds = nodeIds.size === transformedNodes.length;
    console.log(`Node IDs unique: ${uniqueNodeIds ? '✅' : '❌'}`);
    
    // Check if edges reference valid nodes
    const validEdges = transformedEdges.every(edge => 
      nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );
    console.log(`Edge references valid: ${validEdges ? '✅' : '❌'}`);
    
    console.log('');
    console.log('🎉 Data flow test completed!');
    console.log('');
    console.log('Your React app should display:');
    transformedNodes.forEach(node => {
      console.log(`  - ${node.data.name} (${node.data.type})`);
    });
    
    return true;
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
    return false;
  }
}

// Run the test
testDataFlow()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.log('❌ Test script error:', error.message);
    process.exit(1);
  });
