import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import closeIcon from '/icon_close.svg';
import './SideDrawer.css';

const CloseButton = ({ onClick }) => (
  <button className="close-button hover:bg-slate-200 absolute top-1 right-1 transition-colors duration-200 ease-in-out" onClick={onClick}>
    <img src={closeIcon} alt="Close" className="close-icon" />
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

const SideDrawer = ({ selectedNode, isOpen, onClose, connectedNodes = [], parentNodes = [], childNodes = [] }) => {
  const drawerRef = useRef(null);
  const contentRef = useRef([]);
  const [Potential, setPotential] = useState(0);
  const [TotalContribution, setTotalContribution] = useState(0);
  const potentialRef = useRef({ value: 0 });
  const totalContributionRef = useRef({ value: 0 });
  const potentialBarRef = useRef(null);
  const totalContributionBarRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Animate the side drawer sliding in
      if (drawerRef.current) {
        gsap.to(drawerRef.current, {
          duration: 0.5,
          right: 0,
          opacity: 1,
          ease: 'power2.inOut',
        });
      }

      // Animate the content blocks sliding up one by one with a stagger effect
      /*gsap.fromTo(
        contentRef.current,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1, // Delay between each content block's animation
          ease: 'power2.out',
        }
      );*/

      // Animate Potential to selectedNode.data.potential
      if (potentialRef.current && potentialBarRef.current) {
        gsap.to(potentialRef.current, {
          value: selectedNode.data.potential ?? 0,
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
          value: selectedNode.data.totalContribution ?? 0,
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
    } else {
      // Close the drawer (slide out) and hide the content
      if (drawerRef.current) {
        gsap.to(drawerRef.current, {
          duration: 0.4,
          right: '-400px',
          opacity: 0,
          ease: 'power2.in',
        });
      }

      // Hide content with a slight upward movement
      /*if (contentRef.current) {
        gsap.to(contentRef.current, {
          opacity: 0,
          y: 10,
          duration: 0.5,
          stagger: 0.1,
        });
      }*/
      //setPotential(0);
      //setTotalContribution(0);
      //potentialRef.current.value = 0;
      //totalContributionRef.current.value = 0;
      //if (potentialBarRef.current) gsap.set(potentialBarRef.current, { height: '0%' });
      //if (totalContributionBarRef.current) gsap.set(totalContributionBarRef.current, { height: '0%' });
    }
  }, [isOpen, selectedNode?.data?.potential, selectedNode?.data?.totalContribution]);

  if (!selectedNode) return null;

  return (
    <div ref={drawerRef} className={`border-l border-slate-300 side-drawer h-screen ${isOpen ? 'open' : 'closed'} backdrop-blur-md bg-white/40 shadow-xl`}>
      <div className="align-left h-full flex flex-col">
       
       
        {/* Use the CloseButton component */}
        <CloseButton onClick={onClose} />

        <div className="flex flex-col items-start px-6 py-4">
          <div
            ref={(el) => (contentRef.current[0] = el)}
            className="w-full flex flex-col items-start gap-2 mb-4"
          >
            <p className={`text-sm jetbrains px-1 py-0 border border-slate-200 rounded-md ${getSubtleColorClassForType(selectedNode.data.type)} ${getColorClassForType(selectedNode.data.type)}`}>
              {selectedNode.data.type}
            </p>
            <p className="text-md font-medium">{selectedNode.data.name}</p>
          </div>

          <div
            ref={(el) => (contentRef.current[1] = el)}
            className="w-full flex flex-col items-start gap-2 mb-4"
          >
            <p className="text-sm jetbrains bg-slate-200 px-1 py-0 rounded-md">Description</p>
            <p className="text-md text-left leading-loose">{selectedNode.data.description}</p>
          </div>

          <div className='flex flex-col gap-2 w-full'>
            {/* Potential Block */}
            <div className='relative flex flex-col gap-2 bg-slate-100 border border-slate-400 rounded-md px-2 py-0 h-28 w-full  items-start overflow-hidden'>
              <span className="z-10 font-medium mt-2 text-slate-600 bg-slate-200/60 rounded-lg px-1 py-0">Potential</span> 
              <span className="z-10 text-4xl text-slate-600 font-light">{Potential}%</span>
              <div
                ref={potentialBarRef}
                className='absolute left-0 bottom-0 w-full bg-violet-50 border-t border-violet-400 border-dashed'
                style={{ height: 0, backgroundImage: "url('/barchart_bg.svg')", backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center' }}
              ></div>
            </div>
            {/* Total Contribution Block */}
            <div className='relative flex flex-col gap-2 bg-slate-100 border border-slate-400 rounded-md px-2 py-0 h-28 w-full items-start overflow-hidden'>
              <span className="z-10 font-medium mt-2 text-slate-600 bg-slate-200/60 rounded-lg px-1 py-0">Total Contribution</span> 
              <span className="z-10 text-4xl text-slate-600 font-light">{TotalContribution}%</span>
              <div
                ref={totalContributionBarRef}
                className='absolute left-0 bottom-0 w-full bg-blue-50 border-t border-blue-400 border-dashed'
                style={{ height: 0, backgroundImage: "url('/barchart_bg.svg')", backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center' }}
              ></div>
            </div>
          </div>
          </div>

          <div className=''>
            {/* Parent Nodes List */}
            {parentNodes.length > 0 && (
              <div className="mt-4 w-full border-t border-slate-200 pt-4 flex flex-col gap-2 items-start">
                <div className='flex flex-col gap-2 items-start px-6'>
                <h4 className="text-slate-500 mb-2 font-medium">Contributes to:</h4>
                <ul className="flex flex-col gap-2 items-start">
                  {parentNodes.map(node => (
                    <li key={node.id} className="text-sm text-slate-600">
                      <span className="font-bold">{node.data.name}</span> <span className="text-sm text-slate-400">({node.data.type})</span>
                    </li>
                  ))}
                </ul>
                </div>
              </div>
            )}

            {/* Child Nodes List */}
            {childNodes.length > 0 && (
              <div className="mt-4 w-full border-t border-slate-200 pt-4 flex flex-col gap-2 items-start">
                <div className='flex flex-col gap-2 items-start px-6'>
                <h4 className="text-slate-500 mb-2 font-medium">Gets Data From:</h4>
                <ul className="flex flex-col gap-2 items-start">
                  {childNodes.map(node => (
                    <li key={node.id} className="text-sm text-slate-600">
                      <span className="font-bold">{node.data.name}</span> <span className="text-sm text-slate-400">({node.data.type})</span>
                    </li>
                  ))}
                </ul>
                </div>
              </div>
            )}
        </div>

        {/* Additional Node Data Section */}
        {selectedNode && (
          <div className="mt-4 w-full border-t border-slate-200 pt-4 flex flex-col gap-2 items-start px-6">
            <h4 className="text-slate-500 mb-2 font-medium">Node Details</h4>
            <ul className="flex flex-col gap-4 items-start text-slate-600 text-sm w-full">
              {/* Risk as enum badge */}
              <li className='flex items-center flex-row justify-between w-full'>
                <span className="text-slate-400">Risk:</span>
                <span className={`font-bold ml-2 px-2 py-0.5 rounded ${getRiskLabelAndColor(selectedNode.data.risk).color}`}>
                  {getRiskLabelAndColor(selectedNode.data.risk).label}
                </span>
              </li>
              {selectedNode.data.successPotential && (
                <li className='flex items-center flex-row justify-between w-full'><span className="text-slate-400">Success Potential:</span> <span className="font-bold">{selectedNode.data.successPotential}%</span></li>
              )}
              {selectedNode.data.createdby && (
                <li className='flex items-center flex-row justify-between w-full'>
                  <span className="text-slate-400">Created by:</span>
                  <span className="font-bold flex items-center gap-1">
                    <img 
                      src="/avatars/Avatar5.png" 
                      alt="Avatar" 
                      className="w-7 h-7 rounded-full object-cover mr-1 border border-slate-200 grayscale" 
                      style={{ display: 'inline-block' }}
                    />
                    {selectedNode.data.createdby}
                  </span>
                </li>
              )}
              {selectedNode.data.createdat && (
                <li className='flex items-center flex-row justify-between w-full'><span className="text-slate-400">Created:</span> <span className="font-bold">{formatDate(selectedNode.data.createdat)}</span></li>
              )}
              {selectedNode.data.updatedby && (
                <li className='flex items-center flex-row justify-between w-full'>
                  <span className="text-slate-400">Updated by:</span>
                  <span className="font-bold flex items-center gap-1">
                    <img 
                      src="/avatars/Avatar6.png" 
                      alt="Avatar" 
                      className="w-7 h-7 rounded-full object-cover mr-1 border border-slate-200 grayscale" 
                      style={{ display: 'inline-block' }}
                    />
                    {selectedNode.data.updatedby}
                  </span>
                </li>
              )}
              {selectedNode.data.updatedat && (
                <li className='flex items-center flex-row justify-between w-full'><span className="text-slate-400">Updated:</span> <span className="font-bold">{formatDate(selectedNode.data.updatedat)}</span></li>
              )}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
};

export default SideDrawer;