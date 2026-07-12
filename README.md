# Cognify-AI

AI-Powered Frontend Code Generation Platform

Transform your UI ideas into production-ready React, HTML, and Tailwind code instantly with live preview, Monaco editor, and one-click export.

## 🚀 Features

- **AI Code Generation**: Generate complete frontend components from natural language prompts
- **Live Preview**: Real-time preview with Monaco editor integration
- **Multi-File Support**: Handle complex project structures with multiple files
- **Multiple AI Providers**: Support for Gemini, OpenAI, Anthropic, OpenRouter, Groq, CodeZen, and OpenAI-compatible gateways
- **Project Management**: Save, version, and manage your generated projects
- **Modern UI**: Beautiful, responsive interface built with Next.js 15 and Tailwind CSS
- **Authentication**: Secure JWT-based authentication system
- **Rate Limiting**: Built-in API protection and rate limiting

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Editor**: Monaco Editor
- **TypeScript**: Full type safety

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Security**: Helmet, CORS, rate limiting
- **Logging**: Pino structured logging

## 📋 Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL 14+
- At least one backend AI provider API key

## 🚀 Quick Start

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

### 3. Start Development Servers

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

## 🤖 AI Provider Setup

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

## 📁 Project Structure

```
cognify-ai/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   ├── store/           # Zustand state management
│   │   └── lib/             # Utility functions
│   └── public/              # Static assets
├── backend/                 # Express backend API
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── providers/       # AI provider implementations
│   │   ├── repositories/    # Database repositories
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── validators/      # Input validation
│   └── prisma/              # Database schema
└── package.json             # Root package.json
```

## 🔧 Development

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

### Database Setup (Optional)

If you want to use PostgreSQL:

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

## 🔒 Security Features

- JWT-based authentication
- Rate limiting on all endpoints
- CORS protection
- Helmet security headers
- Input validation with Zod
- SQL injection prevention with Prisma
- XSS protection

## 📊 API Endpoints

### Health Check
- `GET /api/health` - Health check with database and AI provider status

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### AI Generation
- `POST /api/ai/generate` - Generate code (SSE streaming)
- `GET /api/ai/verify` - Verify server-side provider connectivity
- `POST /api/ai/improve` - Improve user prompt
- `POST /api/ai/chat` - AI assistant chat

## 🐛 Troubleshooting

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

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📧 Support

For support, email support@cognify-ai.com or open an issue on GitHub.
