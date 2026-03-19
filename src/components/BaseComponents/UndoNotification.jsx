import { useEffect } from 'react';
import { XMarkIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

/**
 * Toast notification for undoing actions
 * Fully controlled by parent component
 */
export default function UndoNotification({ message, onUndo, onDismiss, duration = 5000 }) {
  // Auto-dismiss after duration
  useEffect(() => {
    if (!message) return;
    
    const timer = setTimeout(() => {
      onDismiss?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  if (!message) return null;

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4">
        <span className="text-sm font-medium">{message}</span>

        {onUndo && (
          <button
            onClick={onUndo}
            className="flex items-center gap-1 px-3 py-1 bg-white text-slate-800 rounded-md text-sm font-medium hover:bg-slate-100 transition-colors"
          >
            <ArrowUturnLeftIcon className="w-4 h-4" />
            Undo
          </button>
        )}

        <button
          onClick={onDismiss}
          className="p-1 hover:bg-slate-700 rounded transition-colors"
          aria-label="Dismiss"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
