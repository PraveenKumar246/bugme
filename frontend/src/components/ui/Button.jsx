/**
 * Button — wraps the app's btn/btn-primary CSS system with built-in loading state.
 *
 * <Button variant="primary" loading={isPending} onClick={...}>
 *   {isPending ? 'Saving…' : 'Save Changes'}
 * </Button>
 *
 * Variants: primary | secondary | danger | ghost
 * Sizes:    (default) | sm
 */
export default function Button({
  children,
  variant   = 'primary',
  size,
  loading   = false,
  disabled  = false,
  type      = 'button',
  className = '',
  style,
  ...rest
}) {
  const spinnerColor = variant === 'primary' || variant === 'danger' ? 'white' : 'accent';
  const cls = [
    'btn',
    `btn-${variant}`,
    size === 'sm' ? 'btn-sm' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button type={type} className={cls} disabled={disabled || loading} style={style} {...rest}>
      {loading && (
        <span className={`spinner spinner-${spinnerColor} spinner-sm`} />
      )}
      {children}
    </button>
  );
}
