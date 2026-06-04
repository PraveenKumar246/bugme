/**
 * PageHeader — the top banner used on every main page.
 *
 * <PageHeader
 *   title="Projects"
 *   subtitle="Manage and track all your bug-tracking projects."
 *   action={<button className="btn btn-primary">+ New Project</button>}
 * />
 */
export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div className="page-header-text">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
