import './OutlineButton.css';

export default function OutlineButton({
  children,
  className = '',
  disabled = false,
  title,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`outline-btn ${className}`.trim()}
      disabled={disabled}
      title={title}
      aria-disabled={disabled || undefined}
      {...props}
    >
      {children}
    </button>
  );
}
