/**
 * Neon Database API Client
 *
 * This module provides functions to interact with the Neon PostgreSQL database
 * through the Vercel serverless API endpoints.
 *
 * For local development without `vercel dev`, it falls back to mock data.
 */

import { initNodes, initEdges } from '../data/initialData.js';

const API_BASE = '/api/db';

// Check if we're in a local development environment
const isLocalDev = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Use local API server in development if available
const LOCAL_API_URL = 'http://localhost:3001/api/db';

/**
 * Fallback Data for Local Development
 * Used when API endpoints are not available (local dev without vercel dev)
 */
const FALLBACK_DATA = {
  nodes: initNodes, // Use initial node data
  edges: initEdges, // Use initial edge data
  risks: [
    { id: 1, level: 'notset', label: 'Not Set', description: 'Risk level has not been assessed yet', color: '#94a3b8', sort_order: 1 },
    { id: 2, level: 'low', label: 'Low', description: 'Minimal risk with low probability of negative impact', color: '#22c55e', sort_order: 2 },
    { id: 3, level: 'medium', label: 'Medium', description: 'Moderate risk requiring some monitoring and mitigation', color: '#f59e0b', sort_order: 3 },
    { id: 4, level: 'high', label: 'High', description: 'Significant risk requiring active management and mitigation strategies', color: '#ef4444', sort_order: 4 },
    { id: 5, level: 'critical', label: 'Critical', description: 'Severe risk requiring immediate attention and comprehensive mitigation', color: '#dc2626', sort_order: 5 }
  ]
};

/**
 * Generic API request handler with fallback for local dev
 */
async function apiRequest(action, options = {}) {
  // In local dev, try local API server first, then fallback to Vercel API, then mock data
  if (isLocalDev) {
    try {
      const url = new URL(LOCAL_API_URL);
      url.searchParams.set('action', action);
      
      const response = await fetch(url.toString(), {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      // Local API server not running, will use fallback below
      console.log('ℹ️ Local API server not available, using fallback data');
    }
  }
  
  // Try production API (works when deployed to Vercel)
  try {
    const url = new URL(API_BASE, window.location.origin);
    url.searchParams.set('action', action);

    const response = await fetch(url.toString(), {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    
    // In local dev, API endpoints return non-JSON (HTML or JS from Vite)
    // Detect this and use fallback data
    if (!contentType || !contentType.includes('application/json')) {
      // Always use fallback in local dev when API doesn't return JSON
      if (isLocalDev) {
        console.log('🔧 Local dev: API not available, using fallback data');
        return FALLBACK_DATA[action === 'getNodes' ? 'nodes' : action === 'getEdges' ? 'edges' : 'risks'];
      }
      
      // In production, this is a real error
      const text = await response.text();
      console.error('Non-JSON response:', text.substring(0, 200));
      throw new Error('Server returned non-JSON response. Check API deployment.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `API request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    // Network error - use fallback in local dev
    if (isLocalDev && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
      console.log('🔧 Local dev: Network error, using fallback data');
      return FALLBACK_DATA[action === 'getNodes' ? 'nodes' : action === 'getEdges' ? 'edges' : 'risks'];
    }
    
    // Re-throw the error
    console.error(`API request failed for action "${action}":`, error);
    throw error;
  }
}

// --------------------------------------------------------
// Node Service
// --------------------------------------------------------
export const nodeService = {
  /**
   * Get all nodes with creator and updater information
   * @returns {Promise<Array>} Array of node objects
   */
  async getNodes() {
    return await apiRequest('getNodes');
  },

  /**
   * Get a single node by ID
   * @param {string} id - Node ID
   * @returns {Promise<Object>} Node object
   */
  async getNode(id) {
    const nodes = await apiRequest('getNodes');
    return nodes.find(node => node.id === id);
  },

  /**
   * Create a new node
   * @param {Object} nodeData - Node data
   * @returns {Promise<Object>} Created node
   */
  async createNode(nodeData) {
    // In local dev, simulate creation
    if (isLocalDev) {
      console.log('🔧 Local dev: Simulating node creation');
      const newNode = { ...nodeData, created_at: new Date().toISOString() };
      FALLBACK_DATA.nodes.push(newNode);
      return newNode;
    }
    return await apiRequest('createNode', {
      method: 'POST',
      body: nodeData,
    });
  },

  /**
   * Update a node
   * @param {string} id - Node ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated node
   */
  async updateNode(id, updates) {
    // In local dev, simulate update
    if (isLocalDev) {
      console.log('🔧 Local dev: Simulating node update');
      const node = FALLBACK_DATA.nodes.find(n => n.id === id);
      if (node) {
        Object.assign(node, updates);
        return node;
      }
      throw new Error('Node not found');
    }
    return await apiRequest('updateNode', {
      method: 'POST',
      body: { id, updates },
    });
  },

  /**
   * Delete a node
   * @param {string} id - Node ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteNode(id) {
    // In local dev, simulate deletion
    if (isLocalDev) {
      console.log('🔧 Local dev: Simulating node deletion');
      const index = FALLBACK_DATA.nodes.findIndex(n => n.id === id);
      if (index > -1) {
        FALLBACK_DATA.nodes.splice(index, 1);
        return true;
      }
      return false;
    }
    return await apiRequest('deleteNode', {
      method: 'POST',
      body: { id },
    });
  },
};

// --------------------------------------------------------
// Edge Service
// --------------------------------------------------------
export const edgeService = {
  /**
   * Get all edges
   * @returns {Promise<Array>} Array of edge objects
   */
  async getEdges() {
    return await apiRequest('getEdges');
  },

  /**
   * Create a new edge
   * @param {Object} edgeData - Edge data
   * @returns {Promise<Object>} Created edge
   */
  async createEdge(edgeData) {
    // In local dev, simulate creation
    if (isLocalDev) {
      console.log('🔧 Local dev: Simulating edge creation');
      const newEdge = { ...edgeData, created_at: new Date().toISOString() };
      FALLBACK_DATA.edges.push(newEdge);
      return newEdge;
    }
    return await apiRequest('createEdge', {
      method: 'POST',
      body: edgeData,
    });
  },

  /**
   * Delete an edge
   * @param {string} id - Edge ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteEdge(id) {
    // In local dev, simulate deletion
    if (isLocalDev) {
      console.log('🔧 Local dev: Simulating edge deletion');
      const index = FALLBACK_DATA.edges.findIndex(e => e.id === id);
      if (index > -1) {
        FALLBACK_DATA.edges.splice(index, 1);
        return true;
      }
      return false;
    }
    return await apiRequest('deleteEdge', {
      method: 'POST',
      body: { id },
    });
  },
};

// --------------------------------------------------------
// Risk Service
// --------------------------------------------------------
export const riskService = {
  /**
   * Get all risk definitions
   * @returns {Promise<Array>} Array of risk objects
   */
  async getRisks() {
    return await apiRequest('getRisks');
  },

  /**
   * Get risk information for a specific level
   * @param {string} riskLevel - Risk level
   * @returns {Promise<Object>} Risk object
   */
  async getRiskInfo(riskLevel) {
    const risks = await this.getRisks();
    return risks.find(risk => risk.level === riskLevel);
  },
};
