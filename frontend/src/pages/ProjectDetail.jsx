import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService, issueService, testCaseService } from '../services/api';
import '../styles/project-detail.css';

function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [activeTab, setActiveTab] = useState('issues');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);
  const [issueForm, setIssueForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
  });
  const [testForm, setTestForm] = useState({
    title: '',
    description: '',
    expected_result: '',
  });

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectRes, issuesRes, testsRes] = await Promise.all([
        projectService.getById(projectId),
        issueService.getAll(projectId),
        testCaseService.getAll(projectId),
      ]);
      setProject(projectRes.data);
      setIssues(issuesRes.data);
      setTestCases(testsRes.data);
    } catch (err) {
      setError('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    try {
      await issueService.create(
        projectId,
        issueForm.title,
        issueForm.description,
        issueForm.priority
      );
      setIssueForm({ title: '', description: '', priority: 'medium' });
      setShowIssueForm(false);
      fetchData();
    } catch (err) {
      setError('Failed to create issue');
    }
  };

  const handleDeleteIssue = async (issueId) => {
    if (window.confirm('Delete this issue?')) {
      try {
        await issueService.delete(projectId, issueId);
        fetchData();
      } catch (err) {
        setError('Failed to delete issue');
      }
    }
  };

  const handleCreateTestCase = async (e) => {
    e.preventDefault();
    try {
      await testCaseService.create(
        projectId,
        testForm.title,
        testForm.description,
        [],
        testForm.expected_result
      );
      setTestForm({ title: '', description: '', expected_result: '' });
      setShowTestForm(false);
      fetchData();
    } catch (err) {
      setError('Failed to create test case');
    }
  };

  const handleDeleteTestCase = async (testCaseId) => {
    if (window.confirm('Delete this test case?')) {
      try {
        await testCaseService.delete(projectId, testCaseId);
        fetchData();
      } catch (err) {
        setError('Failed to delete test case');
      }
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: '#ff6b6b',
      high: '#ffa94d',
      medium: '#ffd43b',
      low: '#51cf66',
    };
    return colors[priority] || '#999';
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '60px' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="page-wrapper">
        <div className="alert alert-error">Project not found</div>
        <button className="btn btn-primary" onClick={() => navigate('/apps')}>
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="project-detail-header">
        <div>
          <h1>{project.name}</h1>
          <p className="project-desc">{project.description}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/apps')}>
          ← Back
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'issues' ? 'active' : ''}`}
          onClick={() => setActiveTab('issues')}
        >
          🐛 Issues ({issues.length})
        </button>
        <button
          className={`tab ${activeTab === 'tests' ? 'active' : ''}`}
          onClick={() => setActiveTab('tests')}
        >
          ✅ Test Cases ({testCases.length})
        </button>
      </div>

      {activeTab === 'issues' && (
        <div>
          <button
            className="btn btn-primary"
            onClick={() => setShowIssueForm(!showIssueForm)}
          >
            + New Issue
          </button>

          {showIssueForm && (
            <div className="card" style={{ marginTop: '20px' }}>
              <form onSubmit={handleCreateIssue}>
                <div className="input-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={issueForm.title}
                    onChange={(e) =>
                      setIssueForm({ ...issueForm, title: e.target.value })
                    }
                    placeholder="Issue title"
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Description</label>
                  <textarea
                    value={issueForm.description}
                    onChange={(e) =>
                      setIssueForm({
                        ...issueForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Issue description"
                    rows="4"
                  />
                </div>

                <div className="input-group">
                  <label>Priority</label>
                  <select
                    value={issueForm.priority}
                    onChange={(e) =>
                      setIssueForm({ ...issueForm, priority: e.target.value })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Create Issue
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowIssueForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="issues-list">
            {issues.length === 0 ? (
              <p className="empty-msg">No issues yet</p>
            ) : (
              issues.map((issue) => (
                <div key={issue.id} className="issue-item">
                  <div className="issue-content">
                    <h3>{issue.title}</h3>
                    <p className="issue-description">{issue.description}</p>
                    <div className="issue-meta">
                      <span
                        className="priority-badge"
                        style={{ borderColor: getPriorityColor(issue.priority) }}
                      >
                        {issue.priority}
                      </span>
                      <span className="status-badge">{issue.status}</span>
                    </div>
                  </div>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteIssue(issue.id)}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'tests' && (
        <div>
          <button
            className="btn btn-primary"
            onClick={() => setShowTestForm(!showTestForm)}
          >
            + New Test Case
          </button>

          {showTestForm && (
            <div className="card" style={{ marginTop: '20px' }}>
              <form onSubmit={handleCreateTestCase}>
                <div className="input-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={testForm.title}
                    onChange={(e) =>
                      setTestForm({ ...testForm, title: e.target.value })
                    }
                    placeholder="Test case title"
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Description</label>
                  <textarea
                    value={testForm.description}
                    onChange={(e) =>
                      setTestForm({
                        ...testForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Test description"
                    rows="4"
                  />
                </div>

                <div className="input-group">
                  <label>Expected Result</label>
                  <textarea
                    value={testForm.expected_result}
                    onChange={(e) =>
                      setTestForm({
                        ...testForm,
                        expected_result: e.target.value,
                      })
                    }
                    placeholder="Expected result"
                    rows="3"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Create Test Case
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowTestForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="tests-list">
            {testCases.length === 0 ? (
              <p className="empty-msg">No test cases yet</p>
            ) : (
              testCases.map((test) => (
                <div key={test.id} className="test-item">
                  <div className="test-content">
                    <h3>{test.title}</h3>
                    <p className="test-description">{test.description}</p>
                    <p className="test-expected">
                      <strong>Expected:</strong> {test.expected_result}
                    </p>
                  </div>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteTestCase(test.id)}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetail;
