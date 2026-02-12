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

## デプロイ方法

### 方法1: Docker イメージの再ビルド（推奨）

コードの変更を反映するにはDockerイメージを再ビルドしてデプロイします。

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

### 方法2: GitHub Actions 自動デプロイ

`main` ブランチへの push で `.github/workflows/deploy.yml` が実行されます。
これは `bin/deploy.sh` を SSH 経由で実行し、systemd の Puma を更新します。

**注意**: この方法は systemd の Puma を更新しますが、本番トラフィックは Docker コンテナ経由で配信されます。Docker コンテナの更新には方法1を使用してください。

### 方法3: bin/deploy.sh（SSH デプロイ）

```bash
/var/www/psyfit/bin/deploy.sh
```

systemd Puma + public/ のフロントエンドを更新します。
本番トラフィックが kamal-proxy 経由の場合は、方法1も併用してください。

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
- `.dockerignore` で `frontend_user/` と `frontend_admin/` を除外しないこと（マルチステージビルドで使用）
