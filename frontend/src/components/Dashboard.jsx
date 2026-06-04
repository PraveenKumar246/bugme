import { useQuery, useQueryClient } from '@tanstack/react-query';
import { analyticsService } from '../services/api';
import { queryKeys } from '../lib/queryKeys';
import '../styles/dashboard.css';

function Dashboard({ projectId }) {
  const queryClient = useQueryClient();

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: queryKeys.dashboard(projectId),
    queryFn: () => analyticsService.getDashboard(projectId).then(r => r.data),
  });

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading"></div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return <div className="alert alert-error">Failed to load dashboard</div>;
  }

  const { stats, byStatus, byPriority, coverage, recent } = dashboardData;

  const getStatusColor = (status) => {
    const colors = { open: '#ff6b6b', in_progress: '#ffa94d', closed: '#51cf66' };
    return colors[status] || '#999';
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 Project Analytics</h2>
        <button
          className="btn btn-secondary btn-small"
          onClick={() => queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(projectId) })}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🐛</div>
          <div className="stat-content">
            <div className="stat-label">Total Issues</div>
            <div className="stat-value">{stats.total_issues}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <div className="stat-label">Open</div>
            <div className="stat-value">{stats.open_issues}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🟡</div>
          <div className="stat-content">
            <div className="stat-label">In Progress</div>
            <div className="stat-value">{stats.in_progress_issues}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-label">Closed</div>
            <div className="stat-value">{stats.closed_issues}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚨</div>
          <div className="stat-content">
            <div className="stat-label">Critical</div>
            <div className="stat-value">{stats.critical_count}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-label">High Priority</div>
            <div className="stat-value">{stats.high_count}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✍️</div>
          <div className="stat-content">
            <div className="stat-label">Test Cases</div>
            <div className="stat-value">{stats.total_test_cases}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-label">Coverage</div>
            <div className="stat-value">{coverage.coverage_percentage || 0}%</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Issues by Status</h3>
          <div className="chart-content">
            {byStatus && byStatus.length > 0 ? (
              <div className="chart-bars">
                {byStatus.map((item) => (
                  <div key={item.status} className="chart-bar">
                    <div className="bar-label">{item.status}</div>
                    <div className="bar-container">
                      <div
                        className="bar"
                        style={{
                          width: `${(item.count / Math.max(...byStatus.map((s) => s.count))) * 100}%`,
                          backgroundColor: getStatusColor(item.status),
                        }}
                      >
                        <span className="bar-value">{item.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-chart">No data</p>
            )}
          </div>
        </div>

        <div className="chart-card">
          <h3>Issues by Priority</h3>
          <div className="chart-content">
            {byPriority && byPriority.length > 0 ? (
              <div className="priority-list">
                {byPriority.map((item) => (
                  <div key={item.priority} className="priority-item">
                    <div className="priority-label">
                      <span className="priority-badge" style={{
                        borderColor: item.priority === 'critical' ? '#ff6b6b' :
                                    item.priority === 'high' ? '#ffa94d' :
                                    item.priority === 'medium' ? '#ffd43b' : '#51cf66'
                      }}>
                        {item.priority}
                      </span>
                    </div>
                    <div className="priority-count">{item.count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-chart">No data</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Issues */}
      <div className="recent-issues-card">
        <h3>Recent Issues</h3>
        {recent && recent.length > 0 ? (
          <table className="issues-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((issue) => (
                <tr key={issue.id}>
                  <td className="issue-title">{issue.title}</td>
                  <td>
                    <span className="priority-badge" style={{
                      borderColor: issue.priority === 'critical' ? '#ff6b6b' :
                                  issue.priority === 'high' ? '#ffa94d' :
                                  issue.priority === 'medium' ? '#ffd43b' : '#51cf66',
                    }}>
                      {issue.priority}
                    </span>
                  </td>
                  <td><span className="status-badge">{issue.status}</span></td>
                  <td className="creator-name">{issue.created_by_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-state">No recent issues</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
