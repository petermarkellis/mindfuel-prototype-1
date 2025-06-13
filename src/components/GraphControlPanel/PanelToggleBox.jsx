import React from 'react';
import { IconLayoutSidebarLeftExpand, IconLayoutSidebarRightExpand } from '@tabler/icons-react';

export default function PanelToggleBox({ isPanelCollapsed, onTogglePanel }) {
  return (
    <div className="bg-[var(--color-panel-bg)] border border-slate-300 rounded-lg shadow-sm">
      <div className="p-0">
        <button
          className="p-0 transition hover:bg-slate-100 rounded-md"
          style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={onTogglePanel}
          aria-label={isPanelCollapsed ? 'Expand Graph Control Panel' : 'Collapse Graph Control Panel'}
        >
          {isPanelCollapsed ? (
            <IconLayoutSidebarLeftExpand className="w-6 h-6 text-slate-500 hover:text-slate-800 transition-colors duration-300" />
          ) : (
            <IconLayoutSidebarRightExpand className="w-6 h-6 text-slate-500 hover:text-slate-800 transition-colors duration-300" />
          )}
        </button>
      </div>
    </div>
  );
} 