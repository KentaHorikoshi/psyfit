# API Specification (API仕様)

## 概要

RESTful APIとして設計。JSON形式でデータをやり取り。

**Base URL**: `/api/v1`

## 認証

セッションベース認証を使用。

```http
# ログイン後、セッションCookieが自動的に送信される
Cookie: _psyfit_session=<session_id>
```

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

### 認証 (Authentication)

#### POST /api/v1/auth/login (利用者ログイン)
```json
// Request
{
  "email": "patient@example.com",
  "password": "password123"
}

// Response (200 OK)
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
```

#### POST /api/v1/auth/staff/login (職員ログイン)
```json
// Request
{
  "staff_id": "yamada",
  "password": "password123"
}

// Response (200 OK)
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

#### DELETE /api/v1/auth/logout
```json
// Response (200 OK)
{
  "status": "success",
  "message": "ログアウトしました"
}
```

### 患者 (Users/Patients)

#### GET /api/v1/users/me
現在ログイン中の利用者情報を取得。

```json
// Response (200 OK)
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "田中太郎",
    "email": "patient@example.com",
    "continue_days": 14,
    "status": "回復期",
    "condition": "変形性膝関節症"
  }
}
```

#### GET /api/v1/patients (職員用)
患者一覧を取得。一般職員は担当患者のみ、マネージャーは全患者。

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

#### GET /api/v1/patients/:id (職員用)
患者詳細を取得。

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
      }
    ]
  }
}
```

### 運動 (Exercises)

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

#### GET /api/v1/users/me/exercises
現在の利用者に割り当てられた運動メニューを取得。

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

### 運動記録 (Exercise Records)

#### POST /api/v1/exercise_records
運動記録を作成。

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

#### GET /api/v1/users/me/exercise_records
運動記録履歴を取得。

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

### 体調記録 (Daily Conditions)

#### POST /api/v1/daily_conditions
体調を記録。

```json
// Request
{
  "recorded_date": "2026-01-21",
  "pain_level": 3,
  "body_condition": 7,
  "notes": "少し痛みがあるが調子は良い"
}

// Response (201 Created)
{
  "status": "success",
  "data": {
    "id": "uuid",
    "recorded_date": "2026-01-21",
    "pain_level": 3,
    "body_condition": 7
  }
}
```

#### GET /api/v1/users/me/daily_conditions
体調記録履歴を取得。

```json
// Query Parameters
?start_date=2026-01-01&end_date=2026-01-31

// Response (200 OK)
{
  "status": "success",
  "data": {
    "conditions": [
      {
        "recorded_date": "2026-01-21",
        "pain_level": 3,
        "body_condition": 7
      },
      {
        "recorded_date": "2026-01-20",
        "pain_level": 4,
        "body_condition": 6
      }
    ]
  }
}
```

### 測定値 (Measurements)

#### POST /api/v1/patients/:patient_id/measurements (職員用)
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

#### GET /api/v1/patients/:patient_id/measurements (職員用)
測定値履歴を取得。

```json
// Query Parameters
?start_date=2026-01-01&end_date=2026-01-31

// Response (200 OK)
{
  "status": "success",
  "data": {
    "measurements": [
      {
        "measured_date": "2026-01-21",
        "weight_kg": 65.5,
        "knee_extension_strength_left": 25.3,
        "knee_extension_strength_right": 26.1
        // ... 他のフィールド
      }
    ]
  }
}
```

#### GET /api/v1/users/me/measurements (利用者用)
自分の測定値履歴を取得。

### レポート (Reports)

#### GET /api/v1/patients/:patient_id/report (職員用)
患者レポートを生成（PDF）。

```json
// Query Parameters
?start_date=2026-01-01&end_date=2026-01-31&format=pdf

// Response (200 OK)
// Content-Type: application/pdf
// PDFファイルがダウンロードされる
```

### 職員管理 (Staff Management)

#### GET /api/v1/staff (マネージャーのみ)
職員一覧を取得。

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

#### POST /api/v1/staff (マネージャーのみ)
職員を作成。

```json
// Request
{
  "staff_id": "sato",
  "name": "佐藤花子",
  "email": "sato@example.com",
  "password": "password123",
  "role": "staff",
  "department": "リハビリテーション科"
}

// Response (201 Created)
{
  "status": "success",
  "data": {
    "id": "uuid",
    "staff_id": "sato",
    "name": "佐藤花子",
    "role": "staff"
  }
}
```

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
