/**
 * StatStrip — the row of stat pills shown at the top of list pages.
 *
 * <StatStrip stats={[
 *   { icon: '📁', val: 12,  label: 'Total Projects' },
 *   { icon: '🐛', val: 45,  label: 'Open Issues',   iconClass: 'indigo' },
 *   { icon: '✅', val: 120, label: 'Closed Issues',  iconClass: 'green'  },
 * ]} />
 */
export default function StatStrip({ stats }) {
  return (
    <div className="stats-strip">
      {stats.map(({ icon, iconClass = 'indigo', val, label }) => (
        <div key={label} className="stat-pill">
          <div className={`stat-pill-icon ${iconClass}`}>{icon}</div>
          <div>
            <div className="stat-pill-val">{val}</div>
            <div className="stat-pill-label">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
