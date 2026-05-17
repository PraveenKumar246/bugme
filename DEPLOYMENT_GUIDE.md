# Bugasura MVP - Deployment Guide

## Overview

This guide covers deploying Bugasura MVP to production environments. Currently covers Heroku, which is the simplest option for beginners.

---

## Prerequisites

- Git account (GitHub, GitLab, or Bitbucket)
- Heroku account (heroku.com - free tier available)
- Heroku CLI installed (`npm install -g heroku`)
- PostgreSQL database (Heroku provides free tier)

---

## 1. Heroku Deployment

### Step 1: Prepare Your Code

```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial Bugasura MVP commit"

# Create GitHub repository (recommended)
# Then add remote:
git remote add origin https://github.com/yourusername/bugasura-mvp.git
git push -u origin main
```

### Step 2: Create Heroku App

```bash
# Login to Heroku
heroku login

# Create apps for backend and frontend
heroku create bugasura-api
heroku create bugasura-frontend
```

### Step 3: Setup Database

```bash
# Add PostgreSQL to backend app
heroku addons:create heroku-postgresql:hobby-dev -a bugasura-api

# Get database URL
heroku config -a bugasura-api
```

### Step 4: Configure Environment Variables

```bash
# Set environment variables for backend
heroku config:set -a bugasura-api \
  DB_HOST=$(heroku config:get DATABASE_URL -a bugasura-api | sed 's/.*@//;s/:.*//' | sed 's/^[^@]*@//') \
  DB_PORT=5432 \
  JWT_SECRET=your_production_secret_key_change_this \
  NODE_ENV=production \
  CORS_ORIGIN=https://bugasura-frontend.herokuapp.com

# For frontend
heroku config:set -a bugasura-frontend \
  REACT_APP_API_URL=https://bugasura-api.herokuapp.com/api/v1
```

### Step 5: Create Procfile (Backend)

**File: `backend/Procfile`**
```
web: node src/server.js
release: npm run seed
```

### Step 6: Update package.json

**Backend `backend/package.json`:**
```json
{
  "engines": {
    "node": "18.x"
  },
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "seed": "node scripts/seed.js"
  }
}
```

**Frontend `frontend/package.json`:**
```json
{
  "engines": {
    "node": "18.x"
  },
  "scripts": {
    "start": "npm run build && npm run preview",
    "build": "vite build",
    "preview": "vite preview",
    "dev": "vite"
  }
}
```

### Step 7: Deploy Backend

```bash
# Navigate to backend directory
cd backend

# Push to Heroku
git subtree push --prefix backend heroku-backend main

# Or create a separate git repo
heroku git:remote -a bugasura-api
git push heroku main
```

### Step 8: Deploy Frontend

```bash
# Navigate to frontend directory
cd frontend

# Update API URL in frontend
# Edit .env or vite.config.js with production API URL

# Build
npm run build

# Create Procfile for frontend
echo "web: npm run preview" > Procfile

# Deploy
heroku git:remote -a bugasura-frontend
git push heroku main
```

### Step 9: Run Database Migrations

```bash
# Run seeding on backend
heroku run npm run seed -a bugasura-api
```

### Step 10: Verify Deployment

```bash
# Check backend
curl https://bugasura-api.herokuapp.com/api/v1/health

# Check logs
heroku logs -a bugasura-api --tail
heroku logs -a bugasura-frontend --tail
```

---

## 2. AWS Deployment

### Using Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli --upgrade --user

# Initialize
eb init -p node.js-18 bugasura

# Create environment
eb create production

# Deploy
eb deploy

# Monitor
eb logs
```

---

## 3. Docker Deployment

### Create Dockerfile (Backend)

**`backend/Dockerfile`:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]
```

### Create docker-compose.yml

**`docker-compose.yml`:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: bugasura_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: postgres
      DB_PASSWORD: postgres
      DB_NAME: bugasura_db
      JWT_SECRET: your_secret_key
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://backend:5000/api/v1

volumes:
  postgres_data:
```

### Deploy with Docker

```bash
# Build images
docker-compose build

# Start services
docker-compose up

# In production
docker-compose up -d
```

---

## 4. DigitalOcean Deployment

### Using App Platform

```bash
# Create app.yaml
cat > app.yaml << EOF
name: bugasura
services:
  - name: backend
    github:
      repo: your_username/bugasura-mvp
      branch: main
    build_command: npm install
    run_command: npm start
    http_port: 5000
    envs:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        scope: RUN_TIME
  
  - name: frontend
    github:
      repo: your_username/bugasura-mvp
      branch: main
    build_command: cd frontend && npm install && npm run build
    run_command: npm start
    http_port: 3000

databases:
  - name: bugasura-db
    engine: PG
    version: "15"
EOF

# Deploy
doctl apps create --spec app.yaml
```

---

## 5. Environment-Specific Configuration

### Production (.env.production)

```
NODE_ENV=production
SERVER_PORT=5000
DB_HOST=prod-db.example.com
DB_PORT=5432
DB_USER=prod_user
DB_PASSWORD=***strong_password***
DB_NAME=bugasura_prod
JWT_SECRET=***very_long_random_secret***
CORS_ORIGIN=https://yourdomain.com
```

### Staging (.env.staging)

```
NODE_ENV=staging
SERVER_PORT=5000
DB_HOST=staging-db.example.com
JWT_SECRET=***staging_secret***
CORS_ORIGIN=https://staging.yourdomain.com
```

---

## 6. SSL/HTTPS Setup

### Using Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# Auto-renew
sudo certbot renew --dry-run
```

### Update Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
    }
}

server {
    listen 80;
    server_name yourdomain.com api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 7. Monitoring & Logging

### Setup Monitoring

```bash
# Using Prometheus + Grafana
docker run -d --name prometheus prom/prometheus

# Using ELK Stack
docker run -d --name elasticsearch docker.elastic.co/elasticsearch/elasticsearch:7.17.0
docker run -d --name kibana docker.elastic.co/kibana/kibana:7.17.0
```

### Application Logging

**Add to backend/src/server.js:**
```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

logger.info('Application started');
```

---

## 8. Database Backup Strategy

### Automated Backups (PostgreSQL)

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups/postgresql"
DATABASE="bugasura_db"
USER="postgres"

pg_dump -U $USER $DATABASE | gzip > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Keep only last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete
```

### Schedule with Cron

```bash
# Add to crontab
0 2 * * * /path/to/backup-script.sh
```

---

## 9. Performance Optimization

### Frontend Optimization

```bash
# Enable gzip compression
# Update vite.config.js

import compression from 'vite-plugin-compression';

export default {
  plugins: [
    compression(),
  ],
};
```

### Backend Optimization

```javascript
// Add compression middleware
import compression from 'compression';

app.use(compression());

// Add caching headers
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=3600');
  next();
});
```

---

## 10. Deployment Checklist

Before going live:

- [ ] Update all environment variables
- [ ] Set strong JWT_SECRET
- [ ] Configure CORS properly
- [ ] Setup SSL/HTTPS
- [ ] Setup database backups
- [ ] Setup monitoring & logging
- [ ] Test login workflow
- [ ] Test issue creation
- [ ] Test file uploads
- [ ] Performance test
- [ ] Security audit
- [ ] Setup CDN for assets
- [ ] Create deployment documentation
- [ ] Setup CI/CD pipeline
- [ ] Plan disaster recovery

---

## 11. Rollback Plan

### If deployment fails

```bash
# Heroku rollback
heroku releases:rollback -a bugasura-api

# Docker rollback
docker rollout undo deployment/bugasura-api

# Check status
git log --oneline
git revert <commit-hash>
git push production main
```

---

## 12. Maintenance

### Database Maintenance

```bash
# Optimize PostgreSQL
VACUUM ANALYZE;

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Keep Dependencies Updated

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update major versions (carefully)
npm install package@latest
```

---

## Troubleshooting

### Backend won't start
```bash
# Check logs
heroku logs -a bugasura-api --tail

# Check database connection
psql postgresql://user:password@host/dbname
```

### Frontend not loading
```bash
# Check build
npm run build

# Check dist folder created
ls -la frontend/dist/
```

### Slow performance
- Enable query caching
- Optimize database indexes
- Use CDN for static assets
- Enable gzip compression

---

## Support Resources

- Heroku Documentation: heroku.com/docs
- DigitalOcean Docs: docs.digitalocean.com
- AWS Documentation: docs.aws.amazon.com
- PostgreSQL Docs: postgresql.org/docs

Happy Deploying! 🚀
