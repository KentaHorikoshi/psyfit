# 08 - デプロイ前チェックリスト

本番デプロイ前に実施すべき作業を優先度順にまとめる。

## Phase 1: CI/CDテストを通す（CRITICAL） ✅ 完了（2026-02-10）

GitHub Actions（`.github/workflows/ci.yml`）の全ジョブがパスすることを確認する。

### 1-1. セキュリティスキャン

| チェック | コマンド | CIジョブ |
|----------|---------|---------|
| [x] Brakeman（Rails脆弱性スキャン） | `bundle exec brakeman --no-pager` | scan-ruby |
| [x] bundler-audit（Gem脆弱性チェック） | `bundle exec bundler-audit check --update` | scan-ruby |
| [x] importmap audit（JS依存スキャン） | `bin/importmap audit` | scan-js |

### 1-2. リント

| チェック | コマンド | CIジョブ |
|----------|---------|---------|
| [x] RuboCop（Rubyコード品質） | `bundle exec rubocop` | lint-ruby |
| [x] ESLint（利用者向けフロントエンド） | `cd frontend_user && npm run lint` | frontend-user-test |
| [x] ESLint（職員向けフロントエンド） | `cd frontend_admin && npm run lint` | frontend-admin-test |

### 1-3. 型チェック

| チェック | コマンド | CIジョブ |
|----------|---------|---------|
| [x] TypeScript（利用者向け） | `cd frontend_user && npx tsc --noEmit` | frontend-user-test |
| [x] TypeScript（職員向け） | `cd frontend_admin && npx tsc --noEmit` | frontend-admin-test |

### 1-4. テスト（カバレッジ80%以上）

| チェック | コマンド | CIジョブ |
|----------|---------|---------|
| [x] RSpec（バックエンド：581 examples, 0 failures, 91.25%カバレッジ） | `bundle exec rspec` | backend-test |
| [x] Vitest（利用者向け：407 tests passed） | `cd frontend_user && npm run test:coverage` | frontend-user-test |
| [x] Vitest（職員向け：337 tests passed） | `cd frontend_admin && npm run test:coverage` | frontend-admin-test |

### 1-5. ビルドチェック

| チェック | コマンド | CIジョブ |
|----------|---------|---------|
| [x] 本番ビルド（利用者向け） | `cd frontend_user && npm run build` | build-check |
| [x] 本番ビルド（職員向け） | `cd frontend_admin && npm run build` | build-check |

### 1-6. E2Eテスト

| チェック | コマンド | CIジョブ |
|----------|---------|---------|
| [x] Playwright（利用者向け） | `cd frontend_user && npm run test:e2e` | e2e-test |
| [x] Playwright（職員向け） | `cd frontend_admin && npm run test:e2e` | e2e-test |

> **注意**: E2Eテストはバックエンド（Rails + PostgreSQL + Redis）が起動している状態で実行する必要がある。

### Phase 1 で実施した修正

**RuboCop**: 102件の自動修正（文字列リテラル、配列括弧内スペース等）

**フロントエンド ESLint/TypeScript**:
- 未使用変数・インポートの削除（`App.tsx`, `EditStaffDialog.tsx`, `MeasurementInput.test.tsx`）
- `DateFilterParams`へのインデックスシグネチャ追加
- `noUncheckedIndexedAccess`対応（非nullアサーション追加）
- `ExerciseMenu.tsx` の sets/reps スプレッド型修正
- `ReportGeneration.tsx` の undefined ガード追加
- `vite.config.ts` の `allowedHosts: 'all'` → `true`

**テスト修正**:
- AuthContext テスト: APIレスポンス形式を `{ user: ... }` / `{ staff: ... }` にネスト化
- Dashboard テスト: `getAllByLabelText`に変更、ナビゲーションパス修正
- Celebration テスト: フェイクタイマーのマイクロタスクフラッシュ追加
- ExerciseMenuManagement テスト: 重複テキスト・存在しないフィルタの修正
- RSpec: exercise_type属性名修正、テストファクトリに`:historical`トレイト追加

**バックエンド修正**:
- `user_exercises_controller.rb`: レスポンス形式をAPI仕様（ネスト形式）に修正
- `patients_controller.rb`: `assigned_staff_ids`の空値フィルタリング追加
- `staff_controller.rb`: 不正ロール値をバリデーションで拒否するよう修正

---

## Phase 2: 本番環境変数の設定（CRITICAL） ✅ 設定ファイル作成完了（2026-02-11）

`.env.production` テンプレートを作成済み。本番デプロイ時に実際の値を設定する。

### 2-1. 必須環境変数

| 変数名 | 説明 | 生成方法 | 状態 |
|--------|------|---------|------|
| [x] `RAILS_MASTER_KEY` | Rails暗号化マスターキー | `cat config/master.key` | テンプレート作成済 |
| [x] `ATTR_ENCRYPTED_KEY` | PII暗号化キー（AES-256-GCM） | `openssl rand -base64 32` | テンプレート作成済 |
| [x] `POSTGRES_USER` | PostgreSQLユーザー名 | `psyfit_prod` | 設定済 |
| [x] `POSTGRES_PASSWORD` | PostgreSQLパスワード | `openssl rand -base64 24` | テンプレート作成済 |
| [x] `REDIS_PASSWORD` | Redisパスワード | `openssl rand -base64 24` | テンプレート作成済 |
| [x] `SECRET_KEY_BASE` | Railsセッション署名キー | `bin/rails secret` | テンプレート作成済 |

### 2-2. アプリケーションURL

| 変数名 | 説明 | 設定値 | 状態 |
|--------|------|--------|------|
| [x] `VITE_API_BASE_URL` | フロントエンドからのAPI接続先 | `/api/v1` | deploy.yml設定済 |
| [x] `USER_APP_URL` | 利用者向けアプリURL | `https://psytech.jp` | deploy.yml設定済 |
| [x] `ADMIN_APP_URL` | 職員向けアプリURL | `https://psytech.jp/admin` | deploy.yml設定済 |

### 2-3. メール送信（SMTP）

| 変数名 | 説明 | 状態 |
|--------|------|------|
| [ ] `SMTP_ADDRESS` | SMTPサーバーアドレス | **要設定** |
| [x] `SMTP_PORT` | SMTPポート（587） | deploy.yml設定済 |
| [ ] `SMTP_USERNAME` | SMTP認証ユーザー | **要設定** |
| [ ] `SMTP_PASSWORD` | SMTP認証パスワード | **要設定** |
| [x] `SMTP_DOMAIN` | メール送信ドメイン（psytech.jp） | deploy.yml設定済 |
| [x] `MAILER_FROM_ADDRESS` | Fromアドレス（noreply@psytech.jp） | deploy.yml設定済 |

> **注意**: パスワードリセットメール機能が実装済みのため、SMTPは必須。デプロイ前にSMTP情報を取得すること。

### Phase 2 で作成・更新したファイル

- `.env.production` - 本番環境変数テンプレート（セキュリティキー生成コマンド付き）
- `config/environments/production.rb` - SMTP/SSL/hosts設定を有効化
- `.kamal/secrets` - Kamalシークレット定義を本番用に更新

---

## Phase 3: Kamal デプロイ設定（CRITICAL） ✅ 設定完了（2026-02-11）

`config/deploy.yml` を本番環境に合わせて更新済み。

| チェック | 対象 | 設定値 | 状態 |
|----------|------|--------|------|
| [x] サーバーIP | `servers.web` | `160.251.230.38` | 設定済 |
| [x] Dockerレジストリ | `registry.server` | `ghcr.io` | 設定済 |
| [x] レジストリ認証 | `registry.username/password` | `hirototoda` / GHCR PAT | 設定済 |
| [x] SSL設定 | `proxy.ssl` | `true` / `psytech.jp` | 設定済 |
| [x] DB接続先 | `POSTGRES_HOST` | `127.0.0.1`（同一サーバー） | 設定済 |
| [x] Kamalシークレット | `.kamal/secrets` | 環境変数から取得 | 設定済 |
| [x] アクセサリ（DB/Redis） | `accessories` | PostgreSQL 16 + Redis 7 | 設定済 |

### Phase 3 で更新したファイル

- `config/deploy.yml` - GHCR/SSL/アクセサリ設定を追加
- `.kamal/secrets` - 全シークレットの環境変数参照を追加

---

## Phase 4: コードクリーンアップ（HIGH） ✅ 完了（2026-02-11）

### 4-1. デバッグコード除去

| チェック | ファイル | 内容 |
|----------|---------|------|
| [x] ConnectionTest.tsx 除去（利用者向け） | 削除済み | App.tsxのimport/routeも除去 |
| [x] ConnectionTest.tsx 除去（職員向け） | 削除済み | App.tsxのimport/routeも除去 |
| [x] console.log の確認 | 両フロントエンド | 本番コードに `console.log` なし（確認済み） |

### 4-2. Git管理

| チェック | 内容 |
|----------|------|
| [x] `.env` をgitから除外 | `.gitignore` で `/.env*` を除外済み（`.env.example` / `.env.docker` 以外） |
| [x] 機密情報がコミット履歴に含まれていないか確認 | `.env` ファイルのコミット履歴なし（確認済み） |

### Phase 4 で実施した作業

- `frontend_user/src/components/ConnectionTest.tsx` 削除
- `frontend_admin/src/components/ConnectionTest.tsx` 削除
- 両 `App.tsx` のConnectionTestインポート・ルートを除去

---

## Phase 5: 本番Rails設定の確認（HIGH） ✅ 設定完了（2026-02-11）

| チェック | ファイル | 内容 | 状態 |
|----------|---------|------|------|
| [x] CORS設定 | `config/initializers/cors.rb` | `CORS_ORIGINS`環境変数で制御 | 既存コードで対応済 |
| [x] `config.hosts` | `config/environments/production.rb` | `RAILS_HOSTS`環境変数で設定 | 設定済 |
| [x] `config.force_ssl` | `config/environments/production.rb` | `true` | 設定済 |
| [x] `config.assume_ssl` | `config/environments/production.rb` | `true` | 設定済 |
| [x] ログレベル | `config/environments/production.rb` | `RAILS_LOG_LEVEL`環境変数（default: info） | 設定済 |
| [x] SMTP設定 | `config/environments/production.rb` | 環境変数ベースのSMTP設定 | 設定済 |
| [x] セッションストア | `config/initializers/session_store.rb` | cookie_store (secure: true, httponly: true) - 単一サーバー構成でOK | 確認済み |

### Phase 5 で更新したファイル

- `config/environments/production.rb` - SSL強制、hosts制限、SMTP設定を有効化

---

## Phase 6: インフラ・運用準備（MEDIUM）

| チェック | 内容 |
|----------|------|
| [ ] SSL証明書 | Let's Encrypt（Kamal proxy自動設定） |
| [ ] DNS設定 | `psytech.jp` → `160.251.230.38` のAレコード設定 |
| [ ] バックアップ | PostgreSQLの定期バックアップ設定 |
| [ ] 監視 | ヘルスチェック `/api/v1/health` の外部監視 |
| [ ] ログ集約 | ログの外部サービスへの転送設定 |
| [ ] Redis永続化 | AOF/RDB設定の確認 |

---

## 実行順序まとめ

```
1. CI/CDテストを通す          ✅ 完了（2026-02-11）
   ├── ローカルで全チェック実行  ✅
   ├── 失敗箇所を修正          ✅
   └── GitHubにpushしてCI確認  ✅
2. 本番環境変数を準備          ✅ テンプレート作成完了（2026-02-11）
   ├── .env.production 作成    ✅
   ├── production.rb 更新      ✅
   └── SMTP情報の取得          ⏳ 未完了
3. Kamalデプロイ設定を更新      ✅ 完了（2026-02-11）
   ├── deploy.yml 更新         ✅
   ├── .kamal/secrets 更新     ✅
   └── GHCR + SSL設定          ✅
4. コードクリーンアップ          ✅ 完了（2026-02-11）
5. 本番Rails設定を確認          ✅ 完了（2026-02-11）
6. インフラ・運用準備            ← 次のステップ（手動作業）
7. ステージングでテスト
8. 本番デプロイ
```

---

## 追加実施事項（2026-02-11）

### フロントエンド本番ビルド設定

| チェック | 内容 |
|----------|------|
| [x] 職員向けアプリのベースパス | `vite.config.ts` で本番時 `/admin/` に設定 |
| [x] 職員向けアプリのルーティング | `App.tsx` の BrowserRouter に `basename="/admin"` 追加 |
| [x] 利用者向けAPI URLのデフォルト値 | `api.ts` を相対パス `/api/v1` に変更 |

### デプロイアーキテクチャ（単一ドメイン・パス分離）

```
https://psytech.jp/           → 利用者向けSPA (public/index.html)
https://psytech.jp/admin/     → 職員向けSPA (public/admin/index.html)
https://psytech.jp/api/v1/    → Rails API
```

**Dockerfile更新内容**:
- Stage 1: Node.js で利用者向けフロントエンドをビルド → `public/`
- Stage 2: Node.js で職員向けフロントエンドをビルド → `public/admin/`
- Stage 3: Ruby base
- Stage 4: Rails ビルド（フロントエンドアセットを組み込み）
- Stage 5: 本番イメージ

**Rails SPAフォールバック**:
- `GET /admin`, `GET /admin/*path` → `SpaController#admin_index`
- `GET /*path` → `SpaController#user_index`（/api/v1, /up を除く）

### テスト結果（2026-02-11）

| テスト | 結果 |
|--------|------|
| RSpec（バックエンド） | 586 examples, 0 failures, 91.69%カバレッジ |
| Vitest（利用者向け） | 407 tests passed |
| Vitest（職員向け） | 337 tests passed |

---

## Phase 6: インフラ・運用準備（手動作業が必要）

以下は本番サーバーでの手動作業が必要です。

| チェック | 内容 | 備考 |
|----------|------|------|
| [ ] SMTP設定 | SMTP情報取得後、`.kamal/secrets` に追加 | デプロイ前に必須 |
| [ ] GitHub PAT発行 | packages:write スコープのトークンを発行 | KAMAL_REGISTRY_PASSWORD |
| [ ] セキュリティキー生成 | `bin/rails secret` で2つ、`openssl rand -base64 32` で1つ | サーバーで実行 |
| [ ] DNS設定 | `psytech.jp` → `160.251.230.38` のAレコード設定 | ドメインレジストラ |
| [ ] SSL証明書 | Let's Encrypt（Kamal proxy自動設定） | kamal deploy で自動 |
| [ ] バックアップ | PostgreSQLの定期バックアップ設定（cron等） | サーバー設定 |
| [ ] 監視 | ヘルスチェック `/api/v1/health` の外部監視 | UptimeRobot等 |

---

## 関連ドキュメント

- [CI/CD設定](.github/workflows/ci.yml)
- [Dockerfile](Dockerfile)（本番用マルチステージビルド）
- [docker-compose.prod.yml](docker-compose.prod.yml)（本番Docker Compose）
- [Kamal設定](config/deploy.yml)
- [本番環境変数テンプレート](../../.env.production)
- [セキュリティ要件](05-security-requirements.md)
- [非機能要件](06-non-functional-requirements.md)
