# Confirmation Items (確認事項・TODO)

このファイルには、基本設計書から派生した確認事項やTODO項目を記録します。

**最終更新**: 2026-01-27
**ステータス**: **Phase 2 進行中** - Docker環境構築完了、CI/CD・本番デプロイ準備中

---

## 確定事項（クライアント確認済み）

以下の項目はクライアント確認により確定しました：

| 項目 | 決定内容 | 確定日 |
|------|----------|--------|
| 動画ファイル形式 | **MP4** | 2026-01-23 |
| オフライン視聴 | **不要** | 2026-01-23 |
| ダークモード | **不要** | 2026-01-23 |
| レポート出力形式 | **CSV** | 2026-01-23 |
| 未言及機能 | **全て実装** | 2026-01-23 |

---

## システム設計に関する確認事項

### 1. 動画配信の詳細仕様
- [x] 動画ファイル形式の確定 → **MP4**
- [ ] 動画ファイルサイズの上限（推奨: 100MB以下）
- [ ] ストリーミング方式（プログレッシブダウンロード推奨）
- [ ] 帯域幅制限への対応方針
- [x] オフライン視聴機能 → **不要**

### 2. データベース詳細設計
- [x] PostgreSQLバージョンの確定 → **PostgreSQL 16（Docker環境で確定）**
- [ ] データベース暗号化の実装方式詳細
- [ ] バックアップ・リストア手順の策定
- [ ] レプリケーション構成の検討

### 3. 認証・セキュリティ
- [ ] 二要素認証(2FA)の導入要否
- [x] パスワードリセットAPI実装 → **完了（2026-01-25）**
- [x] パスワードリセットのメール送信実装 → **完了（2026-01-26）**
- [ ] セッションタイムアウト後の挙動詳細
- [x] API呼び出しのレート制限詳細 → **完了（2026-01-27）**

### 4. UI/UX詳細
- [ ] ウェルカム画面の自動遷移時間の調整（現在3秒）
- [ ] 祝福演出のアニメーション詳細
- [x] ダークモード対応 → **不要**
- [ ] プッシュ通知の実装範囲

### 5. レポート機能
- [x] レポート出力形式 → **CSV**
- [ ] レポートテンプレートのデザイン（CSVカラム定義）
- [ ] 出力対象データ項目の確定

### 6. 運用・保守
- [ ] ログ監視ツールの選定
- [ ] エラー通知の仕組み（Slack/メール）
- [ ] メンテナンスモードの実装方針
- [ ] デプロイ手順書の作成

## 機能実装の優先順位

### Phase 1: MVP (最小機能製品) ✅ 完了 (2026-01-25)
- [x] ログイン機能（利用者・職員）
- [x] 運動メニュー表示
- [x] 運動記録（基本）
- [x] 体調記録
- [x] 測定値入力（職員）
- [x] ダッシュボード（職員）
- [x] 患者一覧（職員）
- [x] E2Eテスト（Playwright）← **2026-01-25実装完了**
- [x] ESLintエラー修正 ← **2026-01-25完了**

### Phase 2: 拡張機能
- [x] 履歴グラフ表示 ← **実装完了**
- [x] レポート出力 (S-07) ← **実装完了**
- [x] 運動メニュー割当（職員）(S-06) ← **実装完了**
- [x] 職員管理（マネージャー）(S-08) ← **実装完了**
- [x] まとめて記録機能 (U-15) ← **実装完了**

### Phase 3: 最適化・改善
- [ ] パフォーマンス最適化
- [x] オフライン対応 → **不要**
- [ ] プッシュ通知
- [ ] PWA対応

## テスト計画

### 単体テスト
- [ ] モデルバリデーションテスト
- [ ] APIエンドポイントテスト
- [x] Reactコンポーネントテスト（職員向けUI）
  - [x] AuthContext (8 tests)
  - [x] Login (19 tests)
  - [x] Sidebar (15 tests)
  - [x] Dashboard (22 tests)
  - [x] PatientList (29 tests)
  - [x] PatientDetail (17 tests)
  - [x] MeasurementInput (22 tests)
  - [x] ExerciseMenu (18 tests)
  - [x] ReportGeneration (14 tests)
  - [x] StaffManagement (26 tests)
  - [x] PasswordReset (28 tests) ← **NEW**
- [x] Reactコンポーネントテスト（利用者向けUI）
  - [x] Login (19 tests)
  - [x] Home (23 tests)
  - [x] ExerciseMenu (16 tests)
  - [x] ExercisePlayer (24 tests)
  - [x] ExerciseHistory (19 tests)
  - [x] Measurements (20 tests)
  - [x] PasswordReset (31 tests) ← **NEW**
  - [x] Welcome (21 tests)
  - [x] ExerciseCard (20 tests)
  - [x] Celebration (24 tests)
  - [x] ConditionInput (27 tests)
  - [x] BatchRecord (25 tests)
  - [x] AuthContext (8 tests)

### 結合テスト
- [ ] 認証フローテスト
- [ ] 運動記録フローテスト
- [ ] データ暗号化テスト
- [ ] 権限制御テスト

### E2Eテスト ✅ 完了 (2026-01-25)

#### 利用者向け (frontend_user/e2e/)
- [x] 01-login-logout.spec.ts - ログイン・ログアウトフロー
- [x] 02-exercise-flow.spec.ts - 運動メニュー選択・実施・記録
- [x] 03-condition-input.spec.ts - 体調入力フロー
- [x] 04-history.spec.ts - 履歴一覧・測定値グラフ表示
- [x] 05-password-reset.spec.ts - パスワードリセットフロー

#### 職員向け (frontend_admin/e2e/)
- [x] 01-login-logout.spec.ts - ログイン・ログアウトフロー
- [x] 02-patient-management.spec.ts - 患者一覧・詳細表示
- [x] 03-measurement-input.spec.ts - 測定値入力フロー
- [x] 04-exercise-menu.spec.ts - 運動メニュー設定フロー
- [x] 05-report-generation.spec.ts - レポート出力フロー

**実行コマンド**:
```bash
# 利用者向け
cd frontend_user
npm run test:e2e          # 全テスト実行
npm run test:e2e:headed   # ブラウザ表示付き
npm run test:e2e:ui       # UIモード
npm run test:e2e:report   # レポート表示

# 職員向け
cd frontend_admin
npm run test:e2e          # 全テスト実行
npm run test:e2e:headed   # ブラウザ表示付き
npm run test:e2e:ui       # UIモード
npm run test:e2e:report   # レポート表示
```

### セキュリティテスト
- [ ] SQLインジェクション対策確認
- [ ] XSS対策確認
- [ ] CSRF対策確認
- [ ] セッションハイジャック対策確認

## ドキュメント整備

- [x] CLAUDE.md作成
- [x] 01-system-overview.md作成
- [x] 02-screen-design.md作成
- [x] 03-database-schema.md作成
- [x] 04-api-specification.md作成
- [x] 05-security-requirements.md作成
- [x] 06-non-functional-requirements.md作成
- [ ] README.md更新（開発環境セットアップ手順）
- [ ] CONTRIBUTING.md作成
- [ ] API利用ガイド作成

## インフラ・環境

### 開発環境 ✅ 完了 (2026-01-27)
- [x] Dockerコンテナ構成の確定 → **api, db(PostgreSQL 16), redis(Redis 7), frontend_user, frontend_admin**
- [x] docker-compose.yml作成 → **開発用・本番用の2ファイル構成**
- [x] 環境変数テンプレート (.env.example) 作成
- [x] Dockerfile.dev作成（開発用）
- [x] 既存Dockerfile更新（PostgreSQL対応）
- [x] bin/docker-setup, bin/docker-start, bin/docker-test スクリプト作成

### ステージング環境
- [ ] サーバースペック確定
- [ ] デプロイスクリプト作成
- [ ] SSL証明書取得

### 本番環境
- [ ] サーバースペック確定
- [ ] 監視設定
- [ ] バックアップ設定
- [ ] ドメイン設定

## その他

### アクセシビリティ
- [ ] スクリーンリーダーでの動作確認
- [ ] キーボードナビゲーション確認
- [ ] コントラスト比検証ツール実行

### パフォーマンス
- [ ] Lighthouse スコア測定
- [ ] バンドルサイズ最適化
- [ ] 画像最適化
- [ ] Code splitting実装

### コンプライアンス
- [ ] 個人情報保護法対応チェックリスト
- [ ] 医療情報ガイドライン準拠確認
- [ ] 利用規約・プライバシーポリシー作成

## 実装完了項目（2026-01-24）

### 職員向けUI基盤（TDD実装）

**実装方針**: Test-Driven Development (Red-Green-Refactorサイクル)

**実装コンポーネント**:
1. **Sidebar** (`frontend_admin/src/components/Sidebar.tsx`)
   - サイドバー背景色 #1E40AF
   - ナビゲーション: ダッシュボード、患者一覧
   - 役割ベース表示（マネージャーのみ職員管理表示）
   - 職員プロフィール・ログアウト
   - 15 tests, 100% coverage

2. **Dashboard** (`frontend_admin/src/components/Dashboard.tsx`)
   - KPIカード4枚（担当患者数、来院予定、運動実施、全患者数）
   - 担当患者一覧
   - ステータスバッジ（急性期:赤/回復期:黄/維持期:緑）
   - 測定値入力・メニュー設定ボタン
   - 22 tests, 100% coverage

3. **PatientList** (`frontend_admin/src/components/PatientList.tsx`)
   - 患者一覧テーブル（7カラム）
   - 検索機能（患者名、カナ、300msデバウンス）
   - ステータスフィルタ
   - ページネーション
   - 29 tests, 97.9% coverage

**テスト結果**:
- Total: 92 tests passed
- Overall coverage: 98.98% (目標80%を大幅超過)
  - Statements: 98.98%
  - Branches: 97.22%
  - Functions: 95.23%
  - Lines: 98.98%

**ビルド状態**: ✅ 成功

**型定義追加**:
- `Patient`, `PatientStatus`, `PatientsListResponse`, `DashboardStats`

**アクセシビリティ準拠**:
- 最小タップ領域: 44×44px
- 適切なaria-label、role属性
- テーブル構造の正しい実装
- キーボードナビゲーション対応

## 基本設計書v4.1からの未実装項目

基本設計書に記載されているが、まだコード化されていない項目:

- [x] U-09/S-09: パスワードリセットAPI ← **実装完了（2026-01-25）**
- [x] U-15: まとめて記録 ← **実装完了**
- [x] S-07: レポート出力 ← **実装完了**
- [x] S-08: 職員管理 ← **実装完了**
- [x] 監査ログの実装 ← **実装完了**
- [x] 動画アクセス制御の実装 ← **実装完了（2026-01-27）**
- [x] レート制限の実装 ← **実装完了（2026-01-27）**
- [x] パスワードリセットUI（フロントエンド） ← **実装完了（2026-01-25）**

## 実装完了サマリー（2026-01-25）

### 利用者向けUI (frontend_user) - 全画面完了 ✅
| 画面 | コンポーネント | テスト | カバレッジ |
|------|---------------|--------|-----------|
| U-01 ログイン | Login.tsx | 19 tests ✅ | 95.45% |
| U-02 ホーム | Home.tsx | 23 tests ✅ | 96.85% |
| U-03 運動メニュー選択 | ExerciseMenu.tsx | 16 tests ✅ | 94.8% |
| U-04 運動実施 | ExercisePlayer.tsx | 24 tests ✅ | 95.96% |
| U-07 履歴一覧 | ExerciseHistory.tsx | 19 tests ✅ | 100% |
| U-08 測定値履歴 | Measurements.tsx | 20 tests ✅ | 99.59% |
| U-09 パスワードリセット | PasswordReset.tsx | 31 tests ✅ | 96.83% |
| U-10 ウェルカム | Welcome.tsx | 21 tests ✅ | 97.82% |
| U-11 運動カード | ExerciseCard.tsx | 20 tests ✅ | 100% |
| U-13 祝福 | Celebration.tsx | 24 tests ✅ | 100% |
| U-14 体調入力 | ConditionInput.tsx | 27 tests ✅ | 98.79% |
| U-15 まとめて記録 | BatchRecord.tsx | 25 tests ✅ | 98.17% |

**合計**: 277 tests, 97.77% overall coverage

### 職員向けUI (frontend_admin) - 全画面完了 ✅
| 画面 | コンポーネント | テスト | カバレッジ |
|------|---------------|--------|-----------|
| - | Sidebar | Sidebar.tsx | 15 tests ✅ | 100% |
| S-01 ログイン | Login.tsx | 19 tests ✅ | 95.54% |
| S-02 ダッシュボード | Dashboard.tsx | 22 tests ✅ | 100% |
| S-03 患者一覧 | PatientList.tsx | 29 tests ✅ | 97.9% |
| S-04 患者詳細 | PatientDetail.tsx | 17 tests ✅ | 97.51% |
| S-05 測定値入力 | MeasurementInput.tsx | 22 tests ✅ | 85.51% |
| S-06 運動メニュー設定 | ExerciseMenu.tsx | 18 tests ✅ | 88.67% |
| S-07 レポート出力 | ReportGeneration.tsx | 14 tests ✅ | 95.89% |
| S-08 職員管理 | StaffManagement.tsx | 26 tests ✅ | 95%+ |
| S-09 パスワードリセット | PasswordReset.tsx | 28 tests ✅ | 100% |

**合計**: 210 tests

### Phase 1 完了サマリー (2026-01-25)

| カテゴリ | 状態 | 詳細 |
|---------|------|------|
| 利用者向けUI | ✅ 完了 | 12画面、277テスト、97%+カバレッジ |
| 職員向けUI | ✅ 完了 | 9画面、210テスト、95%+カバレッジ |
| バックエンドAPI | ✅ 完了 | 12コントローラー、372テスト、90.49%カバレッジ |
| E2Eテスト | ✅ 完了 | Playwright、利用者5件+職員5件 |
| ESLintエラー | ✅ 完了 | 0エラー |

### Phase 2 残作業（本番デプロイ準備）
| 項目 | 状態 | 優先度 |
|------|------|--------|
| パスワードリセットメール送信 | ✅ 完了 (2026-01-26) | 高 |
| 動画アクセス制御 | ✅ 完了 (2026-01-27) | 高 |
| レート制限 | ✅ 完了 (2026-01-27) | 中 |
| Docker環境構築 | ✅ 完了 (2026-01-27) | 高 |
| CI/CDパイプライン | 未着手 | 中 |
| 本番環境デプロイ | 未着手 | 高 |

## パスワードリセットAPI実装サマリー（2026-01-25）

### 実装内容

TDDで実装完了。利用者・職員両方に対応。

**エンドポイント**:

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/api/v1/auth/password_reset_request` | リセット要求（トークン生成） |
| POST | `/api/v1/auth/password_reset` | パスワード更新 |

### 作成ファイル

| ファイル | 説明 |
|---------|------|
| `db/migrate/20260124100000_create_password_reset_tokens.rb` | マイグレーション |
| `app/models/password_reset_token.rb` | トークンモデル |
| `test/factories/password_reset_tokens.rb` | ファクトリ |
| `spec/models/password_reset_token_spec.rb` | モデルテスト（29件） |
| `spec/requests/api/v1/password_reset_spec.rb` | APIテスト（26件） |

### 変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| `config/routes.rb` | 2エンドポイント追加 |
| `app/controllers/api/v1/auth_controller.rb` | password_reset_request/password_reset アクション追加 |
| `app/models/audit_log.rb` | log_password_reset メソッド追加 |

### セキュリティ要件

- トークン生成: `SecureRandom.urlsafe_base64(32)`
- 有効期限: 1時間
- 使用済みトークン再利用不可
- メール列挙攻撃対策（存在しないアカウントでも成功レスポンス）
- 全操作を監査ログに記録（step: "request" / "complete"）

### データベーススキーマ

**password_reset_tokens テーブル**:

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | プライマリキー |
| user_id | UUID | 利用者ID（FK、nullable） |
| staff_id | UUID | 職員ID（FK、nullable） |
| token | string | セキュアトークン（一意） |
| expires_at | datetime | 有効期限 |
| used_at | datetime | 使用日時（nullable） |
| created_at | datetime | 作成日時 |
| updated_at | datetime | 更新日時 |

**インデックス**:
- `token`（UNIQUE）
- `user_id`
- `staff_id`
- `expires_at`
- `(user_id, used_at)`
- `(staff_id, used_at)`

### テスト結果

- **全テスト**: 372件 パス
- **カバレッジ**: 90.49%（目標80%以上を達成）

### API仕様

#### POST /api/v1/auth/password_reset_request

**リクエスト（利用者）**:
```json
{
  "email": "user@example.com"
}
```

**リクエスト（職員）**:
```json
{
  "staff_id": "yamada"
}
```

**レスポンス（200 OK）**:
```json
{
  "status": "success",
  "data": {
    "message": "パスワードリセットのメールを送信しました"
  }
}
```

#### POST /api/v1/auth/password_reset

**リクエスト**:
```json
{
  "token": "xxxxx",
  "new_password": "NewPassword123!",
  "new_password_confirmation": "NewPassword123!"
}
```

**レスポンス（200 OK）**:
```json
{
  "status": "success",
  "data": {
    "message": "パスワードが更新されました"
  }
}
```

**エラー（422 Unprocessable Entity）**:
```json
{
  "status": "error",
  "message": "トークンが無効または期限切れです"
}
```

### 次のステップ（Phase 2）

- [x] パスワードリセットメール送信実装 ← **完了（2026-01-26）**
- [x] 動画アクセス制御実装（認証済みユーザーのみ） ← **完了（2026-01-27）**
- [x] レート制限実装 ← **完了（2026-01-27）**
- [x] Docker環境構築（docker-compose.yml, .env.example） ← **完了（2026-01-27）**
- [ ] CI/CDパイプライン構築（GitHub Actions）
- [ ] 本番環境デプロイ準備

## パスワードリセットメール送信実装サマリー（2026-01-26）

### 実装内容

TDDで実装。Action Mailerを使用したメール送信機能。

### 作成ファイル

| ファイル | 説明 |
|---------|------|
| `app/mailers/user_mailer.rb` | UserMailerクラス（password_reset_instructions メソッド） |
| `app/views/user_mailer/password_reset_instructions.text.erb` | テキスト版メールテンプレート |
| `app/views/user_mailer/password_reset_instructions.html.erb` | HTML版メールテンプレート |
| `spec/mailers/user_mailer_spec.rb` | メーラーテスト（13件） |

### 変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| `app/mailers/application_mailer.rb` | default from を環境変数から取得するよう更新 |
| `app/controllers/api/v1/auth_controller.rb` | メール送信処理追加、エラーハンドリング実装 |
| `spec/requests/api/v1/password_reset_spec.rb` | メール送信統合テスト追加（4件） |
| `spec/rails_helper.rb` | ActiveJob::TestHelper追加 |

### メール仕様

| 項目 | 内容 |
|------|------|
| 件名 | 【PsyFit】パスワードリセットのご案内 |
| 送信元 | `noreply@psyfit.jp`（環境変数 `MAILER_FROM_ADDRESS` で変更可能） |
| 形式 | text/plain, text/html 両方 |
| 内容 | ユーザー名、リセットリンク、24時間有効期限の明示 |
| 送信方式 | `deliver_later`（非同期） |

### 環境変数

| 変数名 | デフォルト値 | 説明 |
|--------|-------------|------|
| `MAILER_FROM_ADDRESS` | `noreply@psyfit.jp` | メール送信元アドレス |
| `USER_APP_URL` | `http://localhost:3000` | 利用者向けアプリURL（リセットリンク用） |
| `ADMIN_APP_URL` | `http://localhost:3003` | 職員向けアプリURL（リセットリンク用） |

### セキュリティ要件

- メール送信エラー時も成功レスポンスを返す（情報漏洩防止）
- 存在しないメールアドレスでも同じレスポンス（列挙攻撃対策）
- メール本文にトークンを含むリセットリンクを記載
- 有効期限（24時間）を明示

### テスト結果

- **UserMailer テスト**: 13件 パス
- **API統合テスト（メール送信関連）**: 4件 パス
- **全テスト**: 44件 パス

### 注意事項

- 現在の `PasswordResetToken` の有効期限は **1時間** です
- 要件の **24時間** に変更する場合は `app/models/password_reset_token.rb:82` を修正
- 本番環境では SMTP 設定（Sendgrid, SES 等）が必要

## APIレート制限実装サマリー（2026-01-27）

### 実装内容

TDDでRack::Attackによるセッション別APIレート制限を実装。

### レート制限ルール

| 対象 | 制限値 | 期間 | 識別単位 |
|------|--------|------|---------|
| 利用者（一般API） | 60リクエスト | 1分 | セッション（user_id） |
| 職員（一般API） | 120リクエスト | 1分 | セッション（staff_id） |
| 認証エンドポイント | 10リクエスト | 1分 | IP + ログイン識別子 |
| パスワードリセット | 5リクエスト | 1時間 | IPアドレス |
| 未認証（フォールバック） | 120リクエスト | 1分 | IPアドレス |

### レスポンスヘッダー

全APIレスポンスに付与:
- `X-RateLimit-Limit` — 制限値
- `X-RateLimit-Remaining` — 残りリクエスト数
- `X-RateLimit-Reset` — リセット時刻（Unix timestamp）

制限超過時: `429 Too Many Requests` + `Retry-After` ヘッダー + JSON エラーボディ

### 不正リクエスト遮断

SQLインジェクション・XSSパターン検出 → Fail2Ban（3回/10分で1時間遮断） → `403 Forbidden`

### 変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| `config/initializers/rack_attack.rb` | セッション別スロットル、API仕様準拠の制限値に全面改修 |
| `app/middleware/rate_limit_headers.rb` | 新規: X-RateLimit-* ヘッダー付与ミドルウェア |
| `config/initializers/rate_limit_headers.rb` | 新規: ミドルウェア登録 |
| `spec/initializers/rack_attack_spec.rb` | 新規: 23テストケース |

### テスト結果

- **レート制限テスト**: 23件 パス（100%カバレッジ）
- **全テスト**: 460件、カバレッジ 94.85%
- **既存テストへの影響**: なし（回帰なし）

## Docker開発・本番環境構築サマリー（2026-01-27）

### 実装内容

TDDで開発・本番用Docker環境を構築。41項目のテストスクリプトで検証済み。

### アーキテクチャ

| サービス | 開発環境 | 本番環境 |
|---------|---------|---------|
| api | Dockerfile.dev (Ruby 4.0.1-slim) ポート4001 | Dockerfile (マルチステージビルド) ポート80 |
| db | PostgreSQL 16 Alpine ポート5432 | PostgreSQL 16 Alpine ポート5432 |
| redis | Redis 7 Alpine ポート6379 | Redis 7 Alpine（AOF有効） ポート6379 |
| frontend_user | Node 20 Alpine ポート3000 | - （静的ビルド配信） |
| frontend_admin | Node 20 Alpine ポート3003 | - （静的ビルド配信） |

### 作成ファイル

| ファイル | 説明 |
|---------|------|
| `Dockerfile.dev` | 開発用Dockerfile（Ruby 4.0.1-slim + PostgreSQL client） |
| `docker-compose.yml` | 開発環境（5サービス、ヘルスチェック、ボリューム永続化） |
| `docker-compose.prod.yml` | 本番環境（3サービス、ヘルスチェック、ログローテーション） |
| `.env.example` | 環境変数テンプレート |
| `.env.docker` | Docker開発用デフォルト値 |
| `bin/docker-setup` | 初回セットアップスクリプト |
| `bin/docker-start` | 起動スクリプト（引数でサービス選択可能） |
| `bin/docker-test` | Docker環境テストスクリプト（41項目） |

### 変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| `Dockerfile` | sqlite3 → libpq5/postgresql-client（PostgreSQL対応） |
| `.gitignore` | .env.example, .env.docker をトラッキング対象に追加 |
| `.dockerignore` | docker-compose*.yml, frontend_*/ を除外に追加 |

### テスト結果

- **テストスクリプト**: bin/docker-test（41項目）
- **ファイル存在**: 10件 パス
- **Compose設定検証**: 2件 パス
- **サービス定義**: 8件 パス
- **ポートマッピング**: 5件 パス
- **環境変数テンプレート**: 10件 パス
- **セキュリティ**: 3件 パス
- **ボリューム・ヘルスチェック**: 3件 パス
- **Dockerfile.devビルド**: パス

### 使い方

```bash
# 初回セットアップ
bin/docker-setup

# 全サービス起動
bin/docker-start

# バックグラウンド起動
bin/docker-start -d

# 特定サービスのみ
bin/docker-start api       # APIのみ
bin/docker-start db        # DB+Redisのみ
bin/docker-start frontend  # フロントエンドのみ

# 停止
bin/docker-start stop

# テスト実行
bin/docker-test
DOCKER_BUILD_TEST=true bin/docker-test
DOCKER_BUILD_TEST=true DOCKER_UP_TEST=true bin/docker-test
```
