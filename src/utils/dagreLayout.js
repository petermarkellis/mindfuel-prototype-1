import dagre from '@dagrejs/dagre';

/** Default size for custom portfolio nodes (includes category label above card). */
export const DAGRE_NODE_WIDTH = 420;
export const DAGRE_NODE_HEIGHT = 380;

const DEFAULT_GRAPH_OPTIONS = {
  rankdir: 'TB',
  nodesep: 200,
  ranksep: 240,
  marginx: 80,
  marginy: 120,
};

/** Portfolio tiers — lower number = higher on canvas (Opportunity at top). */
const NODE_TYPE_RANK = {
  Opportunity: 0,
  Product: 1,
  'Data Product': 1,
  'Data Asset': 2,
  Asset: 2,
  'Data Source': 3,
  Source: 3,
};

function getNodeRank(node) {
  const type = node.data?.type;
  return type != null && NODE_TYPE_RANK[type] != null ? NODE_TYPE_RANK[type] : undefined;
}

export function getNodeDimensions(node) {
  return {
    width: node.width ?? node.measured?.width ?? DAGRE_NODE_WIDTH,
    height: node.height ?? node.measured?.height ?? DAGRE_NODE_HEIGHT,
  };
}

/**
 * Run dagre top-down layout on React Flow nodes and edges.
 * Opportunities are pinned to the top tier; edges flow downward.
 * Returns new node positions (top-left origin, matching React Flow).
 */
export function getLayoutedElements(nodes, edges, graphOptions = {}) {
  if (!nodes.length) {
    return { nodes: [], edges };
  }

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ ...DEFAULT_GRAPH_OPTIONS, ...graphOptions });

  nodes.forEach((node) => {
    const { width, height } = getNodeDimensions(node);
    const rank = getNodeRank(node);
    g.setNode(node.id, {
      width,
      height,
      ...(rank !== undefined ? { rank } : {}),
    });
  });

  // App edges run source → target (Opportunity at source, Data Source at target).
  // TB places the tail above the head, so source → target = top-down portfolio flow.
  edges.forEach((edge) => {
    if (g.hasNode(edge.source) && g.hasNode(edge.target)) {
      g.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    const { width, height } = getNodeDimensions(node);

    if (pos == null || pos.x == null || pos.y == null) {
      return node;
    }

    return {
      ...node,
      position: {
        x: pos.x - width / 2,
        y: pos.y - height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
