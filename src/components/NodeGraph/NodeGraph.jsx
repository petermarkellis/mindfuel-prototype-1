import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  MiniMap,
  Controls,
  useReactFlow,
  addEdge,
  ReactFlowProvider,
} from 'reactflow';
import html2canvas from 'html2canvas';
import { IconZoomIn, IconZoomOut, IconMaximize, IconArrowBackUp, IconLock, IconLockOpen, IconLayoutSidebarLeftExpand, IconLayoutSidebarRightExpand, IconRecharging, IconBox, IconLayersSelected, IconDatabase, IconCheck } from '@tabler/icons-react';

import CustomNode from './CustomNode.jsx';
import SideDrawer from '../BaseComponents/SideDrawer';
import CustomEdge from './CustomEdge.jsx';
import GraphControlPanel from '../GraphControlPanel/GraphControlPanel';
import SidePanelPlaceholder from '../GraphControlPanel/SidePanelPlaceholder';
import FixedFooter from '../BaseComponents/FixedFooter';
import UndoNotification from '../BaseComponents/UndoNotification';
import { ConfirmationModal } from '../BaseComponents';
import { useResetPortfolioView } from '../../hooks/useResetPortfolioView';
import 'reactflow/dist/style.css';
import './NodeGraph.css';

export const Risk = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  NOTSET: 'notset',
};

// Note: Initial node and edge data has been moved to src/data/initialData.js
// This component uses live data from the database via the dataHook prop

const styles = {
  background: 'linear-gradient(180deg, var(--app-canvas-gradient-start) 0%, var(--app-canvas-gradient-end) 100%)',
};

export const nodeTypes = {
  custom: CustomNode,
};

export const edgeTypes = {
  custom: CustomEdge,
};

const frostedControlBg =
  'bg-[var(--app-panel-bg)]/60 backdrop-blur-md border border-[var(--app-border)] shadow';

function CustomControls({ locked, onToggleLock, isPanelCollapsed, onTogglePanel, onResetView, resetting }) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  return (
    <div className="flex flex-col gap-2">
      {/* Zoom and view controls */}
      <div className={`flex flex-col gap-1 p-1 py-2 rounded-2xl ${frostedControlBg}`}>
        <button onClick={zoomIn} title="Zoom In" className="p-2 hover:bg-[var(--app-surface-muted)] rounded">
          <IconZoomIn className="w-5 h-5 text-[var(--app-text-muted)]" />
        </button>
        <button onClick={zoomOut} title="Zoom Out" className="p-2 hover:bg-[var(--app-surface-muted)] rounded">
          <IconZoomOut className="w-5 h-5 text-[var(--app-text-muted)]" />
        </button>
        <button onClick={fitView} title="Fit View" className="p-2 hover:bg-[var(--app-surface-muted)] rounded">
          <IconMaximize className="w-5 h-5 text-[var(--app-text-muted)]" />
        </button>
        <button
          onClick={onResetView}
          disabled={resetting}
          title="Reset demo to original layout"
          aria-label="Reset Demo"
          className="p-2 hover:bg-[var(--app-surface-muted)] rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IconArrowBackUp className={`w-5 h-5 text-[var(--app-text-muted)] ${resetting ? 'animate-spin' : ''}`} />
        </button>
        <button onClick={onToggleLock} title={locked ? 'Unlock nodes' : 'Lock nodes'} className="p-2 hover:bg-[var(--app-surface-muted)] rounded">
          {locked ? <IconLock className="w-5 h-5 text-[var(--app-text-muted)]" /> : <IconLockOpen className="w-5 h-5 text-[var(--app-text-muted)]" />}
        </button>
      </div>

      {/* Panel toggle button */}
      <div className={`rounded-2xl p-1 py-1 ${frostedControlBg}`}>
        <button
          className="p-2 transition hover:bg-[var(--app-surface-muted)] rounded"
          onClick={onTogglePanel}
          title={isPanelCollapsed ? 'Expand Graph Control Panel' : 'Collapse Graph Control Panel'}
        >
          {isPanelCollapsed ? (
            <IconLayoutSidebarLeftExpand className="w-5 h-5 text-[var(--app-text-muted)]" />
          ) : (
            <IconLayoutSidebarRightExpand className="w-5 h-5 text-[var(--app-text-muted)]" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function NodeGraph({ 
  filters, 
  nodeIdToCenter, 
  nodeIdToSelect, 
  panelWidth = 320, 
  setPanelWidth,
  isCollapsed = false, 
  setIsCollapsed,
  setLastPanelWidth,
  minWidth = 220,
  maxWidth = 420,
  sidebarWidth = 64, 
  onTogglePanel, 
  dataHook, 
  onOpenNewItemModal,
  onNodeListSelect,
  onFilterChange,
  activeNav = 'portfolio',
  registerGraphResetComplete,
  onResetView,
}) {
  const { openConfirm: openResetConfirm, resetting, confirmModal: resetConfirmModal } =
    useResetPortfolioView(onResetView);
  const canvasDotColor = 'var(--app-dot-color)';

  const [selectedNode, setSelectedNode] = useState(null);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState({ nodeId: null, pos: { x: 0, y: 0 } });
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    menuType: 'node',
    node: null,
    edge: null,
  });
  const [submenuVisible, setSubmenuVisible] = useState(false);
  const submenuTimeout = useRef(null);
  const contextMenuDismissTimeout = useRef(null);
  const contextMenuRef = useRef(null);

  const CONTEXT_MENU_DISMISS_MS = 500;

  const closeContextMenu = useCallback(() => {
    setContextMenu((cm) => ({ ...cm, visible: false }));
    setSubmenuVisible(false);
  }, []);

  const scheduleContextMenuDismiss = useCallback(() => {
    if (contextMenuDismissTimeout.current) {
      clearTimeout(contextMenuDismissTimeout.current);
    }
    contextMenuDismissTimeout.current = setTimeout(() => {
      closeContextMenu();
      contextMenuDismissTimeout.current = null;
    }, CONTEXT_MENU_DISMISS_MS);
  }, [closeContextMenu]);

  const cancelContextMenuDismiss = useCallback(() => {
    if (contextMenuDismissTimeout.current) {
      clearTimeout(contextMenuDismissTimeout.current);
      contextMenuDismissTimeout.current = null;
    }
  }, []);
  const [locked, setLocked] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    node: null,
    message: '',
    title: ''
  });

  // Undo notification state
  const [undoNotification, setUndoNotification] = useState({
    visible: false,
    message: '',
    lastEdgeId: null
  });

  // Available node types for the submenu
  const availableNodeTypes = ['Opportunity', 'Product', 'Data Asset', 'Data Source'];
  
  // Local filter state
  const [localFilters, setLocalFilters] = useState([]);
  
  // Local handlers for GraphControlPanel
  const handleLocalFilterChange = useCallback((type, isChecked) => {
    // Update local filters
    setLocalFilters(prevFilters => 
      isChecked ? prevFilters.filter(t => t !== type) : [...prevFilters, type]
    );
    // Also call parent handler if provided
    if (onFilterChange) {
      onFilterChange(type, isChecked);
    }
  }, [onFilterChange]);
  
  const handleLocalNodeListSelect = useCallback((id) => {
    if (onNodeListSelect) {
      onNodeListSelect(id);
    }
  }, [onNodeListSelect]);

  // Use shared database hook from Layout
  const {
    nodes,
    edges,
    loading,
    error,
    loadData,
    createEdge,
    deleteEdge,
    updateNode,
    updateNodePosition,
    deleteNode,
    setNodes,
  } = dataHook;

  // React Flow state — useNodesState only reads the initial value, so sync when data loads
  const [localNodes, setLocalNodes, onNodesChange] = useNodesState(nodes || []);
  const [localEdges, setLocalEdges, onEdgesChange] = useEdgesState(edges || []);
  const positionSaveTimeouts = useRef({});
  const reactFlowRef = useRef(null);

  // Keep React Flow in sync whenever the database graph changes (including reset)
  useEffect(() => {
    if (loading) {
      Object.values(positionSaveTimeouts.current).forEach(clearTimeout);
      positionSaveTimeouts.current = {};
      return;
    }
    setLocalNodes(nodes);
    setLocalEdges(edges);
  }, [loading, nodes, edges, setLocalNodes, setLocalEdges]);

  const handleGraphResetComplete = useCallback(() => {
    Object.values(positionSaveTimeouts.current).forEach(clearTimeout);
    positionSaveTimeouts.current = {};
    setSelectedNode(null);
    setSideDrawerOpen(false);
    closeContextMenu();
    requestAnimationFrame(() => {
      reactFlowRef.current?.fitView({ padding: 0.25, duration: 400 });
    });
  }, [closeContextMenu]);

  useEffect(() => {
    registerGraphResetComplete?.(handleGraphResetComplete);
    return () => registerGraphResetComplete?.(null);
  }, [registerGraphResetComplete, handleGraphResetComplete]);
  
  const handleNodesChange = useCallback((changes) => {
    // Apply changes to local state (React Flow requirement)
    onNodesChange(changes);

    // Save position changes to database (debounced)
    changes.forEach((change) => {
      if (change.type === 'position' && change.position) {
        if (positionSaveTimeouts.current[change.id]) {
          clearTimeout(positionSaveTimeouts.current[change.id]);
        }
        positionSaveTimeouts.current[change.id] = setTimeout(async () => {
          try {
            await updateNode(change.id, { position: change.position });
          } catch (error) {
            console.error('Failed to save node position:', error);
          }
        }, 500);
      }
    });
  }, [onNodesChange, updateNode]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(positionSaveTimeouts.current).forEach(clearTimeout);
      if (submenuTimeout.current) {
        clearTimeout(submenuTimeout.current);
      }
    };
  }, []);

  const onConnect = useCallback(async (params) => {
    try {
      const edgeId = `edge_${Date.now()}`;
      const newEdge = { ...params, id: edgeId, type: 'custom' };
      
      // Optimistically update local state
      setLocalEdges((eds) => addEdge(newEdge, eds));
      
      // Save to database
      await createEdge(newEdge);
      
      // Show undo notification
      setUndoNotification({
        visible: true,
        message: 'Connection created',
        lastEdgeId: edgeId
      });
    } catch (error) {
      console.error('Failed to create edge:', error);
      // Revert local state if database save fails
      setLocalEdges(edges);
    }
  }, [createEdge, setLocalEdges, edges]);

  // Handle undo for connection
  const handleUndoConnection = useCallback(async () => {
    if (!undoNotification.lastEdgeId) return;

    try {
      // Remove from database
      await deleteEdge(undoNotification.lastEdgeId);

      // Remove from local state
      setLocalEdges((eds) => eds.filter(edge => edge.id !== undoNotification.lastEdgeId));
    } catch (error) {
      console.error('Failed to undo connection:', error);
    }
    
    // Hide notification after undo completes
    setUndoNotification({ visible: false, message: '', lastEdgeId: null });
  }, [undoNotification.lastEdgeId, deleteEdge, setLocalEdges]);

  // Auto-layout: Organize nodes in pyramid hierarchy by type
  // Handle removing a connection
  const handleRemoveConnection = useCallback(async (targetNodeId) => {
    if (!selectedNode) return;
    
    // Find the edge connecting these nodes
    const edge = localEdges.find(
      e => (e.source === selectedNode.id && e.target === targetNodeId) ||
           (e.source === targetNodeId && e.target === selectedNode.id)
    );
    
    if (edge) {
      try {
        await deleteEdge(edge.id);
        setLocalEdges((eds) => eds.filter((e) => e.id !== edge.id));
      } catch (error) {
        console.error('Failed to remove connection:', error);
        alert('Failed to remove connection. Please try again.');
      }
    }
  }, [selectedNode, localEdges, deleteEdge, setLocalEdges]);

  const handleNodeClick = useCallback((event, node) => {
    if (event.button === 0) {
      // Deep clone the node to preserve its data independently
      const nodeCopy = JSON.parse(JSON.stringify(node));
      setSelectedNode(nodeCopy);
      setSideDrawerOpen(true);
    }
  }, []);

  const getContextMenuPosition = useCallback((event, menuWidth, menuHeight) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = event.clientX;
    let y = event.clientY;

    if (x + menuWidth > viewportWidth) {
      x = viewportWidth - menuWidth - 10;
    }
    if (y + menuHeight > viewportHeight) {
      y = viewportHeight - menuHeight - 10;
    }
    if (x < 10) x = 10;
    if (y < 10) y = 10;

    return { x, y };
  }, []);

  const handleNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    cancelContextMenuDismiss();
    setSubmenuVisible(false);

    const { x, y } = getContextMenuPosition(event, 180, 250);

    setContextMenu({
      visible: true,
      x,
      y,
      menuType: 'node',
      node,
      edge: null,
    });
  }, [getContextMenuPosition, cancelContextMenuDismiss]);

  const handleEdgeContextMenu = useCallback((event, edge) => {
    event.preventDefault();
    cancelContextMenuDismiss();
    setSubmenuVisible(false);

    const { x, y } = getContextMenuPosition(event, 200, 56);

    setContextMenu({
      visible: true,
      x,
      y,
      menuType: 'edge',
      node: null,
      edge,
    });
  }, [getContextMenuPosition, cancelContextMenuDismiss]);

  const handleNodeMouseEnter = useCallback((_, node) => {
    if (
      contextMenu.visible &&
      contextMenu.menuType === 'node' &&
      contextMenu.node?.id === node.id
    ) {
      cancelContextMenuDismiss();
    }
  }, [contextMenu, cancelContextMenuDismiss]);

  const handleNodeMouseLeave = useCallback((_, node) => {
    if (
      contextMenu.visible &&
      contextMenu.menuType === 'node' &&
      contextMenu.node?.id === node.id
    ) {
      scheduleContextMenuDismiss();
    }
  }, [contextMenu, scheduleContextMenuDismiss]);

  const handleEdgeMouseEnter = useCallback((_, edge) => {
    if (
      contextMenu.visible &&
      contextMenu.menuType === 'edge' &&
      contextMenu.edge?.id === edge.id
    ) {
      cancelContextMenuDismiss();
    }
  }, [contextMenu, cancelContextMenuDismiss]);

  const handleEdgeMouseLeave = useCallback((_, edge) => {
    if (
      contextMenu.visible &&
      contextMenu.menuType === 'edge' &&
      contextMenu.edge?.id === edge.id
    ) {
      scheduleContextMenuDismiss();
    }
  }, [contextMenu, scheduleContextMenuDismiss]);

  const handleRemoveEdgeConnection = useCallback(async (edge) => {
    if (!edge?.id) return;

    closeContextMenu();

    try {
      await deleteEdge(edge.id);
      setLocalEdges((eds) => eds.filter((e) => e.id !== edge.id));
    } catch (error) {
      console.error('Failed to remove connection:', error);
      alert('Failed to remove connection. Please try again.');
    }
  }, [deleteEdge, setLocalEdges, closeContextMenu]);

  const handleCloseSideDrawer = useCallback(() => {
    setSideDrawerOpen(false);
    
    setLocalNodes((nds) =>
      nds.map((n) => ({ ...n, className: '' }))
    );
  }, [setLocalNodes]);

  // Clear dismiss timer when menu closes
  useEffect(() => {
    if (!contextMenu.visible) {
      cancelContextMenuDismiss();
    }
  }, [contextMenu.visible, cancelContextMenuDismiss]);

  // Close context menu on click outside
  useEffect(() => {
    if (!contextMenu.visible) return;
    function handleClick(e) {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        closeContextMenu();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [contextMenu.visible, closeContextMenu]);

  // Close context menu on Escape key
  useEffect(() => {
    if (!contextMenu.visible) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        closeContextMenu();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [contextMenu.visible, closeContextMenu]);

  // Close context menu on window blur
  useEffect(() => {
    if (!contextMenu.visible) return;
    function handleBlur() {
      closeContextMenu();
    }
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [contextMenu.visible, closeContextMenu]);

  // Filter nodes dynamically based on the filters prop
  const filteredNodes = localNodes.filter(node => !filters.includes(node.data.type));

  // Compute connected nodes for the selected node
  const selectedNodeId = selectedNode?.id;
  const connectedNodeIds = localEdges
    .filter(
      edge => edge.source === selectedNodeId || edge.target === selectedNodeId
    )
    .map(edge =>
      edge.source === selectedNodeId ? edge.target : edge.source
    );
  const connectedNodes = localNodes.filter(node => connectedNodeIds.includes(node.id));

  // Compute parent and child nodes for the selected node
  const parentNodeIds = localEdges
    .filter(edge => edge.target === selectedNodeId)
    .map(edge => edge.source);
  const parentNodes = localNodes.filter(node => parentNodeIds.includes(node.id));

  const childNodeIds = localEdges
    .filter(edge => edge.source === selectedNodeId)
    .map(edge => edge.target);
  const childNodes = localNodes.filter(node => childNodeIds.includes(node.id));

  // Helper component to center the view on a node
  function FlowNavigator({ nodeIdToCenter }) {
    const reactFlow = useReactFlow();
    useEffect(() => {
      if (nodeIdToCenter) {
        const node = reactFlow.getNodes().find(n => n.id === nodeIdToCenter);
        if (node) {
          // Check if sidedrawer will be open (since navigation triggers selection)
          const sideDrawerOffset = 300; // 300px offset to account for sidedrawer width
          const adjustedX = node.position.x + sideDrawerOffset;
          reactFlow.setCenter(adjustedX, node.position.y, { zoom: 0.8, duration: 1200 });
        }
      }
    }, [nodeIdToCenter, reactFlow]);
    return null;
  }

  // Handle node selection from navigation
  useEffect(() => {
    if (nodeIdToSelect) {
      const nodeToSelect = nodes.find(n => n.id === nodeIdToSelect);
      if (nodeToSelect) {
        // Set the selected node
        setSelectedNode(nodeToSelect);
        // Open the sidedrawer
        setSideDrawerOpen(true);
        // Set the highlight state
        setNodes((nds) =>
          nds.map((n) =>
            n.id === nodeIdToSelect
              ? { ...n, className: 'highlighted' }
              : { ...n, className: '' }
          )
        );
      }
    }
  }, [nodeIdToSelect, nodes, setNodes]);

  // Add this handler inside NodeGraph
  const handleNodeTitleChange = useCallback(async (id, newTitle) => {
    try {
      // Optimistically update local state
      setLocalNodes(nds => {
        const updated = nds.map(node =>
          node.id === id
            ? { ...node, data: { ...node.data, name: newTitle } }
            : node
        );
        // Also update selectedNode if it's the one being edited
        if (selectedNode && selectedNode.id === id) {
          const updatedNode = updated.find(node => node.id === id);
          setSelectedNode(updatedNode);
        }
        return updated;
      });
      
      // Save to database
      await updateNode(id, { data: { name: newTitle } });
    } catch (error) {
      console.error('Failed to update node title:', error);
      // Revert optimistic update if database save fails
      setLocalNodes(nodes);
    }
  }, [updateNode, setLocalNodes, nodes, selectedNode]);

  const handleNodeRiskChange = useCallback(async (id, newRisk) => {
    try {
      // Optimistically update local state
      setLocalNodes(nds => {
        const updated = nds.map(node =>
          node.id === id
            ? { ...node, data: { ...node.data, risk: newRisk } }
            : node
        );
        // Also update selectedNode if it's the one being edited
        if (selectedNode && selectedNode.id === id) {
          const updatedNode = updated.find(node => node.id === id);
          setSelectedNode(updatedNode);
        }
        return updated;
      });
      
      // Save to database
      await updateNode(id, { data: { risk: newRisk } });
    } catch (error) {
      console.error('Failed to update node risk:', error);
      // Revert optimistic update if database save fails
      setLocalNodes(nodes);
    }
  }, [updateNode, setLocalNodes, nodes, selectedNode]);

  const handleNodeTypeChange = useCallback(async (nodeId, newType) => {
    try {
      // Optimistically update local state
      setLocalNodes(nds => {
        const updated = nds.map(node =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, type: newType } }
            : node
        );
        // Also update selectedNode if it's the one being edited
        if (selectedNode && selectedNode.id === nodeId) {
          const updatedNode = updated.find(node => node.id === nodeId);
          setSelectedNode(updatedNode);
        }
        return updated;
      });
      
      // Save to database
      await updateNode(nodeId, { data: { type: newType } });
      
      // Close context menu and submenu
      setContextMenu({ visible: false, x: 0, y: 0, menuType: 'node', node: null, edge: null });
      setSubmenuVisible(false);
      if (submenuTimeout.current) {
        clearTimeout(submenuTimeout.current);
      }
    } catch (error) {
      console.error('Failed to update node type:', error);
      // Revert optimistic update if database save fails
      setLocalNodes(nodes);
    }
  }, [updateNode, setLocalNodes, nodes, selectedNode]);

  const handleDeleteNode = useCallback((node) => {
    // Find parent and child connections before deletion
    const parentEdges = localEdges.filter(edge => edge.target === node.id);
    const childEdges = localEdges.filter(edge => edge.source === node.id);
    
    // Check if this node is a bridge (has both parents and children)
    const hasParents = parentEdges.length > 0;
    const hasChildren = childEdges.length > 0;
    const isBridge = hasParents && hasChildren;
    
    // Create confirmation message based on node type
    let confirmMessage = `Are you sure you want to delete "${node.data.name}"?`;
    
    if (isBridge) {
      const parentInfos = parentEdges.map(edge => {
        const parentNode = localNodes.find(n => n.id === edge.source);
        const name = parentNode?.data?.name || 'Unknown';
        const type = parentNode?.data?.type || 'Unknown';
        return `${type}|${name}`;
      }).join('||');
      
      const childInfos = childEdges.map(edge => {
        const childNode = localNodes.find(n => n.id === edge.target);
        const name = childNode?.data?.name || 'Unknown';
        const type = childNode?.data?.type || 'Unknown';
        return `${type}|${name}`;
      }).join('||');
      
      confirmMessage += `\n\nThis node connects:\nParents: ${parentInfos}\nChildren: ${childInfos}\n\nThe children will be reconnected to the parents to maintain the flow.`;
    } else if (hasChildren) {
      const childInfos = childEdges.map(edge => {
        const childNode = localNodes.find(n => n.id === edge.target);
        const name = childNode?.data?.name || 'Unknown';
        const type = childNode?.data?.type || 'Unknown';
        return `${type}|${name}`;
      }).join('||');
      
      confirmMessage += `\n\nThis will disconnect:\nChildren: ${childInfos}`;
    } else if (hasParents) {
      const parentInfos = parentEdges.map(edge => {
        const parentNode = localNodes.find(n => n.id === edge.source);
        const name = parentNode?.data?.name || 'Unknown';
        const type = parentNode?.data?.type || 'Unknown';
        return `${type}|${name}`;
      }).join('||');
      
      confirmMessage += `\n\nThis will disconnect from:\nParents: ${parentInfos}`;
    }
    
    confirmMessage += '\n\nThis action cannot be undone.';
    
    // Show confirmation modal instead of browser confirm
    setDeleteConfirmation({
      isOpen: true,
      node: node,
      title: 'Delete Node',
      message: confirmMessage
    });
    
    // Close context menu immediately when showing modal
    setContextMenu({ visible: false, x: 0, y: 0, menuType: 'node', node: null, edge: null });
    setSubmenuVisible(false);
  }, [localEdges, localNodes]);

  // Function to actually perform the deletion after confirmation
  const performDelete = useCallback(async (node) => {
    // Find parent and child connections before deletion
    const parentEdges = localEdges.filter(edge => edge.target === node.id);
    const childEdges = localEdges.filter(edge => edge.source === node.id);
    
    // Check if this node is a bridge (has both parents and children)
    const hasParents = parentEdges.length > 0;
    const hasChildren = childEdges.length > 0;
    const isBridge = hasParents && hasChildren;

    try {
      // Close side drawer if this node is selected
      if (selectedNode?.id === node.id) {
        setSideDrawerOpen(false);
        setSelectedNode(null);
      }
      
      // If this is a bridge node, create new connections between parents and children
      if (isBridge) {
        for (const parentEdge of parentEdges) {
          for (const childEdge of childEdges) {
            const newEdge = {
              id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              source: parentEdge.source,
              target: childEdge.target,
              type: 'custom'
            };
            
            try {
              // Create the new edge in the database
              await createEdge(newEdge);
              
              // Add to local state immediately for better UX
              setLocalEdges((eds) => [...eds, newEdge]);
            } catch (edgeError) {
              console.error('Failed to create reconnection edge:', edgeError);
              // Continue with other connections even if one fails
            }
          }
        }
      }
      
      // Delete from database (this will also remove from local state via the hook)
      await deleteNode(node.id);
      
      // Remove from local React Flow state immediately for better UX
      setLocalNodes((nds) => nds.filter((n) => n.id !== node.id));
      setLocalEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));
      
    } catch (error) {
      console.error('Failed to delete node:', error);
      alert('Failed to delete node. Please try again.');
    }
  }, [deleteNode, createEdge, selectedNode, setLocalNodes, setLocalEdges, localNodes, localEdges]);

  // Submenu management with delays
  const showSubmenu = useCallback(() => {
    if (submenuTimeout.current) {
      clearTimeout(submenuTimeout.current);
    }
    setSubmenuVisible(true);
  }, []);

  const hideSubmenu = useCallback(() => {
    submenuTimeout.current = setTimeout(() => {
      setSubmenuVisible(false);
    }, 150); // 150ms delay before hiding
  }, []);

  const cancelHideSubmenu = useCallback(() => {
    if (submenuTimeout.current) {
      clearTimeout(submenuTimeout.current);
    }
  }, []);

  // Lock/unlock handler
  const toggleLock = () => {
    setLocked(l => {
      setNodes(nds =>
        nds.map(node => ({
          ...node,
          draggable: l ? true : false
        }))
      );
      return !l;
    });
  };

  // Show error state (initial load only — reset errors stay in the reset modal)
  if (error && nodes.length === 0 && edges.length === 0) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[var(--app-bg)]">
        <div className="text-center p-8 max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-[var(--app-text)] mb-2">Database Connection Error</h3>
          <p className="text-[var(--app-text-muted)] mb-4">{error}</p>
          <p className="text-sm text-[var(--app-text-muted)] mb-4">
            For local development, run <code className="bg-[var(--app-surface-muted)] px-2 py-1 rounded text-[var(--app-text)]">npm run dev:full</code> or deploy to Vercel.
          </p>
          <button
            type="button"
            onClick={() => loadData()}
            className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <div className="node_graph h-full w-full relative">
        <ReactFlowProvider>
          {/* Side panel + controls slide together as one unit */}
          <div
            className="fixed left-16 top-10 z-40 flex flex-row h-[calc(100vh-2.5rem)] pointer-events-none"
            style={{
              transform: isCollapsed ? `translateX(-${panelWidth}px)` : 'translateX(0)',
              transition: 'transform 0.4s cubic-bezier(0.645, 0.045, 0.355, 1)',
            }}
          >
            <div
              className="h-full flex-shrink-0 overflow-hidden pointer-events-auto"
              style={{
                width: panelWidth,
                pointerEvents: isCollapsed ? 'none' : 'auto',
              }}
            >
              {activeNav === 'portfolio' ? (
                <GraphControlPanel
                  onFilterChange={handleLocalFilterChange}
                  nodes={localNodes}
                  onNodeListSelect={handleLocalNodeListSelect}
                />
              ) : (
                <SidePanelPlaceholder activeNav={activeNav} />
              )}
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0 pl-1 pt-3 pointer-events-auto">
              <CustomControls
                locked={locked}
                onToggleLock={toggleLock}
                isPanelCollapsed={isCollapsed}
                onTogglePanel={onTogglePanel}
                onResetView={openResetConfirm}
                resetting={resetting}
              />
            </div>
          </div>

          {/* React Flow Canvas */}
          <ReactFlow
          onInit={(instance) => {
            reactFlowRef.current = instance;
          }}
          onNodeClick={handleNodeClick}
          onNodeContextMenu={handleNodeContextMenu}
          onNodeMouseEnter={handleNodeMouseEnter}
          onNodeMouseLeave={handleNodeMouseLeave}
          onEdgeContextMenu={handleEdgeContextMenu}
          onEdgeMouseEnter={handleEdgeMouseEnter}
          onEdgeMouseLeave={handleEdgeMouseLeave}
          style={styles} 
          nodes={filteredNodes}
          edges={localEdges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          minZoom={0.4}
          maxZoom={1.3}
          fitView
          fitViewOptions={{
            padding: 2,
          }}
          connectionLineStyle={{ stroke: '#6366f1', strokeWidth: 4 }}
          className=""
          onPaneClick={() => {
            // Just close the drawer when clicking canvas
            // Don't modify selectedNode or node state - prevents data loss
            setSideDrawerOpen(false);
            closeContextMenu();
          }}
          onMove={closeContextMenu}
          onNodeDragStart={closeContextMenu}
        >
          <FlowNavigator nodeIdToCenter={nodeIdToCenter} />
          <Background
            color={canvasDotColor}
            variant={BackgroundVariant.Dots}
            size={4}
            gap={50}
          />
        </ReactFlow>
        </ReactFlowProvider>
        {/* Context Menu */}
        {contextMenu.visible && (
          <div
            ref={contextMenuRef}
            className="fixed bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg shadow-lg py-2 px-2 text-left min-w-[180px] w-auto z-[9999] text-[var(--app-text)]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onMouseEnter={cancelContextMenuDismiss}
            onMouseLeave={scheduleContextMenuDismiss}
          >
            {contextMenu.menuType === 'edge' ? (
              <div
                className="py-2 px-3 text-red-500 hover:bg-red-500/10 hover:rounded-md cursor-pointer text-md whitespace-nowrap"
                onClick={() => handleRemoveEdgeConnection(contextMenu.edge)}
              >
                Remove connection
              </div>
            ) : (
              <>
                <div
                  className="py-2 px-3 hover:bg-[var(--app-surface-muted)] hover:rounded-md cursor-pointer text-md"
                  onClick={closeContextMenu}
                >
                  Edit
                </div>

                <div
                  className="py-2 px-3 hover:bg-[var(--app-surface-muted)] hover:rounded-md cursor-pointer text-md"
                  onClick={() => {
                    closeContextMenu();
                    onOpenNewItemModal && onOpenNewItemModal(contextMenu.node?.id);
                  }}
                >
                  New Connection
                </div>

                <div
                  className="py-2 px-3 hover:bg-[var(--app-surface-muted)] hover:rounded-md cursor-pointer text-md"
                  onClick={closeContextMenu}
                >
                  Share
                </div>

                <div
                  className="py-2 px-3 hover:bg-[var(--app-surface-muted)] hover:rounded-md cursor-pointer text-md relative flex items-center justify-between"
                  onMouseEnter={() => {
                    cancelContextMenuDismiss();
                    showSubmenu();
                  }}
                  onMouseLeave={hideSubmenu}
                >
                  Change Type
                  <span className="text-[var(--app-text-muted)] ml-2">→</span>

                  {submenuVisible && (
                    <div
                      className="absolute left-full top-0 -ml-1 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg shadow-lg py-2 px-2 min-w-[200px] z-[10000] text-[var(--app-text)]"
                      onMouseEnter={() => {
                        cancelContextMenuDismiss();
                        cancelHideSubmenu();
                      }}
                      onMouseLeave={hideSubmenu}
                    >
                      {availableNodeTypes.map((type) => {
                        const isActive = contextMenu.node?.data?.type === type
                        const activeTypeClass = {
                          Opportunity: 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300',
                          Product: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
                          'Data Asset': 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
                          'Data Source': 'bg-green-50 text-green-700 dark:bg-green-950/60 dark:text-green-300',
                        }[type]

                        return (
                        <div
                          key={type}
                          className={`py-2 px-3 hover:bg-[var(--app-surface-muted)] hover:rounded-md cursor-pointer text-sm flex items-center text-[var(--app-text)] ${
                            isActive ? activeTypeClass ?? 'bg-[var(--app-surface-muted)]' : ''
                          }`}
                          onClick={() => handleNodeTypeChange(contextMenu.node?.id, type)}
                        >
                          <span className="mr-2 flex-shrink-0">
                            {type === 'Opportunity' && <IconRecharging className="w-4 h-4 text-orange-400" />}
                            {type === 'Product' && <IconBox className="w-4 h-4 text-purple-400" />}
                            {type === 'Data Asset' && <IconLayersSelected className="w-4 h-4 text-blue-400" />}
                            {type === 'Data Source' && <IconDatabase className="w-4 h-4 text-green-400" />}
                          </span>
                          <span className="flex-1">{type}</span>
                          {isActive && (
                            <IconCheck className="ml-auto text-blue-600 dark:text-emerald-400 flex-shrink-0 w-4 h-4" />
                          )}
                        </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div
                  className="py-2 px-3 text-red-500 hover:bg-red-500/10 hover:rounded-md cursor-pointer text-md"
                  onClick={() => handleDeleteNode(contextMenu.node)}
                >
                  Delete
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <div className="absolute top-0 right-0">
        <SideDrawer
          selectedNode={selectedNode}
          isOpen={sideDrawerOpen}
          onClose={handleCloseSideDrawer}
          connectedNodes={connectedNodes}
          parentNodes={parentNodes}
          childNodes={childNodes}
          onTitleChange={handleNodeTitleChange}
          onRiskChange={handleNodeRiskChange}
          onRemoveConnection={handleRemoveConnection}
        />
      </div>
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, node: null, message: '', title: '' })}
        onConfirm={() => performDelete(deleteConfirmation.node)}
        title={deleteConfirmation.title}
        message={deleteConfirmation.message}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Undo Notification Toast */}
      {undoNotification.visible && (
        <UndoNotification
          message={undoNotification.message}
          onUndo={handleUndoConnection}
          onDismiss={() => setUndoNotification({ visible: false, message: '', lastEdgeId: null })}
        />
      )}

      {resetConfirmModal}
    </div>
  );
}