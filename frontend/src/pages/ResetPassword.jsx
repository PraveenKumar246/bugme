import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/auth.css';

function ResetPassword() {
  const [searchParams]              = useSearchParams();
  const token                       = searchParams.get('token') || '';
  const navigate                    = useNavigate();
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [loading, setLoading]       = useState(false);
  const [done, setDone]             = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="auth-brand-icon">🐛</div>
            <span className="auth-brand-name">Bugme</span>
          </div>
          <div className="alert alert-error">Invalid or missing reset token.</div>
          <div className="auth-switch" style={{ marginTop: 16 }}>
            <Link to="/forgot-password">Request a new reset link</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">🐛</div>
          <span className="auth-brand-name">Bugme</span>
        </div>

        {done ? (
          <>
            <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <h1 style={{ marginBottom: 8 }}>Password reset!</h1>
              <p className="auth-subtitle" style={{ marginBottom: 0 }}>
                Your password has been updated. Redirecting you to sign in…
              </p>
            </div>
            <div className="auth-divider" />
            <div className="auth-switch">
              <Link to="/login">Sign in now →</Link>
            </div>
          </>
        ) : (
          <>
            <h1>Set new password</h1>
            <p className="auth-subtitle">Choose a strong password for your account.</p>
            <div className="auth-divider" />

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="password">New password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label htmlFor="confirm">Confirm password</label>
                <input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat your new password"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading
                  ? <><span className="spinner spinner-white" /> Resetting…</>
                  : 'Reset Password'}
              </button>
            </form>

            <div className="auth-switch">
              <Link to="/login">← Back to Sign In</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
