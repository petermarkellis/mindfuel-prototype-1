import { useState, useEffect } from 'react';
import { XMarkIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

/**
 * Toast notification for undoing actions
 */
export default function UndoNotification({ message, onUndo, onDismiss, duration = 5000 }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (message) {
      // Show notification
      setIsVisible(true);
      setIsLeaving(false);

      // Auto-dismiss after duration
      const timer = setTimeout(() => {
        setIsLeaving(true);
        setTimeout(() => {
          setIsVisible(false);
          onDismiss?.();
        }, 300); // Wait for exit animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration, onDismiss]);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300);
  };

  const handleUndo = () => {
    // Start fade out animation
    setIsLeaving(true);
    
    // Call the undo callback immediately
    onUndo?.();
    
    // Hide after animation completes - don't call onDismiss here
    // as it will clear the message and cause re-render
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  // Don't render anything if not visible and no message
  if (!isVisible && !message) return null;

  return (
    <div
      className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${
        isLeaving ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4">
        <span className="text-sm font-medium">{message}</span>

        {onUndo && (
          <button
            onClick={handleUndo}
            className="flex items-center gap-1 px-3 py-1 bg-white text-slate-800 rounded-md text-sm font-medium hover:bg-slate-100 transition-colors"
          >
            <ArrowUturnLeftIcon className="w-4 h-4" />
            Undo
          </button>
        )}

        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-slate-700 rounded transition-colors"
          aria-label="Dismiss"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
