# Mellosoft Operations & Disaster Recovery Runbook

---

## 1. Daily Operations & Routine Health Checks

### Check Container Status & Health
```bash
docker compose ps
```
Expected output: All 3 containers (`mellosoft_postgres`, `mellosoft_web`, `mellosoft_nginx`) in status `Up (healthy)`.

### Monitor Real-Time Resource Usage (CPU & RAM)
```bash
docker stats --no-stream
```
Ensure total container memory remains under 1.2 GB to prevent swapping or memory pressure on the 1-2 GB Hostinger VPS.

### Tail Application Logs
```bash
# View last 100 log lines from Next.js server
docker compose logs --tail=100 -f web

# View database query logs or error events
docker compose logs --tail=100 -f postgres

# View Nginx access & error logs
docker compose logs --tail=100 -f nginx
```

---

## 2. Backup Verification & Rehearsal

### Manual On-Demand Backup
```bash
/opt/mellosoft/scripts/backup.sh
```
Backups are created in `/var/backups/mellosoft/`:
- `db_mellosoft_YYYYMMDD_HHMMSS.sql.gz`
- `uploads_YYYYMMDD_HHMMSS.tar.gz`

### Verifying Backup Integrity
```bash
# Verify gzip archive integrity without decompressing
gzip -t /var/backups/mellosoft/db_mellosoft_*.sql.gz
echo "Exit code: $?" # Must return 0
```

---

## 3. Disaster Recovery & Restoration Runbook

In the event of database corruption, data loss, or server migration:

### Step 1: Locate the Latest Verified Dump
```bash
ls -lht /var/backups/mellosoft/
```

### Step 2: Execute Restore Script
```bash
/opt/mellosoft/scripts/restore.sh /var/backups/mellosoft/db_mellosoft_20261013_120000.sql.gz /var/backups/mellosoft/uploads_20261013_120000.tar.gz
```

### Step 3: Run Database Health Check
```bash
docker compose exec postgres psql -U mellosoft_user -d mellosoft -c "SELECT count(*) FROM \"Product\"; SELECT count(*) FROM \"Order\";"
```

### Step 4: Verify API & Storefront
```bash
curl -i http://localhost:3000/api/health
```

---

## 4. Emergency Procedures

### Scenario A: Next.js Container Unresponsive (502 Bad Gateway)
```bash
# Check if container ran out of memory
docker inspect mellosoft_web --format='{{.State.OOMKilled}}'

# Restart application container cleanly
docker compose restart web

# Check startup logs
docker compose logs --tail=30 web
```

### Scenario B: Database Container Unhealthy
```bash
# Check disk space first
df -h

# Check PostgreSQL logs for crash or lock issues
docker compose logs --tail=50 postgres

# Restart database service
docker compose restart postgres
```

### Scenario C: Fast Rollback to Previous Git Commit
If a code deployment causes an unexpected regression:
```bash
cd /opt/mellosoft

# Roll back to previous commit on Backend_hostinger
git log -n 5 --oneline
git checkout HEAD~1

# Rebuild container with previous commit
docker compose build web
docker compose up -d web

# Verify health
curl http://localhost:3000/api/health
```
