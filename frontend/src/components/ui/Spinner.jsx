/**
 * Spinner — all loading states in one place.
 *
 * <Spinner />            → medium, inline
 * <Spinner size="lg" />  → large
 * <Spinner size="sm" />  → small (used inside buttons)
 * <PageLoader />         → full-page centered spinner (route transitions, initial data load)
 * <SectionLoader />      → in-tab / in-panel centered spinner
 */

export default function Spinner({ size = 'md', className = '' }) {
  const cls = [
    'spinner',
    size === 'lg' ? 'spinner-lg' : size === 'sm' ? 'spinner-sm' : '',
    className,
  ].filter(Boolean).join(' ');
  return <div className={cls} />;
}

export function PageLoader({ className = '' }) {
  return (
    <div className={`page-loader ${className}`.trim()} style={{ textAlign: 'center', padding: '60px' }}>
      <Spinner size="lg" />
    </div>
  );
}

export function SectionLoader({ padding = 40 }) {
  return (
    <div style={{ textAlign: 'center', padding }}>
      <Spinner />
    </div>
  );
}
