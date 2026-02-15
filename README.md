# PsyFit - リハビリ運動支援アプリ

さとやま整形外科内科向けリハビリ運動支援Webアプリケーション。患者様が自宅でリハビリ運動を継続的に実施し、医療スタッフが効率的に確認・管理できるシステム。

**本番URL**: https://psytech.jp

## Tech Stack

| カテゴリ | 技術 |
|----------|------|
| Frontend | React 18 + TypeScript |
| Build Tool | Vite 6 |
| CSS | Tailwind CSS v4 |
| UI Components | Radix UI + shadcn/ui |
| Charts | Recharts 2.15.2 |
| Backend | Ruby on Rails 8 (API mode) |
| Database | PostgreSQL 16 |
| Cache/Session | Redis 7 |
| Testing | Vitest + Playwright (Frontend), RSpec (Backend) |
| Container | Docker + Docker Compose |
| Deploy | Kamal (Blue-Green) + GitHub Actions CI/CD |

## プロジェクト構造

```
psyfit/
├── frontend_user/         # 利用者向けフロントエンド (U-01〜U-15)
│   └── src/
├── frontend_admin/        # 職員向けフロントエンド (S-01〜S-10)
│   └── src/
├── app/                   # Rails APIバックエンド
│   ├── controllers/
│   ├── models/
│   └── services/
├── spec/                  # RSpecテスト
├── db/                    # マイグレーション・スキーマ
├── .claude/
│   ├── docs/              # 設計ドキュメント
│   ├── agents/            # 専門エージェント
│   ├── skills/            # 再利用可能スキル
│   └── rules/             # コーディングルール
├── Dockerfile             # 本番用 (マルチステージビルド)
├── Dockerfile.dev         # 開発用
├── docker-compose.yml     # 開発環境
├── docker-compose.prod.yml # 本番環境
├── bin/deploy.sh          # デプロイスクリプト
├── .github/workflows/
│   ├── ci.yml             # CI (テスト・lint・セキュリティ・E2E)
│   └── deploy.yml         # 自動デプロイ (mainマージ時)
└── CLAUDE.md              # Claude Code用ガイド
```

## 環境セットアップ

### 必要条件

- Ruby 3.3+
- Node.js 20+
- PostgreSQL 16+
- Redis 7+

### Docker環境（推奨）

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
```

### ローカル環境

```bash
# バックエンド (ポート4001)
bundle install
bin/rails db:create db:migrate db:seed
bin/rails server -b 0.0.0.0 -p 4001

# 利用者向けフロントエンド (ポート3000)
cd frontend_user && npm install && npm run dev -- --host 0.0.0.0 --port 3000

# 職員向けフロントエンド (ポート3003)
cd frontend_admin && npm install && npm run dev -- --host 0.0.0.0 --port 3003
```

### アクセスURL

| アプリ | URL |
|--------|-----|
| 利用者向けフロントエンド | http://localhost:3000 |
| 職員向けフロントエンド | http://localhost:3003 |
| バックエンドAPI | http://localhost:4001 |
| ヘルスチェック | http://localhost:4001/api/v1/health |

### 開発用アカウント

`bin/rails db:seed` でシードデータ投入後に利用可能:

| 種別 | ID/メール | パスワード |
|------|-----------|-----------|
| マネージャー | MGR001 | Manager1! |
| 職員 | STF001 | Staff123! |
| 職員 | STF002 | Staff123! |
| 利用者 | tanaka@example.com | Patient1! |
| 利用者 | takahashi@example.com | Patient1! |

## テスト

### テストコマンド

```bash
# バックエンド (RSpec)
bundle exec rspec                          # 全テスト
bundle exec rspec --coverage               # カバレッジ付き

# フロントエンド (Vitest) - frontend_user/ または frontend_admin/ 内で実行
npm run test                               # 単体テスト
npm run test:coverage                      # カバレッジ付き

# E2Eテスト (Playwright) - バックエンド起動が必要
npm run test:e2e                           # 全テスト実行
npm run test:e2e:headed                    # ブラウザ表示付き
npm run test:e2e:ui                        # UIモード
npm run test:e2e:report                    # レポート表示

# Docker環境テスト (41項目)
bin/docker-test
```

### テストサマリー (2026-02-11)

| 対象 | テスト数 | カバレッジ |
|------|-------:|----------:|
| バックエンド (RSpec) | 586 | 91.69% |
| 利用者向け (Vitest) | 407 | 97.77% |
| 職員向け (Vitest) | 337 | 95%+ |
| E2Eテスト (Playwright) | 10ファイル | - |
| **合計** | **1,330+** | **80%超** |

## 実装状況

### 利用者向け画面 (frontend_user) - 全12画面完了

| 画面ID | 画面名 | テスト | カバレッジ | API |
|--------|--------|------:|----------:|:---:|
| U-01 | ログイン | 19 | 95.45% | ✅ |
| U-02 | トップ（ホーム） | 23 | 96.85% | ✅ |
| U-03 | 運動メニュー選択 | 16 | 94.8% | ✅ |
| U-04 | 運動実施（動画） | 24 | 95.96% | ✅ |
| U-07 | 履歴一覧 | 19 | 100% | ✅ |
| U-08 | 測定値履歴 | 20 | 99.59% | ✅ |
| U-09 | パスワードリセット | 31 | 96.83% | ✅ |
| U-10 | ウェルカム | 21 | 97.82% | - |
| U-11 | 運動カード | 20 | 100% | ✅ |
| U-13 | 祝福 | 24 | 100% | - |
| U-14 | 体調入力 | 27 | 98.79% | ✅ |
| U-15 | まとめて記録 | 25 | 98.17% | ✅ |

### 職員向け画面 (frontend_admin) - 全10画面完了

| 画面ID | 画面名 | テスト | カバレッジ | API |
|--------|--------|------:|----------:|:---:|
| - | Sidebar | 15 | 100% | - |
| S-01 | ログイン | 19 | 95.54% | ✅ |
| S-02 | ダッシュボード | 22 | 100% | ✅ |
| S-03 | 患者一覧 | 29 | 97.9% | ✅ |
| S-04 | 患者詳細 | 17 | 97.51% | ✅ |
| S-05 | 測定値入力 | 22 | 85.51% | ✅ |
| S-06 | 運動メニュー設定 | 18 | 88.67% | ✅ |
| S-07 | レポート出力 | 14 | 95.89% | ✅ |
| S-08 | 職員管理 | 26 | 95%+ | ✅ |
| S-09 | パスワードリセット | 28 | 100% | ✅ |

### バックエンドAPI - 全エンドポイント実装済

| カテゴリ | エンドポイント |
|----------|---------------|
| 認証 | login, staff/login, logout, me, password_reset_request, password_reset |
| 運動（利用者） | exercises, exercise_records |
| 体調（利用者） | daily_conditions |
| 測定値 | measurements (利用者/職員) |
| 患者管理 | patients CRUD |
| 運動管理（職員） | exercise_masters, patient exercises |
| レポート | patient report |
| 職員管理 | staff CRUD, password change |
| 動画配信 | video token, video stream |
| その他 | health check |

## CI/CD

### GitHub Actions

| ワークフロー | トリガー | 内容 |
|---|---|---|
| CI (`ci.yml`) | PR, main/develop push | セキュリティスキャン → Lint → バックエンドテスト → フロントエンドテスト → ビルドチェック → E2E |
| Deploy (`deploy.yml`) | main push | SSH経由でDocker Blue-Greenデプロイ |

### デプロイフロー

```
featureブランチ → git push → PR作成 → CI自動実行 → マージ → 自動デプロイ
```

デプロイは Blue-Green 方式で、ヘルスチェック失敗時は自動ロールバック。

### 本番環境構成

```
Client (HTTPS) → Nginx (SSL終端) → kamal-proxy → Docker (Rails/Puma) → PostgreSQL / Redis
```

## 開発ロードマップ

### Phase 1: MVP ✅ 完了 (2026-01-25)
- [x] 全画面UI実装（利用者12画面 + 職員10画面）
- [x] 全APIエンドポイント実装
- [x] データベース設計・PII暗号化
- [x] 認証・セッション管理
- [x] テストカバレッジ80%以上達成
- [x] E2Eテスト（Playwright）

### Phase 2: 本番デプロイ ✅ 完了 (2026-02-14)
- [x] Docker環境構築（マルチステージビルド）
- [x] CI/CDパイプライン（GitHub Actions 9ジョブ）
- [x] 本番環境デプロイ（kamal-proxy Blue-Green）
- [x] 動画セキュア配信
- [x] レート制限（Rack::Attack）
- [x] パスワードリセットメール

### Phase 3: PoC・最適化（進行中）
- [ ] PoC運用開始
- [ ] SMTP設定（メール送信プロバイダ）
- [ ] パフォーマンス最適化（バンドルサイズ・画像最適化）
- [ ] アクセシビリティ改善（WCAG 2.1 AA完全準拠）
- [ ] 監視・アラート設定
- [ ] バックアップ運用
- [ ] プッシュ通知

## 環境変数

`.env.example` を参照。主要な変数:

| 変数 | 用途 |
|------|------|
| `RAILS_MASTER_KEY` | credentials.yml.enc の復号 |
| `SECRET_KEY_BASE` | セッション暗号化 |
| `ATTR_ENCRYPTED_KEY` | PII暗号化 (AES-256-GCM) |
| `BLIND_INDEX_KEY` | メール検索用ハッシュ |
| `POSTGRES_PASSWORD` | DB接続 |
| `REDIS_PASSWORD` | Redis接続 |

## セキュリティ

- PII（個人識別情報）はAES-256-GCMで暗号化
- セッションタイムアウト: 利用者30分、職員15分
- 全アクセスは監査ログに記録
- OWASP Top 10対策実装
- レート制限（Rack::Attack）
- 動画配信は認証トークン必須

## 設計ドキュメント

`.claude/docs/` ディレクトリに詳細な設計書:

| ファイル | 内容 |
|----------|------|
| [01-system-overview.md](.claude/docs/01-system-overview.md) | システム概要・スコープ |
| [02-screen-design.md](.claude/docs/02-screen-design.md) | UI/UXデザインシステム |
| [03-database-schema.md](.claude/docs/03-database-schema.md) | データベース設計 |
| [04-api-specification.md](.claude/docs/04-api-specification.md) | API仕様 |
| [05-security-requirements.md](.claude/docs/05-security-requirements.md) | セキュリティ要件 |
| [06-non-functional-requirements.md](.claude/docs/06-non-functional-requirements.md) | 非機能要件 |
| [07-browser-test-checklist.md](.claude/docs/07-browser-test-checklist.md) | ブラウザテストチェックリスト |
| [08-deployment-guide.md](.claude/docs/08-deployment-guide.md) | デプロイガイド |
| [08-deployment-checklist.md](.claude/docs/08-deployment-checklist.md) | デプロイチェックリスト |
| [99-confirmation-items.md](.claude/docs/99-confirmation-items.md) | 確認事項・TODO |

## ライセンス

プロプライエタリ - さとやま整形外科内科専用
