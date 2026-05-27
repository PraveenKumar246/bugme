import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/Sidebar';
import WhatNew from './components/WhatNew';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Teams from './pages/Teams';
import UserProfile from './pages/UserProfile';
import AcceptInvite from './pages/AcceptInvite';

function AppLayout({ children }) {
  const [showWhatNew, setShowWhatNew] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar
        onWhatNew={() => setShowWhatNew(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="app-content">
        <div className="mobile-topbar">
          <button
            className="hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <span /><span /><span />
          </button>
          <span className="mobile-topbar-title">🐛 Bugme</span>
        </div>
        {children}
      </div>
      {showWhatNew && <WhatNew onClose={() => setShowWhatNew(false)} />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected routes with sidebar layout */}
            <Route path="/apps" element={
              <ProtectedRoute><AppLayout><Projects /></AppLayout></ProtectedRoute>
            } />
            <Route path="/apps/:projectId" element={
              <ProtectedRoute><AppLayout><ProjectDetail /></AppLayout></ProtectedRoute>
            } />
            <Route path="/teams" element={
              <ProtectedRoute><AppLayout><Teams /></AppLayout></ProtectedRoute>
            } />
            <Route path="/account/profile" element={
              <ProtectedRoute><AppLayout><UserProfile /></AppLayout></ProtectedRoute>
            } />

            {/* Public invite accept — no auth required */}
            <Route path="/invite/:token" element={<AcceptInvite />} />

            {/* Legacy redirects */}
            <Route path="/projects" element={<Navigate to="/apps" replace />} />
            <Route path="/projects/:id" element={<Navigate to="/apps" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
