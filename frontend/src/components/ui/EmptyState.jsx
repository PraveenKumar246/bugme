/**
 * EmptyState — reusable empty-screen placeholder.
 *
 * <EmptyState
 *   icon="📁"
 *   title="No projects yet"
 *   description="Create your first project to get started."
 *   action={<button onClick={...}>+ Create Project</button>}
 * />
 */
export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      {icon        && <div className="empty-state-icon">{icon}</div>}
      {title       && <h3>{title}</h3>}
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
