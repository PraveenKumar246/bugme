import { memo, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService, teamService } from '../services/api';
import { queryKeys } from '../lib/queryKeys';
import { useDebounce } from '../hooks/useDebounce';
import { useClickOutside } from '../hooks/useClickOutside';
import Button from '../components/ui/Button';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '../components/ui/Modal';
import { PageLoader } from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import StatStrip from '../components/ui/StatStrip';
import PlatformSelector from '../components/ui/PlatformSelector';
import { PLATFORMS } from '../utils/constants';
import '../styles/projects.css';

const TABS = [
  { key: 'all',        label: 'All' },
  { key: 'mine',       label: 'My Projects' },
  { key: 'favourites', label: 'Favourites' },
];

// ─────────────────────────────────────────────────────────────────────────────
// ProjectCard — memoised so it only re-renders when its own project data changes
// ─────────────────────────────────────────────────────────────────────────────
const ProjectCard = memo(function ProjectCard({ project, onDelete, onToggleFavorite, onEdit, isTogglingFavorite }) {
  const navigate   = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef    = useRef(null);

  useClickOutside(menuRef, () => setMenuOpen(false));

  const handleStar = useCallback((e) => {
    e.stopPropagation();
    if (!isTogglingFavorite) onToggleFavorite(project.id);
  }, [isTogglingFavorite, onToggleFavorite, project.id]);

  const open   = parseInt(project.open_issues)   || 0;
  const closed = parseInt(project.closed_issues) || 0;
  const total  = parseInt(project.total_issues)  || 0;

  return (
    <div className="project-card" onClick={() => navigate(`/apps/${project.id}`)}>
      <div className="project-card-top">
        <div className="project-icon-wrap">{project.name[0].toUpperCase()}</div>
        <div className="project-card-meta">
          <div className="project-card-name">
            {project.name}<span className="project-lock-icon">🔒</span>
          </div>
          <div className="project-team-name">{project.team_name || 'No Team'}</div>
        </div>

        <div className="project-card-actions" ref={menuRef} onClick={e => e.stopPropagation()}>
          <button
            className={`project-star-btn${project.is_favorite ? ' starred' : ''}`}
            onClick={handleStar}
            disabled={isTogglingFavorite}
            title={project.is_favorite ? 'Remove from favourites' : 'Add to favourites'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24"
              fill={project.is_favorite ? 'currentColor' : 'none'}
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <span className="project-stat-val open-val">{open}<span className="project-stat-total">/{total}</span></span>
        </div>
        <div className="project-stat">
          <span className="project-stat-label">Closed</span>
          <span className="project-stat-val closed-val">{closed}<span className="project-stat-total">/{total}</span></span>
        </div>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// TeamDropdown — inline team picker with quick-create
// ─────────────────────────────────────────────────────────────────────────────
function TeamDropdown({ teams, value, onChange, onNewTeam }) {
  const [open, setOpen]       = useState(false);
  const [mode, setMode]       = useState('select');
  const [newName, setNewName] = useState('');
  const [createErr, setCreateErr] = useState('');
  const ref      = useRef(null);
  const queryClient = useQueryClient();

  useClickOutside(ref, () => { setOpen(false); setMode('select'); });

  const createTeamMutation = useMutation({
    mutationFn: (name) => teamService.create(name, '').then(r => r.data),
    onSuccess: (newTeam) => {
      queryClient.setQueryData(queryKeys.teams(), old => [...(old || []), newTeam]);
      onNewTeam(newTeam);
      setNewName('');
      setMode('select');
      setOpen(false);
    },
    onError: () => setCreateErr('Failed to create team'),
  });

  const selected = teams.find(t => t.id === value);

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
        <svg className={`dropdown-chevron${open ? ' flipped' : ''}`} width="16" height="16"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="team-dropdown-panel">
          {mode === 'select' ? (
            <>
              <div className="td-list">
                {teams.length === 0
                  ? <div className="team-dropdown-empty">No teams yet — create one below</div>
                  : teams.map(t => (
                    <button key={t.id} type="button"
                      className={`team-dropdown-item${value === t.id ? ' selected' : ''}`}
                      onClick={() => { onChange(t.id); setOpen(false); }}>
                      <span className="td-item-dot" style={{ background: `hsl(${t.name.charCodeAt(0) * 37 % 360},60%,50%)` }}/>
                      {t.name}
                      {value === t.id && (
                        <svg className="td-check" width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </button>
                  ))
                }
              </div>
              <div className="team-dropdown-divider"/>
              <button type="button" className="team-dropdown-create" onClick={() => setMode('create')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Create New Team
              </button>
            </>
          ) : (
            <div className="td-create-panel">
              <div className="td-create-header">
                <button type="button" className="td-back-btn" onClick={() => { setMode('select'); setCreateErr(''); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                <span className="td-create-title">New Team</span>
              </div>
              {createErr && <div className="td-create-err">{createErr}</div>}
              <div className="td-create-form">
                <input
                  className="td-create-input" type="text" placeholder="Team name"
                  value={newName} onChange={e => setNewName(e.target.value)} autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); createTeamMutation.mutate(newName.trim()); } }}
                />
                <div className="td-create-actions">
                  <button type="button" className="td-btn-cancel" onClick={() => { setMode('select'); setCreateErr(''); }}>Cancel</button>
                  <Button
                    type="button" size="sm"
                    loading={createTeamMutation.isPending}
                    disabled={!newName.trim()}
                    onClick={() => createTeamMutation.mutate(newName.trim())}
                  >
                    {createTeamMutation.isPending ? 'Creating…' : 'Create'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CreateProjectModal
// ─────────────────────────────────────────────────────────────────────────────
function CreateProjectModal({ onClose }) {
  const [name, setProjName]     = useState('');
  const [teamId, setTeamId]     = useState('');
  const [platform, setPlatform] = useState('');
  const [error, setError]       = useState('');
  const queryClient = useQueryClient();

  const { data: teams = [] } = useQuery({
    queryKey: queryKeys.teams(),
    queryFn: () => teamService.getAll().then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () => projectService.create(name, '', teamId || null, platform),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.projects() }); onClose(); },
    onError:   () => setError('Failed to create project. Please try again.'),
  });

  const selectedPlatform = PLATFORMS.find(p => p.key === platform);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!platform) { setError('Please select a platform to continue.'); return; }
    setError('');
    createMutation.mutate();
  };

  return (
    <div className="modal-overlay cp-overlay" onClick={onClose}>
      <div className="cp-modal" onClick={e => e.stopPropagation()}>
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
            <div className="cp-row">
              <div className="cp-field">
                <label className="cp-label">Project Name <span className="cp-required">*</span></label>
                <input className="cp-input" type="text" placeholder="Enter a project name"
                  value={name} onChange={e => setProjName(e.target.value)} autoFocus required />
              </div>
              <div className="cp-field">
                <label className="cp-label">Team <span className="cp-required">*</span></label>
                <TeamDropdown teams={teams} value={teamId} onChange={setTeamId}
                  onNewTeam={(team) => setTeamId(team.id)} />
              </div>
            </div>

            <div className="cp-section">
              <div className="cp-section-label">
                <span className="cp-label">Select Platform <span className="cp-required">*</span></span>
                {selectedPlatform && (
                  <span className="cp-selected-badge">{selectedPlatform.label.replace('\n', ' ')}</span>
                )}
              </div>
              <PlatformSelector value={platform} onChange={setPlatform} />
            </div>

            <div className="cp-footer">
              <button type="button" className="cp-btn-cancel" onClick={onClose}>Cancel</button>
              <Button type="submit" loading={createMutation.isPending}>
                {createMutation.isPending ? 'Creating…' : 'Create Project'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EditProjectModal
// ─────────────────────────────────────────────────────────────────────────────
function EditProjectModal({ project, onClose }) {
  const [name, setProjName]     = useState(project.name);
  const [platform, setPlatform] = useState(project.platform || '');
  const [error, setError]       = useState('');
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: () => projectService.update(project.id, name.trim(), project.description || '', platform),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.projects(), old =>
        old?.map(p => p.id === project.id ? { ...p, name: name.trim(), platform } : p) ?? []
      );
      onClose();
    },
    onError: () => setError('Failed to update project. Please try again.'),
  });

  const selectedPlatform = PLATFORMS.find(p => p.key === platform);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Project name is required.'); return; }
    if (!platform)    { setError('Please select a platform.'); return; }
    setError('');
    updateMutation.mutate();
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
              <input className="cp-input" type="text" value={name} onChange={e => setProjName(e.target.value)} autoFocus required />
            </div>

            <div className="cp-section">
              <div className="cp-section-label">
                <span className="cp-label">Select Platform <span className="cp-required">*</span></span>
                {selectedPlatform && (
                  <span className="cp-selected-badge">{selectedPlatform.label.replace('\n', ' ')}</span>
                )}
              </div>
              <PlatformSelector value={platform} onChange={setPlatform} />
            </div>

            <div className="cp-footer">
              <button type="button" className="cp-btn-cancel" onClick={onClose}>Cancel</button>
              <Button type="submit" loading={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Projects page
// ─────────────────────────────────────────────────────────────────────────────
function Projects() {
  const [search, setSearch]           = useState('');
  const [activeTab, setActiveTab]     = useState('all');
  const [showModal, setShowModal]     = useState(false);
  const [editProject, setEditProject] = useState(null);
  const queryClient = useQueryClient();
  const debouncedSearch = useDebounce(search);

  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: queryKeys.projects(),
    queryFn:  () => projectService.getAll().then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => projectService.delete(id),
    onSuccess:  (_, id) => {
      queryClient.setQueryData(queryKeys.projects(), old => old?.filter(p => p.id !== id) ?? []);
    },
    onError: () => alert('Failed to delete project'),
  });

  const toggleFavMutation = useMutation({
    mutationFn: (id) => projectService.toggleFavorite(id).then(r => r.data),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects() });
      const prev = queryClient.getQueryData(queryKeys.projects());
      queryClient.setQueryData(queryKeys.projects(), old =>
        old?.map(p => p.id === id ? { ...p, is_favorite: !p.is_favorite } : p) ?? []
      );
      return { prev };
    },
    onError:   (_, __, ctx) => queryClient.setQueryData(queryKeys.projects(), ctx.prev),
    onSettled: ()            => queryClient.invalidateQueries({ queryKey: queryKeys.projects() }),
  });

  const handleDelete = useCallback((id) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    deleteMutation.mutate(id);
  }, [deleteMutation.mutate]);

  const handleToggleFav = useCallback((id) => {
    toggleFavMutation.mutate(id);
  }, [toggleFavMutation.mutate]);

  const tabFiltered = useMemo(() =>
    activeTab === 'favourites' ? projects.filter(p => p.is_favorite) : projects,
    [projects, activeTab]
  );

  const filtered = useMemo(() =>
    debouncedSearch
      ? tabFiltered.filter(p => p.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
      : tabFiltered,
    [tabFiltered, debouncedSearch]
  );

  const openCount   = useMemo(() => projects.reduce((s, p) => s + (parseInt(p.open_issues)   || 0), 0), [projects]);
  const closedCount = useMemo(() => projects.reduce((s, p) => s + (parseInt(p.closed_issues) || 0), 0), [projects]);
  const favCount    = useMemo(() => projects.filter(p => p.is_favorite).length, [projects]);

  const tabCounts = { all: projects.length, mine: projects.length, favourites: favCount };

  return (
    <div className="page-wrapper">
      <PageHeader
        title="Projects"
        subtitle="Manage and track all your bug-tracking projects."
        action={<button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>}
      />

      <StatStrip stats={[
        { icon: '📁', val: projects.length, label: 'Total Projects' },
        { icon: '🐛', val: openCount,       label: 'Open Issues'   },
        { icon: '✅', val: closedCount,     label: 'Closed Issues', iconClass: 'green' },
      ]} />

      {error && <div className="alert alert-error">Failed to load projects</div>}

      <div className="projects-tabs">
        {TABS.map(t => (
          <button key={t.key} className={`proj-tab${activeTab === t.key ? ' active' : ''}`} onClick={() => setActiveTab(t.key)}>
            {t.label}<span className="tab-count">{tabCounts[t.key]}</span>
          </button>
        ))}
      </div>

      <div className="toolbar">
        <SearchInput
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search projects…"
        />
      </div>

      {isLoading ? (
        <PageLoader />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={activeTab === 'favourites' ? '⭐' : '📁'}
          title={
            search ? 'No projects match your search'
            : activeTab === 'favourites' ? 'No favourites yet'
            : 'No projects yet'
          }
          description={
            search ? 'Try a different search term.'
            : activeTab === 'favourites' ? 'Star a project to add it to your favourites.'
            : 'Create your first project to get started.'
          }
          action={
            !search && activeTab !== 'favourites'
              ? <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Create Project</button>
              : null
          }
        />
      ) : (
        <div className="projects-grid">
          {filtered.map(p => (
            <ProjectCard
              key={p.id}
              project={p}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFav}
              isTogglingFavorite={toggleFavMutation.isPending}
              onEdit={setEditProject}
            />
          ))}
        </div>
      )}

      {showModal   && <CreateProjectModal onClose={() => setShowModal(false)} />}
      {editProject && <EditProjectModal project={editProject} onClose={() => setEditProject(null)} />}
    </div>
  );
}

export default Projects;
