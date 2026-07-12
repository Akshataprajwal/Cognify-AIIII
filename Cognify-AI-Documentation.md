# Cognify-AI – AI Powered Frontend Code Generation Platform

## Introduction

Cognify-AI is an integrated platform that accelerates the creation of production-ready frontend user interfaces by combining a Next.js-based workspace, an Express/TypeScript backend, and modular AI provider integrations. It helps teams move quickly from design ideas to working components, pages, and complete project scaffolds through iterative, streamed code generation, live preview, and exportable project packages.

Key goals:
- Rapid prototyping: reduce time from idea to interactive UI prototypes and shippable components.
- Production-ready output: generate consistent, maintainable TypeScript + Next.js + Tailwind CSS code suitable for direct integration.
- Provider flexibility: support multiple AI backends with an abstraction layer for selection, fallbacks, and monitoring.
- Workspace continuity: persist prompts, projects, and generation history so work can be resumed and audited.
- Governance and security: admin controls, rate limiting, auditing, and secure handling of provider keys.

Who this is for:
- Frontend engineers and UI developers who want to speed up repetitive UI scaffolding.
- Product designers and UX teams who need quick interactive prototypes.
- Educators demonstrating modern frontend architecture and AI-assisted development.
- Admins and engineering leads wanting controlled, auditable generation workflows.

High-level architecture:
- Frontend: Next.js app with a workspace, code editor, file explorer, and live preview.
- Backend: Express/TypeScript API that orchestrates providers, streams generation via SSE, and persists state with Prisma/PostgreSQL.
- Providers: Pluggable AI provider implementations (Gemini, OpenAI, Anthropic, and others) managed by a provider registry and factory.

This documentation describes the project's problem space, architecture, features, APIs, deployment, and operational concerns to help contributors, evaluators, and users understand and run Cognify-AI.

## 1. PROBLEM STATEMENT

### Why this project was developed
Cognify-AI was developed to address the increasing need for rapid frontend prototyping and production-ready UI generation. Modern frontend teams spend a lot of time converting design ideas into React/Next.js components, wiring state, and ensuring responsive layout across devices. This project targets that gap.

### Existing problems faced by developers
- Repeating boilerplate for pages, layouts, and style structure.
- Slow handoff between design and development.
- Inconsistent code quality across generated components.
- Difficulty maintaining prompt/workspace continuity.
- Multiple AI providers with different APIs and no standard integration.

### Challenges in frontend development
- Choosing the right architecture (React, Next.js, TypeScript, Tailwind).
- Managing project structure for pages, components, and exports.
- Handling responsive design, accessibility, and preview validation.
- Integrating generated code safely into a working project.
- Ensuring secure, authenticated access and provider usage control.

### Limitations of existing AI code generators
- Many produce isolated snippets instead of full projects.
- They usually do not stream output progressively.
- They do not provide workspace persistence, export history, or admin monitoring.
- Provider switching and fallback is often manual.
- They lack integration with real frontend technologies like Next.js and Tailwind CSS.

### Why Cognify-AI provides a better solution
- Supports multiple provider backends through `backend/src/providers/providerFactory.ts`
- Provides streaming generation via `backend/src/controllers/aiController.ts`
- Enables live preview in `frontend/src/components/workspace/LivePreview.tsx`
- Uses a full project state model in `frontend/src/store/projectStore.ts`
- Includes admin controls in `frontend/src/components/admin/*` and `backend/src/controllers/adminController.ts`

### Real-world use cases
- A product team generating UI skeletons quickly.
- Developers bootstrapping new landing pages or dashboards.
- Educators demonstrating modern frontend architecture.
- Engineering leads auditing AI-assisted output.
- Enterprises enabling low-code frontend prototyping.

### Motivation behind the project
The motivation is to reduce repetitive frontend work, improve developer productivity, and deliver a controlled AI-assisted code generation environment that supports real-world engineering workflows.

---

## 2. PROJECT TITLE

### What is Cognify-AI?
Cognify-AI is a full-stack platform for AI-driven frontend code generation. It combines:
- a Next.js frontend UI,
- an Express/TypeScript backend,
- Prisma/PostgreSQL persistence,
- multi-provider AI support,
- streaming generation,
- project export and admin monitoring.

### How does it work?
- The user enters a prompt in `frontend/src/components/workspace/PromptPanel.tsx`.
- The frontend calls `frontend/src/services/aiService.ts` to POST `/api/ai/generate`.
- `backend/src/controllers/aiController.ts` resolves a provider using `ProviderFactory`.
- The chosen provider sends a stream of generated text back to the backend.
- The backend streams SSE chunks to the frontend.
- `frontend/src/components/workspace/WorkspaceLayout.tsx` appends progress to project state.
- `frontend/src/components/workspace/LivePreview.tsx` renders the result in a sandbox.

### Who can use it?
- Frontend developers
- UI/UX designers
- Product managers
- Students and educators
- Admin teams managing provider usage

### What problem does it solve?
It automates the generation of frontend code, reduces setup time, preserves project context, and makes AI generation safe and manageable.

### Why is it useful?
- Speeds UI creation
- Maintains a workable project state
- Enables admin governance
- Supports provider failover
- Delivers live preview and export

### Business value
- Faster feature delivery
- Consistent generated output
- Reduced prototyping cost
- Better control over AI provider usage
- Improved auditability and monitoring

### Future scope
- Add more AI providers
- Add collaborative multi-user generation
- Generate tests with frontend code
- Support backend scaffolding safely
- Add real-time code merge and version control integrations

### Objectives
- Provide secured user and admin access
- Stream AI-generated frontend code
- Persist prompts, projects, and history
- Export complete frontend projects
- Support multiple AI providers

---

## 3. REQUIREMENTS

### Hardware Requirements

#### Minimum requirements
- Processor: Dual-core 2.0 GHz or equivalent
- RAM: 8 GB
- Storage: 20 GB free
- Internet: 10 Mbps
- Display: 1366×768
- Development machine: Local laptop or desktop
- Production server: Small cloud instance (2 cores, 4 GB RAM)

#### Recommended requirements
- Processor: Quad-core 2.5+ GHz
- RAM: 16 GB
- Storage: 100+ GB SSD
- Internet: 100 Mbps
- Display: 1920×1080
- Production server: 4+ GB RAM, 2+ vCPU

### Software Requirements

#### Operating System
- Windows, macOS, or Linux
- Production: Ubuntu LTS or equivalent

#### Node.js
- Version 18+ recommended

#### Next.js
- Uses Next.js app router in `frontend/next.config.mjs`

#### React
- React 18+ with hooks, component model, and client-side rendering

#### TypeScript
- Full TypeScript support in frontend and backend

#### Express.js
- Backend server framework in `backend/src/index.ts`

#### Prisma
- ORM used with `prisma/schema.prisma`

#### PostgreSQL
- Database provider in Prisma datasource

#### Tailwind CSS
- UI library used throughout `frontend/src`

#### VS Code
- Recommended editor with TypeScript and ESLint support

#### Git
- Version control for codebase

#### npm / pnpm
- Package management for frontend/backend packages

#### Browser
- Modern browser: Chrome, Edge, Firefox

#### AI APIs
- Gemini, OpenAI, Anthropic, OpenRouter, Groq, Together, DeepSeek, CodeZen, OpenAI-compatible

#### Hosting tools
- Netlify/Vercel for frontend
- Node hosting or Docker for backend
- PostgreSQL hosted service for DB

#### Development tools
- Postman/Insomnia for API testing
- Docker optional for database/test environment

---

## 4. PROJECT DESCRIPTION

### Overall project structure
- `frontend/`: Next.js app
- `backend/`: Express API
- `prisma/`: Database schema
- `public/`: Static assets
- `frontend/src/components/`: UI and workspace components
- `backend/src/controllers/`: API controllers
- `backend/src/providers/`: AI provider implementations
- `backend/src/middleware/`: security and request middleware
- `backend/src/services/`: core business logic

### Frontend
- `frontend/src/app`: pages, layouts, and route groups
- `frontend/src/components/workspace`: workspace UI, editor, preview, file explorer
- `frontend/src/components/admin`: admin dashboards and controls
- `frontend/src/store`: app state via Zustand
- `frontend/src/services`: API wrappers and export logic
- `frontend/src/lib`: shared utility and configuration

### Backend
- `backend/src/index.ts`: server entry point
- `backend/src/routes`: route definitions
- `backend/src/controllers`: request handlers for auth, AI, admin
- `backend/src/providers`: AI provider classes and registry
- `backend/src/config`: environment loader and database client
- `backend/src/middleware`: authentication, admin checks, rate limiting, error handling
- `backend/src/services`: auth rules, prompt handling, 2FA, temporary tokens
- `backend/src/repositories`: database access helpers
- `backend/src/utils/apiResponse.ts`: consistent API response formatting

---

### Module Descriptions

#### Authentication
- **Purpose:** Secure login/register and protect routes
- **Working:** 
  - `backend/src/routes/auth.ts` exposes `/register`, `/login`, `/me`, `/refresh`, `/logout`
  - `backend/src/controllers/authController.ts` validates inputs and delegates to `AuthService`
- **Input:** email, password, maybe 2FA token
- **Output:** JWT tokens, user object, success/error response
- **Files involved:** `backend/src/middleware/authenticate.ts`, `backend/src/middleware/optionalAuthenticate.ts`, `frontend/src/hooks/useAuth.ts`, `frontend/src/app/(auth)/*`
- **Errors:** invalid credentials, invalid token, unauthorized access
- **Error handling:** `backend/src/utils/apiResponse.ts`, `backend/src/middleware/errorHandler.ts`, frontend toasts and route redirects

#### Registration
- `frontend/src/components/auth/RegisterForm.tsx`
- `backend/src/controllers/authController.ts`
- `backend/src/services/authService.ts`

#### Login
- `frontend/src/components/auth/LoginForm.tsx`
- `backend/src/controllers/authController.ts`
- `backend/src/services/authService.ts`

#### JWT
- `backend/src/config/env.ts` loads `JWT_SECRET`
- `backend/src/middleware/authenticate.ts` verifies tokens
- `frontend/src/services/authService.ts` reads/writes token to storage and cookies

#### Admin Authentication
- Uses `backend/src/middleware/adminAuth.ts`
- Admin routes protected by `authenticate` then `requireAdmin`
- Admin 2FA uses `backend/src/services/twoFactorService.ts` and `backend/src/controllers/authController.ts`

#### Role Management
- User roles stored in `prisma/schema.prisma` model `User.role`
- Admin-only UI under `frontend/src/app/admin/*`
- `frontend/src/middleware.ts` protects `/admin` routes

#### User Dashboard
- `frontend/src/app/(dashboard)/dashboard/page.tsx`
- `frontend/src/components/dashboard/*`
- Shows projects, credits, suggestions, recent activity

#### Admin Dashboard
- `frontend/src/components/admin/AdminDashboard.tsx`
- `backend/src/controllers/adminController.ts`

#### AI Workspace
- `frontend/src/app/ai-workspace/page.tsx`
- `frontend/src/components/workspace/WorkspaceLayout.tsx`
- `frontend/src/components/workspace/PromptPanel.tsx`
- `frontend/src/components/workspace/LivePreview.tsx`
- `frontend/src/components/workspace/CodeEditor.tsx`

#### Prompt Input
- Users enter prompts in `PromptPanel.tsx`
- Prompt history stored in `backend/src/models` via `PromptHistory` and frontend in store

#### AI Code Generation
- Backend `AIController.generate` in `backend/src/controllers/aiController.ts`
- Provider selection in `ProviderFactory`
- Response stream to frontend with SSE

#### AI Streaming
- Backend `startSse(res)` sets `Content-Type: text/event-stream`
- Frontend `frontend/src/services/aiService.ts` reads `response.body.getReader()`
- Partial output appended via `updateProjectCode` in `WorkspaceLayout.tsx`

#### Live Preview
- `frontend/src/components/workspace/LivePreview.tsx`
- Renders generated React/HTML code safely

#### Code Editor
- `frontend/src/components/workspace/CodeEditor.tsx`
- Supports editing generated code and saving updates

#### File Explorer
- `frontend/src/components/workspace/FileExplorer.tsx`
- Displays generated files, entry path, and project structure

#### Project Generator
- `frontend/src/store/projectStore.ts` manages project state and versions
- `Project` model stored locally and pushed to backend if integrated

#### Export System
- `frontend/src/services/exportService.ts`
- Backend export history stored in `ExportHistory` model
- UI in `frontend/src/components/workspace/ExportPanel.tsx`

#### Template Management
- `frontend/src/services/templateService.ts`
- `frontend/src/app/templates/page.tsx`
- `backend/src/controllers/adminController.ts` and `backend/src/routes/admin.ts`

#### Project Management
- Admin views at `frontend/src/app/admin/projects/page.tsx`
- Backend CRUD in `AdminController.getProjects`, `deleteProject`

#### Provider Management
- `frontend/src/components/admin/ProviderManagement.tsx`
- Backend stats in `AdminController.getProviderStats`
- Provider registry in `backend/src/providers/providerRegistry.ts`

#### Generation Logs
- `Generation` model in Prisma
- Admin view `frontend/src/components/admin/GenerationLogs.tsx`

#### Export History
- `ExportHistory` model in Prisma
- Admin view `frontend/src/components/admin/ExportHistory.tsx`

#### System Status
- Health route in `backend/src/routes/health.ts`
- Admin system status view in `frontend/src/components/admin/SystemStatus.tsx`

#### Security Module
- `backend/src/middleware/helmet` and `cors` setup in `backend/src/index.ts`
- Rate limiting in `backend/src/middleware/rateLimiter.ts`
- `backend/src/middleware/errorHandler.ts`

#### Application Settings
- `AppSettings` model in Prisma
- Admin settings page `frontend/src/app/admin/settings/page.tsx`

#### Notifications
- `frontend/src/store/notificationStore.ts`
- `frontend/src/components/ui/toast.tsx`

#### Theme
- Theme toggling via `frontend/src/components/common/ThemeToggle.tsx`
- App shell in `frontend/src/app/layout.tsx`

#### Search, Filters, Pagination
- Admin controllers support search, pagination, sorting (`AdminController.getUsers`, `getProjects`)
- UI in admin lists and dashboard components

#### Responsive UI
- Tailwind CSS utilities across frontend components
- Layout components adapt to screen sizes

#### Error Handling
- Backend: `errorHandler.ts`, `apiResponse.ts`
- Frontend: `ErrorBoundary.tsx`, toast messages, alerts

#### Loading States
- `frontend/src/components/ui/skeleton.tsx`
- Frontend uses skeleton and spinner UI elements

#### Retry Mechanism
- Client-side retries in `frontend/src/services/aiService.ts` with exponential backoff
- Backend provider retries in `backend/src/providers/retry.ts`

#### Toast Notifications
- Sonner toast integration in workspace pages
- `notificationStore.ts` used across UI

#### AI Provider Management
- `backend/src/providers/providerFactory.ts`
- `backend/src/providers/providerRegistry.ts`
- Frontend provider selector in `frontend/src/components/workspace/ProviderSelector.tsx`

#### Environment Variable Loader
- `backend/src/config/env.ts`
- `frontend/src/lib/api.ts` reads `NEXT_PUBLIC_API_URL`

#### API Services
- Frontend service modules in `frontend/src/services/*`
- `frontend/src/lib/apiRequest.ts` centralized fetch helper

#### Backend Controllers
- `backend/src/controllers/authController.ts`
- `backend/src/controllers/aiController.ts`
- `backend/src/controllers/adminController.ts`

#### Repositories
- `backend/src/repositories/userRepository.ts`

#### Database Layer
- Prisma schema in `prisma/schema.prisma`
- `backend/src/config/db.ts` creates `PrismaClient`

#### Streaming Engine
- SSE streaming in `AIController.generate()`
- Client-side streaming parse loop in `aiService.ts`

#### Live Preview Sandbox
- `LivePreview.tsx` isolates rendered code
- Provides immediate visual validation of generated interface

#### Error Boundary
- `frontend/src/components/common/ErrorBoundary.tsx`
- Prevents crash of entire UI on component exceptions

#### Security Features
- JWT auth
- Admin middleware
- `helmet`, `cors`
- rate limiting and optional authentication

#### CORS
- Configured in `backend/src/index.ts` using `env.CORS_ORIGIN`

#### Authentication Middleware
- `backend/src/middleware/authenticate.ts`

#### Authorization Middleware
- `backend/src/middleware/adminAuth.ts`

#### Optional Authentication
- `backend/src/middleware/optionalAuthenticate.ts`
- Used for AI route when auth is optional

#### Logging
- `backend/src/logger.ts`
- Admin audit logs in Prisma model `AuditLog`

#### Health Check
- `backend/src/routes/health.ts`
- root endpoint in `backend/src/index.ts`

#### Deployment
- Frontend ready for Netlify/Vercel
- Backend can run on Node host or Docker
- Database hosted by PostgreSQL

---

## 5. SYSTEM DESIGN

### System Architecture Diagram
- **Purpose:** Show end-to-end components
- **Components:**
  - Browser frontend
  - Next.js UI
  - Express backend
  - Prisma/PostgreSQL
  - AI providers
  - Admin interface
- **Working:** Client → API → provider → stream → preview → export
- **Advantages:** Clear separation of concerns and provider abstraction

### Use Case Diagram
- Actors:
  - Authenticated user
  - Admin
  - AI provider
  - System
- Use cases:
  - Generate UI
  - Preview code
  - Save project
  - Export project
  - Manage providers
  - Monitor logs

### Class Diagram
- Key entities:
  - `User`
  - `Project`
  - `Generation`
  - `Template`
  - `ExportHistory`
- Relationships:
  - `User` owns multiple `Project`
  - `Project` has multiple `Generation`
  - `User` has `PromptHistory`, `LoginHistory`, `AuditLog`

### Sequence Diagram
- User requests generation
- Frontend calls backend `/api/ai/generate`
- Backend resolves provider
- Backend requests provider
- Provider streams chunks
- Backend streams SSE
- Frontend decodes chunks
- Frontend updates code editor, preview, history

### Flowchart
- Prompt entry → validation → provider selection → streaming → view code → save/export → history

### Data Flow Diagram
- **Level 0:** User interacts with UI; AI provider returns code; DB stores users/projects/generations.
- **Level 1:** 
  - Auth flow
  - AI generation flow
  - Admin flow
  - Export flow

### ER Diagram
- `User` → `Project`
- `Project` → `ProjectVersion`
- `Project` → `Generation`
- `User` → `PromptHistory`
- `User` → `ExportHistory`

### Database Schema Diagram
- Show model fields and relationships from `prisma/schema.prisma`
- Highlight indexes and foreign keys:
  - `Project.userId`
  - `Generation.userId`, `Generation.projectId`
  - `ExportHistory.projectId`, `ExportHistory.userId`

### Authentication Flow Diagram
- Registration → hashed password → store user
- Login → verify password → issue JWT/refresh
- Protected route → middleware verifies JWT
- Admin route → role check

### AI Generation Flow Diagram
- User prompt → backend generate API → provider selection
- Provider chat/generation → SSE
- Client-side parse → editor/preview update
- Generation log persisted

### Admin Dashboard Flow
- Admin logs in → views dashboard stats → manages users/templates/providers → reviews logs

### Frontend Architecture
- App router in `frontend/src/app`
- Components grouped by feature
- Stores manage persisted application state
- Services manage API integration

### Backend Architecture
- Router hierarchy: auth, ai, admin, health
- Controllers handle request logic
- Providers encapsulate external APIs
- Middleware enforces security, rate limiting, errors

### Deployment Architecture
- Frontend on CDN/hosting
- Backend on Node server/container
- Postgres DB external
- Env vars stored in host config
- AI provider keys kept server-side

### Folder Structure Diagram
- `frontend/`
- `backend/`
- `prisma/`
- `public/`

### API Request Flow
- `/api/auth/*`
- `/api/ai/*`
- `/api/admin/*`
- `/api/health/*`

### Streaming Flow
- SSE event stream from backend to browser
- `data: { ... }` messages
- `data: [DONE]` termination signal

---

## 6. DATABASE DESIGN

### Every table

#### `User`
- **Purpose:** store authentication and profile details
- **PK:** `id`
- **Fields:** `email`, `password`, `name`, `role`, `refreshToken`, `lastLoginAt`, `isActive`
- **Indexes:** unique email
- **Relationships:** one-to-many with `Project`, `PromptHistory`, `Generation`, `ExportHistory`, `AuditLog`, `LoginHistory`, `AdminTwoFactorCode`

#### `Project`
- **Purpose:** store generated project metadata
- **PK:** `id`
- **FK:** `userId`
- **Fields:** `name`, `prompt`, `code`, `aiProvider`, `language`, `isPublic`
- **Indexes:** userId
- **Relationships:** one-to-many with `ProjectVersion`, `PromptHistory`, `Generation`, `ExportHistory`

#### `ProjectVersion`
- **Purpose:** snapshot old versions
- **FK:** `projectId`
- **Fields:** `prompt`, `code`, `aiProvider`, `version`

#### `PromptHistory`
- **Purpose:** record prompts issued by users
- **FKs:** `userId`, `projectId`
- **Indexes:** userId, projectId

#### `Generation`
- **Purpose:** audit AI generation sessions
- **FKs:** `userId`, `projectId`
- **Fields:** `provider`, `tokensUsed`, `durationMs`, `status`

#### `ExportHistory`
- **Purpose:** record exports
- **FKs:** `userId`, `projectId`
- **Fields:** `format`, `createdAt`

#### `Template`
- **Purpose:** store reusable UI templates
- **Fields:** `name`, `description`, `category`, `code`, `isFeatured`

#### `AuditLog`
- **Purpose:** track admin/system actions
- **Fields:** `action`, `resource`, `metadata`, `ipAddress`, `userAgent`

#### `HealthCheck`
- **Purpose:** health probe history

#### `LoginHistory`
- **Purpose:** record login attempts
- **Fields:** `ipAddress`, `userAgent`, `success`, `failureReason`

#### `ProviderStats`
- **Purpose:** track provider usage and health
- **Fields:** `provider`, `totalRequests`, `successCount`, `failureCount`, `avgResponseTime`

#### `AppSettings`
- **Purpose:** global app configuration
- **Fields:** `theme`, `defaultAIProvider`, `generationLimit`

#### `SystemMetrics`
- **Purpose:** track runtime health metrics

#### `AdminTwoFactorCode`
- **Purpose:** store 2FA codes for admin login
- **Fields:** hashed code, `expiresAt`, `attempts`, `isUsed`

### How Prisma maps them
- `prisma/schema.prisma` defines models
- `backend/src/config/db.ts` creates `PrismaClient`
- Repositories and controllers query models directly

---

## 7. API DOCUMENTATION

### Authentication
- `POST /api/auth/register`
  - Public
  - Body: `{ email, password, name? }`
  - Response: created user info
  - Errors: 400 validation, 409 email duplicate

- `POST /api/auth/login`
  - Public
  - Body: `{ email, password }`
  - Response: `{ token, refreshToken, user, requiresTwoFactor? }`
  - Errors: 401 invalid credentials

- `GET /api/auth/me`
  - Protected
  - Response: authenticated user profile
  - Errors: 401 unauthorized

- `POST /api/auth/refresh`
  - Public
  - Body: `{ refreshToken }`

- `POST /api/auth/logout`
  - Protected
  - Invalidates current session or token

- `POST /api/auth/admin/verify-code`
  - Public
  - Body: `{ tempToken, code }`
  - Used for admin 2FA

### AI
- `GET /api/ai/providers`
  - Public
  - Returns available configured providers and default provider

- `GET /api/ai/verify`
  - Rate limited
  - Query: `provider`, `model`
  - Verifies connectivity to an AI provider

- `POST /api/ai/generate`
  - Optional auth
  - Body: `{ prompt, provider?, model? }`
  - Returns SSE stream
  - Errors: 400 validation, 500 backend/provider errors

- `POST /api/ai/improve`
  - Rate limited
  - Improves prompt text
  - No auth required

- `POST /api/ai/chat`
  - Optional auth
  - Body: chat conversation
  - Returns assistant messages

### Admin
- `GET /api/admin/dashboard`
  - Admin only
  - Returns statistics and top providers

- `GET /api/admin/users`
  - Admin only
  - Query: search, role, status, page, limit, sortBy

- `PATCH /api/admin/users/:id`
  - Admin only
  - Update name/role

- `DELETE /api/admin/users/:id`

- `GET /api/admin/projects`
  - Admin only
  - Lists projects with filters

- `DELETE /api/admin/projects/:id`

- `GET /api/admin/generations`
  - Admin only
  - Lists generation logs

- `DELETE /api/admin/generations/:id`

- `GET /api/admin/templates`
  - Admin only

- `DELETE /api/admin/templates/:id`

- `PATCH /api/admin/templates/:id/featured`

- `GET /api/admin/exports`
  - Admin only

- `DELETE /api/admin/exports/:id`

- `GET /api/admin/audit-logs`
- `GET /api/admin/login-history`
- `GET /api/admin/providers`
- `PATCH /api/admin/providers/:provider/status`
- `GET /api/admin/settings`
- `PATCH /api/admin/settings`
- `GET /api/admin/system-status`

### Health
- `GET /api/health`
  - Public
  - Basic service status

### Errors
- `sendError` standardizes response structure
- 400 validation
- 401 auth
- 403 forbidden
- 429 rate limit
- 500 internal errors

---

## 8. ENVIRONMENT VARIABLES

### Backend env vars in `backend/src/config/env.ts`

- `DATABASE_URL`
  - Purpose: database connection string
  - Used in: Prisma datasource
  - Example: `postgresql://user:pass@localhost:5432/cognify`
  - Missing: DB unavailable; migrations and runtime fail
  - Configure in `.env` or host secrets

- `JWT_SECRET`
  - Purpose: sign JWT tokens
  - Used in backend auth
  - Example: `super-secret-jwt-key`
  - Missing: authentication fails or startup throws in production

- `JWT_EXPIRES_IN`
  - Purpose: access token lifetime
  - Default: `7d`

- `REFRESH_TOKEN_SECRET`
  - Purpose: sign refresh tokens
  - Used for token refresh flow
  - Missing: refresh flow fails

- `REFRESH_TOKEN_EXPIRES_IN`
  - Purpose: refresh token lifetime
  - Default: `30d`

- `DEFAULT_AI_PROVIDER`
  - Purpose: fallback provider selection
  - Example: `gemini`
  - Missing: auto-detect configured provider or fallback to `mock`

- `GEMINI_API_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `OPENROUTER_API_KEY`
- `GROQ_API_KEY`
- `TOGETHER_API_KEY`
- `DEEPSEEK_API_KEY`
- `CODEZEN_API_KEY`
- `OPENAI_COMPATIBLE_API_KEY`
- `OPENAI_COMPATIBLE_API_URL`
- `OPENAI_COMPATIBLE_MODEL`

- `CORS_ORIGIN`
  - Purpose: allowed frontend origin
  - Example: `http://localhost:3000`
  - Missing: default `http://localhost:3000`

- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`
- `AI_RATE_LIMIT_MAX`
- `AI_REQUEST_TIMEOUT_MS`
- `REDIS_URL`

### Frontend env vars
- `NEXT_PUBLIC_API_URL`
  - Purpose: backend API base URL in browser
  - Example: `http://localhost:4000`
  - Missing: frontend falls back to `http://localhost:4000` in `frontend/src/lib/api.ts`
- Other `NEXT_PUBLIC_*` variables if added for analytics or feature flags

### Production configuration
- Store secrets in host environment settings
- Do not commit `.env`
- Use platform secret manager for provider keys
- Replace development defaults before production

---

## 9. PROJECT FOLDER STRUCTURE

### Root folders
- `frontend/`: Next.js client app
- `backend/`: Express API server
- `prisma/`: database models
- `public/`: static assets used by frontend

### `frontend/`
- `package.json`
- `next.config.mjs`
- `tailwind.config.ts`
- `src/app`: route groups and pages
- `src/components`: reusable UI and workspace views
- `src/services`: network/API client logic
- `src/store`: app state
- `src/hooks`: custom React hooks
- `src/lib`: shared config and utility helpers
- `src/middleware.ts`: route protection

### `backend/`
- `package.json`
- `tsconfig.json`
- `src/index.ts`: entry point
- `src/config`: env and DB client
- `src/routes`: Express routers
- `src/controllers`: request handlers
- `src/services`: auth, prompt, 2FA, temp token logic
- `src/providers`: AI provider implementations
- `src/middleware`: auth, admin, rate limit, error handler
- `src/repositories`: DB helper classes
- `src/utils`: response formatting

### `prisma/`
- `schema.prisma`: DB model definitions
- migration files if present

### Important frontend folders
- `src/components/workspace`: main AI workspace UI
- `src/components/admin`: admin portal
- `src/components/ui`: design system
- `src/services`: API wrappers
- `src/store`: persisted state

### Important backend folders
- `src/providers`: logic for providers
- `src/middleware`: security enforcement
- `src/controllers`: business flow control

---

## 10. IMPORTANT FILES

| File | Purpose | Why important | If removed | Interactions |
|---|---|---|---|---|
| `backend/src/index.ts` | Start backend server | Bootstraps Express, middleware, routes | Backend unavailable | Uses env, routers, logger |
| `backend/src/config/env.ts` | Load env vars | Validates config and provider readiness | Missing provider config or secrets | Used by all backend modules |
| `backend/src/config/db.ts` | Prisma client instance | Database access layer | DB queries fail | Used by repositories/controllers |
| `backend/src/controllers/aiController.ts` | AI generation endpoints | Streams backend AI output | AI routes fail | Uses provider factory, prompt service |
| `backend/src/providers/providerFactory.ts` | Provider resolution | Creates provider instances | AI generation and verification fail | Uses provider registry and env |
| `backend/src/providers/providerRegistry.ts` | Provider metadata | Detects configured providers | Provider listing inaccurate | Used by AIController and frontend list |
| `backend/src/middleware/authenticate.ts` | JWT auth | Protects endpoints | Routes unprotected or fail | Used by auth/admin routers |
| `backend/src/middleware/adminAuth.ts` | Admin role guard | Protects admin paths | Admin portal insecure | Used by admin router |
| `backend/src/middleware/optionalAuthenticate.ts` | Optional user attachment | Enables anonymous AI access | Optional auth flows break | Used by AI routes |
| `backend/src/middleware/rateLimiter.ts` | Rate limiting | Prevents abuse | Provider costs uncontrolled | Used globally and on AI/auth routes |
| `frontend/src/lib/api.ts` | API base URL | Backend request coordination | API calls break | Used by all service modules |
| `frontend/src/services/aiService.ts` | AI stream client | Parses backend SSE stream | Streaming UI fails | Used by workspace layout |
| `frontend/src/components/workspace/WorkspaceLayout.tsx` | Main workspace | Orchestrates prompt generation and preview | Primary UX unavailable | Uses project store and AI service |
| `frontend/src/components/workspace/LivePreview.tsx` | Live rendering | Immediate UI validation | No visual preview | |
| `frontend/src/store/projectStore.ts` | Project state | Handles generated code and versions | No persistent project flow | |
| `frontend/src/middleware.ts` | Route protection | Guards private routes | Unauthorized access possible | Uses cookies for JWT |
| `prisma/schema.prisma` | DB schema | Source-of-truth for persistence | Prisma client generation fails | Maps DB models to code |

---

## 11. FEATURES

### AI Frontend Code Generation
- Multi-provider support
- Provider selection in UI
- Backend provider abstraction

### Live Preview
- Real-time rendering
- Sandbox isolation
- Visual validation of generated code

### Streaming Code Generation
- Progressive output
- Improved UX during generation
- Support for provider partial results

### Responsive UI
- Tailwind-based layout
- Adaptive panels and sidebar
- Mobile-friendly admin and workspace views

### Authentication
- JWT login
- Register, refresh, logout
- `frontend/src/middleware.ts` route gating

### Authorization
- Role-based access for admin pages
- `backend/src/middleware/adminAuth.ts`

### Role-based Access
- Roles stored in `User.role`
- Admin-only UI and endpoints

### Admin Dashboard
- Provider health
- generation stats
- user/project lists

### Project Management
- Create and manage projects
- Version history in `ProjectVersion`

### Templates
- Template pages and featured templates
- Template service and admin management

### Export
- Export history
- Downloadable code packages
- Export panel in workspace

### History
- Prompt history
- Generation history
- Export audit trail

### Notifications
- Toast and notification center
- Success, warning, error messages

### Provider Switching
- Multiple AI providers
- Client-side provider selector
- Auto provider detection

### Dark Mode
- Theme toggle component
- Settings persisted in `AppSettings`

### Security
- JWT + admin guard
- rate limiting
- CORS
- Helmet headers

### Error Recovery
- Fallback HTML generation
- Auto-fix prompt workflow in workspace

### Search
- Search users and projects
- Admin filtering by email/status

### Pagination
- Backend pagination in admin controllers
- UI lists with page control

### Filtering
- Search and status filters for users/projects
- Provider filters in admin lists

### Accessibility
- UI components follow accessible patterns
- form labels and keyboard shortcuts

### Performance Optimizations
- Dynamic imports for heavy components
- streaming reduces latency
- optimized Next.js build config

### Deployment Ready
- Backend `NODE_ENV` validation
- frontend `NEXT_PUBLIC_API_URL`
- production-ready routing

---

## 12. PROJECT WORKFLOW

1. **User opens website**
   - Next.js loads `frontend/src/app/page.tsx`
   - Middleware checks auth cookies

2. **Login**
   - User signs in via `frontend/src/components/auth/LoginForm.tsx`
   - Backend issues JWT via `AuthController.login`

3. **Dashboard**
   - User lands on `/dashboard`
   - `frontend/src/components/dashboard` renders projects, stats, suggestions

4. **Prompt**
   - User enters prompt in `PromptPanel.tsx`

5. **AI**
   - `aiService.generateStream()` sends prompt to `/api/ai/generate`

6. **Streaming**
   - Backend streams events
   - Client appends code chunks in `WorkspaceLayout.tsx`

7. **Preview**
   - `LivePreview.tsx` renders code continuously

8. **Edit**
   - User modifies generated code in `CodeEditor.tsx`

9. **Export**
   - User exports through `ExportPanel.tsx`
   - Export history recorded in `ExportHistory`

10. **Save**
   - Project state persists in `projectStore`
   - Server-side save can occur if backend project syncing exists

11. **History**
   - Prompt and generation history viewable in `frontend/src/app/history/page.tsx`

12. **Admin Monitoring**
   - Admin monitors via `frontend/src/app/admin/*`
   - `/api/admin/dashboard` aggregates stats

---

## 13. SECURITY

### JWT
- Token signing in `AuthService`
- Verification in `authenticate.ts`

### Password hashing
- Performed in `AuthService.register`
- Stored only as hashed password

### Authentication
- `authenticate.ts` middleware on protected routes
- `optionalAuthenticate.ts` for AI routes with anonymous fallback

### Authorization
- Admin routes guarded by `adminAuth.ts`

### Protected Routes
- `frontend/src/middleware.ts` checks page access
- `backend/src/routes/admin.ts` protects admin APIs

### Rate Limiting
- `generalLimiter`, `authLimiter`, `aiLimiter` in `rateLimiter.ts`

### CORS
- configured in `backend/src/index.ts`
- `env.CORS_ORIGIN` controls allowed frontend

### Input Validation
- `backend/src/validators/authValidator.ts`
- manual schema checks in controllers

### Environment Variables
- Secrets in backend `.env`
- `NEXT_PUBLIC_` only for safe client config

### Secure API Calls
- Backend provider calls over HTTPS
- Provider keys never exposed to browser

---

## 14. PERFORMANCE

### Lazy Loading
- Heavy workspace components loaded only when needed
- Editor and preview components likely dynamically imported

### Code Splitting
- Next.js route-based splitting

### Caching
- Browser caching for static assets
- Provider metadata cached in config

### Optimized Rendering
- Zustand stores avoid excessive re-renders
- Suspense-like conditional loading

### Streaming
- Reduces wait time for first generated content

### Efficient State Management
- `projectStore.ts` holds project/cursor state
- minimal cross-component props

### Responsive Design
- Tailwind supports breakpoint layouts
- workspace panel adapts to screen size

### Build Optimization
- Production build from Next.js
- backend tree-shake and environment validation

---

## 15. TESTING

### Unit Testing
- Possible for `AuthService`, `PromptService`, `ProviderFactory`

### Integration Testing
- API route tests for auth, AI, admin
- Provider verification and streaming flows

### Manual Testing
- login/register
- prompt workflows
- live preview and export

### API Testing
- Postman/Insomnia against `/api/*`
- health, auth, AI, admin routes

### UI Testing
- Next.js page interactions
- component state and toast behavior

### Error Handling Tests
- provider failures in `mockProvider`
- invalid prompt/validation errors

### Performance Tests
- stress generation endpoint
- verify rate limiter and timeout

### Security Tests
- JWT auth bypass
- CORS and admin route protection
- provider key leak prevention

---

## 16. DEPLOYMENT

### Frontend Deployment
- Build using `npm run build` in `frontend`
- Host on Netlify/Vercel or any static-compatible service
- Use `NEXT_PUBLIC_API_URL` for backend URL

### Backend Deployment
- Run Express server from `backend/src/index.ts`
- Set env vars on host
- Optionally containerize with Docker

### Database Deployment
- PostgreSQL service
- Run Prisma migrations against `DATABASE_URL`

### Environment Variables
- Configure secrets in host provider
- Do not store in source control

### Production Build
- Use `NODE_ENV=production`
- Use `JWT_SECRET` and refresh secret production values

### Monitoring
- Health endpoint `/api/health`
- Admin `system-status`, provider metrics
- Backend logs via `logger.ts`

### Maintenance
- Rotate provider keys
- Apply Prisma schema migrations
- Monitor provider usage and costs

---

## 17. VIVA QUESTIONS

1. Why did you choose Next.js?
2. Why React?
3. Why Prisma?
4. Why PostgreSQL?
5. How does streaming work in your app?
6. How does authentication work?
7. How does AI generation work?
8. How does the admin dashboard work?
9. Why use Tailwind CSS?
10. Explain JWT.
11. Explain middleware.
12. Explain environment variables.
13. Explain your architecture.
14. Explain your database design.
15. Explain your API design.
16. Explain deployment architecture.
17. Why do you need provider registry?
18. How do you support multiple AI providers?
19. How do you handle provider failures?
20. What is the fallback HTML generator?
21. How do you protect admin routes?
22. How is optional authentication implemented?
23. Why use rate limiting?
24. How does `backend/src/controllers/aiController.ts` stream data?
25. What is `frontend/src/services/aiService.ts` responsible for?
26. How does the live preview sandbox work?
27. How do you persist project versions?
28. Why use Zustand for state management?
29. What are the advantages of Prisma client?
30. What happens if `DATABASE_URL` is missing?
31. How do you configure CORS?
32. How is admin 2FA implemented?
33. How do you enable user search and pagination?
34. What is the purpose of `AppSettings`?
35. How would you scale this platform?
36. How do you secure provider API keys?
37. How do you test streaming reliability?
38. How do you manage environment configuration?
39. How are generated files exported?
40. Why separate frontend and backend?
41. How is `frontend/src/middleware.ts` different from backend middleware?
42. How does `ProviderFactory.tryGetProvider()` help reliability?
43. What is the role of `PromptHistory`?
44. How do you handle an aborted generation?
45. How do you detect provider connectivity?
46. Why store generation logs?
47. How does `AuditLog` improve security?
48. What is the role of `SystemMetrics`?
49. How does the admin page protect against non-admin users?
50. What future feature would you add first?

### Answer guidance
Each answer should mention concrete code paths and design decisions:
- e.g. `ProviderFactory` for provider abstraction,
- `AIController.generate` for stream handling,
- `middleware/authenticate.ts` for JWT verification,
- `frontend/src/components/workspace/WorkspaceLayout.tsx` for prompt flow,
- `prisma/schema.prisma` for DB model mapping.

---

## 18. CONCLUSION

Cognify-AI demonstrates a practical implementation of an AI-assisted frontend generation platform built with real-world technologies. It successfully integrates secure authentication, multi-provider AI orchestration, streaming generation, live preview, export history, admin controls, and a production-capable folder structure. The project meets the objectives of reducing frontend development effort, supporting provider flexibility, and maintaining a secure audit trail. Current limitations include dependency on external AI providers and code review requirements for generated output. Future enhancements include CI/CD export, automated tests generation, collaborative editing, and extended provider analytics.

> This documentation gives you a complete preparation base for presenting the project in a viva. It references actual files and features from `cognify-ai`, ensuring accuracy and clarity for exam evaluation.
