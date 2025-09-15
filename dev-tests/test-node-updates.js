#!/usr/bin/env node

// Test Node Updates and Database Persistence
// This script tests if node changes are being saved to the database

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔄 Testing Node Update Persistence');
console.log('==================================');
console.log('');

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testNodeUpdates() {
  try {
    console.log('📊 Step 1: Getting current node data...');
    
    const { data: originalNodes, error: fetchError } = await supabase
      .from('nodes')
      .select('*')
      .eq('id', '1')
      .single();
    
    if (fetchError) {
      console.log('❌ Failed to fetch test node:', fetchError.message);
      return false;
    }
    
    console.log(`✅ Found test node: "${originalNodes.name}"`);
    console.log(`   Current position: (${originalNodes.position_x}, ${originalNodes.position_y})`);
    console.log(`   Current risk: ${originalNodes.risk}`);
    console.log('');
    
    console.log('🧪 Step 2: Testing position update...');
    
    const newX = originalNodes.position_x + 10;
    const newY = originalNodes.position_y + 10;
    
    const { data: updatedNode, error: updateError } = await supabase
      .from('nodes')
      .update({ 
        position_x: newX, 
        position_y: newY,
        updated_at: new Date().toISOString()
      })
      .eq('id', '1')
      .select()
      .single();
    
    if (updateError) {
      console.log('❌ Failed to update position:', updateError.message);
      return false;
    }
    
    console.log(`✅ Position updated to: (${updatedNode.position_x}, ${updatedNode.position_y})`);
    console.log('');
    
    console.log('🧪 Step 3: Testing name update...');
    
    const testName = `${originalNodes.name} (Test Update)`;
    
    const { data: updatedName, error: nameError } = await supabase
      .from('nodes')
      .update({ 
        name: testName,
        updated_at: new Date().toISOString()
      })
      .eq('id', '1')
      .select()
      .single();
    
    if (nameError) {
      console.log('❌ Failed to update name:', nameError.message);
      return false;
    }
    
    console.log(`✅ Name updated to: "${updatedName.name}"`);
    console.log('');
    
    console.log('🔄 Step 4: Restoring original values...');
    
    const { error: restoreError } = await supabase
      .from('nodes')
      .update({ 
        name: originalNodes.name,
        position_x: originalNodes.position_x,
        position_y: originalNodes.position_y,
        updated_at: new Date().toISOString()
      })
      .eq('id', '1');
    
    if (restoreError) {
      console.log('❌ Failed to restore original values:', restoreError.message);
      return false;
    }
    
    console.log('✅ Original values restored');
    console.log('');
    
    console.log('🎉 Database Update Test Results:');
    console.log('✅ Position updates work');
    console.log('✅ Name updates work');
    console.log('✅ Database persistence confirmed');
    console.log('');
    console.log('Your React app changes should now be saved to the database!');
    console.log('');
    console.log('Try this in your app:');
    console.log('1. Drag a node to a new position');
    console.log('2. Edit a node title in the side panel');
    console.log('3. Change a node risk level');
    console.log('4. Refresh the page - changes should persist!');
    
    return true;
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
    return false;
  }
}

// Run the test
testNodeUpdates()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.log('❌ Script error:', error.message);
    process.exit(1);
  });
