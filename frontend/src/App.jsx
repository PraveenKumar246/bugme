import { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/Sidebar';
import WhatNew from './components/WhatNew';
import ProtectedRoute from './components/ProtectedRoute';
import { PageLoader } from './components/ui/Spinner';

// ── Code-split every page — each is loaded only on first navigation ──────────
const Home           = lazy(() => import('./pages/Home'));
const Login          = lazy(() => import('./pages/Login'));
const Signup         = lazy(() => import('./pages/Signup'));
const Projects       = lazy(() => import('./pages/Projects'));
const ProjectDetail  = lazy(() => import('./pages/ProjectDetail'));
const KnowledgeBase  = lazy(() => import('./pages/KnowledgeBase'));
const Teams          = lazy(() => import('./pages/Teams'));
const UserProfile    = lazy(() => import('./pages/UserProfile'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword  = lazy(() => import('./pages/ResetPassword'));
const AcceptInvite   = lazy(() => import('./pages/AcceptInvite'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
});

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
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public */}
                <Route path="/"                element={<Home />} />
                <Route path="/login"           element={<Login />} />
                <Route path="/signup"          element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password"  element={<ResetPassword />} />
                <Route path="/invite/:token"   element={<AcceptInvite />} />

                {/* Protected — wrapped in AppLayout */}
                <Route path="/apps" element={
                  <ProtectedRoute><AppLayout><Projects /></AppLayout></ProtectedRoute>
                } />
                <Route path="/apps/:projectId" element={
                  <ProtectedRoute><AppLayout><ProjectDetail /></AppLayout></ProtectedRoute>
                } />
                <Route path="/apps/:projectId/knowledge-base" element={
                  <ProtectedRoute><AppLayout><KnowledgeBase /></AppLayout></ProtectedRoute>
                } />
                <Route path="/teams" element={
                  <ProtectedRoute><AppLayout><Teams /></AppLayout></ProtectedRoute>
                } />
                <Route path="/account/profile" element={
                  <ProtectedRoute><AppLayout><UserProfile /></AppLayout></ProtectedRoute>
                } />

                {/* Legacy redirects */}
                <Route path="/projects"    element={<Navigate to="/apps" replace />} />
                <Route path="/projects/:id" element={<Navigate to="/apps" replace />} />
                <Route path="*"             element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
