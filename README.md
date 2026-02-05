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
| Testing | Vitest + Playwright (Frontend), RSpec (Backend) |

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
npm run test   # 単体テスト実行
```

### フロントエンド（職員向け）

```bash
cd frontend_admin
npm install
npm run dev    # 開発サーバー起動
npm run build  # 本番ビルド
npm run test   # 単体テスト実行
```

### E2Eテスト

E2Eテストの実行には、バックエンドサーバー（Rails）が起動している必要があります。

```bash
# 利用者向けアプリ
cd frontend_user
npm run test:e2e          # 全テスト実行
npm run test:e2e:headed   # ブラウザ表示付きで実行
npm run test:e2e:ui       # UIモードで実行
npm run test:e2e:report   # レポート表示

# 職員向けアプリ
cd frontend_admin
npm run test:e2e          # 全テスト実行
npm run test:e2e:headed   # ブラウザ表示付きで実行
npm run test:e2e:ui       # UIモードで実行
npm run test:e2e:report   # レポート表示
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

#### 利用者向け (frontend_user)
| 画面ID | 画面名 | UI | テスト | カバレッジ | API接続 |
|--------|--------|:--:|:-----:|:--------:|:------:|
| U-01 | ログイン | ✅ | 19 tests | 95.45% | ✅ |
| U-02 | トップ（ホーム） | ✅ | 23 tests | 96.85% | ✅ |
| U-03 | 運動メニュー選択 | ✅ | 16 tests | 94.8% | ✅ |
| U-04 | 運動実施（動画） | ✅ | 24 tests | 95.96% | ✅ |
| U-07 | 履歴一覧 | ✅ | 19 tests | 100% | ✅ |
| U-08 | 測定値履歴 | ✅ | 20 tests | 99.59% | ✅ |
| U-09 | パスワードリセット | ✅ | 31 tests | 96.83% | ✅ |
| U-10 | ウェルカム | ✅ | 21 tests | 97.82% | - |
| U-11 | 運動カード | ✅ | 20 tests | 100% | ✅ |
| U-13 | 祝福 | ✅ | 24 tests | 100% | - |
| U-14 | 体調入力 | ✅ | 27 tests | 98.79% | ✅ |
| U-15 | まとめて記録 | ✅ | 25 tests | 98.17% | ✅ |

#### 職員向け (frontend_admin)
| 画面ID | 画面名 | UI | テスト | カバレッジ | API接続 |
|--------|--------|:--:|:-----:|:--------:|:------:|
| - | Sidebar | ✅ | 15 tests | 100% | - |
| S-01 | ログイン | ✅ | 19 tests | 95.54% | ✅ |
| S-02 | ダッシュボード | ✅ | 22 tests | 100% | ✅ |
| S-03 | 患者一覧 | ✅ | 29 tests | 97.9% | ✅ |
| S-04 | 患者詳細 | ✅ | 17 tests | 97.51% | ✅ |
| S-05 | 測定値入力 | ✅ | 22 tests | 85.51% | ✅ |
| S-06 | 運動メニュー設定 | ✅ | 18 tests | 88.67% | ✅ |
| S-07 | レポート出力 | ✅ | 14 tests | 95.89% | ✅ |
| S-08 | 職員管理 | ✅ | 26 tests | 95%+ | ✅ |
| S-09 | パスワードリセット | ✅ | 28 tests | 100% | ✅ |

**利用者向けテスト**: 302 tests passed, 99.81% overall coverage (2026-01-25) - 全画面実装完了 ✅
**職員向けテスト**: 210 tests passed (2026-01-25) - 全画面実装完了 ✅

### フロントエンドAPIクライアント

#### 利用者向け (frontend_user/src/lib/api-client.ts) ✅ NEW (2026-01-25)

| メソッド | エンドポイント | 機能 | テスト |
|----------|---------------|------|:------:|
| `login()` | POST /auth/login | ログイン | ✅ |
| `logout()` | DELETE /auth/logout | ログアウト | ✅ |
| `getCurrentUser()` | GET /users/me | 現在のユーザー取得 | ✅ |
| `getUserExercises()` | GET /users/me/exercises | 割当運動メニュー取得 | ✅ |
| `getExercise(id)` | GET /exercises/:id | 運動詳細取得 | ✅ |
| `createExerciseRecord()` | POST /exercise_records | 運動記録作成 | ✅ |
| `getExerciseRecords()` | GET /users/me/exercise_records | 運動履歴取得 | ✅ |
| `createDailyCondition()` | POST /daily_conditions | 体調記録作成 | ✅ |
| `getMyDailyConditions()` | GET /users/me/daily_conditions | 体調履歴取得 | ✅ |
| `getMeasurements()` | GET /users/me/measurements | 測定値履歴取得 | ✅ |

**機能**:
- BaseURL設定（環境変数VITE_API_URL対応）
- credentials: 'include' でCookie送信
- エラーハンドリング（ApiError, AuthenticationError）
- DateFilterParams対応（start_date, end_date）

**テスト**: 25 tests, 100% coverage (MSW使用)

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

#### APIエンドポイント（最新更新: 2026-01-28）
| エンドポイント | 実装 | テスト |
|---------------|:---:|:-----:|
| **認証** | | |
| POST /api/v1/auth/login | ✅ | ✅ |
| POST /api/v1/auth/staff/login | ✅ | ✅ |
| DELETE /api/v1/auth/logout | ✅ | ✅ |
| GET /api/v1/auth/me | ✅ | ✅ |
| POST /api/v1/auth/password_reset_request | ✅ | ✅ |
| POST /api/v1/auth/password_reset | ✅ | ✅ |
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
| POST /api/v1/patients | ✅ | ✅ |
| PATCH /api/v1/patients/:id | ✅ | ✅ |
| **運動メニュー管理（職員・S-06）** | | |
| GET /api/v1/exercise_masters | ✅ | ✅ |
| GET /api/v1/patients/:id/exercises | ✅ | ✅ |
| POST /api/v1/patients/:id/exercises | ✅ | ✅ |
| **レポート出力（職員・S-07）** | | |
| GET /api/v1/patients/:id/report | ✅ | ✅ |
| **職員管理（マネージャー・S-08）** | | |
| GET /api/v1/staff | ✅ | ✅ |
| POST /api/v1/staff | ✅ | ✅ |
| **パスワード変更（職員・S-09）** | | |
| POST /api/v1/staff/me/password | ✅ | ✅ |
| **動画配信** | | |
| GET /api/v1/videos/:exercise_id/token | ✅ | ✅ |
| GET /api/v1/videos/:exercise_id/stream | ✅ | ✅ |
| **その他** | | |
| GET /api/v1/health | ✅ | ✅ |

**テストカバレッジ**: 90%+ (全テストパス)

### データベース
- 全テーブルマイグレーション: ✅
- UUID主キー: ✅
- PII暗号化カラム: ✅
- インデックス設定: ✅

## 開発ロードマップ

### Phase 1: MVP ✅ 完了 (2026-01-25)
- [x] UIコンポーネント作成
- [x] データベース設計・マイグレーション
- [x] モデル実装（バリデーション・暗号化）
- [x] 認証API完全実装
- [x] 運動メニュー表示API
- [x] 運動記録API
- [x] 体調記録API
- [x] 測定値管理API
- [x] 患者管理API
- [x] パスワードリセットAPI
- [x] バックエンドテストカバレッジ80%達成 (90.49%)
- [x] 利用者向けUI全画面実装（TDD）- 12画面完了
- [x] 職員向けUI全画面実装（TDD）- 9画面完了
- [x] フロントエンドテストカバレッジ80%達成 (97%+)
- [x] E2Eテスト実装（Playwright）
  - 利用者向け: 5テストファイル（ログイン、運動フロー、体調入力、履歴、パスワードリセット）
  - 職員向け: 5テストファイル（ログイン、患者管理、測定値入力、運動メニュー、レポート出力）
- [x] ESLintエラー修正
- [x] フロントエンドAPI接続完了（利用者向け・職員向け全画面）
- [x] フロントエンドAPIクライアント実装・テスト完了

### Phase 2: 本番デプロイ準備
- [x] バックエンド未実装APIエンドポイント
  - [x] GET /api/v1/exercise_masters（運動マスタ一覧）
  - [x] GET /api/v1/patients/:id/exercises（患者運動割当一覧）
  - [x] POST /api/v1/staff/me/password（職員パスワード変更）
  - [x] POST /api/v1/patients（患者新規登録）
  - [x] PATCH /api/v1/patients/:id（患者情報更新）
- [x] パスワードリセットメール送信実装
- [x] 動画アクセス制御の実装
- [x] レート制限の実装
- [x] Docker環境構築（docker-compose.yml, .env.example, bin/docker-*）
- [ ] CI/CDパイプライン構築
- [ ] SSL証明書設定
- [ ] 本番環境デプロイ

### Phase 3: 最適化・拡張
- [ ] パフォーマンス最適化
- [ ] プッシュ通知
- [ ] アクセシビリティ改善（WCAG 2.1 AA完全準拠）
- [ ] Lighthouseスコア測定・改善

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
npm run test            # 単体テスト実行
npm run test:coverage   # カバレッジ付きテスト
npm run lint            # Lintチェック

# E2Eテスト（Playwright）
npm run test:e2e        # 全E2Eテスト実行
npm run test:e2e:headed # ブラウザ表示付き
npm run test:e2e:ui     # UIモード
npm run test:e2e:report # レポート表示
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
| [07-browser-test-checklist.md](.claude/docs/07-browser-test-checklist.md) | ブラウザ動作テストチェックリスト |
| [99-confirmation-items.md](.claude/docs/99-confirmation-items.md) | 確認事項・TODO |

## セキュリティ

- PII（個人識別情報）はAES-256-GCMで暗号化
- セッションタイムアウト: 利用者30分、職員15分
- 全アクセスは監査ログに記録
- OWASP Top 10対策実装

## ライセンス

プロプライエタリ - サイテック病院専用
