import { useState, useEffect, useCallback } from 'react'
import { nodeService, edgeService } from '../lib/supabase.js'
import { transformNodeFromDatabase, transformEdgeFromDatabase } from '../utils/dataMigration.js'

/**
 * Custom hook for managing nodes and edges with Supabase
 */
export function useSupabaseNodes() {
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load initial data from Supabase
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [dbNodes, dbEdges] = await Promise.all([
        nodeService.getNodes(),
        edgeService.getEdges()
      ])
      
      // Transform database format to ReactFlow format
      const transformedNodes = dbNodes.map(transformNodeFromDatabase)
      const transformedEdges = dbEdges.map(transformEdgeFromDatabase)
      
      setNodes(transformedNodes)
      setEdges(transformedEdges)
    } catch (err) {
      console.error('Error loading data from Supabase:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  // Create a new node
  const createNode = useCallback(async (nodeData) => {
    try {
      setError(null)
      
      // Transform to database format
      const dbNode = {
        id: nodeData.id || `node_${Date.now()}`,
        type: nodeData.type || 'custom',
        node_type: nodeData.data.type,
        name: nodeData.data.name,
        description: nodeData.data.description || '',
        potential: nodeData.data.potential || 0,
        total_contribution: nodeData.data.totalContribution || 0,
        risk: nodeData.data.risk || 'notset',
        success_potential: nodeData.data.successPotential || 0,
        created_by: nodeData.data.createdby || 'User',
        updated_by: nodeData.data.updatedby || 'User',
        position_x: nodeData.position?.x || 0,
        position_y: nodeData.position?.y || 0
      }
      
      const createdNode = await nodeService.createNode(dbNode)
      const transformedNode = transformNodeFromDatabase(createdNode)
      
      setNodes(prev => [...prev, transformedNode])
      return transformedNode
    } catch (err) {
      console.error('Error creating node:', err)
      setError(err.message)
      throw err
    }
  }, [])

  // Update an existing node
  const updateNode = useCallback(async (nodeId, updates) => {
    try {
      setError(null)
      
      // Transform updates to database format
      const dbUpdates = {}
      if (updates.data) {
        if (updates.data.name !== undefined) dbUpdates.name = updates.data.name
        if (updates.data.description !== undefined) dbUpdates.description = updates.data.description
        if (updates.data.potential !== undefined) dbUpdates.potential = updates.data.potential
        if (updates.data.totalContribution !== undefined) dbUpdates.total_contribution = updates.data.totalContribution
        if (updates.data.risk !== undefined) dbUpdates.risk = updates.data.risk
        if (updates.data.successPotential !== undefined) dbUpdates.success_potential = updates.data.successPotential
        if (updates.data.updatedby !== undefined) dbUpdates.updated_by = updates.data.updatedby
        if (updates.data.type !== undefined) dbUpdates.node_type = updates.data.type
      }
      if (updates.position) {
        if (updates.position.x !== undefined) dbUpdates.position_x = updates.position.x
        if (updates.position.y !== undefined) dbUpdates.position_y = updates.position.y
      }
      
      const updatedNode = await nodeService.updateNode(nodeId, dbUpdates)
      const transformedNode = transformNodeFromDatabase(updatedNode)
      
      setNodes(prev => prev.map(node => 
        node.id === nodeId ? transformedNode : node
      ))
      
      return transformedNode
    } catch (err) {
      console.error('Error updating node:', err)
      setError(err.message)
      throw err
    }
  }, [])

  // Delete a node
  const deleteNode = useCallback(async (nodeId) => {
    try {
      setError(null)
      
      await nodeService.deleteNode(nodeId)
      
      setNodes(prev => prev.filter(node => node.id !== nodeId))
      // Also remove any edges connected to this node
      setEdges(prev => prev.filter(edge => 
        edge.source !== nodeId && edge.target !== nodeId
      ))
    } catch (err) {
      console.error('Error deleting node:', err)
      setError(err.message)
      throw err
    }
  }, [])

  // Create a new edge
  const createEdge = useCallback(async (edgeData) => {
    try {
      setError(null)
      
      const dbEdge = {
        id: edgeData.id || `edge_${Date.now()}`,
        source_node_id: edgeData.source,
        target_node_id: edgeData.target,
        type: edgeData.type || 'custom'
      }
      
      const createdEdge = await edgeService.createEdge(dbEdge)
      const transformedEdge = transformEdgeFromDatabase(createdEdge)
      
      setEdges(prev => [...prev, transformedEdge])
      return transformedEdge
    } catch (err) {
      console.error('Error creating edge:', err)
      setError(err.message)
      throw err
    }
  }, [])

  // Delete an edge
  const deleteEdge = useCallback(async (edgeId) => {
    try {
      setError(null)
      
      await edgeService.deleteEdge(edgeId)
      setEdges(prev => prev.filter(edge => edge.id !== edgeId))
    } catch (err) {
      console.error('Error deleting edge:', err)
      setError(err.message)
      throw err
    }
  }, [])

  // Update node position (for drag operations)
  const updateNodePosition = useCallback(async (nodeId, position) => {
    try {
      await updateNode(nodeId, { position })
    } catch (err) {
      console.error('Error updating node position:', err)
      // Don't throw here to avoid breaking drag operations
    }
  }, [updateNode])

  return {
    nodes,
    edges,
    loading,
    error,
    loadData,
    createNode,
    updateNode,
    deleteNode,
    createEdge,
    deleteEdge,
    updateNodePosition,
    setNodes,
    setEdges
  }
}
