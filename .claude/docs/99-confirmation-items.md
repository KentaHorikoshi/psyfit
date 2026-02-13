# Confirmation Items (確認事項・TODO)

このファイルには、基本設計書から派生した確認事項やTODO項目を記録します。

**最終更新**: 2026-02-14
**ステータス**: **Phase 2 完了** - CI/CDパイプライン構築完了、本番環境デプロイ完了（psytech.jp で稼働中）

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
- [x] 職員パスワード変更API実装 → **完了（2026-01-28）**
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
| バックエンドAPI | ✅ 完了 | 13コントローラー、400+テスト（運動マスタ16件追加）、90%+カバレッジ |
| E2Eテスト | ✅ 完了 | Playwright、利用者5件+職員5件 |
| ESLintエラー | ✅ 完了 | 0エラー |

### Phase 2 残作業（本番デプロイ準備）
| 項目 | 状態 | 優先度 |
|------|------|--------|
| パスワードリセットメール送信 | ✅ 完了 (2026-01-26) | 高 |
| 動画アクセス制御 | ✅ 完了 (2026-01-27) | 高 |
| レート制限 | ✅ 完了 (2026-01-27) | 中 |
| Docker環境構築 | ✅ 完了 (2026-01-27) | 高 |
| 職員パスワード変更API | ✅ 完了 (2026-01-28) | 中 |
| 患者新規登録API | ✅ 完了 (2026-01-28) | 高 |
| 患者情報更新API | ✅ 完了 (2026-01-28) | 高 |
| 運動マスタ一覧API | ✅ 完了 (2026-01-28) | 中 |
| 運動詳細API | ✅ 完了 (2026-01-30) | 中 |
| CI/CDパイプライン | ✅ 完了 (2026-01-30) | 中 |
| 本番環境デプロイ | ✅ 完了 (2026-02-14) | 高 |

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
- [x] 職員パスワード変更API ← **完了（2026-01-28）**
- [x] 患者新規登録API ← **完了（2026-01-28）**
- [x] 患者情報更新API ← **完了（2026-01-28）**
- [x] 運動マスタ一覧API ← **完了（2026-01-28）**
- [x] CI/CDパイプライン構築（GitHub Actions） ← **完了（2026-01-30）**
- [x] 本番環境デプロイ準備 ← **完了（2026-02-14、psytech.jp で稼働中）**

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

## 運動マスタ一覧API実装サマリー（2026-01-28）

### 実装内容

TDDで実装。S-06運動メニュー設定画面で使用する運動マスタ一覧取得API。

**エンドポイント**:

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/v1/exercise_masters` | 運動マスタ一覧取得（職員認証必須） |

### 作成ファイル

| ファイル | 説明 |
|---------|------|
| `app/controllers/api/v1/exercise_masters_controller.rb` | コントローラ（51行） |
| `spec/requests/api/v1/exercise_masters_spec.rb` | リクエストテスト（16件） |

### 機能

- 職員認証必須（`authenticate_staff!`）
- カテゴリフィルタ（`?category=筋力`）— 既存スコープ `by_category` 使用
- 難易度フィルタ（`?difficulty=easy`）— 既存スコープ `by_difficulty` 使用
- 複合フィルタ（category + difficulty）
- 監査ログ記録（`action: 'read'`, `resource_type: 'Exercise'`）

### テスト結果

- **テストケース**: 16件 全パス
- テストシナリオ:
  - 全運動一覧取得（4件のテストデータ）
  - レスポンスフィールド検証（id, name, description, category, difficulty, recommended_reps, recommended_sets, video_url, thumbnail_url, duration_seconds）
  - カテゴリフィルタ（筋力/バランス/柔軟性）
  - 難易度フィルタ（easy/medium/hard）
  - 複合フィルタ（category + difficulty）
  - 0件時の空配列レスポンス
  - 監査ログ記録
  - 一般職員のアクセス許可
  - 利用者セッションでの401
  - 未認証での401
  - セッション期限切れでの401

## 運動詳細API実装サマリー（2026-01-30）

### 実装内容

TDDで実装。利用者向け運動詳細取得API。

**エンドポイント**:

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/v1/exercises/:id` | 運動詳細取得（利用者認証必須） |

### 作成ファイル

| ファイル | 説明 |
|---------|------|
| `app/controllers/api/v1/exercises_controller.rb` | コントローラ（63行） |
| `spec/requests/api/v1/exercises_spec.rb` | リクエストテスト（10件） |

### 機能

- 利用者認証必須（`authenticate_user!`）
- 利用者に割り当てられた運動のみアクセス可能（`patient_exercises` でアクティブな割り当てが存在）
- 監査ログ記録（`action: 'read'`, `resource_type: 'Exercise'`, `exercise_id: <uuid>`）

### レスポンス形式

```json
{
  "status": "success",
  "data": {
    "exercise": {
      "id": "uuid",
      "name": "スクワット",
      "description": "下半身の筋力強化",
      "category": "筋力",
      "difficulty": "easy",
      "recommended_reps": 10,
      "recommended_sets": 3,
      "video_url": "/videos/squat.mp4",
      "thumbnail_url": "/thumbnails/squat.jpg",
      "duration_seconds": 180
    }
  }
}
```

### エラーケース

| ステータス | 説明 |
|-----------|------|
| 401 | 未認証（セッションなし/期限切れ） |
| 403 | 割り当てられていない運動へのアクセス |
| 404 | 存在しない運動ID |

### テスト結果

- **テストケース**: 10件 全パス
- テストシナリオ:
  - 未認証時の401
  - 認証済み利用者で割り当て運動の取得成功
  - 監査ログ記録確認
  - 非アクティブ割り当ての403
  - 未割り当て運動の403
  - 他ユーザー割り当て運動の403
  - 存在しない運動IDの404
  - 職員セッションでの401
  - セッションタイムアウト後の401（30分）
  - セッション有効内のアクセス成功（29分）

## CI/CDパイプライン構築サマリー（2026-01-30）

### 実装内容

GitHub Actionsによる統合CI/CDパイプラインを構築。プルリクエスト・プッシュ時に自動実行。

### ワークフロー構成

**ファイル**: `.github/workflows/ci.yml`

**トリガー**:
- push: main, develop ブランチ
- pull_request: main, develop ブランチ

### ジョブ一覧

| ジョブ名 | 説明 | 依存関係 |
|---------|------|---------|
| scan-ruby | Brakeman + bundler-audit | なし（並列） |
| scan-js | importmap audit | なし（並列） |
| lint-ruby | RuboCop | なし（並列） |
| backend-test | RSpec + PostgreSQL 16 + Redis 7 | なし（並列） |
| frontend-user-test | ESLint + tsc + Vitest | なし（並列） |
| frontend-admin-test | ESLint + tsc + Vitest | なし（並列） |
| build-check | npm run build (両アプリ) | なし（並列） |
| e2e-test | Playwright E2E | backend-test 完了後 |
| ci-success | 全ジョブ成功確認 | 全ジョブ完了後 |

### 主要機能

#### 1. バックエンドテスト (backend-test)
- **サービスコンテナ**: PostgreSQL 16-alpine, Redis 7-alpine
- **テスト**: RSpec + SimpleCov
- **カバレッジ**: 80%必須（SimpleCov minimum_coverage）
- **出力**: JUnit XML形式（rspec_junit_formatter）
- **環境変数**:
  - `DATABASE_URL`: postgres://postgres:postgres@localhost:5432/psyfit_test
  - `REDIS_URL`: redis://localhost:6379/1
  - `SECRET_KEY_BASE`: test-secret-key-for-ci-environment

#### 2. フロントエンドテスト (frontend-user-test, frontend-admin-test)
- **Node.js**: 20
- **ステップ**: npm ci → ESLint → tsc --noEmit → Vitest
- **カバレッジ**: 80%必須（coverage-summary.json で検証）
- **キャッシュ**: npm (package-lock.json ベース)

#### 3. ビルドチェック (build-check)
- **対象**: frontend_user, frontend_admin
- **マトリクス戦略**: 並列ビルド
- **アーティファクト**: dist/ を1日間保存

#### 4. E2Eテスト (e2e-test)
- **ブラウザ**: Chromium (Playwright)
- **マトリクス戦略**: frontend_user (port 5173), frontend_admin (port 5174)
- **タイムアウト**: 30分
- **失敗時**: スクリーンショット保存（7日間）
- **レポート**: e2e-report/ を14日間保存

### 最適化

- **並列実行**: 依存関係のないジョブは全て並列実行
- **キャッシュ活用**:
  - Ruby gems: bundler-cache (ruby/setup-ruby)
  - npm packages: cache (actions/setup-node)
  - RuboCop: actions/cache
- **早期終了**: concurrency設定で同一ブランチの古い実行をキャンセル
- **失敗時の早期終了**: fail-fast: false (E2E) で全テスト結果を収集

### 追加したGem

| Gem | バージョン | 用途 |
|-----|-----------|------|
| rspec_junit_formatter | ~> 0.6 | CI用JUnit XML出力 |

### アーティファクト

| 名前 | 内容 | 保持期間 |
|------|------|---------|
| backend-coverage | SimpleCovレポート | 7日 |
| backend-test-results | RSpec JUnit XML | 7日 |
| frontend-user-coverage | Vitestカバレッジ | 7日 |
| frontend-admin-coverage | Vitestカバレッジ | 7日 |
| frontend_user-build | ビルド成果物 | 1日 |
| frontend_admin-build | ビルド成果物 | 1日 |
| e2e-report-* | Playwrightレポート | 14日 |
| e2e-screenshots-* | 失敗時スクリーンショット | 7日 |

### ステータスバッジ

READMEに追加可能:
```markdown
![CI](https://github.com/<owner>/psyfit/actions/workflows/ci.yml/badge.svg)
```

### 次のステップ

- [x] 本番環境デプロイワークフロー（CD） ← **完了（deploy.yml + bin/deploy.sh）**
- [ ] Slack/メール通知設定
- [ ] デプロイ承認フロー（環境保護ルール）

## 運動履歴APIレスポンス形式修正サマリー（2026-01-30）

### 修正内容

TDDで実装。フロントエンドの型定義との整合性を確保するため、`GET /api/v1/users/me/exercise_records` のレスポンス形式を修正。

### 変更前後の比較

| 項目 | 変更前 | 変更後 |
|------|--------|--------|
| 運動名 | `exercise.name` (ネスト) | `exercise_name` (フラット) |
| 運動ID | `exercise.id` (ネスト) | `exercise_id` (フラット) |
| 運動カテゴリ | なし | `exercise_category` |
| 回数 | `completed_reps` | `reps_completed` |
| セット | `completed_sets` | `sets_completed` |

### 変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| `app/controllers/api/v1/exercise_records_controller.rb` | `record_with_exercise` メソッドのレスポンス形式を修正 |
| `spec/requests/api/v1/exercise_records_spec.rb` | テストの期待値を新形式に更新 |

### 新レスポンス形式

```json
{
  "status": "success",
  "data": {
    "records": [
      {
        "id": "uuid",
        "exercise_id": "uuid",
        "exercise_name": "スクワット",
        "exercise_category": "筋力",
        "completed_at": "2026-01-30T10:00:00+09:00",
        "sets_completed": 3,
        "reps_completed": 10
      }
    ],
    "summary": {
      "total_exercises": 1,
      "total_minutes": 3,
      "continue_days": 14
    }
  }
}
```

### フロントエンド型定義（参照）

`frontend_user/src/lib/api-types.ts`:
```typescript
interface ExerciseRecordWithExercise extends ExerciseRecord {
  exercise_name: string
  exercise_category: string
}

interface ExerciseRecord {
  id: string
  exercise_id: string
  user_id: string
  completed_at: string
  sets_completed: number
  reps_completed: number
  pain_level?: number
  notes?: string
}
```

### テスト結果

- **テストケース**: 29件 全パス
- **回帰なし**: 既存の全テストが正常通過
