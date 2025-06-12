import React, { useState } from 'react';
import SideBar from '../SideBar/SideBar'
import GraphControlPanel from '../GraphControlPanel/GraphControlPanel'
import NodeGraph, { initNodes } from '../NodeGraph/NodeGraph'
import './Layout.css'
import FixedFooter from '../BaseComponents/FixedFooter';


export default function Layout({ children }) {
  const [filters, setFilters] = useState([]);
  const [nodes] = useState(initNodes);
  const [nodeIdToCenter, setNodeIdToCenter] = useState(null);
  const [panelWidth, setPanelWidth] = useState(320); // default width
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [lastPanelWidth, setLastPanelWidth] = useState(320);



  const minWidth = 220;
  const maxWidth = 400;

  const handleFilterChange = (type, isChecked) => {
    setFilters((prevFilters) =>
      isChecked ? prevFilters.filter((t) => t !== type) : [...prevFilters, type]
    );
  };

  // Helper to set and then reset nodeIdToCenter
  const handleNodeListSelect = (id) => {
    setNodeIdToCenter(id);
    // Reset after a short delay to allow animation
    setTimeout(() => setNodeIdToCenter(null), 1000);
  };

  // Handler for expanding the panel from collapsed state
  const handleExpandPanel = () => {
    setPanelWidth(lastPanelWidth > minWidth ? lastPanelWidth : 320);
    setIsCollapsed(false);
    console.log('handleExpandPanel');
  };

  const handleTogglePanel = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="layout flex flex-row shrink relative">
      <SideBar isPanelCollapsed={isCollapsed} onTogglePanel={handleTogglePanel} />
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
            panelWidth={panelWidth}
            isCollapsed={isCollapsed}
          />
        </div>
        <div className='z-40'>
          {children}
        </div>
      </div>

    </div>
  );
}