#!/usr/bin/env bash
# ==============================================================================
# Mellosoft Production Restore Script
# Restores a PostgreSQL dump and uploads tarball.
# ==============================================================================
set -euo pipefail

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <path_to_db_dump.sql.gz> [path_to_uploads.tar.gz]"
    exit 1
fi

DB_DUMP="$1"
UPLOADS_ARCHIVE="${2:-}"
DB_CONTAINER="${DB_CONTAINER:-mellosoft_postgres}"
POSTGRES_USER="${POSTGRES_USER:-mellosoft_user}"
POSTGRES_DB="${POSTGRES_DB:-mellosoft}"

if [ ! -f "${DB_DUMP}" ]; then
    echo "Error: Database dump file not found: ${DB_DUMP}"
    exit 1
fi

echo "======================================================================"
echo "WARNING: Restoring will overwrite existing data in '${POSTGRES_DB}'!"
echo "Target dump: ${DB_DUMP}"
echo "======================================================================"
read -r -p "Are you sure you want to proceed? [y/N] " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Restore aborted by user."
    exit 0
fi

echo "Restoring database..."
gunzip -c "${DB_DUMP}" | docker exec -i "${DB_CONTAINER}" psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}"
echo "Database restore completed."

if [ -n "${UPLOADS_ARCHIVE}" ] && [ -f "${UPLOADS_ARCHIVE}" ]; then
    echo "Restoring uploads volume from ${UPLOADS_ARCHIVE}..."
    docker run --rm -v mellosoft_uploads_data:/data -v "$(dirname "${UPLOADS_ARCHIVE}")":/backup alpine sh -c "tar -xzf /backup/$(basename "${UPLOADS_ARCHIVE}") -C /data"
    echo "Uploads volume restored."
fi

echo "Restarting application container to refresh pool..."
docker compose restart web

echo "Restore rehearsal completed successfully."
