import React, { useRef, useEffect, useState, useMemo } from "react";
import "./GraphControlPanel.css";
import gsap from "gsap";

import GCPActionButton from "./GraphControlPanel_Action";
import GCPActionFilterSwitch from "./GraphControlPanel_Filter_Action";

import { IconAdjustmentsHorizontal, IconLayersSelected, IconDatabase, IconBox, IconBrandUnity, IconRecharging, IconX } from '@tabler/icons-react';

export default function GraphControlPanel({ onFilterChange, nodes, onNodeListSelect, panelWidth, setPanelWidth, setIsCollapsed, setLastPanelWidth, minWidth, maxWidth, isCollapsed }) {
  const handleFilterChange = (label, checked) => {
    onFilterChange(label, checked);
  };

  // Group node names by type
  const nodesByType = useMemo(() => {
    const map = {};
    nodes.forEach(node => {
      const type = node.data.type;
      if (!map[type]) map[type] = [];
      map[type].push(node.data.name);
    });
    return map;
  }, [nodes]);

  const nodeTypes = Object.keys(nodesByType);

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

  const filteredNodeTypes = Object.keys(filteredNodesByType);

  const listitems = useRef(null);
  const listcontainer = useRef(null);
  const filterscontainer = useRef(null);
  const filteritems = useRef(null);
  const searchInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(null);
  const startWidthRef = useRef(null);
  const containerRef = useRef(null);

  // Drag handlers for resizing
  const handleMouseDown = (e) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = panelWidth;
    document.body.style.cursor = 'col-resize';
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e) => {
      const dx = e.clientX - startXRef.current;
      let newWidth = startWidthRef.current + dx;
      if (newWidth < minWidth) {
        setIsCollapsed(true);
        setLastPanelWidth(startWidthRef.current);
        setIsDragging(false);
        document.body.style.cursor = '';
        return;
      }
      if (newWidth > maxWidth) newWidth = maxWidth;
      setPanelWidth(newWidth);
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      setLastPanelWidth(panelWidth);
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minWidth, maxWidth, setPanelWidth, setIsCollapsed, setLastPanelWidth, panelWidth]);

  // Handler to clear search on Escape key
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearch("");
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }
  };

  // Animate panel open/close and on mount
  useEffect(() => {
    if (!containerRef.current) return;
    if (isCollapsed) {
      gsap.to(containerRef.current, {
        width: 0,
        duration: 0.4,
        ease: 'power2.inOut',
        clearProps: 'pointerEvents',
      });
    } else {
      gsap.to(containerRef.current, {
        width: panelWidth,
        duration: 0.4,
        ease: 'power2.inOut',
        clearProps: 'pointerEvents',
      });
    }
  }, [isCollapsed, panelWidth]);

  // On initial mount, slide in from width 0
  useEffect(() => {
    if (!containerRef.current) return;
    gsap.set(containerRef.current, { width: 0 });
    gsap.to(containerRef.current, {
      width: panelWidth,
      duration: 0.2,
      delay: 0.2,
      ease: 'power2.out',
    });
  }, []);

  return (
    <div
      ref={el => {
        listcontainer.current = el;
        containerRef.current = el;
      }}
      className="graph_control_panel mt-10 h-screen z-50 flex flex-col border-r border-t border-slate-300 bg-[var(--color-panel-bg)]/60  backdrop-blur-md relative"
      style={{
        minWidth: 0,
        maxWidth: maxWidth,
        pointerEvents: isCollapsed ? 'none' : 'auto',
        transition: isDragging ? 'none' : 'width 0.2s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Drag handle on the right side */}
      <div
        className="absolute right-0 top-0 h-full w-2 cursor-col-resize z-50 bg-transparent hover:bg-slate-200 transition"
        onMouseDown={handleMouseDown}
        aria-label="Resize Graph Control Panel"
      />
     

      {/* Main scrollable content: node list and filter settings together */}
      <div className="flex-1 min-h-0 overflow-y-auto w-full">

      <div className="relative mb-2 w-full">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search"
          className="px-4 py-2 border-b border-slate-300 w-full pr-10"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
        {search && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            onClick={() => setSearch("")}
            tabIndex={-1}
            aria-label="Clear search"
          >
            <IconX className="w-5 h-5" stroke={2.5} />
          </button>
        )}
      </div>
        
        <ul ref={listitems} className="node_index_list flex flex-col items-start gap-4 p-4">
          {filteredNodeTypes.length === 0 ? (
            <li className="flex flex-row items-start w-full px-4 py-2">
              <span className="text-slate-500 font-medium select-none text-left">No results found</span>
              <button
                className="px-2 py-0.5 border border-slate-600 text-slate-600 rounded hover:bg-slate-50 transition text-sm font-medium select-none"
                onClick={() => setSearch("")}
              >Clear
              </button>
            </li>
          ) : (
            filteredNodeTypes.map(type => (
              <li key={type} className="w-full flex flex-col items-start px-4">
                <h3 className="text-md mt-4 mb-2 text-slate-500 truncate font-medium flex flex-row items-center gap-1 select-none">
                  {type === 'Opportunity' && <IconRecharging className="w-6 h-6 text-orange-500" />}
                  {type === 'Product' && <IconBox className="w-6 h-6 text-purple-500" />}
                  {type === 'Data Asset' && <IconLayersSelected className="w-6 h-6 text-blue-500" />}
                  {type === 'Data Source' && <IconDatabase className="w-6 h-6 text-green-500" />}
                  {type}
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
        <div className="w-full h-1 border-b border-slate-300 mt-4"></div>
        {/* Display Settings filter block, now part of the main scrollable area */}
        <ul ref={filteritems} className="w-full flex flex-col items-start pt-6 pb-16 px-6 gap-2">
          <li><h3 className="text-md text-slate-500 truncate font-medium flex flex-row items-start gap-1 select-none">
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
