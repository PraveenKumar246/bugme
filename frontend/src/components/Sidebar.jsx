import { useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useClickOutside } from '../hooks/useClickOutside';
import { getInitials } from '../utils/helpers';
import '../styles/sidebar.css';

const IconApps = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
  </svg>
);

const IconTeams = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconGift = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12"/>
    <rect x="2" y="7" width="20" height="5" rx="1"/>
    <line x1="12" y1="22" x2="12" y2="7"/>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
);

const IconMoon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const IconSun = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14,flexShrink:0}}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14,flexShrink:0}}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

function Sidebar({ onWhatNew, isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);
  const userRef  = useRef(null);

  useClickOutside([popupRef, userRef], () => setShowPopup(false));

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowPopup(false);
    onClose?.();
  };

  const nav = () => onClose?.();

  return (
    <aside className={`sidebar${isOpen ? ' sidebar-open' : ''}`}>
      <NavLink to="/apps" className="sidebar-brand" onClick={nav}>
        <div className="sidebar-brand-icon">🐛</div>
        <span className="sidebar-brand-name">Bugme</span>
      </NavLink>

      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Workspace</span>

        <NavLink
          to="/apps" end
          className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
          data-tip="Projects" onClick={nav}
        >
          <IconApps />
          <span className="sidebar-item-text">Projects</span>
        </NavLink>

        <NavLink
          to="/teams"
          className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
          data-tip="Teams" onClick={nav}
        >
          <IconTeams />
          <span className="sidebar-item-text">Teams</span>
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <button
          className="sidebar-item"
          data-tip="What's New"
          onClick={() => { onWhatNew(); onClose?.(); }}
        >
          <IconGift />
          <span className="sidebar-item-text">What's New</span>
        </button>

        <button className="theme-toggle" onClick={toggleTheme} data-tip={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
          {theme === 'dark' ? <IconSun /> : <IconMoon />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <div style={{ position: 'relative' }}>
          <button ref={userRef} className="sidebar-user" onClick={() => setShowPopup(v => !v)}>
            <div className="sidebar-avatar">{getInitials(user?.name)}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
          </button>

          {showPopup && (
            <div ref={popupRef} className="user-popup">
              <div className="user-popup-head">
                <div className="user-popup-avatar">{getInitials(user?.name)}</div>
                <div className="user-popup-name">{user?.name}</div>
                <div className="user-popup-email">{user?.email}</div>
                <span className="user-popup-plan">✦ Free Plan</span>
              </div>
              <div className="user-popup-actions">
                <NavLink
                  to="/account/profile"
                  className="user-popup-link"
                  onClick={() => { setShowPopup(false); onClose?.(); }}
                >
                  <IconUser /> My Profile
                </NavLink>
                <button className="user-popup-link danger" onClick={handleLogout}>
                  <IconLogout /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
