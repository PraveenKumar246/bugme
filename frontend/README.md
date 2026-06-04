# Bugme — Frontend

React 18 + Vite frontend for the Bugme bug tracking platform.

---

## Stack

| | |
|---|---|
| Framework | React 18 |
| Build tool | Vite 5 |
| Routing | React Router v6 |
| Server state | TanStack Query v5 |
| HTTP | Axios |
| Styling | Custom CSS (CSS variables, no framework) |

---

## Getting Started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build → dist/
npm run preview    # preview the production build locally
```

The dev server proxies `/api/*` to `http://localhost:5001` (see `vite.config.js`), so the HttpOnly auth cookie works same-origin without any extra configuration.

---

## Environment

```env
# .env
VITE_API_URL=/api/v1      # default — uses the Vite proxy
# For production with a separate domain:
# VITE_API_URL=https://api.yourapp.com/api/v1
```

---

## Project Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── Avatar.jsx        # Name-initials avatar with hue-based colour
│   │   ├── Badge.jsx         # Status / priority colour badges
│   │   ├── Button.jsx
│   │   ├── FormField.jsx
│   │   └── Modal.jsx
│   ├── Dashboard.jsx         # Analytics chart component (used in Reports tab)
│   ├── IssueDrawer.jsx       # Slide-in panel for editing a single issue
│   ├── ProtectedRoute.jsx    # Redirects to /login if not authenticated
│   ├── Sidebar.jsx           # Main nav sidebar with theme toggle
│   └── WhatNew.jsx           # Changelog modal
│
├── contexts/
│   ├── AuthContext.jsx       # In-memory access token + silent refresh on mount
│   └── ThemeContext.jsx      # Light / dark theme (persisted in cookie)
│
├── hooks/
│   └── useAsync.js           # Legacy helper (kept for reference, not used)
│
├── lib/
│   ├── cookieStorage.js      # Centralized cookie read/write/remove utility
│   ├── queryKeys.js          # TanStack Query cache key factories
│   └── storageKeys.js        # Frozen enum of storage key name strings
│
├── pages/
│   ├── AcceptInvite.jsx      # Public — team invitation accept flow
│   ├── ForgotPassword.jsx
│   ├── Home.jsx              # Landing page
│   ├── KnowledgeBase.jsx     # Per-project knowledge base
│   ├── Login.jsx
│   ├── ProjectDetail.jsx     # Issues / Test Cases / Sprints / Reports tabs
│   ├── Projects.jsx          # Projects grid with favourites
│   ├── ResetPassword.jsx
│   ├── Signup.jsx
│   ├── Teams.jsx             # Team management + member list
│   └── UserProfile.jsx       # Profile edit + password change + subscription
│
├── services/
│   └── api.js                # Axios instance, in-memory token, 401 interceptor
│
├── styles/                   # One CSS file per page/component
│
├── utils/
│   ├── constants.jsx         # Status / priority / type / severity / platform configs
│   └── helpers.js            # formatDate, formatTime, getInitials, avatarHue …
│
├── App.jsx                   # Route tree + QueryClientProvider
└── main.jsx                  # ReactDOM.createRoot entry point
```

---

## Auth Flow

```
Page load
  └─ AuthContext.useEffect
       └─ POST /api/v1/auth/refresh  (HttpOnly cookie sent automatically)
            ├─ 200 → setAccessToken(token) in api.js module var + setUser()
            └─ 401 → stay logged out, show /login

Login / Signup
  └─ authService.login() → { accessToken, user }
       └─ AuthContext.login(user, accessToken)
            └─ setAccessToken() in api.js + setUser() in state

Every API request
  └─ request interceptor → Authorization: Bearer <_accessToken>

401 response
  └─ response interceptor
       └─ POST /auth/refresh (separate axios instance, no interceptors)
            ├─ 200 → update _accessToken, retry original request
            └─ fail → dispatch 'auth:logout' event → AuthContext clears state

Logout
  └─ authService.logout() → server clears HttpOnly cookie
  └─ clearAccessToken() + setUser(null)
```

---

## TanStack Query Usage

All server state goes through TanStack Query. Pattern used across the app:

```jsx
// Reads
const { data: projects = [], isLoading } = useQuery({
  queryKey: queryKeys.projects(),
  queryFn: () => projectService.getAll().then(r => r.data),
});

// Writes
const deleteMutation = useMutation({
  mutationFn: (id) => projectService.delete(id),
  onSuccess: (_, id) => {
    // instant UI — no extra round-trip
    queryClient.setQueryData(queryKeys.projects(), old =>
      old?.filter(p => p.id !== id) ?? []
    );
  },
});
```

- `staleTime: 30 000 ms` — navigating back to a page uses cache
- Optimistic updates on favourite toggle (rolls back on error)
- `setQueryData` for deletes / status changes — no visible flicker
- `invalidateQueries` for creates — fresh list after adding

---

## Cookie Storage

`src/lib/cookieStorage.js` is the only place that touches `document.cookie`.

```js
import { cookieStorage, CookieOptions } from '../lib/cookieStorage';
import { StorageKeys }                  from '../lib/storageKeys';

cookieStorage.set(StorageKeys.THEME, 'dark', CookieOptions.pref);
cookieStorage.get(StorageKeys.THEME);   // → 'dark'
cookieStorage.remove(StorageKeys.THEME);
```

**Presets:**

| Preset | SameSite | Secure | Max-Age |
|---|---|---|---|
| `CookieOptions.auth` | Strict | prod only | 7 days |
| `CookieOptions.pref` | Lax | never | 1 year |

Auth tokens are **not** stored via `cookieStorage` — the access token is a module variable in `api.js` and the refresh token is an `HttpOnly` cookie controlled entirely by the server.

---

## Adding a New Page

1. Create `src/pages/MyPage.jsx`
2. Add a route in `App.jsx` (wrap with `<ProtectedRoute>` if auth is required)
3. Add `src/styles/my-page.css` and import it in the component
4. If the page fetches data, add a key to `src/lib/queryKeys.js`

## Adding a New API Service

Add methods to the relevant service object in `src/services/api.js`:

```js
export const myService = {
  getAll:  ()       => api.get('/my-resource'),
  create:  (data)   => api.post('/my-resource', data),
  delete:  (id)     => api.delete(`/my-resource/${id}`),
};
```

---

## Routes

| Path | Component | Auth |
|---|---|---|
| `/` | Home | public |
| `/login` | Login | public |
| `/signup` | Signup | public |
| `/forgot-password` | ForgotPassword | public |
| `/reset-password` | ResetPassword | public |
| `/invite/:token` | AcceptInvite | public |
| `/apps` | Projects | protected |
| `/apps/:projectId` | ProjectDetail | protected |
| `/apps/:projectId/knowledge-base` | KnowledgeBase | protected |
| `/teams` | Teams | protected |
| `/account/profile` | UserProfile | protected |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Blank page after login | Open DevTools → Network; check `/auth/refresh` returns 200 |
| API calls return 401 immediately | Backend may be down or `JWT_SECRET` mismatched |
| Cookie not sent | Vite proxy must be running; don't call `localhost:5001` directly |
| Theme not persisting | Check `bm_theme` cookie in DevTools → Application → Cookies |
