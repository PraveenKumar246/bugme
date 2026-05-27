# Bugme MVP - API Documentation

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

All endpoints (except signup/login) require JWT token in header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Endpoints

### Signup
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 2. Project Endpoints

### List All Projects
```http
GET /projects
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "My Project",
    "description": "Project description",
    "owner_id": "uuid",
    "created_at": "2024-05-17T10:00:00Z"
  }
]
```

### Create Project
```http
POST /projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Project",
  "description": "Project description"
}
```

**Response (201):**
```json
{
  "message": "Project created successfully",
  "project": {
    "id": "uuid",
    "name": "New Project",
    "description": "Project description",
    "owner_id": "uuid",
    "created_at": "2024-05-17T10:00:00Z"
  }
}
```

### Get Project Details
```http
GET /projects/:projectId
Authorization: Bearer <token>
```

### Update Project
```http
PATCH /projects/:projectId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

### Delete Project
```http
DELETE /projects/:projectId
Authorization: Bearer <token>
```

---

## 3. Issue Endpoints

### List Issues
```http
GET /projects/:projectId/issues
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` - Filter by status (open, in_progress, closed)
- `priority` - Filter by priority (critical, high, medium, low)
- `assignee_id` - Filter by assignee

**Example:**
```
GET /projects/{id}/issues?status=open&priority=critical
```

### Create Issue
```http
POST /projects/:projectId/issues
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Bug title",
  "description": "Detailed description",
  "priority": "high"
}
```

**Priority Values:** critical, high, medium, low

### Get Issue Details
```http
GET /projects/:projectId/issues/:issueId
Authorization: Bearer <token>
```

### Update Issue
```http
PATCH /projects/:projectId/issues/:issueId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description",
  "status": "in_progress",
  "priority": "high",
  "assignee_id": "uuid"
}
```

**Status Values:** open, in_progress, closed

### Delete Issue
```http
DELETE /projects/:projectId/issues/:issueId
Authorization: Bearer <token>
```

---

## 4. Comment Endpoints

### Create Comment
```http
POST /projects/:projectId/issues/:issueId/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "This is a comment"
}
```

### Get Comments
```http
GET /projects/:projectId/issues/:issueId/comments
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "issue_id": "uuid",
    "author_id": "uuid",
    "text": "Comment text",
    "created_at": "2024-05-17T10:00:00Z",
    "name": "John Doe",
    "email": "john@example.com"
  }
]
```

### Update Comment
```http
PATCH /projects/:projectId/issues/:issueId/comments/:commentId
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Updated comment text"
}
```

### Delete Comment
```http
DELETE /projects/:projectId/issues/:issueId/comments/:commentId
Authorization: Bearer <token>
```

---

## 5. Test Case Endpoints

### List Test Cases
```http
GET /projects/:projectId/test-cases
Authorization: Bearer <token>
```

### Create Test Case
```http
POST /projects/:projectId/test-cases
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Test case title",
  "description": "Test description",
  "steps": [
    {"step": 1, "description": "First step"},
    {"step": 2, "description": "Second step"}
  ],
  "expected_result": "Expected outcome"
}
```

### Get Test Case Details
```http
GET /projects/:projectId/test-cases/:testCaseId
Authorization: Bearer <token>
```

### Update Test Case
```http
PATCH /projects/:projectId/test-cases/:testCaseId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description",
  "steps": [],
  "expected_result": "Updated result"
}
```

### Delete Test Case
```http
DELETE /projects/:projectId/test-cases/:testCaseId
Authorization: Bearer <token>
```

---

## 6. Analytics Endpoints

### Get Dashboard Data
```http
GET /projects/:projectId/analytics/dashboard
Authorization: Bearer <token>
```

**Response includes:**
- Project statistics (total issues, by status, by priority)
- Issues by status breakdown
- Issues by priority breakdown
- Test coverage data
- Recent issues

### Get Project Stats
```http
GET /projects/:projectId/analytics/stats
Authorization: Bearer <token>
```

### Get Issues by Status
```http
GET /projects/:projectId/analytics/issues/by-status
Authorization: Bearer <token>
```

### Get Issues by Priority
```http
GET /projects/:projectId/analytics/issues/by-priority
Authorization: Bearer <token>
```

### Get Test Coverage
```http
GET /projects/:projectId/analytics/coverage
Authorization: Bearer <token>
```

### Get Recent Issues
```http
GET /projects/:projectId/analytics/recent-issues?limit=10
Authorization: Bearer <token>
```

---

## 7. Health Check

```http
GET /health
```

**Response (200):**
```json
{
  "status": "OK",
  "timestamp": "2024-05-17T10:00:00Z"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Required field is missing"
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

### 403 Forbidden
```json
{
  "error": "Invalid token"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 409 Conflict
```json
{
  "error": "Resource already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production, implement:
- 100 requests per minute per IP
- 1000 requests per hour per user

---

## Pagination

Endpoints return data in this format. For pagination, implement:

```http
GET /projects/:projectId/issues?page=1&limit=20
```

---

## Filtering

### Issues Filtering
```
/projects/{id}/issues?status=open
/projects/{id}/issues?priority=critical
/projects/{id}/issues?assignee_id={userId}
/projects/{id}/issues?status=open&priority=critical
```

---

## Sorting

Not currently implemented. Future enhancements:

```
GET /projects/:projectId/issues?sort=created_at&order=desc
```

---

## Example Usage

### Complete Workflow Example

```bash
# 1. Signup
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@example.com",
    "password":"Pass123",
    "name":"John Doe"
  }'

# Response includes token
TOKEN="your_token_here"

# 2. Create Project
curl -X POST http://localhost:5000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"My Project",
    "description":"Test project"
  }'

# Response includes project id
PROJECT_ID="your_project_id"

# 3. Create Issue
curl -X POST http://localhost:5000/api/v1/projects/$PROJECT_ID/issues \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Login button broken",
    "description":"The login button doesn'"'"'t work on mobile",
    "priority":"high"
  }'

# Response includes issue id
ISSUE_ID="your_issue_id"

# 4. Add Comment
curl -X POST http://localhost:5000/api/v1/projects/$PROJECT_ID/issues/$ISSUE_ID/comments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text":"I can reproduce this issue"
  }'

# 5. Get Dashboard
curl -X GET http://localhost:5000/api/v1/projects/$PROJECT_ID/analytics/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

---

## SDK / Client Libraries

### JavaScript/Node.js
See `frontend/src/services/api.js` for Axios-based client.

### Usage Example
```javascript
import { projectService, issueService } from './services/api';

// Get projects
const projects = await projectService.getAll();

// Create issue
const issue = await issueService.create(projectId, 'Title', 'Description', 'high');

// Update issue
await issueService.update(projectId, issueId, { status: 'closed' });
```

---

## Webhook Events

Not currently implemented. Future enhancements:
- issue.created
- issue.updated
- issue.closed
- comment.added
- test_case.created

---

## Limitations

Current implementation:
- No pagination
- No advanced filtering
- No sorting
- No rate limiting
- No caching
- No webhook support
- No batch operations
- Single user per project (by default)

---

## Future Enhancements

- [ ] Pagination support
- [ ] Advanced filtering & search
- [ ] Sorting options
- [ ] Rate limiting
- [ ] Caching layer
- [ ] Webhook support
- [ ] Batch operations
- [ ] GraphQL endpoint
- [ ] API versioning strategy
- [ ] OAuth2 integrations

---

## Support

For API issues:
1. Check error messages carefully
2. Verify token is valid
3. Check resource exists
4. Review request format
5. Check backend logs

Happy building! 🚀
