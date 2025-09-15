import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  BackgroundVariant, 
  useNodesState, 
  useEdgesState, 
  MiniMap,
  addEdge, 
  Controls,
  useReactFlow
} from 'reactflow';
import html2canvas from 'html2canvas';
import { IconZoomIn, IconZoomOut, IconMaximize, IconArrowBackUp, IconLock, IconLockOpen, IconLayoutSidebarLeftExpand, IconLayoutSidebarRightExpand, IconRecharging, IconBox, IconLayersSelected, IconDatabase, IconCheck } from '@tabler/icons-react';

import CustomNode from './CustomNode.jsx'; 
import SideDrawer from '../BaseComponents/SideDrawer';
import CustomEdge from './CustomEdge.jsx';
import GraphControlPanel from '../GraphControlPanel/GraphControlPanel';
import FixedFooter from '../BaseComponents/FixedFooter';
import { useSupabaseNodes } from '../../hooks/useSupabaseNodes';

import 'reactflow/dist/style.css';
import './NodeGraph.css';

export const Risk = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  NOTSET: 'notset',
};

export const initNodes = [
  {
    id: '1',
    type: 'custom',
    data: { 
      type: 'Opportunity',
      name: 'Enhance Customer Experience',
      description: 'Drive satisfaction and loyalty by leveraging comprehensive data insights to deliver personalized experiences and support, ensuring each interaction resonates with customers on a deeper level and strengthens their connection to the brand.',
      potential: 72,
      totalContribution: 45,
      risk: Risk.MEDIUM, 
      successPotential: 92,
      createdby: 'Peter Ellis',
      createdat: '2024-05-01',
      updatedby: 'Marius Försch',
      updatedat: '2024-06-12'
    },
    position: { x: 0, y: 50 },
  },
  {
    id: '2',
    type: 'custom',
    data: {
      type: 'Product', 
      name: 'Customer Engagement Platform',
      description: 'Empower businesses to foster meaningful interactions and support through tailored messaging, proactive engagement strategies, and personalized assistance, ultimately enhancing customer satisfaction and loyalty.',
      potential: 88,
      totalContribution: 45,
      risk: Risk.LOW, 
      successPotential: 92,
      createdby: 'Peter Ellis',
      createdat: '2024-05-01',
      updatedby: 'Marius Försch',
      updatedat: '2024-06-12'
    },
    position: { x: -350, y: 450 },
  },
  {
    id: '3',
    type: 'custom',
    data: { 
      type: 'Product', 
      name: 'Personalized Recommendation System',
      description: 'Enhance user satisfaction and retention by providing highly relevant product recommendations based on individual preferences, past behavior, and demographic information, delivering a more personalized and engaging shopping experience.',
      potential: 66,
      totalContribution: 78,
      risk: Risk.MEDIUM, 
      successPotential: 92,
      createdby: 'Peter Ellis',
      createdat: '2024-05-01',
      updatedby: 'Marius Försch',
      updatedat: '2024-06-12'
    },
    position: { x: 350, y: 450 },
  },
  {
    id: '4',
    type: 'custom',
    data: { 
      type: 'Data Asset', 
      name: 'Interaction History',
      description: 'Track and analyze customer engagement patterns across various touchpoints to optimize communication strategies, improve response times, and enhance overall customer satisfaction.',
      potential: 88,
      totalContribution: 98,
      risk: Risk.MEDIUM, 
      successPotential: 92,
      createdby: 'Peter Ellis',
      createdat: '2024-05-01',
      updatedby: '',
      updatedat: ''
    },
    position: { x: -240, y: 720 },
  },
  {
    id: '5',
    type: 'custom',
    data: { 
      type: 'Data Asset', 
      name: 'Demographic Data',
      description: 'Gain valuable insights into customer demographics, such as age, gender, location, and income level, to tailor marketing campaigns, promotions, and product offerings to specific audience segments.',
      potential: 59,
      totalContribution: 87,
      risk: Risk.LOW, 
      successPotential: 92,
      createdby: 'Marcus Schwimmer',
      createdat: '2024-08-12',
      updatedby: '',
      updatedat: ''
    },
    position: { x: -245, y: 1000 },
  },
  {
    id: '6',
    type: 'custom',
    data: { 
      type: 'Data Source', 
      name: 'User Profile Data',
      description: 'Gain valuable insights into customer demographics, such as age, gender, location, and income level, to tailor marketing campaigns, promotions, and product offerings to specific audience segments.',
      potential: 32,
      totalContribution: 69,
      risk: Risk.LOW, 
      successPotential: 92,
      createdby: 'Alicia Vikander',
      createdat: '2024-06-22',
      updatedby: '',
      updatedat: ''
    },
    position: { x: -450, y: 1350 },
  },
  {
    id: '7',
    type: 'custom',
    data: { 
      type: 'Data Source', 
      name: 'User Transaction Logs',
      description: 'Gain valuable insights into customer demographics, such as age, gender, location, and income level, to tailor marketing campaigns, promotions, and product offerings to specific audience segments.',
      potential: 76,
      totalContribution: 42,
      risk: Risk.LOW, 
      successPotential: 92,
      createdby: 'Henry Cavill',
      createdat: '2024-05-01',
      updatedby: 'Genny Zöd',
      updatedat: '2024-07-05'
    },
    position: { x: 80, y: 1350 },
  },{
    id: '8',
    type: 'custom',
    data: { 
      type: 'Data Asset', 
      name: 'Platform Inventory',
      description: 'Gain valuable insights into customer demographics, such as age, gender, location, and income level, to tailor marketing campaigns, promotions, and product offerings to specific audience segments.',
      potential: 34,
      totalContribution: 56,
      risk: Risk.HIGH, 
      successPotential: 92,
      createdby: 'Peter Ellis',
      createdat: '2024-06-12',
      updatedby: 'Marius Försch',
      updatedat: '2024-06-12'
    },
    position: { x: 510, y: 850 },
  },
];

const initEdges = [
  { id: 'e1-2', source: '1', target: '2', type: 'custom' },
  { id: 'e1-3', source: '1', target: '3', type: 'custom' },
  { id: 'e1-4', source: '2', target: '4', type: 'custom' },
  { id: 'e1-5', source: '4', target: '5', type: 'custom' },
  { id: 'e1-6', source: '5', target: '6', type: 'custom' },
  { id: 'e1-7', source: '5', target: '7', type: 'custom' },

  { id: 'e1-8', source: '3', target: '8', type: 'custom' },
];

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

function CustomControls({ locked, onToggleLock, isPanelCollapsed, onTogglePanel }) {
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

export default function NodeGraph({ filters, nodeIdToCenter, nodeIdToSelect, panelWidth = 320, isCollapsed = false, sidebarWidth = 64, onTogglePanel, supabaseHook }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false); 
  const [openMenu, setOpenMenu] = useState({ nodeId: null, pos: { x: 0, y: 0 } });
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, node: null });
  const [submenuVisible, setSubmenuVisible] = useState(false);
  const submenuTimeout = useRef(null);
  const contextMenuRef = useRef(null);
  const [locked, setLocked] = useState(false);

  // Available node types for the submenu
  const availableNodeTypes = ['Opportunity', 'Product', 'Data Asset', 'Data Source'];

  // Use shared Supabase hook from Layout
  const { 
    nodes, 
    edges, 
    loading, 
    error, 
    createEdge, 
    updateNode,
    updateNodePosition,
    setNodes,
    setEdges 
  } = supabaseHook;

  // React Flow hooks for local state management
  const [localNodes, setLocalNodes, onNodesChange] = useNodesState(nodes);
  const [localEdges, setLocalEdges, onEdgesChange] = useEdgesState(edges);

  // Debounced position save to prevent flickering during drag
  const positionSaveTimeouts = useRef({});
  
  // Enhanced onNodesChange that saves position updates to database (debounced)
  const handleNodesChange = useCallback((changes) => {
    // Apply changes to local state first (immediate)
    onNodesChange(changes);
    
    // Handle position changes with debouncing
    changes.forEach((change) => {
      if (change.type === 'position' && change.position) {
        // Clear existing timeout for this node
        if (positionSaveTimeouts.current[change.id]) {
          clearTimeout(positionSaveTimeouts.current[change.id]);
        }
        
        // Set new timeout to save position after user stops dragging
        positionSaveTimeouts.current[change.id] = setTimeout(async () => {
          try {
            await updateNode(change.id, { position: change.position });
            delete positionSaveTimeouts.current[change.id];
          } catch (error) {
            console.error('Failed to save node position:', error);
          }
        }, 500); // Save 500ms after user stops moving the node
      }
    });
  }, [onNodesChange, updateNode]);

  // Sync Supabase data with local React Flow state
  useEffect(() => {
    setLocalNodes(nodes);
  }, [nodes, setLocalNodes]);

  useEffect(() => {
    setLocalEdges(edges);
  }, [edges, setLocalEdges]);

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
      const newEdge = { ...params, type: 'custom' };
      // Optimistically update local state
      setLocalEdges((eds) => addEdge(newEdge, eds));
      // Save to database
      await createEdge(newEdge);
    } catch (error) {
      console.error('Failed to create edge:', error);
      // Revert local state if database save fails
      setLocalEdges(edges);
    }
  }, [createEdge, setLocalEdges, edges]);

  const handleNodeClick = useCallback((event, node) => {
    if (event.button === 0) {
      setSelectedNode(node);
      setSideDrawerOpen(true);
      setLocalNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? { ...n, className: 'highlighted' }
            : { ...n, className: '' }
        )
      );
    }
  }, [setLocalNodes]);

  const handleNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
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
    const delay = 800; // ms
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
          <p className="text-slate-600">Loading data from Supabase...</p>
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
            Make sure your Supabase environment variables are configured correctly.
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
          fitView
          fitViewOptions={{
            padding: 2,
          }}
          connectionLineStyle={{ stroke: '#6366f1', strokeWidth: 4 }}
          className=""
          onPaneClick={() => {
            setContextMenu((cm) => ({ ...cm, visible: false }));
            setSideDrawerOpen(false);
            setNodes(nds => nds.map(n => ({ ...n, className: '' })));
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
              onClick={() => {
                setContextMenu((cm) => ({ ...cm, visible: false }));
                setSubmenuVisible(false);
              }}
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
        />
      </div>
      
    </div>
  );
}