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

## 今後の改善候補

- `deploy.yml` を Docker 再ビルド + kamal-proxy 切り替えに対応させ、main マージだけで本番反映を完結させる
- GitHub Pro/Team プランで main ブランチ保護を有効化（PR 必須 + CI パス必須）
