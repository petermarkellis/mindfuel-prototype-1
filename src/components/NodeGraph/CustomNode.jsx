import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { CodeBracketSquareIcon,
  ArrowsRightLeftIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline'
import { IconDatabase, IconRecharging, IconBox, IconLayersSelected } from '@tabler/icons-react';
import { useTheme } from '../../theme/ThemeContext';

const ENTITY_BADGE_STYLES = {
  Opportunity: {
    light: 'bg-orange-50 text-orange-700 border-orange-200',
    dark: 'dark:bg-orange-950/50 dark:text-orange-100 dark:border-orange-600',
    iconLight: '#f59e42',
    iconDark: '#fdba74',
  },
  Product: {
    light: 'bg-purple-50 text-purple-700 border-purple-200',
    dark: 'dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-600',
    iconLight: '#7c3aed',
    iconDark: '#c4b5fd',
  },
  'Data Product': {
    light: 'bg-purple-50 text-purple-700 border-purple-200',
    dark: 'dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-600',
    iconLight: '#7c3aed',
    iconDark: '#c4b5fd',
  },
  'Data Asset': {
    light: 'bg-blue-50 text-blue-700 border-blue-200',
    dark: 'dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-600',
    iconLight: '#2563eb',
    iconDark: '#93c5fd',
  },
  Asset: {
    light: 'bg-blue-50 text-blue-700 border-blue-200',
    dark: 'dark:bg-blue-950 dark:text-blue-300 dark:border-blue-600',
    iconLight: '#2563eb',
    iconDark: '#93c5fd',
  },
  'Data Source': {
    light: 'bg-green-50 text-green-700 border-green-200',
    dark: 'dark:bg-green-950/40 dark:text-green-300 dark:border-green-600',
    iconLight: '#059669',
    iconDark: '#6ee7b7',
  },
  Source: {
    light: 'bg-green-50 text-green-700 border-green-200',
    dark: 'dark:bg-green-950/40 dark:text-green-300 dark:border-green-600',
    iconLight: '#059669',
    iconDark: '#6ee7b7',
  },
};

const getEntityBadgeStyles = (type, isDark) => {
  const styles = ENTITY_BADGE_STYLES[type] ?? {
    light: 'bg-slate-50 text-slate-700 border-slate-200',
    dark: 'dark:bg-slate-900 dark:text-slate-300 dark:border-slate-600',
    iconLight: '#64748b',
    iconDark: '#94a3b8',
  };
  return {
    className: `${styles.light} ${styles.dark}`,
    iconColor: isDark ? styles.iconDark : styles.iconLight,
  };
};

const getHandleColorForType = (type) => {
  switch (type) {
    case 'Opportunity':
      return '#f59e42'; // opportunity-500
    case 'Product':
    case 'Data Product':
      return '#7c3aed'; // product-600
    case 'Asset':
    case 'Data Asset':
      return '#2563eb'; // data-asset-600
    case 'Data Source':
    case 'Source':
      return '#059669'; // data-source-600
    default:
      return '#64748b'; // slate-500
  }
};

const CustomNode = ({ data, nodes = [] }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const { className: entityBadgeClass, iconColor } = getEntityBadgeStyles(data.type, isDark);

  return (
    <div className="rounded-2xl bg-[var(--color-node-bg)] text-[var(--app-text-muted)] border-4 border-[var(--app-border)] min-w-[400px] max-w-[800px] group relative" onClick={nodeInteractionHandler}>
      {/* Category label positioned at top-left corner, completely above card */}
      <div className={`absolute -top-[97px] left-0 z-10 inline-flex items-center gap-3 font-medium rounded-3xl text-[32px] font-bold px-7 py-3.5 border-2 ${entityBadgeClass}`}>
        {data.type === 'Data Source' && (
          <IconDatabase className="w-14 h-14" style={{ color: iconColor }} />
        )}
        {data.type === 'Opportunity' && (
          <IconRecharging className="w-14 h-14" style={{ color: iconColor }} />
        )}
        {data.type === 'Product' && (
          <IconBox className="w-14 h-14" style={{ color: iconColor }} />
        )}
        {data.type === 'Data Asset' && (
          <IconLayersSelected className="w-14 h-14" style={{ color: iconColor }} />
        )}
        {data.type}
      </div>
      
      <div className="px-6 py-8">
        <div className="text-4xl font-medium truncate text-left capitalize w-full text-[var(--app-text)] hover:opacity-90 transition-opacity duration-300">
          {data.name}
        </div>
      </div>
      <div className="w-full h-px bg-[var(--app-border-subtle)]"></div>

      <div className="px-6 py-3 flex flex-row w-full items-center justify-between bg-[var(--app-surface-muted)]">
        <div className="flex flex-row gap-2">
          <CodeBracketSquareIcon className="size-8 text-slate-500" strokeWidth={2} />
          <ArrowsRightLeftIcon className="size-8 text-slate-500" strokeWidth={2} />
        </div>
        <div className="cursor-pointer relative">
          <EllipsisHorizontalIcon className="size-8 text-slate-500" strokeWidth={2} />
        </div>
      </div>

      <Handle type="target" position={Position.Top} id="t" className="custom-handle w-2 h-2 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out" 
        style={{
          width: 20,
          height: 20,
          background: getHandleColorForType(data.type),
          border: '2px solid #fff',
          borderRadius: '50%',
          top: -8,
        }}
      />
      <Handle type="source" position={Position.Bottom} id="b" className="custom-handle w-2 h-2 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out" 
        style={{
          width: 20,
          height: 20,
          background: getHandleColorForType(data.type),
          border: '2px solid #fff',
          borderRadius: '50%',
          bottom: -8,
        }}
      />
      <Handle type="target" position={Position.Left} id="l" className="custom-handle w-2 h-2 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out" 
        style={{
          width: 20,
          height: 20,
          background: getHandleColorForType(data.type),
          border: '2px solid #fff',
          borderRadius: '50%',
          left: -8,
        }}
      />
      <Handle type="source" position={Position.Right} id="r" className="custom-handle w-2 h-2 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out" 
        style={{
          width: 20,
          height: 20,
          background: getHandleColorForType(data.type),
          border: '2px solid #fff',
          borderRadius: '50%',
          right: -8,
        }}
      />
    </div>
  );
}

const nodeInteractionHandler = (data) => {
  // Handle node interaction
};

export default memo(CustomNode);
