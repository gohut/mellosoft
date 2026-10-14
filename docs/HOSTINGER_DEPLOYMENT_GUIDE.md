# MELLOSOFT HOSTINGER KVM 1 DEPLOYMENT GUIDE

A production-grade, step-by-step deployment and operations manual for Hostinger KVM 1 VPS running Ubuntu 24.04 LTS.

---

## 1. System Requirements & Architecture

* **Host Machine:** Hostinger KVM 1 VPS (Ubuntu 24.04 LTS, 1 vCPU, 3.8 GiB RAM, 2.0 GiB Swap)
* **Public IPv4:** `200.97.163.121`
* **Application Path:** `/opt/mellosoft`
* **Service Architecture:**
  * `mellosoft_nginx` (Port 80/443 Reverse Proxy, 128 MB RAM Limit)
  * `mellosoft_web` (Next.js 16 Standalone, Port 3000, 768 MB RAM Limit)
  * `mellosoft_postgres` (PostgreSQL 16 Alpine, Internal Port 5432, 384 MB RAM Limit)
* **Total Resource Ceiling:** 1.28 GB RAM (leaves ~2.5 GB RAM free for OS, buffer cache, and Docker daemon).

---

## 2. Environment Configuration (`.env`)

Before running deployment, ensure `/opt/mellosoft/.env` contains the following required variables:

```dotenv
# Core Runtime
NODE_ENV=production
PORT=3000
APP_URL=http://200.97.163.121
NEXT_PUBLIC_APP_URL=http://200.97.163.121

# Security
SESSION_SECRET=paste_64_character_hex_random_secret

# Database
POSTGRES_DB=mellosoft
POSTGRES_USER=mellosoft_user
POSTGRES_PASSWORD=your_hex_database_password
DATABASE_URL=postgresql://mellosoft_user:your_hex_database_password@postgres:5432/mellosoft?schema=public

# Optional Integrations (can leave blank for initial launch)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=orders@mellosoft.in
```

> [!IMPORTANT]
> If `POSTGRES_PASSWORD` contains `/`, it must be URL-encoded as `%2F` in `DATABASE_URL`. Prefer generating passwords using `openssl rand -hex 24` to avoid special character escaping.

---

## 3. Pre-Deployment Validation

On your Hostinger VPS, run the non-destructive safety audit:

```bash
cd /opt/mellosoft
chmod +x scripts/*.sh
./scripts/predeploy-check.sh
```

**Expected Output:**
```text
✔ Found .env configuration file.
✔ NODE_ENV: Present
✔ DATABASE_URL: Present
✔ Docker CLI: Docker version 27.x
✔ PRE-DEPLOYMENT AUDIT PASSED
```

---

## 4. Safe Database Backup

Before applying new migrations or rebuilding containers:

```bash
mkdir -p /opt/mellosoft/backups
docker compose exec -T postgres pg_dump -U mellosoft_user mellosoft > /opt/mellosoft/backups/backup_$(date +%Y%m%d_%H%M%S).sql
ls -lh /opt/mellosoft/backups/
```

Verify that the backup file exists and is preserved alongside any previous backup files without overwriting.

---

## 5. Database State & Migration Strategy

### Case A: Fresh / Unmigrated Database (Current VPS State)
* **Inspection Findings:** The current PostgreSQL volume contains only an empty `_prisma_migrations` table with 0 applied migration records and 0 business tables.
* **Migration Mechanism:** `prisma migrate deploy` reads `prisma/migrations/20261013000000_init/migration.sql`. It creates all 24 models (including `"Customer"`, `"Product"`, `"Order"`, `"AdminUser"`), records `20261013000000_init` in `_prisma_migrations`, and completes without modifying volume mounts.
* **Seeding:** `node prisma/seed.mjs` executes immediately after migration, populating default system roles, categories, and master mattress catalog using idempotent `upsert` queries.

### Case B: Existing Database with Live Customer Data (Future Updates)
* **Preservation Policy:** `prisma migrate deploy` never drops or truncates existing tables. It checks `_prisma_migrations` and only applies newly added, unapplied migration folders in chronological order.
* **Seeding Safety:** `node prisma/seed.mjs` checks `findUnique` on existing admin users and `findFirst` on product images, ensuring existing user passwords and uploaded files are never overwritten.

---

## 6. Deployment Execution

To pull the production-ready branch and execute the deployment:

```bash
cd /opt/mellosoft

# 1. Fetch all remote branches
git fetch origin

# 2. Checkout the production-ready branch
git checkout mellosoft-production-ready
git pull origin mellosoft-production-ready

# 3. Execute zero-downtime deployment script
./scripts/deploy.sh
```

### What `deploy.sh` Does Automatically:
1. Validates `.env` presence.
2. Builds the Next.js standalone container using BuildKit cache.
3. Starts the PostgreSQL container and waits for `pg_isready`.
4. Executes `prisma migrate deploy` with strict exit-on-error (aborting immediately if migration fails).
5. Runs idempotent database seeding (`node prisma/seed.mjs`) with strict error reporting.
6. Starts Nginx with direct HTTP port 80 proxying.
7. Probes `http://127.0.0.1:3000/api/health` and `http://localhost/api/health` until HTTP 200 OK is confirmed.

---

## 7. Verification & Health Monitoring

### 1. Check Container States
```bash
docker compose ps
```
All 3 containers should report `Up` and `healthy`:
* `mellosoft_nginx` (0.0.0.0:80, 0.0.0.0:443)
* `mellosoft_web` (127.0.0.1:3000, healthy)
* `mellosoft_postgres` (healthy)

### 2. Verify Database Tables
```bash
docker compose exec -T postgres psql -U mellosoft_user -d mellosoft -c "\dt"
```
You should see all 24 tables, including `"Customer"`, `"Product"`, `"Order"`, `"AdminUser"`, and `"_prisma_migrations"`.

### 3. Curl Health API
```bash
curl -s http://localhost/api/health | jq .
```
Expected response:
```json
{
  "status": "healthy",
  "service": "mellosoft-api",
  "database": {
    "ok": true,
    "latencyMs": 2
  }
}
```

### 4. External Browser Verification
* **Customer Storefront:** `http://200.97.163.121`
* **Admin Dashboard:** `http://200.97.163.121/admin`

---

## 8. HTTP vs. HTTPS Policy & Domain Transition

* **Initial Mode (IP Testing):** 
  Traffic runs strictly over HTTP on Port 80 (`http://200.97.163.121`). 
  The self-signed certificate on Port 443 is strictly an internal placeholder to allow Nginx's TLS engine to boot without crashing. **Do not use `https://200.97.163.121` for testing**, as browsers will correctly reject self-signed certificates on IP addresses.
* **Production HTTPS Mode (With Custom Domain):**
  Once your domain DNS A-record (e.g., `mellosoft.in`) points to `200.97.163.121`:
  1. Update `APP_URL=https://mellosoft.in` in `.env`.
  2. Issue a real Let's Encrypt certificate:
     ```bash
     docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d mellosoft.in -d www.mellosoft.in --email admin@mellosoft.in --agree-tos --no-eff-email
     ```
  3. Symlink the live certificates into `/etc/letsencrypt/live/default/`:
     ```bash
     docker compose exec nginx sh -c 'ln -sf /etc/letsencrypt/live/mellosoft.in/* /etc/letsencrypt/live/default/'
     docker compose exec nginx nginx -s reload
     ```

---

## 9. Rollback & Disaster Recovery

### Rollback Code Version:
```bash
cd /opt/mellosoft
git checkout <previous_commit_hash>
./scripts/deploy.sh
```

### Restore Database Backup:
```bash
# Drop current schema and restore from verified backup file
docker compose exec -T postgres psql -U mellosoft_user -d mellosoft -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
cat /opt/mellosoft/backups/<backup_filename>.sql | docker compose exec -T postgres psql -U mellosoft_user -d mellosoft
```
