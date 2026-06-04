import { memo } from 'react';
import { PLATFORMS } from '../../utils/constants';

/**
 * PlatformSelector — the grid of platform cards used in both CreateProject and EditProject modals.
 * Previously duplicated verbatim in both modals.
 *
 * <PlatformSelector value={platform} onChange={setPlatform} />
 */
const PlatformSelector = memo(function PlatformSelector({ value, onChange }) {
  return (
    <div className="platform-grid">
      {PLATFORMS.map(p => (
        <button
          key={p.key}
          type="button"
          className={`platform-card${value === p.key ? ' selected' : ''}`}
          onClick={() => onChange(p.key)}
        >
          {value === p.key && (
            <span className="platform-check">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </span>
          )}
          <div className="platform-icon">{p.icon}</div>
          <span className="platform-label">
            {p.label.split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br/>}</span>
            ))}
          </span>
        </button>
      ))}
    </div>
  );
});

export default PlatformSelector;
