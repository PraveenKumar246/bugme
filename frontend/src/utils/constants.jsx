// ── Issue / Status ─────────────────────────────────────────────
export const STATUS_CONFIG = {
  open:        { label: 'Open',        color: '#3b82f6', bg: '#eff6ff' },
  in_progress: { label: 'In Progress', color: '#f59e0b', bg: '#fffbeb' },
  closed:      { label: 'Closed',      color: '#10b981', bg: '#ecfdf5' },
};

export const PRIORITY_CONFIG = {
  low:      { label: 'Low',      color: '#6b7280', bg: '#f3f4f6' },
  medium:   { label: 'Medium',   color: '#f59e0b', bg: '#fffbeb' },
  high:     { label: 'High',     color: '#f97316', bg: '#fff7ed' },
  critical: { label: 'Critical', color: '#ef4444', bg: '#fef2f2' },
};

export const SEVERITY_CONFIG = {
  low:      { label: 'Low',      color: '#6b7280' },
  medium:   { label: 'Medium',   color: '#3b82f6' },
  high:     { label: 'High',     color: '#f97316' },
  critical: { label: 'Critical', color: '#ef4444' },
};

export const TYPE_CONFIG = {
  bug:         { label: 'Bug',         icon: '🐛' },
  improvement: { label: 'Improvement', icon: '✨' },
  observation: { label: 'Observation', icon: '👁'  },
  suggestion:  { label: 'Suggestion',  icon: '💡' },
};

// ── Test Case Status ────────────────────────────────────────────
export const TC_STATUS_CONFIG = {
  untested:    { label: 'Untested',    color: '#6b7280', bg: '#f3f4f6' },
  pass:        { label: 'Pass',        color: '#10b981', bg: '#ecfdf5' },
  fail:        { label: 'Fail',        color: '#ef4444', bg: '#fef2f2' },
  in_progress: { label: 'In Progress', color: '#f59e0b', bg: '#fffbeb' },
  skipped:     { label: 'Skipped',     color: '#8b5cf6', bg: '#f5f3ff' },
};

// ── Sprint Status ───────────────────────────────────────────────
export const SPRINT_STATUS_CONFIG = {
  planned:   { label: 'Planned',   color: '#6b7280', bg: '#f3f4f6' },
  active:    { label: 'Active',    color: '#10b981', bg: '#ecfdf5' },
  completed: { label: 'Completed', color: '#8b5cf6', bg: '#f5f3ff' },
};

// ── Platforms ───────────────────────────────────────────────────
export const PLATFORMS = [
  {
    key: 'android', label: 'Android',
    icon: (
      <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 18h28v14a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3V18z"/>
        <path d="M13 18v-5a9 9 0 0 1 18 0v5"/>
        <circle cx="17" cy="25" r="1.8" fill="currentColor" stroke="none"/>
        <circle cx="27" cy="25" r="1.8" fill="currentColor" stroke="none"/>
        <line x1="15" y1="8" x2="12" y2="5"/><line x1="29" y1="8" x2="32" y2="5"/>
        <line x1="4" y1="20" x2="4" y2="27"/><line x1="40" y1="20" x2="40" y2="27"/>
      </svg>
    ),
  },
  {
    key: 'android_mobile_web', label: 'Android\nMobile Web',
    icon: (
      <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="8" width="18" height="28" rx="2.5"/>
        <line x1="7" y1="30" x2="17" y2="30"/>
        <circle cx="12" cy="33" r="1" fill="currentColor" stroke="none"/>
        <rect x="23" y="10" width="18" height="14" rx="2"/>
        <line x1="27" y1="24" x2="37" y2="24"/>
        <line x1="32" y1="24" x2="32" y2="27"/>
        <line x1="28" y1="27" x2="36" y2="27"/>
      </svg>
    ),
  },
  {
    key: 'ios', label: 'iOS',
    icon: (
      <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="10" y="3" width="24" height="38" rx="4"/>
        <line x1="17" y1="8" x2="27" y2="8"/>
        <circle cx="22" cy="37" r="1.5"/>
        <path d="M22 15c0-2 1.5-3.5 3-3.5-.8 1.5-.8 3 0 4.5-1.5 0-3-1-3-1z" fill="currentColor" stroke="none"/>
        <path d="M18 21c0-3 1.8-5 4-5s4 2 4 5-1.8 6-4 6-4-3-4-6z"/>
      </svg>
    ),
  },
  {
    key: 'ios_mobile_web', label: 'iOS Mobile\nWeb',
    icon: (
      <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="8" width="18" height="28" rx="2.5"/>
        <line x1="7" y1="30" x2="17" y2="30"/>
        <circle cx="12" cy="33" r="1" fill="currentColor" stroke="none"/>
        <path d="M12 13c0-1.5 1-2.5 2-2.5-.5.8-.5 1.8 0 2.5-1 0-2-.5-2-.5z" fill="currentColor" stroke="none"/>
        <path d="M9.5 17c0-2 1.2-3.5 2.5-3.5s2.5 1.5 2.5 3.5-1.2 4-2.5 4-2.5-2-2.5-4z"/>
        <rect x="23" y="10" width="18" height="14" rx="2"/>
        <line x1="27" y1="24" x2="37" y2="24"/>
        <line x1="32" y1="24" x2="32" y2="27"/>
        <line x1="28" y1="27" x2="36" y2="27"/>
      </svg>
    ),
  },
  {
    key: 'desktop_web', label: 'Desktop Web',
    icon: (
      <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="7" width="36" height="24" rx="2.5"/>
        <line x1="4" y1="25" x2="40" y2="25"/>
        <line x1="22" y1="31" x2="22" y2="37"/>
        <line x1="15" y1="37" x2="29" y2="37"/>
      </svg>
    ),
  },
  {
    key: 'multi_platform', label: 'Multi\nPlatform',
    icon: (
      <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="10" width="24" height="18" rx="2"/>
        <line x1="2" y1="23" x2="26" y2="23"/>
        <line x1="14" y1="28" x2="14" y2="32"/>
        <line x1="9" y1="32" x2="19" y2="32"/>
        <rect x="28" y="14" width="14" height="18" rx="2"/>
        <line x1="31" y1="29" x2="39" y2="29"/>
        <circle cx="35" cy="31" r="0.8" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
];

export const ISSUE_STATUSES   = Object.keys(STATUS_CONFIG);
export const ISSUE_PRIORITIES = Object.keys(PRIORITY_CONFIG);
export const ISSUE_SEVERITIES = Object.keys(SEVERITY_CONFIG);
export const ISSUE_TYPES      = Object.keys(TYPE_CONFIG);
export const TC_STATUSES      = Object.keys(TC_STATUS_CONFIG);
export const SPRINT_STATUSES  = Object.keys(SPRINT_STATUS_CONFIG);
