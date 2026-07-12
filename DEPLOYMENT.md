# Cognify-AI Deployment Guide

## Production Deployment Checklist

### 1. Environment Configuration

#### Backend (.env)
```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://user:password@host:5432/cognify_ai
JWT_SECRET=<strong-random-secret-32-chars>
REFRESH_TOKEN_SECRET=<strong-random-secret-32-chars>
DEFAULT_AI_PROVIDER=gemini
GEMINI_API_KEY=<your-api-key>
GEMINI_MODEL=gemini-2.5-flash
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
AI_RATE_LIMIT_MAX=30
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### 2. Database Setup

```bash
# Generate Prisma Client
cd backend
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed production data (optional)
npx prisma db seed
```

### 3. Build Applications

```bash
# Build frontend
cd frontend
pnpm build

# Build backend
cd backend
pnpm build
```

### 4. Deployment Options

#### Option A: Vercel (Frontend) + Railway/Render (Backend)

**Frontend (Vercel):**
1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

**Backend (Railway/Render):**
1. Connect GitHub repository
2. Set environment variables
3. Configure PostgreSQL database
4. Deploy automatically

#### Option B: Docker Deployment

Create `Dockerfile` for backend:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "start"]
```

Create `Dockerfile` for frontend:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "start"]
```

#### Option C: VPS Deployment

1. Set up Ubuntu server with Node.js 18+
2. Install PostgreSQL
3. Clone repository
4. Install dependencies with pnpm
5. Set up environment files
6. Build applications
7. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start backend/dist/index.js --name cognify-backend
   pm2 start frontend --name cognify-frontend
   pm2 startup
   pm2 save
   ```
8. Set up Nginx reverse proxy

### 5. Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 7. Monitoring & Logging

- Set up Sentry for error tracking
- Configure structured logging with Pino
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Monitor database performance

### 8. Backup Strategy

- Automated database backups
- Backup environment configurations
- Regular snapshot backups of VPS

### 9. Security Hardening

- Enable firewall (ufw)
- Regular security updates
- Rate limiting configuration
- CORS configuration
- Security headers (Helmet)

### 10. Performance Optimization

- Enable CDN for static assets
- Configure caching headers
- Optimize database queries
- Enable compression
- Monitor and optimize bundle size

## Post-Deployment Testing

1. Test all API endpoints
2. Test authentication flow
3. Test AI generation with real provider
4. Test database operations
5. Test file uploads/downloads
6. Load testing
7. Security audit
8. Performance testing

## Troubleshooting

### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check environment variables
- Review build logs

### Runtime Errors
- Check application logs
- Verify database connectivity
- Test API endpoints individually
- Check environment configuration

### Performance Issues
- Monitor resource usage
- Check database query performance
- Review API response times
- Optimize bundle size
