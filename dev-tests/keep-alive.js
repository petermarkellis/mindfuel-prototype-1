#!/usr/bin/env node

// Supabase Keep-Alive Script
// Prevents database from sleeping due to inactivity

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function keepAlive() {
  try {
    console.log(`🏓 Ping at ${new Date().toISOString()}`);
    
    // Simple query to keep database active
    const { data, error } = await supabase
      .from('nodes')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Keep-alive failed:', error.message);
      return false;
    }
    
    console.log('✅ Database is awake and responsive');
    return true;
    
  } catch (error) {
    console.log('❌ Keep-alive error:', error.message);
    return false;
  }
}

// Run the keep-alive ping
keepAlive()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.log('❌ Script error:', error.message);
    process.exit(1);
  });
