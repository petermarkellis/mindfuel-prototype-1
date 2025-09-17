import React from 'react';

const Chip = ({ type, size = 'sm', variant = 'default' }) => {
  // Get color classes based on node type
  const getColorClassForType = (type) => {
    switch (type) {
      case 'Opportunity':
        return 'text-orange-700';
      case 'Product':
      case 'Data Product':
        return 'text-purple-700';
      case 'Asset':
      case 'Data Asset':
        return 'text-blue-700';
      case 'Data Source':
      case 'Source':
        return 'text-green-700';
      default:
        return 'text-slate-700';
    }
  };

  const getSubtleColorClassForType = (type) => {
    switch (type) {
      case 'Opportunity':
        return 'bg-orange-50';
      case 'Product':
      case 'Data Product':
        return 'bg-purple-50';
      case 'Asset':
      case 'Data Asset':
        return 'bg-blue-50';
      case 'Data Source':
      case 'Source':
        return 'bg-green-50';
      default:
        return 'bg-slate-50';
    }
  };

  // Size variants
  const sizeClasses = {
    xs: 'text-xs px-2 py-0.5',
    sm: 'text-sm px-3 py-1',
    md: 'text-base px-4 py-1.5',
    lg: 'text-lg px-5 py-2'
  };

  // Variant styles
  const variantClasses = {
    default: 'border border-slate-200',
    outline: 'border-2',
    filled: 'border-0',
    ghost: 'border-0 bg-transparent'
  };

  return (
    <span 
      className={`
        inline-flex items-center font-medium rounded-md
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${getSubtleColorClassForType(type)} 
        ${getColorClassForType(type)}
      `}
    >
      {type}
    </span>
  );
};

export default Chip;
