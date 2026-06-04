# Bugme — Backend

Node.js + Express + PostgreSQL API server for the Bugme bug tracking platform.

---

## Stack

| | |
|---|---|
| Runtime | Node.js 18+ (ESM) |
| Framework | Express 4 |
| Database | PostgreSQL 14+ (raw SQL, `pg` driver) |
| Auth | JWT — dual token (access 15 min + refresh 7 days) |
| Cookies | cookie-parser (HttpOnly refresh token) |
| Real-time | Socket.io |
| Email | Nodemailer (SMTP / Brevo) |
| Password | bcryptjs |

---

## Getting Started

```bash
npm install
cp .env.example .env   # fill in your values
npm run dev            # nodemon — http://localhost:5001
npm start              # production
```

---

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=bugme_db

# Server
SERVER_PORT=5001
NODE_ENV=development        # set to 'production' to enable Secure cookie flag

# JWT — use two DIFFERENT strong random strings
JWT_SECRET=<access-token-signing-key>
JWT_REFRESH_SECRET=<refresh-token-signing-key>
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Frontend URL (used in invitation + password-reset emails)
APP_URL=http://localhost:3000

# CORS — comma-separated list of allowed origins
CORS_ORIGIN=http://localhost:3000

# Email (leave blank to log emails to console in development)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASS=your_app_password
SMTP_FROM=Bugme <noreply@example.com>
```

---

## Project Structure

```
src/
├── config/
│   └── database.js           # pg Pool, exported as `query()`
│
├── middleware/
│   ├── auth.js               # Token generation, refresh cookie helpers, verifyToken
│   └── errorHandler.js       # 404 + global error middleware
│
├── models/                   # One file per table — static methods, raw SQL
│   ├── Comment.js
│   ├── CustomField.js
│   ├── Issue.js
│   ├── KnowledgeBase.js
│   ├── Project.js
│   ├── Sprint.js
│   ├── Team.js
│   ├── TestCase.js
│   └── User.js
│
├── routes/
│   ├── analytics.js          # /stats, /issues/by-status, /issues/by-priority, /dashboard
│   ├── auth.js               # login, signup, refresh, logout, profile, password
│   ├── comments.js
│   ├── customFields.js
│   ├── invitations.js
│   ├── issues.js
│   ├── knowledgeBase.js
│   ├── projects.js
│   ├── sprints.js
│   ├── teams.js
│   └── testCases.js
│
├── services/
│   ├── analytics.js          # Query helpers for analytics aggregates
│   └── email.js              # Nodemailer transport wrapper
│
└── server.js                 # App setup, middleware, route mounts, Socket.io, DB init
```

---

## Auth Architecture

Two tokens, two security layers:

```
POST /auth/login  →  { accessToken }  +  Set-Cookie: bm_refresh (HttpOnly)
                          │                        │
                     15 min JWT               7 day JWT
                   sent in Authorization    unreadable by JS
                      Bearer header         SameSite=Strict
                                            Secure (prod)
```

Key exports from `src/middleware/auth.js`:

| Export | Purpose |
|---|---|
| `generateAccessToken(userId, email)` | 15-min JWT signed with `JWT_SECRET` |
| `generateRefreshToken(userId, email)` | 7-day JWT signed with `JWT_REFRESH_SECRET` |
| `setRefreshCookie(res, token)` | Writes `bm_refresh` HttpOnly cookie |
| `clearRefreshCookie(res)` | Expires the cookie immediately |
| `verifyToken` | Express middleware — validates access token from `Authorization` header |
| `verifyRefreshToken(token)` | Pure function — validates a refresh token (used in `/refresh` route) |
| `REFRESH_COOKIE` | Cookie name constant `'bm_refresh'` |

The refresh cookie is scoped to `path: '/api/v1/auth'` so it is only sent to auth endpoints.

### Refresh Token Rotation

Every call to `POST /auth/refresh` issues a new refresh token and overwrites the cookie. This limits the window in which a stolen refresh token is valid.

---

## API Endpoints

All routes are prefixed with `/api/v1`.  
Protected routes require `Authorization: Bearer <accessToken>`.

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | — | Register user, returns `accessToken`, sets refresh cookie |
| POST | `/auth/login` | — | Login, returns `accessToken`, sets refresh cookie |
| POST | `/auth/refresh` | cookie | Rotate refresh token, return new `accessToken` |
| POST | `/auth/logout` | — | Clear refresh cookie |
| GET | `/auth/profile` | Bearer | Get current user |
| PATCH | `/auth/profile` | Bearer | Update `name` / `avatar_url` |
| POST | `/auth/change-password` | Bearer | Change password |
| POST | `/auth/forgot-password` | — | Send reset email |
| POST | `/auth/reset-password` | — | Consume reset token, set new password |

### Projects

| Method | Path | Description |
|---|---|---|
| GET | `/projects` | All projects for the authenticated user |
| POST | `/projects` | Create project (`name`, `description`, `team_id`, `platform`) |
| GET | `/projects/:id` | Project detail |
| PATCH | `/projects/:id` | Update project |
| DELETE | `/projects/:id` | Delete project |
| POST | `/projects/:id/favorite` | Toggle favourite |

### Issues

Base: `/projects/:projectId/issues`

| Method | Path | Description |
|---|---|---|
| GET | `/` | List issues — query: `status`, `priority`, `severity`, `type`, `assignee_id` |
| POST | `/` | Create issue |
| GET | `/:issueId` | Get issue |
| PATCH | `/:issueId` | Update issue |
| DELETE | `/:issueId` | Delete issue |
| GET | `/:issueId/comments` | List comments |
| POST | `/:issueId/comments` | Add comment (`{ text }`) |
| DELETE | `/:issueId/comments/:commentId` | Delete comment |

### Test Cases

Base: `/projects/:projectId/test-cases`  
`GET /` · `POST /` · `GET /:id` · `PATCH /:id` · `DELETE /:id`

### Sprints

Base: `/projects/:projectId/sprints`  
`GET /` · `POST /` · `PATCH /:id` · `DELETE /:id`  
`POST /:id/issues` (`{ issue_id }`) · `DELETE /:id/issues/:issueId`

### Teams

| Method | Path | Description |
|---|---|---|
| GET | `/teams` | All teams the user belongs to |
| POST | `/teams` | Create team |
| DELETE | `/teams/:id` | Delete team |
| POST | `/teams/:teamId/members` | Invite member by `{ email }` |
| DELETE | `/teams/:teamId/members/:userId` | Remove / leave team |

### Analytics

Base: `/projects/:projectId/analytics`

| Path | Returns |
|---|---|
| `/stats` | Counts: total, open, in_progress, closed, critical, high, test_cases |
| `/issues/by-status` | `[{ status, count }]` |
| `/issues/by-priority` | `[{ priority, count }]` |
| `/dashboard` | Combined: stats + byStatus + byPriority + coverage + recent |

### Custom Fields

Base: `/projects/:projectId/custom-fields`  
`GET /` · `POST /` · `DELETE /:fieldId`

### Knowledge Base

Base: `/projects/:projectId/knowledge-base`  
`GET /` (query: `?category=&subcategory=`) · `POST /` · `PATCH /:docId` · `DELETE /:docId`

### Invitations

| Method | Path | Description |
|---|---|---|
| GET | `/invitations/:token` | Get invitation details |
| POST | `/invitations/:token/accept` | Accept invite (`{ name, password }`) |

### Health

`GET /api/v1/health` — `{ status: 'OK', timestamp }`

---

## Database

Tables are created automatically on first start via `Model.createTable()` calls in `server.js`. No migration tool is needed.

### Schema overview

| Table | Key columns |
|---|---|
| `users` | `id`, `email`, `password`, `name`, `avatar_url` |
| `projects` | `id`, `name`, `description`, `platform`, `owner_id`, `team_id` |
| `project_favorites` | `user_id`, `project_id` |
| `issues` | `id`, `project_id`, `title`, `status`, `priority`, `severity`, `type`, `tags`, `sprint_id`, `assignee_id`, `custom_fields` |
| `comments` | `id`, `issue_id`, `user_id`, `text` |
| `test_cases` | `id`, `project_id`, `title`, `steps` (JSONB), `status`, `priority` |
| `sprints` | `id`, `project_id`, `name`, `goal`, `status`, `start_date`, `end_date` |
| `teams` | `id`, `name`, `description`, `owner_id` |
| `team_members` | `team_id`, `user_id`, `role` |
| `knowledge_base` | `id`, `project_id`, `category`, `subcategory`, `title`, `url`, `content`, `doc_type` |
| `custom_fields` | `id`, `project_id`, `name`, `field_type`, `placeholder`, `mandatory`, `options` (JSONB) |
| `password_reset_tokens` | `id`, `user_id`, `token`, `expires_at`, `used` |

---

## Real-time (Socket.io)

The server broadcasts two events:

```js
socket.on('issue-update',  data => io.emit('issue-updated',  data));
socket.on('comment-added', data => io.emit('comment-added',  data));
```

Connect from the frontend with `withCredentials: true`.

---

## Seeding

```bash
npm run seed
```

Creates:
- User: `demo@bugme.com` / `Demo@123`
- Sample project, issues, test cases

---

## Error Responses

All errors follow:

```json
{ "error": "Human-readable message" }
```

| Code | Meaning |
|---|---|
| 400 | Missing / invalid input |
| 401 | No token, expired token, wrong password |
| 403 | Token invalid (signature mismatch) |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate email) |
| 500 | Unexpected server error |

---

## Security Checklist

- [x] Passwords hashed with bcrypt (10 rounds)
- [x] All SQL uses parameterized queries
- [x] JWT access token — 15-minute expiry
- [x] HttpOnly refresh cookie — unreadable by JS
- [x] `SameSite=Strict` on refresh cookie — CSRF protection
- [x] `Secure` flag enabled in `NODE_ENV=production`
- [x] Refresh token rotated on every `/auth/refresh` call
- [x] CORS locked to `CORS_ORIGIN` env var
- [x] Separate signing secrets for access and refresh tokens
