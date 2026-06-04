import { createContext, useContext, useState, useEffect } from 'react';
import { authService, setAccessToken, clearAccessToken } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for forced logout events dispatched by the 401 interceptor when
  // the refresh token is also expired or invalid.
  useEffect(() => {
    const handleForceLogout = () => {
      clearAccessToken();
      setUser(null);
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  // On mount, silently restore the session using the HttpOnly refresh cookie.
  // If no valid cookie exists (new user, after logout) we stay logged-out.
  useEffect(() => {
    authService.refresh()
      .then(({ data }) => {
        setAccessToken(data.accessToken);
        setUser(data.user);
      })
      .catch(() => {
        // No valid refresh token — user needs to log in.
      })
      .finally(() => setLoading(false));
  }, []);

  /** Called after login/signup — stores the access token in memory only. */
  const login = (userData, accessToken) => {
    setAccessToken(accessToken);
    setUser(userData);
  };

  /** Called after profile updates — refreshes the user in context without touching the token. */
  const updateUser = (userData) => setUser(userData);

  /** Clears the HttpOnly refresh cookie server-side and wipes in-memory state. */
  const logout = async () => {
    try { await authService.logout(); } catch { /* ignore network errors */ }
    clearAccessToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
