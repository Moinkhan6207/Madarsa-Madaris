# Madarsa SaaS - Idara Management System

A production-ready, multi-tenant SaaS platform for managing Madarsa/Idara institutions.

## Monorepo Structure

```
madarsa-saas/
├── backend/          # Node.js + Express + Prisma API
├── frontend/         # Next.js + TypeScript + Tailwind CSS
├── shared/           # Shared types and constants
└── docs/             # Documentation
```

## Quick Start

### 1. Install Dependencies

```bash
cd madarsa-saas
npm run install:all
```

### 2. Setup Environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your NeonDB credentials

# Frontend
cd ../frontend
# Create .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### 3. Setup Database

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4. Run Development Servers

```bash
# Run both backend and frontend
npm run dev

# Or run individually
npm run dev:backend   # Backend on http://localhost:3001
npm run dev:frontend  # Frontend on http://localhost:3000
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run both backend and frontend concurrently |
| `npm run dev:backend` | Run backend only |
| `npm run dev:frontend` | Run frontend only |
| `npm run build` | Build all packages |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

## Backend

The backend is a Node.js/Express API with:
- **TypeScript** - Strict type checking
- **Prisma ORM** - Database management
- **NeonDB PostgreSQL** - Serverless database
- **JWT Authentication** - Secure auth
- **Multi-tenancy** - Tenant isolation
- **RBAC** - Role-based access control

### Backend Structure

```
backend/
├── src/
│   ├── modules/        # Feature modules (tenant, auth, etc.)
│   ├── common/         # Shared middleware, errors, logger
│   ├── config/         # Environment and database config
│   ├── app.ts          # Express app setup
│   └── server.ts       # Server entry point
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── seed.ts         # Seed data
└── package.json
```

## Frontend

The frontend is a Next.js app with:
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **App Router** - Modern Next.js routing

### Frontend Structure

```
frontend/
├── app/                # Next.js app router
├── components/         # React components
├── services/           # API services
├── lib/                # Utilities
└── package.json
```

## Shared

Shared package containing:
- **types/** - TypeScript interfaces used by both backend and frontend
- **constants/** - Shared constants and enums

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Database**: NeonDB PostgreSQL
- **Auth**: JWT tokens
- **Validation**: Zod

## Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=3001
API_PREFIX=/api/v1
DATABASE_URL="postgresql://..."
JWT_SECRET=your-secret
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## License

ISC
