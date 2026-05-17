import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';
import '../styles/auth.css';

function Login() {
  const [email, setEmail] = useState('demo@bugasura.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      const { user, token } = response.data;
      login(user, token);
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h1>🐛 Bugasura</h1>
          <p>Bug Tracking & Test Management</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Login to Your Account</h2>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/signup">Sign up here</Link>
            </p>
          </div>
        </form>

        <div className="demo-info">
          <p><strong>Demo Credentials:</strong></p>
          <p>Email: demo@bugasura.com</p>
          <p>Password: Demo@123</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
