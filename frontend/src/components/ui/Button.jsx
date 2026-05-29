export default function Button({
  children,
  variant = 'primary',   // primary | secondary | danger | ghost
  size = 'md',           // sm | md | lg
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  style,
  ...props
}) {
  const base = 'ui-btn';
  const cls  = [base, `ui-btn--${variant}`, `ui-btn--${size}`, className].filter(Boolean).join(' ');
  return (
    <button
      type={type}
      className={cls}
      disabled={disabled || loading}
      onClick={onClick}
      style={style}
      {...props}
    >
      {loading
        ? <><span className={`spinner spinner-${variant === 'primary' ? 'white' : 'accent'} spinner-sm`} /> {typeof children === 'string' ? children.replace(/…$/, '') + '…' : children}</>
        : children
      }
    </button>
  );
}
