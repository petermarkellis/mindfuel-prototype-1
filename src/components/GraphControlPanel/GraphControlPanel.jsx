import React, { useRef, useState, useMemo } from "react";
import "./GraphControlPanel.css";

import GCPActionButton from "./GraphControlPanel_Action";
import GCPActionFilterSwitch from "./GraphControlPanel_Filter_Action";

import { IconAdjustmentsHorizontal, IconLayersSelected, IconDatabase, IconBox, IconBrandUnity, IconRecharging, IconX } from '@tabler/icons-react';

export default function GraphControlPanel({ onFilterChange, nodes, onNodeListSelect }) {
  const handleFilterChange = (label, checked) => {
    onFilterChange(label, checked);
  };

  // Group node names by type
  const nodesByType = useMemo(() => {
    const map = {};
    if (!nodes || !Array.isArray(nodes)) {
      console.log('GraphControlPanel: No nodes or not array', nodes);
      return map;
    }

    console.log('GraphControlPanel: Processing', nodes.length, 'nodes');
    nodes.forEach(node => {
      const type = node?.data?.type;
      const name = node?.data?.name;
      if (!type || !name) {
        console.log('GraphControlPanel: Skipping node without type/name', node);
        return;
      }
      if (!map[type]) map[type] = [];
      map[type].push(name);
    });
    return map;
  }, [nodes]);

  // Define the desired order for node types
  const nodeTypeOrder = ['Opportunity', 'Product', 'Data Asset', 'Data Source'];
  const nodeTypes = nodeTypeOrder.filter(type => nodesByType[type]);

  const [search, setSearch] = useState("");

  // Group node names by type, filtered by search
  const filteredNodesByType = useMemo(() => {
    if (!search.trim()) return nodesByType;
    const query = search.toLowerCase();
    const filtered = {};
    Object.entries(nodesByType).forEach(([type, names]) => {
      // Show type if type matches or any name matches
      const typeMatches = type.toLowerCase().includes(query);
      const matchingNames = names.filter(name => name.toLowerCase().includes(query));
      if (typeMatches || matchingNames.length > 0) {
        filtered[type] = typeMatches ? names : matchingNames;
      }
    });
    return filtered;
  }, [nodesByType, search]);

  const filteredNodeTypes = nodeTypeOrder.filter(type => filteredNodesByType[type]);

  const listitems = useRef(null);
  const listcontainer = useRef(null);
  const filterscontainer = useRef(null);
  const filteritems = useRef(null);
  const searchInputRef = useRef(null);
  const containerRef = useRef(null);


  // Handler to clear search on Escape key
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearch("");
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }
  };

  return (
    <div
      ref={el => {
        listcontainer.current = el;
        containerRef.current = el;
      }}
      className="graph_control_panel h-full w-full flex flex-col border-r border-[var(--app-border)] bg-[var(--app-panel-bg)]/60 backdrop-blur-md relative text-[var(--app-text)]"
      style={{ 
        overflow: 'hidden' // Prevent content from showing when collapsed
      }}
    >
      {/* Sticky search box */}
      <div className="sticky top-0 z-50 bg-[var(--app-panel-bg)]/90 backdrop-blur-md border-b border-[var(--app-border-subtle)] mb-2 w-full">
        <div className="relative w-full">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search"
            className="px-4 py-2 border-b border-[var(--app-border)] w-full pr-10 bg-transparent text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          {search &&  (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-muted)] rounded p-1 transition-colors"
              onClick={() => setSearch("")}
              tabIndex={-1}
              aria-label="Clear search"
            >
              <IconX className="w-5 h-5" stroke={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* Main scrollable content: node list and filter settings together */}
      <div className="flex-1 min-h-0 overflow-y-auto w-full panel-content">
        
        <ul ref={listitems} className="node_index_list flex flex-col items-start gap-4 p-4">
          {!nodes || nodes.length === 0 ? (
            <li className="flex flex-row items-start w-full px-4 py-2">
              <span className="text-[var(--app-text-muted)] font-medium select-none text-left">No nodes yet</span>
            </li>
          ) : filteredNodeTypes.length === 0 ? (
            <li className="flex flex-row items-start w-full px-4 py-2">
              <span className="text-[var(--app-text-muted)] font-medium select-none text-left">No results found</span>
              <button
                className="px-2 py-0.5 border border-[var(--app-border)] text-[var(--app-text-muted)] rounded hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-text)] transition text-sm font-medium select-none"
                onClick={() => setSearch("")}
              >Clear
              </button>
            </li>
          ) : (
            filteredNodeTypes.map(type => (
              <li key={type} className="w-full flex flex-col items-start px-4">
                <h3 className="text-md mt-4 mb-2 text-[var(--app-text-muted)] truncate font-medium flex flex-row items-center gap-1 select-none">
                  {type === 'Opportunity' && <IconRecharging className="w-6 h-6 text-orange-500" />}
                  {type === 'Product' && <IconBox className="w-6 h-6 text-purple-500" />}
                  {type === 'Data Asset' && <IconLayersSelected className="w-6 h-6 text-blue-500" />}
                  {type === 'Data Source' && <IconDatabase className="w-6 h-6 text-green-500" />}
                  {type} ({filteredNodesByType[type].length})
                </h3>
                {filteredNodesByType[type].map(name => {
                  const node = nodes.find(n => n.data.name === name && n.data.type === type);
                  return (
                    <span className="w-full text-left pl-6" key={name} ><GCPActionButton className="w-full text-left pl-6 truncate"  title={name} onClick={() => node && onNodeListSelect && onNodeListSelect(node.id)} /></span>
                  );
                })}
              </li>
            ))
          )}
        </ul>
        <div className="w-full h-1 border-b border-[var(--app-border)] mt-4"></div>
        {/* Display Settings filter block, now part of the main scrollable area */}
        <ul ref={filteritems} className="w-full flex flex-col items-start pt-6 pb-16 px-6 gap-2">
          <li><h3 className="text-md text-[var(--app-text-muted)] truncate font-medium flex flex-row items-start gap-1 select-none">
            <IconAdjustmentsHorizontal className="w-6 h-6" />Display Settings</h3></li>
          {nodeTypes.map(type => (
            <li className="w-full flex flex-row items-start text-left pl-7" key={type}>
              <GCPActionFilterSwitch label={type} onChange={handleFilterChange} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
