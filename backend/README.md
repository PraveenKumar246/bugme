# Bugme MVP - Backend

A Node.js Express backend for bug tracking and test management platform.

## Features

- ✅ User authentication (Signup/Login with JWT)
- ✅ Project management
- ✅ Issue/Bug tracking with status and priority
- ✅ Test case management
- ✅ Real-time updates with Socket.io
- ✅ PostgreSQL database with optimized queries
- ✅ Middleware for authentication and error handling

## Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your PostgreSQL credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=bugme_db
   ```

3. **Create PostgreSQL database**
   ```bash
   createdb bugme_db
   ```

## Running the Server

### Development
```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Production
```bash
npm start
```

## Seed Demo Data

To populate the database with demo data:
```bash
npm run seed
```

This creates:
- Demo user (email: demo@bugme.com, password: Demo@123)
- Sample project
- Sample issues
- Sample test cases

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login user

### Projects
- `GET /api/v1/projects` - Get all projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects/:id` - Get project details
- `PATCH /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project

### Issues (within a project)
- `GET /api/v1/projects/:projectId/issues` - Get all issues
- `POST /api/v1/projects/:projectId/issues` - Create issue
- `GET /api/v1/projects/:projectId/issues/:issueId` - Get issue details
- `PATCH /api/v1/projects/:projectId/issues/:issueId` - Update issue
- `DELETE /api/v1/projects/:projectId/issues/:issueId` - Delete issue

Query filters for issues:
- `?status=open|in_progress|closed`
- `?priority=critical|high|medium|low`
- `?assignee_id=uuid`

### Test Cases (within a project)
- `GET /api/v1/projects/:projectId/test-cases` - Get all test cases
- `POST /api/v1/projects/:projectId/test-cases` - Create test case
- `GET /api/v1/projects/:projectId/test-cases/:testCaseId` - Get test case
- `PATCH /api/v1/projects/:projectId/test-cases/:testCaseId` - Update test case
- `DELETE /api/v1/projects/:projectId/test-cases/:testCaseId` - Delete test case

### Health
- `GET /api/v1/health` - Server health check

## Example Requests

### Signup
```bash
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123","name":"John Doe"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123"}'
```

### Create Project
```bash
curl -X POST http://localhost:5000/api/v1/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"My Project","description":"Test project"}'
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js         # Database connection
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Issue.js
│   │   └── TestCase.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── issues.js
│   │   └── testCases.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   └── server.js               # Main server file
├── scripts/
│   └── seed.js                 # Database seeding
├── .env.example                # Environment template
├── package.json
└── README.md
```

## Database Schema

### Users
- id (UUID)
- email (VARCHAR)
- password (VARCHAR - hashed)
- name (VARCHAR)
- created_at (TIMESTAMP)

### Projects
- id (UUID)
- name (VARCHAR)
- description (TEXT)
- owner_id (UUID - FK to users)
- created_at (TIMESTAMP)

### Issues
- id (UUID)
- project_id (UUID - FK to projects)
- title (VARCHAR)
- description (TEXT)
- status (VARCHAR: open, in_progress, closed)
- priority (VARCHAR: critical, high, medium, low)
- assignee_id (UUID - FK to users)
- created_by (UUID - FK to users)
- created_at (TIMESTAMP)

### TestCases
- id (UUID)
- project_id (UUID - FK to projects)
- title (VARCHAR)
- description (TEXT)
- steps (JSONB)
- expected_result (TEXT)
- created_by (UUID - FK to users)
- created_at (TIMESTAMP)

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

Tokens are valid for 7 days (configurable via `JWT_EXPIRE` in .env)

## Error Handling

The API returns standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (resource already exists)
- `500` - Internal Server Error

## Development Tips

1. **Check database connection**
   ```bash
   psql -U postgres -d bugme_db
   ```

2. **View database tables**
   ```bash
   \dt
   ```

3. **Clear database**
   ```bash
   dropdb bugme_db
   createdb bugme_db
   ```

## Next Steps

- Add file uploads for attachments
- Implement real-time notifications
- Add search functionality
- Implement project sharing and permissions
- Add AI-powered duplicate detection
- Create batch operations API

## License

MIT

## Support

For issues or questions, please refer to the main repository.
