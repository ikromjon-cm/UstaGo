#!/bin/bash
set -e

BACKUP_DIR="/opt/ustago/backend/backups"
DB_NAME="ustago"
DB_USER="postgres"
DB_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
DB_HOST="localhost"
RETENTION_DAYS=7
RETENTION_WEEKS=4
RETENTION_MONTHS=6
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="ustago_full_${TIMESTAMP}.sql.gz"
FILEPATH="${BACKUP_DIR}/${FILENAME}"

mkdir -p "${BACKUP_DIR}"

export PGPASSWORD="${DB_PASSWORD}"

echo "[$(date)] Starting backup of ${DB_NAME}..."
pg_dump -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" -Z9 -f "${FILEPATH}"
echo "[$(date)] Backup saved: ${FILEPATH}"
SIZE=$(du -h "${FILEPATH}" | cut -f1)
echo "[$(date)] Backup size: ${SIZE}"

# Daily cleanup - keep last 7 days
find "${BACKUP_DIR}" -name "ustago_full_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

# Weekly backup (Sunday)
if [ "$(date +%u)" = "7" ]; then
    cp "${FILEPATH}" "${BACKUP_DIR}/weekly_$(date +%Y%m%d).sql.gz"
    find "${BACKUP_DIR}" -name "weekly_*.sql.gz" -mtime +$((RETENTION_WEEKS * 7)) -delete
fi

# Monthly backup (1st day)
if [ "$(date +%d)" = "01" ]; then
    cp "${FILEPATH}" "${BACKUP_DIR}/monthly_$(date +%Y%m%d).sql.gz"
    find "${BACKUP_DIR}" -name "monthly_*.sql.gz" -mtime +$((RETENTION_MONTHS * 30)) -delete
fi

echo "[$(date)] Backup complete!"
