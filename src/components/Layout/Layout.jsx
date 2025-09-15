import React, { useState } from 'react';
import SideBar from '../SideBar/SideBar'
import GraphControlPanel from '../GraphControlPanel/GraphControlPanel'
import PanelToggleBox from '../GraphControlPanel/PanelToggleBox'
import NodeGraph, { initNodes } from '../NodeGraph/NodeGraph'
import { NewItemModal } from '../NewItemModal'
import './Layout.css'
import FixedFooter from '../BaseComponents/FixedFooter';
import { useSupabaseNodes } from '../../hooks/useSupabaseNodes';


export default function Layout({ children, onNavigateToInbox, onNavigateToMain }) {
  const [filters, setFilters] = useState([]);
  
  // Get nodes from Supabase - this will be shared with NodeGraph
  const supabaseHook = useSupabaseNodes();
  const { nodes } = supabaseHook;
  const [nodeIdToCenter, setNodeIdToCenter] = useState(null);
  const [nodeIdToSelect, setNodeIdToSelect] = useState(null);
  const [panelWidth, setPanelWidth] = useState(340); // default width
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [lastPanelWidth, setLastPanelWidth] = useState(340);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);



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
    console.log('handleExpandPanel');
  };

  const handleTogglePanel = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Handler for opening the new item modal
  const handleOpenNewItemModal = () => {
    setIsNewItemModalOpen(true);
  };

  // Handler for closing the new item modal
  const handleCloseNewItemModal = () => {
    setIsNewItemModalOpen(false);
  };

  // Handler for creating a new item
  const handleCreateNewItem = (itemType) => {
    // TODO: Implement node creation logic
    console.log('Creating new item:', itemType);
    // This is where you would add the new node to your graph
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
      />
    </div>
  );
}