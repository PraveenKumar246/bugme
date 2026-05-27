import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService, teamService } from '../services/api';
import '../styles/projects.css';

const TABS = [
  { key: 'all',        label: 'All' },
  { key: 'mine',       label: 'My Projects' },
  { key: 'favourites', label: 'Favourites' },
];

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

function ProjectCard({ project, onDelete }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = project.name.slice(0, 2).toUpperCase();
  const open   = parseInt(project.open_issues)   || 0;
  const closed = parseInt(project.closed_issues) || 0;
  const total  = parseInt(project.total_issues)  || 0;

  return (
    <div className="project-card" onClick={() => navigate(`/apps/${project.id}`)}>
      <div className="project-card-top">
        <div className="project-icon-wrap">{initials[0]}</div>
        <div className="project-card-meta">
          <div className="project-card-name">
            {project.name}
            <span className="project-lock-icon">🔒</span>
          </div>
          <div className="project-team-name">{project.team_name || 'No Team'}</div>
        </div>
        <div className="project-card-actions" ref={menuRef} onClick={e => e.stopPropagation()}>
          <button className="project-menu-btn" onClick={() => setMenuOpen(v => !v)}>⋯</button>
          {menuOpen && (
            <div className="project-dropdown">
              <button onClick={() => { navigate(`/apps/${project.id}`); setMenuOpen(false); }}>Open</button>
              <button className="danger" onClick={() => { onDelete(project.id); setMenuOpen(false); }}>Delete</button>
            </div>
          )}
        </div>
      </div>

      <div className="project-card-stats">
        <div className="project-stat">
          <span className="project-stat-label">Open</span>
          <span className="project-stat-val open-val">
            {open}<span className="project-stat-total">/{total}</span>
          </span>
        </div>
        <div className="project-stat">
          <span className="project-stat-label">Closed</span>
          <span className="project-stat-val closed-val">
            {closed}<span className="project-stat-total">/{total}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

const PLATFORMS = [
  {
    key: 'android',
    label: 'Android',
    icon: (
      <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 18h28v14a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3V18z"/>
        <path d="M13 18v-5a9 9 0 0 1 18 0v5"/>
        <circle cx="17" cy="25" r="1.8" fill="currentColor" stroke="none"/>
        <circle cx="27" cy="25" r="1.8" fill="currentColor" stroke="none"/>
        <line x1="15" y1="8" x2="12" y2="5"/>
        <line x1="29" y1="8" x2="32" y2="5"/>
        <line x1="4"  y1="20" x2="4"  y2="27"/>
        <line x1="40" y1="20" x2="40" y2="27"/>
      </svg>
    ),
  },
  {
    key: 'android_mobile_web',
    label: 'Android\nMobile Web',
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
    key: 'ios',
    label: 'iOS',
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
    key: 'ios_mobile_web',
    label: 'iOS Mobile\nWeb',
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
    key: 'desktop_web',
    label: 'Desktop Web',
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
    key: 'multi_platform',
    label: 'Multi\nPlatform',
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

function TeamDropdown({ teams, value, onChange, onNewTeam }) {
  const [open, setOpen]             = useState(false);
  const [mode, setMode]             = useState('select'); // 'select' | 'create'
  const [newName, setNewName]       = useState('');
  const [creating, setCreating]     = useState(false);
  const [createErr, setCreateErr]   = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setMode('select');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (mode === 'create' && inputRef.current) inputRef.current.focus();
  }, [mode]);

  const selected = teams.find(t => t.id === value);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setCreateErr('');
    try {
      const res = await teamService.create(newName.trim(), '');
      onNewTeam(res.data);
      setNewName('');
      setMode('select');
      setOpen(false);
    } catch {
      setCreateErr('Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="team-dropdown-wrap" ref={ref}>
      <button
        type="button"
        className={`team-dropdown-trigger${open ? ' open' : ''}`}
        onClick={() => { setOpen(v => !v); setMode('select'); }}
      >
        <span className={selected ? 'td-selected-text' : 'placeholder'}>
          {selected ? selected.name : 'Select your team'}
        </span>
        <svg
          className={`dropdown-chevron${open ? ' flipped' : ''}`}
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="team-dropdown-panel">
          {mode === 'select' ? (
            <>
              <div className="td-list">
                {teams.length === 0 ? (
                  <div className="team-dropdown-empty">No teams yet — create one below</div>
                ) : (
                  teams.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      className={`team-dropdown-item${value === t.id ? ' selected' : ''}`}
                      onClick={() => { onChange(t.id); setOpen(false); }}
                    >
                      <span className="td-item-dot" style={{ background: `hsl(${t.name.charCodeAt(0) * 37 % 360},60%,50%)` }}/>
                      {t.name}
                      {value === t.id && (
                        <svg className="td-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </button>
                  ))
                )}
              </div>
              <div className="team-dropdown-divider"/>
              <button
                type="button"
                className="team-dropdown-create"
                onClick={() => setMode('create')}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Create New Team
              </button>
            </>
          ) : (
            <div className="td-create-panel">
              <div className="td-create-header">
                <button type="button" className="td-back-btn" onClick={() => { setMode('select'); setCreateErr(''); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                <span className="td-create-title">New Team</span>
              </div>
              {createErr && <div className="td-create-err">{createErr}</div>}
              <form onSubmit={handleCreateTeam} className="td-create-form">
                <input
                  ref={inputRef}
                  className="td-create-input"
                  type="text"
                  placeholder="Team name"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  required
                />
                <div className="td-create-actions">
                  <button type="button" className="td-btn-cancel" onClick={() => { setMode('select'); setCreateErr(''); }}>
                    Cancel
                  </button>
                  <button type="submit" className="td-btn-create" disabled={creating || !newName.trim()}>
                    {creating ? 'Creating…' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CreateProjectModal({ onClose, onCreate }) {
  const [name, setProjName]     = useState('');
  const [teamId, setTeamId]     = useState('');
  const [platform, setPlatform] = useState('');
  const [teams, setTeams]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    teamService.getAll().then(r => setTeams(r.data)).catch(() => {});
  }, []);

  const handleNewTeam = (team) => {
    setTeams(prev => [...prev, team]);
    setTeamId(team.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!platform) { setError('Please select a platform to continue.'); return; }
    setLoading(true);
    setError('');
    try {
      await onCreate(name, teamId || null, platform);
      onClose();
    } catch {
      setError('Failed to create project. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay cp-overlay" onClick={onClose}>
      <div className="cp-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="cp-header">
          <div className="cp-header-left">
            <div className="cp-header-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <div>
              <h3 className="cp-title">Create New Project</h3>
              <p className="cp-subtitle">Set up your project workspace</p>
            </div>
          </div>
          <button className="cp-close-btn" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="cp-body">
          {error && (
            <div className="cp-error-banner">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Row 1 */}
            <div className="cp-row">
              <div className="cp-field">
                <label className="cp-label">
                  Project Name <span className="cp-required">*</span>
                </label>
                <input
                  className="cp-input"
                  type="text"
                  placeholder="Enter a project name"
                  value={name}
                  onChange={e => setProjName(e.target.value)}
                  autoFocus required
                />
              </div>
              <div className="cp-field">
                <label className="cp-label">
                  Team <span className="cp-required">*</span>
                </label>
                <TeamDropdown
                  teams={teams}
                  value={teamId}
                  onChange={setTeamId}
                  onNewTeam={handleNewTeam}
                />
              </div>
            </div>

            {/* Platform section */}
            <div className="cp-section">
              <div className="cp-section-label">
                <span className="cp-label">Select Platform <span className="cp-required">*</span></span>
                {platform && (
                  <span className="cp-selected-badge">
                    {PLATFORMS.find(p => p.key === platform)?.label.replace('\n', ' ')}
                  </span>
                )}
              </div>
              <div className="platform-grid">
                {PLATFORMS.map(p => (
                  <button
                    key={p.key}
                    type="button"
                    className={`platform-card${platform === p.key ? ' selected' : ''}`}
                    onClick={() => setPlatform(p.key)}
                  >
                    {platform === p.key && (
                      <span className="platform-check">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
            </div>

            {/* Footer */}
            <div className="cp-footer">
              <button type="button" className="cp-btn-cancel" onClick={onClose}>Cancel</button>
              <button type="submit" className="cp-btn-submit" disabled={loading}>
                {loading
                  ? <><span className="spinner spinner-white spinner-sm"/> Creating…</>
                  : 'Create Project'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Projects() {
  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectService.getAll();
      setProjects(res.data);
    } catch {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (name, teamId, platform) => {
    await projectService.create(name, '', teamId, platform);
    await fetchProjects();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    try {
      await projectService.delete(id);
      fetchProjects();
    } catch {
      setError('Failed to delete project');
    }
  };

  const openCount   = projects.reduce((s, p) => s + (parseInt(p.open_issues)   || 0), 0);
  const closedCount = projects.reduce((s, p) => s + (parseInt(p.closed_issues) || 0), 0);

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const tabCounts = { all: projects.length, mine: projects.length, favourites: 0 };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Projects</h1>
          <p>Manage and track all your bug-tracking projects.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Project
        </button>
      </div>

      {/* Stats */}
      <div className="stats-strip">
        <div className="stat-pill">
          <div className="stat-pill-icon indigo">📁</div>
          <div>
            <div className="stat-pill-val">{projects.length}</div>
            <div className="stat-pill-label">Total Projects</div>
          </div>
        </div>
        <div className="stat-pill">
          <div className="stat-pill-icon indigo">🐛</div>
          <div>
            <div className="stat-pill-val">{openCount}</div>
            <div className="stat-pill-label">Open Issues</div>
          </div>
        </div>
        <div className="stat-pill">
          <div className="stat-pill-icon green">✅</div>
          <div>
            <div className="stat-pill-val">{closedCount}</div>
            <div className="stat-pill-label">Closed Issues</div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Tabs */}
      <div className="projects-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`proj-tab${activeTab === t.key ? ' active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
            <span className="tab-count">{tabCounts[t.key]}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-input-wrap">
          <IconSearch />
          <input
            type="text"
            placeholder="Search projects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <h3>{search ? 'No projects match your search' : 'No projects yet'}</h3>
          <p>{search ? 'Try a different search term.' : 'Create your first project to get started.'}</p>
          {!search && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              + Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="projects-grid">
          {filtered.map(p => (
            <ProjectCard key={p.id} project={p} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}

export default Projects;
