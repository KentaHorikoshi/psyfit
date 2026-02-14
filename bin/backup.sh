#!/bin/bash
# =============================================================================
# PsyFit - DB バックアップスクリプト
# =============================================================================
# 用途: PostgreSQL データベースの日次バックアップ
# 実行: bin/backup.sh
# crontab: 0 2 * * * /var/www/psyfit/bin/backup.sh >> /var/log/psyfit-backup.log 2>&1
# =============================================================================

set -euo pipefail

# --- 設定 ---
BACKUP_DIR="/var/backups/psyfit"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/psyfit_production_${TIMESTAMP}.sql.gz"
LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')]"

# DB接続情報（本番Dockerコンテナ: psyfit-db）
DB_CONTAINER="psyfit-db"
DB_USER="psyfit_prod"
DB_NAME="psyfit_production"

# --- 関数 ---
log_info() {
  echo "${LOG_PREFIX} [INFO] $1"
}

log_error() {
  echo "${LOG_PREFIX} [ERROR] $1" >&2
}

# --- メイン処理 ---

# 1. バックアップディレクトリ作成
mkdir -p "$BACKUP_DIR"

# 2. DBコンテナの稼働確認
if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
  log_error "DB container '${DB_CONTAINER}' is not running."
  exit 1
fi

# 3. pg_dump 実行
log_info "Starting backup: ${DB_NAME} -> ${BACKUP_FILE}"

if docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --no-owner --no-privileges | gzip > "$BACKUP_FILE"; then
  # 4. バックアップファイルの検証
  if [ -s "$BACKUP_FILE" ]; then
    FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log_info "Backup successful: ${BACKUP_FILE} (${FILE_SIZE})"
  else
    log_error "Backup file is empty: ${BACKUP_FILE}"
    rm -f "$BACKUP_FILE"
    exit 1
  fi
else
  log_error "pg_dump failed."
  rm -f "$BACKUP_FILE"
  exit 1
fi

# 5. 古いバックアップの削除（ローテーション）
DELETED=$(find "$BACKUP_DIR" -name "psyfit_production_*.sql.gz" -mtime +${RETENTION_DAYS} -print -delete | wc -l)
if [ "$DELETED" -gt 0 ]; then
  log_info "Rotated: deleted ${DELETED} backup(s) older than ${RETENTION_DAYS} days."
fi

# 6. ディスク使用量レポート
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "psyfit_production_*.sql.gz" | wc -l)
log_info "Backup directory: ${BACKUP_DIR} (${TOTAL_SIZE}, ${BACKUP_COUNT} files)"

log_info "Backup completed successfully."
