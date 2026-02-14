#!/bin/bash
# =============================================================================
# PsyFit - DB リストアスクリプト
# =============================================================================
# 用途: バックアップファイルからの PostgreSQL データベース復元
# 実行: bin/restore.sh <backup_file.sql.gz>
# 例:   bin/restore.sh /var/backups/psyfit/psyfit_production_20260214_020000.sql.gz
# =============================================================================

set -euo pipefail

# --- 設定 ---
BACKUP_DIR="/var/backups/psyfit"
DB_CONTAINER="psyfit-db"
DB_USER="psyfit_prod"
DB_NAME="psyfit_production"
LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')]"

# --- 関数 ---
log_info() {
  echo "${LOG_PREFIX} [INFO] $1"
}

log_error() {
  echo "${LOG_PREFIX} [ERROR] $1" >&2
}

show_usage() {
  echo "Usage: bin/restore.sh <backup_file.sql.gz>"
  echo ""
  echo "Arguments:"
  echo "  backup_file    Path to .sql.gz backup file"
  echo ""
  echo "Options:"
  echo "  --list         List available backups"
  echo "  --latest       Restore from the latest backup"
  echo "  --help         Show this help message"
  echo ""
  echo "Examples:"
  echo "  bin/restore.sh /var/backups/psyfit/psyfit_production_20260214_020000.sql.gz"
  echo "  bin/restore.sh --list"
  echo "  bin/restore.sh --latest"
}

list_backups() {
  echo "Available backups in ${BACKUP_DIR}:"
  echo ""
  if [ -d "$BACKUP_DIR" ]; then
    ls -lhS "$BACKUP_DIR"/psyfit_production_*.sql.gz 2>/dev/null || echo "  No backups found."
  else
    echo "  Backup directory does not exist."
  fi
}

# --- 引数チェック ---
if [ $# -eq 0 ]; then
  show_usage
  exit 1
fi

case "$1" in
  --help|-h)
    show_usage
    exit 0
    ;;
  --list|-l)
    list_backups
    exit 0
    ;;
  --latest)
    BACKUP_FILE=$(ls -t "$BACKUP_DIR"/psyfit_production_*.sql.gz 2>/dev/null | head -1)
    if [ -z "$BACKUP_FILE" ]; then
      log_error "No backup files found in ${BACKUP_DIR}"
      exit 1
    fi
    log_info "Using latest backup: ${BACKUP_FILE}"
    ;;
  *)
    BACKUP_FILE="$1"
    ;;
esac

# --- バリデーション ---
if [ ! -f "$BACKUP_FILE" ]; then
  log_error "Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
  log_error "DB container '${DB_CONTAINER}' is not running."
  exit 1
fi

# --- 確認プロンプト ---
FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo ""
echo "========================================"
echo "  PsyFit Database Restore"
echo "========================================"
echo ""
echo "  Backup file : ${BACKUP_FILE}"
echo "  File size   : ${FILE_SIZE}"
echo "  Database    : ${DB_NAME}"
echo "  Container   : ${DB_CONTAINER}"
echo ""
echo "  WARNING: This will OVERWRITE the current database!"
echo "  All existing data will be LOST."
echo ""
echo "========================================"
echo ""
read -p "Are you sure you want to proceed? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  log_info "Restore cancelled by user."
  exit 0
fi

# --- リストア実行 ---

# 1. 事前バックアップ（安全策）
PRE_RESTORE_BACKUP="${BACKUP_DIR}/pre_restore_${DB_NAME}_$(date +%Y%m%d_%H%M%S).sql.gz"
log_info "Creating pre-restore backup: ${PRE_RESTORE_BACKUP}"
docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --no-owner --no-privileges | gzip > "$PRE_RESTORE_BACKUP"
log_info "Pre-restore backup created."

# 2. 既存の接続を切断してDBを再作成
log_info "Dropping and recreating database: ${DB_NAME}"
docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d postgres -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();" \
  > /dev/null 2>&1 || true

docker exec "$DB_CONTAINER" dropdb -U "$DB_USER" --if-exists "$DB_NAME"
docker exec "$DB_CONTAINER" createdb -U "$DB_USER" "$DB_NAME"

# 3. バックアップからリストア
log_info "Restoring from: ${BACKUP_FILE}"
gunzip -c "$BACKUP_FILE" | docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" --quiet

if [ $? -eq 0 ]; then
  log_info "Restore completed successfully."
  echo ""
  echo "Next steps:"
  echo "  1. Verify the application: curl -s https://psytech.jp/api/v1/health"
  echo "  2. Check data integrity in the admin panel"
  echo "  3. If issues found, restore pre-restore backup:"
  echo "     bin/restore.sh ${PRE_RESTORE_BACKUP}"
else
  log_error "Restore failed. Attempting to recover from pre-restore backup..."
  gunzip -c "$PRE_RESTORE_BACKUP" | docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" --quiet
  log_error "Please investigate the issue and try again."
  exit 1
fi
