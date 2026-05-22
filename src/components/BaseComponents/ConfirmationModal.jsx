import React from 'react';
import { createPortal } from 'react-dom';
import { IconAlertTriangle, IconX } from '@tabler/icons-react';
import Chip from './Chip';

const VARIANT_STYLES = {
  danger: {
    icon: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-100 dark:bg-red-950/50',
    confirmBtn:
      'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 focus:ring-red-500',
  },
  warning: {
    icon: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-950/50',
    confirmBtn:
      'bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 focus:ring-amber-500',
  },
  info: {
    icon: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-950/50',
    confirmBtn:
      'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 focus:ring-blue-500',
  },
};

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) => {
  if (!isOpen) return null;

  const variantClasses = VARIANT_STYLES[variant] ?? VARIANT_STYLES.danger;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    await onConfirm?.();
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg shadow-xl max-w-md w-full text-[var(--app-text)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
          aria-label="Close"
        >
          <IconX className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 pr-8">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0 ${variantClasses.iconBg}`}
            >
              <IconAlertTriangle className={`w-6 h-6 ${variantClasses.icon}`} />
            </div>
            <h3 id="confirmation-modal-title" className="text-lg font-semibold text-[var(--app-text)]">
              {title}
            </h3>
          </div>

          <div className="text-base text-[var(--app-text-muted)] text-left mb-6">
            {(() => {
              const lines = message.split('\n');
              const elements = [];
              let inConnectionInfo = false;
              let connectionLines = [];

              lines.forEach((line, index) => {
                if (
                  line.includes('This node connects:') ||
                  line.includes('This will disconnect:') ||
                  line.includes('This will disconnect from:')
                ) {
                  inConnectionInfo = true;
                  elements.push(
                    <div key={`main-${index}`} className="font-semibold mb-3 text-[var(--app-text)]">
                      {line}
                    </div>
                  );
                } else if (line.startsWith('Parents:') || line.startsWith('Children:')) {
                  const [label, ...rest] = line.split(':');
                  const nodeInfoString = rest.join(':').trim();
                  const nodeInfos = nodeInfoString.split('||').filter((info) => info.trim());

                  connectionLines.push(
                    <div key={`conn-${index}`} className="mb-2">
                      <span className="font-semibold text-[var(--app-text)]">{label}:</span>
                      <div className="mt-1 space-y-1">
                        {nodeInfos.map((nodeInfo, nodeIndex) => {
                          const [type, name] = nodeInfo.split('|');
                          return (
                            <div key={`node-${nodeIndex}`} className="flex items-center gap-2 text-sm">
                              <span className="text-[var(--app-text-muted)]">•</span>
                              <Chip type={type} size="xs" variant="default" />
                              <span className="text-[var(--app-text)]">{name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                } else if (line.trim() === '' && inConnectionInfo) {
                  if (connectionLines.length > 0) {
                    elements.push(
                      <div
                        key={`box-${index}`}
                        className="bg-[var(--app-surface-muted)] border border-[var(--app-border)] rounded-md p-3 my-3"
                      >
                        {connectionLines}
                      </div>
                    );
                    connectionLines = [];
                  }
                  inConnectionInfo = false;
                } else if (!inConnectionInfo && line.trim() !== '') {
                  if (line.includes('Are you sure you want to delete')) {
                    const quotedNameMatch = line.match(/delete "([^"]+)"/);
                    if (quotedNameMatch) {
                      const nodeName = quotedNameMatch[1];
                      const beforeQuote = line.substring(0, line.indexOf(`"${nodeName}"`));
                      const afterQuote = line.substring(
                        line.indexOf(`"${nodeName}"`) + nodeName.length + 2
                      );

                      elements.push(
                        <div key={`main-${index}`} className="mb-3">
                          {beforeQuote}
                          <span className="font-semibold text-[var(--app-text)]">"{nodeName}"</span>
                          {afterQuote}
                        </div>
                      );
                    } else {
                      elements.push(<div key={`other-${index}`}>{line}</div>);
                    }
                  } else if (line.includes('will disconnect') || line.includes('This will disconnect')) {
                    elements.push(
                      <div
                        key={`warning-${index}`}
                        className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-md p-3 my-3"
                      >
                        <div className="text-amber-800 dark:text-amber-200">{line}</div>
                      </div>
                    );
                  } else {
                    elements.push(<div key={`other-${index}`}>{line}</div>);
                  }
                }
              });

              if (connectionLines.length > 0) {
                elements.push(
                  <div
                    key="box-final"
                    className="bg-[var(--app-surface-muted)] border border-[var(--app-border)] rounded-md p-3 my-3"
                  >
                    {connectionLines}
                  </div>
                );
              }

              return elements;
            })()}
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[var(--app-text-muted)] bg-[var(--app-surface-muted)] border border-[var(--app-border)] rounded-md hover:bg-[var(--app-surface)] hover:text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--app-surface)] focus:ring-[var(--app-border)] transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--app-surface)] transition-colors ${variantClasses.confirmBtn}`}
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
