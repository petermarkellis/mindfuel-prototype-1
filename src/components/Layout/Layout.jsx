import React, { useState } from 'react';
import SideBar from '../SideBar/SideBar'
import GraphControlPanel from '../GraphControlPanel/GraphControlPanel'
import NodeGraph, { initNodes } from '../NodeGraph/NodeGraph'
import './Layout.css'

export default function Layout({ children }) {
  const [filters, setFilters] = useState([]);
  const [nodes] = useState(initNodes);
  const [nodeIdToCenter, setNodeIdToCenter] = useState(null);

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

  return (
    <div className="layout flex flex-row shrink">
      <div className='z-40 flex flex-row'>
        <SideBar />
        <GraphControlPanel onFilterChange={handleFilterChange} nodes={nodes} onNodeListSelect={handleNodeListSelect} />
      </div>
      <div className="absolute z-0">
        <NodeGraph filters={filters} nodeIdToCenter={nodeIdToCenter} />
      </div>
      <div className='z-40'>
        {children}
      </div>
    </div>
  );
}