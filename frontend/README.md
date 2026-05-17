# Bugasura MVP - Frontend

A React-based frontend for the Bugasura bug tracking and test management platform.

## Features

- ✅ User Authentication (Login/Signup)
- ✅ Project Management
- ✅ Issue/Bug Tracking
- ✅ Test Case Management
- ✅ Real-time State Management
- ✅ Responsive Design
- ✅ JWT Token-based Auth

## Prerequisites

- Node.js (v14+)
- npm or yarn

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Projects.jsx
│   │   └── ProjectDetail.jsx
│   ├── services/
│   │   └── api.js              # API communication
│   ├── contexts/
│   │   └── AuthContext.jsx      # Auth state management
│   ├── styles/
│   │   ├── index.css
│   │   ├── navbar.css
│   │   ├── auth.css
│   │   ├── projects.css
│   │   ├── project-detail.css
│   │   └── home.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
└── package.json
```

## Key Pages

### Home (/)
Landing page with feature overview and call-to-action buttons.

### Login (/login)
User login with JWT token management.
- Demo email: `demo@bugasura.com`
- Demo password: `Demo@123`

### Signup (/signup)
New user registration.

### Projects (/projects)
Dashboard showing all user projects. Users can:
- Create new projects
- View project details
- Delete projects

### Project Detail (/projects/:projectId)
Detailed view of a project with two tabs:
- **Issues**: Create, view, and manage bugs
  - Set priority (Low, Medium, High, Critical)
  - Track status (Open, In Progress, Closed)
- **Test Cases**: Create and manage test cases
  - Add test descriptions
  - Set expected results

## API Integration

The frontend communicates with the backend at `http://localhost:5000/api/v1`.

Key API services:
- **Auth**: Login, Signup
- **Projects**: CRUD operations
- **Issues**: Create, read, update, delete bugs
- **Test Cases**: Create, read, update, delete test cases

See `src/services/api.js` for all API methods.

## Authentication Flow

1. User signs up/logs in
2. Backend returns JWT token
3. Token is stored in localStorage
4. Token is included in all subsequent API requests
5. Protected routes check for valid authentication

## Styling

- **Global styles**: `src/styles/index.css`
- **Component-specific styles**: Individual CSS files
- **CSS Variables**: Theme colors and spacing defined in `:root`

### Color Scheme
- Primary: `#5b5bff` (Purple)
- Secondary: `#ff6b6b` (Red)
- Success: `#51cf66` (Green)
- Warning: `#ffd43b` (Yellow)

## Development

### Start Dev Server
```bash
npm run dev
```

### Proxy Configuration
The app proxies API calls to `http://localhost:5000` during development. Configured in `vite.config.js`.

### Environment Variables
Create `.env.local` if needed:
```
VITE_API_URL=http://localhost:5000
```

## Common Tasks

### Add a New Page
1. Create component in `src/pages/`
2. Add route to `App.jsx`
3. Create corresponding styles in `src/styles/`

### Add a New API Service
Update `src/services/api.js` with new service methods.

### Styling a New Component
Follow the existing CSS patterns and use CSS variables for colors.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Tips

- Use React.memo for expensive components
- Lazy load routes with React.lazy
- Optimize images and assets
- Minimize bundle size

## Troubleshooting

### Port 3000 already in use
```bash
npm run dev -- --port 3001
```

### API Connection Issues
- Ensure backend is running on port 5000
- Check CORS settings in backend
- Verify network in browser DevTools

### Blank Page After Login
- Check browser console for errors
- Verify token is stored in localStorage
- Check if ProtectedRoute is configured correctly

## Next Steps

- Add file uploads for attachments
- Implement real-time updates with Socket.io
- Add advanced search and filtering
- Implement notification system
- Add analytics dashboard
- Create mobile app

## License

MIT

## Support

For issues or questions, refer to the main repository.
