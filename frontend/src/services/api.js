import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api/v1';

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
  signup: (email, password, name) =>
    api.post('/auth/signup', { email, password, name }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  getProfile: () =>
    api.get('/auth/profile'),
  updateProfile: (data) =>
    api.patch('/auth/profile', data),
};

export const projectService = {
  getAll:  ()                              => api.get('/projects'),
  getById: (id)                            => api.get(`/projects/${id}`),
  create:  (name, desc, teamId, platform)  => api.post('/projects', { name, description: desc, team_id: teamId, platform }),
  update:  (id, name, desc)               => api.patch(`/projects/${id}`, { name, description: desc }),
  delete:  (id)                            => api.delete(`/projects/${id}`),
};

export const issueService = {
  getAll:  (projectId, filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/projects/${projectId}/issues?${params}`);
  },
  getById: (projectId, issueId)      => api.get(`/projects/${projectId}/issues/${issueId}`),
  create:  (projectId, title, desc, priority) =>
    api.post(`/projects/${projectId}/issues`, { title, description: desc, priority }),
  update:  (projectId, issueId, updates) =>
    api.patch(`/projects/${projectId}/issues/${issueId}`, updates),
  delete:  (projectId, issueId)      => api.delete(`/projects/${projectId}/issues/${issueId}`),
};

export const testCaseService = {
  getAll:  (projectId)           => api.get(`/projects/${projectId}/test-cases`),
  getById: (projectId, tcId)     => api.get(`/projects/${projectId}/test-cases/${tcId}`),
  create:  (projectId, title, desc, steps, expectedResult) =>
    api.post(`/projects/${projectId}/test-cases`, { title, description: desc, steps, expected_result: expectedResult }),
  update:  (projectId, tcId, updates) =>
    api.patch(`/projects/${projectId}/test-cases/${tcId}`, updates),
  delete:  (projectId, tcId)     => api.delete(`/projects/${projectId}/test-cases/${tcId}`),
};

export const teamService = {
  getAll:        ()                   => api.get('/teams'),
  create:        (name, desc)         => api.post('/teams', { name, description: desc }),
  delete:        (id)                 => api.delete(`/teams/${id}`),
  invite:        (teamId, email)      => api.post(`/teams/${teamId}/members`, { email }),
  removeMember:  (teamId, userId)     => api.delete(`/teams/${teamId}/members/${userId}`),
};

// Public — no auth token needed
export const invitationService = {
  get:    (token)            => api.get(`/invitations/${token}`),
  accept: (token, name, pw)  => api.post(`/invitations/${token}/accept`, { name, password: pw }),
};

export default api;
