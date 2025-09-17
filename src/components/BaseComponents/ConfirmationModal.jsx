import React from 'react';
import { createPortal } from 'react-dom';
import { IconAlertTriangle, IconX } from '@tabler/icons-react';
import Chip from './Chip';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger" // danger, warning, info
}) => {
  if (!isOpen) return null;

  const getVariantClasses = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: 'text-red-600',
          iconBg: 'bg-red-100',
          confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        };
      case 'warning':
        return {
          icon: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        };
      case 'info':
        return {
          icon: 'text-blue-600',
          iconBg: 'bg-blue-100',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        };
      default:
        return {
          icon: 'text-red-600',
          iconBg: 'bg-red-100',
          confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        };
    }
  };

  const variantClasses = getVariantClasses();

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center"
      onClick={handleBackdropClick}
      style={{ zIndex: 999999 }}
    >
      {/* Backdrop with blur and fade */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <IconX className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon and Title - Left Aligned */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full ${variantClasses.iconBg}`}>
              <IconAlertTriangle className={`w-6 h-6 ${variantClasses.icon}`} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              {title}
            </h3>
          </div>

          {/* Message */}
          <div className="text-base text-slate-600 text-left mb-6">
            {(() => {
              const lines = message.split('\n');
              const elements = [];
              let inConnectionInfo = false;
              let connectionLines = [];
              
              lines.forEach((line, index) => {
                if (line.includes('This node connects:') || line.includes('This will disconnect:') || line.includes('This will disconnect from:')) {
                  inConnectionInfo = true;
                  elements.push(<div key={`main-${index}`} className="font-semibold mb-3">{line}</div>);
                } else if (line.startsWith('Parents:') || line.startsWith('Children:')) {
                  const [label, ...rest] = line.split(':');
                  const nodeInfoString = rest.join(':').trim();
                  
                  // Parse node info (format: "type1|name1||type2|name2")
                  const nodeInfos = nodeInfoString.split('||').filter(info => info.trim());
                  
                  connectionLines.push(
                    <div key={`conn-${index}`} className="mb-2">
                      <span className="font-semibold">{label}:</span>
                      <div className="mt-1 space-y-1">
                        {nodeInfos.map((nodeInfo, nodeIndex) => {
                          const [type, name] = nodeInfo.split('|');
                          return (
                            <div key={`node-${nodeIndex}`} className="flex items-center gap-2 text-sm">
                              <span className="text-slate-400">•</span>
                              <Chip type={type} size="xs" variant="default" />
                              <span className="text-slate-700">{name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                } else if (line.trim() === '' && inConnectionInfo) {
                  // End of connection info section
                  if (connectionLines.length > 0) {
                    elements.push(
                      <div key={`box-${index}`} className="bg-slate-50 border border-slate-200 rounded-md p-3 my-3">
                        {connectionLines}
                      </div>
                    );
                    connectionLines = [];
                  }
                  inConnectionInfo = false;
                } else if (!inConnectionInfo && line.trim() !== '') {
                  // Check if this is a main question line with quoted node name
                  if (line.includes('Are you sure you want to delete')) {
                    const quotedNameMatch = line.match(/delete "([^"]+)"/);
                    if (quotedNameMatch) {
                      const nodeName = quotedNameMatch[1];
                      const beforeQuote = line.substring(0, line.indexOf(`"${nodeName}"`));
                      const afterQuote = line.substring(line.indexOf(`"${nodeName}"`) + nodeName.length + 2);
                      
                      elements.push(
                        <div key={`main-${index}`} className="mb-3">
                          {beforeQuote}
                          <span className="font-semibold text-slate-800">"{nodeName}"</span>
                          {afterQuote}
                        </div>
                      );
                    } else {
                      elements.push(<div key={`other-${index}`}>{line}</div>);
                    }
                  }
                  // Check if this is a disconnection warning line
                  else if (line.includes('will disconnect') || line.includes('This will disconnect')) {
                    elements.push(
                      <div key={`warning-${index}`} className="bg-amber-50 border border-amber-200 rounded-md p-3 my-3">
                        <div className="text-amber-800">{line}</div>
                      </div>
                    );
                  }
                  // Regular lines
                  else {
                    elements.push(<div key={`other-${index}`}>{line}</div>);
                  }
                }
              });
              
              // Handle case where connection info is at the end
              if (connectionLines.length > 0) {
                elements.push(
                  <div key="box-final" className="bg-slate-50 border border-slate-200 rounded-md p-3 my-3">
                    {connectionLines}
                  </div>
                );
              }
              
              return elements;
            })()}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${variantClasses.confirmBtn}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationModal;
