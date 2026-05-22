import React, { useCallback, useMemo, useState } from 'react';
import { IconChevronDown, IconDotsVertical } from '@tabler/icons-react';
import GraphControlPanel from '../GraphControlPanel/GraphControlPanel';
import SidePanelPlaceholder from '../GraphControlPanel/SidePanelPlaceholder';
import SideDrawer from '../BaseComponents/SideDrawer';
import Chip from '../BaseComponents/Chip';
import { getGenderAvatar } from '../../utils/avatarUtils';
import './PortfolioListView.css';

const LIST_GROUPS = [
  { type: 'Opportunity', title: 'Opportunities' },
  { type: 'Product', title: 'Data Products' },
  { type: 'Data Asset', title: 'Data Assets' },
  { type: 'Data Source', title: 'Data Sources' },
];

export default function PortfolioListView({
  filters = [],
  dataHook,
  panelWidth = 340,
  isCollapsed = false,
  onTogglePanel,
  onFilterChange,
  onNodeListSelect,
  activeNav = 'portfolio',
}) {
  const { nodes, edges, updateNode, deleteEdge, setNodes } = dataHook;

  const [selectedNode, setSelectedNode] = useState(null);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const filteredNodes = useMemo(
    () => (nodes ?? []).filter((node) => !filters.includes(node.data?.type)),
    [nodes, filters]
  );

  const groupedNodes = useMemo(() => {
    const map = {};
    for (const group of LIST_GROUPS) {
      map[group.type] = [];
    }
    for (const node of filteredNodes) {
      const type = node.data?.type;
      if (map[type]) {
        map[type].push(node);
      }
    }
    for (const type of Object.keys(map)) {
      map[type].sort((a, b) =>
        (a.data?.name || '').localeCompare(b.data?.name || '')
      );
    }
    return map;
  }, [filteredNodes]);

  const selectedNodeId = selectedNode?.id;

  const parentNodes = useMemo(() => {
    if (!selectedNodeId) return [];
    const parentIds = (edges ?? [])
      .filter((e) => e.target === selectedNodeId)
      .map((e) => e.source);
    return (nodes ?? []).filter((n) => parentIds.includes(n.id));
  }, [edges, nodes, selectedNodeId]);

  const childNodes = useMemo(() => {
    if (!selectedNodeId) return [];
    const childIds = (edges ?? [])
      .filter((e) => e.source === selectedNodeId)
      .map((e) => e.target);
    return (nodes ?? []).filter((n) => childIds.includes(n.id));
  }, [edges, nodes, selectedNodeId]);

  const handleRowClick = useCallback((node) => {
    const nodeCopy = JSON.parse(JSON.stringify(node));
    setSelectedNode(nodeCopy);
    setSideDrawerOpen(true);
    onNodeListSelect?.(node.id);
  }, [onNodeListSelect]);

  const handleCloseSideDrawer = useCallback(() => {
    setSideDrawerOpen(false);
  }, []);

  const handleNodeTitleChange = useCallback(
    async (id, newTitle) => {
      try {
        setNodes((nds) => {
          const updated = nds.map((node) =>
            node.id === id
              ? { ...node, data: { ...node.data, name: newTitle } }
              : node
          );
          if (selectedNode?.id === id) {
            const updatedNode = updated.find((n) => n.id === id);
            setSelectedNode(updatedNode ? JSON.parse(JSON.stringify(updatedNode)) : null);
          }
          return updated;
        });
        await updateNode(id, { data: { name: newTitle } });
      } catch (error) {
        console.error('Failed to update node title:', error);
      }
    },
    [updateNode, setNodes, selectedNode?.id]
  );

  const handleNodeRiskChange = useCallback(
    async (id, newRisk) => {
      try {
        setNodes((nds) => {
          const updated = nds.map((node) =>
            node.id === id
              ? { ...node, data: { ...node.data, risk: newRisk } }
              : node
          );
          if (selectedNode?.id === id) {
            const updatedNode = updated.find((n) => n.id === id);
            setSelectedNode(updatedNode ? JSON.parse(JSON.stringify(updatedNode)) : null);
          }
          return updated;
        });
        await updateNode(id, { data: { risk: newRisk } });
      } catch (error) {
        console.error('Failed to update node risk:', error);
      }
    },
    [updateNode, setNodes, selectedNode?.id]
  );

  const handleRemoveConnection = useCallback(
    async (targetNodeId) => {
      if (!selectedNode) return;
      const edge = (edges ?? []).find(
        (e) =>
          (e.source === selectedNode.id && e.target === targetNodeId) ||
          (e.source === targetNodeId && e.target === selectedNode.id)
      );
      if (!edge) return;
      try {
        await deleteEdge(edge.id);
      } catch (error) {
        console.error('Failed to remove connection:', error);
      }
    },
    [selectedNode, edges, deleteEdge]
  );

  const toggleGroup = (type) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const hasAnyNodes = LIST_GROUPS.some(
    (group) => (groupedNodes[group.type] ?? []).length > 0
  );

  return (
    <div className="portfolio-list-view h-full w-full relative">
      <div
        className="fixed left-16 top-10 z-40 flex flex-row h-[calc(100vh-2.5rem)] pointer-events-none"
        style={{
          transform: isCollapsed ? `translateX(-${panelWidth}px)` : 'translateX(0)',
          transition: 'transform 0.4s cubic-bezier(0.645, 0.045, 0.355, 1)',
        }}
      >
        <div
          className="h-full flex-shrink-0 overflow-hidden pointer-events-auto"
          style={{
            width: panelWidth,
            pointerEvents: isCollapsed ? 'none' : 'auto',
          }}
        >
          {activeNav === 'portfolio' ? (
            <GraphControlPanel
              onFilterChange={onFilterChange}
              nodes={nodes}
              onNodeListSelect={(id) => {
                const node = nodes.find((n) => n.id === id);
                if (node) handleRowClick(node);
              }}
              selectedNodeId={selectedNodeId ?? null}
            />
          ) : (
            <SidePanelPlaceholder activeNav={activeNav} />
          )}
        </div>
      </div>

      <div
        className="portfolio-list-view__scroll fixed top-10 bottom-0 overflow-y-auto hide-scrollbar"
        style={{
          left: isCollapsed ? '4rem' : `calc(4rem + ${panelWidth}px)`,
          right: sideDrawerOpen ? '420px' : 0,
          transition: 'left 0.4s cubic-bezier(0.645, 0.045, 0.355, 1), right 0.25s ease',
        }}
      >
        <div className="portfolio-list-view__intro">
          <h1 className="portfolio-list-view__title">Portfolio Overview</h1>
          <p className="portfolio-list-view__subtitle">
            Browse opportunities, data products, and assets in a structured list. Select a row
            to open details, or switch back to graph view for the visual explorer.
          </p>
        </div>

        {hasAnyNodes ? (
          LIST_GROUPS.map((group) => {
            const sectionNodes = groupedNodes[group.type] ?? [];
            if (sectionNodes.length === 0) return null;

            const isCollapsed = collapsedGroups[group.type];

            return (
              <section key={group.type} className="portfolio-list-view__section">
                <button
                  type="button"
                  className="portfolio-list-view__section-header"
                  onClick={() => toggleGroup(group.type)}
                  aria-expanded={!isCollapsed}
                >
                  <IconChevronDown
                    size={18}
                    stroke={2}
                    className={`portfolio-list-view__section-chevron ${
                      isCollapsed ? 'portfolio-list-view__section-chevron--collapsed' : ''
                    }`}
                  />
                  <span className="portfolio-list-view__section-title">
                    {group.title}
                    <span className="portfolio-list-view__section-count">
                      ({sectionNodes.length})
                    </span>
                  </span>
                </button>

                {!isCollapsed ? (
                  <ul className="portfolio-list-view__rows">
                    {sectionNodes.map((node) => {
                      const risk = (node.data?.risk || 'notset').toLowerCase();
                      const isSelected = selectedNodeId === node.id;
                      const avatarSrc = getGenderAvatar(node.data?.creatorUser);

                      return (
                        <li key={node.id}>
                          <button
                            type="button"
                            className={`portfolio-list-view__row ${
                              isSelected ? 'portfolio-list-view__row--selected' : ''
                            }`}
                            onClick={() => handleRowClick(node)}
                          >
                            <Chip
                              type={node.data?.type}
                              size="xs"
                              className="portfolio-list-view__row-chip"
                            />
                            <span
                              className={`portfolio-list-view__risk portfolio-list-view__risk--${risk}`}
                              title={`Risk: ${risk}`}
                              aria-hidden
                            />
                            <span className="portfolio-list-view__row-name">
                              {node.data?.name}
                            </span>
                            <span className="portfolio-list-view__row-meta">
                              {node.data?.potential ?? 0}% potential
                            </span>
                            <img
                              src={avatarSrc}
                              alt=""
                              className="portfolio-list-view__row-avatar"
                            />
                            <span className="portfolio-list-view__row-menu" aria-hidden>
                              <IconDotsVertical size={18} stroke={1.75} />
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </section>
            );
          })
        ) : (
          <p className="portfolio-list-view__empty-all">
            No nodes match the current filters. Adjust filters in the left panel.
          </p>
        )}
      </div>

      <div className="absolute top-0 right-0 z-50">
        <SideDrawer
          selectedNode={selectedNode}
          isOpen={sideDrawerOpen}
          onClose={handleCloseSideDrawer}
          parentNodes={parentNodes}
          childNodes={childNodes}
          graphNodes={nodes}
          onTitleChange={handleNodeTitleChange}
          onRiskChange={handleNodeRiskChange}
          onRemoveConnection={handleRemoveConnection}
        />
      </div>
    </div>
  );
}
