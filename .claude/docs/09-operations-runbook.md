# 09 - 運用ランブック（Operations Runbook）

**対象システム**: PsyFit（さとやま整形外科内科 リハビリ運動支援アプリ）  
**バージョン**: 4.1  
**最終更新**: 2026-02-24

---

## クライアント向け工数見積（Client-Ready Estimate）

| フェーズ | 内容 | 工数目安 |
|---------|------|---------|
| **1. インフラプロビジョニング** | サーバー設定・Docker環境確認 | 0.5日 |
| **2. Kamal設定・初回デプロイ** | 鍵生成・シークレット設定・`kamal setup` | 0.5日 |
| **3. シークレット管理** | 本番環境変数の設定・検証 | 0.5日 |
| **4. DB マイグレーション確認** | 初回 `db:prepare` 動作確認 | 0.5日 |
| **5. バックアップ設定** | crontab 設定・初回バックアップ確認 | 0.5日 |
| **6. 監視・アラート設定** | UptimeRobot + monitor.sh cron 設定 | 1日 |
| **7. SSL / ドメイン確認** | DNS 伝播・証明書発行確認 | 0.5日 |
| **8. ロールバック手順確認** | ドライランと手動ロールバック確認 | 0.5日 |
| **9. 本番稼働後確認** | E2Eテスト・最終チェック | 1日 |
| **合計** | | **5.5日（約1週間）** |

> **前提条件**: CI/CD パイプラインが通過済み（Phase 1〜5 完了）、SMTP 認証情報取得済み

---

## 詳細内部計画（Internal Plan）

### Day 1: インフラ確認 + シークレット設定（0.5 + 0.5日）

```
[インフラ確認]
1. SSH アクセス確認: ssh <user>@160.251.230.38
2. Docker 稼働確認: docker ps
3. kamal-proxy 稼働確認: docker exec kamal-proxy kamal-proxy list
4. ポート開放確認: 80/443/5432（localhost only）/6379（localhost only）
5. ディスク容量確認: df -h（/var/backups 用に最低 10GB 確保）

[シークレット生成・設定]
export RAILS_MASTER_KEY=$(cat config/master.key)
export SECRET_KEY_BASE=$(bin/rails secret)
export ATTR_ENCRYPTED_KEY=$(openssl rand -hex 32)
export BLIND_INDEX_KEY=$(openssl rand -hex 32)
export POSTGRES_PASSWORD=$(openssl rand -base64 24)
export REDIS_PASSWORD=$(openssl rand -base64 24)
export KAMAL_REGISTRY_PASSWORD=<GitHub PAT: packages:write>
export GITHUB_TOKEN=<GitHub PAT: repo read>
export SMTP_ADDRESS=smtp.sendgrid.net
export SMTP_USERNAME=apikey
export SMTP_PASSWORD=<SendGrid API キー>
```

### Day 2: Kamal セットアップ + 初回デプロイ（0.5 + 0.5日）

```bash
# Kamal 初回セットアップ（アクセサリ起動 + proxy 設定）
bin/kamal setup

# 動作確認
bin/kamal app logs

# ヘルスチェック確認
curl https://psytech.jp/api/v1/health
curl https://psytech.jp/up
```

### Day 3: バックアップ + 監視設定（0.5 + 0.5日）

```bash
# バックアップ crontab 設定
crontab -e
# 追加: 0 2 * * * /var/www/psyfit/bin/backup.sh >> /var/log/psyfit-backup.log 2>&1

# 手動バックアップ確認
bin/backup.sh

# 監視スクリプト crontab 設定
crontab -e
# 追加: */5 * * * * /var/www/psyfit/bin/monitor.sh >> /var/log/psyfit-monitor.log 2>&1

# 外部監視設定（UptimeRobot 等）
# URL: https://psytech.jp/api/v1/health
# 間隔: 5分
# 通知先: MONITOR_ALERT_EMAIL
```

### Day 4: ロールバック確認 + 最終チェック（0.5 + 0.5日）

```bash
# ロールバック手順確認（dry-run）
bin/kamal app containers  # コンテナ一覧確認
bin/kamal rollback        # 前バージョンに戻す

# E2E テスト実行
cd frontend_user && npm run test:e2e
cd frontend_admin && npm run test:e2e
```

---

## 1. デプロイ手順

### 通常デプロイ（Git Push → CI → 自動デプロイ）

```
1. feature ブランチで作業
2. git push → PR 作成
3. GitHub Actions CI が自動実行（テスト・セキュリティスキャン・ビルド）
4. CI 全パス確認後、PR を main にマージ
5. deploy.yml が SSH 経由で bin/deploy.sh を実行
6. Kamal のブルーグリーンデプロイでゼロダウンタイム更新
```

### Kamal 直接デプロイ

```bash
# 本番デプロイ（pre-deploy フックで CI チェック → ビルド → スワップ → post-deploy ヘルスチェック）
bin/kamal deploy

# デプロイ状況確認
bin/kamal app logs

# コンテナ一覧確認
bin/kamal app containers
```

---

## 2. ロールバック手順

### Kamal ロールバック（推奨）

```bash
# 直前バージョンにロールバック
bin/kamal rollback

# 特定バージョンにロールバック
bin/kamal rollback <image-tag>

# ロールバック後の確認
curl https://psytech.jp/api/v1/health
bin/kamal app logs
```

### 手動ロールバック（Kamal が使えない場合）

```bash
# 1. 停止済みの旧コンテナを確認
docker ps -a --filter "name=psyfit-web-" --filter "status=exited"

# 2. 旧コンテナを再起動
docker start <旧コンテナ名>

# 3. 旧コンテナの IP 取得 → kamal-proxy を旧コンテナに向ける
OLD_IP=$(docker inspect <旧コンテナ名> --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}')
docker exec kamal-proxy kamal-proxy deploy psyfit-web \
  --target "${OLD_IP}:80" --host psytech.jp

# 4. 新コンテナを停止
docker stop <新コンテナ名>

# 5. ヘルスチェック確認
curl https://psytech.jp/api/v1/health
```

---

## 3. データベース運用

### バックアップ

```bash
# 手動バックアップ
bin/backup.sh

# バックアップ一覧確認
ls -lh /var/backups/psyfit/

# 自動バックアップ確認（crontab）
crontab -l | grep backup
```

**自動バックアップ設定（crontab）**:
```
0 2 * * * /var/www/psyfit/bin/backup.sh >> /var/log/psyfit-backup.log 2>&1
```
- 毎日 2:00 実行
- 30日間保持（自動ローテーション）
- 保存先: `/var/backups/psyfit/`

### リストア

```bash
# 最新バックアップからリストア
bin/restore.sh --latest

# 特定バックアップからリストア
bin/restore.sh /var/backups/psyfit/psyfit_production_YYYYMMDD_HHMMSS.sql.gz

# バックアップ一覧表示
bin/restore.sh --list
```

### マイグレーション

マイグレーションはコンテナ起動時に自動実行（`bin/docker-entrypoint` が `rails db:prepare` を実行）。

```bash
# 手動でマイグレーション実行（Kamal経由）
bin/kamal app exec "bin/rails db:migrate"

# マイグレーション状態確認
bin/kamal app exec "bin/rails db:migrate:status"
```

---

## 4. 監視・アラート

### ヘルスチェックエンドポイント

| URL | 目的 | 期待レスポンス |
|-----|------|--------------|
| `https://psytech.jp/up` | Rails 起動確認（Kamal proxy 用） | HTTP 200 |
| `https://psytech.jp/api/v1/health` | アプリケーション死活確認 | `{"status":"ok"}` |

### monitor.sh（自動監視）

```bash
# 手動実行
bin/monitor.sh

# ログ確認
tail -f /var/log/psyfit-monitor.log

# crontab 設定（5分間隔）
*/5 * * * * /var/www/psyfit/bin/monitor.sh >> /var/log/psyfit-monitor.log 2>&1
```

**監視内容**:
1. HTTP ヘルスチェック（`/api/v1/health`）
2. コンテナ稼働確認（psyfit-web, psyfit-db, psyfit-redis）
3. SSL 証明書残日数（14日以下で警告）
4. ディスク使用量（80%以上で警告）

**必要な環境変数**:
```
MONITOR_ALERT_EMAIL=<通知先メールアドレス>
SMTP_PASSWORD=<SendGrid API キー>
MAILER_FROM_ADDRESS=noreply@psytech.jp
```

### ログ確認

```bash
# アプリケーションログ
bin/kamal app logs
bin/kamal app logs -f  # フォロー

# PostgreSQL ログ
bin/kamal accessory logs db

# Redis ログ
bin/kamal accessory logs redis

# Docker ログ直接確認
docker logs psyfit-web-<timestamp> --tail=100 -f
```

---

## 5. SSL / ドメイン

- **SSL**: Kamal proxy による Let's Encrypt 自動発行・自動更新
- **ドメイン**: `psytech.jp` → `160.251.230.38`
- **証明書保存先**: kamal-proxy コンテナ内

```bash
# 証明書状態確認
docker exec kamal-proxy kamal-proxy list

# SSL 証明書残日数確認
echo | openssl s_client -servername psytech.jp -connect psytech.jp:443 2>/dev/null \
  | openssl x509 -noout -dates
```

---

## 6. 障害対応

### アプリ応答なし

```bash
# 1. コンテナ状態確認
docker ps --filter "name=psyfit"

# 2. ログ確認
bin/kamal app logs --lines=50

# 3. コンテナ再起動
bin/kamal app restart

# 4. ヘルスチェック確認
curl https://psytech.jp/api/v1/health
```

### DB 接続エラー

```bash
# 1. PostgreSQL コンテナ確認
docker ps --filter "name=psyfit-db"
bin/kamal accessory logs db

# 2. DB コンテナ再起動
bin/kamal accessory reboot db

# 3. 接続テスト
docker exec psyfit-db-1 pg_isready -U psyfit_prod
```

### Redis 接続エラー

```bash
# 1. Redis コンテナ確認
docker ps --filter "name=psyfit-redis"
bin/kamal accessory logs redis

# 2. Redis コンテナ再起動
bin/kamal accessory reboot redis

# 3. 接続テスト（パスワードはシークレットから取得）
docker exec psyfit-redis-1 redis-cli -a "$REDIS_PASSWORD" ping
```

### デプロイ失敗・ロールバック

```bash
# ロールバック実行
bin/kamal rollback

# 原因調査
bin/kamal app logs --lines=100
```

---

## 7. 定期メンテナンス

### 週次

```bash
# 不要な Docker リソース削除
bin/cleanup-docker.sh

# バックアップログ確認
tail -20 /var/log/psyfit-backup.log

# 監視ログ確認
tail -20 /var/log/psyfit-monitor.log
```

### 月次

```bash
# バックアップ復元テスト
bin/restore.sh --list  # バックアップ存在確認
# 別 DB にリストアして動作確認（CLAUDE.md 参照）

# SSL 証明書残日数確認
echo | openssl s_client -servername psytech.jp -connect psytech.jp:443 2>/dev/null \
  | openssl x509 -noout -dates

# Gem・JS パッケージのセキュリティ脆弱性確認
bundle exec bundler-audit check --update
```

---

## 8. 関連ドキュメント

- [デプロイメントガイド](08-deployment-guide.md)
- [デプロイ前チェックリスト](08-deployment-checklist.md)
- [セキュリティ要件](05-security-requirements.md)
- [非機能要件](06-non-functional-requirements.md)
- [Kamal 設定](../../config/deploy.yml)
- [バックアップスクリプト](../../bin/backup.sh)
- [監視スクリプト](../../bin/monitor.sh)
- [クリーンアップスクリプト](../../bin/cleanup-docker.sh)
