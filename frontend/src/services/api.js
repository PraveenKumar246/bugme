import axios from 'axios';

// const API_BASE_URL = '/api/v1';
const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1';


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authService = {
  signup:         (email, password, name) =>
    api.post('/auth/signup', { email, password, name }),
  login:          (email, password) =>
    api.post('/auth/login', { email, password }),
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
  getAll:          ()                              => api.get('/projects'),
  getById:         (id)                            => api.get(`/projects/${id}`),
  create:          (name, desc, teamId, platform)  => api.post('/projects', { name, description: desc, team_id: teamId, platform }),
  update:          (id, name, desc, platform)      => api.patch(`/projects/${id}`, { name, description: desc, platform }),
  delete:          (id)                            => api.delete(`/projects/${id}`),
  toggleFavorite:  (id)                            => api.post(`/projects/${id}/favorite`),
};

export const issueService = {
  getAll:  (projectId, filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/projects/${projectId}/issues?${params}`);
  },
  getById: (projectId, issueId)      => api.get(`/projects/${projectId}/issues/${issueId}`),
  create:  (projectId, data)         => api.post(`/projects/${projectId}/issues`, data),
  update:  (projectId, issueId, updates) =>
    api.patch(`/projects/${projectId}/issues/${issueId}`, updates),
  delete:  (projectId, issueId)      => api.delete(`/projects/${projectId}/issues/${issueId}`),
  getComments: (projectId, issueId)  => api.get(`/projects/${projectId}/issues/${issueId}/comments`),
  addComment:  (projectId, issueId, text) =>
    api.post(`/projects/${projectId}/issues/${issueId}/comments`, { text }),
  deleteComment: (projectId, issueId, commentId) =>
    api.delete(`/projects/${projectId}/issues/${issueId}/comments/${commentId}`),
};

export const testCaseService = {
  getAll:  (projectId)           => api.get(`/projects/${projectId}/test-cases`),
  getById: (projectId, tcId)     => api.get(`/projects/${projectId}/test-cases/${tcId}`),
  create:  (projectId, data)     => api.post(`/projects/${projectId}/test-cases`, data),
  update:  (projectId, tcId, updates) =>
    api.patch(`/projects/${projectId}/test-cases/${tcId}`, updates),
  delete:  (projectId, tcId)     => api.delete(`/projects/${projectId}/test-cases/${tcId}`),
};

export const sprintService = {
  getAll:       (projectId)               => api.get(`/projects/${projectId}/sprints`),
  create:       (projectId, data)         => api.post(`/projects/${projectId}/sprints`, data),
  update:       (projectId, id, data)     => api.patch(`/projects/${projectId}/sprints/${id}`, data),
  delete:       (projectId, id)           => api.delete(`/projects/${projectId}/sprints/${id}`),
  addIssue:     (projectId, id, issueId)  => api.post(`/projects/${projectId}/sprints/${id}/issues`, { issue_id: issueId }),
  removeIssue:  (projectId, id, issueId)  => api.delete(`/projects/${projectId}/sprints/${id}/issues/${issueId}`),
};

export const analyticsService = {
  getStats:      (projectId) => api.get(`/projects/${projectId}/analytics/stats`),
  getByStatus:   (projectId) => api.get(`/projects/${projectId}/analytics/issues/by-status`),
  getByPriority: (projectId) => api.get(`/projects/${projectId}/analytics/issues/by-priority`),
  getDashboard:  (projectId) => api.get(`/projects/${projectId}/analytics/dashboard`),
};

export const teamService = {
  getAll:        ()                   => api.get('/teams'),
  create:        (name, desc)         => api.post('/teams', { name, description: desc }),
  delete:        (id)                 => api.delete(`/teams/${id}`),
  invite:        (teamId, email)      => api.post(`/teams/${teamId}/members`, { email }),
  removeMember:  (teamId, userId)     => api.delete(`/teams/${teamId}/members/${userId}`),
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
  getAll:  (projectId)              => api.get(`/projects/${projectId}/custom-fields`),
  create:  (projectId, data)        => api.post(`/projects/${projectId}/custom-fields`, data),
  delete:  (projectId, fieldId)     => api.delete(`/projects/${projectId}/custom-fields/${fieldId}`),
};

// Public — no auth token needed
export const invitationService = {
  get:    (token)            => api.get(`/invitations/${token}`),
  accept: (token, name, pw)  => api.post(`/invitations/${token}/accept`, { name, password: pw }),
};

export default api;
