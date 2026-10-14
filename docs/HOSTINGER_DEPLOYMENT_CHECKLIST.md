# MELLOSOFT HOSTINGER KVM 1 DEPLOYMENT CHECKLIST

Step-by-step verification checklist for release on Hostinger VPS (`200.97.163.121`).

---

## Pre-Deployment Verification (Local)
- [x] Branch created: `mellosoft-production-ready` (based on `9822252`)
- [x] `.env` and secret files protected in `.gitignore`
- [x] `migration.sql` unignored and committed under `frontend/prisma/migrations/20261013000000_init/`
- [x] Dockerfile runner copies `src/` for `prisma/seed.mjs`
- [x] Turbopack production build succeeds for all 70 static and dynamic routes
- [x] Unit & integration test suite passes (27/27 tests across 6 modules)
- [x] `scripts/predeploy-check.sh` created and tested
- [x] `docker-compose.yml` configured with 1.28 GB RAM limit and `127.0.0.1:3000` mapping
- [x] Nginx port 80 configured for direct HTTP proxying (no SSL error on IP)

---

## Server Deployment Verification (Hostinger VPS)
- [ ] Run pre-deployment validation: `./scripts/predeploy-check.sh`
- [ ] Take pre-migration database snapshot to `backups/`
- [ ] Verify backup file exists and size is > 0
- [ ] Check out `mellosoft-production-ready` branch
- [ ] Pull latest changes: `git pull origin mellosoft-production-ready`
- [ ] Run zero-downtime deployment: `./scripts/deploy.sh`
- [ ] Verify `docker compose ps` shows 3 containers running and healthy
- [ ] Check database schema: verify `"Customer"` and 23 other tables exist
- [ ] Verify seed initialization: confirm default roles and catalog products present

---

## Post-Deployment Smoke Tests (Browser & Network)
- [ ] `curl -s http://localhost/api/health` returns `status: "healthy"` and `database.ok: true`
- [ ] Open `http://200.97.163.121` in browser: Luxury storefront loads with high-res assets
- [ ] Open `http://200.97.163.121/mattresses`: Products and variant selectors render
- [ ] Customer registration: Create new test account at `http://200.97.163.121/signup`
- [ ] Customer login: Log in at `http://200.97.163.121/login`
- [ ] Cart flow: Add mattress to cart and verify subtotal calculation
- [ ] Checkout flow: Proceed to checkout with Cash on Delivery (COD)
- [ ] Admin portal: Log in at `http://200.97.163.121/admin/login`
- [ ] Admin dashboard: View order metrics and customer list
