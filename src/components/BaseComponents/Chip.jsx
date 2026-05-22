import React from 'react';
import { IconRecharging, IconBox, IconLayersSelected, IconDatabase } from '@tabler/icons-react';

const CHIP_TOKENS = {
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

const CHIP_ICONS = {
  Opportunity: IconRecharging,
  Product: IconBox,
  'Data Product': IconBox,
  'Data Asset': IconLayersSelected,
  Asset: IconLayersSelected,
  'Data Source': IconDatabase,
  Source: IconDatabase,
};

const Chip = ({
  type,
  name,
  size = 'sm',
  variant = 'default',
  showIcon = true,
  className = '',
  truncateLabel = true,
}) => {
  const hasTitle = Boolean(name?.trim());
  const labelClass = truncateLabel ? 'truncate' : 'whitespace-nowrap';
  const tokens = CHIP_TOKENS[type] ?? {
    fg: 'var(--app-text-muted)',
    bg: 'var(--app-surface-muted)',
    border: 'var(--app-border)',
  };
  const IconComponent = CHIP_ICONS[type];

  const sizeClasses = {
    xs: 'text-xs px-2 py-0.5 gap-1',
    sm: 'text-sm px-3 py-1 gap-1.5',
    md: 'text-base px-4 py-1.5 gap-1.5',
    lg: 'text-lg px-5 py-2 gap-2',
    xl: 'text-xl px-6 py-2.5 gap-2 font-semibold',
  };

  const iconSizeClasses = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-5 h-5',
  };

  const variantClasses = {
    default: 'border',
    outline: 'border-2',
    filled: 'border-0',
    ghost: 'border-0 bg-transparent',
  };

  const chipStyle =
    variant === 'ghost'
      ? { color: tokens.fg }
      : {
          color: tokens.fg,
          backgroundColor: tokens.bg,
          borderColor: tokens.border,
        };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-md
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      style={chipStyle}
    >
      {showIcon && IconComponent ? (
        <IconComponent
          className={`flex-shrink-0 ${iconSizeClasses[size]}`}
          style={{ color: tokens.fg }}
          strokeWidth={2}
        />
      ) : null}
      {hasTitle ? (
        <span className={`inline-flex items-baseline gap-1 min-w-0 ${labelClass}`}>
          <span className="shrink-0">{type}:</span>
          <span className={labelClass}>{name.trim()}</span>
        </span>
      ) : (
        <span className={labelClass}>{type}</span>
      )}
    </span>
  );
};

export default Chip;
