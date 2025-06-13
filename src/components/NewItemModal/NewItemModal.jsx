import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { IconX, IconRecharging, IconBox, IconLayersSelected, IconDatabase, IconPlayerPlay } from '@tabler/icons-react';
import NewItemCard from './NewItemCard';

const NewItemModal = ({ isOpen, onClose, onCreateItem }) => {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const cardsRef = useRef([]);

  // Modal data using your existing color scheme
  const itemTypes = [
    {
      id: 'opportunity',
      title: 'Opportunity',
      description: 'A business goal or use case that creates value—like improving forecasts or reducing manual work.',
      icon: IconRecharging,
      iconColor: 'text-orange-600',
      iconBgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      id: 'dataProduct',
      title: 'Data Product',
      description: 'A solution (like a dashboard or model) that helps realize an Opportunity using data.',
      icon: IconBox,
      iconColor: 'text-purple-600',
      iconBgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'dataAsset',
      title: 'Data Asset',
      description: 'A dataset or output (like a table or model result) used by Data Products.',
      icon: IconLayersSelected,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'dataSource',
      title: 'Data Source',
      description: 'The origin of data—databases, APIs, or other systems that feed Data Assets.',
      icon: IconDatabase,
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  // Handle modal open/close animations
  useEffect(() => {
    if (isOpen) {
      // Set initial states
      gsap.set(overlayRef.current, { opacity: 0 });
      gsap.set(modalRef.current, { scale: 0.9, opacity: 0 });
      gsap.set(cardsRef.current, { y: 40, opacity: 0 });

      // Animate in
      const tl = gsap.timeline();
      tl.to(overlayRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' })
        .to(modalRef.current, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }, 0.1)
        .to(cardsRef.current, { 
          y: 0, 
          opacity: 1, 
          duration: 0.6, 
          stagger: 0.1,
          ease: 'power3.out' 
        }, 0.3);
    } else if (overlayRef.current) {
      // Animate out
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
      gsap.to(modalRef.current, { scale: 0.95, opacity: 0, duration: 0.2 });
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleItemCreate = (itemType) => {
    onCreateItem(itemType);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-6">
          <h2 className="text-2xl font-semibold text-slate-800">
            What do you want to create
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
            aria-label="Close modal"
          >
            <IconX className="w-6 h-6 text-slate-500" strokeWidth={2} />
          </button>
        </div>

        {/* Cards Grid */}
        <div className="px-8 pb-8">
          <div className="flex justify-center">
            <div className="grid grid-cols-4 gap-6 max-w-6xl">
              {itemTypes.map((item, index) => (
                <div
                  key={item.id}
                  ref={(el) => (cardsRef.current[index] = el)}
                  className="w-full h-full flex"
                >
                  <NewItemCard
                    title={item.title}
                    description={item.description}
                    icon={item.icon}
                    iconColor={item.iconColor}
                    iconBgColor={item.iconBgColor}
                    borderColor={item.borderColor}
                    onClick={() => handleItemCreate(item.id)}
                    className="h-full flex-1"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Training Section */}
          <div className="w-full pb-1 pt-6">
            <div className="flex justify-center">
              <div className="grid grid-cols-4 gap-6 w-full">
                <div className="col-span-4 bg-slate-50 rounded-xl p-4 border border-slate-200 w-full">
                  <div className="flex items-start justify-between gap-24">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-slate-800 mb-2 text-left">
                        Learn about our framework
                      </h4>
                      <p className="text-md text-slate-600 leading-relaxed text-left">
                        Learn about Opportunities, Products, Data Assets and Sources<br></br>including our tips on how to structure them to match your business requirements.
                      </p>
                    </div>
                    <div className="ml-6">
                      <button className="flex items-center gap-2 px-4 py-2 bg-slate-500 border border-slate-600 rounded-lg hover:bg-slate-600 transition-colors duration-200 text-white font-medium">
                        <IconPlayerPlay className="w-4 h-4" strokeWidth={2} />
                        Watch now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewItemModal; 