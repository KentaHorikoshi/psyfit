# デプロイメントガイド

## 本番環境構成

| コンポーネント | 詳細 |
|-------------|------|
| サーバー | 160.251.230.38 (vm-58ab50c7-ca) |
| ドメイン | https://psytech.jp |
| Web サーバー | Nginx → kamal-proxy → Docker コンテナ |
| アプリケーション | Rails 8 (Puma) + React SPA |
| データベース | PostgreSQL 16 (Docker: psyfit-db) |
| キャッシュ | Redis 7 (Docker: psyfit-redis) |
| コンテナ管理 | Kamal (kamal-proxy) |

## トラフィックフロー

```
Client (HTTPS)
  → Nginx (:443, SSL終端)
    → kamal-proxy (:8080)
      → Docker コンテナ (:3000, Rails/Puma)
        → psyfit-db (PostgreSQL, Docker内部ネットワーク)
        → psyfit-redis (Redis, Docker内部ネットワーク)
```

**注意**: サーバー上には systemd Puma も存在するが、本番トラフィックは上記の Docker/kamal-proxy 経由で配信される。systemd Puma は本番トラフィックには使用されていない。

---

## 運用基盤 セットアップ計画（Day-by-Day タイムライン）

初回サーバーを立ち上げてから本番稼働まで **7 営業日** を目安に設定する。
各 Phase は以下の見出しで詳細手順を参照。

| Day | Phase | 主な作業 | 完了基準 |
|-----|-------|---------|---------|
| 1 | サーバープロビジョニング | OS セキュリティ強化・Docker インストール・SSH 鍵 | SSH ログイン確認・Docker 動作確認 |
| 2 | ドメイン + TLS/HTTPS | DNS 設定・Nginx インストール・Let's Encrypt 証明書取得 | `https://psytech.jp` でアクセス可能 |
| 3 | シークレット + 初回 Kamal デプロイ | 環境変数生成・Kamal setup・DB マイグレーション | `/api/v1/health` が HTTP 200 を返す |
| 4 | PostgreSQL + バックアップ | 本番データ投入・日次バックアップ検証・リストア訓練 | バックアップファイル生成確認 |
| 5 | ワーカースケジューリング | Solid Queue 昼間稼働設定・crontab 登録 | 8:00/20:00 JST の停止・再開確認 |
| 6 | ログ + 監視 + アラート | crontab 完全登録・UptimeRobot・SendGrid テスト | 全監視項目グリーン |
| 7 | スモークテスト + ランブック確認 | E2E 手動確認・ロールバック訓練・チーム引継ぎ | 全チェックリスト ✅ |

---

## Phase 1: サーバープロビジョニング（Day 1）

### 1-1. OS セキュリティ強化

```bash
# SSH 公開鍵を authorized_keys に追加（パスワード認証を無効化）
ssh-copy-id -i ~/.ssh/id_ed25519.pub <USER>@160.251.230.38

# sshd_config でパスワード認証を無効化
sudo sed -i 's/^#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl reload sshd

# UFW（ファイアウォール）設定
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status
```

### 1-2. Docker インストール

```bash
# 公式手順 (Ubuntu 22.04)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# 再ログイン後確認
docker version
```

### 1-3. kamal-proxy と kamal ネットワーク

```bash
# kamal ネットワーク作成（Kamal が自動作成しない場合）
docker network create kamal

# kamal-proxy 起動
docker run -d --name kamal-proxy \
  --network kamal \
  -p 80:80 -p 443:443 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  basecamp/kamal-proxy:latest

docker exec kamal-proxy kamal-proxy list
```

---

## Phase 2: ドメイン + TLS/HTTPS（Day 2）

### 2-1. DNS 設定

| レコード種別 | ホスト名 | 値 | TTL |
|------------|---------|-----|-----|
| A | psytech.jp | 160.251.230.38 | 300 |
| A | www.psytech.jp | 160.251.230.38 | 300 |
| CNAME | em.psytech.jp | *(SendGrid が指定する値)* | 300 |
| TXT | psytech.jp | *(SendGrid DKIM レコード)* | 300 |

DNS 反映確認（最大1時間）:

```bash
dig psytech.jp A +short
# → 160.251.230.38 が返ること
```

### 2-2. Nginx インストール + 設定

```bash
sudo apt install -y nginx

# 設定ファイル作成
sudo tee /etc/nginx/sites-available/psytech-jp > /dev/null <<'EOF'
server {
    listen 80;
    server_name psytech.jp www.psytech.jp;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/psytech-jp /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 2-3. Let's Encrypt 証明書取得

```bash
sudo apt install -y certbot python3-certbot-nginx

# 証明書取得（Nginx プラグイン）
sudo certbot --nginx -d psytech.jp -d www.psytech.jp \
  --non-interactive --agree-tos -m admin@psytech.jp

# 自動更新タイマー有効化
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
systemctl list-timers | grep certbot

# 更新後 Nginx リロードフック
sudo tee /etc/letsencrypt/renewal-hooks/post/reload-nginx.sh > /dev/null <<'EOF'
#!/bin/bash
systemctl reload nginx
EOF
sudo chmod +x /etc/letsencrypt/renewal-hooks/post/reload-nginx.sh

# 更新テスト（ドライラン）
sudo certbot renew --dry-run
```

---

## Phase 3: シークレット + 初回 Kamal デプロイ（Day 3）

### 3-1. 必要なシークレットを生成・設定

```bash
# SECRET_KEY_BASE
SECRET_KEY_BASE=$(openssl rand -hex 64)

# PII 暗号化キー（AES-256-GCM 対応の 32 バイト）
ATTR_ENCRYPTED_KEY=$(openssl rand -base64 32)

# DB / Redis パスワード
POSTGRES_PASSWORD=$(openssl rand -base64 24)
REDIS_PASSWORD=$(openssl rand -base64 24)

# 値をサーバーの ~/.bashrc または /etc/environment に保存
# （Kamal デプロイ時にシェルから読み込まれる）
cat >> ~/.bashrc <<ENVEOF

# PsyFit production secrets
export KAMAL_REGISTRY_PASSWORD=<GitHub PAT with packages:write>
export SECRET_KEY_BASE=$SECRET_KEY_BASE
export ATTR_ENCRYPTED_KEY=$ATTR_ENCRYPTED_KEY
export POSTGRES_PASSWORD=$POSTGRES_PASSWORD
export REDIS_PASSWORD=$REDIS_PASSWORD
export SMTP_ADDRESS=smtp.sendgrid.net
export SMTP_USERNAME=apikey
export SMTP_PASSWORD=<SendGrid API Key>
export ANTHROPIC_API_KEY=<Anthropic Console の API Key（AI機能使用時のみ）>
ENVEOF
source ~/.bashrc
```

> **重要**: `ANTHROPIC_API_KEY` は [Anthropic Console](https://console.anthropic.com/) でプロジェクトキーを発行。  
> AI 機能を使用しない場合は空文字のままで問題なし（`ANTHROPIC_API_KEY=` で起動可能）。

### 3-2. Kamal セットアップ + 初回デプロイ

```bash
# ローカル開発機から実行
cd /path/to/psyfit

# 環境変数を設定してから実行
export KAMAL_REGISTRY_PASSWORD=<GitHub PAT>
export SECRET_KEY_BASE=$(openssl rand -hex 64)
# ... 他のシークレットも設定 ...

# Kamal 初回セットアップ（SSH 鍵・Docker ネットワーク・DB/Redis コンテナ起動）
bin/kamal setup

# デプロイ（イメージビルド + コンテナ起動 + kamal-proxy 切り替え）
bin/kamal deploy

# 確認
curl -s https://psytech.jp/api/v1/health
```

### 3-3. DB マイグレーション + シードデータ

```bash
# マイグレーション実行
bin/kamal app exec "bin/rails db:migrate"

# 初期シードデータ投入（初回のみ）
bin/kamal app exec "bin/rails db:seed"
```

---

## Phase 4: PostgreSQL + バックアップ（Day 4）

### 4-1. バックアップスクリプトのテスト

```bash
# 手動でバックアップを実行して動作確認
/var/www/psyfit/bin/backup.sh

# 生成ファイルを確認
ls -lh /var/backups/psyfit/
gunzip -t /var/backups/psyfit/*.sql.gz && echo "OK"
```

### 4-2. crontab 設定

```bash
crontab -e

# 以下を追加
# 日次バックアップ（毎日 2:00 JST）
0 2 * * * /var/www/psyfit/bin/backup.sh >> /var/log/psyfit-backup.log 2>&1

# 週次 Docker クリーンアップ（毎週日曜 3:00 JST）
0 3 * * 0 /var/www/psyfit/bin/cleanup-docker.sh >> /var/log/psyfit-cleanup.log 2>&1
```

### 4-3. リストア訓練（月次推奨）

```bash
# 最新バックアップからリストア（テスト DB 使用）
bin/restore.sh --list
bin/restore.sh --latest
```

---

## Phase 5: 昼間のみワーカースケジューリング（Day 5）

Solid Queue のジョブワーカーは **8:00〜20:00 JST** の間のみ稼働する。  
これは `config/recurring.yml` の定期ジョブ（Solid Queue 内から）と  
`bin/worker-schedule` の cron（サーバー側）の 2 重構造で実現する。

### 5-1. 仕組み

| レイヤー | 仕組み | 役割 |
|---------|-------|------|
| `config/recurring.yml` | Solid Queue の定期ジョブとして `SolidQueue::Queue#pause/resume` を実行 | ジョブ処理内から自律制御（フォールバック） |
| `bin/worker-schedule` + crontab | サーバー cron から `bin/rails runner` でキュー操作 | 外部からの確実な制御（主制御） |

### 5-2. crontab 設定

> **前提**: サーバーのタイムゾーンが **JST (Asia/Tokyo)** であること。  
> 確認: `timedatectl | grep "Time zone"` → `Asia/Tokyo (JST, +0900)`  
> 変更: `sudo timedatectl set-timezone Asia/Tokyo`

```bash
crontab -e

# ワーカー再開: 毎日 8:00 JST
0 8 * * * /var/www/psyfit/bin/worker-schedule start >> /var/log/psyfit-worker.log 2>&1

# ワーカー停止: 毎日 20:00 JST
0 20 * * * /var/www/psyfit/bin/worker-schedule stop >> /var/log/psyfit-worker.log 2>&1
```

### 5-3. 動作確認

```bash
# 現在のキュー状態を確認
/var/www/psyfit/bin/worker-schedule status

# 手動で停止テスト（夜間シミュレーション）
/var/www/psyfit/bin/worker-schedule stop

# 手動で再開テスト
/var/www/psyfit/bin/worker-schedule start

# ログ確認
tail -20 /var/log/psyfit-worker.log
```

### 5-4. 留意事項

- キューは **最初のジョブがエンキューされた時点** で DB に作成される。  
  初回デプロイ直後にキューが0件の場合、`status` の出力は "No queues found" となる （正常）。
- 夜間に投入されたジョブは翌朝8時の再開後に処理される（キューに溜まったまま待機）。
- `JOB_CONCURRENCY` 環境変数でワーカープロセス数を調整可能（デフォルト: 1）。

---

## Phase 6: ログ + 監視 + アラート（Day 6）

### 6-1. crontab 完全設定（まとめ）

> **前提**: サーバーのタイムゾーンが **JST (Asia/Tokyo)** であること（Phase 5-2 参照）。

```bash
crontab -l
# 以下がすべて登録されていること:

# 死活監視（5分ごと）
*/5 * * * * /var/www/psyfit/bin/monitor.sh >> /var/log/psyfit-monitor.log 2>&1

# 日次バックアップ（2:00 JST）
0 2 * * * /var/www/psyfit/bin/backup.sh >> /var/log/psyfit-backup.log 2>&1

# ワーカー再開（8:00 JST）
0 8 * * * /var/www/psyfit/bin/worker-schedule start >> /var/log/psyfit-worker.log 2>&1

# ワーカー停止（20:00 JST）
0 20 * * * /var/www/psyfit/bin/worker-schedule stop >> /var/log/psyfit-worker.log 2>&1

# Docker クリーンアップ（毎週日曜 3:00 JST）
0 3 * * 0 /var/www/psyfit/bin/cleanup-docker.sh >> /var/log/psyfit-cleanup.log 2>&1
```

### 6-2. UptimeRobot 外形監視

1. [UptimeRobot](https://uptimerobot.com/) にアカウント登録（無料: 50モニター、5分間隔）
2. 「Add New Monitor」で以下を作成:

| 設定項目 | 値 |
|---------|------|
| Monitor Type | HTTP(s) |
| Friendly Name | PsyFit - Health Check |
| URL | `https://psytech.jp/api/v1/health` |
| Monitoring Interval | 5 minutes |
| Monitor Timeout | 30 seconds |

3. Alert Contacts でメール通知先を設定

### 6-3. ローカル監視テスト

```bash
# モニタースクリプトを手動実行
/var/www/psyfit/bin/monitor.sh

# SendGrid アラートのテスト（一時的に MONITOR_ALERT_EMAIL を設定）
MONITOR_ALERT_EMAIL=test@example.com SMTP_PASSWORD=SG.xxx /var/www/psyfit/bin/monitor.sh

# ログ確認
tail -30 /var/log/psyfit-monitor.log
```

---

## Phase 7: スモークテスト + ランブック確認（Day 7）

### 7-1. 本番稼働前チェックリスト

- [ ] `https://psytech.jp/api/v1/health` → HTTP 200
- [ ] 利用者ログイン（tanaka@example.com）
- [ ] 職員ログイン（STF001）
- [ ] パスワードリセットメール送信確認
- [ ] バックアップファイル生成確認（`ls /var/backups/psyfit/`）
- [ ] ワーカースケジュール crontab 確認（`crontab -l`）
- [ ] 監視アラートメール受信確認
- [ ] SSL 証明書有効期限 14 日以上
- [ ] ロールバック手順を 1 度実施して元に戻す

### 7-2. ロールバック手順（詳細）

#### 方法 A: Kamal でのロールバック

```bash
# デプロイ履歴を確認
bin/kamal app containers

# 直前のバージョンにロールバック
bin/kamal rollback <IMAGE_TAG>
```

#### 方法 B: 旧コンテナへの手動切り戻し

```bash
# 停止済みの旧コンテナを確認
docker ps -a --filter "name=psyfit-web-" --filter "status=exited"

# 旧コンテナを再起動
docker start <旧コンテナ名>

# 旧コンテナの IP を取得して kamal-proxy を切り替え
OLD_IP=$(docker inspect <旧コンテナ名> \
  --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}')
docker exec kamal-proxy kamal-proxy deploy psyfit-web \
  --target ${OLD_IP}:3000 --host psytech.jp

# 新コンテナを停止
docker stop <新コンテナ名>

# 動作確認
curl -s https://psytech.jp/api/v1/health
```

#### 方法 C: DB ロールバック（マイグレーション巻き戻し）

```bash
# 直前のマイグレーションを 1 つ戻す
bin/kamal app exec "bin/rails db:rollback STEP=1"

# 特定のバージョンに戻す
bin/kamal app exec "bin/rails db:migrate VERSION=<TARGET_VERSION>"
```

---

## CI/CD パイプライン

### GitHub Actions ワークフロー

| ワークフロー | ファイル | トリガー | 内容 |
|---|---|---|---|
| CI | `.github/workflows/ci.yml` | `main`/`develop` への push、PR | テスト・lint・セキュリティスキャン・ビルドチェック・E2E |
| Deploy | `.github/workflows/deploy.yml` | `main` への push | SSH経由で `bin/deploy.sh` を実行 |

### CI ワークフローの内容

1. **セキュリティスキャン**: Brakeman（Ruby）、bundler-audit、importmap audit（JS）
2. **Lint**: RuboCop
3. **バックエンドテスト**: RSpec + カバレッジ80%チェック
4. **フロントエンドテスト**: Vitest（User/Admin）+ カバレッジ80%チェック
5. **ビルドチェック**: frontend_user / frontend_admin のビルド確認
6. **E2Eテスト**: Playwright（バックエンドテスト通過後に実行）

### Deploy ワークフローの制限事項

`deploy.yml` は `bin/deploy.sh` を SSH 経由で実行するが、これは **systemd Puma のみ**を更新する。本番トラフィックは Docker/kamal-proxy 経由のため、**Docker コンテナの更新は別途手動で必要**（後述の方法1）。

## 正しいデプロイ手順

### ステップ1: ブランチで開発 → PR → CI → マージ

```bash
# 1. ブランチを切る
git checkout main
git pull origin main
git checkout -b fix/issue-description

# 2. 作業・コミット
git add <files>
git commit -m "fix: 説明"

# 3. push して PR 作成
git push -u origin fix/issue-description
gh pr create --title "fix: 説明" --body "変更内容の説明"

# 4. CI が通るのを待つ
gh run watch
# または GitHub の PR ページで確認

# 5. CI 全パス確認後、マージ
gh pr merge --merge
```

**重要**: main ブランチへの直接 push は禁止。必ず PR 経由でマージすること。

### ステップ2: Docker コンテナの更新（本番反映）

main へのマージ後、`deploy.yml` が自動で `bin/deploy.sh` を実行するが、これは systemd Puma のみ更新する。**本番に反映するには以下の Docker 再ビルドが必要。**

```bash
# 1. mainブランチの最新コードに切り替え
cd /var/www/psyfit
git checkout main
git pull origin main

# 2. Docker イメージをビルド
docker build -t psyfit-local:latest --platform linux/amd64 .

# 3. 現在のコンテナの環境変数を保存
docker exec <現在のコンテナ名> env | \
  grep -v "^HOSTNAME=" | grep -v "^KAMAL_" | grep -v "^PATH=" | \
  grep -v "^HOME=" | grep -v "^RUBY_DOWNLOAD" | grep -v "^BUNDLE_" | \
  grep -v "^GEM_HOME=" | grep -v "^LANG=" | grep -v "^LD_PRELOAD=" \
  > /tmp/psyfit_env.txt

# 4. RAILS_MASTER_KEY をソースコードに合わせて更新
# ※ config/master.key の値と一致させること
sed -i "s/RAILS_MASTER_KEY=.*/RAILS_MASTER_KEY=$(cat config/master.key)/" /tmp/psyfit_env.txt

# 5. 新しいコンテナを起動
docker run -d \
  --name psyfit-web-new \
  --network kamal \
  --env-file /tmp/psyfit_env.txt \
  -v psyfit_storage:/rails/storage \
  psyfit-local:latest

# 6. 起動確認（Puma が Listening になるまで待つ）
sleep 10
docker logs psyfit-web-new 2>&1 | tail -5

# 7. 新コンテナの IP を取得
NEW_IP=$(docker inspect psyfit-web-new --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}')

# 8. kamal-proxy を新コンテナに切り替え
docker exec kamal-proxy kamal-proxy deploy psyfit-web \
  --target ${NEW_IP}:3000 --host psytech.jp

# 9. 動作確認
curl -s -H "Host: psytech.jp" http://127.0.0.1:8080/api/v1/health
curl -s -H "Host: psytech.jp" http://127.0.0.1:8080/home | head -3

# 10. 問題なければ旧コンテナを停止
docker stop <旧コンテナ名>

# 11. クリーンアップ
rm -f /tmp/psyfit_env.txt
```

### まとめ: デプロイの全体フロー

```
feature/fix ブランチで作業
       ↓
  git push origin <branch>
       ↓
  gh pr create（PR を作成）
       ↓
  CI workflow が自動実行（テスト・lint・ビルド・E2E）
       ↓
  CI 全パス確認後、GitHub上でマージ
       ↓
  deploy.yml が自動実行 → bin/deploy.sh（systemd Puma 更新）
       ↓
  サーバーで Docker 再ビルド（上記ステップ2）を手動実行
       ↓
  本番反映完了
```

## ブランチ保護について

GitHub Free プラン（プライベートリポジトリ）では、ブランチ保護ルール（PR必須、CI パス必須）を設定できない。技術的には main への直接 push が可能だが、**運用ルールとして必ず PR 経由でマージすること**。

ブランチ保護を有効にするには:
- GitHub Pro/Team プランにアップグレード、または
- リポジトリを public にする

## 重要な環境変数

### Docker コンテナ内

| 変数 | 用途 | 注意 |
|------|------|------|
| `RAILS_MASTER_KEY` | credentials.yml.enc の復号 | `config/master.key` と一致必須 |
| `SECRET_KEY_BASE` | セッション暗号化 | 変更するとセッション無効化 |
| `ATTR_ENCRYPTED_KEY` | PII 暗号化 (AES-256-GCM) | 変更すると既存データ読めなくなる |
| `BLIND_INDEX_KEY` | メール検索用ハッシュ | 変更するとログイン不可 |
| `POSTGRES_PASSWORD` | DB 接続 | Docker psyfit-db と一致 |
| `REDIS_PASSWORD` | Redis 接続 | Docker psyfit-redis と一致 |
| `ANTHROPIC_API_KEY` | Claude AI API 認証 | AI 機能使用時のみ必須、空可 |

### Docker ネットワーク

コンテナ間通信はホスト名で行われます:
- DB: `psyfit-db` (Docker内部ネットワーク `kamal`)
- Redis: `psyfit-redis` (Docker内部ネットワーク `kamal`)

ホストからのアクセス:
- DB: `127.0.0.1:5433`
- Redis: `127.0.0.1:6380`

## トラブルシューティング

### コンテナが起動しない

```bash
# ログ確認
docker logs <コンテナ名> 2>&1 | tail -30

# よくある原因:
# - RAILS_MASTER_KEY 不一致 → "AEAD authentication tag verification failed"
# - DB 接続失敗 → "could not connect to server"
# - 暗号化キー未設定 → "ATTR_ENCRYPTED_KEY environment variable must be set"
```

### kamal-proxy のステータス確認

```bash
docker exec kamal-proxy kamal-proxy list
```

### 旧コンテナに戻す（ロールバック）

```bash
# 旧コンテナを再起動
docker start <旧コンテナ名>

# 旧コンテナの IP を取得
OLD_IP=$(docker inspect <旧コンテナ名> --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}')

# kamal-proxy を旧コンテナに向ける
docker exec kamal-proxy kamal-proxy deploy psyfit-web \
  --target ${OLD_IP}:3000 --host psytech.jp

# 新コンテナを停止
docker stop <新コンテナ名>
```

### Nginx 設定

設定ファイル: `/etc/nginx/sites-available/psytech-jp`

```bash
# 設定テスト
nginx -t

# リロード
systemctl reload nginx
```

## Dockerfile ビルドの注意点

- `ARG RUBY_VERSION` はファイル先頭（最初の FROM の前）に定義
- `assets:precompile` 時にダミーの暗号化キーが必要
- `.dockerignore` で `frontend_user/` と `frontend_admin/` を除外しないこと（マルチステージビルドで使用。`node_modules/` と `dist/` のみ除外）

## バックアップ・リストア

### 日次バックアップ

要件（[06-non-functional-requirements.md](06-non-functional-requirements.md) 準拠）:
- 対象: PostgreSQL データベース
- 頻度: 日次（深夜 2:00）
- 保持期間: 30日間
- 保存先: `/var/backups/psyfit/`

#### バックアップスクリプト

```bash
# 手動実行
bin/backup.sh

# 実行結果の確認
ls -lh /var/backups/psyfit/
```

#### crontab 設定（本番サーバーで実行）

```bash
# crontab を編集
crontab -e

# 以下の行を追加（毎日深夜2:00に実行）
0 2 * * * /var/www/psyfit/bin/backup.sh >> /var/log/psyfit-backup.log 2>&1
```

#### crontab 設定確認

```bash
# 設定済みか確認
crontab -l | grep backup

# ログ確認
tail -20 /var/log/psyfit-backup.log
```

### リストア手順

```bash
# 利用可能なバックアップを一覧表示
bin/restore.sh --list

# 最新のバックアップからリストア
bin/restore.sh --latest

# 特定のバックアップファイルからリストア
bin/restore.sh /var/backups/psyfit/psyfit_production_20260214_020000.sql.gz
```

**注意**: リストア実行前に自動で現在のDBのバックアップを取得します（`pre_restore_*`）。リストア後に問題があれば、このファイルから再度リストアできます。

### バックアップ検証（月次推奨）

```bash
# 1. バックアップファイルの整合性チェック
gunzip -t /var/backups/psyfit/psyfit_production_YYYYMMDD_HHMMSS.sql.gz

# 2. バックアップの容量推移確認
ls -lhS /var/backups/psyfit/

# 3. ディスク空き容量確認
df -h /var/backups/
```

---

## Docker 定期クリーンアップ

デプロイを繰り返すと古いイメージやビルドキャッシュが蓄積する。週次で自動クリーンアップを実行する。

### クリーンアップ対象

| 対象 | 処理 | 保持 |
|------|------|------|
| 停止済み `psyfit-web-*` コンテナ | 古いものを削除 | 直近1つ（ロールバック用） |
| ダングリングイメージ | 全て削除 | なし |
| `psyfit-local` イメージ | 古いものを削除 | 直近2つ |
| ビルドキャッシュ | 7日以上前を削除 | 7日以内 |

### 手動実行

```bash
bin/cleanup-docker.sh
```

### crontab 設定（毎週日曜 3:00）

```bash
crontab -e

# 以下の行を追加
0 3 * * 0 /var/www/psyfit/bin/cleanup-docker.sh >> /var/log/psyfit-cleanup.log 2>&1
```

---

## SSL 証明書管理

### 現在の構成

| 項目 | 値 |
|------|------|
| ドメイン | psytech.jp |
| 発行者 | Let's Encrypt (E8) |
| 証明書期間 | 90日間 |
| 自動更新 | certbot (要確認) |
| SSL終端 | Nginx (:443) |

### 証明書の確認

```bash
# 証明書の有効期限を確認
echo | openssl s_client -servername psytech.jp -connect psytech.jp:443 2>/dev/null \
  | openssl x509 -noout -dates -subject -issuer

# certbot で管理している証明書を確認
sudo certbot certificates
```

### 自動更新の確認

```bash
# certbot 自動更新タイマーの確認
systemctl list-timers | grep certbot

# 更新テスト（ドライラン）— 実際の更新は行わない
sudo certbot renew --dry-run

# certbot の更新ログ確認
sudo cat /var/log/letsencrypt/letsencrypt.log | tail -30
```

### 手動更新（緊急時）

```bash
# 証明書を手動更新
sudo certbot renew

# Nginx をリロードして新しい証明書を反映
sudo systemctl reload nginx
```

### 自動更新が設定されていない場合

```bash
# certbot の自動更新タイマーを有効化
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# 更新後にNginxをリロードするフック設定
echo '#!/bin/bash' | sudo tee /etc/letsencrypt/renewal-hooks/post/reload-nginx.sh
echo 'systemctl reload nginx' | sudo tee -a /etc/letsencrypt/renewal-hooks/post/reload-nginx.sh
sudo chmod +x /etc/letsencrypt/renewal-hooks/post/reload-nginx.sh
```

---

## 監視

### ヘルスチェックエンドポイント

| URL | 用途 |
|-----|------|
| `https://psytech.jp/api/v1/health` | アプリケーション死活監視 |

レスポンス例:
```json
{
  "status": "success",
  "data": {
    "health_status": "healthy",
    "timestamp": "2026-02-14T14:06:19+09:00",
    "version": "1.0.0"
  }
}
```

### UptimeRobot 設定手順

1. [UptimeRobot](https://uptimerobot.com/) にアカウント登録（無料プラン: 50モニター、5分間隔）
2. 「Add New Monitor」をクリック
3. 以下の設定で作成:

| 設定項目 | 値 |
|---------|------|
| Monitor Type | HTTP(s) |
| Friendly Name | PsyFit - Health Check |
| URL | `https://psytech.jp/api/v1/health` |
| Monitoring Interval | 5 minutes |
| Monitor Timeout | 30 seconds |

4. Alert Contacts でメール通知先を設定
5. 「Create Monitor」で保存

### 追加推奨モニター

| モニター名 | URL | タイプ |
|-----------|-----|--------|
| PsyFit - User App | `https://psytech.jp/` | HTTP(s) - Keyword "PsyFit" |
| PsyFit - SSL | `https://psytech.jp/` | HTTP(s) - SSL有効期限アラート |

### ローカルヘルスチェック（補助）

本番サーバーの crontab に追加して、UptimeRobot の補完として使用:

```bash
# 10分ごとにヘルスチェック、失敗時にログ記録
*/10 * * * * curl -sf --max-time 10 https://psytech.jp/api/v1/health > /dev/null 2>&1 || echo "[$(date)] Health check FAILED" >> /var/log/psyfit-health.log
```

---

## SMTP 設定（SendGrid）

### 前提条件

- SendGrid アカウント作成済み
- API Key 発行済み（Mail Send 権限）
- 送信元ドメイン認証済み（Domain Authentication）

### 本番サーバーでの環境変数設定

```bash
# .kamal/secrets を使用する場合（Kamal デプロイ時）
export SMTP_ADDRESS=smtp.sendgrid.net
export SMTP_USERNAME=apikey
export SMTP_PASSWORD=SG.xxxxx  # SendGrid API Key

# Docker コンテナに直接設定する場合
docker exec <コンテナ名> env | grep SMTP  # 現在の設定確認
```

### 送信テスト

```bash
# Rails console でテストメール送信
docker exec -it <コンテナ名> bin/rails console

# console 内で実行:
# UserMailer.password_reset_instructions(User.first, "test-token").deliver_now
```

### SendGrid 設定手順

1. [SendGrid](https://sendgrid.com/) にサインアップ（無料: 100通/日）
2. Settings → API Keys → Create API Key（Restricted Access: Mail Send のみ）
3. Settings → Sender Authentication → Domain Authentication で `psytech.jp` を認証
4. DNS に CNAME レコードを追加（SendGrid が指定する値）
5. 環境変数にAPI Keyを設定

---

## 今後の改善候補

- `deploy.yml` を Docker 再ビルド + kamal-proxy 切り替えに対応させ、main マージだけで本番反映を完結させる
- GitHub Pro/Team プランで main ブランチ保護を有効化（PR 必須 + CI パス必須）
- Sentry 統合（エラートラッキング）
- GitHub Actions デプロイ失敗時の Slack 通知
- バックアップの外部ストレージ（S3等）への転送


## CI/CD パイプライン

### GitHub Actions ワークフロー

| ワークフロー | ファイル | トリガー | 内容 |
|---|---|---|---|
| CI | `.github/workflows/ci.yml` | `main`/`develop` への push、PR | テスト・lint・セキュリティスキャン・ビルドチェック・E2E |
| Deploy | `.github/workflows/deploy.yml` | `main` への push | SSH経由で `bin/deploy.sh` を実行 |

### CI ワークフローの内容

1. **セキュリティスキャン**: Brakeman（Ruby）、bundler-audit、importmap audit（JS）
2. **Lint**: RuboCop
3. **バックエンドテスト**: RSpec + カバレッジ80%チェック
4. **フロントエンドテスト**: Vitest（User/Admin）+ カバレッジ80%チェック
5. **ビルドチェック**: frontend_user / frontend_admin のビルド確認
6. **E2Eテスト**: Playwright（バックエンドテスト通過後に実行）

### Deploy ワークフローの制限事項

`deploy.yml` は `bin/deploy.sh` を SSH 経由で実行するが、これは **systemd Puma のみ**を更新する。本番トラフィックは Docker/kamal-proxy 経由のため、**Docker コンテナの更新は別途手動で必要**（後述の方法1）。

## 正しいデプロイ手順

### ステップ1: ブランチで開発 → PR → CI → マージ

```bash
# 1. ブランチを切る
git checkout main
git pull origin main
git checkout -b fix/issue-description

# 2. 作業・コミット
git add <files>
git commit -m "fix: 説明"

# 3. push して PR 作成
git push -u origin fix/issue-description
gh pr create --title "fix: 説明" --body "変更内容の説明"

# 4. CI が通るのを待つ
gh run watch
# または GitHub の PR ページで確認

# 5. CI 全パス確認後、マージ
gh pr merge --merge
```

**重要**: main ブランチへの直接 push は禁止。必ず PR 経由でマージすること。

### ステップ2: Docker コンテナの更新（本番反映）

main へのマージ後、`deploy.yml` が自動で `bin/deploy.sh` を実行するが、これは systemd Puma のみ更新する。**本番に反映するには以下の Docker 再ビルドが必要。**

```bash
# 1. mainブランチの最新コードに切り替え
cd /var/www/psyfit
git checkout main
git pull origin main

# 2. Docker イメージをビルド
docker build -t psyfit-local:latest --platform linux/amd64 .

# 3. 現在のコンテナの環境変数を保存
docker exec <現在のコンテナ名> env | \
  grep -v "^HOSTNAME=" | grep -v "^KAMAL_" | grep -v "^PATH=" | \
  grep -v "^HOME=" | grep -v "^RUBY_DOWNLOAD" | grep -v "^BUNDLE_" | \
  grep -v "^GEM_HOME=" | grep -v "^LANG=" | grep -v "^LD_PRELOAD=" \
  > /tmp/psyfit_env.txt

# 4. RAILS_MASTER_KEY をソースコードに合わせて更新
# ※ config/master.key の値と一致させること
sed -i "s/RAILS_MASTER_KEY=.*/RAILS_MASTER_KEY=$(cat config/master.key)/" /tmp/psyfit_env.txt

# 5. 新しいコンテナを起動
docker run -d \
  --name psyfit-web-new \
  --network kamal \
  --env-file /tmp/psyfit_env.txt \
  -v psyfit_storage:/rails/storage \
  psyfit-local:latest

# 6. 起動確認（Puma が Listening になるまで待つ）
sleep 10
docker logs psyfit-web-new 2>&1 | tail -5

# 7. 新コンテナの IP を取得
NEW_IP=$(docker inspect psyfit-web-new --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}')

# 8. kamal-proxy を新コンテナに切り替え
docker exec kamal-proxy kamal-proxy deploy psyfit-web \
  --target ${NEW_IP}:3000 --host psytech.jp

# 9. 動作確認
curl -s -H "Host: psytech.jp" http://127.0.0.1:8080/api/v1/health
curl -s -H "Host: psytech.jp" http://127.0.0.1:8080/home | head -3

# 10. 問題なければ旧コンテナを停止
docker stop <旧コンテナ名>

# 11. クリーンアップ
rm -f /tmp/psyfit_env.txt
```

### まとめ: デプロイの全体フロー

```
feature/fix ブランチで作業
       ↓
  git push origin <branch>
       ↓
  gh pr create（PR を作成）
       ↓
  CI workflow が自動実行（テスト・lint・ビルド・E2E）
       ↓
  CI 全パス確認後、GitHub上でマージ
       ↓
  deploy.yml が自動実行 → bin/deploy.sh（systemd Puma 更新）
       ↓
  サーバーで Docker 再ビルド（上記ステップ2）を手動実行
       ↓
  本番反映完了
```

## ブランチ保護について

GitHub Free プラン（プライベートリポジトリ）では、ブランチ保護ルール（PR必須、CI パス必須）を設定できない。技術的には main への直接 push が可能だが、**運用ルールとして必ず PR 経由でマージすること**。

ブランチ保護を有効にするには:
- GitHub Pro/Team プランにアップグレード、または
- リポジトリを public にする

## 重要な環境変数

### Docker コンテナ内

| 変数 | 用途 | 注意 |
|------|------|------|
| `RAILS_MASTER_KEY` | credentials.yml.enc の復号 | `config/master.key` と一致必須 |
| `SECRET_KEY_BASE` | セッション暗号化 | 変更するとセッション無効化 |
| `ATTR_ENCRYPTED_KEY` | PII 暗号化 (AES-256-GCM) | 変更すると既存データ読めなくなる |
| `BLIND_INDEX_KEY` | メール検索用ハッシュ | 変更するとログイン不可 |
| `POSTGRES_PASSWORD` | DB 接続 | Docker psyfit-db と一致 |
| `REDIS_PASSWORD` | Redis 接続 | Docker psyfit-redis と一致 |

### Docker ネットワーク

コンテナ間通信はホスト名で行われます:
- DB: `psyfit-db` (Docker内部ネットワーク `kamal`)
- Redis: `psyfit-redis` (Docker内部ネットワーク `kamal`)

ホストからのアクセス:
- DB: `127.0.0.1:5433`
- Redis: `127.0.0.1:6380`

## トラブルシューティング

### コンテナが起動しない

```bash
# ログ確認
docker logs <コンテナ名> 2>&1 | tail -30

# よくある原因:
# - RAILS_MASTER_KEY 不一致 → "AEAD authentication tag verification failed"
# - DB 接続失敗 → "could not connect to server"
# - 暗号化キー未設定 → "ATTR_ENCRYPTED_KEY environment variable must be set"
```

### kamal-proxy のステータス確認

```bash
docker exec kamal-proxy kamal-proxy list
```

### 旧コンテナに戻す（ロールバック）

```bash
# 旧コンテナを再起動
docker start <旧コンテナ名>

# 旧コンテナの IP を取得
OLD_IP=$(docker inspect <旧コンテナ名> --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}')

# kamal-proxy を旧コンテナに向ける
docker exec kamal-proxy kamal-proxy deploy psyfit-web \
  --target ${OLD_IP}:3000 --host psytech.jp

# 新コンテナを停止
docker stop <新コンテナ名>
```

### Nginx 設定

設定ファイル: `/etc/nginx/sites-available/psytech-jp`

```bash
# 設定テスト
nginx -t

# リロード
systemctl reload nginx
```

## Dockerfile ビルドの注意点

- `ARG RUBY_VERSION` はファイル先頭（最初の FROM の前）に定義
- `assets:precompile` 時にダミーの暗号化キーが必要
- `.dockerignore` で `frontend_user/` と `frontend_admin/` を除外しないこと（マルチステージビルドで使用。`node_modules/` と `dist/` のみ除外）

## バックアップ・リストア

### 日次バックアップ

要件（[06-non-functional-requirements.md](06-non-functional-requirements.md) 準拠）:
- 対象: PostgreSQL データベース
- 頻度: 日次（深夜 2:00）
- 保持期間: 30日間
- 保存先: `/var/backups/psyfit/`

#### バックアップスクリプト

```bash
# 手動実行
bin/backup.sh

# 実行結果の確認
ls -lh /var/backups/psyfit/
```

#### crontab 設定（本番サーバーで実行）

```bash
# crontab を編集
crontab -e

# 以下の行を追加（毎日深夜2:00に実行）
0 2 * * * /var/www/psyfit/bin/backup.sh >> /var/log/psyfit-backup.log 2>&1
```

#### crontab 設定確認

```bash
# 設定済みか確認
crontab -l | grep backup

# ログ確認
tail -20 /var/log/psyfit-backup.log
```

### リストア手順

```bash
# 利用可能なバックアップを一覧表示
bin/restore.sh --list

# 最新のバックアップからリストア
bin/restore.sh --latest

# 特定のバックアップファイルからリストア
bin/restore.sh /var/backups/psyfit/psyfit_production_20260214_020000.sql.gz
```

**注意**: リストア実行前に自動で現在のDBのバックアップを取得します（`pre_restore_*`）。リストア後に問題があれば、このファイルから再度リストアできます。

### バックアップ検証（月次推奨）

```bash
# 1. バックアップファイルの整合性チェック
gunzip -t /var/backups/psyfit/psyfit_production_YYYYMMDD_HHMMSS.sql.gz

# 2. バックアップの容量推移確認
ls -lhS /var/backups/psyfit/

# 3. ディスク空き容量確認
df -h /var/backups/
```

---

## Docker 定期クリーンアップ

デプロイを繰り返すと古いイメージやビルドキャッシュが蓄積する。週次で自動クリーンアップを実行する。

### クリーンアップ対象

| 対象 | 処理 | 保持 |
|------|------|------|
| 停止済み `psyfit-web-*` コンテナ | 古いものを削除 | 直近1つ（ロールバック用） |
| ダングリングイメージ | 全て削除 | なし |
| `psyfit-local` イメージ | 古いものを削除 | 直近2つ |
| ビルドキャッシュ | 7日以上前を削除 | 7日以内 |

### 手動実行

```bash
bin/cleanup-docker.sh
```

### crontab 設定（毎週日曜 3:00）

```bash
crontab -e

# 以下の行を追加
0 3 * * 0 /var/www/psyfit/bin/cleanup-docker.sh >> /var/log/psyfit-cleanup.log 2>&1
```

### crontab 設定確認

```bash
# 設定済みか確認
crontab -l | grep cleanup

# ログ確認
tail -30 /var/log/psyfit-cleanup.log
```

---

## SSL 証明書管理

### 現在の構成

| 項目 | 値 |
|------|------|
| ドメイン | psytech.jp |
| 発行者 | Let's Encrypt (E8) |
| 証明書期間 | 90日間 |
| 自動更新 | certbot (要確認) |
| SSL終端 | Nginx (:443) |

### 証明書の確認

```bash
# 証明書の有効期限を確認
echo | openssl s_client -servername psytech.jp -connect psytech.jp:443 2>/dev/null \
  | openssl x509 -noout -dates -subject -issuer

# certbot で管理している証明書を確認
sudo certbot certificates
```

### 自動更新の確認

```bash
# certbot 自動更新タイマーの確認
systemctl list-timers | grep certbot

# 更新テスト（ドライラン）— 実際の更新は行わない
sudo certbot renew --dry-run

# certbot の更新ログ確認
sudo cat /var/log/letsencrypt/letsencrypt.log | tail -30
```

### 手動更新（緊急時）

```bash
# 証明書を手動更新
sudo certbot renew

# Nginx をリロードして新しい証明書を反映
sudo systemctl reload nginx
```

### 自動更新が設定されていない場合

```bash
# certbot の自動更新タイマーを有効化
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# 更新後にNginxをリロードするフック設定
echo '#!/bin/bash' | sudo tee /etc/letsencrypt/renewal-hooks/post/reload-nginx.sh
echo 'systemctl reload nginx' | sudo tee -a /etc/letsencrypt/renewal-hooks/post/reload-nginx.sh
sudo chmod +x /etc/letsencrypt/renewal-hooks/post/reload-nginx.sh
```

---

## 監視

### ヘルスチェックエンドポイント

| URL | 用途 |
|-----|------|
| `https://psytech.jp/api/v1/health` | アプリケーション死活監視 |

レスポンス例:
```json
{
  "status": "success",
  "data": {
    "health_status": "healthy",
    "timestamp": "2026-02-14T14:06:19+09:00",
    "version": "1.0.0"
  }
}
```

### UptimeRobot 設定手順

1. [UptimeRobot](https://uptimerobot.com/) にアカウント登録（無料プラン: 50モニター、5分間隔）
2. 「Add New Monitor」をクリック
3. 以下の設定で作成:

| 設定項目 | 値 |
|---------|------|
| Monitor Type | HTTP(s) |
| Friendly Name | PsyFit - Health Check |
| URL | `https://psytech.jp/api/v1/health` |
| Monitoring Interval | 5 minutes |
| Monitor Timeout | 30 seconds |

4. Alert Contacts でメール通知先を設定
5. 「Create Monitor」で保存

### 追加推奨モニター

| モニター名 | URL | タイプ |
|-----------|-----|--------|
| PsyFit - User App | `https://psytech.jp/` | HTTP(s) - Keyword "PsyFit" |
| PsyFit - SSL | `https://psytech.jp/` | HTTP(s) - SSL有効期限アラート |

### ローカルヘルスチェック（補助）

本番サーバーの crontab に追加して、UptimeRobot の補完として使用:

```bash
# 10分ごとにヘルスチェック、失敗時にログ記録
*/10 * * * * curl -sf --max-time 10 https://psytech.jp/api/v1/health > /dev/null 2>&1 || echo "[$(date)] Health check FAILED" >> /var/log/psyfit-health.log
```

---

## SMTP 設定（SendGrid）

### 前提条件

- SendGrid アカウント作成済み
- API Key 発行済み（Mail Send 権限）
- 送信元ドメイン認証済み（Domain Authentication）

### 本番サーバーでの環境変数設定

```bash
# .kamal/secrets を使用する場合（Kamal デプロイ時）
export SMTP_ADDRESS=smtp.sendgrid.net
export SMTP_USERNAME=apikey
export SMTP_PASSWORD=SG.xxxxx  # SendGrid API Key

# Docker コンテナに直接設定する場合
docker exec <コンテナ名> env | grep SMTP  # 現在の設定確認
```

### 送信テスト

```bash
# Rails console でテストメール送信
docker exec -it <コンテナ名> bin/rails console

# console 内で実行:
# UserMailer.password_reset_instructions(User.first, "test-token").deliver_now
```

### SendGrid 設定手順

1. [SendGrid](https://sendgrid.com/) にサインアップ（無料: 100通/日）
2. Settings → API Keys → Create API Key（Restricted Access: Mail Send のみ）
3. Settings → Sender Authentication → Domain Authentication で `psytech.jp` を認証
4. DNS に CNAME レコードを追加（SendGrid が指定する値）
5. 環境変数にAPI Keyを設定

---

## 今後の改善候補

- `deploy.yml` を Docker 再ビルド + kamal-proxy 切り替えに対応させ、main マージだけで本番反映を完結させる
- GitHub Pro/Team プランで main ブランチ保護を有効化（PR 必須 + CI パス必須）
- Sentry 統合（エラートラッキング）
- GitHub Actions デプロイ失敗時の Slack 通知
- バックアップの外部ストレージ（S3等）への転送
