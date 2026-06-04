import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// ─────────────────────────────────────────────────────────────────────────────
// In-memory access token
// The access token is NEVER written to localStorage, sessionStorage, or any
// JS-readable cookie. It lives only in this module variable. On page reload it
// is gone — AuthContext restores it silently via the HttpOnly refresh cookie.
// ─────────────────────────────────────────────────────────────────────────────
let _accessToken = null;

export const setAccessToken  = (token) => { _accessToken = token; };
export const clearAccessToken = ()      => { _accessToken = null; };

// ─────────────────────────────────────────────────────────────────────────────
// Axios instance — withCredentials lets the browser send the HttpOnly
// refresh cookie automatically on every request (needed for /auth/refresh).
// ─────────────────────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL:         API_BASE_URL,
  headers:         { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach the in-memory access token to every outgoing request.
api.interceptors.request.use((config) => {
  if (_accessToken) config.headers.Authorization = `Bearer ${_accessToken}`;
  return config;
});

// ─────────────────────────────────────────────────────────────────────────────
// Dedicated client used ONLY for the token refresh call inside the interceptor.
// Using a separate instance prevents the 401 response interceptor from firing
// on the refresh request itself and causing an infinite loop.
// ─────────────────────────────────────────────────────────────────────────────
const _refreshClient = axios.create({
  baseURL:         API_BASE_URL,
  withCredentials: true,
});

// On every 401, silently try to refresh the access token and retry once.
// If refresh also fails the user is logged out via a custom DOM event.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;
    try {
      const { data } = await _refreshClient.post('/auth/refresh');
      setAccessToken(data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    } catch {
      clearAccessToken();
      window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(error);
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Service objects
// ─────────────────────────────────────────────────────────────────────────────

export const authService = {
  signup:         (email, password, name) =>
    api.post('/auth/signup', { email, password, name }),
  login:          (email, password) =>
    api.post('/auth/login', { email, password }),
  refresh:        () =>
    api.post('/auth/refresh'),
  logout:         () =>
    api.post('/auth/logout'),
  getProfile:     () =>
    api.get('/auth/profile'),
  updateProfile:  (data) =>
    api.patch('/auth/profile', data),
  changePassword: (current_password, new_password) =>
    api.post('/auth/change-password', { current_password, new_password }),
  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword:  (token, new_password) =>
    api.post('/auth/reset-password', { token, new_password }),
};

export const projectService = {
  getAll:         ()                             => api.get('/projects'),
  getById:        (id)                           => api.get(`/projects/${id}`),
  create:         (name, desc, teamId, platform) => api.post('/projects', { name, description: desc, team_id: teamId, platform }),
  update:         (id, name, desc, platform)     => api.patch(`/projects/${id}`, { name, description: desc, platform }),
  delete:         (id)                           => api.delete(`/projects/${id}`),
  toggleFavorite: (id)                           => api.post(`/projects/${id}/favorite`),
};

export const issueService = {
  getAll:  (projectId, filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/projects/${projectId}/issues?${params}`);
  },
  getById:       (projectId, issueId)             => api.get(`/projects/${projectId}/issues/${issueId}`),
  create:        (projectId, data)                => api.post(`/projects/${projectId}/issues`, data),
  update:        (projectId, issueId, updates)    => api.patch(`/projects/${projectId}/issues/${issueId}`, updates),
  delete:        (projectId, issueId)             => api.delete(`/projects/${projectId}/issues/${issueId}`),
  getComments:   (projectId, issueId)             => api.get(`/projects/${projectId}/issues/${issueId}/comments`),
  addComment:    (projectId, issueId, text)       => api.post(`/projects/${projectId}/issues/${issueId}/comments`, { text }),
  deleteComment: (projectId, issueId, commentId)  => api.delete(`/projects/${projectId}/issues/${issueId}/comments/${commentId}`),
};

export const testCaseService = {
  getAll:  (projectId)             => api.get(`/projects/${projectId}/test-cases`),
  getById: (projectId, tcId)       => api.get(`/projects/${projectId}/test-cases/${tcId}`),
  create:  (projectId, data)       => api.post(`/projects/${projectId}/test-cases`, data),
  update:  (projectId, tcId, data) => api.patch(`/projects/${projectId}/test-cases/${tcId}`, data),
  delete:  (projectId, tcId)       => api.delete(`/projects/${projectId}/test-cases/${tcId}`),
};

export const sprintService = {
  getAll:      (projectId)               => api.get(`/projects/${projectId}/sprints`),
  create:      (projectId, data)         => api.post(`/projects/${projectId}/sprints`, data),
  update:      (projectId, id, data)     => api.patch(`/projects/${projectId}/sprints/${id}`, data),
  delete:      (projectId, id)           => api.delete(`/projects/${projectId}/sprints/${id}`),
  addIssue:    (projectId, id, issueId)  => api.post(`/projects/${projectId}/sprints/${id}/issues`, { issue_id: issueId }),
  removeIssue: (projectId, id, issueId)  => api.delete(`/projects/${projectId}/sprints/${id}/issues/${issueId}`),
};

export const analyticsService = {
  getStats:      (projectId) => api.get(`/projects/${projectId}/analytics/stats`),
  getByStatus:   (projectId) => api.get(`/projects/${projectId}/analytics/issues/by-status`),
  getByPriority: (projectId) => api.get(`/projects/${projectId}/analytics/issues/by-priority`),
  getDashboard:  (projectId) => api.get(`/projects/${projectId}/analytics/dashboard`),
};

export const teamService = {
  getAll:       ()                  => api.get('/teams'),
  create:       (name, desc)        => api.post('/teams', { name, description: desc }),
  delete:       (id)                => api.delete(`/teams/${id}`),
  invite:       (teamId, email)     => api.post(`/teams/${teamId}/members`, { email }),
  removeMember: (teamId, userId)    => api.delete(`/teams/${teamId}/members/${userId}`),
};

export const knowledgeBaseService = {
  getAll:  (projectId, category, subcategory) =>
    api.get(`/projects/${projectId}/knowledge-base`, { params: { category, subcategory } }),
  create:  (projectId, data) =>
    api.post(`/projects/${projectId}/knowledge-base`, data),
  update:  (projectId, docId, data) =>
    api.patch(`/projects/${projectId}/knowledge-base/${docId}`, data),
  delete:  (projectId, docId) =>
    api.delete(`/projects/${projectId}/knowledge-base/${docId}`),
};

export const customFieldService = {
  getAll:  (projectId)          => api.get(`/projects/${projectId}/custom-fields`),
  create:  (projectId, data)    => api.post(`/projects/${projectId}/custom-fields`, data),
  delete:  (projectId, fieldId) => api.delete(`/projects/${projectId}/custom-fields/${fieldId}`),
};

// Public — no auth token needed
export const invitationService = {
  get:    (token)           => api.get(`/invitations/${token}`),
  accept: (token, name, pw) => api.post(`/invitations/${token}/accept`, { name, password: pw }),
};

export default api;
