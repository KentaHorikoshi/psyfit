# PsyFit - リハビリ運動支援アプリ

サイテック病院向けリハビリ運動支援Webアプリケーション。患者様が自宅でリハビリ運動を継続的に実施し、医療スタッフが効率的に確認・管理できるシステム。

## Tech Stack

| カテゴリ | 技術 |
|----------|------|
| Frontend | React 18 + TypeScript |
| Build Tool | Vite 6 |
| CSS | Tailwind CSS v4 |
| UI Components | Radix UI + shadcn/ui |
| Charts | Recharts 2.15.2 |
| Backend | Ruby on Rails 8 (API mode) |
| Database | PostgreSQL |
| Testing | Vitest (Frontend), Minitest (Backend) |

## プロジェクト構造

```
psyfit/
├── frontend_user/      # 利用者向けフロントエンド（ビルド環境）
├── frontend_admin/     # 職員向けフロントエンド（ビルド環境）
├── src_user/           # 利用者向けReactコンポーネント
│   └── components/     # U-01〜U-15画面コンポーネント
├── src_admin/          # 職員向けReactコンポーネント
│   └── components/     # S-01〜S-09画面コンポーネント
├── app/                # Rails APIバックエンド
│   ├── controllers/    # APIコントローラー
│   └── models/         # ActiveRecordモデル
├── db/                 # データベース
│   ├── migrate/        # マイグレーションファイル
│   └── schema.rb       # 現在のスキーマ
├── test/               # バックエンドテスト
├── .claude/
│   ├── docs/           # 設計ドキュメント
│   ├── agents/         # 専門エージェント
│   ├── skills/         # 再利用可能スキル
│   └── rules/          # コーディングルール
└── CLAUDE.md           # Claude Code用ガイド
```

## 環境セットアップ

### 必要条件

- Ruby 3.3+
- Node.js 20+
- PostgreSQL 15+

### バックエンド（Rails）

```bash
# 依存関係インストール
bundle install

# データベース作成・マイグレーション
bin/rails db:create db:migrate

# シードデータ投入（開発用）
bin/rails db:seed

# サーバー起動（ポート3000）
bin/rails server
```

### フロントエンド（利用者向け）

```bash
cd frontend_user
npm install
npm run dev    # 開発サーバー起動
npm run build  # 本番ビルド
npm run test   # テスト実行
```

### フロントエンド（職員向け）

```bash
cd frontend_admin
npm install
npm run dev    # 開発サーバー起動
npm run build  # 本番ビルド
npm run test   # テスト実行
```

## 環境変数

`.env`ファイルに以下を設定:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/psyfit_development

# Rails
RAILS_ENV=development
SECRET_KEY_BASE=your_secret_key

# Encryption (PII暗号化用)
ACTIVE_RECORD_ENCRYPTION_PRIMARY_KEY=your_primary_key
ACTIVE_RECORD_ENCRYPTION_DETERMINISTIC_KEY=your_deterministic_key
ACTIVE_RECORD_ENCRYPTION_KEY_DERIVATION_SALT=your_salt
```

## 実装状況

### 画面実装

#### 利用者向け (src_user)
| 画面ID | 画面名 | UI | API接続 |
|--------|--------|:--:|:------:|
| U-01 | ログイン | ✅ | ⬜ |
| U-02 | トップ（ホーム） | ✅ | ⬜ |
| U-03 | 運動メニュー選択 | ✅ | ⬜ |
| U-04 | 運動実施（動画） | ✅ | ⬜ |
| U-07 | 履歴一覧 | ✅ | ⬜ |
| U-08 | 測定値履歴 | ✅ | ⬜ |
| U-09 | パスワードリセット | ✅ | ⬜ |
| U-10 | ウェルカム | ✅ | ⬜ |
| U-11 | 運動カード | ✅ | ⬜ |
| U-13 | 祝福 | ✅ | ⬜ |
| U-14 | 体調入力 | ✅ | ⬜ |
| U-15 | まとめて記録 | ✅ | ⬜ |

#### 職員向け (frontend_admin)
| 画面ID | 画面名 | UI | テスト | カバレッジ | API接続 |
|--------|--------|:--:|:-----:|:--------:|:------:|
| - | Sidebar | ✅ | 15 tests | 100% | - |
| S-01 | ログイン | ✅ | 19 tests | 95.54% | ⬜ |
| S-02 | ダッシュボード | ✅ | 22 tests | 100% | ⬜ |
| S-03 | 患者一覧 | ✅ | 29 tests | 97.9% | ⬜ |
| S-04 | 患者詳細 | ⬜ | - | - | ⬜ |
| S-05 | 測定値入力 | ⬜ | - | - | ⬜ |
| S-06 | 運動メニュー設定 | ⬜ | - | - | ⬜ |
| S-07 | レポート出力 | ⬜ | - | - | ⬜ |
| S-08 | 職員管理 | ⬜ | - | - | ⬜ |
| S-09 | パスワードリセット | ⬜ | - | - | ⬜ |

**フロントエンドテスト**: 92 tests passed, 98.98% overall coverage (2026-01-24)

### バックエンド実装

#### モデル
| モデル | 作成 | バリデーション | PII暗号化 |
|--------|:---:|:------------:|:--------:|
| User | ✅ | ✅ | ✅ |
| Staff | ✅ | ✅ | ✅ |
| Exercise | ✅ | ✅ | - |
| PatientExercise | ✅ | ✅ | - |
| ExerciseRecord | ✅ | ✅ | - |
| DailyCondition | ✅ | ✅ | - |
| Measurement | ✅ | ✅ | - |
| PatientStaffAssignment | ✅ | ✅ | - |
| Video | ✅ | ✅ | - |
| AuditLog | ✅ | ✅ | - |

#### APIエンドポイント（最新更新: 2026-01-23）
| エンドポイント | 実装 | テスト |
|---------------|:---:|:-----:|
| **認証** | | |
| POST /api/v1/auth/login | ✅ | ✅ |
| POST /api/v1/auth/staff/login | ✅ | ✅ |
| DELETE /api/v1/auth/logout | ✅ | ✅ |
| GET /api/v1/auth/me | ✅ | ✅ |
| **運動メニュー・記録（利用者）** | | |
| GET /api/v1/users/me/exercises | ✅ | ✅ |
| POST /api/v1/exercise_records | ✅ | ✅ |
| GET /api/v1/users/me/exercise_records | ✅ | ✅ |
| **体調記録（利用者）** | | |
| POST /api/v1/daily_conditions | ✅ | ✅ |
| GET /api/v1/users/me/daily_conditions | ✅ | ✅ |
| **測定値** | | |
| POST /api/v1/patients/:id/measurements | ✅ | ✅ |
| GET /api/v1/patients/:id/measurements | ✅ | ✅ |
| GET /api/v1/users/me/measurements | ✅ | ✅ |
| **患者管理（職員）** | | |
| GET /api/v1/patients | ✅ | ✅ |
| GET /api/v1/patients/:id | ✅ | ✅ |
| **その他** | | |
| GET /api/v1/health | ✅ | ✅ |

**テストカバレッジ**: 86.52% (249テストケース、全パス)

### データベース
- 全テーブルマイグレーション: ✅
- UUID主キー: ✅
- PII暗号化カラム: ✅
- インデックス設定: ✅

## 開発ロードマップ

### Phase 1: MVP（進行中）
- [x] UIコンポーネント作成
- [x] データベース設計・マイグレーション
- [x] モデル実装（バリデーション・暗号化）
- [x] 認証API完全実装 ✅
- [x] 運動メニュー表示API ✅
- [x] 運動記録API ✅
- [x] 体調記録API ✅
- [x] 測定値管理API ✅
- [x] 患者管理API ✅ (2026-01-23)
- [x] バックエンドテストカバレッジ80%達成 ✅ (86.52%)
- [x] 職員向けUI基盤実装（TDD） ✅ (2026-01-24)
  - [x] Sidebar (15 tests, 100% coverage)
  - [x] Dashboard (22 tests, 100% coverage)
  - [x] PatientList (29 tests, 97.9% coverage)
  - [x] フロントエンドテストカバレッジ80%達成 ✅ (98.98%)
- [ ] フロントエンド-バックエンド接続

### Phase 2: 拡張機能（次のステップ）
- [ ] 運動メニュー割当API（職員 → 患者）
- [ ] レポート出力API（PDF/CSV）
- [ ] 職員管理API（マネージャー専用）
- [ ] 履歴グラフ表示（フロントエンド）
- [ ] フロントエンド完全実装（利用者・職員）

### Phase 3: 最適化
- [ ] パフォーマンス最適化
- [ ] オフライン対応（PWA）
- [ ] プッシュ通知
- [ ] アクセシビリティ改善（WCAG 2.1 AA完全準拠）

## コマンド一覧

### Rails

```bash
bundle exec rails server              # サーバー起動
bundle exec rails console             # コンソール起動
bundle exec rails db:migrate          # マイグレーション実行
bundle exec rspec                     # テスト実行（RSpec）
bundle exec rspec --format documentation  # テスト実行（詳細）
bundle exec rspec --coverage          # カバレッジ付きテスト
bundle exec brakeman                  # セキュリティスキャン
bundle exec rubocop                   # Lintチェック
```

### フロントエンド

```bash
npm run dev             # 開発サーバー
npm run build           # 本番ビルド
npm run test            # テスト実行
npm run test:coverage   # カバレッジ付きテスト
npm run lint            # Lintチェック
```

## 設計ドキュメント

詳細な設計書は `.claude/docs/` ディレクトリを参照:

| ファイル | 内容 |
|----------|------|
| [01-system-overview.md](.claude/docs/01-system-overview.md) | システム概要・スコープ |
| [02-screen-design.md](.claude/docs/02-screen-design.md) | UI/UXデザインシステム |
| [03-database-schema.md](.claude/docs/03-database-schema.md) | データベース設計 |
| [04-api-specification.md](.claude/docs/04-api-specification.md) | API仕様 |
| [05-security-requirements.md](.claude/docs/05-security-requirements.md) | セキュリティ要件 |
| [06-non-functional-requirements.md](.claude/docs/06-non-functional-requirements.md) | 非機能要件 |
| [07-frontend-implementation-status.md](.claude/docs/07-frontend-implementation-status.md) | フロントエンド実装状況 ✨NEW |
| [99-confirmation-items.md](.claude/docs/99-confirmation-items.md) | 確認事項・TODO |

## セキュリティ

- PII（個人識別情報）はAES-256-GCMで暗号化
- セッションタイムアウト: 利用者30分、職員15分
- 全アクセスは監査ログに記録
- OWASP Top 10対策実装

## ライセンス

プロプライエタリ - サイテック病院専用
