import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './SideDrawer.css';
import { IconCheck, IconX, IconArrowsDownUp } from '@tabler/icons-react';
import Chip from './Chip';
import RiskChip from './RiskChip';

const CloseButton = ({ onClick }) => (
  <button 
    className="absolute top-1 right-5 bg-white/80 rounded-full border-none cursor-pointer p-1 rounded-full w-12 h-12 flex justify-center items-center z-[9999] hover:bg-white/10 transition-colors duration-200" 
    onClick={onClick}
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

const SideDrawer = ({ selectedNode, isOpen, onClose, connectedNodes = [], parentNodes = [], childNodes = [], onTitleChange, onRiskChange }) => {
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
  const prevIsOpen = useRef(isOpen);
  const prevSelectedNodeId = useRef(selectedNode?.id);

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

  if (!selectedNode) return null;

  return (
    <div ref={drawerRef} className={`fixed top-0 right-0 w-[420px] h-screen border-l border-slate-300 side-drawer ${isOpen ? 'open' : 'closed'} bg-white/50 backdrop-blur-md flex flex-col transition-none opacity-0`}>
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
                    className="border rounded px-2 py-1 flex-1 text-left"
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
                    className="text-md font-medium cursor-pointer flex-1 text-left transition bg-transparent group-hover:bg-slate-50 rounded"
                    onClick={startEditing}
                    title="Click to edit"
                  >
                    {selectedNode?.data?.name}
                  </span>
                  <span
                    className="ml-2 px-2 py-0.5 text-xs rounded bg-slate-200 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity select-none cursor-pointer"
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
            className="w-full flex flex-col items-start gap-2 mb-4"
          >

            <p className="text-md text-left leading-loose">{selectedNode?.data?.description}</p>
          </div>

          <div className='flex flex-col gap-4 w-full'>
            {/* Potential Block */}
            <div className='relative flex flex-col justify-between gap-2 bg-slate-100 border border-slate-400 rounded-md px-2 py-0 h-16 sm:h-20 md:h-24 lg:h-24 w-full items-start overflow-hidden'>
              <span className="z-10 font-medium mt-2 text-slate-600 bg-slate-200/60 rounded-lg px-1 py-0 select-none">Potential</span> 
              <span className="z-10 text-lg pl-2 font-medium md:font-light  sm:text-xl md:text-3xl lg:text-4xl text-slate-600 font-light">{Potential}%</span>
              <div
                ref={potentialBarRef}
                className='absolute left-0 bottom-0 w-full bg-violet-50 border-t border-violet-400 border-dashed'
                style={{ height: 0, backgroundImage: "url('/barchart_bg.svg')", backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center' }}
              ></div>
            </div>
            {/* Total Contribution Block */}
            <div className='relative flex flex-col justify-between gap-2 bg-slate-100 border border-slate-400 rounded-md px-2 py-0 h-16 sm:h-20 md:h-24 lg:h-24 w-full items-start overflow-hidden'>
              <span className="z-10 font-medium mt-2 text-slate-600 bg-slate-200/60 rounded-lg px-1 py-0 select-none">Total Contribution</span> 
              <span className="z-10 text-lg pl-2 font-medium md:font-light  sm:text-xl md:text-3xl lg:text-4xl text-slate-600 font-light">{TotalContribution}%</span>
              <div
                ref={totalContributionBarRef}
                className='absolute left-0 bottom-0 w-full bg-blue-50 border-t border-blue-400 border-dashed'
                style={{ height: 0, backgroundImage: "url('/barchart_bg.svg')", backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center' }}
              ></div>
            </div>
          </div>
        </div>

        <div className='w-full'>
          {/* Parent Nodes List */}
          {parentNodes.length > 0 && (
            <div className="mt-4 w-full pt-4 flex flex-col gap-2 items-start relative">
              <div className='flex flex-col gap-2 items-start px-6'>
              <h4 className="text-slate-500 mb-2 font-medium select-none">Contributes to:</h4>
              <ul className="flex flex-col gap-2 items-start">
                {parentNodes.map(node => (
                  <li key={node.id} className="text-sm text-slate-600 select-all">
                    <span className="font-bold">{node?.data?.name}</span> <span className="text-sm text-slate-400">({node?.data?.type})</span>
                  </li>
                ))}
              </ul>
              </div>
            </div>
          )}

          {/* Child Nodes List */}
          {(parentNodes.length > 0) && (childNodes.length > 0) && (
          <div className='w-full h-0 bg-slate-200 border-t border-slate-200 mt-4 relative'>
          <IconArrowsDownUp className='bg-slate-50 z-50 rounded-full p-1 size-6 text-slate-400 absolute -bottom-3 left-6' stroke={3}/>
          </div>
          )}

          {/* Child Nodes List */}
          {childNodes.length > 0 && (
            <div className="mt-2 w-full  pt-4 flex flex-col gap-2 items-start">
              <div className='flex flex-col gap-2 items-start px-6'>
              <h4 className="text-slate-500 mb-2 font-medium select-none">Gets Data From:</h4>
              <ul className="flex flex-col gap-2 items-start">
                {childNodes.map(node => (
                  <li key={node.id} className="text-sm text-slate-600 select-all">
                    <span className="font-bold">{node?.data?.name}</span> <span className="text-sm text-slate-400">({node?.data?.type})</span>
                  </li>
                ))}
              </ul>
              </div>
            </div>
          )}
        </div>

        {/* Additional Node Data Section */}
        {selectedNode && (
          <div className="mt-4 w-full border-t border-slate-200 pt-4 flex flex-col gap-2 items-start px-6 pb-8">
            <h4 className="text-slate-500 mb-2 font-medium select-none">Node Details</h4>
            <ul className="flex flex-col gap-4 items-start text-slate-600 text-sm w-full">
              {/* Risk chip */}
              <li className='flex flex-row justify-between w-full group'>
                <span className="text-slate-400 select-none">Risk:</span>
                <span className="w-auto flex flex-row items-center select-none">
                  {editingRisk ? (
                    <select
                      className="ml-2 px-2 py-1 rounded border border-slate-300 bg-white text-slate-700 text-sm"
                      value={selectedNode?.data?.risk?.toLowerCase() || 'notset'}
                      onChange={handleRiskChange}
                      autoFocus
                      onBlur={() => setEditingRisk(false)}
                    >
                      {RISK_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <>
                      <span
                        className="ml-2 px-2 py-0.5 text-xs rounded bg-slate-200 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity select-none cursor-pointer"
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
              {selectedNode?.data?.successPotential && (
                <li className='flex items-center flex-row justify-between w-full'><span className="text-slate-400 select-none">Success Potential:</span> <span className="font-bold">{selectedNode?.data?.successPotential}%</span></li>
              )}
              {selectedNode?.data?.createdby && (
                <li className='flex items-center flex-row justify-between w-full'>
                  <span className="text-slate-400 select-none">Created by:</span>
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
                      src="/avatars/Avatar5.png" 
                      alt="Avatar" 
                      className="w-7 h-7 rounded-full object-cover mr-1 border border-slate-200 grayscale" 
                      style={{ display: 'inline-block' }}
                    />
                    {selectedNode?.data?.createdby}
                    {/* Floating card */}
                    <div
                      className={`absolute z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-4 min-w-[220px] transition-opacity duration-200 ${
                        showCreatedCard ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                      } ${
                        createdCardPosition.right 
                          ? 'right-full mr-2' 
                          : 'left-full ml-2'
                      } ${
                        createdCardPosition.top 
                          ? 'bottom-full mb-2' 
                          : 'top-1/2 -translate-y-1/2'
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <div className="flex flex-row items-center gap-2 justify-between w-full">
                          <img src="/avatars/Avatar5.png" alt="Avatar" className="w-16 h-16 rounded-full mb-2 border" />
                          <span className={`ml-2 px-2 py-0.5 text-md rounded-full align-middle ${
                            selectedNode?.data?.creatorUser?.availability === 'online' 
                              ? 'bg-green-50 text-green-500' 
                              : 'bg-slate-50 text-slate-500'
                          }`}>
                            {selectedNode?.data?.creatorUser?.availability === 'online' ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        <div className="text-lg">{selectedNode?.data?.createdby}</div>
                        <div className="text-sm text-slate-500">{selectedNode?.data?.creatorUser?.role || 'Data Steward'}</div>
                        <div className="text-sm text-slate-400 font-normal">{selectedNode?.data?.creatorUser?.email || `${selectedNode?.data?.createdby?.split(' ')[0]?.toLowerCase()}@mindfuel.ai`}</div>
                        <div className="mt-2 text-sm flex flex-col items-start text-slate-600 font-normal">
                          <div className=' select-none'>Opportunities: 1</div>
                          <div className='select-none'>Products: 2</div>
                          <div className='select-none'>Assets: 5</div>
                        </div>
                      </div>
                    </div>
                  </span>
                </li>
              )}
              {selectedNode?.data?.createdat && (
                <li className='flex items-center flex-row justify-between w-full'><span className="text-slate-400  select-none">Created:</span> <span className="font-bold">{formatDate(selectedNode?.data?.createdat)}</span></li>
              )}
              {selectedNode?.data?.updatedby && (
                <li className='flex items-center flex-row justify-between w-full'>
                  <span className="text-slate-400 select-none">Updated by:</span>
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
                      src="/avatars/Avatar6.png" 
                      alt="Avatar" 
                      className="w-7 h-7 rounded-full object-cover mr-1 border border-slate-200 grayscale" 
                      style={{ display: 'inline-block' }}
                    />
                    {selectedNode?.data?.updatedby}
                    {/* Floating card */}
                    <div
                      className={`absolute z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-4 min-w-[220px] transition-opacity duration-200 ${
                        showUpdatedCard ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                      } ${
                        updatedCardPosition.right 
                          ? 'right-full mr-2' 
                          : 'left-full ml-2'
                      } ${
                        updatedCardPosition.top 
                          ? 'bottom-full mb-2' 
                          : 'top-1/2 -translate-y-1/2'
                      }`}
                    >
                      <div className="flex flex-col items-start">
                      <div className="flex flex-row items-center gap-2 justify-between w-full">
                          <img src="/avatars/Avatar6.png" alt="Avatar" className="w-16 h-16 rounded-full mb-2 border" />
                          <span className={`ml-2 px-2 py-0.5 text-md rounded-full align-middle ${
                            selectedNode?.data?.updaterUser?.availability === 'online' 
                              ? 'bg-green-50 text-green-500' 
                              : 'bg-slate-50 text-slate-500'
                          }`}>
                            {selectedNode?.data?.updaterUser?.availability === 'online' ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        <div className="text-lg">{selectedNode?.data?.updatedby}</div>
                        <div className="text-sm text-slate-500">{selectedNode?.data?.updaterUser?.role || 'Data Steward'}</div>
                        <div className="text-sm text-slate-400 font-normal">{selectedNode?.data?.updaterUser?.email || `${selectedNode?.data?.updatedby?.split(' ')[0]?.toLowerCase()}@mindfuel.ai`}</div>
                        <div className="mt-2 text-sm flex flex-col items-start text-slate-600 font-normal">
                          <div className='select-none'>Opportunities: 3</div>
                          <div className='select-none'>Products: 7</div>
                          <div className='select-none'>Assets: 16</div>
                        </div>
                      </div>
                    </div>
                  </span>
                </li>
              )}
              {selectedNode?.data?.updatedat && (
                <li className='flex items-center flex-row justify-between w-full'><span className="text-slate-400 select-none">Updated:</span> <span className="font-bold">{formatDate(selectedNode?.data?.updatedat)}</span></li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SideDrawer;