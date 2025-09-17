import React, { useState } from 'react';
import SideBar from '../SideBar/SideBar'
import GraphControlPanel from '../GraphControlPanel/GraphControlPanel'
import PanelToggleBox from '../GraphControlPanel/PanelToggleBox'
import NodeGraph from '../NodeGraph/NodeGraph'
import { NewItemModal } from '../NewItemModal'
import './Layout.css'
import FixedFooter from '../BaseComponents/FixedFooter';
import { useSupabaseNodes } from '../../hooks/useSupabaseNodes';


export default function Layout({ children, onNavigateToInbox, onNavigateToMain }) {
  const [filters, setFilters] = useState([]);
  
  // Get nodes from Supabase - this will be shared with NodeGraph
  const supabaseHook = useSupabaseNodes();
  const { nodes, edges } = supabaseHook;
  const [nodeIdToCenter, setNodeIdToCenter] = useState(null);
  const [nodeIdToSelect, setNodeIdToSelect] = useState(null);
  const [panelWidth, setPanelWidth] = useState(340); // default width
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [lastPanelWidth, setLastPanelWidth] = useState(340);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [preSelectedConnectionId, setPreSelectedConnectionId] = useState(null);



  const minWidth = 220;
  const maxWidth = 420;

  const handleFilterChange = (type, isChecked) => {
    setFilters((prevFilters) =>
      isChecked ? prevFilters.filter((t) => t !== type) : [...prevFilters, type]
    );
  };

  // Helper to set and then reset nodeIdToCenter and nodeIdToSelect
  const handleNodeListSelect = (id) => {
    setNodeIdToCenter(id);
    setNodeIdToSelect(id);
    // Reset after a short delay to allow animation
    setTimeout(() => {
      setNodeIdToCenter(null);
      setNodeIdToSelect(null);
    }, 1000);
  };

  // Handler for expanding the panel from collapsed state
  const handleExpandPanel = () => {
    setPanelWidth(lastPanelWidth > minWidth ? lastPanelWidth : 340);
    setIsCollapsed(false);
  };

  const handleTogglePanel = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Handler for opening the new item modal
  const handleOpenNewItemModal = (connectionNodeId = null) => {
    setPreSelectedConnectionId(connectionNodeId);
    setIsNewItemModalOpen(true);
  };

  // Handler for closing the new item modal
  const handleCloseNewItemModal = () => {
    setIsNewItemModalOpen(false);
    setPreSelectedConnectionId(null); // Clear pre-selection when closing
  };

  // Map modal item types to database enum values
  const mapItemTypeToNodeType = (itemType) => {
    const typeMap = {
      'opportunity': 'Opportunity',
      'dataProduct': 'Product',
      'dataAsset': 'Data Asset',
      'dataSource': 'Data Source'
    };
    return typeMap[itemType] || itemType;
  };

  // Calculate smart position for new node
  const calculateNewNodePosition = (connectionNodeId) => {
    if (!connectionNodeId) {
      // No connection - place in center area with some randomness
      return { 
        x: 200 + (Math.random() - 0.5) * 200, 
        y: 200 + (Math.random() - 0.5) * 200 
      };
    }

    // Find the connected node
    const connectedNode = nodes.find(n => n.id === connectionNodeId);
    if (!connectedNode) {
      return { x: Math.random() * 400, y: Math.random() * 400 };
    }

    // Calculate position relative to connected node
    const baseX = connectedNode.position.x;
    const baseY = connectedNode.position.y;
    
    // Node dimensions (typical React Flow node size)
    const nodeWidth = 200;
    const nodeHeight = 100;
    
    // Minimum spacing to prevent overlap
    const minSpacing = 250;
    
    // Check if a position overlaps with any existing node
    const checkOverlap = (newX, newY) => {
      return nodes.some(node => {
        if (node.id === connectionNodeId) return false; // Skip the connected node itself
        
        const deltaX = Math.abs(node.position.x - newX);
        const deltaY = Math.abs(node.position.y - newY);
        
        // Check if nodes overlap (with some padding)
        const overlapX = deltaX < nodeWidth + 20; // 20px padding
        const overlapY = deltaY < nodeHeight + 20; // 20px padding
        
        return overlapX && overlapY;
      });
    };

    // Try positions in order of preference with collision detection
    const preferredOffsets = [
      { x: 1, y: 0 },   // right
      { x: 0, y: 1 },   // bottom  
      { x: -1, y: 0 },  // left
      { x: 0, y: -1 },  // top
      { x: 1, y: 1 },   // bottom-right
      { x: -1, y: 1 },  // bottom-left
      { x: 1, y: -1 },  // top-right
      { x: -1, y: -1 }, // top-left
      { x: 2, y: 0 },   // far right
      { x: 0, y: 2 },   // far bottom
      { x: -2, y: 0 },  // far left
      { x: 0, y: -2 },  // far top
    ];

    // Find first non-overlapping position
    for (const offset of preferredOffsets) {
      const newX = baseX + (offset.x * minSpacing);
      const newY = baseY + (offset.y * minSpacing);
      
      if (!checkOverlap(newX, newY)) {
        return { x: newX, y: newY };
      }
    }

    // Advanced fallback: spiral outward from connected node
    let radius = minSpacing;
    let attempts = 0;
    const maxAttempts = 20;
    
    while (attempts < maxAttempts) {
      // Try 8 positions around the circle at current radius
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4; // 45-degree increments
        const newX = baseX + radius * Math.cos(angle);
        const newY = baseY + radius * Math.sin(angle);
        
        if (!checkOverlap(newX, newY)) {
          return { x: newX, y: newY };
        }
      }
      
      radius += minSpacing * 0.5; // Increase radius
      attempts++;
    }

    // Final fallback: place far away from all nodes
    return {
      x: baseX + (Math.random() - 0.5) * 1000,
      y: baseY + (Math.random() - 0.5) * 1000
    };
  };

  // Generate random values for potential and contribution (temporary until proper calculation logic is implemented)
  const generateRandomMetrics = () => {
    return {
      potential: Math.floor(Math.random() * 40) + 60, // Random value between 60-100
      totalContribution: Math.floor(Math.random() * 50) + 40, // Random value between 40-90
      successPotential: Math.floor(Math.random() * 20) + 80 // Random value between 80-100
    };
  };

  // Simple risk assignment - can be made more sophisticated later
  const getDefaultRisk = () => {
    const risks = ['low', 'medium', 'high'];
    return risks[Math.floor(Math.random() * risks.length)];
  };

  // Get a random user ID (assuming users have IDs 1-10 based on our migration)
  const getRandomUserId = () => {
    return Math.floor(Math.random() * 10) + 1; // IDs 1-10
  };

  // Handler for creating a new item
  const handleCreateNewItem = async (formData) => {
    try {
      const nodeType = mapItemTypeToNodeType(formData.type);
      const metrics = generateRandomMetrics();
      const riskLevel = getDefaultRisk();
      
      const newNodeData = {
        id: `node_${Date.now()}`,
        type: 'custom',
        data: {
          type: nodeType,
          name: formData.title,
          description: formData.description || '',
          potential: metrics.potential,
          totalContribution: metrics.totalContribution,
          risk: riskLevel,
          successPotential: metrics.successPotential,
          createdby: getRandomUserId(),
          updatedby: getRandomUserId()
        },
        position: calculateNewNodePosition(formData.connectionNodeId)
      };
      
      // Create the node first
      const createdNode = await supabaseHook.createNode(newNodeData);
      
      // If a connection is specified, create an edge
      if (formData.connectionNodeId && createdNode) {
        const edgeData = {
          id: `edge_${Date.now()}`,
          source: formData.connectionNodeId,
          target: createdNode.id,
          type: 'custom'
        };
        await supabaseHook.createEdge(edgeData);
      }
      
    } catch (error) {
      console.error('Failed to create new node:', error);
      throw error; // Re-throw so modal can handle the error
    }
  };

  return (
    <div className="layout flex flex-row shrink relative">
      <SideBar 
        onOpenNewItemModal={handleOpenNewItemModal}
        onNavigateToInbox={onNavigateToInbox}
        onNavigateToMain={onNavigateToMain}
        isMainView={true}
        currentView="main"
      />
      <div className='flex flex-row relative ml-16 w-full'>
        <GraphControlPanel
          onFilterChange={handleFilterChange}
          nodes={nodes}
          onNodeListSelect={handleNodeListSelect}
          panelWidth={panelWidth}
          setPanelWidth={setPanelWidth}
          setIsCollapsed={setIsCollapsed}
          setLastPanelWidth={setLastPanelWidth}
          minWidth={minWidth}
          maxWidth={maxWidth}
          isCollapsed={isCollapsed}
        />
        
        <div className="absolute z-0">
          <NodeGraph 
            filters={filters} 
            nodeIdToCenter={nodeIdToCenter} 
            nodeIdToSelect={nodeIdToSelect}
            panelWidth={panelWidth}
            isCollapsed={isCollapsed}
            onTogglePanel={handleTogglePanel}
            supabaseHook={supabaseHook}
            onOpenNewItemModal={handleOpenNewItemModal}
          />
        </div>
        <div className='z-40'>
          {children}
        </div>
      </div>

      {/* New Item Modal */}
      <NewItemModal
        isOpen={isNewItemModalOpen}
        onClose={handleCloseNewItemModal}
        onCreateItem={handleCreateNewItem}
        nodes={nodes}
        preSelectedConnectionId={preSelectedConnectionId}
      />
    </div>
  );
}