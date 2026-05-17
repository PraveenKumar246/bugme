import pool from '../config/database.js';

class Analytics {
  // Get project statistics
  static async getProjectStats(projectId) {
    const query = `
      SELECT
        COUNT(DISTINCT i.id) as total_issues,
        COUNT(DISTINCT CASE WHEN i.status = 'open' THEN i.id END) as open_issues,
        COUNT(DISTINCT CASE WHEN i.status = 'in_progress' THEN i.id END) as in_progress_issues,
        COUNT(DISTINCT CASE WHEN i.status = 'closed' THEN i.id END) as closed_issues,
        COUNT(DISTINCT CASE WHEN i.priority = 'critical' THEN i.id END) as critical_count,
        COUNT(DISTINCT CASE WHEN i.priority = 'high' THEN i.id END) as high_count,
        COUNT(DISTINCT t.id) as total_test_cases
      FROM projects p
      LEFT JOIN issues i ON p.id = i.project_id
      LEFT JOIN test_cases t ON p.id = t.project_id
      WHERE p.id = $1
      GROUP BY p.id;
    `;
    
    try {
      const result = await pool.query(query, [projectId]);
      return result.rows[0] || {
        total_issues: 0,
        open_issues: 0,
        in_progress_issues: 0,
        closed_issues: 0,
        critical_count: 0,
        high_count: 0,
        total_test_cases: 0,
      };
    } catch (error) {
      throw new Error(`Error getting project stats: ${error.message}`);
    }
  }

  // Get issues by status
  static async getIssuesByStatus(projectId) {
    const query = `
      SELECT 
        status,
        COUNT(*) as count
      FROM issues
      WHERE project_id = $1
      GROUP BY status
      ORDER BY count DESC;
    `;
    
    try {
      const result = await pool.query(query, [projectId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting issues by status: ${error.message}`);
    }
  }

  // Get issues by priority
  static async getIssuesByPriority(projectId) {
    const query = `
      SELECT 
        priority,
        COUNT(*) as count
      FROM issues
      WHERE project_id = $1
      GROUP BY priority
      ORDER BY 
        CASE 
          WHEN priority = 'critical' THEN 1
          WHEN priority = 'high' THEN 2
          WHEN priority = 'medium' THEN 3
          WHEN priority = 'low' THEN 4
        END;
    `;
    
    try {
      const result = await pool.query(query, [projectId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting issues by priority: ${error.message}`);
    }
  }

  // Get test coverage
  static async getTestCoverage(projectId) {
    const query = `
      SELECT
        COUNT(DISTINCT r.id) as total_requirements,
        COUNT(DISTINCT t.id) as total_test_cases,
        ROUND(
          (COUNT(DISTINCT t.id)::float / NULLIF(COUNT(DISTINCT r.id), 0)) * 100,
          2
        ) as coverage_percentage
      FROM projects p
      LEFT JOIN (SELECT DISTINCT project_id FROM issues) r ON p.id = r.project_id
      LEFT JOIN test_cases t ON p.id = t.project_id
      WHERE p.id = $1;
    `;
    
    try {
      const result = await pool.query(query, [projectId]);
      return result.rows[0] || {
        total_requirements: 0,
        total_test_cases: 0,
        coverage_percentage: 0,
      };
    } catch (error) {
      throw new Error(`Error getting test coverage: ${error.message}`);
    }
  }

  // Get recent issues
  static async getRecentIssues(projectId, limit = 10) {
    const query = `
      SELECT 
        i.id,
        i.title,
        i.priority,
        i.status,
        i.created_at,
        u.name as created_by_name
      FROM issues i
      JOIN users u ON i.created_by = u.id
      WHERE i.project_id = $1
      ORDER BY i.created_at DESC
      LIMIT $2;
    `;
    
    try {
      const result = await pool.query(query, [projectId, limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting recent issues: ${error.message}`);
    }
  }

  // Get team members
  static async getTeamMembers(projectId) {
    const query = `
      SELECT DISTINCT
        u.id,
        u.name,
        u.email,
        COUNT(i.id) as assigned_issues
      FROM users u
      LEFT JOIN issues i ON u.id = i.assignee_id
      LEFT JOIN projects p ON i.project_id = p.id
      WHERE p.id = $1 OR u.id IN (
        SELECT owner_id FROM projects WHERE id = $1
      )
      GROUP BY u.id, u.name, u.email
      ORDER BY assigned_issues DESC;
    `;
    
    try {
      const result = await pool.query(query, [projectId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting team members: ${error.message}`);
    }
  }

  // Get dashboard data (comprehensive)
  static async getDashboardData(projectId) {
    try {
      const [stats, byStatus, byPriority, coverage, recent] = await Promise.all([
        this.getProjectStats(projectId),
        this.getIssuesByStatus(projectId),
        this.getIssuesByPriority(projectId),
        this.getTestCoverage(projectId),
        this.getRecentIssues(projectId),
      ]);

      return {
        stats,
        byStatus,
        byPriority,
        coverage,
        recent,
      };
    } catch (error) {
      throw new Error(`Error getting dashboard data: ${error.message}`);
    }
  }
}

export default Analytics;
