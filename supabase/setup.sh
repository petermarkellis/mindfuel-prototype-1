#!/bin/bash

# Supabase Setup Script
# This script helps you set up the Supabase database for the ReactFlow project

echo "🚀 ReactFlow Supabase Setup"
echo "=========================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please create a .env file with your Supabase credentials first."
    echo ""
    echo "Example .env content:"
    echo "VITE_SUPABASE_URL=https://your-project-id.supabase.co"
    echo "VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here"
    exit 1
fi

# Check if environment variables are set
source .env
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ Environment variables not properly set!"
    echo "Please check your .env file has both:"
    echo "- VITE_SUPABASE_URL"
    echo "- VITE_SUPABASE_ANON_KEY"
    exit 1
fi

echo "✅ Environment variables found"
echo "📁 Database migration file: supabase/migrations/001_initial_schema.sql"
echo ""

echo "📋 Next steps:"
echo "1. Go to your Supabase project dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Copy and paste the contents of 'supabase/migrations/001_initial_schema.sql'"
echo "4. Click 'Run' to execute the migration"
echo "5. Verify tables were created in Table Editor"
echo ""

echo "🧪 To test the connection, run:"
echo "npm run dev"
echo ""

echo "📚 For more help, see:"
echo "- supabase/README.md"
echo "- supabase/config/database-types.md"
echo ""

# Optional: Display the SQL file content for easy copying
read -p "📋 Would you like to display the SQL migration content for copying? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "=== SQL MIGRATION CONTENT ==="
    echo "Copy everything below this line:"
    echo "=============================="
    cat supabase/migrations/001_initial_schema.sql
    echo ""
    echo "=============================="
    echo "Copy everything above this line and paste into Supabase SQL Editor"
fi

echo ""
echo "✨ Setup complete! Happy coding!"
