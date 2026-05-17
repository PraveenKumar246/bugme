import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/home.css';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/projects');
    return null;
  }

  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <h1>🐛 Bugasura</h1>
          <h2>Bug Tracking & Test Management Made Simple</h2>
          <p>
            A modern, collaborative platform for tracking bugs and managing test cases.
            Built for teams that move fast and test smarter.
          </p>
          <div className="hero-buttons">
            <button
              className="btn btn-primary"
              onClick={() => navigate('/signup')}
            >
              Get Started Free
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h3>Why Choose Bugasura?</h3>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">🚀</span>
              <h4>Lightning Fast</h4>
              <p>Create, report and track bugs in seconds with our intuitive interface</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📊</span>
              <h4>Test Management</h4>
              <p>Organize, execute and track test cases with real-time insights</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">👥</span>
              <h4>Team Collaboration</h4>
              <p>Real-time updates and seamless collaboration across your team</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🆓</span>
              <h4>Forever Free</h4>
              <p>No hidden charges. Unlimited users, projects and issues</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">⚡</span>
              <h4>Smart Features</h4>
              <p>Duplicate detection, priority tracking, and advanced filtering</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🔗</span>
              <h4>Integrations</h4>
              <p>Seamlessly connect with your favorite tools and workflows</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h3>Ready to streamline your QA process?</h3>
          <p>Start tracking bugs and managing tests better today</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/signup')}
          >
            Create Free Account
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
