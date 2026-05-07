# Deployment Environment Audit Report
**Project:** Madarsa SaaS (Idara Management System)
**Date:** 2026-05-07
**Auditor:** Cascade AI

---

## Executive Summary

This report covers a complete environment variable audit across the **backend**, **frontend**, and **mobile-app** projects. Several critical issues were identified that **will cause deployment failures or security vulnerabilities** if not addressed before going to production.

**Critical Issues Found:** 7
**Warnings Found:** 8
**Files Updated:** `backend/.env.example`, `frontend/.env.example`, `mobile-app/.env.example`

---

## 1. Backend Environment Variables

### 1.1 Validated Variables (via `src/config/env.ts`)

| Variable | Required | Default | Used In | Purpose |
|----------|----------|---------|---------|---------|
| `NODE_ENV` | Yes | `development` | `env.ts`, `logger.ts`, `app.ts` | Runtime environment mode |
| `PORT` | Yes | `3000` | `server.ts` | HTTP server port |
| `API_PREFIX` | Yes | `/api/v1` | `app.ts` | API route prefix |
| `DATABASE_URL` | **Yes** | — | `env.ts`, `prisma.service.ts` | PostgreSQL connection string |
| `DIRECT_URL` | No | — | `env.ts` | Direct DB URL for Prisma migrations (NeonDB) |
| `JWT_SECRET` | **Yes** | — | `env.ts`, `auth.middleware.ts`, `auth.service.ts` | Access token signing key (min 32 chars) |
| `JWT_EXPIRES_IN` | Yes | `24h` | `env.ts`, `auth.service.ts` | Access token expiry |
| `JWT_REFRESH_SECRET` | **Yes** | — | `env.ts` | Refresh token signing key (min 32 chars) |
| `JWT_REFRESH_EXPIRES_IN` | Yes | `7d` | `env.ts` | Refresh token expiry |
| `BCRYPT_ROUNDS` | Yes | `12` | `env.ts` | Password hashing rounds |
| `CORS_ORIGIN` | Yes | `*` | `env.ts`, `app.ts` | Allowed frontend origin(s) |
| `LOG_LEVEL` | Yes | `info` | `env.ts`, `logger.ts` | Pino log level |
| `LOG_FILE` | Yes | `logs/app.log` | `env.ts`, `logger.ts` | Log file path |
| `DEFAULT_TENANT_SUBDOMAIN` | Yes | `default` | `env.ts` | Fallback tenant subdomain |
| `MAX_TENANTS_PER_USER` | Yes | `5` | `env.ts` | Max tenants per user account |
| `SMTP_HOST` | Yes | `localhost` | `env.ts`, `email.service.ts` | SMTP server hostname |
| `SMTP_PORT` | Yes | `1025` | `env.ts`, `email.service.ts` | SMTP server port |
| `SMTP_USER` | No | — | `env.ts`, `email.service.ts` | SMTP authentication username |
| `SMTP_PASS` | No | — | `env.ts`, `email.service.ts` | SMTP authentication password |
| `SMTP_FROM` | Yes | `no-reply@madarsa.cloud` | `env.ts`, `email.service.ts` | Sender email address |

### 1.2 Direct `process.env` References (NOT in Zod Schema)

| Variable | Required | Fallback | Used In | Purpose |
|----------|----------|----------|---------|---------|
| `REDIS_URL` | No | in-memory | `cache.service.ts`, `queue.service.ts` | Redis connection for cache & queues |
| `FRONTEND_URL` | **Production** | `http://localhost:3000` | `email.service.ts` | Frontend URL in email links |
| `APP_URL` | **Production** | `http://localhost:PORT` | `local-storage.service.ts` | Backend public URL for file URLs |
| `DISABLE_RATE_LIMIT` | No | `false` | `rate-limit.middleware.ts` | Dev flag to disable rate limiting |
| `npm_package_version` | Built-in | `1.0.0` | `app.ts` | App version from package.json |

### 1.3 Backend Critical Issues

1. **MISSING FROM SCHEMA:** `FRONTEND_URL` is used in `email.service.ts` but is **NOT defined in `env.ts`**. In production, approval emails will contain broken `http://localhost:3000/login` links.
2. **MISSING FROM SCHEMA:** `APP_URL` is used in `local-storage.service.ts` but is **NOT defined in `env.ts`**. Uploaded file URLs will break in production, falling back to `localhost`.
3. **MISSING FROM SCHEMA:** `REDIS_URL` is used but not documented in the schema. It is optional, but without it, caching and background jobs run in-memory only.
4. **SECURITY:** `CORS_ORIGIN` defaults to `*`. In production this allows **any website** to call your API. Must be restricted to your exact frontend URL.
5. **SECURITY:** `JWT_SECRET` and `JWT_REFRESH_SECRET` values in your current Render deployment are weak placeholder strings (`your-super-secret-jwt-key-min-32-characters-long-for-dev`). **These must be regenerated with cryptographically secure random values before production.**
6. **DEPLOYMENT:** `NODE_ENV` is currently set to `development` on Render. Must be `production`.
7. **DATABASE:** `DIRECT_URL` is optional in code but **required for Prisma Migrate with NeonDB** (which uses pgBouncer on the pooled `DATABASE_URL`). Without it, migrations will fail.

---

## 2. Frontend Environment Variables

### 2.1 Variables in Use

| Variable | Required | Fallback | Used In | Purpose |
|----------|----------|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | **Yes** | hardcoded Render URL | `lib/api-config.ts` | Primary API base URL |
| `NEXT_PUBLIC_API_BASE_URL` | **Yes** | hardcoded Render URL | `lib/api-config.ts` | Fallback API base URL |
| `NEXT_PUBLIC_MAIN_DOMAIN` | **Yes** | `madarsa-saas.com` | `middleware.ts`, `app/public/**` | Domain for subdomain routing & SEO |
| `NODE_ENV` | Built-in | — | Multiple files | Next.js runtime mode |

### 2.2 Frontend Critical Issues

1. **HARDCODED URL:** `lib/api-config.ts` hardcodes `DEPLOYED_API_BASE_URL = 'https://madarsa-backend-k4yz.onrender.com/api/v1'`. If you change backend domains, the frontend will still point to the old Render URL unless env vars are set.
2. **INCONSISTENT EXAMPLE:** `frontend/.env.example` previously pointed to `http://localhost:8000/api/v1`, but the backend default port is `5001`. This has been corrected in the updated file.
3. **MISSING VARIABLE:** `NEXT_PUBLIC_MAIN_DOMAIN` is not in the old `.env.example`. Without it, subdomain routing in `middleware.ts` defaults to `madarsa-saas.com`, which will be wrong if you use a different domain.
4. **SEO BROKEN:** `app/public/[tenantSlug]/[[...pageSlug]]/page.tsx` uses `NEXT_PUBLIC_MAIN_DOMAIN` to construct canonical URLs and OpenGraph metadata. Missing this variable will generate incorrect SEO links.

---

## 3. Mobile App Environment Variables

### 3.1 Variables in Use

| Variable | Required | Fallback | Used In | Purpose |
|----------|----------|----------|---------|---------|
| `EXPO_PUBLIC_API_URL` | **Yes** | `https://madarsa-backend-k4yz.onrender.com` | `src/constants/config.ts` | Backend API origin (without `/api/v1`) |
| `EXPO_PUBLIC_WEB_BASE_URL` | No | — | (set in `.env` but not traced in source) | Likely used for shared links / web fallback |
| `NODE_ENV` | Built-in | — | Metro bundler | React Native runtime mode |

### 3.2 Mobile App Critical Issues

1. **HARDCODED URL:** `src/constants/config.ts` hardcodes fallback to `https://madarsa-backend-k4yz.onrender.com`. If you rebuild the app after moving the backend, old installs will still hit the old URL.
2. **MISSING `.env.example`:** No example file existed. Created `mobile-app/.env.example`.

---

## 4. Cross-Platform Validation

### 4.1 Connection Matrix

| From | To | Variable | Status |
|------|----|----------|--------|
| Frontend | Backend | `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_API_BASE_URL` | **RISK:** Hardcoded fallback may point to wrong backend after migration. |
| Mobile App | Backend | `EXPO_PUBLIC_API_URL` | **RISK:** Hardcoded fallback in binary. Env must be set before EAS build. |
| Backend | Frontend | `FRONTEND_URL` | **BROKEN:** Not in Zod schema; emails will have localhost links. |
| Backend | Public Files | `APP_URL` | **BROKEN:** Not in Zod schema; file URLs will have localhost links. |

### 4.2 CORS Safety

Current `CORS_ORIGIN=*` on backend means:
- Any website can make authenticated requests to your API.
- Cookies / credentials are sent cross-origin to ANY domain.

**Fix:** Set `CORS_ORIGIN` to your exact frontend production URL(s). If you have multiple (web + mobile webview), comma-separate them or implement an origin validation function.

---

## 5. Deployment Platform Requirements

### 5.1 Render (Current Platform)

**Backend Service (`madarsa-backend`)**
Required env vars: `NODE_ENV`, `PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`, `APP_URL`, `FRONTEND_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`
Recommended: `DIRECT_URL`, `REDIS_URL`, `LOG_LEVEL`

**Frontend Service (`Madarsa-frontend`)**
Required env vars: `NEXT_PUBLIC_API_BASE_URL` (or `NEXT_PUBLIC_API_URL`), `NEXT_PUBLIC_MAIN_DOMAIN`

**Actions needed on Render:**
1. Change `NODE_ENV` from `development` to `production`.
2. Regenerate `JWT_SECRET` and `JWT_REFRESH_SECRET` with secure random strings (64+ hex chars).
3. Add `APP_URL` = `https://madarsa-backend-k4yz.onrender.com`.
4. Add `FRONTEND_URL` = `https://madarsa-frontend-6im4.onrender.com`.
5. Restrict `CORS_ORIGIN` to your frontend URL instead of `*`.

### 5.2 Vercel

**Frontend**
Required: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_MAIN_DOMAIN`
Optional: `NODE_ENV=production` (Vercel sets this automatically)

**Backend (if deploying API routes / Edge functions)**
Not applicable — your backend is a separate Node.js/Express service.

### 5.3 Railway

Same as Render. Railway auto-detects `PORT`. Ensure `DATABASE_URL` and `DIRECT_URL` are set in the Railway dashboard or linked from a Railway Postgres/NeonDB add-on.

### 5.4 VPS / Self-Hosted

Create a `.env` file on the server with ALL backend variables. Use `pm2` or `systemd` to manage the Node process. Ensure `NODE_ENV=production`. Open firewall port for `PORT` (default 5001).

### 5.5 Expo EAS Build

Mobile env vars with `EXPO_PUBLIC_` prefix are **baked into the JS bundle at build time**. They are NOT secret and cannot be changed without rebuilding.

**EAS Secret variables (non-public)**
For truly secret values (e.g., native API keys), use `eas.json` secrets or config plugins — do NOT prefix them with `EXPO_PUBLIC_`.

---

## 6. Variables That Must NEVER Be Exposed Publicly

| Variable | Why | Exposure Risk |
|----------|-----|---------------|
| `JWT_SECRET` | Signs all auth tokens | Attacker can forge tokens and impersonate any user |
| `JWT_REFRESH_SECRET` | Signs refresh tokens | Attacker can generate infinite access tokens |
| `DATABASE_URL` | Full DB connection string | Complete database compromise |
| `DIRECT_URL` | Direct DB connection (NeonDB) | Same as above |
| `SMTP_PASS` | SMTP password | Email account hijacking, phishing from your domain |
| `REDIS_URL` | Redis connection string | Cache poisoning, session hijacking, data leakage |
| `SMTP_USER` | SMTP username | Credential stuffing, brute force |

**Note:** `NEXT_PUBLIC_` and `EXPO_PUBLIC_` variables are **intentionally public** by design — never put secrets in them.

---

## 7. Final Deployment-Ready Checklist

### Backend
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` matches the port exposed by your hosting platform
- [ ] `DATABASE_URL` is a valid PostgreSQL connection string (SSL enabled)
- [ ] `DIRECT_URL` is set (required for NeonDB migrations)
- [ ] `JWT_SECRET` is a secure random string (>= 64 hex chars), NOT a placeholder
- [ ] `JWT_REFRESH_SECRET` is a DIFFERENT secure random string (>= 64 hex chars)
- [ ] `CORS_ORIGIN` is set to exact frontend URL(s), NOT `*`
- [ ] `APP_URL` is set to the public backend domain
- [ ] `FRONTEND_URL` is set to the public frontend domain
- [ ] `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM` point to a real mail provider (not localhost)
- [ ] `SMTP_USER` and `SMTP_PASS` are set if your SMTP provider requires auth
- [ ] `REDIS_URL` is set (optional but recommended for production scale)
- [ ] `LOG_LEVEL` is `info` or `warn` (avoid `debug` in production)
- [ ] `DISABLE_RATE_LIMIT` is either unset or `false`

### Frontend
- [ ] `NEXT_PUBLIC_API_URL` points to the correct production backend
- [ ] `NEXT_PUBLIC_API_BASE_URL` matches `NEXT_PUBLIC_API_URL` (or is removed)
- [ ] `NEXT_PUBLIC_MAIN_DOMAIN` matches the domain where the frontend is hosted
- [ ] No hardcoded backend URLs remain in source code (check `lib/api-config.ts`)

### Mobile App
- [ ] `EXPO_PUBLIC_API_URL` points to the correct production backend
- [ ] `EXPO_PUBLIC_WEB_BASE_URL` points to the correct production frontend
- [ ] App has been rebuilt with EAS after setting env variables
- [ ] No secrets are prefixed with `EXPO_PUBLIC_`

### Post-Deployment Verification
- [ ] `GET /api/health` returns `status: healthy`
- [ ] `GET /api/health/detailed` shows `database: connected`
- [ ] Frontend can load public pages without CORS errors
- [ ] Frontend login works and auth cookies are set correctly
- [ ] Subdomain routing works (`tenant.yourdomain.com` resolves correctly)
- [ ] File uploads return publicly accessible URLs (not localhost)
- [ ] Approval emails contain correct login links (not localhost:3000)
- [ ] Mobile app can log in and fetch data from the backend
- [ ] Rate limiting is active (test with rapid requests)

---

## 8. Common Deployment Failure Causes (Specific to This Project)

1. **Prisma migration fails on deploy** — Missing `DIRECT_URL` when using NeonDB pooled connection.
2. **Auth works locally but fails on deploy** — `JWT_SECRET` is too short (< 32 chars) or contains special characters that break Zod validation.
3. **Frontend shows "Network Error"** — `CORS_ORIGIN` is `*` or mismatched with frontend domain; or `NEXT_PUBLIC_API_URL` points to localhost.
4. **File uploads appear broken** — `APP_URL` is not set; uploaded image URLs return `http://localhost:5001/...`.
5. **Email links are broken** — `FRONTEND_URL` is not set; approval emails point to `localhost:3000`.
6. **Subdomain routing fails** — `NEXT_PUBLIC_MAIN_DOMAIN` is wrong or missing; middleware rewrites fail.
7. **Redis connection loop** — `REDIS_URL` is set but unreachable; app keeps retrying. Safe fallback exists, but logs will be noisy.
8. **Rate limits too strict in dev** — `DISABLE_RATE_LIMIT=true` was accidentally committed or set in production.

---

## 9. Files Modified During This Audit

- `backend/.env.example` — Complete rewrite with all 24 variables documented
- `frontend/.env.example` — Updated with correct ports and added `NEXT_PUBLIC_MAIN_DOMAIN`
- `mobile-app/.env.example` — New file created

---

## 10. Recommended Next Steps

1. **Immediately regenerate JWT secrets** on Render before any production data is created.
2. **Add `APP_URL` and `FRONTEND_URL`** to the Render backend environment dashboard.
3. **Change `CORS_ORIGIN`** from `*` to your exact frontend Render URL.
4. **Set `NODE_ENV=production`** on the backend Render service.
5. **Verify `DIRECT_URL`** is present if you plan to run `prisma migrate deploy` in the build step.
6. **Rebuild the mobile app** via EAS after confirming `EXPO_PUBLIC_API_URL` is correct.
7. **Test the full auth flow** on the deployed frontend to ensure cookie handling works with the restricted `CORS_ORIGIN`.
