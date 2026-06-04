# Bugme — Bug Tracking & Test Management Platform

A full-stack bug tracking and test management platform built with React + Node.js + PostgreSQL. Covers the full QA workflow: issues, test cases, sprints, teams, knowledge base, and analytics.

---

## Tech Stack

### Frontend
| Concern | Choice |
|---|---|
| Framework | React 18 |
| Build | Vite |
| Routing | React Router v6 |
| Server state | TanStack Query v5 |
| HTTP | Axios (with auto-refresh interceptor) |
| Styling | Custom CSS (no framework) |
| Auth storage | In-memory access token + HttpOnly refresh cookie |

### Backend
| Concern | Choice |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express.js |
| Database | PostgreSQL (raw SQL, parameterized queries) |
| Auth | JWT dual-token (access 15 min / refresh 7 days) |
| Real-time | Socket.io |
| Email | Nodemailer |
| Cookies | cookie-parser |

---

## Features

### Authentication
- Signup / Login / Logout
- Forgot password & email-based reset
- Dual-token auth — short-lived access token in JS memory, long-lived refresh token in `HttpOnly; SameSite=Strict` cookie
- Silent session restore on page reload via `/auth/refresh`
- Auto-token refresh on 401 (transparent to the user)

### Projects
- Create, edit, delete projects
- Platform tagging (Web, Android, iOS, Desktop, API, etc.)
- Team assignment
- Favourite/star projects
- Per-project statistics strip

### Issues / Bugs
- Full CRUD with title, description, status, priority, severity, type, tags, assignee, sprint
- Slide-in drawer for quick editing without leaving the list
- Inline status transitions
- Comments thread per issue
- Custom fields (text, number, date, dropdown, URL, etc.) per project
- Filter by status / priority / severity / type / search

### Test Cases
- Create with title, description, steps (ordered list), expected result, priority
- Status tracking: Untested, Pass, Fail, Blocked
- Per-project list view

### Sprints
- Create sprints with name, goal, start/end dates
- Sprint status: Planned → Active → Completed
- Progress bar (closed issues / total)

### Teams
- Create teams, invite members by email (invitation link flow)
- Owner / member roles
- Remove members or leave team
- Team detail view with member search

### Knowledge Base
- Per-project KB with three source categories: Requirements, Project Management, Designs
- Add links (URL + title) or documents (rich text)
- Integration placeholders for Jira, Asana, Zoho, GitHub, Figma

### Analytics & Reports
- Dashboard: total, open, in-progress, closed, critical, test-case counts
- Issues by status (bar chart)
- Issues by priority (bar chart)
- Recently reported issues table

### User Profile
- Avatar picker
- First/last name, language preference
- Change password (current + new)
- Subscription page placeholder

### UX
- Light / dark theme toggle (persisted in cookie)
- Responsive layout with mobile sidebar + hamburger
- TanStack Query caching (30 s stale time) — navigation is instant after first load
- Optimistic updates for favourite toggle
- `setQueryData` for instant UI updates on delete/status change without a round-trip

---

## Project Structure

```
bugme/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # PostgreSQL pool
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT helpers, refresh cookie utils, verifyToken
│   │   │   └── errorHandler.js
│   │   ├── models/                  # One file per table (raw SQL)
│   │   │   ├── Comment.js
│   │   │   ├── CustomField.js
│   │   │   ├── Issue.js
│   │   │   ├── KnowledgeBase.js
│   │   │   ├── Project.js
│   │   │   ├── Sprint.js
│   │   │   ├── Team.js
│   │   │   ├── TestCase.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── analytics.js
│   │   │   ├── auth.js              # login, signup, refresh, logout, profile, reset
│   │   │   ├── comments.js
│   │   │   ├── customFields.js
│   │   │   ├── invitations.js
│   │   │   ├── issues.js
│   │   │   ├── knowledgeBase.js
│   │   │   ├── projects.js
│   │   │   ├── sprints.js
│   │   │   ├── teams.js
│   │   │   └── testCases.js
│   │   ├── services/
│   │   │   ├── analytics.js
│   │   │   └── email.js             # Nodemailer (Brevo/SMTP)
│   │   └── server.js
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                  # Avatar, Badge, Button, FormField, Modal
│   │   │   ├── Dashboard.jsx        # Analytics charts component
│   │   │   ├── IssueDrawer.jsx      # Slide-in issue editor
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── WhatNew.jsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx      # In-memory token, refresh on mount
│   │   │   └── ThemeContext.jsx
│   │   ├── lib/
│   │   │   ├── cookieStorage.js     # Centralized secure cookie utility
│   │   │   ├── queryKeys.js         # TanStack Query cache key factories
│   │   │   └── storageKeys.js       # Storage key name constants (enum)
│   │   ├── pages/
│   │   │   ├── AcceptInvite.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── KnowledgeBase.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── ProjectDetail.jsx    # Issues / Test Cases / Sprints / Reports tabs
│   │   │   ├── Projects.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Teams.jsx
│   │   │   └── UserProfile.jsx
│   │   ├── services/
│   │   │   └── api.js               # Axios instance, in-memory token, 401 interceptor
│   │   ├── utils/
│   │   │   ├── constants.jsx        # Status/priority/type configs, platform list
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js               # Dev proxy: /api → localhost:5001
│   └── package.json
│
└── README.md
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1 — Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in DB credentials, JWT secrets, SMTP config
npm run dev
# → http://localhost:5001
```

Required `.env` values:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=bugme_db

SERVER_PORT=5001
NODE_ENV=development

JWT_SECRET=<strong-random-string>
JWT_REFRESH_SECRET=<different-strong-random-string>
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

APP_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASS=your_app_password
SMTP_FROM=Bugme <noreply@example.com>
```

### 2 — Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

The Vite dev server proxies `/api/*` to `http://localhost:5001`, so cookies work same-origin in development without any extra configuration.

### 3 — Seed demo data (optional)

```bash
cd backend
npm run seed
```

Demo credentials:
```
Email:    demo@bugme.com
Password: Demo@123
```

---

## API Reference

### Auth (`/api/v1/auth`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/signup` | — | Register, returns `accessToken` + sets refresh cookie |
| POST | `/login` | — | Login, returns `accessToken` + sets refresh cookie |
| POST | `/refresh` | cookie | Issue new access token, rotate refresh cookie |
| POST | `/logout` | — | Clear refresh cookie |
| GET | `/profile` | Bearer | Get current user |
| PATCH | `/profile` | Bearer | Update name / avatar |
| POST | `/change-password` | Bearer | Change password |
| POST | `/forgot-password` | — | Send reset email |
| POST | `/reset-password` | — | Consume reset token |

### Projects (`/api/v1/projects`)

| Method | Path | Description |
|---|---|---|
| GET | `/` | List all projects (with issue counts) |
| POST | `/` | Create project |
| GET | `/:id` | Get project detail |
| PATCH | `/:id` | Update project |
| DELETE | `/:id` | Delete project |
| POST | `/:id/favorite` | Toggle favourite |

### Issues (`/api/v1/projects/:projectId/issues`)

| Method | Path | Description |
|---|---|---|
| GET | `/` | List issues (filterable by `status`, `priority`, `severity`, `type`) |
| POST | `/` | Create issue |
| GET | `/:issueId` | Get issue |
| PATCH | `/:issueId` | Update issue |
| DELETE | `/:issueId` | Delete issue |
| GET | `/:issueId/comments` | List comments |
| POST | `/:issueId/comments` | Add comment |
| DELETE | `/:issueId/comments/:commentId` | Delete comment |

### Test Cases (`/api/v1/projects/:projectId/test-cases`)

`GET /` · `POST /` · `GET /:id` · `PATCH /:id` · `DELETE /:id`

### Sprints (`/api/v1/projects/:projectId/sprints`)

`GET /` · `POST /` · `PATCH /:id` · `DELETE /:id`  
`POST /:id/issues` · `DELETE /:id/issues/:issueId`

### Teams (`/api/v1/teams`)

`GET /` · `POST /` · `DELETE /:id`  
`POST /:teamId/members` (invite by email) · `DELETE /:teamId/members/:userId`

### Analytics (`/api/v1/projects/:projectId/analytics`)

`GET /stats` · `GET /issues/by-status` · `GET /issues/by-priority` · `GET /dashboard`

### Custom Fields (`/api/v1/projects/:projectId/custom-fields`)

`GET /` · `POST /` · `DELETE /:fieldId`

### Knowledge Base (`/api/v1/projects/:projectId/knowledge-base`)

`GET /` (query: `?category=&subcategory=`) · `POST /` · `PATCH /:docId` · `DELETE /:docId`

### Invitations (`/api/v1/invitations`)

`GET /:token` · `POST /:token/accept`

---

## Security Model

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                            │
│                                                         │
│  JS memory ──── accessToken (15 min)                    │
│                   └─ Authorization: Bearer header        │
│                                                         │
│  HttpOnly cookie ── bm_refresh (7 days)                 │
│                   └─ Unreadable by JS / XSS             │
│                   └─ SameSite=Strict / Secure (prod)    │
└─────────────────────────────────────────────────────────┘
          │ 401 on expired access token
          ▼
   POST /auth/refresh  ←── server reads HttpOnly cookie
          │ returns new accessToken + rotates cookie
          ▼
   original request retried transparently
```

- Passwords hashed with **bcrypt**
- All SQL uses **parameterized queries** (no injection risk)
- CORS locked to `CORS_ORIGIN` env var with `credentials: true`
- `SameSite=Strict` prevents CSRF on the refresh cookie
- `Secure` flag enforced in `NODE_ENV=production`

---

## Environment Variables

### Backend (`.env`)

| Variable | Description | Default |
|---|---|---|
| `DB_*` | PostgreSQL connection | — |
| `SERVER_PORT` | API listen port | `5001` |
| `NODE_ENV` | `development` or `production` | `development` |
| `JWT_SECRET` | Access token signing key | — |
| `JWT_REFRESH_SECRET` | Refresh token signing key | — |
| `JWT_ACCESS_EXPIRE` | Access token lifetime | `15m` |
| `JWT_REFRESH_EXPIRE` | Refresh token lifetime | `7d` |
| `APP_URL` | Frontend URL (reset links) | `http://localhost:3000` |
| `CORS_ORIGIN` | Allowed origins (comma-separated) | — |
| `SMTP_*` | Email sending config | — |

### Frontend (`.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | API base path | `/api/v1` (proxied) |

---

## Development Notes

### TanStack Query caching
- `staleTime: 30s` — navigating back to a page is instant
- Mutations use `invalidateQueries` or `setQueryData` for instant UI updates
- Optimistic updates on favourite toggle with rollback on error
- 401 interceptor in `api.js` transparently refreshes the access token and retries

### Cookie utility (`src/lib/cookieStorage.js`)
- Centralized — never write `document.cookie` directly
- Two presets: `CookieOptions.auth` (Strict, Secure in prod, 7d) and `CookieOptions.pref` (Lax, 1y)
- Currently used only for theme preference; auth tokens are managed by the server

### Storage key constants (`src/lib/storageKeys.js`)
- `StorageKeys.THEME` — the only client-side persisted key
- Auth tokens intentionally absent — access token is in JS memory, refresh token is HttpOnly

### Query key constants (`src/lib/queryKeys.js`)
- All TanStack Query cache keys in one place — import `queryKeys` everywhere

---

## Building for Production

```bash
# Frontend
cd frontend
npm run build
# Output: frontend/dist/

# Backend
cd backend
NODE_ENV=production node src/server.js
# Or with PM2:
pm2 start src/server.js --name bugme-api
```

Set `VITE_API_URL` to your production API URL before building the frontend if the API is on a different domain.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Port already in use | `lsof -i :5001` then `kill -9 <PID>` |
| Database won't connect | Verify PostgreSQL is running; check `DB_*` in `.env` |
| Refresh cookie not sent | Ensure `withCredentials: true` is set and CORS `credentials: true` matches origin |
| Emails not sending | Check SMTP credentials; in dev, emails log to console if SMTP is blank |
| `401` on every request | `JWT_SECRET` mismatch between token generation and verification |

---

## License

MIT
