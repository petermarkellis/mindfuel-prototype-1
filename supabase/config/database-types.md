# Database Schema Documentation

## Table Structures

### `nodes` Table
Stores all ReactFlow node data including position and metadata.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | Unique identifier for the node |
| type | TEXT | NOT NULL, DEFAULT 'custom' | ReactFlow node type |
| node_type | node_type ENUM | NOT NULL | Business node type (Opportunity, Product, Data Asset, Data Source) |
| name | TEXT | NOT NULL | Display name of the node |
| description | TEXT | NULLABLE | Detailed description |
| potential | INTEGER | NULLABLE | Potential score (0-100) |
| total_contribution | INTEGER | NULLABLE | Total contribution score |
| risk | risk_level ENUM | DEFAULT 'notset' | Risk assessment level |
| success_potential | INTEGER | NULLABLE | Success potential score |
| created_by | TEXT | NULLABLE | User who created the node |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_by | TEXT | NULLABLE | User who last updated |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| position_x | REAL | NOT NULL, DEFAULT 0 | X coordinate for ReactFlow |
| position_y | REAL | NOT NULL, DEFAULT 0 | Y coordinate for ReactFlow |

### `edges` Table
Stores connections between nodes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | Unique identifier for the edge |
| source_node_id | TEXT | NOT NULL, FK to nodes(id) | Source node reference |
| target_node_id | TEXT | NOT NULL, FK to nodes(id) | Target node reference |
| type | TEXT | NOT NULL, DEFAULT 'custom' | ReactFlow edge type |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

## Enums

### `node_type` Enum
- `'Opportunity'` - Business opportunities
- `'Product'` - Data products  
- `'Data Asset'` - Data assets and datasets
- `'Data Source'` - Source systems and databases

### `risk_level` Enum  
- `'low'` - Low risk
- `'medium'` - Medium risk
- `'high'` - High risk
- `'notset'` - Risk not assessed

## Indexes

| Index Name | Table | Columns | Purpose |
|------------|-------|---------|---------|
| idx_nodes_node_type | nodes | node_type | Fast filtering by node type |
| idx_nodes_created_at | nodes | created_at | Chronological sorting |
| idx_edges_source | edges | source_node_id | Fast edge lookups by source |
| idx_edges_target | edges | target_node_id | Fast edge lookups by target |

## Triggers

### Auto-Update Timestamps
Both tables have triggers that automatically update `updated_at` when rows are modified:
- `update_nodes_updated_at` - Updates nodes.updated_at
- `update_edges_updated_at` - Updates edges.updated_at

## Sample Data Included

The initial migration includes 8 sample nodes:
- 1 Opportunity node
- 2 Product nodes  
- 2 Data Asset nodes
- 3 Data Source nodes

Plus 7 edges connecting these nodes in a hierarchical structure.

## Row Level Security (RLS)

RLS is currently disabled but can be enabled for multi-tenant applications. Example policies are included in the migration file but commented out.

To enable authentication and RLS:
1. Uncomment the RLS policies in `001_initial_schema.sql`
2. Implement user authentication in your React app
3. Modify policies based on your security requirements
