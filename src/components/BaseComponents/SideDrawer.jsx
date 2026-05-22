import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './SideDrawer.css';
import { IconCheck, IconX, IconArrowsDownUp, IconCircleMinus, IconPencil, IconTrash, IconCopy } from '@tabler/icons-react';
import Chip from './Chip';
import RiskChip from './RiskChip';
import MentionTextarea from './MentionTextarea';
import { userService, FALLBACK_USERS } from '../../lib/neon.js';
import { getGenderAvatar } from '../../utils/avatarUtils';
import { useTheme } from '../../theme/ThemeContext';
import {
  getNodeActivities,
  subscribeToNodeActivity,
  addNodeComment,
  updateNodeComment,
  deleteNodeComment,
  formatActivityTimestamp,
  formatActivityMessage,
  isUserComment,
} from '../../utils/nodeActivity';
import { formatMentionSegments } from '../../utils/mentionFormat';

const BAR_CHART_PATTERN = {
  light: "url('/barchart_bg.svg')",
  dark: "url('/barchart_bg_dark.svg')",
};

const CloseButton = ({ onClick }) => (
  <button
    type="button"
    className="absolute top-1 right-5 bg-transparent rounded-full cursor-pointer p-1 w-12 h-12 flex justify-center items-center z-[9999] hover:bg-[var(--app-surface-muted)] text-[var(--app-text)] transition-colors duration-200 pointer-events-auto"
    onClick={onClick}
    aria-label="Close panel"
  >
    <IconX stroke={2.5} className="w-[20px] h-auto" />
  </button>
);

// Function to map data type to text color class
const getColorClassForType = (type) => {
  switch (type) {
    case 'Opportunity':
      return 'text-orange-600';
    case 'Product':
    case 'Data Product':
      return 'text-purple-700';
    case 'Asset':
    case 'Data Asset':
      return 'text-blue-600';
    case 'Data Source':
    case 'Source':
      return 'text-green-800';
    default:
      return 'text-slate-400';
  }
};

// Function to map data type to text color class
const getSubtleColorClassForType = (type) => {
  switch (type) {
    case 'Opportunity':
      return 'bg-orange-50';
    case 'Product':
    case 'Data Product':
      return 'bg-purple-100';
    case 'Asset':
    case 'Data Asset':
      return 'bg-blue-100';
    case 'Data Source':
    case 'Source':
      return 'bg-green-50';
    default:
      return 'bg-slate-200';
  }
};

// Helper for risk label and color
function getRiskLabelAndColor(risk) {
  switch ((risk || '').toLowerCase()) {
    case 'low':
      return { label: 'Low', color: 'bg-green-100 text-green-700' };
    case 'medium':
      return { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' };
    case 'high':
      return { label: 'High', color: 'bg-red-100 text-red-700' };
    default:
      return { label: 'Not set', color: 'bg-slate-100 text-slate-400' };
  }
}

// Helper to format date as '03 June 2024'
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

// Helper to calculate optimal hover card position
function calculateOptimalPosition(triggerElement) {
  if (!triggerElement) return { right: true, top: false };
  
  const rect = triggerElement.getBoundingClientRect();
  const cardWidth = 220; // min-w-[220px]
  const cardHeight = 200; // Approximate height
  const margin = 16; // Safety margin
  
  // Check if there's space to the left
  const spaceLeft = rect.left;
  const spaceRight = window.innerWidth - rect.right;
  const spaceTop = rect.top;
  const spaceBottom = window.innerHeight - rect.bottom;
  
  // Determine horizontal position
  const showRight = spaceLeft < cardWidth + margin && spaceRight >= cardWidth + margin;
  
  // Determine vertical position  
  const showTop = spaceBottom < cardHeight + margin && spaceTop >= cardHeight + margin;
  
  return { right: !showRight, top: showTop };
}

// Add enum for risk options
const RISK_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'notset', label: 'Not set' },
];

const DRAWER_TABS = [
  { id: 'details', label: 'Details' },
  { id: 'connection', label: 'Connection' },
  { id: 'activity', label: 'Activity' },
  { id: 'code', label: 'Code' },
];

function serializeNodeForCode(node) {
  if (!node) return null;
  return {
    id: node.id,
    ...(node.type != null && { type: node.type }),
    position: node.position ?? { x: 0, y: 0 },
    data: node.data ?? {},
  };
}

function mapUsersForMention(rows) {
  return (rows ?? []).map((user) => ({
    id: String(user.id),
    label: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
    sublabel: user.role,
  }));
}

function mapNodesForMention(nodes) {
  return [...(nodes ?? [])]
    .map((node) => ({
      id: node.id,
      label: node.data?.name || 'Untitled',
      type: node.data?.type,
      sublabel: node.data?.type,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function resolveNodeMention(part, mentionNodes) {
  const rawFromValue = (part.value || '').replace(/^@@/, '').trim();
  const nodeMeta =
    mentionNodes.find((n) => n.label === part.nodeName) ||
    mentionNodes.find((n) => n.label === rawFromValue) ||
    mentionNodes.find((n) => part.value === `@@${n.label}`);

  return {
    nodeType: part.nodeType || nodeMeta?.type,
    nodeName: nodeMeta?.label || part.nodeName || rawFromValue,
  };
}

function renderActivityMentionPart(part, mentionNodes) {
  if (part.kind === 'node') {
    const { nodeType, nodeName } = resolveNodeMention(part, mentionNodes);

    if (nodeType && nodeName) {
      return (
        <Chip
          type={nodeType}
          name={nodeName}
          size="xs"
          truncateLabel={false}
          className="mention-node-chip"
        />
      );
    }
  }

  return (
    <span className={`mention-token mention-token--${part.kind}`}>
      {part.value}
    </span>
  );
}

const SideDrawer = ({
  selectedNode,
  isOpen,
  onClose,
  connectedNodes = [],
  parentNodes = [],
  childNodes = [],
  graphNodes = [],
  onTitleChange,
  onRiskChange,
  onRemoveConnection,
}) => {
  const { resolvedTheme } = useTheme();
  const barChartPattern = BAR_CHART_PATTERN[resolvedTheme] ?? BAR_CHART_PATTERN.light;

  const drawerRef = useRef(null);
  const contentRef = useRef([]);
  const [Potential, setPotential] = useState(0);
  const [TotalContribution, setTotalContribution] = useState(0);
  const potentialRef = useRef({ value: 0 });
  const totalContributionRef = useRef({ value: 0 });
  const potentialBarRef = useRef(null);
  const totalContributionBarRef = useRef(null);
  // Hover card state for created/updated by
  const [showCreatedCard, setShowCreatedCard] = useState(false);
  const [showUpdatedCard, setShowUpdatedCard] = useState(false);
  // Refs for hover card positioning
  const createdCardRef = useRef(null);
  const updatedCardRef = useRef(null);
  const [createdCardPosition, setCreatedCardPosition] = useState({ right: true, top: false });
  const [updatedCardPosition, setUpdatedCardPosition] = useState({ right: true, top: false });
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(selectedNode?.data?.name || "");
  const [editingRisk, setEditingRisk] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [nodeActivities, setNodeActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editDraft, setEditDraft] = useState('');
  const [mentionUsers, setMentionUsers] = useState(() => mapUsersForMention(FALLBACK_USERS));
  const [codeCopied, setCodeCopied] = useState(false);
  const copyCodeTimeoutRef = useRef(null);
  const prevIsOpen = useRef(isOpen);

  const mentionNodes = useMemo(() => mapNodesForMention(graphNodes), [graphNodes]);

  const nodeCodeJson = useMemo(() => {
    const payload = serializeNodeForCode(selectedNode);
    return payload ? JSON.stringify(payload, null, 2) : '';
  }, [selectedNode]);

  useEffect(() => {
    let cancelled = false;

    const applyUsers = (rows) => {
      const mapped = mapUsersForMention(rows);
      setMentionUsers(mapped.length > 0 ? mapped : mapUsersForMention(FALLBACK_USERS));
    };

    userService
      .getUsers()
      .then((rows) => {
        if (!cancelled) applyUsers(rows);
      })
      .catch((err) => {
        console.error('Failed to load users for mentions, using fallback:', err);
        if (!cancelled) applyUsers(FALLBACK_USERS);
      });

    return () => {
      cancelled = true;
    };
  }, []);
  const prevSelectedNodeId = useRef(selectedNode?.id);

  const nodeId = selectedNode?.id;
  const sortedActivities = [...nodeActivities].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const fetchActivities = useCallback(async () => {
    if (!nodeId) {
      setNodeActivities([]);
      return;
    }
    setActivityLoading(true);
    try {
      const items = await getNodeActivities(nodeId);
      setNodeActivities(items);
    } catch (error) {
      console.error('Failed to load activity:', error);
      setNodeActivities([]);
    } finally {
      setActivityLoading(false);
    }
  }, [nodeId]);

  useEffect(() => {
    return subscribeToNodeActivity((nodeIds) => {
      if (!nodeId || nodeIds.length === 0 || nodeIds.includes(nodeId)) {
        fetchActivities();
      }
    });
  }, [nodeId, fetchActivities]);

  useEffect(() => {
    setActiveTab('details');
    setCommentDraft('');
    setEditingCommentId(null);
    setEditDraft('');
    setCodeCopied(false);
    fetchActivities();
  }, [selectedNode?.id, fetchActivities]);

  useEffect(() => {
    return () => {
      if (copyCodeTimeoutRef.current) {
        window.clearTimeout(copyCodeTimeoutRef.current);
      }
    };
  }, []);

  const handleCopyNodeCode = useCallback(async () => {
    if (!nodeCodeJson) return;
    try {
      await navigator.clipboard.writeText(nodeCodeJson);
      setCodeCopied(true);
      if (copyCodeTimeoutRef.current) {
        window.clearTimeout(copyCodeTimeoutRef.current);
      }
      copyCodeTimeoutRef.current = window.setTimeout(() => setCodeCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy node JSON:', error);
    }
  }, [nodeCodeJson]);

  useEffect(() => {
    if (isOpen && !prevIsOpen.current) {
      // Only animate in if transitioning from closed to open
      if (drawerRef.current) {
        gsap.set(drawerRef.current, { right: '-400px', opacity: 0 });
        gsap.to(drawerRef.current, {
          duration: 0.5,
          right: 0,
          opacity: 1,
          ease: 'power2.inOut',
        });
      }
    }
    prevIsOpen.current = isOpen;
    if (!isOpen) {
      // Close the drawer (slide out) and hide the content
      if (drawerRef.current) {
        gsap.to(drawerRef.current, {
          duration: 0.4,
          right: '-400px',
          opacity: 0,
          ease: 'power2.in',
        });
      }
    }
  }, [isOpen]);

  // Separate useEffect for animating values when node changes or drawer opens
  useEffect(() => {
    if (isOpen && selectedNode && (selectedNode.id !== prevSelectedNodeId.current || !prevIsOpen.current)) {
      // Reset to 0 first
      if (potentialRef.current) {
        potentialRef.current.value = 0;
      }
      if (totalContributionRef.current) {
        totalContributionRef.current.value = 0;
      }
      setPotential(0);
      setTotalContribution(0);
      if (potentialBarRef.current) {
        gsap.set(potentialBarRef.current, { height: '0%' });
      }
      if (totalContributionBarRef.current) {
        gsap.set(totalContributionBarRef.current, { height: '0%' });
      }

      // Then animate to new values after a short delay
      setTimeout(() => {
        // Animate Potential to selectedNode.data.potential
        if (potentialRef.current && potentialBarRef.current) {
          gsap.to(potentialRef.current, {
            value: selectedNode?.data?.potential ?? 0,
            duration: 0.5,
            ease: 'power2.out',
            onUpdate: function () {
              const val = Math.round(potentialRef.current ? potentialRef.current.value : 0);
              setPotential(val);
              if (potentialBarRef.current) {
                gsap.set(potentialBarRef.current, { height: `${val}%` });
              }
            }
          });
        }
        // Animate TotalContribution to selectedNode.data.totalContribution
        if (totalContributionRef.current && totalContributionBarRef.current) {
          gsap.to(totalContributionRef.current, {
            value: selectedNode?.data?.totalContribution ?? 0,
            duration: 0.5,
            ease: 'power2.out',
            onUpdate: function () {
              const val = Math.round(totalContributionRef.current ? totalContributionRef.current.value : 0);
              setTotalContribution(val);
              if (totalContributionBarRef.current) {
                gsap.set(totalContributionBarRef.current, { height: `${val}%` });
              }
            }
          });
        }
      }, 100); // Small delay to ensure reset is visible
    }
    prevSelectedNodeId.current = selectedNode?.id;
  }, [isOpen, selectedNode?.id, selectedNode?.data?.potential, selectedNode?.data?.totalContribution]);

  useEffect(() => {
    setTitleValue(selectedNode?.data?.name || "");
  }, [selectedNode?.data?.name]);

  useEffect(() => {
    setEditingRisk(false); // Reset risk editing when node changes
  }, [selectedNode?.id]);

  const startEditing = () => setEditingTitle(true);
  const cancelEditing = () => {
    setTitleValue(selectedNode?.data?.name || "");
    setEditingTitle(false);
  };
  const commitEditing = () => {
    const newTitle = titleValue.trim();
    if (newTitle && newTitle !== selectedNode?.data?.name) {
      onTitleChange(selectedNode.id, newTitle);
      setTitleValue(newTitle);
    }
    setEditingTitle(false);
  };

  const startEditingRisk = () => setEditingRisk(true);
  const handleRiskChange = (e) => {
    const newRisk = e.target.value;
    onRiskChange(selectedNode.id, newRisk);
    setEditingRisk(false);
  };

  const handleAddComment = async () => {
    const text = commentDraft.trim();
    if (!text || !nodeId) return;
    try {
      await addNodeComment(nodeId, text);
      setCommentDraft('');
      await fetchActivities();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const startEditingComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditDraft(comment.text);
  };

  const cancelEditingComment = () => {
    setEditingCommentId(null);
    setEditDraft('');
  };

  const saveEditingComment = async () => {
    const text = editDraft.trim();
    if (!text || !nodeId || !editingCommentId) return;
    try {
      await updateNodeComment(nodeId, editingCommentId, text);
      cancelEditingComment();
      await fetchActivities();
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!nodeId) return;
    try {
      await deleteNodeComment(nodeId, commentId);
      if (editingCommentId === commentId) cancelEditingComment();
      await fetchActivities();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  if (!selectedNode) return null;

  const renderConnectionList = (heading, nodes) => (
    <div className="w-full flex flex-col gap-2 items-start">
      <h4 className="text-[var(--app-text-muted)] mb-1 font-medium text-left w-full">{heading}</h4>
      <ul className="flex flex-col gap-2 items-start w-full">
        {nodes.map((node) => (
          <li
            key={node.id}
            className="text-sm text-[var(--app-text)] flex items-center gap-2 group w-full bg-[var(--app-chrome-bg)] border border-[var(--app-border)] rounded-lg px-3 py-2 hover:border-[var(--app-border-subtle)] hover:bg-[var(--app-surface-muted)] transition-colors"
          >
            <Chip type={node?.data?.type} size="xs" className="flex-shrink-0" />
            <span className="font-bold flex-1 truncate text-left">{node?.data?.name}</span>
            {onRemoveConnection ? (
              <button
                type="button"
                onClick={() => onRemoveConnection(node.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-full p-0.5 flex-shrink-0"
                title="Remove connection"
              >
                <IconCircleMinus className="w-5 h-5" />
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );

  const renderDetailsTab = () => (
    <div className="drawer-tab-panel">
      <p className="text-md text-left leading-loose text-[var(--app-text-muted)]">
        {selectedNode?.data?.description}
      </p>

      <div className="flex flex-col gap-4 w-full">
        <div className="relative flex flex-col justify-between gap-2 bg-[var(--app-surface-muted)] border border-[var(--app-border)] rounded-md px-2 py-0 h-16 sm:h-20 md:h-24 lg:h-24 w-full items-start overflow-hidden">
          <span className="z-10 font-medium mt-2 text-[var(--app-text-muted)] bg-[var(--app-chrome-bg)]/50 rounded-lg px-1 py-0">
            Potential
          </span>
          <span className="metric-value z-10 text-lg pl-2 sm:text-xl md:text-3xl lg:text-4xl text-[var(--app-text)]">
            {Potential}%
          </span>
          <div
            ref={potentialBarRef}
            className="absolute left-0 bottom-0 w-full bg-violet-50 dark:bg-violet-950/20 border-t border-violet-400 dark:border-violet-800/35 border-dashed"
            style={{
              height: 0,
              backgroundImage: barChartPattern,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>
        <div className="relative flex flex-col justify-between gap-2 bg-[var(--app-surface-muted)] border border-[var(--app-border)] rounded-md px-2 py-0 h-16 sm:h-20 md:h-24 lg:h-24 w-full items-start overflow-hidden">
          <span className="z-10 font-medium mt-2 text-[var(--app-text-muted)] bg-[var(--app-chrome-bg)]/50 rounded-lg px-1 py-0">
            Total Contribution
          </span>
          <span className="metric-value z-10 text-lg pl-2 sm:text-xl md:text-3xl lg:text-4xl text-[var(--app-text)]">
            {TotalContribution}%
          </span>
          <div
            ref={totalContributionBarRef}
            className="absolute left-0 bottom-0 w-full bg-blue-50 dark:bg-blue-950/20 border-t border-blue-400 dark:border-blue-800/35 border-dashed"
            style={{
              height: 0,
              backgroundImage: barChartPattern,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>
      </div>

      <div className="w-full border-t border-[var(--app-border)] pt-4 flex flex-col gap-2 items-start">
        <h4 className="text-[var(--app-text-muted)] mb-2 font-medium">Node Details</h4>
        <ul className="flex flex-col gap-4 items-start text-[var(--app-text)] text-sm w-full">
          <li className="flex flex-row justify-between w-full group">
            <span className="text-[var(--app-text-muted)]">Risk:</span>
            <span className="w-auto flex flex-row items-center">
              {editingRisk ? (
                <select
                  className="ml-2 px-2 py-1 rounded border border-[var(--app-border)] bg-[var(--app-surface-muted)] text-[var(--app-text)] text-sm"
                  value={selectedNode?.data?.risk?.toLowerCase() || 'notset'}
                  onChange={handleRiskChange}
                  autoFocus
                  onBlur={() => setEditingRisk(false)}
                >
                  {RISK_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <span
                    className="ml-2 px-2 py-0.5 text-xs rounded bg-[var(--app-surface-muted)] text-[var(--app-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={startEditingRisk}
                  >
                    edit
                  </span>
                  <RiskChip
                    risk={selectedNode?.data?.risk}
                    size="sm"
                    onClick={startEditingRisk}
                    className="ml-2"
                  />
                </>
              )}
            </span>
          </li>
          {selectedNode?.data?.successPotential ? (
            <li className="flex items-center flex-row justify-between w-full">
              <span className="text-[var(--app-text-muted)]">Success Potential:</span>
              <span className="font-bold">{selectedNode?.data?.successPotential}%</span>
            </li>
          ) : null}
          {selectedNode?.data?.createdby ? (
            <li className="flex items-center flex-row justify-between w-full">
              <span className="text-[var(--app-text-muted)]">Created by:</span>
              <span
                ref={createdCardRef}
                className="font-bold flex items-center gap-1 relative"
                onMouseEnter={(e) => {
                  const position = calculateOptimalPosition(e.currentTarget);
                  setCreatedCardPosition(position);
                  setShowCreatedCard(true);
                }}
                onMouseLeave={() => setShowCreatedCard(false)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={getGenderAvatar(selectedNode?.data?.creatorUser)}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover mr-1 border border-[var(--app-border)] grayscale"
                />
                {selectedNode?.data?.createdby}
                <div
                  className={`absolute z-50 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg shadow-lg p-4 min-w-[220px] text-[var(--app-text)] transition-opacity duration-200 ${
                    showCreatedCard ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  } ${createdCardPosition.right ? 'right-full mr-2' : 'left-full ml-2'} ${
                    createdCardPosition.top ? 'bottom-full mb-2' : 'top-1/2 -translate-y-1/2'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <div className="flex flex-row items-center gap-2 justify-between w-full">
                      <img
                        src={getGenderAvatar(selectedNode?.data?.creatorUser)}
                        alt=""
                        className="w-16 h-16 rounded-full mb-2 border"
                      />
                      <span
                        className={`ml-2 px-2 py-0.5 text-md rounded-full align-middle ${
                          selectedNode?.data?.creatorUser?.availability === 'online'
                            ? 'bg-green-50 text-green-500 dark:bg-green-950 dark:text-green-400'
                            : 'bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {selectedNode?.data?.creatorUser?.availability === 'online' ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <div className="text-lg">{selectedNode?.data?.createdby}</div>
                    <div className="text-sm text-[var(--app-text-muted)]">
                      {selectedNode?.data?.creatorUser?.role || 'Data Steward'}
                    </div>
                  </div>
                </div>
              </span>
            </li>
          ) : null}
          {selectedNode?.data?.createdat ? (
            <li className="flex items-center flex-row justify-between w-full">
              <span className="text-[var(--app-text-muted)]">Created:</span>
              <span className="font-bold">{formatDate(selectedNode?.data?.createdat)}</span>
            </li>
          ) : null}
          {selectedNode?.data?.updatedby ? (
            <li className="flex items-center flex-row justify-between w-full">
              <span className="text-[var(--app-text-muted)]">Updated by:</span>
              <span
                ref={updatedCardRef}
                className="font-bold flex items-center gap-1 relative"
                onMouseEnter={(e) => {
                  const position = calculateOptimalPosition(e.currentTarget);
                  setUpdatedCardPosition(position);
                  setShowUpdatedCard(true);
                }}
                onMouseLeave={() => setShowUpdatedCard(false)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={getGenderAvatar(selectedNode?.data?.updaterUser)}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover mr-1 border border-[var(--app-border)] grayscale"
                />
                {selectedNode?.data?.updatedby}
                <div
                  className={`absolute z-50 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg shadow-lg p-4 min-w-[220px] text-[var(--app-text)] transition-opacity duration-200 ${
                    showUpdatedCard ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  } ${updatedCardPosition.right ? 'right-full mr-2' : 'left-full ml-2'} ${
                    updatedCardPosition.top ? 'bottom-full mb-2' : 'top-1/2 -translate-y-1/2'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <div className="flex flex-row items-center gap-2 justify-between w-full">
                      <img
                        src={getGenderAvatar(selectedNode?.data?.updaterUser)}
                        alt=""
                        className="w-16 h-16 rounded-full mb-2 border"
                      />
                      <span
                        className={`ml-2 px-2 py-0.5 text-md rounded-full align-middle ${
                          selectedNode?.data?.updaterUser?.availability === 'online'
                            ? 'bg-green-50 text-green-500 dark:bg-green-950 dark:text-green-400'
                            : 'bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {selectedNode?.data?.updaterUser?.availability === 'online' ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <div className="text-lg">{selectedNode?.data?.updatedby}</div>
                    <div className="text-sm text-[var(--app-text-muted)]">
                      {selectedNode?.data?.updaterUser?.role || 'Data Steward'}
                    </div>
                  </div>
                </div>
              </span>
            </li>
          ) : null}
          {selectedNode?.data?.updatedat ? (
            <li className="flex items-center flex-row justify-between w-full">
              <span className="text-[var(--app-text-muted)]">Updated:</span>
              <span className="font-bold">{formatDate(selectedNode?.data?.updatedat)}</span>
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );

  const renderConnectionTab = () => (
    <div className="drawer-tab-panel">
      <p className="drawer-placeholder">
        Upstream and downstream nodes linked to this asset. Connection management will expand in a
        later release.
      </p>
      {parentNodes.length > 0 ? renderConnectionList('Contributes to:', parentNodes) : null}
      {parentNodes.length > 0 && childNodes.length > 0 ? (
        <div className="w-full h-0 border-t border-[var(--app-border)] my-2 relative">
          <IconArrowsDownUp
            className="bg-[var(--app-surface)] border border-[var(--app-border)] z-50 rounded-full p-1 size-6 text-[var(--app-text-muted)] absolute -bottom-3 left-6"
            stroke={3}
          />
        </div>
      ) : null}
      {childNodes.length > 0 ? renderConnectionList('Gets data from:', childNodes) : null}
      {parentNodes.length === 0 && childNodes.length === 0 ? (
        <p className="drawer-placeholder">No connections for this node yet.</p>
      ) : null}
    </div>
  );

  const renderCodeTab = () => (
    <div className="drawer-tab-panel drawer-code-panel">
      <div className="drawer-code-toolbar">
        <button
          type="button"
          className="drawer-code-copy-btn"
          onClick={handleCopyNodeCode}
          aria-label="Copy JSON to clipboard"
        >
          <IconCopy size={16} stroke={2} aria-hidden />
          {codeCopied ? 'Copied' : 'Copy to clipboard'}
        </button>
      </div>
      <pre className="drawer-code-block">
        <code>{nodeCodeJson}</code>
      </pre>
    </div>
  );

  const renderActivityTab = () => {
    const trimmedDraft = commentDraft.trim();
    const trimmedEdit = editDraft.trim();

    return (
      <div className="drawer-tab-panel drawer-activity-panel">
        {activityLoading ? (
          <p className="drawer-placeholder">Loading activity…</p>
        ) : sortedActivities.length > 0 ? (
          <ul className="drawer-activity-list" aria-label="Activity history">
            {sortedActivities.map((entry) => {
              const isComment = isUserComment(entry);
              const isEditing = isComment && editingCommentId === entry.id;
              const timestamp = entry.updatedAt ?? entry.createdAt;

              return (
                <li
                  key={entry.id}
                  className={`drawer-activity-item ${isComment ? '' : 'drawer-activity-item--system'}`}
                >
                  {isEditing ? (
                    <div className="drawer-activity-edit">
                      <MentionTextarea
                        className="drawer-activity-textarea"
                        value={editDraft}
                        onChange={setEditDraft}
                        users={mentionUsers}
                        nodes={mentionNodes}
                        rows={3}
                        ariaLabel="Edit comment"
                        placeholder="Use @ for people, @@ for nodes"
                      />
                      <div className="drawer-activity-edit-actions">
                        <button
                          type="button"
                          className="app-btn-solid px-3 py-1.5 text-xs"
                          onClick={saveEditingComment}
                          disabled={!trimmedEdit}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="drawer-activity-btn-ghost"
                          onClick={cancelEditingComment}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="drawer-activity-text">
                        {isComment && entry.text
                          ? formatMentionSegments(entry.text, mentionUsers, mentionNodes).map(
                              (part, idx) =>
                                part.type === 'mention' ? (
                                  <React.Fragment key={idx}>
                                    {renderActivityMentionPart(part, mentionNodes)}
                                  </React.Fragment>
                                ) : (
                                  <span key={idx}>{part.value}</span>
                                )
                            )
                          : formatActivityMessage(entry)}
                      </p>
                      <div className="drawer-activity-meta">
                        <time
                          className="drawer-activity-time"
                          dateTime={timestamp}
                        >
                          {formatActivityTimestamp(timestamp)}
                          {isComment && entry.updatedAt ? ' · edited' : ''}
                        </time>
                        {isComment ? (
                          <div className="drawer-activity-item-actions">
                            <button
                              type="button"
                              className="drawer-activity-icon-btn"
                              onClick={() => startEditingComment(entry)}
                              title="Edit comment"
                              aria-label="Edit comment"
                            >
                              <IconPencil size={16} stroke={2} />
                            </button>
                            <button
                              type="button"
                              className="drawer-activity-icon-btn drawer-activity-icon-btn--danger"
                              onClick={() => handleDeleteComment(entry.id)}
                              title="Delete comment"
                              aria-label="Delete comment"
                            >
                              <IconTrash size={16} stroke={2} />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        ) : !activityLoading ? (
          <p className="drawer-placeholder">
            No activity yet. Changes to this node and its connections will appear here. Add a note
            below to capture context.
          </p>
        ) : null}

        <form
          className="drawer-activity-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleAddComment();
          }}
        >
          <label htmlFor="drawer-activity-comment" className="drawer-activity-form-label">
            Add a note <span className="drawer-activity-hint">(@ people, @@ nodes)</span>
          </label>
          <MentionTextarea
            id="drawer-activity-comment"
            className="drawer-activity-textarea"
            placeholder="Write a note… type @ or @@ to mention"
            value={commentDraft}
            onChange={setCommentDraft}
            users={mentionUsers}
            nodes={mentionNodes}
            rows={3}
            ariaLabel="Add a note"
          />
          <button
            type="submit"
            className="app-btn-solid px-4 py-2 text-sm self-end"
            disabled={!trimmedDraft}
          >
            Add Comment
          </button>
        </form>
      </div>
    );
  };

  return (
    <div
      ref={drawerRef}
      className={`fixed top-10 right-0 z-50 w-[420px] h-[calc(100vh-2.5rem)] border-l border-[var(--app-border)] side-drawer ${isOpen ? 'open' : 'closed'} bg-[var(--app-surface)]/95 backdrop-blur-md flex flex-col transition-none opacity-0 text-[var(--app-text)] ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
    >
      {/* Use the CloseButton component */}
      <CloseButton onClick={onClose} />
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-start hide-scrollbar">
        <div className="flex flex-col items-start px-6 py-4 w-full">
          <div
            ref={(el) => (contentRef.current[0] = el)}
            className="w-full flex flex-col items-start gap-2 mb-4"
          >
            <Chip type={selectedNode?.data?.type} size="sm" variant="default" />
            <div className="flex items-center gap-2 w-full group">
              {editingTitle ? (
                <>
                  <input
                    className="border border-[var(--app-border)] rounded px-2 py-1 flex-1 text-left bg-[var(--app-surface-muted)] text-[var(--app-text)]"
                    value={titleValue}
                    onChange={e => setTitleValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitEditing();
                      if (e.key === 'Escape') cancelEditing();
                    }}
                    autoFocus
                  />
                  <button onClick={commitEditing} className="text-green-600 hover:bg-green-50 rounded p-1" title="Save">
                    <IconCheck size={20} />
                  </button>
                  <button onClick={cancelEditing} className="text-red-600 hover:bg-red-50 rounded p-1" title="Cancel">
                    <IconX size={20} />
                  </button>
                </>
              ) : (
                <>
                  <span
                    className="text-lg font-semibold cursor-pointer flex-1 text-left transition bg-transparent group-hover:bg-[var(--app-surface-muted)] rounded text-[var(--app-text)]"
                    onClick={startEditing}
                    title="Click to edit"
                  >
                    {selectedNode?.data?.name}
                  </span>
                  <span
                    className="ml-2 px-2 py-0.5 text-xs rounded bg-[var(--app-surface-muted)] text-[var(--app-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity select-none cursor-pointer"
                    onClick={startEditing}
                  >
                    edit
                  </span>
                </>
              )}
            </div>
          </div>

          <div
            ref={(el) => (contentRef.current[1] = el)}
            className="w-full flex flex-col items-start gap-3"
            role="tablist"
            aria-label="Node sections"
          >
            <div className="drawer-tabs">
              {DRAWER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`drawer-tab ${activeTab === tab.id ? 'drawer-tab--active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full pb-8 px-0" role="tabpanel">
            {activeTab === 'details' && renderDetailsTab()}
            {activeTab === 'connection' && renderConnectionTab()}
            {activeTab === 'activity' && renderActivityTab()}
            {activeTab === 'code' && renderCodeTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideDrawer;