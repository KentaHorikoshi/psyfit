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

#### 職員向け (src_admin)
| 画面ID | 画面名 | UI | API接続 |
|--------|--------|:--:|:------:|
| S-01 | ログイン | ✅ | ⬜ |
| S-02 | ダッシュボード | ✅ | ⬜ |
| S-03 | 患者一覧 | ✅ | ⬜ |
| S-04 | 患者詳細 | ✅ | ⬜ |
| S-05 | 測定値入力 | ✅ | ⬜ |
| S-06 | 運動メニュー設定 | ✅ | ⬜ |
| S-07 | レポート出力 | ✅ | ⬜ |
| S-08 | 職員管理 | ✅ | ⬜ |
| S-09 | パスワードリセット | ✅ | ⬜ |

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
| Video | ✅ | ✅ | - |
| AuditLog | ✅ | ✅ | - |

#### APIエンドポイント
| エンドポイント | 実装 | テスト |
|---------------|:---:|:-----:|
| POST /api/v1/auth/login | ✅ | ⬜ |
| DELETE /api/v1/auth/logout | ✅ | ⬜ |
| GET /api/v1/health | ✅ | ⬜ |
| その他のエンドポイント | ⬜ | ⬜ |

### データベース
- 全テーブルマイグレーション: ✅
- UUID主キー: ✅
- PII暗号化カラム: ✅
- インデックス設定: ✅

## 開発ロードマップ

### Phase 1: MVP（現在進行中）
- [x] UIコンポーネント作成
- [x] データベース設計・マイグレーション
- [x] モデル実装（バリデーション・暗号化）
- [ ] 認証API完全実装
- [ ] 運動メニュー表示API
- [ ] 運動記録API
- [ ] 体調記録API
- [ ] フロントエンド-バックエンド接続

### Phase 2: 拡張機能
- [ ] 履歴グラフ表示
- [ ] レポート出力（PDF/CSV）
- [ ] 運動メニュー割当（職員）
- [ ] 職員管理（マネージャー）

### Phase 3: 最適化
- [ ] パフォーマンス最適化
- [ ] オフライン対応（PWA）
- [ ] プッシュ通知
- [ ] テストカバレッジ80%達成

## コマンド一覧

### Rails

```bash
bundle exec rails server              # サーバー起動
bundle exec rails console             # コンソール起動
bundle exec rails db:migrate          # マイグレーション実行
bundle exec rails test                # テスト実行
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
| [99-confirmation-items.md](.claude/docs/99-confirmation-items.md) | 確認事項・TODO |

## セキュリティ

- PII（個人識別情報）はAES-256-GCMで暗号化
- セッションタイムアウト: 利用者30分、職員15分
- 全アクセスは監査ログに記録
- OWASP Top 10対策実装

## ライセンス

プロプライエタリ - サイテック病院専用
