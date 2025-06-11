import React, { useRef, useEffect, useState, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
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

  useEffect(() => {
    if (listcontainer.current) {
      gsap.set(listcontainer.current, { width: 0, padding: 0, opacity: 0 });
      gsap.set(filterscontainer.current, { width: 0, padding: 0, opacity: 0 });
      if (listitems.current) gsap.set(listitems.current.children, { y: 30, opacity: 0 });
      if (filteritems.current) gsap.set(filteritems.current.children, { y: 30, opacity: 0 });
    }
  }, [listitems]);

  useGSAP(() => {
    if (listitems.current) {
      gsap.to(listitems.current.children, {
        y: 0,
        opacity: 1,
        stagger: 0.08,
        delay: 0.5,
        ease: "power3.out"
      });
    }

    if (listcontainer.current) {
      gsap.to(listcontainer.current, {
        width: 340,
        opacity: 1,
        ease: "power3.out",
        duration: 0.8
      });
    }

    if (filterscontainer.current) {
      gsap.to(filterscontainer.current, {
        width: 340,
        opacity: 1,
        ease: "power3.out",
        duration: 1
      });
    }

    if (filteritems.current) {
      gsap.to(filteritems.current.children, {
        y: 0,
        opacity: 1,
        stagger: 0.08,
        delay: 0.5,
        ease: "power3.out"
      });
    }

  }, { scope: listcontainer });

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
    <div>
      <div ref={listcontainer} className="graph_control_panel h-screen flex flex-col border-r border-slate-300 bg-white/60 backdrop-blur-md">
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

        <ul ref={listitems} className="node_index_list flex flex-col items-start gap-4 w-full px-4 pb-2 ">
          {filteredNodeTypes.length === 0 ? (
            <li className="w-full flex flex-row items-center justify-between py-0">
              <span className="text-red-600 font-semibold">No results</span>
              <button
                className="ml-4 px-2 py-0 border border-slate-600 text-slate-600 rounded hover:bg-slate-50 transition text-sm font-medium"
                onClick={() => setSearch("")}
              >
                Clear
              </button>
            </li>
          ) : (
            filteredNodeTypes.map(type => (
              <li key={type} className="w-full flex flex-col items-start">
                <h3 className="text-md mt-4 mb-2 text-slate-500 truncate font-medium flex flex-row items-center gap-1">
                  {type === 'Opportunity' && <IconRecharging className="w-6 h-6 text-orange-500" />}
                  {type === 'Product' && <IconBox className="w-6 h-6 text-purple-500" />}
                  {type === 'Data Asset' && <IconLayersSelected className="w-6 h-6 text-blue-500" />}
                  {type === 'Data Source' && <IconDatabase className="w-6 h-6 text-green-500" />}
                  {type}
                </h3>
                {filteredNodesByType[type].map(name => {
                  const node = nodes.find(n => n.data.name === name && n.data.type === type);
                  return (
                    <span className="w-fit text-left pl-6" key={name} ><GCPActionButton className="w-fit text-left pl-6"  title={name} onClick={() => node && onNodeListSelect && onNodeListSelect(node.id)} /></span>
                  );
                })}
              </li>
            ))
          )}
        </ul>

        <div ref={filterscontainer} className="py-2 w-full border-t border-slate-300">
          <ul ref={filteritems} className="w-full flex flex-col items-start pt-6 pb-16 px-6 gap-2">
            <li><h3 className="text-md text-slate-500 truncate font-medium flex flex-row items-center gap-1"><IconAdjustmentsHorizontal className="w-6 h-6" /> Display Settings</h3></li>
            {nodeTypes.map(type => (
              <li className="w-full pl-7" key={type}>
                <GCPActionFilterSwitch label={type} onChange={handleFilterChange} />
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
