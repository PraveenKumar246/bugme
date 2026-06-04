/**
 * SearchInput — search bar with the magnifier icon.
 * Defined once, used in Projects, Teams, ProjectDetail, etc.
 *
 * <SearchInput value={q} onChange={e => setQ(e.target.value)} placeholder="Search projects…" />
 */
export default function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`search-input-wrap${className ? ' ' + className : ''}`}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
