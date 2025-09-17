import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { 
    IconX, 
    IconRecharging, 
    IconBox, 
    IconLayersSelected, 
    IconDatabase, 
    IconArrowLeft,
    IconCheck,
    IconChevronRight,
    IconArrowsDownUp
} from '@tabler/icons-react';
import NewItemCard from './NewItemCard';
import Chip from '../BaseComponents/Chip';

const NewItemModal = ({ isOpen, onClose, onCreateItem, nodes = [] }) => {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const contentRef = useRef(null);

  // Modal state
  const [step, setStep] = useState('select'); // 'select', 'form', or 'connection'
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    connectionNodeId: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

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

  // Reset modal state when opened/closed
  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setSelectedType(null);
      setFormData({ title: '', description: '', connectionNodeId: null });
      setIsSubmitting(false);
      setErrors({});
      setSubmitError('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (step === 'connection') {
          setStep('form');
        } else if (step === 'form') {
          setStep('select');
        } else {
          onClose();
        }
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
  }, [isOpen, onClose, step]);

  // Handle modal animations
  useEffect(() => {
    if (isOpen && overlayRef.current && modalRef.current) {
      // Set initial states
      gsap.set(overlayRef.current, { opacity: 0 });
      gsap.set(modalRef.current, { scale: 0.9, opacity: 0 });

      // Animate in
      const tl = gsap.timeline();
      tl.to(overlayRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' })
        .to(modalRef.current, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }, 0.1);
    } else if (overlayRef.current) {
      // Animate out
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
      gsap.to(modalRef.current, { scale: 0.95, opacity: 0, duration: 0.2 });
    }
  }, [isOpen]);

  // Handle step transitions
  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(contentRef.current, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [step]);

  const handleTypeSelect = (itemType) => {
    setSelectedType(itemType);
    setStep('form');
  };

  const handleBackToSelect = () => {
    setStep('select');
    setSelectedType(null);
  };

  const handleBackToForm = () => {
    setStep('form');
  };

  const handleOpenConnectionSelect = () => {
    setStep('connection');
  };

  const handleConnectionSelect = (nodeId) => {
    setFormData(prev => ({ ...prev, connectionNodeId: nodeId }));
    setStep('form');
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!selectedType) return;
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      await onCreateItem({
        type: selectedType,
        title: formData.title.trim(),
        description: formData.description.trim(),
        connectionNodeId: formData.connectionNodeId
      });
      onClose();
    } catch (error) {
      console.error('Failed to create item:', error);
      setSubmitError('Failed to create item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTypeData = selectedType ? itemTypes.find(t => t.id === selectedType) : null;
  const selectedNode = formData.connectionNodeId ? nodes.find(n => n.id === formData.connectionNodeId) : null;

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => {
          if (step === 'connection') {
            handleBackToForm();
          } else if (step === 'form') {
            handleBackToSelect();
          } else {
            onClose();
          }
        }}
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white w-full h-full md:rounded-2xl md:shadow-2xl md:max-w-4xl md:mx-4 md:max-h-[90vh] md:h-auto flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-4">
            {(step === 'form' || step === 'connection') && (
              <button
                onClick={step === 'form' ? handleBackToSelect : handleBackToForm}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                aria-label="Go back"
              >
                <IconArrowLeft className="w-5 h-5 text-slate-500" strokeWidth={2} />
              </button>
            )}
            <h2 className="text-2xl font-semibold text-slate-800">
              {step === 'select' && 'What do you want to create?'}
              {step === 'form' && `Create ${selectedTypeData?.title}`}
              {step === 'connection' && 'Select Connection'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
            aria-label="Close modal"
          >
            <IconX className="w-6 h-6 text-slate-500" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-6">
          {step === 'select' ? (
            /* Type Selection Step */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {itemTypes.map((item) => (
                <div key={item.id} className="flex-1">
                  <NewItemCard
                    title={item.title}
                    description={item.description}
                    icon={item.icon}
                    iconColor={item.iconColor}
                    iconBgColor={item.iconBgColor}
                    borderColor={item.borderColor}
                    cardBGColor={item.cardBGColor}
                    cardBGHoverColor={item.cardBGHoverColor}
                    onClick={() => handleTypeSelect(item.id)}
                    className="h-full cursor-pointer hover:shadow-md transition-shadow"
                  />
                </div>
              ))}
            </div>
          ) : step === 'form' ? (
            /* Form Step */
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Selected Type Display */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg relative">
                <div className={`p-3 rounded-lg ${selectedTypeData?.iconBgColor}`}>
                  {selectedTypeData?.icon && (
                    <selectedTypeData.icon className={`w-6 h-6 ${selectedTypeData.iconColor}`} />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Chip type={selectedTypeData?.title} size="xs" variant="default" />
                    <h3 className="font-semibold text-slate-800">{selectedTypeData?.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600">{selectedTypeData?.description}</p>
                </div>
                <button
                  onClick={handleBackToSelect}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Change
                </button>
                <IconArrowsDownUp className='bg-slate-50 z-50 rounded-full p-1 size-6 text-slate-400 absolute -bottom-3 left-6' stroke={3}/>
              </div>

              {/* Connection Selection */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <label className="block text-sm font-medium text-slate-700 mb-3 text-left">
                  Will be connected to:
                </label>
                {!selectedNode ? (
                  <button
                    type="button"
                    onClick={handleOpenConnectionSelect}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg hover:border-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-left flex items-center justify-between bg-white"
                  >
                    <span className="text-slate-500">
                      Select a node to connect to...
                    </span>
                    <IconChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                ) : (
                  <div 
                    onClick={handleOpenConnectionSelect}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors bg-white"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${(() => {
                        switch (selectedNode.data.type) {
                          case 'Opportunity':
                            return 'bg-orange-50';
                          case 'Product':
                          case 'Data Product':
                            return 'bg-purple-50';
                          case 'Data Asset':
                            return 'bg-blue-50';
                          case 'Data Source':
                            return 'bg-green-50';
                          default:
                            return 'bg-slate-50';
                        }
                      })()}`}>
                        {(() => {
                          switch (selectedNode.data.type) {
                            case 'Opportunity':
                              return <IconRecharging className="w-4 h-4 text-orange-600" />;
                            case 'Product':
                            case 'Data Product':
                              return <IconBox className="w-4 h-4 text-purple-600" />;
                            case 'Data Asset':
                              return <IconLayersSelected className="w-4 h-4 text-blue-600" />;
                            case 'Data Source':
                              return <IconDatabase className="w-4 h-4 text-green-600" />;
                            default:
                              return <IconBox className="w-4 h-4 text-slate-600" />;
                          }
                        })()}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <Chip type={selectedNode.data.type} size="xs" variant="default" />
                          <div className="text-base font-medium text-slate-900">{selectedNode.data.name}</div>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-blue-600 font-medium">
                      Change
                    </span>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2 text-left">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      errors.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300'
                    }`}
                    placeholder={`Enter ${selectedTypeData?.title.toLowerCase()} title...`}
                    required
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2 text-left">
                    Description (optional)
                    <span className="text-sm text-slate-500 ml-2">
                      {formData.description.length}/500
                    </span>
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    rows={3}
                    maxLength={500}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-y ${
                      errors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300'
                    }`}
                    placeholder={`Describe this ${selectedTypeData?.title.toLowerCase()}...`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>
              </div>
            </div>
          ) : step === 'connection' ? (
            /* Connection Selection Step */
            <div className="space-y-4 max-w-xl mx-auto">
              {/* No Connection Option */}
              <div
                onClick={() => handleConnectionSelect(null)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  !formData.connectionNodeId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className='text-left'>
                    <h3 className="font-medium text-slate-900">No Connection</h3>
                    <p className="text-sm text-slate-600">Create this node without connecting it to anything</p>
                  </div>
                  {!formData.connectionNodeId && (
                    <IconCheck className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </div>

              {/* Existing Nodes */}
              <div className="space-y-3">
                <h3 className="text-md font-medium text-slate-700 text-left">Connect to existing node:</h3>
                <div className="grid gap-3">
                  {nodes.map((node) => {
                    // Get type styling based on node type
                    const getTypestyling = (type) => {
                      switch (type) {
                        case 'Opportunity':
                          return {
                            icon: IconRecharging,
                            iconColor: 'text-orange-600',
                            iconBgColor: 'bg-orange-50',
                            borderColor: formData.connectionNodeId === node.id ? 'border-orange-500' : 'border-orange-200 hover:border-orange-300'
                          };
                        case 'Product':
                        case 'Data Product':
                          return {
                            icon: IconBox,
                            iconColor: 'text-purple-600',
                            iconBgColor: 'bg-purple-50',
                            borderColor: formData.connectionNodeId === node.id ? 'border-purple-500' : 'border-purple-200 hover:border-purple-300'
                          };
                        case 'Data Asset':
                          return {
                            icon: IconLayersSelected,
                            iconColor: 'text-blue-600',
                            iconBgColor: 'bg-blue-50',
                            borderColor: formData.connectionNodeId === node.id ? 'border-blue-500' : 'border-blue-200 hover:border-blue-300'
                          };
                        case 'Data Source':
                          return {
                            icon: IconDatabase,
                            iconColor: 'text-green-600',
                            iconBgColor: 'bg-green-50',
                            borderColor: formData.connectionNodeId === node.id ? 'border-green-500' : 'border-green-200 hover:border-green-300'
                          };
                        default:
                          return {
                            icon: IconBox,
                            iconColor: 'text-slate-600',
                            iconBgColor: 'bg-slate-50',
                            borderColor: formData.connectionNodeId === node.id ? 'border-slate-500' : 'border-slate-200 hover:border-slate-300'
                          };
                      }
                    };

                    const typeStyle = getTypestyling(node.data.type);
                    const IconComponent = typeStyle.icon;

                    return (
                      <div
                        key={node.id}
                        onClick={() => handleConnectionSelect(node.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          formData.connectionNodeId === node.id
                            ? `${typeStyle.borderColor} ${typeStyle.iconBgColor}`
                            : typeStyle.borderColor
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${typeStyle.iconBgColor} flex-shrink-0`}>
                            <IconComponent className={`w-5 h-5 ${typeStyle.iconColor}`} />
                          </div>
                          <div className="flex-1 text-left">
                            <h4 className="font-medium text-slate-900">{node.data.name}</h4>
                            <div className="mt-1">
                              <Chip type={node.data.type} size="xs" variant="default" />
                            </div>
                            {node.data.description && (
                              <p className="text-slate-500 mt-2 line-clamp-2">{node.data.description}</p>
                            )}
                          </div>
                          {formData.connectionNodeId === node.id && (
                            <IconCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {nodes.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-500">No existing nodes to connect to</p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {step === 'connection' && (
          <div className="p-6 border-t border-slate-200">
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleBackToForm}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBackToForm}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}
        
        {step === 'form' && (
          <div className="p-6 border-t border-slate-200">
            {/* Error Message */}
            {submitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}
            
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleBackToSelect}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!formData.title.trim() || isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewItemModal;