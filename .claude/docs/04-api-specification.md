# API Specification (API仕様)

## 概要

RESTful APIとして設計。JSON形式でデータをやり取り。

**Base URL**: `/api/v1`

## 実装状況

| エンドポイント | ステータス | テスト |
|---------------|-----------|--------|
| POST /api/v1/auth/login | ✅ 実装済み | ✅ |
| POST /api/v1/auth/staff/login | ✅ 実装済み | ✅ |
| DELETE /api/v1/auth/logout | ✅ 実装済み | ✅ |
| GET /api/v1/auth/me | ✅ 実装済み | ✅ |
| POST /api/v1/auth/password_reset_request | ✅ 実装済み | ✅ |
| POST /api/v1/auth/password_reset | ✅ 実装済み | ✅ |
| GET /api/v1/users/me/exercises | ✅ 実装済み | ✅ |
| POST /api/v1/exercise_records | ✅ 実装済み | ✅ |
| GET /api/v1/users/me/exercise_records | ✅ 実装済み | ✅ |
| POST /api/v1/daily_conditions | ✅ 実装済み | ✅ |
| GET /api/v1/users/me/daily_conditions | ✅ 実装済み | ✅ |
| GET /api/v1/exercises/:id | ✅ 実装済み | ✅ |
| GET /api/v1/patients | ✅ 実装済み | ✅ |
| GET /api/v1/patients/:id | ✅ 実装済み | ✅ |
| POST /api/v1/patients | ✅ 実装済み | ✅ |
| PATCH /api/v1/patients/:id | ✅ 実装済み | ✅ |
| POST /api/v1/patients/:patient_id/exercises | ✅ 実装済み | ✅ |
| POST /api/v1/patients/:patient_id/measurements | ✅ 実装済み | ✅ |
| GET /api/v1/patients/:patient_id/measurements | ✅ 実装済み | ✅ |
| GET /api/v1/users/me/measurements | ✅ 実装済み | ✅ |
| GET /api/v1/patients/:patient_id/report | ✅ 実装済み | ✅ |
| GET /api/v1/staff | ✅ 実装済み | ✅ |
| POST /api/v1/staff | ✅ 実装済み | ✅ |
| POST /api/v1/staff/me/password | ✅ 実装済み | ✅ |
| GET /api/v1/exercise_masters | ✅ 実装済み | ✅ |
| POST /api/v1/exercise_masters | ✅ 実装済み | - |
| DELETE /api/v1/exercise_masters/:id | ✅ 実装済み | - |
| GET /api/v1/videos/:exercise_id/token | ✅ 実装済み | ✅ |
| GET /api/v1/videos/:exercise_id/stream | ✅ 実装済み | ✅ |

## フロントエンド実装状況

### 利用者向け (frontend_user) - 全画面実装完了 ✅

| 画面 | コンポーネント | ステータス | テスト |
|------|---------------|-----------|--------|
| U-01 ログイン | Login.tsx | ✅ 実装済み | ✅ 19件 |
| U-02 ホーム | Home.tsx | ✅ 実装済み | ✅ 23件 |
| U-03 運動メニュー選択 | ExerciseMenu.tsx | ✅ 実装済み | ✅ 16件 |
| U-04 運動実施（動画） | ExercisePlayer.tsx | ✅ 実装済み | ✅ 24件 |
| U-07 履歴一覧 | ExerciseHistory.tsx | ✅ 実装済み | ✅ 19件 |
| U-08 測定値履歴 | Measurements.tsx | ✅ 実装済み | ✅ 20件 |
| U-09 パスワードリセット | PasswordReset.tsx | ✅ 実装済み | ✅ 31件 |
| U-10 ウェルカム | Welcome.tsx | ✅ 実装済み | ✅ 21件 |
| U-11 運動カード | ExerciseCard.tsx | ✅ 実装済み | ✅ 20件 |
| U-13 祝福 | Celebration.tsx | ✅ 実装済み | ✅ 24件 |
| U-14 体調入力 | ConditionInput.tsx | ✅ 実装済み | ✅ 27件 |
| U-15 まとめて記録 | BatchRecord.tsx | ✅ 実装済み | ✅ 25件 |

**利用者向けテスト合計**: 302件（カバレッジ: 99.81%）

### 職員向け (frontend_admin) - 全画面実装完了 ✅

| 画面 | コンポーネント | ステータス | テスト |
|------|---------------|-----------|--------|
| - | Sidebar | ✅ 実装済み | ✅ 15件 |
| S-01 ログイン | Login.tsx | ✅ 実装済み | ✅ 19件 |
| S-02 ダッシュボード | Dashboard.tsx | ✅ 実装済み | ✅ 22件 |
| S-03 患者一覧 | PatientList.tsx | ✅ 実装済み | ✅ 29件 |
| S-04 患者詳細 | PatientDetail.tsx | ✅ 実装済み | ✅ 17件 |
| S-05 測定値入力 | MeasurementInput.tsx | ✅ 実装済み | ✅ 22件 |
| S-06 運動メニュー設定 | ExerciseMenu.tsx | ✅ 実装済み | ✅ 18件 |
| S-07 レポート出力 | ReportGeneration.tsx | ✅ 実装済み | ✅ 14件 |
| S-08 職員管理 | StaffManagement.tsx | ✅ 実装済み | ✅ 26件 |
| S-09 パスワードリセット | PasswordReset.tsx | ✅ 実装済み | ✅ 28件 |
| S-10 運動メニュー管理 | ExerciseMenuManagement.tsx | ✅ 実装済み | - |

**職員向けテスト合計**: 210件+

**フロントエンドテストファイル（利用者向け）**:
- `frontend_user/src/components/__tests__/Login.test.tsx` - ログイン画面 (19件)
- `frontend_user/src/components/__tests__/Home.test.tsx` - ホーム画面 (23件)
- `frontend_user/src/components/__tests__/ExerciseMenu.test.tsx` - 運動メニュー選択 (16件)
- `frontend_user/src/components/__tests__/ExercisePlayer.test.tsx` - 運動実施 (24件)
- `frontend_user/src/components/__tests__/ExerciseHistory.test.tsx` - 履歴一覧 (19件)
- `frontend_user/src/components/__tests__/Measurements.test.tsx` - 測定値履歴 (20件)
- `frontend_user/src/components/__tests__/PasswordReset.test.tsx` - パスワードリセット (31件)
- `frontend_user/src/components/__tests__/Welcome.test.tsx` - ウェルカム (21件)
- `frontend_user/src/components/__tests__/ExerciseCard.test.tsx` - 運動カード (20件)
- `frontend_user/src/components/__tests__/Celebration.test.tsx` - 祝福 (24件)
- `frontend_user/src/components/__tests__/ConditionInput.test.tsx` - 体調入力 (27件)
- `frontend_user/src/components/__tests__/BatchRecord.test.tsx` - まとめて記録 (25件)
- `frontend_user/src/contexts/__tests__/AuthContext.test.tsx` - 認証コンテキスト (8件)
- `frontend_user/src/lib/__tests__/api-client.test.ts` - APIクライアント (25件) ✨NEW

**フロントエンドテストファイル（職員向け）**:
- `frontend_admin/src/components/__tests__/Login.test.tsx` - ログイン画面
- `frontend_admin/src/components/__tests__/Dashboard.test.tsx` - ダッシュボード
- `frontend_admin/src/components/__tests__/PatientList.test.tsx` - 患者一覧
- `frontend_admin/src/components/__tests__/PatientDetail.test.tsx` - 患者詳細
- `frontend_admin/src/components/__tests__/MeasurementInput.test.tsx` - 測定値入力
- `frontend_admin/src/components/__tests__/ExerciseMenu.test.tsx` - 運動メニュー設定
- `frontend_admin/src/components/__tests__/ReportGeneration.test.tsx` - レポート出力
- `frontend_admin/src/components/__tests__/StaffManagement.test.tsx` - 職員管理
- `frontend_admin/src/components/__tests__/PasswordReset.test.tsx` - パスワードリセット
- `frontend_admin/src/components/__tests__/ExerciseMenuManagement.test.tsx` - 運動メニュー管理
- `frontend_admin/src/components/__tests__/Sidebar.test.tsx` - サイドバー
- `frontend_admin/src/contexts/__tests__/AuthContext.test.tsx` - 認証コンテキスト

**テストカバレッジ**: 99.81%（目標80%達成）

### APIクライアント実装状況 (2026-01-25) ✨NEW

#### 利用者向けAPIクライアント (`frontend_user/src/lib/api-client.ts`)

| メソッド | エンドポイント | 機能 | テスト |
|----------|---------------|------|:------:|
| `login(credentials)` | POST /api/v1/auth/login | ログイン | ✅ |
| `logout()` | DELETE /api/v1/auth/logout | ログアウト | ✅ |
| `getCurrentUser()` | GET /api/v1/users/me | 現在ユーザー取得 | ✅ |
| `getUserExercises()` | GET /api/v1/users/me/exercises | 運動メニュー取得 | ✅ |
| `getExercise(id)` | GET /api/v1/exercises/:id | 運動詳細取得 | ✅ |
| `createExerciseRecord(data)` | POST /api/v1/exercise_records | 運動記録作成 | ✅ |
| `getExerciseRecords(params)` | GET /api/v1/users/me/exercise_records | 運動履歴取得 | ✅ |
| `createDailyCondition(data)` | POST /api/v1/daily_conditions | 体調記録作成 | ✅ |
| `getMyDailyConditions(params)` | GET /api/v1/users/me/daily_conditions | 体調履歴取得 | ✅ |
| `getMeasurements(params)` | GET /api/v1/users/me/measurements | 測定値履歴取得 | ✅ |

**実装ファイル**:
- `frontend_user/src/lib/api-client.ts` - APIクライアント本体（100%カバレッジ）
- `frontend_user/src/lib/api-types.ts` - 型定義
- `frontend_user/src/lib/__tests__/api-client.test.ts` - テスト（25件）

**機能**:
- BaseURL設定（環境変数 `VITE_API_URL` 対応、デフォルト: `/api/v1`）
- `credentials: 'include'` でセッションCookie送信
- エラーハンドリング（`ApiError`, `AuthenticationError`）
- `DateFilterParams` 対応（`start_date`, `end_date` クエリパラメータ）
- 重複コード削減のための `buildQueryString` ヘルパーメソッド

**エラークラス**:
```typescript
// 認証エラー（401）
class AuthenticationError extends Error {
  name = 'AuthenticationError'
}

// APIエラー（400, 422, 500など）
class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>
}
```

**使用例**:
```typescript
import { apiClient, ApiError, AuthenticationError } from '@/lib/api-client'

// ログイン
const response = await apiClient.login({ email: 'user@example.com', password: 'pass' })
console.log(response.data?.user)

// 運動記録取得（日付フィルタ）
const records = await apiClient.getExerciseRecords({
  start_date: '2026-01-01',
  end_date: '2026-01-31',
})

// エラーハンドリング
try {
  await apiClient.getCurrentUser()
} catch (error) {
  if (error instanceof AuthenticationError) {
    // 認証エラー - ログインページへリダイレクト
  } else if (error instanceof ApiError) {
    console.error(error.message, error.status, error.errors)
  }
}
```

**テストツール**: MSW (Mock Service Worker) 2.12.7

**テストファイル**:
- `spec/requests/api/v1/auth_spec.rb` - 認証API
- `spec/requests/api/v1/password_reset_spec.rb` - パスワードリセットAPI
- `spec/mailers/user_mailer_spec.rb` - パスワードリセットメール（13テスト）
- `spec/requests/api/v1/user_exercises_spec.rb` - 運動メニューAPI
- `spec/requests/api/v1/exercise_records_spec.rb` - 運動記録API
- `spec/requests/api/v1/daily_conditions_spec.rb` - 体調記録API
- `spec/requests/api/v1/measurements_spec.rb` - 測定値API
- `spec/requests/api/v1/patients_spec.rb` - 患者一覧・詳細・登録・更新API
- `spec/requests/api/v1/patient_exercises_spec.rb` - 運動メニュー割当API
- `spec/requests/api/v1/staff_spec.rb` - 職員管理API + パスワード変更API（12テスト追加）
- `spec/requests/api/v1/patient_reports_spec.rb` - 患者レポートAPI
- `spec/models/user_continue_days_spec.rb` - 継続日数ロジック
- `spec/models/password_reset_token_spec.rb` - パスワードリセットトークンモデル
- `spec/models/video_access_token_spec.rb` - 動画アクセストークンモデル（23テスト）
- `spec/requests/api/v1/videos_spec.rb` - 動画配信API（24テスト）

**実装ファイル**:
- `app/mailers/user_mailer.rb` - パスワードリセットメール送信
- `app/views/user_mailer/password_reset_instructions.text.erb` - メールテンプレート（テキスト）
- `app/views/user_mailer/password_reset_instructions.html.erb` - メールテンプレート（HTML）
- `app/controllers/api/v1/daily_conditions_controller.rb` - 体調記録コントローラ
- `app/controllers/api/v1/measurements_controller.rb` - 測定値コントローラ（職員用）
- `app/controllers/api/v1/user_measurements_controller.rb` - 測定値コントローラ（利用者用）
- `app/controllers/api/v1/patients_controller.rb` - 患者管理コントローラ（職員用）
- `app/controllers/api/v1/patient_exercises_controller.rb` - 運動メニュー割当コントローラ（職員用）
- `app/controllers/api/v1/staff_controller.rb` - 職員管理コントローラ（マネージャー用） + パスワード変更（全職員）
- `app/controllers/api/v1/patient_reports_controller.rb` - 患者レポートコントローラ（職員用）
- `app/controllers/api/v1/videos_controller.rb` - 動画配信コントローラ（利用者用）
- `app/services/patient_report_service.rb` - PDF生成サービス
- `app/models/video_access_token.rb` - 動画アクセストークンモデル
- `app/models/daily_condition.rb` - 体調記録モデル
- `app/models/measurement.rb` - 測定値モデル
- `app/models/patient_staff_assignment.rb` - 患者担当職員割当モデル

## データベース拡張

### 運動記録機能

`users` テーブルに追加されたカラム:

| カラム | 型 | 説明 |
|--------|-----|------|
| continue_days | integer | 継続日数（デフォルト: 0） |
| last_exercise_at | datetime | 最後に運動した日時 |

マイグレーション: `db/migrate/20260123090441_add_continue_days_to_users.rb`

### 患者管理機能

`users` テーブルに追加されたカラム:

| カラム | 型 | 説明 |
|--------|-----|------|
| status | string | 病期（急性期/回復期/維持期、デフォルト: 維持期） |
| condition | string | 疾患・身体状態 |
| gender | string | 性別（male/female/other） |
| phone | string | 電話番号 |

マイグレーション: `db/migrate/20260123100152_add_patient_fields_to_users.rb`

新規テーブル: `patient_staff_assignments`

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | プライマリキー |
| user_id | UUID | 患者ID（FK: users.id） |
| staff_id | UUID | 職員ID（FK: staff.id） |
| assigned_at | datetime | 割当日時 |
| is_primary | boolean | 主担当フラグ（デフォルト: false） |
| created_at | datetime | 作成日時 |
| updated_at | datetime | 更新日時 |

インデックス:
- `user_id`
- `staff_id`
- `(user_id, staff_id)` - ユニーク制約
- `(user_id, is_primary)`

マイグレーション: `db/migrate/20260123100225_create_patient_staff_assignments.rb`

## 認証

セッションベース認証を使用。

```http
# ログイン後、セッションCookieが自動的に送信される
Cookie: _psyfit_session=<session_id>
```

### セッションタイムアウト

| ユーザー種別 | タイムアウト |
|-------------|------------|
| 利用者 | 30分 |
| 職員 | 15分 |

## 共通レスポンス形式

### 成功レスポンス
```json
{
  "status": "success",
  "data": { ... }
}
```

### エラーレスポンス
```json
{
  "status": "error",
  "message": "エラーメッセージ",
  "errors": {
    "field_name": ["エラー詳細"]
  }
}
```

## エンドポイント一覧

---

### 認証 (Authentication)

#### POST /api/v1/auth/login (利用者ログイン) ✅

```json
// Request
{
  "email": "tanaka@example.com",
  "password": "Patient1!"
}

// Response (200 OK)
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "name": "田中 健一",
      "email": "tanaka@example.com",
      "continue_days": 14,
      "next_visit_date": "2026-03-15",
      "previous_visit_date": "2026-02-01"
    }
  }
}
```

#### POST /api/v1/auth/staff/login (職員ログイン) ✅

```json
// Request
{
  "staff_id": "MGR001",
  "password": "Manager1!"
}

// Response (200 OK)
{
  "status": "success",
  "data": {
    "staff": {
      "id": "uuid",
      "staff_id": "MGR001",
      "name": "山田 太郎",
      "role": "manager"
    }
  }
}
```

#### DELETE /api/v1/auth/logout ✅

```json
// Response (200 OK)
{
  "status": "success",
  "data": {
    "message": "ログアウトしました"
  }
}
```

#### GET /api/v1/auth/me ✅

現在ログイン中のユーザー情報を取得。

```json
// Response (200 OK) - 利用者の場合
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "name": "田中太郎",
      "email": "patient@example.com",
      "continue_days": 14,
      "next_visit_date": "2026-03-15",
      "previous_visit_date": "2026-02-01"
    }
  }
}

// Response (200 OK) - 職員の場合
{
  "status": "success",
  "data": {
    "staff": {
      "id": "uuid",
      "staff_id": "yamada",
      "name": "山田太郎",
      "role": "manager"
    }
  }
}
```

#### POST /api/v1/auth/password_reset_request (パスワードリセット要求) ✅

パスワードリセットトークンを生成し、メール送信する。

**認証**: 不要

**メール送信**: ✅ 実装済み（2026-01-26）
- Action Mailer (`UserMailer.password_reset_instructions`)
- text/html 両形式のテンプレート
- 非同期送信 (`deliver_later`)
- エラー時も成功レスポンス（情報漏洩防止）

**リクエスト（利用者）**:
```json
{
  "email": "patient@example.com"
}
```

**リクエスト（職員）**:
```json
{
  "staff_id": "yamada"
}
```

**レスポンス (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "message": "パスワードリセットのメールを送信しました"
  }
}
```

**セキュリティ**:
- メール列挙攻撃対策: 存在しないアカウントでも同じレスポンスを返す
- トークン: `SecureRandom.urlsafe_base64(32)` で生成
- 有効期限: 1時間
- 既存の有効トークンは自動的に無効化

**副作用**:
- 監査ログに記録（action: 'password_reset', step: 'request'）

**エラー (422)**:
```json
{
  "status": "error",
  "message": "email または staff_id が必要です"
}
```

#### POST /api/v1/auth/password_reset (パスワード更新) ✅

トークンを検証してパスワードを更新する。

**認証**: 不要（トークンで認証）

**リクエスト**:
```json
{
  "token": "xxxxx",
  "new_password": "NewPassword123!",
  "new_password_confirmation": "NewPassword123!"
}
```

**レスポンス (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "message": "パスワードが更新されました"
  }
}
```

**副作用**:
- パスワードが更新される
- トークンが使用済みとしてマークされる
- アカウントロックがリセットされる（failed_login_count = 0, locked_until = nil）
- 監査ログに記録（action: 'password_reset', step: 'complete'）

**エラー (422)**:
```json
// トークン無効
{
  "status": "error",
  "message": "トークンが無効または期限切れです"
}

// パスワード不一致
{
  "status": "error",
  "message": "パスワードが一致しません"
}

// パスワードバリデーションエラー
{
  "status": "error",
  "message": "パスワードの更新に失敗しました",
  "errors": {
    "password": ["は8文字以上で入力してください"]
  }
}
```

---

### 運動メニュー (User Exercises)

#### GET /api/v1/users/me/exercises ✅

現在の利用者に割り当てられた運動メニューを取得。

**認証**: 利用者セッション必須

```json
// Response (200 OK)
{
  "status": "success",
  "data": {
    "assigned_exercises": [
      {
        "id": "uuid",
        "exercise": {
          "id": "uuid",
          "name": "スクワット",
          "video_url": "/videos/squat.mp4",
          "thumbnail_url": "/thumbnails/squat.jpg"
        },
        "target_reps": 10,
        "target_sets": 3,
        "completed_today": false
      }
    ]
  }
}
```

**レスポンスフィールド**:
| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | UUID | patient_exercises.id |
| exercise.id | UUID | exercises.id |
| exercise.name | String | 運動名 |
| exercise.video_url | String | 動画URL |
| exercise.thumbnail_url | String | サムネイルURL |
| target_reps | Integer | 目標回数 |
| target_sets | Integer | 目標セット数 |
| completed_today | Boolean | 本日実施済みかどうか |

---

#### GET /api/v1/exercises/:id ✅

指定された運動の詳細情報を取得。利用者に割り当てられた運動のみアクセス可能。

**認証**: 利用者セッション必須

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| id | UUID | 運動ID |

```json
// Response (200 OK)
{
  "status": "success",
  "data": {
    "exercise": {
      "id": "uuid",
      "name": "スクワット",
      "description": "下半身の筋力強化",
      "exercise_type": "training",
      "difficulty": "easy",
      "body_part_major": "下肢",
      "body_part_minor": "膝・下腿",
      "recommended_reps": 10,
      "recommended_sets": 3,
      "video_url": "/videos/squat.mp4",
      "thumbnail_url": "/thumbnails/squat.jpg",
      "duration_seconds": 180
    }
  }
}
```

**レスポンスフィールド**:
| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | UUID | 運動ID |
| name | String | 運動名 |
| description | String | 運動の説明 |
| exercise_type | String | 運動種別（stretch/training/massage/balance） |
| difficulty | String | 難易度（easy/medium/hard） |
| body_part_major | String | 大分類（体幹・脊柱/上肢/下肢） |
| body_part_minor | String | 中分類 |
| recommended_reps | Integer | 推奨回数 |
| recommended_sets | Integer | 推奨セット数 |
| video_url | String | 動画URL |
| thumbnail_url | String | サムネイルURL |
| duration_seconds | Integer | 運動時間（秒） |

**エラーレスポンス**:
| ステータス | 説明 |
|-----------|------|
| 401 | 未認証（セッションなし/期限切れ） |
| 403 | 割り当てられていない運動へのアクセス |
| 404 | 存在しない運動ID |

**監査ログ**: `action: 'read'`, `resource_type: 'Exercise'`, `exercise_id: <uuid>`

**実装ファイル**:
- コントローラ: `app/controllers/api/v1/exercises_controller.rb`
- テスト: `spec/requests/api/v1/exercises_spec.rb` (10件)
- ルーティング: `config/routes.rb` に `resources :exercises, only: [:show]` 定義済み

---

### 運動記録 (Exercise Records)

#### POST /api/v1/exercise_records ✅

運動記録を作成。

**認証**: 利用者セッション必須

```json
// Request
{
  "exercise_id": "uuid",
  "completed_reps": 10,
  "completed_sets": 3,
  "completed_at": "2026-01-21T19:30:00Z",
  "duration_seconds": 180
}

// Response (201 Created)
{
  "status": "success",
  "data": {
    "id": "uuid",
    "exercise_id": "uuid",
    "completed_reps": 10,
    "completed_sets": 3,
    "completed_at": "2026-01-21T19:30:00Z"
  }
}
```

**副作用**:
- 継続日数 (continue_days) が自動更新される
- 監査ログに記録される

**継続日数 (continue_days) 更新ロジック**:

| 条件 | 動作 |
|------|------|
| 初回運動 | `continue_days = 1` |
| 前日または2日前に運動済み | `continue_days += 1`（1日スキップ許容） |
| 当日すでに運動済み | 変更なし |
| 3日以上の空白 | `continue_days = 1`（リセット） |

**実装ファイル**:
- コントローラ: `app/controllers/api/v1/exercise_records_controller.rb`
- モデル: `app/models/user.rb` (`update_continue_days!` メソッド)

#### GET /api/v1/users/me/exercise_records ✅

運動記録履歴を取得。

**認証**: 利用者セッション必須

```json
// Query Parameters
?start_date=2026-01-01&end_date=2026-01-31

// Response (200 OK)
{
  "status": "success",
  "data": {
    "records": [
      {
        "id": "uuid",
        "exercise": {
          "id": "uuid",
          "name": "スクワット"
        },
        "completed_reps": 10,
        "completed_sets": 3,
        "completed_at": "2026-01-21T19:30:00Z"
      }
    ],
    "summary": {
      "total_exercises": 45,
      "total_minutes": 1200,
      "continue_days": 14
    }
  }
}
```

---

### 体調記録 (Daily Conditions)

#### POST /api/v1/daily_conditions ✅

体調を記録。同日の記録が既にある場合は更新。

**認証**: 利用者セッション必須

```json
// Request
{
  "recorded_date": "2026-01-21",
  "pain_level": 3,
  "body_condition": 7,
  "notes": "少し痛みがあるが調子は良い"
}

// Response (201 Created / 200 OK)
{
  "status": "success",
  "data": {
    "id": "uuid",
    "recorded_date": "2026-01-21",
    "pain_level": 3,
    "body_condition": 7,
    "notes": "少し痛みがあるが調子は良い"
  }
}
```

**バリデーション**:
| フィールド | ルール |
|-----------|--------|
| pain_level | 0-10の整数 |
| body_condition | 0-10の整数 |
| recorded_date | 省略時は当日 |

#### GET /api/v1/users/me/daily_conditions ✅

体調記録履歴を取得。

**認証**: 利用者セッション必須

```json
// Query Parameters
?start_date=2026-01-01&end_date=2026-01-31

// Response (200 OK)
{
  "status": "success",
  "data": {
    "conditions": [
      {
        "id": "uuid",
        "recorded_date": "2026-01-21",
        "pain_level": 3,
        "body_condition": 7,
        "notes": "少し痛みがあるが調子は良い"
      },
      {
        "id": "uuid",
        "recorded_date": "2026-01-20",
        "pain_level": 4,
        "body_condition": 6,
        "notes": null
      }
    ]
  }
}
```

---

### 運動マスタ (Exercise Masters) ✅

#### GET /api/v1/exercise_masters (職員用) ✅

運動マスタ一覧を取得。S-06運動メニュー設定画面で患者に割り当て可能な運動一覧の取得に使用。

**認証**: 職員セッション必須（マネージャー・一般職員どちらもアクセス可能）

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| exercise_type | string | NO | 運動種別で絞り込み（`ストレッチ`, `トレーニング`, `ほぐす`, `バランス`） |
| difficulty | string | NO | 難易度で絞り込み（`easy`, `medium`, `hard`） |
| body_part_major | string | NO | 大分類で絞り込み（`体幹・脊柱`, `上肢`, `下肢`） |
| body_part_minor | string | NO | 中分類で絞り込み |

**監査ログ**: `action: 'read'`, `resource_type: 'Exercise'`

```json
// Query Parameters
?exercise_type=トレーニング&difficulty=easy&body_part_major=下肢

// Response (200 OK)
{
  "status": "success",
  "data": {
    "exercises": [
      {
        "id": "uuid",
        "name": "スクワット",
        "description": "膝の筋力を強化する運動",
        "exercise_type": "トレーニング",
        "difficulty": "medium",
        "body_part_major": "下肢",
        "body_part_minor": "膝・下腿",
        "recommended_reps": 10,
        "recommended_sets": 3,
        "video_url": "/videos/squat.mp4",
        "thumbnail_url": "/thumbnails/squat.jpg",
        "duration_seconds": 120
      }
    ]
  }
}

// 未認証時 (401 Unauthorized)
{
  "status": "error",
  "message": "認証が必要です"
}
```

**実装ファイル**:
- コントローラ: `app/controllers/api/v1/exercise_masters_controller.rb`
- テスト: `spec/requests/api/v1/exercise_masters_spec.rb` (16件)
- ルーティング: `config/routes.rb` に `resources :exercise_masters, only: [:index, :create, :destroy]` 定義済み

#### POST /api/v1/exercise_masters (職員用) ✅

新しい運動マスタを登録する。

**認証**: 職員セッション必須（全職員）

**リクエスト**:
```json
{
  "name": "レッグプレス",
  "description": "下肢の筋力を強化するマシン運動",
  "exercise_type": "トレーニング",
  "difficulty": "medium",
  "body_part_major": "下肢",
  "body_part_minor": "膝・下腿",
  "recommended_reps": 10,
  "recommended_sets": 3,
  "video_url": "/videos/leg_press.mp4",
  "thumbnail_url": "/thumbnails/leg_press.jpg",
  "duration_seconds": 180
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| name | string | ○ | 運動名（最大100文字） |
| description | string | - | 説明 |
| exercise_type | string | ○ | 運動種別（ストレッチ/トレーニング/ほぐす/バランス） |
| difficulty | string | ○ | 難易度（easy/medium/hard） |
| body_part_major | string | - | 大分類（体幹・脊柱/上肢/下肢） |
| body_part_minor | string | - | 中分類（大分類に依存、下記参照） |
| recommended_reps | integer | - | 推奨回数（正の整数） |
| recommended_sets | integer | - | 推奨セット数（正の整数） |
| video_url | string | - | 動画URL（最大255文字） |
| thumbnail_url | string | - | サムネイルURL（最大255文字） |
| duration_seconds | integer | - | 所要時間・秒（正の整数） |

**中分類（body_part_minor）の選択肢**:
| 大分類 | 中分類 |
|--------|--------|
| 体幹・脊柱 | 頸部、胸部、腹部、腰椎、その他 |
| 上肢 | 肩・上腕、肘・前腕、手関節・手指 |
| 下肢 | 股関節・大腿、膝・下腿、足関節・足部 |

**レスポンス (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "exercise": {
      "id": "uuid",
      "name": "レッグプレス",
      "description": "下肢の筋力を強化するマシン運動",
      "exercise_type": "トレーニング",
      "difficulty": "medium",
      "body_part_major": "下肢",
      "body_part_minor": "膝・下腿",
      "recommended_reps": 10,
      "recommended_sets": 3,
      "video_url": "/videos/leg_press.mp4",
      "thumbnail_url": "/thumbnails/leg_press.jpg",
      "duration_seconds": 180
    }
  }
}
```

**エラーレスポンス (422)**:
```json
{
  "status": "error",
  "message": "バリデーションエラー",
  "errors": {
    "name": ["を入力してください"],
    "exercise_type": ["は一覧にありません"]
  }
}
```

**実装ファイル**:
- コントローラ: `app/controllers/api/v1/exercise_masters_controller.rb`

#### DELETE /api/v1/exercise_masters/:id (職員用) ✅

運動マスタを削除する。患者に割り当て済みの運動は削除不可（`dependent: :restrict_with_error`）。

**認証**: 職員セッション必須（全職員）

**レスポンス (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "message": "運動を削除しました"
  }
}
```

**エラーレスポンス (422)** - 患者に割り当て済みの場合:
```json
{
  "status": "error",
  "message": "この運動は患者に割り当てられているため削除できません"
}
```

**エラーレスポンス (404)** - 存在しない場合:
```json
{
  "status": "error",
  "message": "運動が見つかりません"
}
```

**実装ファイル**:
- コントローラ: `app/controllers/api/v1/exercise_masters_controller.rb`

---

### 患者管理 (Patients) ✅

#### GET /api/v1/patients (職員用) ✅

患者一覧を取得。

**認証**: 職員セッション必須

**認可ルール**:
- マネージャー: 全患者を閲覧可能
- 一般職員: 担当患者のみ閲覧可能（`patient_staff_assignments` テーブルで関連付け）

**クエリパラメータ**:
| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| page | integer | 1 | ページ番号 |
| per_page | integer | 20 | 1ページあたりの件数（最大100） |
| search | string | - | 患者名で検索（部分一致） |
| status | string | - | 病期でフィルタ（`急性期`, `回復期`, `維持期`） |

```json
// Query Parameters
?page=1&per_page=20&search=田中&status=回復期

// Response (200 OK)
{
  "status": "success",
  "data": {
    "patients": [
      {
        "id": "uuid",
        "name": "田中太郎",
        "age": 65,
        "gender": "male",
        "status": "回復期",
        "condition": "変形性膝関節症",
        "assigned_staff": "山田太郎"
      }
    ],
    "meta": {
      "total": 50,
      "page": 1,
      "per_page": 20,
      "total_pages": 3
    }
  }
}
```

**副作用**:
- 監査ログに記録される（action: 'read', status: 'success'）

**エラー**:
- `401 Unauthorized`: 職員セッションがない場合
- `401 Unauthorized`: セッションが期限切れの場合（15分）

---

#### GET /api/v1/patients/:id (職員用) ✅

患者詳細を取得。

**認証**: 職員セッション必須

**認可ルール**:
- マネージャー: 全患者を閲覧可能
- 一般職員: 担当患者のみ閲覧可能（`patient_staff_assignments` テーブルで関連付け）

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| id | UUID | 患者ID |

```json
// Response (200 OK)
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "田中太郎",
    "name_kana": "タナカタロウ",
    "birth_date": "1960-05-15",
    "age": 65,
    "gender": "male",
    "email": "tanaka@example.com",
    "phone": "090-1234-5678",
    "condition": "変形性膝関節症",
    "status": "回復期",
    "continue_days": 14,
    "assigned_staff": [
      {
        "id": "uuid",
        "name": "山田太郎",
        "is_primary": true
      },
      {
        "id": "uuid",
        "name": "佐藤花子",
        "is_primary": false
      }
    ]
  }
}
```

**レスポンスフィールド**:
| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | UUID | 患者ID |
| name | string | 患者氏名（暗号化フィールド） |
| name_kana | string | 患者氏名カナ（暗号化フィールド） |
| birth_date | date | 生年月日（暗号化フィールド） |
| age | integer | 年齢（birth_dateから自動計算） |
| gender | string | 性別（`male`, `female`, `other`） |
| email | string | メールアドレス（暗号化フィールド） |
| phone | string | 電話番号 |
| condition | string | 疾患・身体状態 |
| status | string | 病期（`急性期`, `回復期`, `維持期`） |
| continue_days | integer | 運動継続日数 |
| assigned_staff | array | 担当職員リスト（`is_primary`で主担当を示す） |

**副作用**:
- 監査ログに記録される（action: 'read', resource_id: patient.id）

**エラー**:
- `401 Unauthorized`: 職員セッションがない場合
- `403 Forbidden`: 一般職員が担当外の患者にアクセスした場合
- `404 Not Found`: 患者が存在しない、または論理削除されている場合

**セキュリティ**:
- PII（name, name_kana, email, birth_date）は暗号化されてDBに保存
- 監査ログにアクセス履歴が記録される

#### POST /api/v1/patients (職員用) ✅

患者を新規登録。

**認証**: 職員セッション必須（マネージャーのみ）

**認可ルール**:
- マネージャーのみ患者登録可能
- 一般職員は403 Forbiddenが返される

```json
// Request
{
  "user_code": "USR006",
  "name": "新規 太郎",
  "name_kana": "シンキ タロウ",
  "email": "shinki@example.com",
  "birth_date": "1980-01-01",
  "password": "Patient1!",
  "gender": "male",
  "phone": "090-1234-5678",
  "status": "回復期",
  "condition": "変形性膝関節症"
}

// Response (201 Created)
{
  "status": "success",
  "data": {
    "id": "uuid",
    "user_code": "USR006",
    "name": "新規 太郎",
    "email": "shinki@example.com",
    "status": "回復期",
    "message": "患者を登録しました。初期パスワードは別途お知らせください。"
  }
}
```

**リクエストフィールド**:
| フィールド | 型 | 必須 | 説明 |
|-----------|-----|:----:|------|
| user_code | string | YES | 患者コード（一意） |
| name | string | YES | 患者氏名 |
| name_kana | string | NO | 患者氏名カナ |
| email | string | YES | メールアドレス（一意） |
| birth_date | date | YES | 生年月日（YYYY-MM-DD） |
| password | string | YES | 初期パスワード（8文字以上、2種類以上の文字） |
| gender | string | NO | 性別（`male`, `female`, `other`） |
| phone | string | NO | 電話番号 |
| status | string | NO | 病期（`急性期`, `回復期`, `維持期`）デフォルト: `維持期` |
| condition | string | NO | 疾患・身体状態 |

**バリデーション**:
| フィールド | ルール |
|-----------|--------|
| user_code | 必須、一意、英数字 |
| name | 必須、100文字以内 |
| email | 必須、一意、メール形式（blind index使用） |
| birth_date | 必須、過去の日付 |
| password | 必須、8文字以上、2種類以上の文字タイプ（大文字/小文字/数字/特殊文字） |
| status | `急性期`, `回復期`, `維持期` のいずれか |
| gender | `male`, `female`, `other` のいずれか |

**セキュリティ**:
- PII（name, name_kana, email, birth_date）は暗号化されてDB保存（AES-256-GCM）
- パスワードはbcryptでハッシュ化
- 監査ログに記録される（action: 'create', resource_type: 'Patient', status: 'success'）
- マネージャー権限チェック（require_manager!）

**副作用**:
- 監査ログに記録される（action: 'create', status: 'success'）
- 患者作成後、担当職員の割り当てが必要（別API: patient_staff_assignments）

**エラー**:
- `401 Unauthorized`: 職員セッションがない場合
- `403 Forbidden`: 一般職員がアクセスした場合
- `422 Unprocessable Entity`: バリデーションエラー

```json
// Error Response (422)
{
  "status": "error",
  "message": "バリデーションエラー",
  "errors": {
    "user_code": ["はすでに存在します"],
    "email": ["はすでに存在します"],
    "password": ["は8文字以上で入力してください"]
  }
}
```

#### PATCH /api/v1/patients/:id (職員用) ✅

患者情報を更新。病期変更、疾患・連絡先の更新などに使用。

**認証**: 職員セッション必須

**認可ルール**:
- マネージャー: 全患者を更新可能
- 一般職員: 担当患者のみ更新可能（`patient_staff_assignments` テーブルで関連付け）

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| id | UUID | 患者ID |

```json
// Request（全フィールドオプション、指定されたもののみ更新）
{
  "name": "田中 健一",
  "name_kana": "タナカ ケンイチ",
  "email": "tanaka_new@example.com",
  "phone": "090-9876-5432",
  "status": "回復期",
  "condition": "変形性膝関節症（改善傾向）",
  "gender": "male",
  "birth_date": "1960-05-15"
}

// Response (200 OK)
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "田中 健一",
    "name_kana": "タナカ ケンイチ",
    "email": "tanaka_new@example.com",
    "birth_date": "1960-05-15",
    "age": 65,
    "gender": "male",
    "phone": "090-9876-5432",
    "status": "回復期",
    "condition": "変形性膝関節症（改善傾向）",
    "continue_days": 14,
    "assigned_staff": [...]
  }
}
```

**リクエストフィールド**（全てオプション）:
| フィールド | 型 | バリデーション |
|-----------|-----|---------------|
| name | string | 100文字以内 |
| name_kana | string | - |
| email | string | メール形式、一意（blind index） |
| birth_date | date | 過去の日付（YYYY-MM-DD） |
| gender | string | `male`, `female`, `other` のいずれか |
| phone | string | - |
| status | string | `急性期`, `回復期`, `維持期` のいずれか |
| condition | string | - |

**セキュリティ**:
- `user_code` と `password` はStrong Parametersで除外（更新不可）
- PII（name, name_kana, email, birth_date）は暗号化されてDB保存（AES-256-GCM）
- 監査ログに記録（action: 'update', resource_type: 'Patient', resource_id: patient.id）

**副作用**:
- 監査ログに記録される（action: 'update', status: 'success'）

**エラー**:
- `401 Unauthorized`: 職員セッションがない場合
- `401 Unauthorized`: セッション期限切れの場合（15分）
- `403 Forbidden`: 一般職員が担当外の患者を更新しようとした場合
- `404 Not Found`: 患者が存在しない、または論理削除されている場合
- `422 Unprocessable Entity`: バリデーションエラー

```json
// Error Response (422)
{
  "status": "error",
  "message": "バリデーションエラー",
  "errors": {
    "status": ["is not included in the list"],
    "email_bidx": ["has already been taken"]
  }
}
```

---

#### POST /api/v1/patients/:patient_id/exercises (職員用)

患者に運動メニューを割り当てる。

```json
// Request
{
  "exercise_id": "uuid",
  "target_reps": 10,
  "target_sets": 3
}

// Response (201 Created)
{
  "status": "success",
  "data": {
    "id": "uuid",
    "exercise_id": "uuid",
    "target_reps": 10,
    "target_sets": 3,
    "assigned_at": "2026-01-21T10:00:00Z"
  }
}
```

---

### 測定値 (Measurements) ✅

#### POST /api/v1/patients/:patient_id/measurements (職員用) ✅

測定値を入力。

**バリデーションルール:**

| フィールド | 型 | 必須 | 範囲 |
|-----------|-----|------|------|
| measured_date | Date | YES | - |
| weight_kg | Decimal | NO | 0 < value < 500 |
| knee_extension_strength_left | Decimal (N) | NO | 0 ≤ value < 500 |
| knee_extension_strength_right | Decimal (N) | NO | 0 ≤ value < 500 |
| wbi_left | Decimal | NO | 0 ≤ value ≤ 200 |
| wbi_right | Decimal | NO | 0 ≤ value ≤ 200 |
| tug_seconds | Decimal | NO | 0 < value < 1000 |
| single_leg_stance_seconds | Decimal | NO | 0 ≤ value < 1000 |
| nrs_pain_score | Integer | NO | 0〜10 |
| mmt_score | Integer | NO | 0〜5 |
| notes | Text | NO | - |

※ DecimalフィールドはDB制約 `DECIMAL(5,2)` のため最大値999.99
※ 膝伸展筋力の単位は N (ニュートン)

```json
// Request
{
  "measured_date": "2026-01-21",
  "weight_kg": 65.5,
  "knee_extension_strength_left": 250.0,
  "knee_extension_strength_right": 260.0,
  "wbi_left": 38.46,
  "wbi_right": 40.00,
  "tug_seconds": 12.5,
  "single_leg_stance_seconds": 15.2,
  "nrs_pain_score": 3,
  "mmt_score": 4,
  "notes": "前回より改善傾向"
}

// Response (201 Created)
{
  "status": "success",
  "data": {
    "id": "uuid",
    "measured_date": "2026-01-21",
    "weight_kg": 65.5,
    "knee_extension_strength_left": 250.0,
    "knee_extension_strength_right": 260.0,
    "wbi_left": 38.46,
    "wbi_right": 40.00
    // ... 他のフィールド
  }
}
```

#### GET /api/v1/patients/:patient_id/measurements (職員用) ✅

測定値履歴を取得。

**認証**: 職員セッション必須

```json
// Query Parameters（両方ともオプション）
?start_date=2026-01-01&end_date=2026-01-31

// Response (200 OK)
{
  "status": "success",
  "data": {
    "measurements": [
      {
        "id": "uuid",
        "measured_date": "2026-01-21",
        "weight_kg": "65.5",
        "knee_extension_strength_left": "250.0",
        "knee_extension_strength_right": "260.0",
        "wbi_left": "38.46",
        "wbi_right": "40.00",
        "tug_seconds": "12.5",
        "single_leg_stance_seconds": "15.2",
        "nrs_pain_score": 3,
        "mmt_score": 4,
        "notes": "前回より改善傾向"
      }
    ]
  }
}
```

**クエリパラメータ**:
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| start_date | Date | 開始日（この日以降の記録を取得） |
| end_date | Date | 終了日（この日以前の記録を取得） |

**副作用**:
- 監査ログに記録される（action: 'read'）

#### GET /api/v1/users/me/measurements (利用者用) ✅

自分の測定値履歴を取得。

**認証**: 利用者セッション必須

```json
// Query Parameters（両方ともオプション）
?start_date=2026-01-01&end_date=2026-01-31

// Response (200 OK)
{
  "status": "success",
  "data": {
    "measurements": [
      {
        "id": "uuid",
        "measured_date": "2026-01-21",
        "weight_kg": "65.5",
        "knee_extension_strength_left": "250.0",
        "knee_extension_strength_right": "260.0",
        "wbi_left": "38.46",
        "wbi_right": "40.00",
        "tug_seconds": "12.5",
        "single_leg_stance_seconds": "15.2",
        "nrs_pain_score": 3,
        "mmt_score": 4,
        "notes": "前回より改善傾向"
      }
    ]
  }
}
```

**クエリパラメータ**:
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| start_date | Date | 開始日（この日以降の記録を取得） |
| end_date | Date | 終了日（この日以前の記録を取得） |

---

### レポート (Reports) ✅

#### GET /api/v1/patients/:patient_id/report (職員用) ✅

患者レポートをPDFまたはCSVで生成。

**認証**: 職員セッション必須

**認可ルール**:
- マネージャー: 全患者のレポートを生成可能
- 一般職員: 担当患者のレポートのみ生成可能

**クエリパラメータ**:
| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| start_date | date | 30日前 | レポート開始日 |
| end_date | date | 当日 | レポート終了日 |
| format | string | pdf | 出力形式（pdf または csv） |

```json
// Query Parameters (PDF)
?start_date=2026-01-01&end_date=2026-01-31&format=pdf

// Response (200 OK)
// Content-Type: application/pdf
// Content-Disposition: attachment; filename="patient_report_<患者名>_<開始日>_<終了日>.pdf"
// PDFファイルがダウンロードされる

// Query Parameters (CSV)
?start_date=2026-01-01&end_date=2026-01-31&format=csv

// Response (200 OK)
// Content-Type: text/csv; charset=utf-8
// Content-Disposition: attachment; filename="patient_report_<患者名>_<開始日>_<終了日>.csv"
// CSVファイルがダウンロードされる（UTF-8 BOM付きでExcel互換）
```

**CSV出力仕様**:
- UTF-8 BOM（\xEF\xBB\xBF）付きでExcelでの文字化けを防止
- Content-Type: text/csv; charset=utf-8

**レポート内容**:
- 患者基本情報（氏名、年齢、性別、病期、疾患、継続日数）
- 測定値推移（体重、TUG、片脚立位、NRS、MMT）
- 運動実施状況（日別の運動記録）
- 体調記録（痛み・調子のレベル推移）

**副作用**:
- 監査ログに記録される（action: 'read', resource_type: 'PatientReport'）

**エラー**:
- `401 Unauthorized`: 職員セッションがない場合
- `403 Forbidden`: 一般職員が担当外の患者にアクセスした場合
- `404 Not Found`: 患者が存在しない、または論理削除されている場合
- `422 Unprocessable Entity`: 開始日が終了日より後の場合

---

### 職員管理 (Staff Management) ✅

#### GET /api/v1/staff (マネージャーのみ) ✅

職員一覧を取得。

**認証**: 職員セッション必須（マネージャーのみ）

```json
// Response (200 OK)
{
  "status": "success",
  "data": {
    "staff": [
      {
        "id": "uuid",
        "staff_id": "yamada",
        "name": "山田太郎",
        "role": "manager",
        "department": "リハビリテーション科"
      }
    ]
  }
}
```

**副作用**:
- 監査ログに記録される（action: 'read', status: 'success'）

**エラー**:
- `401 Unauthorized`: 職員セッションがない場合
- `403 Forbidden`: 一般職員がアクセスした場合

#### POST /api/v1/staff (マネージャーのみ) ✅

職員を作成。

**認証**: 職員セッション必須（マネージャーのみ）

```json
// Request
{
  "staff_id": "sato",
  "name": "佐藤花子",
  "name_kana": "サトウハナコ",  // オプション
  "email": "sato@example.com",
  "password": "SecurePass123!",
  "role": "staff",              // オプション（デフォルト: "staff"）
  "department": "リハビリテーション科"  // オプション
}

// Response (201 Created)
{
  "status": "success",
  "data": {
    "id": "uuid",
    "staff_id": "sato",
    "name": "佐藤花子",
    "role": "staff",
    "department": "リハビリテーション科"
  }
}
```

**バリデーション**:
| フィールド | ルール |
|-----------|--------|
| staff_id | 必須、一意 |
| name | 必須 |
| email | オプション、一意（blind index使用） |
| password | 必須、8文字以上、2種類以上の文字タイプ（大文字/小文字/数字/特殊文字） |
| role | `manager` または `staff`（デフォルト: `staff`） |

**セキュリティ**:
- PII（name, name_kana, email）は暗号化されてDB保存
- パスワードはbcryptでハッシュ化
- 監査ログに記録される（action: 'create', status: 'success'）

**エラー**:
- `401 Unauthorized`: 職員セッションがない場合
- `403 Forbidden`: 一般職員がアクセスした場合
- `422 Unprocessable Entity`: バリデーションエラー

#### POST /api/v1/staff/me/password (S-09: パスワード変更) ✅

ログイン中の職員が自分のパスワードを変更する。

**認証**: 職員セッション必須（マネージャー・一般職員どちらもアクセス可能）

**フロントエンド実装**: ✅ `frontend_admin/src/components/PasswordReset.tsx`

```json
// Request
{
  "current_password": "OldPassword123",
  "new_password": "NewSecurePass456!",
  "new_password_confirmation": "NewSecurePass456!"
}

// Response (200 OK)
{
  "status": "success",
  "data": {
    "message": "パスワードを変更しました"
  }
}
```

**バリデーション**:
| フィールド | ルール |
|-----------|--------|
| current_password | 必須、現在のパスワードと一致（bcrypt authenticate） |
| new_password | 必須、8文字以上、2種類以上の文字タイプ |
| new_password_confirmation | 必須、new_passwordと一致 |

**セキュリティ**:
- 現在のパスワード検証必須（bcrypt `authenticate`）
- 新パスワードはbcryptでハッシュ化（`has_secure_password`）
- 監査ログに記録される（action: 'password_change', status: 'success'）
- 変更成功後は `reset_session` でセッションを無効化し、再ログインを要求

**副作用**:
- パスワードが更新される（bcryptハッシュ）
- セッションが無効化される（再ログイン必須）
- 監査ログに記録される（action: 'password_change'）

**エラー**:
- `401 Unauthorized`: 職員セッションがない場合
- `401 Unauthorized`: セッション期限切れの場合（15分）
- `422 Unprocessable Entity`: 現在のパスワードが不正
- `422 Unprocessable Entity`: 新パスワードが短すぎる（8文字未満）
- `422 Unprocessable Entity`: 新パスワードの文字種が不足（2種類未満）
- `422 Unprocessable Entity`: 確認パスワードが不一致
- `422 Unprocessable Entity`: 必須パラメータ未指定

```json
// Error Response (422) - 現在のパスワード不正
{
  "status": "error",
  "message": "現在のパスワードが正しくありません"
}

// Error Response (422) - 確認パスワード不一致
{
  "status": "error",
  "message": "新しいパスワードが一致しません"
}

// Error Response (422) - バリデーションエラー
{
  "status": "error",
  "message": "パスワードの更新に失敗しました",
  "errors": {
    "password": ["is too short (minimum is 8 characters)"]
  }
}
```

**実装ファイル**:
- コントローラ: `app/controllers/api/v1/staff_controller.rb`（`change_password` アクション）
- テスト: `spec/requests/api/v1/staff_spec.rb`（12テストケース）
- ルーティング: `config/routes.rb`（`post "me/password", to: "staff#change_password"`）

---

### 動画配信 (Video Streaming) ✅

#### GET /api/v1/videos/:exercise_id/token (利用者用) ✅

動画アクセス用の一時トークンを発行する。

**認証**: 利用者セッション必須

**認可ルール**:
- ログイン済みの利用者のみ
- 運動メニューが割り当てられている（`patient_exercises` でアクティブな割り当てが存在）

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| exercise_id | UUID | 運動ID |

```json
// Response (200 OK)
{
  "status": "success",
  "data": {
    "token": "a1b2c3d4e5f6...",
    "expires_at": "2026-01-27T12:00:00Z",
    "exercise_id": "uuid"
  }
}
```

**セキュリティ**:
- トークンは暗号学的に安全な乱数（64文字のhex）
- 有効期限: 1時間
- ユーザーIDと運動IDに紐づけ
- 未割当の運動には403 Forbidden

**エラー**:
- `401 Unauthorized`: 認証が必要
- `403 Forbidden`: 運動が割り当てられていない
- `404 Not Found`: 運動が存在しない

#### GET /api/v1/videos/:exercise_id/stream (利用者用) ✅

動画をストリーミング配信する。

**認証**: トークン認証（セッション認証も必要）

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| exercise_id | UUID | 運動ID |

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|-----|------|
| token | string | YES | アクセストークン |

**リクエストヘッダ（オプション）**:
| ヘッダー | 説明 |
|---------|------|
| Range | `bytes=0-1023` 形式でパーシャルコンテンツ要求 |

```
// Response (200 OK) - フル配信
Content-Type: video/mp4
Accept-Ranges: bytes
Content-Length: 12345678
[動画バイナリデータ]

// Response (206 Partial Content) - Range request
Content-Type: video/mp4
Accept-Ranges: bytes
Content-Range: bytes 0-1023/12345678
Content-Length: 1024
[動画部分バイナリデータ]
```

**セキュリティ**:
- トークン検証（有効期限、使用済み、ユーザー一致、運動一致）
- Range requestサポート（動画シーク対応）
- 監査ログに`video_access`として記録

**副作用**:
- 監査ログに記録される（action: 'video_access', status: 'success'）

**エラー**:
- `401 Unauthorized`: トークンが無効、期限切れ、または認証が必要
- `403 Forbidden`: トークンと運動が一致しない、またはユーザーが一致しない
- `404 Not Found`: 動画ファイルが見つからない
- `416 Range Not Satisfiable`: Range headerが無効

**実装ファイル**:
- コントローラ: `app/controllers/api/v1/videos_controller.rb`
- モデル: `app/models/video_access_token.rb`
- テスト: `spec/models/video_access_token_spec.rb`, `spec/requests/api/v1/videos_spec.rb`
- マイグレーション: `db/migrate/20260126100000_create_video_access_tokens.rb`

**使用例**:

```bash
# 1. トークン取得
curl -X GET "http://localhost:4001/api/v1/videos/<exercise_id>/token" \
  -H "Cookie: _psyfit_session=<session_id>"

# Response: { "status": "success", "data": { "token": "abc123...", ... } }

# 2. 動画ストリーミング
curl -X GET "http://localhost:4001/api/v1/videos/<exercise_id>/stream?token=abc123..." \
  -H "Cookie: _psyfit_session=<session_id>" \
  -o video.mp4

# 3. Range request（シーク）
curl -X GET "http://localhost:4001/api/v1/videos/<exercise_id>/stream?token=abc123..." \
  -H "Cookie: _psyfit_session=<session_id>" \
  -H "Range: bytes=0-1048575" \
  -o video_part.mp4
```

---

## エラーコード

| HTTPステータス | 説明 |
|---------------|------|
| 200 OK | 成功 |
| 201 Created | 作成成功 |
| 400 Bad Request | リクエストが不正 |
| 401 Unauthorized | 認証が必要 |
| 403 Forbidden | アクセス権限なし |
| 404 Not Found | リソースが見つからない |
| 422 Unprocessable Entity | バリデーションエラー |
| 500 Internal Server Error | サーバーエラー |

## レート制限

**実装済み**（Rack::Attack + RateLimitHeaders ミドルウェア）

### エンドポイント別制限

| 対象 | 制限値 | 期間 | 識別単位 |
|------|--------|------|---------|
| 利用者（一般API） | 60リクエスト | 1分 | セッション（user_id） |
| 職員（一般API） | 120リクエスト | 1分 | セッション（staff_id） |
| 認証エンドポイント | 10リクエスト | 1分 | IPアドレス + ログイン識別子 |
| パスワードリセット | 5リクエスト | 1時間 | IPアドレス |
| 未認証API（フォールバック） | 120リクエスト | 1分 | IPアドレス |

### レスポンスヘッダー

全APIレスポンスに以下のヘッダーを付与:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642780800
```

| ヘッダー | 説明 |
|---------|------|
| `X-RateLimit-Limit` | 現在のエンドポイントの制限値 |
| `X-RateLimit-Remaining` | 残りリクエスト数 |
| `X-RateLimit-Reset` | リセット時刻（Unix timestamp） |

### 制限超過時のレスポンス

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 45
```

```json
{
  "error": "Rate limit exceeded",
  "retry_after": 45
}
```

### 不正リクエスト遮断

SQLインジェクション・XSSパターンを検出した場合、Fail2Banで自動遮断:

- **検出閾値**: 3回/10分
- **遮断期間**: 1時間
- **レスポンス**: `403 Forbidden`

### 実装ファイル

| ファイル | 役割 |
|---------|------|
| `config/initializers/rack_attack.rb` | Rack::Attack スロットル・ブロックリスト設定 |
| `app/middleware/rate_limit_headers.rb` | X-RateLimit-* ヘッダー付与ミドルウェア |
| `config/initializers/rate_limit_headers.rb` | ミドルウェア登録 |

### キャッシュストア

| 環境 | ストア |
|------|--------|
| 開発/テスト | `ActiveSupport::Cache::MemoryStore` |
| 本番 | Redis（`Rails.cache` 経由） |

---

## 実装サマリー

### 2026-01-23: 患者管理API実装

**実装内容**:
- `GET /api/v1/patients` - 患者一覧取得（ページネーション、検索、フィルタ対応）
- `GET /api/v1/patients/:id` - 患者詳細取得（担当職員情報含む）

**アクセス制御**:
- マネージャー: 全患者にアクセス可能
- 一般職員: 担当患者のみアクセス可能（`patient_staff_assignments`テーブルで管理）

**データベース変更**:
1. `users`テーブル拡張:
   - `status` (string): 病期（急性期/回復期/維持期）
   - `condition` (string): 疾患・身体状態
   - `gender` (string): 性別
   - `phone` (string): 電話番号

2. `patient_staff_assignments`テーブル作成:
   - 患者と職員の担当関係を管理
   - `is_primary`フラグで主担当を識別

**モデル変更**:
- `User`: STATUSES/GENDERS定数、バリデーション、スコープ（`by_status`, `assigned_to`）、`age()`メソッド追加
- `Staff`: `patient_staff_assignments`アソシエーション追加
- `PatientStaffAssignment`: 新規モデル作成

**セキュリティ**:
- PII（name, name_kana, email, birth_date）は暗号化されてDB保存
- 全アクセスが監査ログに記録（action: 'read'）
- 職員セッション必須（15分タイムアウト）
- 一般職員は担当外患者にアクセス不可（403 Forbidden）

**テストカバレッジ**:
- 67テストケース（`spec/requests/api/v1/patients_spec.rb`）
  - 一覧・詳細: 49件
  - 新規登録: 13件（2026-01-28追加）
  - 更新: 18件（2026-01-28追加）
- テストシナリオ:
  - マネージャー/一般職員の権限制御
  - ページネーション（デフォルト20件、最大100件）
  - 名前検索（部分一致）
  - ステータスフィルタ（急性期/回復期/維持期）
  - 複合フィルタ（検索+ステータス）
  - 論理削除された患者の除外
  - セッション期限切れ処理
  - 監査ログ記録

**ファイル一覧**:
- コントローラ: `app/controllers/api/v1/patients_controller.rb`
- モデル: `app/models/patient_staff_assignment.rb`
- マイグレーション:
  - `db/migrate/20260123100152_add_patient_fields_to_users.rb`
  - `db/migrate/20260123100225_create_patient_staff_assignments.rb`
- テスト: `spec/requests/api/v1/patients_spec.rb`
- ファクトリ: `test/factories/patient_staff_assignments.rb`

**使用例**:

```bash
# 患者一覧取得（ページネーション + フィルタ）
curl -X GET "http://localhost:3000/api/v1/patients?page=1&per_page=10&status=回復期&search=田中" \
  -H "Cookie: _psyfit_session=<session_id>"

# 患者詳細取得
curl -X GET "http://localhost:3000/api/v1/patients/<patient_id>" \
  -H "Cookie: _psyfit_session=<session_id>"
```

**次のステップ**:
- ~~運動メニュー割当API（`POST /api/v1/patients/:patient_id/exercises`）~~ ✅ 完了
- 患者レポート生成API（`GET /api/v1/patients/:patient_id/report`）
- ~~職員管理API（`GET /api/v1/staff`, `POST /api/v1/staff`）~~ ✅ 完了

---

### 2026-01-24: 職員管理API実装

**実装内容**:
- `GET /api/v1/staff` - 職員一覧取得（マネージャーのみ）
- `POST /api/v1/staff` - 職員作成（マネージャーのみ）

**アクセス制御**:
- マネージャーのみアクセス可能
- 一般職員は403 Forbiddenが返される

**データベース変更**:
- `staff`テーブル拡張:
  - `department` (string): 所属部署

マイグレーション: `db/migrate/20260124004213_add_department_to_staff.rb`

**セキュリティ**:
- PII（name, name_kana, email）は暗号化されてDB保存（AES-256-GCM）
- パスワードはbcryptでハッシュ化
- パスワード複雑性チェック: 8文字以上、2種類以上の文字タイプ必須
- 全アクセスが監査ログに記録（action: 'read' or 'create'）
- 職員セッション必須（15分タイムアウト）
- マネージャー権限チェック（require_manager!）

**バリデーション**:
- staff_id: 必須、一意
- name: 必須
- email: オプション、一意（blind index使用）
- password: 必須、8文字以上、2種類以上の文字タイプ
- role: `manager` または `staff`

**テストカバレッジ**:
- 41テストケース（`spec/requests/api/v1/staff_spec.rb`）
  - 職員一覧・作成: 29件
  - パスワード変更: 12件
- テストシナリオ:
  - マネージャーのみアクセス可能（403 Forbidden for non-managers）
  - 未認証時は401 Unauthorized
  - セッション期限切れ処理（15分）
  - パスワード複雑性バリデーション
  - staff_id/email一意性チェック
  - 必須フィールドバリデーション
  - オプションフィールド（name_kana, department）
  - デフォルトrole（staff）
  - 論理削除された職員の除外
  - 監査ログ記録

**ファイル一覧**:
- コントローラ: `app/controllers/api/v1/staff_controller.rb`
- マイグレーション: `db/migrate/20260124004213_add_department_to_staff.rb`
- テスト: `spec/requests/api/v1/staff_spec.rb`
- ルーティング: `config/routes.rb` に `resources :staff, only: [:index, :create]` 追加

**使用例**:

```bash
# 職員一覧取得
curl -X GET "http://localhost:3000/api/v1/staff" \
  -H "Cookie: _psyfit_session=<manager_session_id>"

# 職員作成
curl -X POST "http://localhost:3000/api/v1/staff" \
  -H "Content-Type: application/json" \
  -H "Cookie: _psyfit_session=<manager_session_id>" \
  -d '{
    "staff_id": "new_staff",
    "name": "佐藤花子",
    "email": "sato@example.com",
    "password": "SecurePass123!",
    "role": "staff",
    "department": "リハビリテーション科"
  }'
```

**次のステップ**:
- ~~運動メニュー割当API（`POST /api/v1/patients/:patient_id/exercises`）~~ ✅ 完了
- ~~患者レポート生成API（`GET /api/v1/patients/:patient_id/report`）~~ ✅ 完了
- ~~運動マスタAPI（`GET /api/v1/exercise_masters`）~~ ✅ 完了

---

### 2026-01-24: 患者レポートAPI実装

**実装内容**:
- `GET /api/v1/patients/:patient_id/report` - 患者レポートPDF生成

**アクセス制御**:
- マネージャー: 全患者のレポートを生成可能
- 一般職員: 担当患者のレポートのみ生成可能

**PDF生成**:
- `prawn` gem使用（日本語フォント: Noto Sans CJK JP）
- レポート内容:
  - 患者基本情報
  - 測定値推移テーブル
  - 運動実施状況（日別）
  - 体調記録推移

**テストカバレッジ**:
- 17テストケース（`spec/requests/api/v1/patient_reports_spec.rb`）
- 全体カバレッジ: 89.47%（目標80%達成）
- テストシナリオ:
  - マネージャー/一般職員の権限制御
  - PDFファイル生成
  - Content-Dispositionヘッダ確認
  - 測定値・運動記録・体調データ含むレポート
  - デフォルト期間（30日）
  - 無効な日付範囲エラー
  - 論理削除された患者の除外
  - セッション期限切れ処理
  - 監査ログ記録

**ファイル一覧**:
- コントローラ: `app/controllers/api/v1/patient_reports_controller.rb`
- サービス: `app/services/patient_report_service.rb`
- テスト: `spec/requests/api/v1/patient_reports_spec.rb`
- フォント: `app/assets/fonts/NotoSansJP-Regular.otf`
- ルーティング: `config/routes.rb` に `get 'report', to: 'patient_reports#show'` 追加

**使用例**:

```bash
# 患者レポートPDF取得
curl -X GET "http://localhost:3000/api/v1/patients/<patient_id>/report?start_date=2026-01-01&end_date=2026-01-31&format=pdf" \
  -H "Cookie: _psyfit_session=<session_id>" \
  -o patient_report.pdf

# デフォルト期間（過去30日）でレポート取得
curl -X GET "http://localhost:3000/api/v1/patients/<patient_id>/report" \
  -H "Cookie: _psyfit_session=<session_id>" \
  -o patient_report.pdf
```

**次のステップ**:
- ~~運動マスタAPI（`GET /api/v1/exercise_masters`）~~ ✅ 完了

---

### 2026-01-27: 動画配信アクセス制御API実装

**実装内容**:
- `GET /api/v1/videos/:exercise_id/token` - 一時アクセストークン発行
- `GET /api/v1/videos/:exercise_id/stream` - 動画ストリーミング配信

**アクセス制御**:
- トークン発行: セッション認証 + 運動割り当て確認
- ストリーミング: トークン認証（ユーザー・運動バインディング）

**セキュリティ機能**:
- 暗号学的に安全な一時トークン（SecureRandom.hex(32)、64文字）
- トークン有効期限: 1時間
- ユーザーIDと運動IDへのバインディング
- 期限切れ・使用済みトークンの拒否
- 未割当運動へのアクセス拒否（403 Forbidden）
- 他ユーザーのトークン使用拒否（403 Forbidden）
- Range requestサポート（動画シーク対応）
- 監査ログ記録（action: 'video_access'）

**データベース変更**:
- `video_access_tokens` テーブル作成

**テストカバレッジ**:
- 47テストケース
- VideoAccessToken モデル: **100%**
- VideosController: **100%**
- テストシナリオ:
  - トークン生成・検証
  - 期限切れ/使用済みトークンの拒否
  - 未割当運動へのアクセス拒否
  - 他ユーザーのトークン使用拒否
  - Range request処理（206 Partial Content）
  - 不正なRange headerの拒否（416）
  - 監査ログ記録

**ファイル一覧**:
- コントローラ: `app/controllers/api/v1/videos_controller.rb`
- モデル: `app/models/video_access_token.rb`
- マイグレーション: `db/migrate/20260126100000_create_video_access_tokens.rb`
- テスト:
  - `spec/models/video_access_token_spec.rb` (23件)
  - `spec/requests/api/v1/videos_spec.rb` (24件)
- ファクトリ: `test/factories/video_access_tokens.rb`
- ルーティング: `config/routes.rb` に `scope :videos` 追加

**使用例**:

```bash
# 1. トークン取得（セッション認証必須）
curl -X GET "http://localhost:4001/api/v1/videos/<exercise_id>/token" \
  -H "Cookie: _psyfit_session=<session_id>"

# 2. 動画ストリーミング
curl -X GET "http://localhost:4001/api/v1/videos/<exercise_id>/stream?token=<token>" \
  -H "Cookie: _psyfit_session=<session_id>" \
  -o video.mp4

# 3. Range request（シーク対応）
curl -X GET "http://localhost:4001/api/v1/videos/<exercise_id>/stream?token=<token>" \
  -H "Cookie: _psyfit_session=<session_id>" \
  -H "Range: bytes=0-1048575" \
  -o video_part.mp4
```

---

### 2026-01-24: 利用者向けフロントエンド実装

**実装内容**:
- U-01 ログイン画面（`Login.tsx`）
- U-02 ホーム画面（`Home.tsx`）

**ディレクトリ**: `frontend_user/src/components/`

**使用技術**:
- React 18 + TypeScript
- Vite 6
- Tailwind CSS v4
- Vitest + React Testing Library

**実装画面**:

#### U-01 ログイン画面

| 機能 | 実装状況 |
|------|---------|
| メールアドレス入力 | ✅ |
| パスワード入力 | ✅ |
| パスワード表示/非表示トグル | ✅ |
| Zodバリデーション | ✅ |
| ローディング状態 | ✅ |
| エラー表示 | ✅ |
| パスワードリセットリンク | ✅ |
| 認証済みユーザーのリダイレクト | ✅ |

**テスト**: 19ケース（`Login.test.tsx`）
- レンダリング（フォーム要素、ブランド表示）
- フォームバリデーション（空値、無効なメール形式）
- ログイン機能（認証API連携、リダイレクト）
- ローディング状態（ボタン無効化、入力無効化）
- パスワード表示切替
- ナビゲーション（リセットリンク、認証済みリダイレクト）
- アクセシビリティ（ラベル関連付け、タップ領域、スクリーンリーダー）

#### U-02 ホーム画面

| 機能 | 実装状況 |
|------|---------|
| 時間帯別挨拶（おはよう/こんにちは/こんばんは） | ✅ |
| ユーザー名表示 | ✅ |
| 継続日数カード | ✅ |
| メインメニュー（運動する/記録する/履歴を見る） | ✅ |
| 測定値リンク | ✅ |
| フッターナビゲーション | ✅ |
| ローディング状態 | ✅ |
| 未認証時リダイレクト | ✅ |

**テスト**: 23ケース（`Home.test.tsx`）
- レンダリング（挨拶、ユーザー名、継続日数）
- メインメニュー（3メニュー表示、各ナビゲーション）
- 測定値リンク（表示、ナビゲーション）
- 継続日数表示（0日、高日数）
- 認証（未認証時リダイレクト）
- アクセシビリティ（ボタン、見出し構造、タップ領域、ランドマーク）
- フッターナビゲーション
- ローディング状態

**共通コンポーネント**:

| コンポーネント | 機能 | ファイル |
|--------------|------|---------|
| Button | プライマリ/セカンダリ/アウトライン/ゴースト/危険 | `ui/Button.tsx` |
| Input | ラベル、エラー表示、aria属性 | `ui/Input.tsx` |

**認証コンテキスト** (`AuthContext.tsx`):
- ログイン/ログアウト
- セッション管理（30分タイムアウト）
- ユーザー情報管理
- アクティビティトラッキング

**テスト結果**:
```
 ✓ src/contexts/__tests__/AuthContext.test.tsx (8 tests)
 ✓ src/components/__tests__/Home.test.tsx (23 tests)
 ✓ src/components/__tests__/Login.test.tsx (19 tests)

 Test Files  3 passed (3)
      Tests  50 passed (50)
```

**カバレッジ**:
| ファイル | Stmts | Branch | Funcs | Lines |
|---------|-------|--------|-------|-------|
| 全体 | 97.17% | 95.63% | 96.55% | 97.17% |
| Home.tsx | 96.85% | 93.75% | 100% | 96.85% |
| Login.tsx | 95.45% | 88.23% | 100% | 95.45% |
| Button.tsx | 100% | 100% | 100% | 100% |
| Input.tsx | 100% | 100% | 100% | 100% |
| AuthContext.tsx | 91.66% | 92.85% | 100% | 91.66% |

**アクセシビリティ対応（WCAG 2.1 AA）**:
- 最小フォントサイズ: 16px
- タップ領域: 44×44px以上
- フォーカス表示: focus-visible
- ARIA属性: role, aria-label, aria-invalid
- ランドマーク: header, main, nav, region
- セマンティックHTML: 適切な見出し階層

**次のステップ**:
- U-03 運動メニュー選択画面
- U-04 運動実施画面（動画再生）
- U-10 ウェルカム画面
- ルーティング設定（React Router）

### 2026-01-27: APIレート制限実装

**実装内容**:
- Rack::Attack によるセッション別レート制限（利用者: 60/分、職員: 120/分）
- 認証エンドポイント: 10リクエスト/分（ブルートフォース対策）
- パスワードリセット: 5リクエスト/時
- `X-RateLimit-Limit` / `X-RateLimit-Remaining` / `X-RateLimit-Reset` ヘッダー付与
- 制限超過時: 429 Too Many Requests + `Retry-After` ヘッダー
- 不正リクエスト（SQLi/XSS）の Fail2Ban 自動遮断
- 監査ログ記録（`rate_limit_exceeded`, `blocked_request`）

**変更ファイル**:
| ファイル | 変更 |
|---------|------|
| `config/initializers/rack_attack.rb` | セッション別スロットル、API仕様準拠の制限値に全面改修 |
| `app/middleware/rate_limit_headers.rb` | 新規: X-RateLimit-* ヘッダー付与ミドルウェア |
| `config/initializers/rate_limit_headers.rb` | 新規: ミドルウェア登録 |
| `spec/initializers/rack_attack_spec.rb` | 新規: 23テストケース（100%カバレッジ） |

**テスト結果**: 460テスト、全体カバレッジ 94.85%

---

### 2026-01-28: 職員パスワード変更API実装

**実装内容**:
- `POST /api/v1/staff/me/password` - ログイン中の職員が自分のパスワードを変更

**アクセス制御**:
- 全職員（マネージャー・一般職員）がアクセス可能
- `before_action :authenticate_staff!`（`require_manager!` ではない）

**実装詳細**:
- 現在のパスワードをbcrypt `authenticate` で検証
- 新パスワードは `has_secure_password` でハッシュ化（モデルバリデーション活用）
- 変更成功後に `reset_session` でセッション無効化（再ログイン要求）
- `AuditLog.log_action` で `password_change` アクションを記録

**変更ファイル**:
| ファイル | 変更 |
|---------|------|
| `app/controllers/api/v1/staff_controller.rb` | `change_password` アクション追加、`before_action` 調整 |
| `spec/requests/api/v1/staff_spec.rb` | パスワード変更テスト12件追加 |

**テストカバレッジ**:
- 12テストケース
- テストシナリオ:
  - 正常にパスワード変更
  - セッション無効化確認
  - 新パスワードでログイン可能
  - 現在のパスワード不正 → 422
  - 新パスワード短すぎ → 422
  - 文字種不足 → 422
  - 確認パスワード不一致 → 422
  - 必須パラメータ未指定 → 422
  - 未認証 → 401
  - セッション期限切れ → 401
  - 監査ログ記録確認

---

### 2026-01-28: 患者新規登録API実装

**実装内容**:
- `POST /api/v1/patients` - 患者新規登録（マネージャーのみ）

**アクセス制御**:
- マネージャーのみ患者登録可能
- 一般職員は403 Forbiddenが返される
- `before_action :require_manager!`

**実装詳細**:
- `User.new` + `patient_create_params` でStrong Parameters許可
- バリデーション成功時に201 Created + 患者情報を返却
- バリデーション失敗時に422 + エラー詳細を返却
- 監査ログに `create` アクションを記録

**モデル変更（User）**:
- `validates :name, presence: true, length: { maximum: 100 }` 追加
- `validates :birth_date, presence: true` 追加
- `validate :birth_date_must_be_in_past` 追加（未来日付の拒否）

**変更ファイル**:
| ファイル | 変更 |
|---------|------|
| `config/routes.rb` | `resources :patients` に `:create` 追加 |
| `app/controllers/api/v1/patients_controller.rb` | `create` アクション、`patient_create_params`、`require_manager!` 追加 |
| `app/models/user.rb` | `name` presence/length、`birth_date` presence/past バリデーション追加 |
| `spec/requests/api/v1/patients_spec.rb` | `POST /api/v1/patients` テスト13件追加 |

**テストカバレッジ**:
- 13テストケース（認証・認可・セキュリティ100%）
- テストシナリオ:
  - マネージャーが患者を正常に作成（201 Created）
  - user_code重複 → 422
  - email重複 → 422
  - 必須フィールド欠落 → 422
  - パスワード複雑性不足 → 422
  - 無効なstatus値 → 422
  - 無効なgender値 → 422
  - birth_dateが未来日 → 422
  - PII暗号化の確認（DB生データが平文でないことを検証）
  - 監査ログ記録確認
  - 一般職員 → 403 Forbidden
  - 未認証 → 401
  - セッション期限切れ → 401

---

### 2026-01-28: 患者情報更新API実装

**実装内容**:
- `PATCH /api/v1/patients/:id` - 患者情報更新（マネージャーまたは担当職員）

**アクセス制御**:
- マネージャー: 全患者を更新可能
- 一般職員: 担当患者のみ更新可能（`patient_staff_assignments` で関連付け）

**実装詳細**:
- `@patient.update(patient_update_params)` でStrong Parameters適用
- `patient_update_params`: name, name_kana, email, birth_date, gender, phone, status, condition のみ許可
- `user_code` と `password` はStrong Parametersから除外（更新不可）
- 既存の `set_patient` / `authorize_patient_access!` before_action を再利用
- レスポンスは `serialize_patient_detail` を再利用（showアクションと同一形式）
- 監査ログに `update` アクションを記録

**変更ファイル**:
| ファイル | 変更 |
|---------|------|
| `config/routes.rb` | `resources :patients` に `:update` 追加 |
| `app/controllers/api/v1/patients_controller.rb` | `update` アクション、`patient_update_params` 追加、before_action に `:update` 追加 |
| `spec/requests/api/v1/patients_spec.rb` | `PATCH /api/v1/patients/:id` テスト18件追加（合計67件） |

**テストカバレッジ**:
- 18テストケース（認証・認可・セキュリティ100%）
- テストシナリオ:
  - マネージャーが全フィールドを正常に更新（200 OK）
  - レスポンスに必要なフィールドが含まれる
  - status を 急性期→回復期 に更新
  - 複数フィールド同時更新
  - 単一フィールドの部分更新
  - 無効なstatus値 → 422
  - 無効なgender値 → 422
  - email重複 → 422
  - birth_dateが未来日 → 422
  - 存在しない患者ID → 404
  - 論理削除済み患者 → 404
  - user_code は更新されないことを確認
  - password は更新されないことを確認
  - 監査ログ記録確認
  - 担当職員が担当患者を更新 → 200 OK
  - 担当外患者を更新 → 403 Forbidden
  - 未認証 → 401
  - セッション期限切れ → 401

---

### 2026-01-30: 患者レポートCSV出力機能追加

**実装内容**:
- `GET /api/v1/patients/:patient_id/report?format=csv` - 患者レポートCSV生成

**CSV出力仕様**:
- UTF-8 BOM（\xEF\xBB\xBF）付きでExcelでの文字化けを防止
- Content-Type: text/csv; charset=utf-8
- レポート内容はPDFと同一（患者情報、測定値推移、運動実施状況、体調記録）

**変更ファイル**:
| ファイル | 変更 |
|---------|------|
| `app/controllers/api/v1/patient_reports_controller.rb` | format分岐（pdf/csv）、`send_csv_report` 追加 |
| `app/services/patient_report_csv_service.rb` | CSV生成サービス新規作成 |
| `spec/requests/api/v1/patient_reports_spec.rb` | CSV出力テスト10件追加（合計27件） |
| `Gemfile` | `csv` gem追加（Ruby 4.0+ bundled gem） |

**テストカバレッジ**:
- 10テストケース追加
- テストシナリオ:
  - CSVファイル返却（Content-Type確認）
  - UTF-8 BOM付与確認（Excel互換性）
  - charset=utf-8 ヘッダー確認
  - Content-Disposition に .csv 拡張子
  - 測定値データがCSVに含まれる
  - 運動実施データがCSVに含まれる
  - 監査ログ記録確認
  - 担当職員がCSVダウンロード可能
  - 担当外患者 → 403 Forbidden
  - 未認証 → 401

**使用例**:

```bash
# 患者レポートCSV取得
curl -X GET "http://localhost:3000/api/v1/patients/<patient_id>/report?start_date=2026-01-01&end_date=2026-01-31&format=csv" \
  -H "Cookie: _psyfit_session=<session_id>" \
  -o patient_report.csv
```
