import '../styles/whats-new.css';

const FEATURES = [
  {
    id: 1,
    type: 'improvement',
    typeLabel: 'Improvement',
    date: 'May 20, 2026',
    title: 'Redesigned Sidebar for Better Navigation',
    desc: 'The left sidebar has been redesigned with a cleaner icon-only layout. Tooltips now appear on hover and the active state is more visible at a glance.',
    emoji: '🗂️',
  },
  {
    id: 2,
    type: 'new-feature',
    typeLabel: 'New Feature',
    date: 'May 15, 2026',
    title: 'Teams — Collaborate with Your Squad',
    desc: 'You can now create teams, invite members by email, and manage who has access to your projects. Team-based workflows are now fully supported.',
    emoji: '👥',
  },
  {
    id: 3,
    type: 'improvement',
    typeLabel: 'Improvement',
    date: 'May 10, 2026',
    title: 'Project Cards Now Show Issue Counts',
    desc: 'Each project card on the dashboard now displays open and closed issue counts so you can gauge project health at a glance without opening the project.',
    emoji: '📊',
  },
  {
    id: 4,
    type: 'new-feature',
    typeLabel: 'New Feature',
    date: 'May 5, 2026',
    title: 'User Profile & Avatar Customization',
    desc: 'Set up your profile, choose an avatar, and update your display name. Your avatar now appears in the sidebar and in team member lists.',
    emoji: '🎨',
  },
  {
    id: 5,
    type: 'fix',
    typeLabel: 'Fix',
    date: 'April 28, 2026',
    title: 'Auth Token Refresh Fixed',
    desc: 'Fixed an issue where logged-in sessions would expire unexpectedly. Sessions now correctly persist for 7 days as intended.',
    emoji: '🔐',
  },
];

function WhatNew({ onClose }) {
  return (
    <>
      <div className="whats-new-overlay" onClick={onClose} />
      <div className="whats-new-panel">
        <div className="wn-header">
          <div className="wn-title-wrap">
            <div className="wn-icon">🎁</div>
            <span className="wn-title">What's New</span>
          </div>
          <button className="wn-close" onClick={onClose}>×</button>
        </div>

        <div className="wn-body">
          {FEATURES.map(f => (
            <div key={f.id} className="wn-card">
              <div className="wn-card-header">
                <span className={`wn-badge ${f.type}`}>{f.typeLabel}</span>
                <span className="wn-date">{f.date}</span>
              </div>
              <div className="wn-card-image">{f.emoji}</div>
              <div className="wn-card-body">
                <div className="wn-card-title">{f.title}</div>
                <div className="wn-card-desc">{f.desc}</div>
                <button className="wn-read-more">Read More →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default WhatNew;
