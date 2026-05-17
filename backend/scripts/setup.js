#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_ENV_TEMPLATE = `# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=bugasura_db

# Server Configuration
SERVER_PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production_12345
JWT_EXPIRE=7d

# API Configuration
API_VERSION=v1

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
`;

const SETUP_GUIDE = `
╔════════════════════════════════════════════════════════════╗
║          Bugasura MVP - Setup Configuration Utility        ║
╚════════════════════════════════════════════════════════════╝

Thank you for choosing Bugasura! Let's get your project set up.

## ⚙️ Configuration Steps

### Backend Setup
1. Navigate to backend directory: cd backend
2. Install dependencies: npm install
3. This script will create .env file
4. Update .env with your PostgreSQL credentials
5. Create database: createdb bugasura_db
6. Start server: npm run dev

### Frontend Setup
1. Navigate to frontend directory: cd frontend
2. Install dependencies: npm install
3. Start development server: npm run dev

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/api/v1/health

### Demo Credentials (after seeding)
- Email: demo@bugasura.com
- Password: Demo@123

### Seed Database (Optional)
cd backend && npm run seed

## 📚 Documentation

- README.md - Project overview
- QUICK_START.md - Quick setup guide
- backend/README.md - Backend documentation
- frontend/README.md - Frontend documentation

## 🆘 Need Help?

1. Check QUICK_START.md for common issues
2. Review README.md for detailed setup
3. Check the relevant directory README

## ✅ Setup Complete!

You're ready to start building with Bugasura!

Happy Coding! 🚀
`;

function setupBackendEnv() {
  const backendDir = path.join(__dirname, '../backend');
  const envPath = path.join(backendDir, '.env');

  if (fs.existsSync(envPath)) {
    console.log('✅ .env file already exists in backend');
    return;
  }

  try {
    fs.writeFileSync(envPath, BACKEND_ENV_TEMPLATE);
    console.log('✅ Created backend/.env file');
    console.log('   ⚠️  Please update with your PostgreSQL credentials');
  } catch (error) {
    console.error('❌ Failed to create .env:', error.message);
  }
}

function printSetupGuide() {
  console.log(SETUP_GUIDE);
}

function printEnvironmentVariables() {
  console.log('\n📋 Required Environment Variables:\n');
  const lines = BACKEND_ENV_TEMPLATE.split('\n').filter((line) => line.trim());
  lines.forEach((line) => {
    if (line.startsWith('#')) {
      console.log(`\n${line}`);
    } else if (line.includes('=')) {
      const [key, value] = line.split('=');
      console.log(`  ${key.padEnd(20)} = ${value}`);
    }
  });
}

function main() {
  console.log('\n🚀 Bugasura MVP Setup Utility\n');

  setupBackendEnv();
  printEnvironmentVariables();
  printSetupGuide();
}

main();
