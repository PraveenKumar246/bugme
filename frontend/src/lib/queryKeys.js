export const queryKeys = {
  projects: () => ['projects'],
  project:  (id) => ['projects', id],

  issues:       (projectId) => ['projects', projectId, 'issues'],
  comments:     (projectId, issueId) => ['projects', projectId, 'issues', issueId, 'comments'],

  testCases:    (projectId) => ['projects', projectId, 'test-cases'],
  sprints:      (projectId) => ['projects', projectId, 'sprints'],
  customFields: (projectId) => ['projects', projectId, 'custom-fields'],
  dashboard:    (projectId) => ['projects', projectId, 'analytics', 'dashboard'],

  teams: () => ['teams'],

  knowledgeBase: (projectId, category, subcategory) =>
    ['projects', projectId, 'knowledge-base', category, subcategory].filter(Boolean),
};
