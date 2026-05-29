// ── String ──────────────────────────────────────────────────────
export const capitalize = s =>
  (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

export const avatarHue = (name = '') =>
  (name.charCodeAt(0) * 37) % 360;

// ── Date ─────────────────────────────────────────────────────────
export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatShortDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export const formatTime = (d) =>
  new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export const formatDateTime = (d) => `${formatDate(d)} at ${formatTime(d)}`;

// ── Tags ─────────────────────────────────────────────────────────
export const parseTags = (str) =>
  str ? str.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [];

// ── Steps ─────────────────────────────────────────────────────────
export const parseSteps = (str) =>
  str
    ? str.split('\n')
        .map((s, i) => ({ step: i + 1, action: s.trim() }))
        .filter(s => s.action)
    : [];
