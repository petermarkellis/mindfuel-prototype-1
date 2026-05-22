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
const READ_ACTIONS = new Set(['getNodes', 'getEdges', 'getRisks']);

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

function getReadFallback(action) {
  if (action === 'getNodes') return FALLBACK_DATA.nodes;
  if (action === 'getEdges') return FALLBACK_DATA.edges;
  if (action === 'getRisks') return FALLBACK_DATA.risks;
  return null;
}

async function fetchApi(url, options = {}) {
  const response = await fetch(url.toString(), {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(
      contentType
        ? `Server returned non-JSON response (${response.status})`
        : `Invalid response from ${url.origin}`
    );
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `API request failed with status ${response.status}`);
  }

  return data;
}

function buildApiUrl(base, action) {
  const url = new URL(base, base.startsWith('http') ? undefined : window.location.origin);
  url.searchParams.set('action', action);
  return url;
}

/**
 * Generic API request handler with fallback for local dev reads only
 */
async function apiRequest(action, options = {}) {
  const allowReadFallback = READ_ACTIONS.has(action);

  const bases = isLocalDev
    ? [LOCAL_API_URL, new URL(API_BASE, window.location.origin).href]
    : [new URL(API_BASE, window.location.origin).href];

  let lastError = null;

  for (const base of bases) {
    try {
      return await fetchApi(buildApiUrl(base, action), options);
    } catch (error) {
      lastError = error;
      if (isLocalDev && base === LOCAL_API_URL) {
        console.log(`ℹ️ Local API (${LOCAL_API_URL}) failed for ${action}, trying next endpoint…`);
      }
    }
  }

  if (isLocalDev && allowReadFallback) {
    const fallback = getReadFallback(action);
    if (fallback) {
      console.log('🔧 Local dev: using fallback data for', action);
      return fallback;
    }
  }

  if (isLocalDev && !allowReadFallback) {
    throw new Error(
      `${lastError?.message ?? 'Request failed'}. Run "npm run dev:full" (or restart "npm run dev:local" after pulling latest code).`
    );
  }

  console.error(`API request failed for action "${action}":`, lastError);
  throw lastError ?? new Error(`API request failed for action "${action}"`);
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
    return await apiRequest('deleteEdge', {
      method: 'POST',
      body: { id },
    });
  },
};

// --------------------------------------------------------
// Graph reset (baseline snapshot)
// --------------------------------------------------------
export const graphService = {
  /**
   * Restore nodes and edges to the canonical baseline (removes user changes).
   */
  async resetToBaseline() {
    return await apiRequest('resetGraph', {
      method: 'POST',
      body: {},
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
