# Bugasura MVP - Quick Start Guide

## 📦 What's Included

This ZIP contains a complete, production-ready MVP with:
- ✅ Full-stack application (Frontend + Backend)
- ✅ PostgreSQL database setup
- ✅ User authentication
- ✅ Project management
- ✅ Bug tracking
- ✅ Test case management
- ✅ Responsive UI
- ✅ Complete documentation

## ⚡ 5-Minute Setup

### Step 1: Extract the ZIP
```bash
unzip bugasura-mvp.zip
cd bugasura-mvp
```

### Step 2: Install & Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your PostgreSQL credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_NAME=bugasura_db

# Create PostgreSQL database (if you haven't already)
createdb bugasura_db

# Start backend server (in terminal 1)
npm run dev
```

Backend will run on: `http://localhost:5000`

### Step 3: Seed Demo Data (Optional)

```bash
# In backend directory
npm run seed
```

**Demo Credentials:**
- Email: `demo@bugasura.com`
- Password: `Demo@123`

### Step 4: Install & Setup Frontend

```bash
# In a new terminal, go to frontend directory
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

Frontend will run on: `http://localhost:3000`

### Step 5: Access the Application

Open your browser and visit: `http://localhost:3000`

## 🎯 What You Can Do

1. **Sign Up** - Create a new account
2. **Create Projects** - Add new projects for your team
3. **Track Bugs** - Create and manage issues
4. **Test Cases** - Create and organize test cases
5. **Manage Status** - Update bug status and priority
6. **Assign Issues** - Assign bugs to team members

## 📚 File Structure Overview

```
bugasura-mvp/
├── backend/
│   ├── src/
│   │   ├── models/       → Database models (User, Project, Issue, TestCase)
│   │   ├── routes/       → API endpoints
│   │   ├── middleware/   → Auth, error handling
│   │   └── server.js     → Main server file
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/        → Page components
│   │   ├── components/   → Reusable components
│   │   ├── services/     → API client
│   │   ├── contexts/     → State management
│   │   └── styles/       → CSS styles
│   └── package.json
│
└── README.md             → Full documentation
```

## 🔧 Important Configuration

### Backend Environment (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=bugasura_db
SERVER_PORT=5000
JWT_SECRET=your_secret_key_change_in_production
```

### Frontend API Configuration
Frontend automatically connects to backend at `http://localhost:5000`
(Edit `vite.config.js` if you need to change this)

## 🚀 Next Steps

### Immediate (First Day)
- [ ] Extract and setup backend
- [ ] Create PostgreSQL database
- [ ] Setup frontend
- [ ] Test login with demo account
- [ ] Create a test project

### Short Term (First Week)
- [ ] Add real team members
- [ ] Create actual projects
- [ ] Test issue tracking
- [ ] Create test cases
- [ ] Test mobile responsiveness

### Medium Term (2-4 Weeks)
- [ ] Add file attachments feature
- [ ] Implement real-time updates
- [ ] Add advanced filtering
- [ ] Create analytics dashboard
- [ ] Setup deployment

### Long Term (1-3 Months)
- [ ] Deploy to production
- [ ] Add integrations (Jira, Slack)
- [ ] Build mobile app
- [ ] Implement AI features
- [ ] Scale infrastructure

## 🐛 Common Issues & Solutions

### Port Already in Use
```bash
# Find process using port
lsof -i :5000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### PostgreSQL Not Found
```bash
# Install PostgreSQL
# macOS:
brew install postgresql

# Ubuntu:
sudo apt-get install postgresql

# Start service
# macOS:
brew services start postgresql

# Ubuntu:
sudo service postgresql start
```

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Error
- Verify PostgreSQL is running
- Check credentials in .env
- Ensure database `bugasura_db` exists
- Try: `psql -U postgres -d bugasura_db`

## 📖 Documentation

- **Backend**: See `backend/README.md` for API documentation
- **Frontend**: See `frontend/README.md` for component guide
- **Main**: See `README.md` for architecture details

## 🔐 Security Notes

This MVP is suitable for:
- ✅ Local development
- ✅ Prototype/MVP testing
- ✅ Learning purposes

For production, ensure:
- Change JWT_SECRET
- Setup HTTPS/SSL
- Configure firewall
- Use environment-specific configs
- Setup monitoring and logging
- Regular security audits

## 💻 System Requirements

- **Node.js**: v14 or higher
- **PostgreSQL**: v12 or higher
- **RAM**: 2GB minimum
- **Disk Space**: 500MB for dependencies
- **OS**: macOS, Linux, or Windows

## 🆘 Getting Help

1. Check README.md files in each directory
2. Review error messages carefully
3. Check browser console (F12)
4. Check backend logs
5. Verify PostgreSQL connection

## 📝 Example Usage

### Creating an Issue
1. Login or signup
2. Go to Projects
3. Create a new project
4. Click "Open Project"
5. Click "+ New Issue"
6. Fill in title, description, priority
7. Click "Create Issue"

### Creating a Test Case
1. Open a project
2. Go to "Test Cases" tab
3. Click "+ New Test Case"
4. Fill in title, description, expected result
5. Click "Create Test Case"

## 🎨 Customization

### Change Colors
Edit `frontend/src/styles/index.css`:
```css
:root {
  --primary-color: #5b5bff;  /* Change this */
  --secondary-color: #ff6b6b;
  /* ... */
}
```

### Add Logo
Replace logo emoji in `frontend/src/components/Navbar.jsx`

### Modify Database Schema
Edit model files in `backend/src/models/`

## 📊 Current Limitations & Future Work

### Current (MVP)
- Basic CRUD operations
- Simple authentication
- No file uploads
- No real-time updates
- No integrations
- Single user per project (by default)

### Coming Soon
- File attachments
- Real-time collaboration
- Advanced search
- Analytics dashboard
- Third-party integrations
- Mobile apps
- AI features

## 🎓 Learning Opportunities

This project is great for learning:
- React hooks and context
- Express.js REST APIs
- PostgreSQL database design
- JWT authentication
- Full-stack development
- Modern JavaScript/Node.js

## 📞 Support & Feedback

For questions or improvements:
1. Check the documentation
2. Review example code
3. Test incrementally
4. Keep error messages for debugging

## 🎉 You're Ready!

You now have a fully functional bug tracking platform. Start by:

1. Starting the backend: `npm run dev` (in backend folder)
2. Starting the frontend: `npm run dev` (in frontend folder)
3. Visiting `http://localhost:3000`
4. Creating your first project!

**Happy Coding! 🚀**

---

For more detailed information, see:
- `README.md` - Full project documentation
- `backend/README.md` - Backend setup and API docs
- `frontend/README.md` - Frontend development guide
