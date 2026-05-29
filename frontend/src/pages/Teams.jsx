import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { teamService } from '../services/api';
import { getInitials, avatarHue } from '../utils/helpers';
import '../styles/teams.css';

const getColor = (name) => `hsl(${avatarHue(name)},60%,50%)`;

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconTeams = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconBell = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const IconChevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

function TeamCard({ team, currentUser, onDelete, onInvite, onSelect }) {
  const owner = team.members?.find(m => m.role === 'owner');
  const otherMembers = team.members?.filter(m => m.role !== 'owner') || [];
  const isOwner = team.owner_id === currentUser?.id;

  return (
    <div className="team-card" onClick={() => onSelect(team)}>
      <div className="team-card-header">
        <span className="team-card-name">{team.name}</span>
        {isOwner && (
          <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
            <button className="team-menu-btn" title="Invite member" onClick={() => onInvite(team)}>+</button>
            <button className="team-menu-btn" title="Delete team" onClick={() => onDelete(team.id)}>⋯</button>
          </div>
        )}
      </div>

      {owner && (
        <div className="team-card-owner">
          <div className="member-avatar" style={{ background: getColor(owner.name) }}>
            {getInitials(owner.name)}
            <span className="crown-badge">👑</span>
          </div>
          <div className="member-info">
            <div className="member-name">{owner.name}</div>
            <div className="member-email">{owner.email}</div>
          </div>
        </div>
      )}

      <div className="team-card-members">
        {team.members?.slice(0, 5).map((m, i) => (
          <div
            key={m.id}
            className="member-avatar-sm"
            style={{ background: getColor(m.name), zIndex: 10 - i }}
            title={m.name}
          >
            {getInitials(m.name)}
          </div>
        ))}
        {otherMembers.length > 0 && (
          <span className="team-member-count">
            {team.members?.length} member{team.members?.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}

function TeamDetail({ team, currentUser, onBack, onInvite, onRemoveMember }) {
  const [search, setSearch] = useState('');
  const isOwner = team.owner_id === currentUser?.id;

  const filtered = (team.members || []).filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <button className="team-detail-back" onClick={onBack}>
        <IconChevron /> Back to Teams
      </button>

      {/* Hero card */}
      <div className="team-detail-hero">
        <div className="team-detail-hero-info">
          <h2>{team.name}</h2>
          <p>{team.description || 'No description provided.'}</p>
          {isOwner && (
            <button className="btn btn-primary" onClick={() => onInvite(team)}>
              + Invite Members
            </button>
          )}
        </div>
        <div className="team-detail-hero-avatars">
          {(team.members || []).slice(0, 6).map((m, i) => (
            <div
              key={m.id}
              className="member-avatar-sm team-detail-avatar"
              style={{ background: getColor(m.name), zIndex: 10 - i }}
              title={m.name}
            >
              {getInitials(m.name)}
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="teams-toolbar">
        <div className="teams-search">
          <IconSearch />
          <input
            type="text"
            placeholder="Search members…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span className="teams-count">
          Total Members: {team.members?.length || 0}
        </span>
      </div>

      {/* Member list */}
      <div className="member-list">
        {filtered.length === 0 ? (
          <div className="member-list-empty">
            {search ? 'No members match your search.' : 'No members yet.'}
          </div>
        ) : (
          filtered.map(m => {
            const isSelf = m.id === currentUser?.id;
            return (
              <div key={m.id} className="member-row">
                <div className="member-row-left">
                  <div className="member-avatar" style={{ background: getColor(m.name) }}>
                    {getInitials(m.name)}
                    {m.role === 'owner' && <span className="crown-badge">👑</span>}
                  </div>
                  <div className="member-info">
                    <div className="member-name">{m.name}</div>
                    <div className="member-email">{m.email}</div>
                  </div>
                </div>
                <div className="member-row-right">
                  <span className={`role-badge role-${m.role}`}>
                    {m.role === 'owner' ? 'Owner' : 'Member'}
                  </span>
                  {isOwner && !isSelf && (
                    <button
                      className="btn-member-action btn-remove"
                      onClick={() => onRemoveMember(team.id, m.id, false)}
                    >
                      Remove
                    </button>
                  )}
                  {!isOwner && isSelf && (
                    <button
                      className="btn-member-action btn-leave"
                      onClick={() => onRemoveMember(team.id, m.id, true)}
                    >
                      Leave
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function CreateTeamModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onCreate(name, description);
      onClose();
    } catch {
      setError('Failed to create team');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Team</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Team name *</label>
              <input
                type="text" value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Frontend Team" autoFocus required
              />
            </div>
            <div className="input-group">
              <label>Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What does this team work on?"
                rows={3} style={{ resize: 'vertical' }}
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="spinner spinner-white" /> Creating…</> : 'Create Team'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function InviteModal({ team, onClose, onInvite }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await onInvite(team.id, email);
      setSuccess(`Invitation email sent to ${email}`);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Invite to {team.name}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {error   && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email address *</label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="teammate@company.com" autoFocus required
              />
            </div>
            <p className="invite-hint">They'll receive an email with a link to accept and set up their account.</p>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="spinner spinner-white" /> Inviting…</> : 'Send Invite'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Teams() {
  const { user } = useAuth();
  const [teams, setTeams]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [showCreate, setShowCreate]     = useState(false);
  const [inviteTarget, setInviteTarget] = useState(null);
  const [activeNav, setActiveNav]       = useState('teams');
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => { fetchTeams({ showLoading: true }); }, []);

  const fetchTeams = async ({ showLoading = false, keepSelectedId = null } = {}) => {
    try {
      if (showLoading) setLoading(true);
      const res = await teamService.getAll();
      setTeams(res.data);
      if (keepSelectedId) {
        const updated = res.data.find(t => t.id === keepSelectedId);
        setSelectedTeam(updated || null);
      }
    } catch {
      setError('Failed to load teams');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleCreate = async (name, description) => {
    await teamService.create(name, description);
    await fetchTeams();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this team? This cannot be undone.')) return;
    try {
      await teamService.delete(id);
      if (selectedTeam?.id === id) setSelectedTeam(null);
      fetchTeams();
    } catch {
      setError('Failed to delete team');
    }
  };

  const handleInvite = async (teamId, email) => {
    await teamService.invite(teamId, email);
  };

  const handleRemoveMember = async (teamId, userId, isSelf) => {
    const msg = isSelf ? 'Leave this team?' : 'Remove this member from the team?';
    if (!window.confirm(msg)) return;
    try {
      await teamService.removeMember(teamId, userId);
      if (isSelf) {
        setSelectedTeam(null);
        await fetchTeams();
      } else {
        await fetchTeams({ keepSelectedId: teamId });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update team membership');
    }
  };

  const filtered = teams.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="teams-page">
      {/* Secondary sidebar */}
      <div className="teams-subnav">
        <div className="subnav-label">Manage</div>
        <button
          className={`subnav-item${activeNav === 'teams' ? ' active' : ''}`}
          onClick={() => { setActiveNav('teams'); setSelectedTeam(null); }}
        >
          <IconTeams /> Teams
        </button>
        <button
          className={`subnav-item${activeNav === 'notifications' ? ' active' : ''}`}
          onClick={() => { setActiveNav('notifications'); setSelectedTeam(null); }}
        >
          <IconBell /> Notifications
        </button>
      </div>

      <div className="teams-main-content">
        {/* Page header — hide when inside a team detail */}
        {!selectedTeam && (
          <>
            <div className="page-header">
              <div className="page-header-text">
                <h1>{activeNav === 'teams' ? 'Teams' : 'Notifications'}</h1>
                <p>{activeNav === 'teams'
                  ? 'Collaborate by creating teams and inviting members.'
                  : 'Stay up to date with your team activity.'
                }</p>
              </div>
              {activeNav === 'teams' && (
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                  + New Team
                </button>
              )}
            </div>

            {activeNav === 'teams' && (
              <div className="stats-strip">
                <div className="stat-pill">
                  <div className="stat-pill-icon indigo">👥</div>
                  <div>
                    <div className="stat-pill-val">{teams.length}</div>
                    <div className="stat-pill-label">Total Teams</div>
                  </div>
                </div>
                <div className="stat-pill">
                  <div className="stat-pill-icon green">👤</div>
                  <div>
                    <div className="stat-pill-val">
                      {teams.reduce((s, t) => s + (t.members?.length || 0), 0)}
                    </div>
                    <div className="stat-pill-label">Total Members</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        {activeNav === 'teams' && (
          <>
            {selectedTeam ? (
              <TeamDetail
                team={selectedTeam}
                currentUser={user}
                onBack={() => setSelectedTeam(null)}
                onInvite={setInviteTarget}
                onRemoveMember={handleRemoveMember}
              />
            ) : (
              <>
                {/* Toolbar */}
                <div className="teams-toolbar">
                  <div className="teams-search">
                    <IconSearch />
                    <input
                      type="text"
                      placeholder="Search teams…"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  <span className="teams-count">
                    {filtered.length} team{filtered.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Grid */}
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '60px' }}>
                    <div className="spinner spinner-lg" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <h3>{search ? 'No teams match your search' : 'No teams yet'}</h3>
                    <p>{search ? 'Try a different search.' : 'Create your first team to collaborate with others.'}</p>
                    {!search && (
                      <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                        + New Team
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="teams-grid">
                    {filtered.map(t => (
                      <TeamCard
                        key={t.id}
                        team={t}
                        currentUser={user}
                        onDelete={handleDelete}
                        onInvite={setInviteTarget}
                        onSelect={setSelectedTeam}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeNav === 'notifications' && (
          <div className="empty-state">
            <div className="empty-state-icon">🔔</div>
            <h3>No notifications</h3>
            <p>You're all caught up! Check back later for team activity updates.</p>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateTeamModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}

      {inviteTarget && (
        <InviteModal
          team={inviteTarget}
          onClose={() => setInviteTarget(null)}
          onInvite={handleInvite}
        />
      )}
    </div>
  );
}

export default Teams;
