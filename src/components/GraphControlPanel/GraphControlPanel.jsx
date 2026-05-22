import React, { useRef, useState, useMemo } from 'react';
import './GraphControlPanel.css';

import GraphControlPanel_Action from './GraphControlPanel_Action';
import GCPActionFilterSwitch from './GraphControlPanel_Filter_Action';

import {
  IconLayersSelected,
  IconDatabase,
  IconBox,
  IconBrandUnity,
  IconRecharging,
  IconX,
} from '@tabler/icons-react';

const TYPE_ICON_CLASS = {
  Opportunity: 'gcp-list__head-icon--opportunity',
  Product: 'gcp-list__head-icon--product',
  'Data Asset': 'gcp-list__head-icon--data-asset',
  'Data Source': 'gcp-list__head-icon--data-source',
};

const TYPE_ICONS = {
  Opportunity: IconRecharging,
  Product: IconBox,
  'Data Asset': IconLayersSelected,
  'Data Source': IconDatabase,
};

export default function GraphControlPanel({
  onFilterChange,
  nodes,
  onNodeListSelect,
  selectedNodeId = null,
}) {
  const handleFilterChange = (label, checked) => {
    onFilterChange(label, checked);
  };

  const nodesByType = useMemo(() => {
    const map = {};
    if (!nodes || !Array.isArray(nodes)) return map;

    nodes.forEach((node) => {
      const type = node?.data?.type;
      const name = node?.data?.name;
      if (!type || !name) return;
      if (!map[type]) map[type] = [];
      map[type].push({ id: node.id, name });
    });
    return map;
  }, [nodes]);

  const nodeTypeOrder = ['Opportunity', 'Product', 'Data Asset', 'Data Source'];
  const nodeTypes = nodeTypeOrder.filter((type) => nodesByType[type]);

  const [search, setSearch] = useState('');

  const filteredNodesByType = useMemo(() => {
    if (!search.trim()) return nodesByType;
    const query = search.toLowerCase();
    const filtered = {};
    Object.entries(nodesByType).forEach(([type, entries]) => {
      const typeMatches = type.toLowerCase().includes(query);
      const matching = entries.filter((e) => e.name.toLowerCase().includes(query));
      if (typeMatches || matching.length > 0) {
        filtered[type] = typeMatches ? entries : matching;
      }
    });
    return filtered;
  }, [nodesByType, search]);

  const filteredNodeTypes = nodeTypeOrder.filter((type) => filteredNodesByType[type]);

  const searchInputRef = useRef(null);
  const containerRef = useRef(null);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearch('');
      searchInputRef.current?.blur();
    }
  };

  const nodeCount = nodes?.length ?? 0;

  return (
    <div
      ref={containerRef}
      className="graph_control_panel h-full w-full flex flex-col border-r border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-panel-bg)_72%,transparent)] backdrop-blur-md relative text-[var(--app-text)]"
      style={{ overflow: 'hidden' }}
    >
      <div className="gcp-search-wrap">
        <div className="relative w-full">
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Search nodes"
            className="gcp-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            aria-label="Search nodes"
          />
          {search ? (
            <button
              type="button"
              className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-muted)] rounded p-1 transition-colors"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              <IconX className="w-4 h-4" stroke={2.5} />
            </button>
          ) : null}
        </div>

        {nodeTypes.length > 0 ? (
          <div className="gcp-filters">
            <p className="gcp-filters__label">Display</p>
            {nodeTypes.map((type) => (
              <GCPActionFilterSwitch key={type} label={type} onChange={handleFilterChange} />
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto w-full panel-content">
        <ul className="gcp-list node_index_list">
          {!nodes || nodes.length === 0 ? (
            <li className="gcp-list__empty">No nodes yet</li>
          ) : filteredNodeTypes.length === 0 ? (
            <li className="gcp-list__empty flex flex-wrap items-center gap-2">
              <span>No results</span>
              <button
                type="button"
                className="text-[var(--app-accent)] hover:text-[var(--app-accent-hover)] text-sm font-medium"
                onClick={() => setSearch('')}
              >
                Clear
              </button>
            </li>
          ) : (
            filteredNodeTypes.map((type) => {
              const Icon = TYPE_ICONS[type] ?? IconBrandUnity;
              const iconClass = TYPE_ICON_CLASS[type] ?? '';
              const entries = filteredNodesByType[type];

              return (
                <li key={type} className="gcp-list__section">
                  <h3 className="gcp-list__head">
                    <Icon className={`gcp-list__head-icon ${iconClass}`} stroke={2} />
                    <span>
                      {type} ({entries.length})
                    </span>
                  </h3>
                  {entries.map(({ id, name }) => (
                    <div className="gcp-list__item-wrap" key={id}>
                      <GraphControlPanel_Action
                        title={name}
                        isSelected={selectedNodeId === id}
                        onClick={() => onNodeListSelect?.(id)}
                      />
                    </div>
                  ))}
                </li>
              );
            })
          )}
        </ul>
      </div>

      {nodeCount > 0 ? (
        <footer className="shrink-0 border-t border-[var(--app-border-subtle)] px-4 py-2">
          <p className="gcp-footer-meta m-0 text-[0.625rem] uppercase tracking-wider text-[var(--app-text-muted)]">
            {nodeCount} node{nodeCount === 1 ? '' : 's'} · {nodeTypes.length} type
            {nodeTypes.length === 1 ? '' : 's'}
          </p>
        </footer>
      ) : null}
    </div>
  );
}
