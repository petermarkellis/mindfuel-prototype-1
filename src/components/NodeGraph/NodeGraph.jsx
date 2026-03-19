import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  MiniMap,
  Controls,
  useReactFlow,
  addEdge
} from 'reactflow';
import html2canvas from 'html2canvas';
import { IconZoomIn, IconZoomOut, IconMaximize, IconArrowBackUp, IconLock, IconLockOpen, IconLayoutSidebarLeftExpand, IconLayoutSidebarRightExpand, IconRecharging, IconBox, IconLayersSelected, IconDatabase, IconCheck, IconSparkles } from '@tabler/icons-react';

import CustomNode from './CustomNode.jsx';
import SideDrawer from '../BaseComponents/SideDrawer';
import CustomEdge from './CustomEdge.jsx';
import GraphControlPanel from '../GraphControlPanel/GraphControlPanel';
import FixedFooter from '../BaseComponents/FixedFooter';
import UndoNotification from '../BaseComponents/UndoNotification';
import { ConfirmationModal } from '../BaseComponents';
import { useNeonNodes } from '../../hooks/useNeonNodes';

import 'reactflow/dist/style.css';
import './NodeGraph.css';

export const Risk = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  NOTSET: 'notset',
};

// Note: Initial node and edge data has been moved to src/data/initialData.js
// This component now uses live data from the database via the supabaseHook prop

const styles = {
  background: 'linear-gradient(180deg, #f7f7fa 0%, #e6eaf2 100%)',
  //background: 'linear-gradient(180deg, #eeeeee 0%, #efefef 100%)',
};

export const nodeTypes = {
  custom: CustomNode,
};

export const edgeTypes = {
  custom: CustomEdge,
};

function CustomControls({ locked, onToggleLock, isPanelCollapsed, onTogglePanel, onAutoLayout }) {
  const { zoomIn, zoomOut, fitView, setViewport } = useReactFlow();
  return (
    <div className="flex flex-col gap-2">
      {/* Zoom and view controls */}
      <div className="flex flex-col gap-1 p-1 py-2 bg-white/80 rounded-2xl shadow border border-slate-200">
        <button onClick={zoomIn} title="Zoom In" className="p-2 hover:bg-slate-100 rounded">
          <IconZoomIn className="w-5 h-5 text-slate-600" />
        </button>
        <button onClick={zoomOut} title="Zoom Out" className="p-2 hover:bg-slate-100 rounded">
          <IconZoomOut className="w-5 h-5 text-slate-600" />
        </button>
        <button onClick={fitView} title="Fit View" className="p-2 hover:bg-slate-100 rounded">
          <IconMaximize className="w-5 h-5 text-slate-600" />
        </button>
        <button onClick={() => setViewport({ x: 0, y: 0, zoom: 1 })} title="Reset" className="p-2 hover:bg-slate-100 rounded">
          <IconArrowBackUp className="w-5 h-5 text-slate-600" />
        </button>
        <button onClick={onAutoLayout} title="Auto-Layout" className="p-2 hover:bg-slate-100 rounded">
          <IconSparkles className="w-5 h-5 text-indigo-600" />
        </button>
        <button onClick={onToggleLock} title={locked ? 'Unlock nodes' : 'Lock nodes'} className="p-2 hover:bg-slate-100 rounded">
          {locked ? <IconLock className="w-5 h-5 text-slate-600" /> : <IconLockOpen className="w-5 h-5 text-slate-600" />}
        </button>
      </div>

      {/* Panel toggle button */}
      <div className="bg-white/80 rounded-2xl shadow border border-slate-200 p-1 py-1">
        <button
          className="p-2 transition hover:bg-slate-100 rounded"
          onClick={onTogglePanel}
          title={isPanelCollapsed ? 'Expand Graph Control Panel' : 'Collapse Graph Control Panel'}
        >
          {isPanelCollapsed ? (
            <IconLayoutSidebarLeftExpand className="w-5 h-5 text-slate-600" />
          ) : (
            <IconLayoutSidebarRightExpand className="w-5 h-5 text-slate-600" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function NodeGraph({ filters, nodeIdToCenter, nodeIdToSelect, panelWidth = 320, isCollapsed = false, sidebarWidth = 64, onTogglePanel, supabaseHook, onOpenNewItemModal, setNodes, setEdges }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState({ nodeId: null, pos: { x: 0, y: 0 } });
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, node: null });
  const [submenuVisible, setSubmenuVisible] = useState(false);
  const submenuTimeout = useRef(null);
  const contextMenuRef = useRef(null);
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
    deleteNode
  } = supabaseHook;

  // React Flow state - initialized from database
  const [localNodes, setLocalNodes, onNodesChange] = useNodesState(nodes || []);
  const [localEdges, setLocalEdges, onEdgesChange] = useEdgesState(edges || []);
  
  // Sync with database when nodes/edges change (only count changes)
  useEffect(() => {
    if (nodes && nodes.length !== localNodes.length) {
      setLocalNodes(nodes);
    }
  }, [nodes?.length, setLocalNodes]);

  useEffect(() => {
    if (edges && edges.length !== localEdges.length) {
      setLocalEdges(edges);
    }
  }, [edges?.length, setLocalEdges, localEdges.length]);
  
  // Handle position changes with debounce
  const positionSaveTimeouts = useRef({});
  
  const handleNodesChange = useCallback((changes) => {
    // Apply changes to local state (React Flow requirement)
    onNodesChange(changes);
    
    // Save position changes to database
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
  const handleAutoLayout = useCallback(async () => {
    // Define hierarchy order (top to bottom)
    const typePriority = {
      'Opportunity': 0,      // Top of pyramid
      'Product': 1,          // Second level
      'Data Asset': 2,       // Third level
      'Data Source': 3       // Bottom of pyramid
    };
    
    // Group nodes by type
    const nodesByType = new Map();
    localNodes.forEach(node => {
      const type = node.data?.type || 'Data Source';
      if (!nodesByType.has(type)) {
        nodesByType.set(type, []);
      }
      nodesByType.get(type).push(node);
    });
    
    // Calculate layout parameters with generous spacing
    const canvasWidth = 2400;
    const nodeWidth = 300;
    const nodeHeight = 150;
    const horizontalSpacing = 400;  // Maximum gap between nodes horizontally
    const verticalSpacing = 300;   // Large gap between type levels
    
    // Calculate positions for each type level
    const typePositions = new Map();
    let currentY = 100; // Start from top with padding
    
    // Sort types by priority
    const sortedTypes = Object.keys(typePriority).sort((a, b) => typePriority[a] - typePriority[b]);
    
    sortedTypes.forEach(type => {
      const nodes = nodesByType.get(type) || [];
      if (nodes.length === 0) return;
      
      // Calculate row width needed (node width + spacing for each node)
      const totalNodeWidth = nodes.length * nodeWidth;
      const totalSpacing = (nodes.length - 1) * horizontalSpacing;
      const rowWidth = totalNodeWidth + totalSpacing;
      const startX = (canvasWidth - rowWidth) / 2; // Center the row
      
      nodes.forEach((node, index) => {
        const x = startX + index * (nodeWidth + horizontalSpacing);
        typePositions.set(node.id, { x, y: currentY });
      });
      
      currentY += nodeHeight + verticalSpacing;
    });
    
    // Handle any nodes with unknown types
    const remainingNodes = localNodes.filter(node => !typePositions.has(node.id));
    if (remainingNodes.length > 0) {
      remainingNodes.forEach((node, index) => {
        const x = (canvasWidth - nodeWidth) / 2;
        const y = currentY + index * (nodeHeight + verticalSpacing);
        typePositions.set(node.id, { x, y });
      });
    }
    
    // Update node positions
    const updatedNodes = localNodes.map(node => {
      const pos = typePositions.get(node.id);
      if (!pos) return node;
      
      return {
        ...node,
        position: pos,
        data: {
          ...node.data,
          position_x: pos.x,
          position_y: pos.y
        }
      };
    });
    
    // Update local state immediately
    setLocalNodes(updatedNodes);
    
    // Update parent state to keep GraphControlPanel in sync
    if (setNodes) {
      setNodes(updatedNodes);
    }
    
    // Save to database (debounced)
    setTimeout(async () => {
      for (const node of updatedNodes) {
        try {
          await updateNode(node.id, {
            position_x: node.position.x,
            position_y: node.position.y
          });
        } catch (error) {
          console.error('Failed to save node position:', error);
        }
      }
    }, 100);
  }, [localNodes, setLocalNodes, setNodes, updateNode]);

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
        // Local state will sync automatically via useEffect
      } catch (error) {
        console.error('Failed to remove connection:', error);
      }
    }
  }, [selectedNode, localEdges, deleteEdge]);

  const handleNodeClick = useCallback((event, node) => {
    if (event.button === 0) {
      // Deep clone the node to preserve its data independently
      const nodeCopy = JSON.parse(JSON.stringify(node));
      setSelectedNode(nodeCopy);
      setSideDrawerOpen(true);
    }
  }, []);

  const handleNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Estimated menu dimensions (you can adjust these based on your actual menu size)
    const menuWidth = 180;
    const menuHeight = 250; // Approximate height with all menu items
    
    // Initial position from mouse click
    let x = event.clientX;
    let y = event.clientY;
    
    // Adjust horizontal position if menu would go off right edge
    if (x + menuWidth > viewportWidth) {
      x = viewportWidth - menuWidth - 10; // 10px padding from edge
    }
    
    // Adjust vertical position if menu would go off bottom edge
    if (y + menuHeight > viewportHeight) {
      y = viewportHeight - menuHeight - 10; // 10px padding from edge
    }
    
    // Ensure menu doesn't go off left edge
    if (x < 10) {
      x = 10; // 10px padding from left edge
    }
    
    // Ensure menu doesn't go off top edge
    if (y < 10) {
      y = 10; // 10px padding from top edge
    }
    
    setContextMenu({
      visible: true,
      x,
      y,
      node,
    });
  }, []);

  const handleCloseSideDrawer = useCallback(() => {
    setSideDrawerOpen(false);
    
    setLocalNodes((nds) =>
      nds.map((n) => ({ ...n, className: '' }))
    );
  }, [setLocalNodes]);

  // Close context menu on click outside
  useEffect(() => {
    if (!contextMenu.visible) return;
    function handleClick(e) {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu((cm) => ({ ...cm, visible: false }));
        setSubmenuVisible(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [contextMenu.visible]);

  // Close context menu on Escape key
  useEffect(() => {
    if (!contextMenu.visible) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setContextMenu((cm) => ({ ...cm, visible: false }));
        setSubmenuVisible(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [contextMenu.visible]);

  // Close context menu on window blur
  useEffect(() => {
    if (!contextMenu.visible) return;
    function handleBlur() {
      setContextMenu((cm) => ({ ...cm, visible: false }));
      setSubmenuVisible(false);
    }
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [contextMenu.visible]);

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
      setContextMenu({ visible: false, x: 0, y: 0, node: null });
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
    setContextMenu({ visible: false, x: 0, y: 0, node: null });
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

  // Delayed left position for controls
  const [controlsLeft, setControlsLeft] = useState((isCollapsed ? 0 : panelWidth) + (sidebarWidth || 64) + 16 - 60);
  useEffect(() => {
    const delay = 300; // ms
    const newLeft = (isCollapsed ? 0 : panelWidth) + (sidebarWidth || 64) + 16 - 60;
    const timeout = setTimeout(() => {
      setControlsLeft(newLeft);
    }, delay);
    return () => clearTimeout(timeout);
  }, [panelWidth, isCollapsed, sidebarWidth]);

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

  // Show loading state
  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading data from database...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Database Connection Error</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <p className="text-sm text-slate-500">
            For local development, use <code className="bg-slate-100 px-2 py-1 rounded">vercel dev</code> or deploy to Vercel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
       {/* Header */}
       <div className="bg-white border-b border-slate-300 px-4 py-2 flex items-center gap-4 flex-shrink-0">
          <h3 className="text-md font-semibold text-slate-800 select-none">Portfolio Overview</h3>
      </div>

      <div className="node_graph w-screen h-screen relative">
        {/* React Flow Canvas */}
        <ReactFlow 
          onNodeClick={handleNodeClick}
          onNodeContextMenu={handleNodeContextMenu}
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
          }}
          onMove={() => setContextMenu((cm) => ({ ...cm, visible: false }))}
          onNodeDragStart={() => setContextMenu((cm) => ({ ...cm, visible: false }))}
        >
          <FlowNavigator nodeIdToCenter={nodeIdToCenter} />
          <Background color="#000000" variant={BackgroundVariant.Dots} />
          {/* Controls that follow the GraphControlPanel, but inside ReactFlow for context */}
          <div
                          style={{
                position: 'absolute',
                top: 10,
                left: controlsLeft,
                zIndex: 50,
                transition: 'left 0.4s cubic-bezier(0.645, 0.045, 0.355, 1)',
              }}
          >
            <CustomControls
              locked={locked}
              onToggleLock={toggleLock}
              isPanelCollapsed={isCollapsed}
              onTogglePanel={onTogglePanel}
              onAutoLayout={handleAutoLayout}
            />
          </div>
        </ReactFlow>
        {/* Context Menu */}
        {contextMenu.visible && (
          <div
            ref={contextMenuRef}
            className="fixed bg-white border border-slate-300 rounded-lg shadow-lg py-2 px-2 text-left min-w-[180px] w-auto z-[9999]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            
            <div 
              className="py-2 px-3 hover:bg-slate-100 hover:rounded-md cursor-pointer text-md" 
              onClick={() => {
                setContextMenu((cm) => ({ ...cm, visible: false }));
                setSubmenuVisible(false);
              }}
            >
              Edit
            </div>
            
            <div 
              className="py-2 px-3 hover:bg-slate-100 hover:rounded-md cursor-pointer text-md" 
              onClick={() => {
                setContextMenu((cm) => ({ ...cm, visible: false }));
                setSubmenuVisible(false);
                onOpenNewItemModal && onOpenNewItemModal(contextMenu.node?.id);
              }}
            >
              New Connection
            </div>
            
            <div 
              className="py-2 px-3 hover:bg-slate-100 hover:rounded-md cursor-pointer text-md" 
              onClick={() => {
                setContextMenu((cm) => ({ ...cm, visible: false }));
                setSubmenuVisible(false);
              }}
            >
              Share
            </div>
            
            <div 
              className="py-2 px-3 hover:bg-slate-100 hover:rounded-md cursor-pointer text-md relative flex items-center justify-between" 
              onMouseEnter={showSubmenu}
              onMouseLeave={hideSubmenu}
            >
              Change Type
              <span className="text-slate-400 ml-2">→</span>
              
              {/* Type Submenu */}
              {submenuVisible && (
                <div 
                  className="absolute left-full top-0 -ml-1 bg-white border border-slate-300 rounded-lg shadow-lg py-2 px-2 min-w-[200px] z-[10000]"
                  onMouseEnter={cancelHideSubmenu}
                  onMouseLeave={hideSubmenu}
                >
                  {availableNodeTypes.map((type) => (
                    <div
                      key={type}
                      className={`py-2 px-3 hover:bg-slate-100 hover:rounded-md cursor-pointer text-sm flex items-center ${
                        contextMenu.node?.data?.type === type ? 'bg-blue-50 text-blue-700' : ''
                      }`}
                      onClick={() => handleNodeTypeChange(contextMenu.node?.id, type)}
                    >
                      {/* Icon for each type */}
                      <span className="mr-2 flex-shrink-0">
                        {type === 'Opportunity' && <IconRecharging className="w-4 h-4 text-orange-500" />}
                        {type === 'Product' && <IconBox className="w-4 h-4 text-purple-500" />}
                        {type === 'Data Asset' && <IconLayersSelected className="w-4 h-4 text-blue-500" />}
                        {type === 'Data Source' && <IconDatabase className="w-4 h-4 text-green-500" />}
                      </span>
                      
                   
                      
                      {/* Type name */}
                      <span className="flex-1">{type}</span>
                      
                      {/* Check mark for current selection */}
                      {contextMenu.node?.data?.type === type && (
                        <IconCheck className="ml-auto text-blue-600 flex-shrink-0 w-4 h-4" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div 
              className="py-2 px-3 text-red-500 hover:bg-red-50 hover:rounded-md cursor-pointer text-md" 
              onClick={() => handleDeleteNode(contextMenu.node)}
            >
              Delete
            </div>
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

    </div>
  );
}