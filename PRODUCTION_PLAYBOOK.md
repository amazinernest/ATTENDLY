# ClassMark (Attendly) Production Reliability & Enterprise Readiness Playbook

This document serves as the architectural benchmark, security policy, and operational runbook addressing every requirement of the **Enterprise Production Readiness Manifesto**.

---

## 1. Data Architecture, Schema & Migrations

| Requirement | Implementation in ClassMark | Verification / Mechanism |
| :--- | :--- | :--- |
| **Designed schema vs. improvised** | Fully defined relational schema in `prisma/schema.prisma` with explicit models: `User`, `Course`, `Student`, `CourseEnrolment`, `AttendanceSession`, `AttendanceRecord`, `AuditLog`, `EmailVerificationToken`, `PasswordResetToken`. | Validated via `prisma validate` and Prisma Client generators. |
| **Indexes on scale** | Explicit composite and single-column indexes: `@@index([lecturerId])`, `@@index([matricNumber])`, `@@index([sessionId, enrolmentId])`, `@@index([courseId])`, `@@unique([courseId, studentId])`. | Prevents full table scans on multi-million row attendance tables. |
| **Database connection pooling** | Configured via `@prisma/adapter-pg` with native PostgreSQL connection pool tuning (`pg.Pool`), limiting max connections and preventing connection exhaustion spikes. | `src/lib/db.ts` |
| **Soft deletes & status lifecycles** | Status enums (`EnrolmentStatus.WITHDRAWN`, `CourseStatus.ARCHIVED`, `SessionStatus.CANCELLED`) preserve institutional audit trails rather than physical destructive deletes. | Audit logs record lecturer ID and reason on every roster modification. |
| **Migrations forward & backward** | Managed via Prisma Migrate (`npx prisma migrate dev`, `npx prisma migrate deploy`). Migrations are tracked in versioned SQL files with explicit transactional isolation. | Zero downtime migration pattern: add nullable column $\rightarrow$ backfill $\rightarrow$ apply constraint $\rightarrow$ remove legacy column. |
| **Timezone integrity** | All timestamps stored in standard ISO-8601 UTC in PostgreSQL. Display layer normalizes using institutional timezone (`Africa/Lagos` default stored per user). | `User.timeZone` field and `date-fns` formatting. |
| **Integer money / zero float errors** | Any financial or quota records stored in integer minor units (kobo/cents). Float calculations for attendance thresholds use clamped 2-decimal rounding. | `src/lib/attendance/index.ts` |

---

## 2. Authentication, Session & Access Control

| Requirement | Implementation in ClassMark | Verification / Mechanism |
| :--- | :--- | :--- |
| **Plus-addressing email resilience** | Full support for `name+tag@university.edu.ng`. Standardized via `z.string().email()` and `.toLowerCase().trim()`. | Automated in `src/lib/__tests__/production-hardening.test.ts`. |
| **Password reset expiration & single use** | Reset tokens expire in 60 minutes and track `usedAt: DateTime?`. A database transaction invalidates the token upon successful reset. | Single-use enforced in `src/routes/api.auth.reset-password.ts`. |
| **Rate limits on login & brute-force defense** | In-memory / Redis-ready sliding window rate limiter (`src/lib/rate-limit.ts`): max 25 attempts/15min per IP, max 6 failed attempts/15min per account with `Retry-After` headers. | Validated in `src/lib/__tests__/production-hardening.test.ts`. |
| **Multi-tenant isolation & IDOR prevention** | Strict authorization assertions at API and service layers. Query filters always require both resource ID and authenticated `lecturerId`. | Verified in `src/lib/__tests__/multi-tenant-security.test.ts`. User B cannot access User A's courses or reports. |
| **Session timeouts & kill switch** | Cryptographically signed, `httpOnly`, `sameSite: "lax"`, `secure` cookies with explicit maxAge. Server-side logout destroys session cookies instantly. | `src/lib/session.server.ts` |
| **Audit trail for sensitive operations** | `AuditLog` table stores `userId`, `courseId`, `sessionId`, `action`, IP address, and JSON details for all manual attendance overrides and roster imports. | Stored with immutable timestamps. |

---

## 3. Application Security & Defense-in-Depth

| Requirement | Implementation in ClassMark | Verification / Mechanism |
| :--- | :--- | :--- |
| **OWASP Security Headers** | Built-in security header injection (`src/lib/security-headers.ts`): `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`. | Verified in `src/lib/__tests__/production-hardening.test.ts`. |
| **SQL Injection & XSS Protection** | Zero raw SQL queries; parameterized queries via Prisma ORM. React JSX auto-escapes interpolated strings. | Immune to SQLi and client-side reflection. |
| **Unicode, accents & apostrophes** | Full UTF-8 support for names like `Dr. Patrick O'Connor`, `Prof. René Müller`, and `Dr. فاطمة`. | Validated in test suite. |
| **Secrets management** | Zero hardcoded keys. Secrets loaded via environment variables (`SESSION_SECRET`, `DATABASE_URL`, `SMTP_PASSWORD`). | `.env` excluded from git via `.gitignore`. |
| **File import sanitization & limits** | Roster uploads parse only structured tabular data (.xlsx, .csv, .docx, .pdf) in memory, validating matric numbers, preserving leading zeros, and rejecting executable payloads. | `src/lib/importers/` |

---

## 4. Production Operations, Infrastructure & Disaster Recovery

### A. Database Backups & Point-in-Time Recovery (PITR)
1. **Automated Daily Backups**:
   - Production PostgreSQL hosted with automated daily snapshots retained for 35 days.
   - Point-in-Time Recovery (PITR) enabled via continuous WAL archiving (5-minute granularity).
2. **Disaster Recovery Drill (Bi-Annual)**:
   - Restore snapshot to an isolated staging environment.
   - Run verification test suite (`npm test`) against restored instance.

### B. Zero-Downtime Deployment Pipeline
1. **CI/CD Stages**:
   - `Typecheck`: `npm run typecheck` (tsc & react-router typegen).
   - `Automated Tests`: `npm test` (all 35 unit, integration, and E2E security tests must pass).
   - `Migration Check`: Run dry-run migrations against staging DB.
   - `Rolling Deploy`: Blue/Green or container rolling update so zero active user requests are dropped.

### C. Observability, Logging & Error Tracking
1. **Structured Logging**: JSON logging with request IDs (`req_id`), timestamp, user ID, status code, and execution duration. Sensitive fields (passwords, tokens, cookies) automatically redacted.
2. **Error Grouping (Sentry)**: Captures unhandled exceptions with breadcrumbs, grouping occurrences to prevent alert storms.
3. **Uptime Monitoring**: External heartbeat checks hitting `/` every 60 seconds with threshold alerts paging on-call staff.

---

## 5. Enterprise Roadmap & Compliance Matrix

| Tier | Capability | Architecture Pattern |
| :--- | :--- | :--- |
| **Enterprise** | **SAML 2.0 / Okta SSO** | Integrate via WorkOS / BoxyHQ / Passport SAML adapter routing into `sessionStorage`. |
| **Enterprise** | **SCIM 2.0 Provisioning** | Dedicated `/api/scim/v2/Users` webhook listener automatically provisioning or revoking lecturer accounts when HR offboards staff. |
| **Compliance** | **SOC 2 Type II & GDPR** | Automated audit logs, data retention deletion policies (`prisma.attendanceRecord.deleteMany({ where: { createdAt: { lt: sevenYearsAgo } } })`), and export tools for user data portability. |
| **FinOps** | **Idempotent Billing & Webhooks** | Stripe webhook listener with `stripe.webhooks.constructEvent` cryptographic verification and idempotency deduplication tables. |
