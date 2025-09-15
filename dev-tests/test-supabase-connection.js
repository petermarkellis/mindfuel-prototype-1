#!/usr/bin/env node

// Supabase Connection Test Script
// This script tests your database connection and validates the setup

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🧪 Testing Supabase Connection');
console.log('================================');
console.log('');

// Check environment variables
console.log('📋 Environment Check:');
console.log(`VITE_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
console.log(`VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Set (length: ' + supabaseAnonKey?.length + ')' : '❌ Missing'}`);
console.log('');

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Missing environment variables!');
  console.log('Please check your .env file has both variables set.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('🔌 Testing Database Connection...');
    
    // Test 1: Basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('nodes')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.log('❌ Connection failed:', connectionError.message);
      return false;
    }
    
    console.log('✅ Database connection successful!');
    console.log('');
    
    // Test 2: Count nodes
    console.log('📊 Data Validation:');
    const { data: nodes, error: nodesError } = await supabase
      .from('nodes')
      .select('*');
    
    if (nodesError) {
      console.log('❌ Failed to fetch nodes:', nodesError.message);
      return false;
    }
    
    console.log(`✅ Nodes table: ${nodes.length} records found`);
    
    // Test 3: Count edges
    const { data: edges, error: edgesError } = await supabase
      .from('edges')
      .select('*');
    
    if (edgesError) {
      console.log('❌ Failed to fetch edges:', edgesError.message);
      return false;
    }
    
    console.log(`✅ Edges table: ${edges.length} records found`);
    console.log('');
    
    // Test 4: Sample data validation
    console.log('🔍 Sample Data Check:');
    const sampleNode = nodes[0];
    if (sampleNode) {
      console.log(`✅ Sample node: "${sampleNode.name}" (type: ${sampleNode.node_type})`);
    } else {
      console.log('⚠️  No sample data found - you may need to run the initial migration');
    }
    
    // Test 5: Schema validation
    console.log('');
    console.log('📋 Schema Validation:');
    const requiredNodeColumns = ['id', 'type', 'node_type', 'name', 'position_x', 'position_y'];
    const nodeColumns = Object.keys(sampleNode || {});
    
    const missingColumns = requiredNodeColumns.filter(col => !nodeColumns.includes(col));
    if (missingColumns.length === 0) {
      console.log('✅ Node table schema is correct');
    } else {
      console.log('❌ Missing columns:', missingColumns.join(', '));
    }
    
    // Test 6: Insert/Update test (optional)
    console.log('');
    console.log('🧪 Write Permission Test:');
    try {
      const { data: insertTest, error: insertError } = await supabase
        .from('nodes')
        .insert({
          id: 'test-node-' + Date.now(),
          type: 'custom',
          node_type: 'Product',
          name: 'Test Node',
          description: 'Connection test node',
          position_x: 0,
          position_y: 0
        })
        .select()
        .single();
      
      if (insertError) {
        console.log('❌ Insert failed:', insertError.message);
        console.log('   This might be due to RLS policies or permissions');
      } else {
        console.log('✅ Insert successful - write permissions OK');
        
        // Clean up test node
        await supabase
          .from('nodes')
          .delete()
          .eq('id', insertTest.id);
        console.log('✅ Test cleanup successful');
      }
    } catch (err) {
      console.log('❌ Write test failed:', err.message);
    }
    
    console.log('');
    console.log('🎉 Connection test completed!');
    console.log('');
    console.log('Next steps:');
    console.log('- Run "npm run dev" to start your application');
    console.log('- Your React app should now load data from Supabase');
    
    return true;
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
    return false;
  }
}

// Run the test
testConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.log('❌ Test script error:', error.message);
    process.exit(1);
  });
