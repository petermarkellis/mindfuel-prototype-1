import React from 'react';
import { IconRecharging, IconBox, IconLayersSelected, IconDatabase } from '@tabler/icons-react';

const CHIP_STYLES = {
  Opportunity: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-700',
  Product: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-700',
  'Data Product': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-700',
  'Data Asset': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700',
  Asset: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700',
  'Data Source': 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-700',
  Source: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-700',
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

const CHIP_ICON_COLORS = {
  Opportunity: 'text-orange-500 dark:text-orange-400',
  Product: 'text-purple-600 dark:text-purple-400',
  'Data Product': 'text-purple-600 dark:text-purple-400',
  'Data Asset': 'text-blue-600 dark:text-blue-400',
  Asset: 'text-blue-600 dark:text-blue-400',
  'Data Source': 'text-green-600 dark:text-green-400',
  Source: 'text-green-600 dark:text-green-400',
};

const Chip = ({ type, size = 'sm', variant = 'default', showIcon = true, className = '' }) => {
  const typeStyles = CHIP_STYLES[type] ?? 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-600';
  const IconComponent = CHIP_ICONS[type];
  const iconColor = CHIP_ICON_COLORS[type] ?? 'text-slate-500 dark:text-slate-400';

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

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-md
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${typeStyles}
        ${className}
      `}
    >
      {showIcon && IconComponent && (
        <IconComponent className={`flex-shrink-0 ${iconSizeClasses[size]} ${iconColor}`} strokeWidth={2} />
      )}
      <span className="truncate">{type}</span>
    </span>
  );
};

export default Chip;
