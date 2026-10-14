# MELLOSOFT HOSTINGER KVM 1 DEPLOYMENT LOG

Historical operational log capturing all deployment events, diagnostics, discovered issues, and resolutions.

---

## Deployment Event Log

### [2026-10-14 09:30 UTC+05:30] — Initial VPS Deployment Attempt
* **Action:** Operator executed `./scripts/deploy.sh` on Hostinger VPS (`srv2050621`).
* **Result:** Image built successfully in 211s, PostgreSQL started, but migration failed.
* **Error:** `Error: P1013: The provided database string is invalid. invalid port number in database URL.`
* **Root Cause:** Password generated via `openssl rand -base64` contained a `/` (`AZOs/R73...`). RFC 3986 URL parsing treats `/` as path delimiter, prematurely ending authority parsing.
* **Fix Applied:** Documented URL encoding (`%2F`) or hex password generation (`openssl rand -hex 20`). Updated `.env.example` to recommend `-hex 24`. Commit `4a0cd8a`.

### [2026-10-14 09:50 UTC+05:30] — Second VPS Deployment Attempt
* **Action:** Operator ran `docker compose down -v` and re-ran `./scripts/deploy.sh`.
* **Result:** Database connected successfully (`Datasource "db": PostgreSQL database "mellosoft"`).
* **Errors Discovered:**
  1. `seed.mjs` failed: `Cannot find module '/app/src/data/rolesData.js' imported from /app/prisma/seed.mjs`. Root cause: Multi-stage Dockerfile did not copy `/app/src` into runner stage.
  2. Health check timed out on `localhost:3000`: In `docker-compose.yml`, web port 3000 was only exposed internally on Docker bridge; only Nginx port 80/443 was published to host.
  3. Nginx 301 redirect: Port 80 redirected all requests to HTTPS, causing curl on raw IP to fail against self-signed cert.
* **Fix Applied:** Commit `58447e8`:
  - Added `COPY --from=builder --chown=nextjs:nodejs /app/src ./src` to Dockerfile runner.
  - Replaced migration with `prisma db push` for deterministic schema creation.
  - Proxied port 80 directly to Next.js upstream in Nginx for frictionless IP access.
  - Bound `127.0.0.1:3000:3000` on web service for local host-level health verification.

### [2026-10-14 10:15 UTC+05:30] — Git Merge Conflict on VPS
* **Action:** Operator ran `./scripts/deploy.sh`.
* **Result:** `git pull` aborted: `error: Your local changes to the following files would be overwritten by merge: scripts/deploy.sh`.
* **Root Cause:** Local file permissions or modifications to `scripts/deploy.sh` on the VPS prevented automatic fast-forward merge.
* **Resolution Required:** Run `git checkout -- scripts/` on VPS before pulling.

### [2026-10-14 10:20 UTC+05:30] — Formal Audit & Release Management Setup
* **Action:** Created formal deployment tracking artifacts:
  - `docs/HOSTINGER_DEPLOYMENT_STATUS.md`
  - `docs/HOSTINGER_DEPLOYMENT_ROADMAP.md`
  - `docs/HOSTINGER_DEPLOYMENT_LOG.md`
* **Test Verification:** Executed `npm test` on local repository. All 27 tests across 6 test suites passed (0 failures).

### [2026-10-14 10:35 UTC+05:30] — Root Cause Discovered: Missing Customer Table & Migrations
* **Action:** Investigated why `public.Customer` table was missing and Prisma reported "No migration found".
* **Root Cause:** `.gitignore` line 22 contained `*.sql`. This ignored `frontend/prisma/migrations/20261013000000_init/migration.sql`, preventing it from ever being committed to GitHub. When the VPS ran `prisma migrate deploy`, no SQL migration existed to execute, leaving PostgreSQL without any tables.
* **Fix Applied:** Commit `bc26943`:
  - Added `!**/prisma/migrations/**/*.sql` exception to `.gitignore`.
  - Added and committed `frontend/prisma/migrations/20261013000000_init/migration.sql` (630 lines creating all 24 models including `Customer`).
  - Updated `scripts/deploy.sh` to run `prisma migrate deploy || prisma db push --skip-generate` as a robust dual-stage schema initialization.
