import React from 'react';

const NewItemCard = ({
  title,
  description,
  icon: Icon,
  iconColor,
  iconBgColor,
  iconBgHoverColor,
  onClick,
  cardBGColor,
  cardBGHoverColor,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        group relative p-6 ${cardBGColor} border-2 rounded-xl
        hover:shadow-xl hover:scale-[1.02] ${cardBGHoverColor}
        transition-all duration-300 ease-out cursor-pointer
        text-left md:text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[var(--app-surface)]
        w-full flex flex-row md:flex-col items-start md:items-center
        border-[var(--app-border)] md:border-transparent
        ${className}
      `}
    >
      <div
        className={`
        w-10 h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-4
        border-2 border-dashed border-[var(--app-border)] transition-colors duration-300 mr-6 sm:mr-6 md:mr-4
        ${iconBgColor} ${iconColor} ${iconBgHoverColor}
      `}
      >
        <Icon className="w-8 h-8" strokeWidth={2} />
      </div>

      <div className="flex-1 flex flex-col space-y-2 md:items-center">
        <h3 className="text-lg font-semibold text-[var(--app-text)]">{title}</h3>
        <p className="text-sm text-[var(--app-text-muted)] leading-relaxed flex-1">{description}</p>
      </div>

      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent to-[var(--app-surface-muted)] opacity-0 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none" />
    </button>
  );
};

export default NewItemCard;
