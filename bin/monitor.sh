#!/bin/bash
# =============================================================================
# PsyFit - サーバー死活監視スクリプト
# =============================================================================
# 用途: ヘルスチェック、コンテナ監視、SSL証明書・ディスク使用量の監視
#       異常検知時にSendGrid SMTP経由でメール通知
# 実行: bin/monitor.sh
# crontab: */5 * * * * /var/www/psyfit/bin/monitor.sh >> /var/log/psyfit-monitor.log 2>&1
# =============================================================================

set -uo pipefail

# --- 設定 ---
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

HEALTH_URL="https://psytech.jp/api/v1/health"
DOMAIN="psytech.jp"
HTTP_TIMEOUT=10

SSL_WARN_DAYS=14
DISK_WARN_PCT=80

COOLDOWN_SECONDS=3600  # 1時間（同じアラートの再通知を抑制）
COOLDOWN_DIR="/tmp/psyfit-monitor"

LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')]"

# --- 環境変数読み込み ---
# cron実行時は環境変数がないため .env から読み込む
if [ -f "${PROJECT_DIR}/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "${PROJECT_DIR}/.env"
  set +a
fi

ALERT_EMAIL="${MONITOR_ALERT_EMAIL:-}"
SENDGRID_API_KEY="${SMTP_PASSWORD:-}"
FROM_ADDRESS="${MAILER_FROM_ADDRESS:-noreply@psytech.jp}"

# --- 関数 ---
log_info() {
  echo "${LOG_PREFIX} [INFO] $1"
}

log_warn() {
  echo "${LOG_PREFIX} [WARN] $1"
}

log_error() {
  echo "${LOG_PREFIX} [ERROR] $1" >&2
}

# クールダウン判定: 同じアラートが1時間以内に送信済みなら抑制
should_alert() {
  local alert_type="$1"
  local cooldown_file="${COOLDOWN_DIR}/${alert_type}"

  mkdir -p "$COOLDOWN_DIR"

  if [ -f "$cooldown_file" ]; then
    local last_sent
    last_sent=$(cat "$cooldown_file")
    local now
    now=$(date +%s)
    local elapsed=$(( now - last_sent ))
    if [ "$elapsed" -lt "$COOLDOWN_SECONDS" ]; then
      return 1  # クールダウン中
    fi
  fi
  return 0  # アラート送信可
}

# クールダウンタイムスタンプを記録
mark_alerted() {
  local alert_type="$1"
  mkdir -p "$COOLDOWN_DIR"
  date +%s > "${COOLDOWN_DIR}/${alert_type}"
}

# クールダウン解除（正常復帰時）
clear_cooldown() {
  local alert_type="$1"
  rm -f "${COOLDOWN_DIR}/${alert_type}"
}

# SendGrid Web API v3 でメール送信
send_alert() {
  local subject="$1"
  local body="$2"
  local alert_type="$3"

  if [ -z "$ALERT_EMAIL" ]; then
    log_warn "MONITOR_ALERT_EMAIL not set. Skipping notification."
    return 1
  fi

  if [ -z "$SENDGRID_API_KEY" ]; then
    log_warn "SMTP_PASSWORD (SendGrid API key) not set. Skipping notification."
    return 1
  fi

  # クールダウンチェック
  if ! should_alert "$alert_type"; then
    log_info "Alert '${alert_type}' suppressed (cooldown active)."
    return 0
  fi

  local json_body
  json_body=$(cat <<EOJSON
{
  "personalizations": [{"to": [{"email": "${ALERT_EMAIL}"}]}],
  "from": {"email": "${FROM_ADDRESS}", "name": "PsyFit Monitor"},
  "subject": "${subject}",
  "content": [{"type": "text/plain", "value": $(echo "$body" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))')}]
}
EOJSON
)

  local http_code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" \
    --max-time 10 \
    -X POST "https://api.sendgrid.com/v3/mail/send" \
    -H "Authorization: Bearer ${SENDGRID_API_KEY}" \
    -H "Content-Type: application/json" \
    -d "$json_body")

  if [ "$http_code" = "202" ]; then
    mark_alerted "$alert_type"
    log_info "Alert sent: ${subject} (to: ${ALERT_EMAIL})"
    return 0
  else
    log_error "Failed to send alert (HTTP ${http_code}): ${subject}"
    return 1
  fi
}

# --- チェック関数 ---

# 1. HTTPヘルスチェック
check_health() {
  local http_code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$HTTP_TIMEOUT" "$HEALTH_URL" 2>/dev/null || echo "000")

  if [ "$http_code" = "200" ]; then
    log_info "Health check: OK (HTTP ${http_code})"
    clear_cooldown "health"
    return 0
  else
    log_error "Health check: FAILED (HTTP ${http_code})"
    send_alert \
      "[PsyFit ALERT] ヘルスチェック失敗" \
      "ヘルスチェックに失敗しました。

URL: ${HEALTH_URL}
HTTPステータス: ${http_code}
時刻: $(date '+%Y-%m-%d %H:%M:%S')

対処: サーバーにSSHして docker logs でコンテナログを確認してください。" \
      "health"
    return 1
  fi
}

# 2. Dockerコンテナ稼働チェック
check_container() {
  local name_pattern="$1"
  local display_name="$2"
  local alert_type="container_${name_pattern}"

  # コンテナ名でフィルタ（psyfit-web- はタイムスタンプ付き）
  local running
  running=$(docker ps --format '{{.Names}}' 2>/dev/null | grep "^${name_pattern}" || true)

  if [ -n "$running" ]; then
    log_info "Container check: ${display_name} running (${running})"
    clear_cooldown "$alert_type"
    return 0
  else
    log_error "Container check: ${display_name} NOT running"
    send_alert \
      "[PsyFit ALERT] コンテナ停止: ${display_name}" \
      "Dockerコンテナが停止しています。

コンテナ: ${display_name} (${name_pattern}*)
時刻: $(date '+%Y-%m-%d %H:%M:%S')

対処: docker start ${name_pattern} または bin/deploy.sh で再デプロイしてください。" \
      "$alert_type"
    return 1
  fi
}

# 3. SSL証明書有効期限チェック
check_ssl() {
  local expiry_date
  expiry_date=$(echo | openssl s_client -servername "$DOMAIN" -connect "${DOMAIN}:443" 2>/dev/null \
    | openssl x509 -noout -enddate 2>/dev/null \
    | sed 's/notAfter=//')

  if [ -z "$expiry_date" ]; then
    log_warn "SSL check: Could not retrieve certificate for ${DOMAIN}"
    return 1
  fi

  local expiry_epoch
  expiry_epoch=$(date -d "$expiry_date" +%s 2>/dev/null)
  local now_epoch
  now_epoch=$(date +%s)
  local days_left=$(( (expiry_epoch - now_epoch) / 86400 ))

  if [ "$days_left" -le "$SSL_WARN_DAYS" ]; then
    log_warn "SSL check: Certificate expires in ${days_left} days (${expiry_date})"
    send_alert \
      "[PsyFit ALERT] SSL証明書期限切れ間近" \
      "SSL証明書の有効期限が迫っています。

ドメイン: ${DOMAIN}
有効期限: ${expiry_date}
残り日数: ${days_left}日

対処: certbot renew を実行するか、SSL証明書を更新してください。" \
      "ssl_expiry"
    return 1
  else
    log_info "SSL check: OK (expires in ${days_left} days)"
    clear_cooldown "ssl_expiry"
    return 0
  fi
}

# 4. ディスク使用量チェック
check_disk() {
  local disk_pct
  disk_pct=$(df / | awk 'NR==2 {print $5}' | tr -d '%')
  local disk_free
  disk_free=$(df -h / | awk 'NR==2 {print $4}')

  if [ "$disk_pct" -ge "$DISK_WARN_PCT" ]; then
    log_warn "Disk check: ${disk_pct}% used (free: ${disk_free})"
    send_alert \
      "[PsyFit ALERT] ディスク使用量警告 (${disk_pct}%)" \
      "ディスク使用量がしきい値を超えています。

使用率: ${disk_pct}%
空き容量: ${disk_free}
しきい値: ${DISK_WARN_PCT}%
時刻: $(date '+%Y-%m-%d %H:%M:%S')

対処: bin/cleanup-docker.sh を実行するか、不要ファイルを削除してください。" \
      "disk_usage"
    return 1
  else
    log_info "Disk check: OK (${disk_pct}% used, ${disk_free} free)"
    clear_cooldown "disk_usage"
    return 0
  fi
}

# --- メイン処理 ---
ERRORS=0

log_info "=== Monitor check started ==="

# 1. HTTPヘルスチェック
check_health || ERRORS=$((ERRORS + 1))

# 2. コンテナ稼働チェック
check_container "psyfit-web-" "Web (Rails/Puma)" || ERRORS=$((ERRORS + 1))
check_container "psyfit-db"   "Database (PostgreSQL)" || ERRORS=$((ERRORS + 1))
check_container "psyfit-redis" "Cache (Redis)" || ERRORS=$((ERRORS + 1))

# 3. SSL証明書チェック
check_ssl || ERRORS=$((ERRORS + 1))

# 4. ディスク使用量チェック
check_disk || ERRORS=$((ERRORS + 1))

if [ "$ERRORS" -gt 0 ]; then
  log_warn "=== Monitor check completed with ${ERRORS} issue(s) ==="
else
  log_info "=== Monitor check completed: all OK ==="
fi

exit 0
