import React from 'react';

const NewItemCard = ({ 
  title, 
  description, 
  icon: Icon, 
  iconColor, 
  iconBgColor, 
  borderColor,
  onClick,
  cardBGColor,
  cardBGHoverColor,
  className = ""
}) => {
  // Map the hover colors to proper Tailwind classes
  const getHoverClass = (hoverColor) => {
    switch (hoverColor) {
      case 'bg-orange-50':
        return 'hover:bg-orange-50';
      case 'bg-purple-50':
        return 'hover:bg-purple-50';
      case 'bg-blue-50':
        return 'hover:bg-blue-50';
      case 'bg-green-50':
        return 'hover:bg-green-50';
      default:
        return 'hover:bg-slate-100';
    }
  };

  // Map icon background colors to their darker hover variants
  const getIconHoverClass = (iconBgColor) => {
    switch (iconBgColor) {
      case 'bg-orange-50':
        return 'group-hover:bg-orange-100';
      case 'bg-purple-50':
        return 'group-hover:bg-purple-100';
      case 'bg-blue-50':
        return 'group-hover:bg-blue-100';
      case 'bg-green-50':
        return 'group-hover:bg-green-100';
      default:
        return 'group-hover:bg-slate-200';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        group p-6 ${cardBGColor} border-2 rounded-xl 
        hover:shadow-xl hover:scale-[1.02] ${getHoverClass(cardBGHoverColor)}
        transition-all duration-300 ease-out cursor-pointer
        text-left md:text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        w-full flex flex-row md:flex-col items-start md:items-center
        ${borderColor}
        ${className}
      `}
    >
      {/* Icon Container */}
      <div className={`
        w-10 h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-4
        border-2 border-dashed transition-colors duration-300 mr-6 sm:mr-6 md:mr-4
        ${iconBgColor} ${iconColor} ${getIconHoverClass(iconBgColor)}
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