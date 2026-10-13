#!/usr/bin/env bash
# ==============================================================================
# Mellosoft Zero-Downtime Hostinger VPS Deployment Script
# Branch: Backend_hostinger
# ==============================================================================
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/mellosoft}"
BRANCH="Backend_hostinger"

echo "======================================================================"
echo "Starting Mellosoft VPS Deployment [$(date -u +"%Y-%m-%d %H:%M:%SZ")]"
echo "Target Directory: ${APP_DIR}"
echo "Git Branch:       ${BRANCH}"
echo "======================================================================"

cd "${APP_DIR}"

# 1. Verify environment configuration
if [ ! -f .env ]; then
    echo "ERROR: Production .env file missing in ${APP_DIR}!"
    echo "Please copy .env.example to .env and configure secrets before deploying."
    exit 1
fi

# 2. Pull latest code from Backend_hostinger
echo "Pulling latest code from origin/${BRANCH}..."
git fetch origin "${BRANCH}"
git checkout "${BRANCH}"
git pull origin "${BRANCH}"

# 3. Build & start containers with Docker Compose
echo "Building and starting production containers..."
docker compose build --build-arg BUILDKIT_INLINE_CACHE=1 web
docker compose up -d postgres
echo "Waiting for PostgreSQL database readiness..."
docker compose exec -T postgres sh -c 'until pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do sleep 1; done'

# 4. Run Prisma database migrations
echo "Executing database migrations..."
docker compose run --rm web npx prisma migrate deploy

# 5. Start application and proxy
docker compose up -d --remove-orphans web nginx

# 6. Verify health check
echo "Performing application health verification..."
sleep 5
for i in {1..10}; do
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "SUCCESS: Mellosoft health check passed! (HTTP 200 OK)"
        exit 0
    fi
    echo "Waiting for application startup (attempt ${i}/10)..."
    sleep 3
done

echo "WARNING: Health check timed out after 35 seconds. Inspecting logs:"
docker compose logs --tail=50 web
exit 1
