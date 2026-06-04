import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/api';
import Button from '../components/ui/Button';
import { getInitials } from '../utils/helpers';
import '../styles/profile.css';

const AVATARS = ['🧑‍💻','👩‍💻','🧑‍🎨','👨‍🎨','🧑‍🔬','👩‍🔬','🧑‍🚀','👨‍🚀','🦸','🦹'];

const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconSub = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12V22H4V12"/>
    <path d="M22 7H2v5h20V7z"/>
    <path d="M12 22V7"/>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
);

function UserProfile() {
  const { user, updateUser } = useAuth();
  const [activeNav, setActiveNav]         = useState('profile');
  const [firstName, setFirstName]         = useState('');
  const [lastName, setLastName]           = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage]     = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [error, setError]         = useState('');
  const [pwError, setPwError]     = useState('');
  const [stats] = useState({ projects: 0, issues: 0, teams: 0 });

  useEffect(() => {
    if (user?.name) {
      const parts = user.name.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
    if (user?.avatar_url) setSelectedAvatar(user.avatar_url);
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: ({ name, avatar_url }) => authService.updateProfile({ name, avatar_url }),
    onSuccess: (res) => {
      updateUser({ ...user, ...res.data.user });
      setMessage('Profile updated successfully!');
      setError('');
    },
    onError: () => {
      setError('Failed to update profile. Please try again.');
      setMessage('');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      authService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setPwMessage('Password changed successfully!');
      setPwError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err) => {
      setPwError(err.response?.data?.error || 'Failed to change password.');
      setPwMessage('');
    },
  });

  const handleSave = (e) => {
    e.preventDefault();
    const fullName = `${firstName} ${lastName}`.trim();
    updateProfileMutation.mutate({ name: fullName, avatar_url: selectedAvatar });
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPwError('');
    setPwMessage('');
    if (newPassword.length < 6) { setPwError('New password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match.'); return; }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  return (
    <div className="profile-page">
      {/* Secondary nav */}
      <div className="profile-subnav">
        <div className="subnav-label">Account</div>
        <button
          className={`subnav-item${activeNav === 'profile' ? ' active' : ''}`}
          onClick={() => setActiveNav('profile')}
        >
          <IconUser /> User Profile
        </button>
        <button
          className={`subnav-item${activeNav === 'subscription' ? ' active' : ''}`}
          onClick={() => setActiveNav('subscription')}
        >
          <IconSub /> Subscription
        </button>
      </div>

      <div className="profile-main">
        {activeNav === 'profile' && (
          <>
            <h1 className="profile-page-title">My Profile</h1>

            {error   && <div className="alert alert-error">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            <form onSubmit={handleSave}>
              <div className="profile-grid">
                {/* Left column */}
                <div className="profile-left-col">
                  {/* Avatar card */}
                  <div className="profile-avatar-card">
                    <div className="profile-avatar-wrap">
                      <div className="profile-avatar-circle">
                        {selectedAvatar && AVATARS.includes(selectedAvatar)
                          ? <span style={{ fontSize: 34 }}>{selectedAvatar}</span>
                          : getInitials(user?.name)
                        }
                      </div>
                      <div className="profile-avatar-edit">📷</div>
                    </div>
                    <div className="profile-name">{user?.name}</div>
                    <div className="profile-plan-badge">Free Plan</div>
                    <div className="profile-stats">
                      <div className="profile-stat">
                        <div className="profile-stat-val">{stats.projects}</div>
                        <div className="profile-stat-label">Projects</div>
                      </div>
                      <div className="profile-stat">
                        <div className="profile-stat-val">{stats.issues}</div>
                        <div className="profile-stat-label">Issues</div>
                      </div>
                      <div className="profile-stat">
                        <div className="profile-stat-val">{stats.teams}</div>
                        <div className="profile-stat-label">Teams</div>
                      </div>
                    </div>
                  </div>

                  {/* Avatar picker */}
                  <div className="avatar-picker-card">
                    <div className="avatar-picker-title">Choose Avatar</div>
                    <div className="avatar-picker-sub">Pick an avatar for your profile.</div>
                    <div className="avatar-grid">
                      {AVATARS.map(av => (
                        <button
                          key={av}
                          type="button"
                          className={`avatar-option${selectedAvatar === av ? ' selected' : ''}`}
                          onClick={() => setSelectedAvatar(av)}
                          title={av}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="profile-details-card">
                  <div className="profile-section-title">General Details</div>

                  <div className="profile-form-row">
                    <div className="input-group">
                      <label>First Name *</label>
                      <input
                        type="text" value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        placeholder="First name" required
                      />
                    </div>
                    <div className="input-group">
                      <label>Last Name</label>
                      <input
                        type="text" value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Email Address</label>
                    <div className="input-locked">
                      <input
                        type="email" value={user?.email || ''}
                        disabled style={{ paddingRight: 36 }}
                      />
                      <span className="lock-icon">🔒</span>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Preferred Language</label>
                    <select>
                      <option>English</option>
                      <option>Hindi</option>
                      <option>Spanish</option>
                    </select>
                  </div>

                  <Button type="submit" className="profile-save-btn" loading={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? 'Saving…' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </form>

            {/* ── Change Password ── */}
            <div style={{ marginTop: 32 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                Change Password
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                Update your password. You'll need your current password to confirm.
              </p>

              {pwError   && <div className="alert alert-error"   style={{ marginBottom: 16 }}>{pwError}</div>}
              {pwMessage && <div className="alert alert-success" style={{ marginBottom: 16 }}>{pwMessage}</div>}

              <form onSubmit={handleChangePassword}>
                <div className="profile-details-card" style={{ maxWidth: 560 }}>
                  <div className="input-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Your current password"
                      required
                    />
                  </div>
                  <div className="profile-form-row">
                    <div className="input-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" loading={changePasswordMutation.isPending}>
                    {changePasswordMutation.isPending ? 'Updating…' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </div>
          </>
        )}

        {activeNav === 'subscription' && (
          <div>
            <h1 className="profile-page-title">Subscription</h1>
            <div className="card" style={{ maxWidth: 480 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>🎁</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>Free Plan</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Unlimited projects &amp; issues</div>
                </div>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                You're on the Free plan. Upgrade to Pro to unlock advanced analytics, priority support, and more integrations.
              </p>
              <button className="btn btn-primary" style={{ marginTop: 20 }}>Upgrade to Pro</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
