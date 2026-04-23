# Idara Management System API

A production-ready, multi-tenant SaaS backend for managing Madarsa/Idara institutions. Built with Node.js, Express, TypeScript, Prisma ORM, and NeonDB PostgreSQL.

## Features

- **Multi-tenant Architecture**: Isolated data for each institution
- **Role-Based Access Control (RBAC)**: Granular permissions system
- **NeonDB PostgreSQL**: Serverless database with SSL and connection pooling
- **TypeScript**: Full type safety and strict mode
- **Prisma ORM**: Modern database toolkit with migrations
- **JWT Authentication**: Secure token-based authentication
- **Comprehensive Error Handling**: Structured error responses
- **Audit Logging**: Track all system actions
- **Modular Monolith**: Clean, maintainable architecture

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript (strict mode)
- **ORM**: Prisma
- **Database**: PostgreSQL (NeonDB)
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Logging**: Pino
- **Testing**: Jest

## Project Structure

```
src/
├── modules/
│   └── tenant/              # Tenant module (example)
│       ├── controllers/    # HTTP request handlers
│       ├── services/       # Business logic
│       ├── repositories/   # Database operations
│       ├── routes/         # Route definitions
│       ├── dto/            # Data Transfer Objects
│       ├── validators/     # Input validation
│       ├── mappers/        # Entity/DTO mapping
│       ├── types/          # Module-specific types
│       └── constants/      # Module constants
├── common/
│   ├── middleware/         # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── tenant-context.middleware.ts
│   │   ├── permission.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── request-context.middleware.ts
│   ├── errors/            # Custom error classes
│   ├── logger/            # Pino logging setup
│   ├── utils/             # Utility functions
│   └── types/             # Shared types
├── config/
│   ├── env.ts             # Environment validation
│   └── prisma.service.ts  # Singleton Prisma client
├── app.ts                 # Express application setup
└── server.ts              # Server bootstrap

prisma/
├── schema.prisma          # Database schema
├── seed.ts                # Database seeding
└── migrations/            # Migration files
```

## Prerequisites

- Node.js 20+
- NeonDB PostgreSQL account (or local PostgreSQL)
- npm or yarn

## Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd "Madarsa : Idara"
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
# Edit .env with your NeonDB credentials
```

Example `.env`:
```env
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1

# NeonDB PostgreSQL (with SSL and PgBouncer)
DATABASE_URL="postgresql://user:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# JWT Secrets (generate secure random strings)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-characters-long

# Security
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with initial data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

### 5. Health Check

```bash
curl http://localhost:3000/api/health
```

## Database Schema

### Core Entities

- **Tenant**: Multi-tenant container
- **User**: Platform users with authentication
- **Role**: User roles per tenant
- **Permission**: Granular permission definitions
- **Branch**: Institution branches
- **AcademicSession**: Academic year management
- **Plan**: Subscription plans
- **AuditLog**: Activity tracking

### Enums

- `TenantStatus`: PENDING | ACTIVE | SUSPENDED | CANCELLED | PENDING_DELETION
- `InstitutionType`: MADRASA | ISLAMIC_SCHOOL | IDARA | DARUL_ULOOM | etc.
- `UserType`: SYSTEM_ADMIN | TENANT_ADMIN | TEACHER | STUDENT | etc.

## API Endpoints

### Health
- `GET /api/health` - Health check
- `GET /api/health/detailed` - Detailed health with DB status

### Tenants (Example Module)
- `GET /api/v1/tenants` - List all tenants (admin)
- `POST /api/v1/tenants` - Create tenant
- `GET /api/v1/tenants/:id` - Get tenant by ID
- `GET /api/v1/tenants/subdomain/:subdomain` - Get tenant by subdomain
- `PATCH /api/v1/tenants/:id` - Update tenant
- `DELETE /api/v1/tenants/:id` - Delete tenant
- `POST /api/v1/tenants/:id/verify` - Verify tenant
- `GET /api/v1/tenants/check-subdomain/:subdomain` - Check availability

### Authentication (to be implemented)
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - User logout

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with initial data |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run Jest tests |

## Security Features

- **Password Hashing**: bcrypt with configurable rounds
- **JWT Tokens**: Access and refresh tokens with expiration
- **CORS**: Configurable origin restrictions
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Parameterized queries via Prisma
- **Audit Logging**: All mutations are tracked
- **Sensitive Data Redaction**: Passwords and tokens are redacted in logs

## Multi-tenancy

Tenant context is derived from the authenticated user's JWT token. The system enforces tenant isolation through:

1. **Tenant Context Middleware**: Attaches tenant info from JWT
2. **Database-Level Isolation**: All queries filter by tenantId
3. **Permission System**: Role-based access within tenant context
4. **Feature Flags**: Per-tenant feature enabling

## NeonDB Configuration

The database connection string must include:
- `sslmode=require` - Required for NeonDB
- `pgbouncer=true` - Enable connection pooling

Example:
```
postgresql://user:pass@host/db?sslmode=require&pgbouncer=true
```

## License

ISC

## Contributing

Contributions welcome! Please read the contributing guidelines before submitting PRs.
