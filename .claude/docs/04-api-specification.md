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
| GET /api/v1/exercises | ⏳ 未実装 | - |
| GET /api/v1/patients | ✅ 実装済み | ✅ |
| GET /api/v1/patients/:id | ✅ 実装済み | ✅ |
| POST /api/v1/patients/:patient_id/exercises | ✅ 実装済み | ✅ |
| POST /api/v1/patients/:patient_id/measurements | ✅ 実装済み | ✅ |
| GET /api/v1/patients/:patient_id/measurements | ✅ 実装済み | ✅ |
| GET /api/v1/users/me/measurements | ✅ 実装済み | ✅ |
| GET /api/v1/patients/:patient_id/report | ✅ 実装済み | ✅ |
| GET /api/v1/staff | ✅ 実装済み | ✅ |
| POST /api/v1/staff | ✅ 実装済み | ✅ |
| POST /api/v1/staff/me/password | ⏳ バックエンド未実装 | - |

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

**職員向けテスト合計**: 210件

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
- `spec/requests/api/v1/patients_spec.rb` - 患者一覧・詳細API
- `spec/requests/api/v1/patient_exercises_spec.rb` - 運動メニュー割当API
- `spec/requests/api/v1/staff_spec.rb` - 職員管理API
- `spec/requests/api/v1/patient_reports_spec.rb` - 患者レポートAPI
- `spec/models/user_continue_days_spec.rb` - 継続日数ロジック
- `spec/models/password_reset_token_spec.rb` - パスワードリセットトークンモデル

**実装ファイル**:
- `app/mailers/user_mailer.rb` - パスワードリセットメール送信
- `app/views/user_mailer/password_reset_instructions.text.erb` - メールテンプレート（テキスト）
- `app/views/user_mailer/password_reset_instructions.html.erb` - メールテンプレート（HTML）
- `app/controllers/api/v1/daily_conditions_controller.rb` - 体調記録コントローラ
- `app/controllers/api/v1/measurements_controller.rb` - 測定値コントローラ（職員用）
- `app/controllers/api/v1/user_measurements_controller.rb` - 測定値コントローラ（利用者用）
- `app/controllers/api/v1/patients_controller.rb` - 患者管理コントローラ（職員用）
- `app/controllers/api/v1/patient_exercises_controller.rb` - 運動メニュー割当コントローラ（職員用）
- `app/controllers/api/v1/staff_controller.rb` - 職員管理コントローラ（マネージャー用）
- `app/controllers/api/v1/patient_reports_controller.rb` - 患者レポートコントローラ（職員用）
- `app/services/patient_report_service.rb` - PDF生成サービス
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
      "continue_days": 14
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
      "continue_days": 14
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

### 運動マスタ (Exercises) ⏳

#### GET /api/v1/exercises

運動マスタ一覧を取得。

```json
// Query Parameters
?category=筋力&difficulty=easy

// Response (200 OK)
{
  "status": "success",
  "data": {
    "exercises": [
      {
        "id": "uuid",
        "name": "スクワット",
        "description": "膝の筋力を強化する運動",
        "category": "筋力",
        "difficulty": "medium",
        "recommended_reps": 10,
        "recommended_sets": 3,
        "video_url": "/videos/squat.mp4",
        "thumbnail_url": "/thumbnails/squat.jpg",
        "duration_seconds": 120
      }
    ]
  }
}
```

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

```json
// Request
{
  "measured_date": "2026-01-21",
  "weight_kg": 65.5,
  "knee_extension_strength_left": 25.3,
  "knee_extension_strength_right": 26.1,
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
    "knee_extension_strength_left": 25.3
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
        "knee_extension_strength_left": "25.3",
        "knee_extension_strength_right": "26.1",
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
        "knee_extension_strength_left": "25.3",
        "knee_extension_strength_right": "26.1",
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

患者レポートをPDFで生成。

**認証**: 職員セッション必須

**認可ルール**:
- マネージャー: 全患者のレポートを生成可能
- 一般職員: 担当患者のレポートのみ生成可能

**クエリパラメータ**:
| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| start_date | date | 30日前 | レポート開始日 |
| end_date | date | 当日 | レポート終了日 |
| format | string | pdf | 出力形式（現在はpdfのみ対応） |

```json
// Query Parameters
?start_date=2026-01-01&end_date=2026-01-31&format=pdf

// Response (200 OK)
// Content-Type: application/pdf
// Content-Disposition: attachment; filename="patient_report_<患者名>_<開始日>_<終了日>.pdf"
// PDFファイルがダウンロードされる
```

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

#### POST /api/v1/staff/me/password (S-09: パスワード変更) ⏳

ログイン中の職員が自分のパスワードを変更する。

**認証**: 職員セッション必須

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
| current_password | 必須、現在のパスワードと一致 |
| new_password | 必須、8文字以上、2種類以上の文字タイプ |
| new_password_confirmation | 必須、new_passwordと一致 |

**セキュリティ**:
- 現在のパスワード検証必須
- 新パスワードはbcryptでハッシュ化
- 監査ログに記録される（action: 'password_change'）
- 変更成功後はセッションを無効化し、再ログインを要求

**エラー**:
- `401 Unauthorized`: 職員セッションがない場合
- `422 Unprocessable Entity`: バリデーションエラー（現在のパスワード不一致など）

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

- **利用者**: 60リクエスト/分
- **職員**: 120リクエスト/分

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642780800
```

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
- 36テストケース（`spec/requests/api/v1/patients_spec.rb`）
- 全体カバレッジ: 86.52%（目標80%達成）
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
- 29テストケース（`spec/requests/api/v1/staff_spec.rb`）
- 全体カバレッジ: 87.47%（目標80%達成）
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
- 運動マスタAPI（`GET /api/v1/exercises`）

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
- 運動マスタAPI（`GET /api/v1/exercises`）

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
