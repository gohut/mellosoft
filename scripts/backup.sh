#!/usr/bin/env bash
# ==============================================================================
# Mellosoft Automated Production Backup Script
# Performs atomic PostgreSQL dumps and uploads tarballs with 14-day retention.
# ==============================================================================
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/mellosoft}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_CONTAINER="${DB_CONTAINER:-mellosoft_postgres}"
POSTGRES_USER="${POSTGRES_USER:-mellosoft_user}"
POSTGRES_DB="${POSTGRES_DB:-mellosoft}"

mkdir -p "${BACKUP_DIR}"

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Starting Mellosoft backup..."

# 1. Backup PostgreSQL Database
DB_BACKUP_FILE="${BACKUP_DIR}/db_${POSTGRES_DB}_${TIMESTAMP}.sql.gz"
echo "Dumping database ${POSTGRES_DB} to ${DB_BACKUP_FILE}..."
docker exec -t "${DB_CONTAINER}" pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" --clean --if-exists | gzip -9 > "${DB_BACKUP_FILE}"
echo "Database dump complete: $(ls -lh "${DB_BACKUP_FILE}" | awk '{print $5}')"

# 2. Backup Uploaded Files Volume
UPLOADS_BACKUP_FILE="${BACKUP_DIR}/uploads_${TIMESTAMP}.tar.gz"
if docker volume inspect mellosoft_uploads_data > /dev/null 2>&1; then
    echo "Archiving uploaded files from docker volume..."
    docker run --rm -v mellosoft_uploads_data:/data:ro -v "${BACKUP_DIR}":/backup alpine tar -czf "/backup/uploads_${TIMESTAMP}.tar.gz" -C /data .
    echo "Uploads archive complete: $(ls -lh "${UPLOADS_BACKUP_FILE}" | awk '{print $5}')"
fi

# 3. Retention policy: Remove backups older than 14 days
echo "Purging backups older than 14 days..."
find "${BACKUP_DIR}" -type f -name "*.gz" -mtime +14 -delete

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Backup completed successfully."
