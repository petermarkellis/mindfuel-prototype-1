import { createClient } from '@supabase/supabase-js'

// These should be set in your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables: Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database service functions
export const nodeService = {
  // Get all nodes
  async getNodes() {
    const { data, error } = await supabase
      .from('nodes')
      .select(`
        *,
        creator:created_by(
          id,
          first_name,
          last_name,
          email,
          role,
          availability,
          gender,
          avatar_url
        ),
        updater:updated_by(
          id,
          first_name,
          last_name,
          email,
          role,
          availability,
          gender,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching nodes:', error)
      throw error
    }
    
    return data
  },

  // Get a single node by ID
  async getNode(id) {
    const { data, error } = await supabase
      .from('nodes')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching node:', error)
      throw error
    }
    
    return data
  },

  // Create a new node
  async createNode(nodeData) {
    const { data, error } = await supabase
      .from('nodes')
      .insert([nodeData])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating node:', error)
      throw error
    }
    
    return data
  },

  // Update a node
  async updateNode(id, updates) {
    const { data, error } = await supabase
      .from('nodes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating node:', error)
      throw error
    }
    
    return data
  },

  // Delete a node
  async deleteNode(id) {
    const { error } = await supabase
      .from('nodes')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting node:', error)
      throw error
    }
    
    return true
  }
}

export const riskService = {
  // Get all risk definitions
  async getRisks() {
    const { data, error } = await supabase
      .from('risks')
      .select('*')
      .order('sort_order')
    
    if (error) {
      console.error('Error fetching risks:', error)
      throw error
    }
    
    return data
  },

  // Get risk information for a specific level
  async getRiskInfo(riskLevel) {
    const { data, error } = await supabase
      .from('risks')
      .select('*')
      .eq('level', riskLevel)
      .single()
    
    if (error) {
      console.error('Error fetching risk info:', error)
      throw error
    }
    
    return data
  }
}

export const edgeService = {
  // Get all edges
  async getEdges() {
    const { data, error } = await supabase
      .from('edges')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching edges:', error)
      throw error
    }
    
    return data
  },

  // Create a new edge
  async createEdge(edgeData) {
    const { data, error } = await supabase
      .from('edges')
      .insert([edgeData])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating edge:', error)
      throw error
    }
    
    return data
  },

  // Delete an edge
  async deleteEdge(id) {
    const { error } = await supabase
      .from('edges')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting edge:', error)
      throw error
    }
    
    return true
  }
}
