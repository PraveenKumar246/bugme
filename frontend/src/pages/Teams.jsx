import { memo, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from '../services/api';
import { queryKeys } from '../lib/queryKeys';
import { useDebounce } from '../hooks/useDebounce';
import Button from '../components/ui/Button';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '../components/ui/Modal';
import { PageLoader } from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import StatStrip from '../components/ui/StatStrip';
import { getInitials, avatarHue } from '../utils/helpers';
import '../styles/teams.css';

const getColor = (name) => `hsl(${avatarHue(name)},60%,50%)`;

// ─── Shared icons ─────────────────────────────────────────────────────────────
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

const IconChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

// ─── TeamCard ─────────────────────────────────────────────────────────────────
const TeamCard = memo(function TeamCard({ team, currentUser, onDelete, onInvite, onSelect }) {
  const owner        = team.members?.find(m => m.role === 'owner');
  const otherMembers = team.members?.filter(m => m.role !== 'owner') || [];
  const isOwner      = team.owner_id === currentUser?.id;

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
            {getInitials(owner.name)}<span className="crown-badge">👑</span>
          </div>
          <div className="member-info">
            <div className="member-name">{owner.name}</div>
            <div className="member-email">{owner.email}</div>
          </div>
        </div>
      )}

      <div className="team-card-members">
        {team.members?.slice(0, 5).map((m, i) => (
          <div key={m.id} className="member-avatar-sm" style={{ background: getColor(m.name), zIndex: 10 - i }} title={m.name}>
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
});

// ─── TeamDetail ───────────────────────────────────────────────────────────────
const TeamDetail = memo(function TeamDetail({ team, currentUser, onBack, onInvite, onRemoveMember }) {
  const [search, setSearch] = useState('');
  const debouncedSearch     = useDebounce(search);
  const isOwner             = team.owner_id === currentUser?.id;

  const filtered = useMemo(() =>
    (team.members || []).filter(m =>
      m.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(debouncedSearch.toLowerCase())
    ),
    [team.members, debouncedSearch]
  );

  return (
    <div>
      <button className="team-detail-back" onClick={onBack}>
        <IconChevronLeft /> Back to Teams
      </button>

      <div className="team-detail-hero">
        <div className="team-detail-hero-info">
          <h2>{team.name}</h2>
          <p>{team.description || 'No description provided.'}</p>
          {isOwner && (
            <button className="btn btn-primary" onClick={() => onInvite(team)}>+ Invite Members</button>
          )}
        </div>
        <div className="team-detail-hero-avatars">
          {(team.members || []).slice(0, 6).map((m, i) => (
            <div key={m.id} className="member-avatar-sm team-detail-avatar"
              style={{ background: getColor(m.name), zIndex: 10 - i }} title={m.name}>
              {getInitials(m.name)}
            </div>
          ))}
        </div>
      </div>

      <div className="teams-toolbar">
        <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members…" />
        <span className="teams-count">Total Members: {team.members?.length || 0}</span>
      </div>

      <div className="member-list">
        {filtered.length === 0 ? (
          <div className="member-list-empty">{search ? 'No members match your search.' : 'No members yet.'}</div>
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
                  <span className={`role-badge role-${m.role}`}>{m.role === 'owner' ? 'Owner' : 'Member'}</span>
                  {isOwner && !isSelf && (
                    <button className="btn-member-action btn-remove" onClick={() => onRemoveMember(team.id, m.id, false)}>Remove</button>
                  )}
                  {!isOwner && isSelf && (
                    <button className="btn-member-action btn-leave" onClick={() => onRemoveMember(team.id, m.id, true)}>Leave</button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});

// ─── CreateTeamModal ──────────────────────────────────────────────────────────
function CreateTeamModal({ onClose }) {
  const [name, setName]             = useState('');
  const [description, setDescription] = useState('');
  const [error, setError]           = useState('');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () => teamService.create(name, description),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: queryKeys.teams() }); onClose(); },
    onError:    () => setError('Failed to create team'),
  });

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Create New Team" onClose={onClose} />
      <ModalBody>
        {error && <div className="alert alert-error">{error}</div>}
        <form id="create-team-form" onSubmit={e => { e.preventDefault(); setError(''); createMutation.mutate(); }}>
          <div className="input-group">
            <label>Team name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Frontend Team" autoFocus required />
          </div>
          <div className="input-group">
            <label>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this team work on?" rows={3} style={{ resize: 'vertical' }} />
          </div>
        </form>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" form="create-team-form" loading={createMutation.isPending}>
          {createMutation.isPending ? 'Creating…' : 'Create Team'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// ─── InviteModal ──────────────────────────────────────────────────────────────
function InviteModal({ team, onClose }) {
  const [email, setEmail]     = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');

  const inviteMutation = useMutation({
    mutationFn: (addr) => teamService.invite(team.id, addr),
    onSuccess:  (_, addr) => { setSuccess(`Invitation sent to ${addr}`); setEmail(''); setError(''); },
    onError:    (err)     => { setError(err.response?.data?.error || 'Failed to send invitation'); setSuccess(''); },
  });

  return (
    <Modal onClose={onClose}>
      <ModalHeader title={`Invite to ${team.name}`} onClose={onClose} />
      <ModalBody>
        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form id="invite-form" onSubmit={e => { e.preventDefault(); inviteMutation.mutate(email.trim()); }}>
          <div className="input-group">
            <label>Email address *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="teammate@company.com" autoFocus required />
          </div>
          <p className="invite-hint">They'll receive an email with a link to accept and set up their account.</p>
        </form>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>Close</Button>
        <Button type="submit" form="invite-form" loading={inviteMutation.isPending}>
          {inviteMutation.isPending ? 'Inviting…' : 'Send Invite'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// ─── Teams page ───────────────────────────────────────────────────────────────
function Teams() {
  const { user } = useAuth();
  const [search, setSearch]             = useState('');
  const [showCreate, setShowCreate]     = useState(false);
  const [inviteTarget, setInviteTarget] = useState(null);
  const [activeNav, setActiveNav]       = useState('teams');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const queryClient = useQueryClient();
  const debouncedSearch = useDebounce(search);

  const { data: teams = [], isLoading, error } = useQuery({
    queryKey: queryKeys.teams(),
    queryFn:  () => teamService.getAll().then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => teamService.delete(id),
    onSuccess:  (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams() });
      if (selectedTeam?.id === id) setSelectedTeam(null);
    },
    onError: () => alert('Failed to delete team'),
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ teamId, userId }) => teamService.removeMember(teamId, userId),
    onSuccess:  (_, { teamId, isSelf }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams() }).then(() => {
        if (isSelf) {
          setSelectedTeam(null);
        } else {
          const updated = queryClient.getQueryData(queryKeys.teams())?.find(t => t.id === teamId);
          if (updated) setSelectedTeam(updated);
        }
      });
    },
    onError: (err) => alert(err.response?.data?.error || 'Failed to update team membership'),
  });

  const handleDelete = useCallback((id) => {
    if (!window.confirm('Delete this team? This cannot be undone.')) return;
    deleteMutation.mutate(id);
  }, [deleteMutation.mutate]);

  const handleRemoveMember = useCallback((teamId, userId, isSelf) => {
    const msg = isSelf ? 'Leave this team?' : 'Remove this member from the team?';
    if (!window.confirm(msg)) return;
    removeMemberMutation.mutate({ teamId, userId, isSelf });
  }, [removeMemberMutation.mutate]);

  const filtered = useMemo(() =>
    debouncedSearch
      ? teams.filter(t => t.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
      : teams,
    [teams, debouncedSearch]
  );

  const totalMembers = useMemo(() =>
    teams.reduce((s, t) => s + (t.members?.length || 0), 0),
    [teams]
  );

  return (
    <div className="teams-page">
      <div className="teams-subnav">
        <div className="subnav-label">Manage</div>
        <button className={`subnav-item${activeNav === 'teams' ? ' active' : ''}`}
          onClick={() => { setActiveNav('teams'); setSelectedTeam(null); }}>
          <IconTeams /> Teams
        </button>
        <button className={`subnav-item${activeNav === 'notifications' ? ' active' : ''}`}
          onClick={() => { setActiveNav('notifications'); setSelectedTeam(null); }}>
          <IconBell /> Notifications
        </button>
      </div>

      <div className="teams-main-content">
        {!selectedTeam && (
          <>
            <PageHeader
              title={activeNav === 'teams' ? 'Teams' : 'Notifications'}
              subtitle={
                activeNav === 'teams'
                  ? 'Collaborate by creating teams and inviting members.'
                  : 'Stay up to date with your team activity.'
              }
              action={
                activeNav === 'teams'
                  ? <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Team</button>
                  : null
              }
            />

            {activeNav === 'teams' && (
              <StatStrip stats={[
                { icon: '👥', val: teams.length,  label: 'Total Teams'   },
                { icon: '👤', val: totalMembers,  label: 'Total Members', iconClass: 'green' },
              ]} />
            )}
          </>
        )}

        {error && <div className="alert alert-error">Failed to load teams</div>}

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
                <div className="teams-toolbar">
                  <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teams…" />
                  <span className="teams-count">{filtered.length} team{filtered.length !== 1 ? 's' : ''}</span>
                </div>

                {isLoading ? (
                  <PageLoader />
                ) : filtered.length === 0 ? (
                  <EmptyState
                    icon="👥"
                    title={search ? 'No teams match your search' : 'No teams yet'}
                    description={search ? 'Try a different search.' : 'Create your first team to collaborate with others.'}
                    action={!search ? <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Team</button> : null}
                  />
                ) : (
                  <div className="teams-grid">
                    {filtered.map(t => (
                      <TeamCard key={t.id} team={t} currentUser={user}
                        onDelete={handleDelete} onInvite={setInviteTarget} onSelect={setSelectedTeam} />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeNav === 'notifications' && (
          <EmptyState icon="🔔" title="No notifications" description="You're all caught up! Check back later for team activity updates." />
        )}
      </div>

      {showCreate   && <CreateTeamModal onClose={() => setShowCreate(false)} />}
      {inviteTarget && <InviteModal team={inviteTarget} onClose={() => setInviteTarget(null)} />}
    </div>
  );
}

export default Teams;
