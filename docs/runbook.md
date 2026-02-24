# PsyFit 運用ランブック

作成日: 2026-02-24
バージョン: 1.0

本ドキュメントは PsyFit 本番環境の運用手順書です。
インシデント対応、日常運用、デプロイ、バックアップ・リストアの手順を記載します。

---

## 1. 緊急連絡先・アクセス情報

| 項目 | 値 |
|------|-----|
| サーバー | 160.251.230.38 (vm-58ab50c7-ca) |
| ドメイン | https://psytech.jp |
| APIヘルス | https://psytech.jp/api/v1/health |
| 監視ログ | `/var/log/psyfit-monitor.log` |
| バックアップログ | `/var/log/psyfit-backup.log` |
| アプリログ | `docker logs <psyfit-web-コンテナ名>` |

---

## 2. ヘルスチェックと死活確認

### 2.1 APIヘルスチェック

```bash
curl -s https://psytech.jp/api/v1/health | python3 -m json.tool
```

**正常レスポンス例:**
```json
{
  "status": "success",
  "data": {
    "health_status": "healthy",
    "timestamp": "2026-02-24T08:00:00+09:00",
    "version": "1.0.0",
    "checks": {
      "database": "ok"
    }
  }
}
```

**異常時のレスポンス:** `"health_status": "degraded"` が返り HTTP 503 になります。

### 2.2 コンテナ稼働確認

```bash
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
```

正常時は `psyfit-web-*`, `psyfit-db`, `psyfit-redis` の3コンテナが Up 状態。

### 2.3 kamal-proxy 確認

```bash
docker exec kamal-proxy kamal-proxy list
```

---

## 3. インシデント対応

### 3.1 サービス全停止 (HTTP 5xx / 接続不可)

1. ヘルスチェックで状態確認:
   ```bash
   curl -I https://psytech.jp/api/v1/health
   ```

2. コンテナ状態確認:
   ```bash
   docker ps -a --filter "name=psyfit"
   ```

3. コンテナが停止している場合は再起動:
   ```bash
   # 停止コンテナ確認
   docker ps -a --filter "name=psyfit-web" --filter "status=exited"

   # 再デプロイ（推奨）
   cd /var/www/psyfit && bin/deploy.sh

   # または停止コンテナを直接再起動
   docker start <コンテナ名>
   ```

4. ログ確認:
   ```bash
   docker logs --tail=100 $(docker ps -q --filter "name=psyfit-web-")
   ```

### 3.2 データベース接続エラー

```bash
# DBコンテナ確認
docker ps --filter "name=psyfit-db"
docker logs --tail=50 psyfit-db

# 接続テスト
docker exec psyfit-db psql -U psyfit_prod -d psyfit_production -c "SELECT 1"
```

### 3.3 高負荷・レスポンス遅延

```bash
# プロセス確認
docker stats --no-stream

# DBの遅いクエリ確認
docker exec psyfit-db psql -U psyfit_prod -d psyfit_production \
  -c "SELECT pid, now()-query_start AS duration, query FROM pg_stat_activity WHERE state='active' ORDER BY duration DESC LIMIT 10;"
```

### 3.4 手動ロールバック

```bash
# 停止済みの旧コンテナを確認
docker ps -a --filter "name=psyfit-web-" --filter "status=exited"

# 旧コンテナを再起動
docker start <旧コンテナ名>

# 旧コンテナのIPを取得してkamal-proxyを切り替え
OLD_IP=$(docker inspect <旧コンテナ名> --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}')
docker exec kamal-proxy kamal-proxy deploy psyfit-web \
  --target ${OLD_IP}:3000 --host psytech.jp

# 新コンテナを停止
docker stop <新コンテナ名>
```

---

## 4. デプロイ手順

### 4.1 通常デプロイ（PR経由）

```bash
# 1. featureブランチで作業
git checkout -b fix/issue-description
# ... コード変更 ...
git commit -m "fix: 説明"
git push origin fix/issue-description

# 2. PR作成 → CIパス確認 → マージ
# 3. deploy.yml が自動実行 → 本番反映
```

### 4.2 手動デプロイ（緊急時）

```bash
# サーバーにSSHして実行
ssh <SERVER_USER>@160.251.230.38
cd /var/www/psyfit
git pull origin main
bin/deploy.sh
```

### 4.3 DBマイグレーションのみ実行

```bash
docker exec $(docker ps -q --filter "name=psyfit-web-") \
  bin/rails db:migrate
```

---

## 5. バックアップ・リストア

### 5.1 手動バックアップ実行

```bash
cd /var/www/psyfit
bin/backup.sh
```

### 5.2 バックアップ確認

```bash
ls -lh /var/backups/psyfit/
tail -20 /var/log/psyfit-backup.log
```

### 5.3 リストア（テスト用）

```bash
bin/restore.sh --latest    # 最新バックアップから確認
bin/restore.sh --list      # バックアップ一覧表示
bin/restore.sh /var/backups/psyfit/psyfit_production_TIMESTAMP.sql.gz
```

### 5.4 暗号化バックアップの設定

GPGキーが設定されている場合、バックアップは暗号化されます:

```bash
# GPGキーをインポート
gpg --import your-backup-key.asc

# 環境変数で受信者を設定
export BACKUP_ENCRYPT_KEY="backup@example.com"
bin/backup.sh
```

### 5.5 S3オフサイトバックアップの設定

```bash
# AWS CLIを設定後
export BACKUP_S3_BUCKET="your-backup-bucket"
bin/backup.sh
# バックアップが s3://your-backup-bucket/backups/psyfit/ にアップロードされます
```

---

## 6. 監視・アラート

### 6.1 監視スクリプト手動実行

```bash
cd /var/www/psyfit
bin/monitor.sh
```

### 6.2 監視ログ確認

```bash
tail -50 /var/log/psyfit-monitor.log
```

### 6.3 監視項目

| チェック項目 | しきい値 | アラート |
|---|---|---|
| HTTPヘルスチェック | HTTP 200 以外 | 即時メール |
| psyfit-web コンテナ | 停止時 | 即時メール |
| psyfit-db コンテナ | 停止時 | 即時メール |
| psyfit-redis コンテナ | 停止時 | 即時メール |
| SSL証明書 | 残り14日以下 | メール |
| ディスク使用量 | 80%以上 | メール |
| バックアップ鮮度 | 25時間以上経過 | メール |

### 6.4 crontab 設定確認

```bash
crontab -l
# 以下が設定されているか確認:
# */5 * * * * /var/www/psyfit/bin/monitor.sh >> /var/log/psyfit-monitor.log 2>&1
# 0 2 * * * /var/www/psyfit/bin/backup.sh >> /var/log/psyfit-backup.log 2>&1
```

---

## 7. SSL証明書更新

Let's Encrypt（Kamal管理）は自動更新されます。手動で確認・更新する場合:

```bash
# 残日数確認
echo | openssl s_client -servername psytech.jp -connect psytech.jp:443 2>/dev/null \
  | openssl x509 -noout -enddate

# kamal-proxy経由での証明書更新（通常は自動）
docker exec kamal-proxy kamal-proxy renew-ssl
```

---

## 8. シークレット管理

### 8.1 重要な環境変数

| 変数 | 用途 | 変更時の影響 |
|------|------|-------------|
| `RAILS_MASTER_KEY` | credentials.yml.enc の復号 | コンテナ再起動が必要 |
| `SECRET_KEY_BASE` | セッション暗号化 | **既存セッションがすべて無効化** |
| `ATTR_ENCRYPTED_KEY` | PII暗号化 (AES-256-GCM) | **既存データが読めなくなる** |
| `BLIND_INDEX_KEY` | メール検索用ハッシュ | **ログイン不可になる** |
| `POSTGRES_PASSWORD` | DB接続 | DBコンテナと同期が必要 |

### 8.2 シークレットローテーション手順

**SECRET_KEY_BASE のローテーション:**

```bash
# 1. 新しいキーを生成
NEW_KEY=$(rails secret)

# 2. .kamal/secrets を更新
# SECRET_KEY_BASE=<新しいキー>

# 3. 再デプロイ（既存セッションはすべて無効化される）
bin/deploy.sh
```

**ATTR_ENCRYPTED_KEY のローテーション（注意: データ再暗号化が必要）:**

```bash
# 1. 既存データをバックアップ
bin/backup.sh

# 2. 新旧キーで再暗号化スクリプトを実行（要カスタム実装）
# bin/rails runner 're_encrypt_pii.rb'

# 3. 新しいキーで再デプロイ
```

### 8.3 GitHub Actions シークレットの更新

リポジトリの Settings → Secrets and variables → Actions で以下を管理:
- `SERVER_HOST` - 本番サーバーIP
- `SERVER_USER` - SSHユーザー名
- `SSH_PRIVATE_KEY` - SSH秘密鍵
- `SSH_PORT` - SSHポート

---

## 9. ログ管理

### 9.1 アプリケーションログ

```bash
# リアルタイム確認
docker logs -f $(docker ps -q --filter "name=psyfit-web-")

# 直近100行
docker logs --tail=100 $(docker ps -q --filter "name=psyfit-web-")
```

### 9.2 Dockerログローテーション

`docker-compose.prod.yml` でログローテーションが設定済み:
- APIコンテナ: 50MB × 5ファイル
- DBコンテナ: 10MB × 3ファイル

### 9.3 Dockerクリーンアップ

```bash
# 週次クリーンアップ（cron設定済み）
bin/cleanup-docker.sh

# 手動実行
docker system prune -f
docker image prune -f
```

---

## 10. よくある問題と解決策

### 問題: コンテナが起動しない

```bash
# ログ確認
docker logs <コンテナ名> 2>&1 | tail -50

# よくある原因:
# - RAILS_MASTER_KEY 不一致 → "AEAD authentication tag verification failed"
# - DB接続失敗 → "could not connect to server"
# - 暗号化キー未設定 → "ATTR_ENCRYPTED_KEY environment variable must be set"
```

### 問題: ログイン不可

1. ブラウザのキャッシュ・Cookieをクリア
2. セッションタイムアウトを確認（利用者: 30分、職員: 15分）
3. アカウントロックアウトを確認（ログイン失敗が多い場合）

### 問題: バックアップが古い / 存在しない

```bash
# 手動バックアップ
bin/backup.sh

# crontab 確認
crontab -l

# ディスク容量確認（満杯の場合バックアップ失敗）
df -h /var/backups/psyfit
```

### 問題: ディスク容量不足

```bash
# Dockerクリーンアップ
bin/cleanup-docker.sh

# 古いバックアップを手動削除
find /var/backups/psyfit -name "*.sql.gz*" -mtime +30 -delete

# ディスク使用量トップ10
du -sh /var/www/psyfit/* | sort -rh | head -10
```
