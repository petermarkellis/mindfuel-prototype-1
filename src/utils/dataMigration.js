import { nodeService, edgeService } from '../lib/supabase.js'
import { initNodes } from '../components/NodeGraph/NodeGraph.jsx'

// Import edges - we'll need to import this separately since it's not exported
const initEdges = [
  { id: 'e1-2', source: '1', target: '2', type: 'custom' },
  { id: 'e1-3', source: '1', target: '3', type: 'custom' },
  { id: 'e1-4', source: '2', target: '4', type: 'custom' },
  { id: 'e1-5', source: '4', target: '5', type: 'custom' },
  { id: 'e1-6', source: '5', target: '6', type: 'custom' },
  { id: 'e1-7', source: '5', target: '7', type: 'custom' },
  { id: 'e1-8', source: '3', target: '8', type: 'custom' },
]

/**
 * Transform a ReactFlow node to Supabase database format
 */
function transformNodeForDatabase(node) {
  return {
    id: node.id,
    type: node.type,
    node_type: node.data.type,
    name: node.data.name,
    description: node.data.description,
    potential: node.data.potential,
    total_contribution: node.data.totalContribution,
    risk: node.data.risk,
    success_potential: node.data.successPotential,
    created_by: node.data.createdby,
    created_at: node.data.createdat ? new Date(node.data.createdat).toISOString() : new Date().toISOString(),
    updated_by: node.data.updatedby,
    updated_at: node.data.updatedat ? new Date(node.data.updatedat).toISOString() : new Date().toISOString(),
    position_x: node.position.x,
    position_y: node.position.y
  }
}

/**
 * Transform a ReactFlow edge to Supabase database format
 */
function transformEdgeForDatabase(edge) {
  return {
    id: edge.id,
    source_node_id: edge.source,
    target_node_id: edge.target,
    type: edge.type
  }
}

/**
 * Transform Supabase database node to ReactFlow format
 */
export function transformNodeFromDatabase(dbNode) {
  return {
    id: dbNode.id,
    type: dbNode.type,
    data: {
      type: dbNode.node_type,
      name: dbNode.name,
      description: dbNode.description,
      potential: dbNode.potential,
      totalContribution: dbNode.total_contribution,
      risk: dbNode.risk,
      successPotential: dbNode.success_potential,
      createdby: dbNode.created_by,
      createdat: dbNode.created_at ? new Date(dbNode.created_at).toISOString().split('T')[0] : '',
      updatedby: dbNode.updated_by,
      updatedat: dbNode.updated_at ? new Date(dbNode.updated_at).toISOString().split('T')[0] : ''
    },
    position: { 
      x: dbNode.position_x || 0, 
      y: dbNode.position_y || 0 
    }
  }
}

/**
 * Transform Supabase database edge to ReactFlow format
 */
export function transformEdgeFromDatabase(dbEdge) {
  return {
    id: dbEdge.id,
    source: dbEdge.source_node_id,
    target: dbEdge.target_node_id,
    type: dbEdge.type
  }
}

/**
 * Migrate existing hardcoded data to Supabase
 * This function should be run once after setting up the database
 */
export async function migrateExistingData() {
  try {
    console.log('Starting data migration to Supabase...')
    
    // Clear existing data (optional - remove this in production)
    console.log('Clearing existing data...')
    
    // Migrate nodes
    console.log('Migrating nodes...')
    for (const node of initNodes) {
      const dbNode = transformNodeForDatabase(node)
      try {
        await nodeService.createNode(dbNode)
        console.log(`✓ Migrated node: ${node.data.name}`)
      } catch (error) {
        if (error.message.includes('duplicate key')) {
          console.log(`→ Node already exists: ${node.data.name}`)
        } else {
          throw error
        }
      }
    }
    
    // Migrate edges
    console.log('Migrating edges...')
    for (const edge of initEdges) {
      const dbEdge = transformEdgeForDatabase(edge)
      try {
        await edgeService.createEdge(dbEdge)
        console.log(`✓ Migrated edge: ${edge.id}`)
      } catch (error) {
        if (error.message.includes('duplicate key')) {
          console.log(`→ Edge already exists: ${edge.id}`)
        } else {
          throw error
        }
      }
    }
    
    console.log('✅ Data migration completed successfully!')
    return { success: true }
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    return { success: false, error }
  }
}

/**
 * Verify the migration by comparing counts
 */
export async function verifyMigration() {
  try {
    const dbNodes = await nodeService.getNodes()
    const dbEdges = await edgeService.getEdges()
    
    console.log(`Database has ${dbNodes.length} nodes (expected: ${initNodes.length})`)
    console.log(`Database has ${dbEdges.length} edges (expected: ${initEdges.length})`)
    
    return {
      nodesMatch: dbNodes.length === initNodes.length,
      edgesMatch: dbEdges.length === initEdges.length,
      dbNodes: dbNodes.length,
      dbEdges: dbEdges.length,
      expectedNodes: initNodes.length,
      expectedEdges: initEdges.length
    }
  } catch (error) {
    console.error('Verification failed:', error)
    return { error }
  }
}
