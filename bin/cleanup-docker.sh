#!/bin/bash
# =============================================================================
# PsyFit - Docker クリーンアップスクリプト
# =============================================================================
# 用途: 古いDockerイメージ・ビルドキャッシュ・停止済みコンテナの定期削除
# 実行: bin/cleanup-docker.sh
# crontab: 0 3 * * 0 /var/www/psyfit/bin/cleanup-docker.sh >> /var/log/psyfit-cleanup.log 2>&1
# =============================================================================

set -euo pipefail

# --- 設定 ---
IMAGE_RETENTION_DAYS=7
CONTAINER_KEEP_COUNT=1
LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')]"

# --- 関数 ---
log_info() {
  echo "${LOG_PREFIX} [INFO] $1"
}

log_warn() {
  echo "${LOG_PREFIX} [WARN] $1"
}

# --- メイン処理 ---
log_info "=== Docker cleanup started ==="

# 1. ディスク使用量（実行前）
DISK_BEFORE=$(docker system df --format '{{.Size}}' 2>/dev/null | head -1 || echo "unknown")
log_info "Disk usage before cleanup: Images=${DISK_BEFORE}"

# 2. 停止済み psyfit-web コンテナの削除（直近1つはロールバック用に保持）
STOPPED=$(docker ps -a --filter "name=psyfit-web-" --filter "status=exited" \
  --format '{{.Names}}' | sort | head -n -${CONTAINER_KEEP_COUNT} 2>/dev/null || true)
if [ -n "$STOPPED" ]; then
  STOPPED_COUNT=$(echo "$STOPPED" | wc -l)
  echo "$STOPPED" | xargs -r docker rm || true
  log_info "Removed ${STOPPED_COUNT} stopped container(s). Kept latest ${CONTAINER_KEEP_COUNT} for rollback."
else
  log_info "No stopped containers to remove."
fi

# 3. ダングリングイメージの削除
DANGLING_COUNT=$(docker images -f "dangling=true" -q 2>/dev/null | wc -l || echo 0)
if [ "$DANGLING_COUNT" -gt 0 ]; then
  docker image prune -f > /dev/null 2>&1 || true
  log_info "Removed ${DANGLING_COUNT} dangling image(s)."
else
  log_info "No dangling images."
fi

# 4. 古い psyfit-local イメージの削除（直近2つを保持）
OLD_IMAGES=$(docker images "psyfit-local" --format '{{.ID}} {{.CreatedAt}}' \
  | sort -k2 -r | tail -n +3 | awk '{print $1}' 2>/dev/null || true)
if [ -n "$OLD_IMAGES" ]; then
  OLD_COUNT=$(echo "$OLD_IMAGES" | wc -l)
  echo "$OLD_IMAGES" | xargs -r docker rmi || true
  log_info "Removed ${OLD_COUNT} old psyfit-local image(s). Kept latest 2."
else
  log_info "No old psyfit-local images to remove."
fi

# 5. ビルドキャッシュの削除（7日以上前）
BUILD_CACHE_BEFORE=$(docker system df --format '{{.Size}}' 2>/dev/null | tail -1 || echo "unknown")
docker builder prune -f --filter "until=${IMAGE_RETENTION_DAYS}d" > /dev/null 2>&1 || true
log_info "Pruned build cache older than ${IMAGE_RETENTION_DAYS} days. (was: ${BUILD_CACHE_BEFORE})"

# 6. ディスク使用量（実行後）
log_info "--- Docker disk usage after cleanup ---"
docker system df 2>/dev/null || true

# 7. ホストディスク空き容量
DISK_FREE=$(df -h / | awk 'NR==2 {print $4}')
DISK_USE_PCT=$(df -h / | awk 'NR==2 {print $5}')
log_info "Host disk: ${DISK_FREE} free (${DISK_USE_PCT} used)"

# 8. ディスク使用率が90%超の場合に警告
DISK_PCT_NUM=$(df / | awk 'NR==2 {print $5}' | tr -d '%')
if [ "$DISK_PCT_NUM" -ge 90 ]; then
  log_warn "DISK USAGE HIGH: ${DISK_USE_PCT} - consider manual cleanup"
fi

log_info "=== Docker cleanup completed ==="
