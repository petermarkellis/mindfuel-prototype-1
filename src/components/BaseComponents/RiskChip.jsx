import React from 'react';

// Risk chip component using Tailwind color classes
const RiskChip = ({ risk, size = 'sm', onClick, className = '' }) => {
  const getRiskClass = (riskLevel) => {
    switch ((riskLevel || '').toLowerCase()) {
      case 'low':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'notset':
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getRiskLabel = (riskLevel) => {
    switch ((riskLevel || '').toLowerCase()) {
      case 'low':
        return 'Low';
      case 'medium':
        return 'Medium';
      case 'high':
        return 'High';
      case 'critical':
        return 'Critical';
      case 'notset':
      default:
        return 'Not Set';
    }
  };

  const getSizeClasses = (size) => {
    switch (size) {
      case 'xs':
        return 'px-1.5 py-0.5 text-xs';
      case 'sm':
        return 'px-2 py-1 text-sm';
      case 'md':
        return 'px-2.5 py-1.5 text-sm';
      case 'lg':
        return 'px-3 py-2 text-base';
      default:
        return 'px-2 py-1 text-sm';
    }
  };

  const baseClasses = 'inline-flex items-center font-medium rounded-md border transition-colors';
  const riskClass = getRiskClass(risk);
  const sizeClasses = getSizeClasses(size);
  const clickableClasses = onClick ? 'cursor-pointer hover:opacity-80' : '';

  return (
    <span
      className={`${baseClasses} ${riskClass} ${sizeClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {getRiskLabel(risk)}
    </span>
  );
};

export default RiskChip;
