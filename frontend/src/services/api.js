import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth services
export const authService = {
  signup: (email, password, name) =>
    api.post('/auth/signup', { email, password, name }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
};

// Project services
export const projectService = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (name, description) =>
    api.post('/projects', { name, description }),
  update: (id, name, description) =>
    api.patch(`/projects/${id}`, { name, description }),
  delete: (id) => api.delete(`/projects/${id}`),
};

// Issue services
export const issueService = {
  getAll: (projectId, filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/projects/${projectId}/issues?${params}`);
  },
  getById: (projectId, issueId) =>
    api.get(`/projects/${projectId}/issues/${issueId}`),
  create: (projectId, title, description, priority) =>
    api.post(`/projects/${projectId}/issues`, {
      title,
      description,
      priority,
    }),
  update: (projectId, issueId, updates) =>
    api.patch(`/projects/${projectId}/issues/${issueId}`, updates),
  delete: (projectId, issueId) =>
    api.delete(`/projects/${projectId}/issues/${issueId}`),
};

// Test case services
export const testCaseService = {
  getAll: (projectId) => api.get(`/projects/${projectId}/test-cases`),
  getById: (projectId, testCaseId) =>
    api.get(`/projects/${projectId}/test-cases/${testCaseId}`),
  create: (projectId, title, description, steps, expectedResult) =>
    api.post(`/projects/${projectId}/test-cases`, {
      title,
      description,
      steps,
      expected_result: expectedResult,
    }),
  update: (projectId, testCaseId, updates) =>
    api.patch(`/projects/${projectId}/test-cases/${testCaseId}`, updates),
  delete: (projectId, testCaseId) =>
    api.delete(`/projects/${projectId}/test-cases/${testCaseId}`),
};

export default api;
