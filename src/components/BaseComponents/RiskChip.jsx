import React from 'react';

const RISK_STYLES = {
  low: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-700',
  medium: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700',
  high: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-700',
  critical: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-600',
  notset: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600',
};

const RiskChip = ({ risk, size = 'sm', onClick, className = '' }) => {
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

  const riskKey = (risk || '').toLowerCase() || 'notset';
  const riskClass = RISK_STYLES[riskKey] ?? RISK_STYLES.notset;
  const clickableClasses = onClick ? 'cursor-pointer hover:opacity-80' : '';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border transition-colors ${riskClass} ${getSizeClasses(size)} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {getRiskLabel(risk)}
    </span>
  );
};

export default RiskChip;
