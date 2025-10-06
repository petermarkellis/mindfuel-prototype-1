#!/usr/bin/env node

/**
 * Test script for Supabase keep-alive functionality
 * Run with: node dev-tests/test-keep-alive.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testKeepAlive() {
  console.log('🔄 Testing Supabase keep-alive...');
  console.log('🔗 Supabase URL:', supabaseUrl.substring(0, 30) + '...');
  
  try {
    const startTime = Date.now();
    
    // Test 1: Insert into keep_alive_logs table
    console.log('\n📝 Test 1: Inserting keep-alive log...');
    const { data: insertData, error: insertError } = await supabase
      .from('keep_alive_logs')
      .insert({
        status: 'test',
        source: 'local_script',
        response_time_ms: 0
      })
      .select();
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError.message);
      return;
    }
    
    console.log('✅ Insert successful:', insertData);
    
    // Test 2: Query recent logs
    console.log('\n📊 Test 2: Querying recent logs...');
    const { data: queryData, error: queryError } = await supabase
      .from('keep_alive_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (queryError) {
      console.error('❌ Query failed:', queryError.message);
      return;
    }
    
    console.log('✅ Query successful, recent logs:');
    queryData.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log.created_at} - ${log.status} (${log.source})`);
    });
    
    const responseTime = Date.now() - startTime;
    console.log(`\n⏱️ Total response time: ${responseTime}ms`);
    console.log('✅ Keep-alive test completed successfully!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the test
testKeepAlive();
