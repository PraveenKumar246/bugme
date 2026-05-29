import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { invitationService } from '../services/api';
import '../styles/auth.css';

function AcceptInvite() {
  const { token } = useParams();
  const navigate   = useNavigate();
  const { login }  = useAuth();

  const [invite, setInvite]     = useState(null);   // { teamName, inviterName, email, isNewUser }
  const [loadErr, setLoadErr]   = useState('');
  const [name, setName]         = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    invitationService.get(token)
      .then(r => setInvite(r.data))
      .catch(err => setLoadErr(err?.response?.data?.error || 'Could not load invitation. Please check the link.'));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (invite.isNewUser && name.trim().length < 2) {
      setError('Please enter your full name');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      const res = await invitationService.accept(token, name.trim() || undefined, password);
      login(res.data.user, res.data.token);
      navigate('/teams');
    } catch (err) {
      setError(err?.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading / error states ───────────────────────────────────────────────

  if (!invite && !loadErr) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center', padding: '48px 36px' }}>
          <div className="spinner spinner-lg" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading invitation…</p>
        </div>
      </div>
    );
  }

  if (loadErr) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-brand" style={{ justifyContent: 'center' }}>
            <div className="auth-brand-icon">🐛</div>
            <span className="auth-brand-name">Bugme</span>
          </div>
          <div style={{ fontSize: 40, margin: '16px 0 12px' }}>⚠️</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            Invitation unavailable
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
            {loadErr}
          </p>
          <Link to="/login" className="btn btn-primary btn-block">Go to Sign In</Link>
        </div>
      </div>
    );
  }

  // ── Accept form ──────────────────────────────────────────────────────────

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">🐛</div>
          <span className="auth-brand-name">Bugme</span>
        </div>

        {/* Invite info banner */}
        <div style={{
          background: 'var(--accent-bg)',
          border: '1px solid var(--accent-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 16px',
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
            Team Invitation
          </div>
          <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>
            {invite.inviterName} invited you to join
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)', marginTop: 2, letterSpacing: '-0.3px' }}>
            👥 {invite.teamName}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            Invitation sent to <strong style={{ color: 'var(--text)' }}>{invite.email}</strong>
          </div>
        </div>

        <h1 style={{ marginBottom: 4 }}>
          {invite.isNewUser ? 'Set up your account' : 'Sign in to accept'}
        </h1>
        <p className="auth-subtitle">
          {invite.isNewUser
            ? 'Create a password to join the team and start tracking bugs.'
            : 'Enter your password to join this team.'}
        </p>
        <div className="auth-divider" />

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {invite.isNewUser && (
            <div className="input-group">
              <label htmlFor="name">Full name *</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                autoFocus
                required
              />
            </div>
          )}

          <div className="input-group">
            <label htmlFor="password">
              {invite.isNewUser ? 'Create password *' : 'Your password *'}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={invite.isNewUser ? 'Min. 6 characters' : '••••••••'}
              autoFocus={!invite.isNewUser}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting
              ? <><span className="spinner spinner-white" /> Joining…</>
              : `Accept & Join ${invite.teamName}`
            }
          </button>
        </form>

        <div className="auth-switch">
          {invite.isNewUser
            ? <>Already have an account? <Link to="/login">Sign in instead</Link></>
            : <>Wrong account? <Link to="/login">Sign in with a different email</Link></>
          }
        </div>
      </div>
    </div>
  );
}

export default AcceptInvite;
