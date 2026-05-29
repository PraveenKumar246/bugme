import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService, teamService } from '../services/api';
import { PLATFORMS } from '../utils/constants';
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

function ProjectCard({ project, onDelete, onToggleFavorite, onEdit }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [starred, setStarred]   = useState(project.is_favorite || false);
  const [starring, setStarring] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleStar = async (e) => {
    e.stopPropagation();
    if (starring) return;
    setStarring(true);
    setStarred(v => !v);
    try {
      const res = await onToggleFavorite(project.id);
      setStarred(res);
    } catch {
      setStarred(v => !v);
    } finally {
      setStarring(false);
    }
  };

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
          <button
            className={`project-star-btn${starred ? ' starred' : ''}`}
            onClick={handleStar}
            title={starred ? 'Remove from favourites' : 'Add to favourites'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={starred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </button>
          <button className="project-menu-btn" onClick={() => setMenuOpen(v => !v)}>⋯</button>
          {menuOpen && (
            <div className="project-dropdown">
              <button onClick={() => { navigate(`/apps/${project.id}`); setMenuOpen(false); }}>Open</button>
              <button onClick={() => { onEdit(project); setMenuOpen(false); }}>Edit</button>
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
    if (e?.preventDefault) e.preventDefault();
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
              <div className="td-create-form">
                <input
                  ref={inputRef}
                  className="td-create-input"
                  type="text"
                  placeholder="Team name"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreateTeam(e); } }}
                />
                <div className="td-create-actions">
                  <button type="button" className="td-btn-cancel" onClick={() => { setMode('select'); setCreateErr(''); }}>
                    Cancel
                  </button>
                  <button type="button" className="td-btn-create" disabled={creating || !newName.trim()} onClick={handleCreateTeam}>
                    {creating ? 'Creating…' : 'Create'}
                  </button>
                </div>
              </div>
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

function EditProjectModal({ project, onClose, onSave }) {
  const [name, setProjName]   = useState(project.name);
  const [platform, setPlatform] = useState(project.platform || '');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Project name is required.'); return; }
    if (!platform) { setError('Please select a platform.'); return; }
    setLoading(true);
    setError('');
    try {
      await onSave(project.id, name.trim(), project.description || '', platform);
      onClose();
    } catch {
      setError('Failed to update project. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay cp-overlay" onClick={onClose}>
      <div className="cp-modal" onClick={e => e.stopPropagation()}>
        <div className="cp-header">
          <div className="cp-header-left">
            <div className="cp-header-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <div>
              <h3 className="cp-title">Edit Project</h3>
              <p className="cp-subtitle">Update project details</p>
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
            <div className="cp-field" style={{ marginBottom: 20 }}>
              <label className="cp-label">Project Name <span className="cp-required">*</span></label>
              <input
                className="cp-input"
                type="text"
                value={name}
                onChange={e => setProjName(e.target.value)}
                autoFocus
                required
              />
            </div>

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

            <div className="cp-footer">
              <button type="button" className="cp-btn-cancel" onClick={onClose}>Cancel</button>
              <button type="submit" className="cp-btn-submit" disabled={loading}>
                {loading
                  ? <><span className="spinner spinner-white spinner-sm"/> Saving…</>
                  : 'Save Changes'
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
  const [editProject, setEditProject] = useState(null);

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

  const handleEdit = async (id, name, desc, platform) => {
    await projectService.update(id, name, desc, platform);
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name, description: desc, platform } : p));
  };

  const handleToggleFavorite = async (id) => {
    const res = await projectService.toggleFavorite(id);
    setProjects(prev =>
      prev.map(p => p.id === id ? { ...p, is_favorite: res.data.is_favorite } : p)
    );
    return res.data.is_favorite;
  };

  const openCount   = projects.reduce((s, p) => s + (parseInt(p.open_issues)   || 0), 0);
  const closedCount = projects.reduce((s, p) => s + (parseInt(p.closed_issues) || 0), 0);

  const tabFiltered = activeTab === 'favourites'
    ? projects.filter(p => p.is_favorite)
    : projects;

  const filtered = tabFiltered.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const favCount = projects.filter(p => p.is_favorite).length;
  const tabCounts = { all: projects.length, mine: projects.length, favourites: favCount };

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
          <div className="empty-state-icon">{activeTab === 'favourites' ? '⭐' : '📁'}</div>
          <h3>
            {search
              ? 'No projects match your search'
              : activeTab === 'favourites'
              ? 'No favourites yet'
              : 'No projects yet'}
          </h3>
          <p>
            {search
              ? 'Try a different search term.'
              : activeTab === 'favourites'
              ? 'Star a project to add it to your favourites.'
              : 'Create your first project to get started.'}
          </p>
          {!search && activeTab !== 'favourites' && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              + Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="projects-grid">
          {filtered.map(p => (
            <ProjectCard key={p.id} project={p} onDelete={handleDelete} onToggleFavorite={handleToggleFavorite} onEdit={setEditProject} />
          ))}
        </div>
      )}

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}

      {editProject && (
        <EditProjectModal
          project={editProject}
          onClose={() => setEditProject(null)}
          onSave={handleEdit}
        />
      )}
    </div>
  );
}

export default Projects;
