#!/bin/bash
# =============================================================================
# PsyFit - DB バックアップスクリプト
# =============================================================================
# 用途: PostgreSQL データベースの日次バックアップ
# 実行: bin/backup.sh
# crontab: 0 2 * * * /var/www/psyfit/bin/backup.sh >> /var/log/psyfit-backup.log 2>&1
#
# オプション環境変数:
#   BACKUP_ENCRYPT_KEY  - GPGで暗号化する場合の受信者メールアドレスまたはキーID
#   BACKUP_S3_BUCKET    - S3バケット名（aws cliが設定済みの場合にオフサイトアップロード）
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

# オプション設定
BACKUP_ENCRYPT_KEY="${BACKUP_ENCRYPT_KEY:-}"
BACKUP_S3_BUCKET="${BACKUP_S3_BUCKET:-}"

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

# 5. GPG暗号化（BACKUP_ENCRYPT_KEY が設定されている場合）
FINAL_BACKUP_FILE="$BACKUP_FILE"
if [ -n "$BACKUP_ENCRYPT_KEY" ]; then
  if command -v gpg &>/dev/null; then
    ENCRYPTED_FILE="${BACKUP_FILE}.gpg"
    if gpg --batch --yes --trust-model always \
        --recipient "$BACKUP_ENCRYPT_KEY" \
        --output "$ENCRYPTED_FILE" \
        --encrypt "$BACKUP_FILE"; then
      rm -f "$BACKUP_FILE"
      FINAL_BACKUP_FILE="$ENCRYPTED_FILE"
      log_info "Backup encrypted: ${FINAL_BACKUP_FILE}"
    else
      log_error "GPG encryption failed. Keeping unencrypted backup."
    fi
  else
    log_error "gpg not found. Skipping encryption."
  fi
fi

# 6. S3アップロード（BACKUP_S3_BUCKET が設定されている場合）
if [ -n "$BACKUP_S3_BUCKET" ]; then
  if command -v aws &>/dev/null; then
    S3_KEY="backups/psyfit/$(basename "${FINAL_BACKUP_FILE}")"
    if aws s3 cp "$FINAL_BACKUP_FILE" "s3://${BACKUP_S3_BUCKET}/${S3_KEY}" \
        --storage-class STANDARD_IA 2>/dev/null; then
      log_info "Backup uploaded to S3: s3://${BACKUP_S3_BUCKET}/${S3_KEY}"
    else
      log_error "S3 upload failed for ${FINAL_BACKUP_FILE}."
    fi
  else
    log_error "aws cli not found. Skipping S3 upload."
  fi
fi

# 7. 古いバックアップの削除（ローテーション）
DELETED=$(find "$BACKUP_DIR" \( -name "psyfit_production_*.sql.gz" -o -name "psyfit_production_*.sql.gz.gpg" \) -mtime +${RETENTION_DAYS} -print -delete | wc -l)
if [ "$DELETED" -gt 0 ]; then
  log_info "Rotated: deleted ${DELETED} backup(s) older than ${RETENTION_DAYS} days."
fi

# 8. ディスク使用量レポート
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
BACKUP_COUNT=$(find "$BACKUP_DIR" \( -name "psyfit_production_*.sql.gz" -o -name "psyfit_production_*.sql.gz.gpg" \) | wc -l)
log_info "Backup directory: ${BACKUP_DIR} (${TOTAL_SIZE}, ${BACKUP_COUNT} files)"

log_info "Backup completed successfully."

