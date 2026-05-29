import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/auth.css';

function ForgotPassword() {
  const [email, setEmail]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [sent, setSent]             = useState(false);
  const [error, setError]           = useState('');
  const [notRegistered, setNotRegistered] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotRegistered(false);
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.';
      setError(msg);
      setSent(false);
      if (err.response?.status === 404) setNotRegistered(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">🐛</div>
          <span className="auth-brand-name">Bugme</span>
        </div>

        {sent ? (
          <>
            <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📬</div>
              <h1 style={{ marginBottom: 8 }}>Check your inbox</h1>
              <p className="auth-subtitle" style={{ marginBottom: 0 }}>
                A password reset link has been sent to <strong>{email}</strong>.
                It expires in 1 hour.
              </p>
            </div>
            <div className="auth-divider" />
            <div className="auth-switch">
              <Link to="/login">← Back to Sign In</Link>
            </div>
          </>
        ) : (
          <>
            <h1>Forgot password?</h1>
            <p className="auth-subtitle">
              Enter your account email and we'll send you a reset link.
            </p>
            <div className="auth-divider" />

            {error && (
              <div className="alert alert-error" style={{ marginBottom: notRegistered ? 8 : 16 }}>
                {error}
              </div>
            )}

            {notRegistered && (
              <Link to="/signup" className="btn btn-primary btn-block" style={{ marginBottom: 16, textDecoration: 'none', textAlign: 'center' }}>
                Create an Account →
              </Link>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading
                  ? <><span className="spinner spinner-white" /> Sending…</>
                  : 'Send Reset Link'}
              </button>
            </form>

            <div className="auth-switch">
              Remember your password? <Link to="/login">Sign in</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
