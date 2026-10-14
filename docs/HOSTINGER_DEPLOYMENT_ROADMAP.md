# MELLOSOFT HOSTINGER KVM 1 DEPLOYMENT ROADMAP

A step-by-step sequential blueprint for deploying Mellosoft on Hostinger KVM 1 VPS with Ubuntu 24.04 LTS.

---

## Roadmap Phases & Milestones

### Phase 1: Audit Current State
- **Goal:** Comprehensive read-only audit of both local workspace and remote Hostinger VPS.
- **Verification:** Inspect local Git status, package manifests, and run read-only diagnostic commands on VPS.

### Phase 2: Source Code & Configuration Verification
- **Goal:** Ensure all container definitions, migrations, seed scripts, and Nginx reverse proxy configs are aligned with production reality.
- **Verification:** Dockerfile multi-stage builds, Prisma schema, seed imports, and Nginx route definitions.

### Phase 3: Local Pre-Deployment Validation
- **Goal:** Run automated test suites and verify build artifacts before deploying to production.
- **Verification:** 27/27 tests pass across 6 modules; standalone output is produced without errors.

### Phase 4: Hostinger VPS Resource & Readiness Check
- **Goal:** Verify VPS RAM (1-2 GB), swap configuration (at least 2 GB), disk capacity, Docker daemon version, and firewall rules.
- **Verification:** System diagnostics via read-only shell commands.

### Phase 5: Production Environment (.env) Configuration
- **Goal:** Ensure production secrets (`SESSION_SECRET`, `POSTGRES_PASSWORD`, `DATABASE_URL`) are strong, safe from URI encoding bugs, and non-destructive.
- **Verification:** Non-revealing inspection of variable existence in `/opt/mellosoft/.env`.

### Phase 6: Database Persistence & Volume Architecture
- **Goal:** Confirm PostgreSQL volume `mellosoft_postgres_data` is mounted to persistent storage on the Hostinger NVMe SSD.
- **Verification:** Docker volume inspection and database ping checks.

### Phase 7: Controlled VPS Deployment
- **Goal:** Pull latest commit `58447e8`, build image using BuildKit cache, push schema, execute seed script, and launch services.
- **Verification:** `docker compose ps` shows all 3 services `Up` and `healthy`.

### Phase 8: Public IP Smoke Test & Accessibility
- **Goal:** Verify external HTTP access via `http://200.97.163.121`.
- **Verification:** `curl -I http://200.97.163.121/` returns `200 OK`; browser displays luxury storefront.

### Phase 9: Domain & SSL Setup (Optional / Deferred)
- **Goal:** Transition from IP-based testing to custom domain (`mellosoft.in`) with automated Let's Encrypt TLS certificates.
- **Verification:** Certbot dry-run and browser SSL lock icon verification.

### Phase 10: Production Smoke Tests
- **Goal:** Verify core customer and administrative user journeys end-to-end on the live server.
- **Verification:** Storefront browse -> Cart add -> Checkout flow -> Admin authentication -> Catalog update.

### Phase 11: Automated Backups, Monitoring & Recovery
- **Goal:** Verify `scripts/backup.sh` creates timestamped pg_dump archives and log rotation prevents disk filling.
- **Verification:** Test restoration into a temporary database container.

### Phase 12: Final Release Gate Sign-Off
- **Goal:** Deliver final comprehensive deployment report to the operator.
