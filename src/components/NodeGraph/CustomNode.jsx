import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { CodeBracketSquareIcon,
  ArrowsRightLeftIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline'
import { IconDatabase, IconRecharging, IconBox, IconLayersSelected } from '@tabler/icons-react';

const ENTITY_TOKENS = {
  Opportunity: {
    fg: 'var(--entity-opportunity-fg)',
    bg: 'var(--entity-opportunity-bg)',
    border: 'var(--entity-opportunity-border)',
  },
  Product: {
    fg: 'var(--entity-product-fg)',
    bg: 'var(--entity-product-bg)',
    border: 'var(--entity-product-border)',
  },
  'Data Product': {
    fg: 'var(--entity-product-fg)',
    bg: 'var(--entity-product-bg)',
    border: 'var(--entity-product-border)',
  },
  'Data Asset': {
    fg: 'var(--entity-data-asset-fg)',
    bg: 'var(--entity-data-asset-bg)',
    border: 'var(--entity-data-asset-border)',
  },
  Asset: {
    fg: 'var(--entity-data-asset-fg)',
    bg: 'var(--entity-data-asset-bg)',
    border: 'var(--entity-data-asset-border)',
  },
  'Data Source': {
    fg: 'var(--entity-data-source-fg)',
    bg: 'var(--entity-data-source-bg)',
    border: 'var(--entity-data-source-border)',
  },
  Source: {
    fg: 'var(--entity-data-source-fg)',
    bg: 'var(--entity-data-source-bg)',
    border: 'var(--entity-data-source-border)',
  },
};

const getEntityTokens = (type) =>
  ENTITY_TOKENS[type] ?? {
    fg: 'var(--app-text-muted)',
    bg: 'var(--app-surface-muted)',
    border: 'var(--app-border)',
  };

const CustomNode = ({ data, nodes = [] }) => {
  const entity = getEntityTokens(data.type);

  return (
    <div className="rounded-2xl bg-[var(--color-node-bg)] text-[var(--app-text-muted)] border-4 border-[var(--app-border)] min-w-[400px] max-w-[800px] group relative" onClick={nodeInteractionHandler}>
      {/* Category label positioned at top-left corner, completely above card */}
      <div
        className="absolute -top-[97px] left-0 z-10 inline-flex items-center gap-3 font-medium rounded-3xl text-[32px] font-bold px-7 py-3.5 border-2"
        style={{
          color: entity.fg,
          backgroundColor: entity.bg,
          borderColor: entity.border,
        }}
      >
        {data.type === 'Data Source' && (
          <IconDatabase className="w-14 h-14" style={{ color: entity.fg }} />
        )}
        {data.type === 'Opportunity' && (
          <IconRecharging className="w-14 h-14" style={{ color: entity.fg }} />
        )}
        {data.type === 'Product' && (
          <IconBox className="w-14 h-14" style={{ color: entity.fg }} />
        )}
        {data.type === 'Data Asset' && (
          <IconLayersSelected className="w-14 h-14" style={{ color: entity.fg }} />
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
          <CodeBracketSquareIcon className="size-8 text-[var(--app-text-muted)]" strokeWidth={2} />
          <ArrowsRightLeftIcon className="size-8 text-[var(--app-text-muted)]" strokeWidth={2} />
        </div>
        <div className="cursor-pointer relative">
          <EllipsisHorizontalIcon className="size-8 text-[var(--app-text-muted)]" strokeWidth={2} />
        </div>
      </div>

      <Handle type="target" position={Position.Top} id="t" className="custom-handle w-2 h-2 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-opacity transition-transform duration-300 ease-out" 
        style={{
          width: 20,
          height: 20,
          background: entity.fg,
          border: '2px solid var(--color-node-bg)',
          borderRadius: '50%',
          top: -8,
        }}
      />
      <Handle type="source" position={Position.Bottom} id="b" className="custom-handle w-2 h-2 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-opacity transition-transform duration-300 ease-out" 
        style={{
          width: 20,
          height: 20,
          background: entity.fg,
          border: '2px solid var(--color-node-bg)',
          borderRadius: '50%',
          bottom: -8,
        }}
      />
      <Handle type="target" position={Position.Left} id="l" className="custom-handle w-2 h-2 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-opacity transition-transform duration-300 ease-out" 
        style={{
          width: 20,
          height: 20,
          background: entity.fg,
          border: '2px solid var(--color-node-bg)',
          borderRadius: '50%',
          left: -8,
        }}
      />
      <Handle type="source" position={Position.Right} id="r" className="custom-handle w-2 h-2 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-opacity transition-transform duration-300 ease-out" 
        style={{
          width: 20,
          height: 20,
          background: entity.fg,
          border: '2px solid var(--color-node-bg)',
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
