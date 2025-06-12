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

import CustomNode from './CustomNode.jsx'; 
import SideDrawer from '../BaseComponents/SideDrawer';
import CustomEdge from './CustomEdge.jsx';
import GraphControlPanel from '../GraphControlPanel/GraphControlPanel';
import FixedFooter from '../BaseComponents/FixedFooter';

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

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

export default function NodeGraph({ filters, nodeIdToCenter, panelWidth = 320, isCollapsed = false, sidebarWidth = 64 }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false); 
  const [openMenu, setOpenMenu] = useState({ nodeId: null, pos: { x: 0, y: 0 } });
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, node: null });
  const contextMenuRef = useRef(null);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, type: 'custom' }, eds)), []);

  const handleNodeClick = useCallback((event, node) => {
    if (event.button === 0) {
      setSelectedNode(node);
      setSideDrawerOpen(true);
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? { ...n, className: 'highlighted' }
            : { ...n, className: '' }
        )
      );
    }
  }, []);

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
    
    setNodes((nds) =>
      nds.map((n) => ({ ...n, className: '' }))
    );
  }, []);

  // Close context menu on click outside
  useEffect(() => {
    if (!contextMenu.visible) return;
    function handleClick(e) {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu((cm) => ({ ...cm, visible: false }));
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
    }
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [contextMenu.visible]);

  // Filter nodes dynamically based on the filters prop
  const filteredNodes = nodes.filter(node => !filters.includes(node.data.type));

  // Compute connected nodes for the selected node
  const selectedNodeId = selectedNode?.id;
  const connectedNodeIds = edges
    .filter(
      edge => edge.source === selectedNodeId || edge.target === selectedNodeId
    )
    .map(edge =>
      edge.source === selectedNodeId ? edge.target : edge.source
    );
  const connectedNodes = nodes.filter(node => connectedNodeIds.includes(node.id));

  // Compute parent and child nodes for the selected node
  const parentNodeIds = edges
    .filter(edge => edge.target === selectedNodeId)
    .map(edge => edge.source);
  const parentNodes = nodes.filter(node => parentNodeIds.includes(node.id));

  const childNodeIds = edges
    .filter(edge => edge.source === selectedNodeId)
    .map(edge => edge.target);
  const childNodes = nodes.filter(node => childNodeIds.includes(node.id));

  // Helper component to center the view on a node
  function FlowNavigator({ nodeIdToCenter }) {
    const reactFlow = useReactFlow();
    useEffect(() => {
      if (nodeIdToCenter) {
        const node = reactFlow.getNodes().find(n => n.id === nodeIdToCenter);
        if (node) {
          reactFlow.setCenter(node.position.x, node.position.y, { zoom: 0.8, duration: 1200 });
        }
      }
    }, [nodeIdToCenter, reactFlow]);
    return null;
  }

  // Add this handler inside NodeGraph
  const handleNodeTitleChange = (id, newTitle) => {
    setNodes(nds => {
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
  };

  return (
    <div>
      <div className="node_graph w-screen h-screen">
        {/* React Flow Canvas */}
        <ReactFlow 
          onNodeClick={handleNodeClick}
          onNodeContextMenu={handleNodeContextMenu}
          style={styles} 
          nodes={filteredNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{
            padding: 2,
          }}
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
          <Controls position="none" />
        </ReactFlow>
        {/* Context Menu */}
        {contextMenu.visible && (
          <div
            ref={contextMenuRef}
            className="fixed bg-white border border-slate-300 rounded-lg  shadow-lg py-2 px-2 text-left min-w-[180px] w-auto z-[9999]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            
            <div className="py-2 px-3 hover:bg-slate-100 hover:rounded-md cursor-pointer text-md" onClick={() => setContextMenu((cm) => ({ ...cm, visible: false }))}>Edit</div>
            <div className="py-2 px-3 hover:bg-slate-100 hover:rounded-md cursor-pointer text-md" onClick={() => setContextMenu((cm) => ({ ...cm, visible: false }))}>New Connection</div>
            <div className="py-2 px-3 hover:bg-slate-100 hover:rounded-md cursor-pointer text-md" onClick={() => setContextMenu((cm) => ({ ...cm, visible: false }))}>Share</div>
            <div className="py-2 px-3 hover:bg-slate-100 hover:rounded-md cursor-pointer text-md" onClick={() => setContextMenu((cm) => ({ ...cm, visible: false }))}>Change Type</div>
            <div className="py-2 px-3 text-red-500 hover:bg-red-50 hover:rounded-md cursor-pointer text-md" onClick={() => setContextMenu((cm) => ({ ...cm, visible: false }))}>Delete</div>
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
        />
      </div>
      
    </div>
  );
}