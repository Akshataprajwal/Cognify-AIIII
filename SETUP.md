# Cognify-AI Setup Guide

## Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL 14+
- At least one backend AI provider API key

## Quick Start

### 1. Install Dependencies

```bash
# From project root
pnpm install
```

### 2. Environment Setup

#### Backend Environment

Copy the example environment file:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your values:
```env
# Server
PORT=4000
NODE_ENV=development

# Database (PostgreSQL)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cognify_ai

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
REFRESH_TOKEN_SECRET=your-super-secret-refresh-key-min-32-chars

# AI Providers
DEFAULT_AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
OPENAI_API_KEY=your-openai-api-key
```

#### Frontend Environment

Copy the example environment file:
```bash
cp frontend/.env.example frontend/.env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Database Setup

```bash
# Install Prisma CLI
pnpm add -D -w prisma

# Generate Prisma Client
cd backend
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### 4. Start Development Servers

```bash
# From project root - starts both frontend and backend
pnpm dev
```

Or start individually:
```bash
# Frontend (http://localhost:3000)
cd frontend && pnpm dev

# Backend (http://localhost:4000)
cd backend && pnpm dev
```

## AI Provider Setup

### Gemini (Free Tier Available)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add to `backend/.env`: `GEMINI_API_KEY=your-key`
4. Keep the key server-side only. Do not add it to any `NEXT_PUBLIC_*` variable.

### OpenAI

1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to `backend/.env`: `OPENAI_API_KEY=your-key`

### Other Providers

See `backend/.env.example` for all available providers.

## Development

### Type Checking
```bash
pnpm typecheck
```

### Linting
```bash
pnpm lint
```

### Building
```bash
pnpm build
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Try running without database (leave DATABASE_URL empty)

### AI Generation Not Working
- Check API keys are set correctly
- Verify DEFAULT_AI_PROVIDER in backend/.env
- Run `GET /api/ai/verify` to test the configured Gemini key and model
- Check browser console for errors

### Frontend Build Errors
- Clear `.next` folder: `rm -rf frontend/.next`
- Reinstall dependencies: `pnpm install`
- Check Node.js version (18+)

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup guide.
