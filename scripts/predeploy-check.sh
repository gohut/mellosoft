#!/usr/bin/env bash
# ==============================================================================
# Mellosoft Production Pre-Deployment Validation Script
# Inspects environment configuration safely WITHOUT revealing secret values.
# ==============================================================================
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/mellosoft}"
cd "${APP_DIR}"

echo "======================================================================"
echo "Mellosoft Pre-Deployment Safety & Readiness Audit"
echo "Timestamp: $(date -u +"%Y-%m-%d %H:%M:%SZ")"
echo "Target:    ${APP_DIR}"
echo "======================================================================"

ERRORS=0
WARNINGS=0

# 1. Verify .env file presence
if [ ! -f .env ]; then
    echo "❌ CRITICAL: .env file is missing in ${APP_DIR}!"
    exit 1
else
    echo "✔ Found .env configuration file."
fi

# Helper to check variable existence without revealing value
check_var() {
    local var_name="$1"
    local required="$2"
    if grep -q -E "^${var_name}=" .env && [ -n "$(grep -E "^${var_name}=" .env | cut -d= -f2-)" ]; then
        echo "  ✔ ${var_name}: Present"
    else
        if [ "$required" = "true" ]; then
            echo "  ❌ MISSING REQUIRED: ${var_name}"
            ERRORS=$((ERRORS + 1))
        else
            echo "  ⚠ OPTIONAL NOT SET: ${var_name}"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
}

echo ""
echo "--- 1. Core Runtime Variables ---"
check_var "NODE_ENV" "true"
check_var "PORT" "true"
check_var "APP_URL" "true"
check_var "SESSION_SECRET" "true"

echo ""
echo "--- 2. Database Variables ---"
check_var "POSTGRES_DB" "true"
check_var "POSTGRES_USER" "true"
check_var "POSTGRES_PASSWORD" "true"
check_var "DATABASE_URL" "true"

# Check for unencoded slash in DATABASE_URL if password contains slash
DB_URL_VAL=$(grep -E "^DATABASE_URL=" .env | cut -d= -f2-)
DB_PASS_VAL=$(grep -E "^POSTGRES_PASSWORD=" .env | cut -d= -f2-)
if [[ "$DB_PASS_VAL" == *"/"* ]] && [[ "$DB_URL_VAL" != *"%2F"* ]]; then
    echo "  ❌ WARNING: POSTGRES_PASSWORD contains '/' which must be encoded as '%2F' in DATABASE_URL!"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "--- 3. Optional Integrations ---"
check_var "RAZORPAY_KEY_ID" "false"
check_var "RAZORPAY_KEY_SECRET" "false"
check_var "STRIPE_PUBLISHABLE_KEY" "false"
check_var "STRIPE_SECRET_KEY" "false"
check_var "SMTP_HOST" "false"
check_var "SMTP_USER" "false"

echo ""
echo "--- 4. Docker & Host Readiness ---"
if command -v docker &> /dev/null; then
    echo "  ✔ Docker CLI: $(docker --version)"
else
    echo "  ❌ Docker CLI not found!"
    ERRORS=$((ERRORS + 1))
fi

if docker compose version &> /dev/null; then
    echo "  ✔ Docker Compose: $(docker compose version)"
else
    echo "  ❌ Docker Compose not found!"
    ERRORS=$((ERRORS + 1))
fi

# Disk space check
AVAIL_DISK=$(df -BG "${APP_DIR}" | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "${AVAIL_DISK}" -lt 2 ]; then
    echo "  ❌ Low disk space: Only ${AVAIL_DISK}GB available (minimum 2GB recommended)."
    ERRORS=$((ERRORS + 1))
else
    echo "  ✔ Disk space available: ${AVAIL_DISK}GB"
fi

# RAM check
AVAIL_RAM=$(free -m | awk '/^Mem:/{print $7}')
if [ "${AVAIL_RAM}" -lt 256 ]; then
    echo "  ⚠ Low available RAM: ${AVAIL_RAM}MB available."
    WARNINGS=$((WARNINGS + 1))
else
    echo "  ✔ Available RAM: ${AVAIL_RAM}MB"
fi

echo ""
echo "======================================================================"
if [ "$ERRORS" -gt 0 ]; then
    echo "❌ AUDIT FAILED with ${ERRORS} critical error(s) and ${WARNINGS} warning(s)."
    echo "Please resolve the missing variables before running deployment."
    exit 1
else
    echo "✔ PRE-DEPLOYMENT AUDIT PASSED with ${WARNINGS} non-blocking warning(s)."
    echo "System is ready for safe deployment."
    exit 0
fi
