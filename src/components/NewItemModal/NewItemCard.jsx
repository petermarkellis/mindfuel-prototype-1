import React from 'react';

const NewItemCard = ({ 
  title, 
  description, 
  icon: Icon, 
  iconColor, 
  iconBgColor, 
  borderColor,
  onClick,
  className = ""
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        group relative w-full p-6 bg-white border-2 rounded-xl 
        hover:shadow-lg hover:scale-[1.02] hover:border-slate-400
        transition-all duration-300 ease-out cursor-pointer
        text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        flex flex-col items-center
        ${borderColor}
        ${className}
      `}
    >
      {/* Icon Container */}
      <div className={`
        w-16 h-16 rounded-full flex items-center justify-center mb-4
        border-2 border-dashed transition-colors duration-300
        ${iconBgColor} ${iconColor}
      `}>
        <Icon className="w-8 h-8" strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col space-y-2">
        <h3 className="text-lg font-semibold text-slate-800 group-hover:text-slate-900">
          {title}
        </h3>
        <p className="text-sm text-slate-800 leading-relaxed flex-1">
          {description}
        </p>
      </div>

      {/* Hover highlight */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </button>
  );
};

export default NewItemCard; 