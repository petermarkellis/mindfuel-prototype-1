# Neon Database Setup Guide

This guide helps you set up and configure the Neon serverless PostgreSQL database for the Mindfuel prototype.

## Quick Start

### 1. Create Neon Database

1. Go to [neon.tech](https://neon.tech) and sign up/login
2. Click **Create a project**
3. Name your project (e.g., "Mindfuel Prototype")
4. Copy the **Connection string** (looks like `postgres://user:password@host.neon.tech/dbname?sslmode=require`)

### 2. Run Database Schema

1. In your Neon dashboard, click **SQL Editor**
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run the SQL to create tables and sample data

### 3. Configure Environment Variables

#### Local Development

Create a `.env` file in the project root:

```env
DATABASE_URL=postgres://user:password@host.neon.tech/dbname?sslmode=require
```

#### Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add `DATABASE_URL` with your Neon connection string
4. Deploy the project to apply changes

### 4. Install Dependencies

The project uses `@neondatabase/serverless` and `ws` for database connections:

```bash
npm install
```

## Project Structure

### API Endpoints

All database operations go through Vercel serverless functions in `/api/db.js`:

- `GET /api/db?action=getNodes` - Fetch all nodes
- `POST /api/db?action=createNode` - Create a node
- `POST /api/db?action=updateNode` - Update a node
- `POST /api/db?action=deleteNode` - Delete a node
- `GET /api/db?action=getEdges` - Fetch all edges
- `POST /api/db?action=createEdge` - Create an edge
- `POST /api/db?action=deleteEdge` - Delete an edge
- `GET /api/db?action=getRisks` - Fetch risk definitions

### Frontend Client

The frontend uses `/src/lib/neon.js` which wraps API calls:

```javascript
import { nodeService } from '../lib/neon.js'

// Get all nodes
const nodes = await nodeService.getNodes()

// Create a node
const newNode = await nodeService.createNode(nodeData)

// Update a node
const updated = await nodeService.updateNode(id, updates)

// Delete a node
await nodeService.deleteNode(id)
```

## Database Schema

### Tables

#### `nodes`
Stores all graph nodes with metadata:
- `id` - Primary key
- `type` - Node type (custom)
- `node_type` - Business type (Opportunity, Product, Data Asset, Data Source)
- `name` - Node name
- `description` - Node description
- `potential` - Potential score
- `total_contribution` - Contribution metric
- `risk` - Risk level (low, medium, high)
- `success_potential` - Success metric
- `created_by` - User ID of creator
- `updated_by` - User ID of last updater
- `position_x`, `position_y` - Canvas coordinates
- `created_at`, `updated_at` - Timestamps

#### `edges`
Stores relationships between nodes:
- `id` - Primary key
- `source_node_id` - Source node reference
- `target_node_id` - Target node reference
- `type` - Edge type
- `created_at` - Timestamp

#### `risks`
Risk level definitions:
- `id` - Primary key
- `level` - Risk level identifier
- `label` - Display label
- `description` - Risk description
- `color` - UI color code
- `sort_order` - Display order

#### `users`
User information:
- `id` - Primary key
- `first_name`, `last_name` - Name
- `email` - Email address
- `role` - User role
- `availability` - Availability status
- `gender` - Gender for avatar selection
- `avatar_url` - Avatar image filename

## Troubleshooting

### Connection Issues

**Error: "Missing DATABASE_URL"**
- Ensure `.env` file exists with `DATABASE_URL` set
- For Vercel, check environment variables in dashboard

**Error: "SSL connection required"**
- Make sure your connection string includes `?sslmode=require`
- Neon requires SSL connections

**Error: "relation does not exist"**
- Run the schema SQL in Neon SQL Editor
- Check that migrations completed successfully

### API Errors

**Error: "API request failed"**
- Check Vercel function logs in the dashboard
- Verify DATABASE_URL is set in Vercel environment variables
- Ensure the API endpoint path is correct (`/api/db`)

## Local Testing

Test the database connection locally:

```bash
npm run dev
```

Then open your browser's network tab and verify API calls are succeeding.

## Migration from Supabase

If you're migrating from Supabase:

1. The schema is compatible - both use PostgreSQL
2. Run the same SQL migrations in Neon SQL Editor
3. Update environment variables from `VITE_SUPABASE_*` to `DATABASE_URL`
4. The frontend now uses API endpoints instead of direct Supabase client
5. Remove `@supabase/supabase-js` from dependencies

## Avatars

Avatar images are stored as static assets in `/public/avatars/` with the naming convention:
- `Male_1.webp` through `Male_9.webp`
- `Female_1.webp` through `Female_9.webp`

The `avatarUtils.js` utility generates consistent avatar URLs based on user ID and gender.

## Resources

- [Neon Documentation](https://neon.tech/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Need help?** Check the Vercel function logs or refer to the Neon dashboard for connection details.
