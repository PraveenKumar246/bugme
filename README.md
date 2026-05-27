# Bugme MVP - Complete Full-Stack Application

A complete MVP of a bug tracking and test management platform built with React (Frontend) and Node.js (Backend).

## 🎯 Features

### Core Features
- ✅ User Authentication (Signup/Login with JWT)
- ✅ Project Management (Create, Read, Update, Delete)
- ✅ Issue/Bug Tracking (Create, track, prioritize)
- ✅ Test Case Management (Create and manage test cases)
- ✅ Real-time State Management
- ✅ Responsive Design
- ✅ Protected Routes
- ✅ Error Handling

### Upcoming Features
- AI-powered duplicate detection
- Real-time collaboration with Socket.io
- File uploads and attachments
- Advanced search and filtering
- Analytics and reporting
- Browser extension
- Mobile app
- Integrations (Jira, Slack, GitHub)

## 📁 Project Structure

```
bugme-mvp/
├── backend/                 # Node.js Express Server
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth & error handling
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Main server file
│   ├── scripts/
│   │   └── seed.js         # Database seeding
│   ├── .env.example        # Environment template
│   ├── package.json
│   └── README.md
│
├── frontend/                # React Application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── contexts/       # React contexts
│   │   ├── styles/         # CSS files
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── README.md
│
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Start the server
npm run dev
```

Server will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Application will be available at `http://localhost:3000`

### 3. Database Seeding (Optional)

To populate with demo data:
```bash
cd backend
npm run seed
```

**Demo Credentials:**
- Email: `demo@bugme.com`
- Password: `Demo@123`

## 🔑 Demo Account

After seeding, you can login with:
```
Email: demo@bugme.com
Password: Demo@123
```

This creates:
- Sample project "E-commerce App"
- Sample issues/bugs
- Sample test cases

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/v1/auth/signup       # Register new user
POST /api/v1/auth/login        # Login user
```

### Project Endpoints
```
GET    /api/v1/projects        # Get all projects
POST   /api/v1/projects        # Create project
GET    /api/v1/projects/:id    # Get project details
PATCH  /api/v1/projects/:id    # Update project
DELETE /api/v1/projects/:id    # Delete project
```

### Issue Endpoints
```
GET    /api/v1/projects/:projectId/issues
POST   /api/v1/projects/:projectId/issues
GET    /api/v1/projects/:projectId/issues/:issueId
PATCH  /api/v1/projects/:projectId/issues/:issueId
DELETE /api/v1/projects/:projectId/issues/:issueId
```

### Test Case Endpoints
```
GET    /api/v1/projects/:projectId/test-cases
POST   /api/v1/projects/:projectId/test-cases
GET    /api/v1/projects/:projectId/test-cases/:testCaseId
PATCH  /api/v1/projects/:projectId/test-cases/:testCaseId
DELETE /api/v1/projects/:projectId/test-cases/:testCaseId
```

Full API documentation available in `backend/README.md`

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Real-time**: Socket.io
- **ORM**: Raw SQL queries (prepared statements)

### Frontend
- **Library**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context + Hooks
- **Styling**: CSS (custom CSS)

## 📋 Database Schema

### Users Table
```sql
id (UUID)
email (VARCHAR - unique)
password (VARCHAR - hashed)
name (VARCHAR)
created_at (TIMESTAMP)
```

### Projects Table
```sql
id (UUID)
name (VARCHAR)
description (TEXT)
owner_id (FK → users)
created_at (TIMESTAMP)
```

### Issues Table
```sql
id (UUID)
project_id (FK → projects)
title (VARCHAR)
description (TEXT)
status (VARCHAR: open, in_progress, closed)
priority (VARCHAR: critical, high, medium, low)
assignee_id (FK → users)
created_by (FK → users)
created_at (TIMESTAMP)
```

### Test Cases Table
```sql
id (UUID)
project_id (FK → projects)
title (VARCHAR)
description (TEXT)
steps (JSONB)
expected_result (TEXT)
created_by (FK → users)
created_at (TIMESTAMP)
```

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Protected routes
- ✅ SQL injection protection (parameterized queries)
- ✅ CORS enabled
- ✅ Environment variable management

## 📱 Responsive Design

The frontend is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm test
```

### Backend Testing
```bash
cd backend
npm test
```

## 📦 Building for Production

### Frontend Build
```bash
cd frontend
npm run build
# Output in dist/ directory
```

### Backend Deployment
- Ensure environment variables are set
- Use a process manager like PM2
- Deploy to services like Heroku, AWS, DigitalOcean

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check what's using port 3000/5000
lsof -i :3000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Database Connection Issues
- Verify PostgreSQL is running
- Check connection string in `.env`
- Ensure database exists

### API Connection Errors
- Verify backend is running
- Check CORS configuration
- Review browser console errors

## 📝 Development Workflow

1. Create feature branch
2. Make changes to backend/frontend
3. Test functionality
4. Commit changes
5. Push to repository

## 🚢 Deployment Checklist

- [ ] Update environment variables
- [ ] Run database migrations
- [ ] Build frontend
- [ ] Test production build
- [ ] Setup CI/CD pipeline
- [ ] Configure monitoring
- [ ] Setup logging
- [ ] Test SSL/TLS

## 📈 Performance Optimization

### Frontend
- Code splitting with React.lazy
- Image optimization
- CSS minification
- Bundle analysis

### Backend
- Database indexing
- Connection pooling
- Query optimization
- Caching strategy

## 🔄 Real-time Updates

Socket.io is integrated for real-time features:
```javascript
socket.on('issue-update', (data) => {
  // Handle real-time updates
});
```

## 📚 Learning Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [JWT Introduction](https://jwt.io/introduction)
- [REST API Best Practices](https://restfulapi.net)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - feel free to use this project for learning or as a starting point for your own projects.

## 💡 Next Steps to Extend

1. **Authentication Enhancement**
   - OAuth2 integration (Google, GitHub)
   - Multi-factor authentication
   - SSO for enterprise

2. **Advanced Features**
   - AI-powered duplicate detection
   - Automated test suggestions
   - Analytics dashboard
   - Report generation

3. **Integrations**
   - Jira sync
   - Slack notifications
   - GitHub integration
   - Email notifications

4. **Performance**
   - Implement caching
   - Database query optimization
   - CDN for static assets
   - API rate limiting

5. **Mobile & Desktop**
   - React Native mobile app
   - Electron desktop app
   - Browser extension

## 📞 Support

For issues, questions, or suggestions:
1. Check existing issues
2. Review documentation
3. Create new issue with details
4. Contact development team

## 🎉 Congratulations!

You now have a fully functional bug tracking and test management platform. Customize it, extend it, and build something amazing!

---

**Happy Coding! 🚀**
