import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { 
    IconX, 
    IconRecharging, 
    IconBox, 
    IconLayersSelected, 
    IconDatabase, 
    IconPlayerPlay, 
    IconBrandDiscord,
    IconBrandYoutube,
    IconBrandDatabricks
} from '@tabler/icons-react';
import NewItemCard from './NewItemCard';

const NewItemModal = ({ isOpen, onClose, onCreateItem }) => {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const cardsRef = useRef([]);
  const educationPanelRef = useRef(null);
  const buttonsRef = useRef([]);

  // Modal data using your existing color scheme
  const itemTypes = [
    {
      id: 'opportunity',
      title: 'Opportunity',
      description: 'A business goal or use case that creates value—like improving forecasts or reducing manual work.',
      icon: IconRecharging,
      iconColor: 'text-orange-600',
      iconBgColor: 'bg-orange-50',
      borderColor: 'border-none',
      cardBGColor: 'bg-slate-50',
      cardBGHoverColor: 'bg-orange-50'  
    },
    {
      id: 'dataProduct',
      title: 'Data Product',
      description: 'A solution (like a dashboard or model) that helps realize an Opportunity using data.',
      icon: IconBox,
      iconColor: 'text-purple-600',
      iconBgColor: 'bg-purple-50',
      borderColor: 'border-none',
      cardBGColor: 'bg-slate-50',
      cardBGHoverColor: 'bg-purple-50'   
    },
    {
      id: 'dataAsset',
      title: 'Data Asset',
      description: 'A dataset or output (like a table or model result) used by Data Products.',
      icon: IconLayersSelected,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-50',
      borderColor: 'border-none',
      cardBGColor: 'bg-slate-50',
      cardBGHoverColor: 'bg-blue-50'    
    },
    {
      id: 'dataSource',
      title: 'Data Source',
      description: 'The origin of data—databases, APIs, or other systems that feed Data Assets.',
      icon: IconDatabase,
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-50',
      borderColor: 'border-none',
      cardBGColor: 'bg-slate-50',
      cardBGHoverColor: 'bg-green-50'    
    }
  ];

  // Handle modal open/close animations
  useEffect(() => {
    if (isOpen) {
      // Set initial states
      gsap.set(overlayRef.current, { opacity: 0 });
      gsap.set(modalRef.current, { scale: 0.9, opacity: 0 });
      gsap.set(cardsRef.current, { y: 40, opacity: 0 });
      gsap.set(educationPanelRef.current, { y: 60, opacity: 0 });
      gsap.set(buttonsRef.current, { y: 30, opacity: 0 });

      // Animate in
      const tl = gsap.timeline();
      tl.to(overlayRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' })
        .to(modalRef.current, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }, 0.1)
        .to(cardsRef.current, { 
          y: 0, 
          opacity: 1, 
          duration: 0.3, 
          stagger: 0.2,
          ease: 'power3.out', 
        }, 0.4)
        .to(educationPanelRef.current, {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power3.out'
        }, 0.7)
        .to(buttonsRef.current, {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.1,
          ease: 'power3.out'
        }, 0.9);
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
        className="absolute inset-0 bg-black/30 backdrop-blur-sm md:block hidden"
        onClick={onClose}
      />
      <div className="absolute inset-0 bg-white md:hidden" />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white w-full h-full md:rounded-2xl md:shadow-2xl md:max-w-7xl md:mx-4 md:max-h-[90vh] md:h-auto flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 pb-4 md:pb-6 flex-shrink-0">
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pt-4">
          {/* Cards */}
          <div className="px-4 md:px-8 pb-4 md:pb-8">
            <div className="flex justify-center">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 max-w-7xl w-full">
              {itemTypes.map((item, index) => (
                <div
                  key={item.id}
                  ref={(el) => (cardsRef.current[index] = el)}
                  className="flex-1"
                >
                  <NewItemCard
                    title={item.title}
                    description={item.description}
                    icon={item.icon}
                    iconColor={item.iconColor}
                    iconBgColor={item.iconBgColor}
                    borderColor={item.borderColor}
                    cardBGColor={item.cardBGColor}
                    cardBGHoverColor={item.cardBGHoverColor}
                    onClick={() => handleItemCreate(item.id)}
                    className="h-full"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Training Section */}
          <div className="w-full pb-1 pt-6">
            <div className="flex justify-center">
              <div className="flex w-full max-w-7xl">
                <div 
                  ref={educationPanelRef}
                  className="flex-1 rounded-xl p-4 border border-slate-50 w-full relative overflow-hidden training-panel"
                  style={{
                    backgroundColor: '#F2F7FE'
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 md:gap-24">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-slate-800 mb-2 text-left">
                        Learn about our framework
                      </h4>
                      <p className="text-md text-slate-600 leading-relaxed text-left">
                        Learn about Opportunities, Products, Data Assets and Sources<br></br>including our tips on how to structure them to match your business requirements.<br></br><br></br>Discuss with the community and get help from the experts by joining the Discord community.
                      </p>
                     </div>
                      <div className="md:ml-6 flex flex-col gap-2">
                        <button 
                          ref={(el) => (buttonsRef.current[0] = el)}
                          className="flex items-start gap-2 px-4 py-2 bg-slate-950/60 backdrop-blur-xs border border-slate-600 rounded-lg hover:bg-slate-600 transition-colors duration-200 text-white hover:text-white font-medium w-full md:w-auto"
                        >
                          <IconBrandYoutube className="w-6 h-6" strokeWidth={2} />
                          Watch now
                        </button>
                        <button 
                          ref={(el) => (buttonsRef.current[1] = el)}
                          className="flex items-start gap-2 px-4 py-2 bg-slate-100/80 backdrop-blur-xs border border-slate-600 rounded-lg hover:bg-slate-600 transition-colors duration-200 text-slate-800 hover:text-white font-medium w-full md:w-auto"
                        >
                          <IconBrandDatabricks className="w-6 h-6" strokeWidth={2} />
                          Join Mindfuel Academy
                        </button>
                        <button 
                          ref={(el) => (buttonsRef.current[2] = el)}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-100/80 backdrop-blur-xs border border-slate-600 rounded-lg hover:bg-slate-600 transition-colors duration-200 text-slate-800 hover:text-white font-medium w-full md:w-auto"
                        >
                          <IconBrandDiscord className="w-6 h-6" strokeWidth={2} />
                          Join the Discord community
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
  </div>
  );
};

export default NewItemModal; 