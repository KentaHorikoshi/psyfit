# 08 - デプロイ前チェックリスト

本番デプロイ前に実施すべき作業を優先度順にまとめる。

## Phase 1: CI/CDテストを通す（CRITICAL） ✅ 完了（2026-02-10）

GitHub Actions（`.github/workflows/ci.yml`）の全ジョブがパスすることを確認する。

### 1-1. セキュリティスキャン

| チェック | コマンド | CIジョブ |
|----------|---------|---------|
| [x] Brakeman（Rails脆弱性スキャン） | `bundle exec brakeman --no-pager` | scan-ruby |
| [x] bundler-audit（Gem脆弱性チェック） | `bundle exec bundler-audit check --update` | scan-ruby |
| [ ] importmap audit（JS依存スキャン） | `bin/importmap audit` | scan-js |

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
| [ ] Playwright（利用者向け） | `cd frontend_user && npm run test:e2e` | e2e-test |
| [ ] Playwright（職員向け） | `cd frontend_admin && npm run test:e2e` | e2e-test |

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

## Phase 2: 本番環境変数の設定（CRITICAL）

`.env.example` をベースに本番用の環境変数を設定する。

### 2-1. 必須環境変数

| 変数名 | 説明 | 生成方法 |
|--------|------|---------|
| [ ] `RAILS_MASTER_KEY` | Rails暗号化マスターキー | `bin/rails secret` |
| [ ] `ATTR_ENCRYPTED_KEY` | PII暗号化キー（AES-256-GCM） | `openssl rand -base64 32` |
| [ ] `POSTGRES_USER` | PostgreSQLユーザー名 | 本番用の安全なユーザー名 |
| [ ] `POSTGRES_PASSWORD` | PostgreSQLパスワード | 強力なランダムパスワード |
| [ ] `REDIS_PASSWORD` | Redisパスワード | 強力なランダムパスワード |
| [ ] `SECRET_KEY_BASE` | Railsセッション署名キー | `bin/rails secret` |

### 2-2. アプリケーションURL

| 変数名 | 説明 | 例 |
|--------|------|-----|
| [ ] `VITE_API_BASE_URL` | フロントエンドからのAPI接続先 | `https://api.example.com/api/v1` |
| [ ] `USER_APP_URL` | 利用者向けアプリURL | `https://user.example.com` |
| [ ] `ADMIN_APP_URL` | 職員向けアプリURL | `https://admin.example.com` |

### 2-3. メール送信（SMTP）

| 変数名 | 説明 |
|--------|------|
| [ ] `SMTP_ADDRESS` | SMTPサーバーアドレス |
| [ ] `SMTP_PORT` | SMTPポート |
| [ ] `SMTP_USERNAME` | SMTP認証ユーザー |
| [ ] `SMTP_PASSWORD` | SMTP認証パスワード |
| [ ] `SMTP_DOMAIN` | メール送信ドメイン |
| [ ] `MAILER_FROM` | From アドレス |

> **注意**: パスワードリセットメール機能が実装済みのため、SMTPは必須。

---

## Phase 3: Kamal デプロイ設定（CRITICAL）

`config/deploy.yml` を本番環境に合わせて更新する。

| チェック | 対象 | 現在値 | 必要な変更 |
|----------|------|--------|-----------|
| [ ] サーバーIP | `servers.web` | `192.168.0.1` | 本番サーバーのIPに変更 |
| [ ] Dockerレジストリ | `registry.server` | `localhost:5555` | Docker Hub / GHCR 等に変更 |
| [ ] レジストリ認証 | `registry.username/password` | コメントアウト | レジストリに合わせて設定 |
| [ ] SSL設定 | `proxy.ssl` | コメントアウト | 有効化してドメイン設定 |
| [ ] DB接続先 | `env.clear.DB_HOST` | コメントアウト | 本番DBホストを設定 |
| [ ] Kamalシークレット | `.kamal/secrets` | プレースホルダー | 本番用キーを設定 |

---

## Phase 4: コードクリーンアップ（HIGH）

### 4-1. デバッグコード除去

| チェック | ファイル | 内容 |
|----------|---------|------|
| [ ] ConnectionTest.tsx 除去（利用者向け） | `frontend_user/src/components/ConnectionTest.tsx` | 開発用接続テストコンポーネント |
| [ ] ConnectionTest.tsx 除去（職員向け） | `frontend_admin/src/components/ConnectionTest.tsx` | 開発用接続テストコンポーネント |
| [ ] console.log の確認 | 両フロントエンド | `console.error` は許容、`console.log` は削除 |

### 4-2. Git管理

| チェック | 内容 |
|----------|------|
| [ ] `.env` をgitから除外 | `.gitignore` に追加し、`git rm --cached .env` を実行 |
| [ ] 機密情報がコミット履歴に含まれていないか確認 | `git log --all --diff-filter=A -- "*.env"` 等 |

---

## Phase 5: 本番Rails設定の確認（HIGH）

| チェック | ファイル | 内容 |
|----------|---------|------|
| [ ] CORS設定 | `config/initializers/cors.rb` | 本番ドメインのみ許可 |
| [ ] `config.hosts` | `config/environments/production.rb` | DNS rebinding protection有効化 |
| [ ] `config.force_ssl` | `config/environments/production.rb` | HTTPS強制 |
| [ ] `config.assume_ssl` | `config/environments/production.rb` | SSL前提動作 |
| [ ] ログレベル | `config/environments/production.rb` | `RAILS_LOG_LEVEL` を `info` に設定 |
| [ ] SMTP設定 | `config/environments/production.rb` | Action Mailerのdelivery_method設定 |
| [ ] セッションストア | `config/initializers/session_store.rb` | Redis接続先の確認 |

---

## Phase 6: インフラ・運用準備（MEDIUM）

| チェック | 内容 |
|----------|------|
| [ ] SSL証明書 | Let's Encrypt（Kamal proxy）または外部証明書 |
| [ ] DNS設定 | 本番ドメインのAレコード設定 |
| [ ] バックアップ | PostgreSQLの定期バックアップ設定 |
| [ ] 監視 | ヘルスチェック `/api/v1/health` の外部監視 |
| [ ] ログ集約 | ログの外部サービスへの転送設定 |
| [ ] Redis永続化 | AOF/RDB設定の確認 |

---

## 実行順序まとめ

```
1. CI/CDテストを通す          ✅ 完了（2026-02-10）
   ├── ローカルで全チェック実行
   ├── 失敗箇所を修正
   └── GitHubにpushしてCI確認  ← 次のステップ
2. 本番環境変数を準備
3. Kamalデプロイ設定を更新
4. コードクリーンアップ
5. 本番Rails設定を確認
6. インフラ・運用準備
7. ステージングでテスト
8. 本番デプロイ
```

---

## 関連ドキュメント

- [CI/CD設定](.github/workflows/ci.yml)
- [Dockerfile](Dockerfile)（本番用マルチステージビルド）
- [docker-compose.prod.yml](docker-compose.prod.yml)（本番Docker Compose）
- [Kamal設定](config/deploy.yml)
- [セキュリティ要件](05-security-requirements.md)
- [非機能要件](06-non-functional-requirements.md)
