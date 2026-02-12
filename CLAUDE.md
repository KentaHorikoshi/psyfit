# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PsyFit - リハビリ運動支援アプリ（利用者向け・職員向け 統合版）

サイテック病院向けに、患者様が自宅でリハビリ運動を継続的に実施し、その結果を医療スタッフが効率的に確認・管理できるシステム。

**クライアント**: サイテック病院
**バージョン**: 4.1 (基本設計書v4.1準拠)

## Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 6.3.5
- **CSS Framework**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **Charts**: Recharts 2.15.2
- **Routing**: React Router

### Backend
- **Framework**: Ruby on Rails 8 (API mode)
- **Database**: PostgreSQL 16
- **Cache/Session**: Redis 7
- **Authentication**: Session-based auth
- **Container**: Docker + Docker Compose

## Critical Rules

### 1. Code Organization
- Many small files over few large files
- High cohesion, low coupling
- 200-400 lines typical, 800 max per file
- Organize by feature/domain, not by type

### 2. Design System Compliance
- Follow design system in `.claude/docs/02-screen-design.md`
- Use defined color palette (primary: #1E40AF, green: #10B981, amber: #F59E0B)
- Maintain consistent UI patterns between src_user and src_admin
- Ensure accessibility (WCAG 2.1 AA, minimum 16px font, 44x44px tap targets)

### 3. Security Requirements
- No hardcoded secrets
- Environment variables for sensitive data
- Parameterized queries only
- Session-based authentication with timeout (利用者: 30分, 職員: 15分)
- Encrypt PII data (name, name_kana, email, birth_date) with AES-256-GCM
- Log all access in audit_logs table

### 4. UI Implementation Guidelines
- **利用者向け (User)**: Mobile-first, simple navigation (max 3 main menu items)
- **職員向け (Staff)**: Sidebar-centric SPA, PC/tablet optimized
- Use status badges with specific colors:
  - 急性期: bg-red-100 text-red-700
  - 回復期: bg-yellow-100 text-yellow-700
  - 維持期: bg-green-100 text-green-700

### 5. Testing
- TDD: Write tests first
- 80% minimum coverage
- 100% coverage for authentication, security, and financial calculations

## Development Server

### 起動方法

```bash
# 1. バックエンド (Rails API) - ポート4001
bin/rails server -b 0.0.0.0 -p 4001

# 2. フロントエンド (利用者向け) - ポート3000
cd frontend_user && npm run dev -- --host 0.0.0.0 --port 3000

# 3. フロントエンド (職員向け) - ポート3003
cd frontend_admin && npm run dev -- --host 0.0.0.0 --port 3003
```

### アクセスURL

| アプリ | URL |
|--------|-----|
| 利用者向けフロントエンド | http://localhost:3000 |
| 職員向けフロントエンド | http://localhost:3003 |
| バックエンドAPI | http://localhost:4001 |
| APIヘルスチェック | http://localhost:4001/api/v1/health |

### Docker環境での起動

```bash
# 初回セットアップ（.env作成、ビルド、DB作成）
bin/docker-setup

# 全サービス起動
bin/docker-start

# バックグラウンド起動
bin/docker-start -d

# 特定サービスのみ起動
bin/docker-start api       # APIのみ
bin/docker-start db        # DB+Redisのみ
bin/docker-start frontend  # フロントエンドのみ

# 停止
bin/docker-start stop

# Docker環境テスト（41項目）
bin/docker-test
```

### 開発用アカウント

```bash
# シードデータ投入
bin/rails db:seed
```

| 種別 | ID/メール | パスワード |
|------|-----------|-----------|
| マネージャー | MGR001 | Manager1! |
| 職員 | STF001 | Staff123! |
| 職員 | STF002 | Staff123! |
| 利用者 | tanaka@example.com | Patient1! |
| 利用者 | takahashi@example.com | Patient1! |

## Production Environment

### 本番環境構成

| コンポーネント | 詳細 |
|-------------|------|
| サーバー | 160.251.230.38 (vm-58ab50c7-ca) |
| ドメイン | https://psytech.jp |
| Web サーバー | Nginx → kamal-proxy → Docker コンテナ |
| アプリケーション | Rails 8 (Puma) + React SPA |
| データベース | PostgreSQL 16 (Docker: psyfit-db) |
| キャッシュ | Redis 7 (Docker: psyfit-redis) |
| コンテナ管理 | Kamal (kamal-proxy) |

### トラフィックフロー

```
Client (HTTPS)
  → Nginx (:443, SSL終端)
    → kamal-proxy (:8080)
      → Docker コンテナ (:3000, Rails/Puma)
        → psyfit-db (PostgreSQL, Docker内部ネットワーク)
        → psyfit-redis (Redis, Docker内部ネットワーク)
```

**注意**: サーバー上には systemd Puma も存在するが、本番トラフィックは Docker/kamal-proxy 経由で配信される。

### 重要な環境変数

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

`deploy.yml` は `bin/deploy.sh` を SSH 経由で実行するが、これは **systemd Puma のみ**を更新する。本番トラフィックは Docker/kamal-proxy 経由のため、**Docker コンテナの更新は別途手動で必要**。

## Deploy手順

### ステップ1: ブランチで開発 → PR → CI → マージ

```bash
# 1. ブランチを切る
git checkout main && git pull origin main
git checkout -b fix/issue-description

# 2. 作業・コミット
git add <files>
git commit -m "fix: 説明"

# 3. push して PR 作成
git push -u origin fix/issue-description
gh pr create --title "fix: 説明" --body "変更内容の説明"

# 4. CI が通るのを待つ → マージ
gh pr merge --merge
```

**重要**: main ブランチへの直接 push は禁止。必ず PR 経由でマージすること。

### ステップ2: Docker コンテナの更新（本番反映）

main へのマージ後、`deploy.yml` が `bin/deploy.sh` を自動実行するが systemd Puma のみ更新。**本番に反映するには以下の Docker 再ビルドが必要。**

```bash
# 1. mainブランチの最新コードに切り替え
cd /var/www/psyfit
git checkout main && git pull origin main

# 2. Docker イメージをビルド
docker build -t psyfit-local:latest --platform linux/amd64 .

# 3. 現在のコンテナの環境変数を保存
docker exec <現在のコンテナ名> env | \
  grep -v "^HOSTNAME=" | grep -v "^KAMAL_" | grep -v "^PATH=" | \
  grep -v "^HOME=" | grep -v "^RUBY_DOWNLOAD" | grep -v "^BUNDLE_" | \
  grep -v "^GEM_HOME=" | grep -v "^LANG=" | grep -v "^LD_PRELOAD=" \
  > /tmp/psyfit_env.txt

# 4. RAILS_MASTER_KEY をソースコードに合わせて更新
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

# 7. 新コンテナの IP を取得 → kamal-proxy を切り替え
NEW_IP=$(docker inspect psyfit-web-new --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}')
docker exec kamal-proxy kamal-proxy deploy psyfit-web \
  --target ${NEW_IP}:3000 --host psytech.jp

# 8. 動作確認
curl -s -H "Host: psytech.jp" http://127.0.0.1:8080/api/v1/health
curl -s -H "Host: psytech.jp" http://127.0.0.1:8080/home | head -3

# 9. 問題なければ旧コンテナを停止・クリーンアップ
docker stop <旧コンテナ名>
rm -f /tmp/psyfit_env.txt
```

### デプロイの全体フロー

```
feature/fix ブランチで作業
  → git push origin <branch>
  → gh pr create（PR を作成）
  → CI workflow が自動実行（テスト・lint・ビルド・E2E）
  → CI 全パス確認後、GitHub上でマージ
  → deploy.yml が自動実行 → bin/deploy.sh（systemd Puma 更新）
  → サーバーで Docker 再ビルド（上記ステップ2）を手動実行
  → 本番反映完了
```

### ロールバック

```bash
# 旧コンテナを再起動
docker start <旧コンテナ名>

# 旧コンテナの IP を取得 → kamal-proxy を旧コンテナに向ける
OLD_IP=$(docker inspect <旧コンテナ名> --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}')
docker exec kamal-proxy kamal-proxy deploy psyfit-web \
  --target ${OLD_IP}:3000 --host psytech.jp

# 新コンテナを停止
docker stop <新コンテナ名>
```

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

### Nginx 設定

```bash
# 設定ファイル: /etc/nginx/sites-available/psytech-jp
nginx -t          # 設定テスト
systemctl reload nginx  # リロード
```

### Dockerfile ビルドの注意点

- `ARG RUBY_VERSION` はファイル先頭（最初の FROM の前）に定義
- `assets:precompile` 時にダミーの暗号化キーが必要
- `.dockerignore` で `frontend_user/` と `frontend_admin/` を除外しないこと（マルチステージビルドで使用。`node_modules/` と `dist/` のみ除外）

## File Structure

```
psyfit/
├── frontend_user/         # 利用者向けアプリ (U-01〜U-15画面)
│   └── src/
├── frontend_admin/        # 職員向けアプリ (S-01〜S-09画面)
│   └── src/
├── app/                   # Rails backend
├── .claude/
│   ├── docs/              # Design specifications
│   ├── agents/            # Specialized agents
│   └── skills/            # Reusable skills
├── Dockerfile             # 本番用 (マルチステージビルド)
├── Dockerfile.dev         # 開発用
├── docker-compose.yml     # 開発環境 (api, db, redis, frontends)
├── docker-compose.prod.yml # 本番環境 (api, db, redis)
├── .env.example           # 環境変数テンプレート
├── .env.docker            # Docker開発用デフォルト値
├── bin/docker-setup       # 初回セットアップ
├── bin/docker-start       # 起動スクリプト
├── bin/docker-test        # Docker環境テスト
├── bin/deploy.sh          # デプロイスクリプト (systemd Puma用)
├── .github/workflows/
│   ├── ci.yml             # CI ワークフロー
│   └── deploy.yml         # Deploy ワークフロー
└── CLAUDE.md              # This file
```

## Screen Design Reference

### 利用者向け画面 (U-01〜U-15)
- U-01: ログイン
- U-02: トップ (ホーム)
- U-03: 運動メニュー選択
- U-04: 運動実施 (動画)
- U-07: 履歴一覧
- U-08: 測定値履歴
- U-10: ウェルカム (継続日数表示)
- U-11: 運動カード
- U-13: 祝福 (達成感演出)
- U-14: 体調入力 (痛み・調子スライダー)
- U-15: まとめて記録

### 職員向け画面 (S-01〜S-09)
- S-01: ログイン
- S-02: ダッシュボード
- S-03: 患者一覧
- S-04: 患者詳細
- S-05: 測定値入力
- S-06: 運動メニュー設定
- S-07: レポート出力
- S-08: 職員管理 (マネージャーのみ)
- S-09: パスワードリセット
- S-10: 運動メニュー管理 (運動マスタ一覧・新規登録)

## Available Commands

Commands are located in `.claude/skills/`:

- `/tdd` - Test-driven development workflow
- `/plan` - Create implementation plan before coding
- `/code-review` - Review code quality and security
- `/build-fix` - Fix build errors

## Development Workflow

1. Use `/plan` to create implementation plan
2. Get user approval before implementation
3. Use `/tdd` to implement with tests first
4. Run tests and ensure 80%+ coverage
5. Use `/code-review` for final review
6. Update relevant docs in `.claude/docs/` if implementation changes schema, API, screens, or test scope
7. Generate a git commit message following conventional commits format and output it to the user
8. Commit after user approval

## Git Workflow

- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- Never commit to main directly (必ず PR 経由でマージ)
- All tests must pass before merge
- No console.log in production code
- GitHub Free プラン（プライベートリポジトリ）のためブランチ保護ルールは運用ルールで対応

## Documentation

Detailed specifications are in `.claude/docs/`:

1. `01-system-overview.md` - System architecture and scope
2. `02-screen-design.md` - UI/UX design system and screen specifications
3. `03-database-schema.md` - Database schema and relationships
4. `04-api-specification.md` - API endpoints and contracts
5. `05-security-requirements.md` - Security policies and compliance
6. `06-non-functional-requirements.md` - Performance, accessibility, etc.
7. `07-browser-test-checklist.md` - Browser testing checklist for manual QA
8. `08-deployment-guide.md` - Deployment guide (production environment, CI/CD, deploy procedure)
9. `99-confirmation-items.md` - Outstanding questions and TODOs

## Key Principles

1. **Agent-First**: Use specialized agents for complex tasks
2. **Plan Before Execute**: Always plan before writing code
3. **Test-Driven**: Write tests before implementation
4. **Security-First**: Never compromise on security or patient data protection
5. **Accessibility**: Follow WCAG 2.1 AA standards
6. **Design Consistency**: Maintain visual and UX consistency across all screens
7. **Docs in Sync**: Keep `.claude/docs/` updated when implementation changes spec-level behavior
