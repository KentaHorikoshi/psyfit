# Database Schema (データ設計)

## ER図概要

```
users (患者・利用者)
  ├── exercise_records (運動記録)
  ├── daily_conditions (体調記録)
  ├── measurements (測定値)
  ├── patient_exercises (運動メニュー割当)
  ├── patient_staff_assignments (担当職員)
  └── video_access_tokens (動画アクセストークン)

staff (職員)
  └── audit_logs (操作ログ)

exercises (運動マスタ)
  ├── videos (動画)
  ├── patient_exercises (患者割当)
  └── video_access_tokens (動画アクセストークン)
```

## テーブル定義

### 1. users (患者・利用者)

| カラム名 | 型 | NULL | 暗号化 | 説明 |
|---------|-----|------|--------|------|
| id | UUID | NO | - | プライマリキー |
| user_code | VARCHAR(50) | NO | - | 患者コード（一意） |
| email | VARCHAR(255) | NO | YES | メールアドレス |
| password_digest | VARCHAR(255) | NO | - | パスワードハッシュ |
| name | VARCHAR(100) | NO | YES | 患者氏名 |
| name_kana | VARCHAR(100) | NO | YES | 患者氏名カナ |
| birth_date | DATE | NO | YES | 生年月日 |
| gender | VARCHAR(10) | NO | - | 性別 (male/female/other) |
| phone | VARCHAR(20) | YES | - | 電話番号 |
| condition | VARCHAR(255) | YES | - | 疾患・身体状態 |
| status | VARCHAR(20) | NO | - | 病期 (急性期/回復期/維持期) |
| continue_days | INTEGER | NO | - | 継続日数 |
| last_login_at | TIMESTAMP | YES | - | 最終ログイン |
| created_at | TIMESTAMP | NO | - | 作成日時 |
| updated_at | TIMESTAMP | NO | - | 更新日時 |
| deleted_at | TIMESTAMP | YES | - | 削除日時（論理削除） |

**インデックス:**
- PRIMARY KEY (id)
- UNIQUE INDEX (user_code)
- UNIQUE INDEX (email)
- INDEX (deleted_at)

### 2. staff (職員)

| カラム名 | 型 | NULL | 説明 |
|---------|-----|------|------|
| id | UUID | NO | プライマリキー |
| staff_id | VARCHAR(50) | NO | 職員ID (ログイン用) |
| password_digest | VARCHAR(255) | NO | パスワードハッシュ |
| name | VARCHAR(100) | NO | 職員氏名 |
| email | VARCHAR(255) | NO | メールアドレス |
| role | VARCHAR(20) | NO | 権限 (manager/staff) |
| department | VARCHAR(100) | YES | 所属部署 |
| failed_login_attempts | INTEGER | NO | ログイン失敗回数 |
| locked_until | TIMESTAMP | YES | アカウントロック解除時刻 |
| created_at | TIMESTAMP | NO | 作成日時 |
| updated_at | TIMESTAMP | NO | 更新日時 |
| deleted_at | TIMESTAMP | YES | 削除日時 |

**インデックス:**
- PRIMARY KEY (id)
- UNIQUE INDEX (staff_id)
- INDEX (role)

### 3. exercises (運動マスタ)

| カラム名 | 型 | NULL | 説明 |
|---------|-----|------|------|
| id | UUID | NO | プライマリキー |
| name | VARCHAR(100) | NO | 運動名 |
| description | TEXT | YES | 説明 |
| exercise_type | VARCHAR(50) | NO | 運動種別 (ストレッチ/トレーニング/ほぐす/バランス) |
| difficulty | VARCHAR(20) | NO | 難易度 (easy/medium/hard) |
| body_part_major | VARCHAR(50) | YES | 大分類 (体幹・脊柱/上肢/下肢) |
| body_part_minor | VARCHAR(50) | YES | 中分類 (頸部/胸部/腹部/腰椎/肩・上腕/肘・前腕/手関節・手指/股関節・大腿/膝・下腿/足関節・足部/その他) |
| recommended_reps | INTEGER | YES | 推奨回数 |
| recommended_sets | INTEGER | YES | 推奨セット数 |
| video_url | VARCHAR(255) | YES | 動画URL |
| thumbnail_url | VARCHAR(255) | YES | サムネイルURL |
| duration_seconds | INTEGER | YES | 動画時間（秒） |
| created_at | TIMESTAMP | NO | 作成日時 |
| updated_at | TIMESTAMP | NO | 更新日時 |

**インデックス:**
- PRIMARY KEY (id)
- INDEX (exercise_type)
- INDEX (body_part_major)

### 4. patient_exercises (患者運動メニュー割当)

| カラム名 | 型 | NULL | 説明 |
|---------|-----|------|------|
| id | UUID | NO | プライマリキー |
| user_id | UUID | NO | 患者ID (FK: users.id) |
| exercise_id | UUID | NO | 運動ID (FK: exercises.id) |
| assigned_by_staff_id | UUID | NO | 割当職員ID (FK: staff.id) |
| target_reps | INTEGER | YES | 目標回数 |
| target_sets | INTEGER | YES | 目標セット数 |
| is_active | BOOLEAN | NO | 有効フラグ |
| assigned_at | TIMESTAMP | NO | 割当日時 |
| created_at | TIMESTAMP | NO | 作成日時 |
| updated_at | TIMESTAMP | NO | 更新日時 |

**インデックス:**
- PRIMARY KEY (id)
- INDEX (user_id, is_active)
- INDEX (exercise_id)

### 5. exercise_records (運動記録)

| カラム名 | 型 | NULL | 説明 |
|---------|-----|------|------|
| id | UUID | NO | プライマリキー |
| user_id | UUID | NO | 患者ID (FK: users.id) |
| exercise_id | UUID | NO | 運動ID (FK: exercises.id) |
| completed_reps | INTEGER | YES | 実施回数 |
| completed_sets | INTEGER | YES | 実施セット数 |
| completed_at | TIMESTAMP | NO | 実施日時 |
| duration_seconds | INTEGER | YES | 実施時間（秒） |
| notes | TEXT | YES | メモ |
| created_at | TIMESTAMP | NO | 作成日時 |

**インデックス:**
- PRIMARY KEY (id)
- INDEX (user_id, completed_at DESC)
- INDEX (exercise_id)

### 6. daily_conditions (体調記録)

| カラム名 | 型 | NULL | 説明 |
|---------|-----|------|------|
| id | UUID | NO | プライマリキー |
| user_id | UUID | NO | 患者ID (FK: users.id) |
| recorded_date | DATE | NO | 記録日 |
| pain_level | INTEGER | NO | 痛みレベル (0-10) |
| body_condition | INTEGER | NO | 身体の調子 (0-10) |
| notes | TEXT | YES | メモ |
| created_at | TIMESTAMP | NO | 作成日時 |
| updated_at | TIMESTAMP | NO | 更新日時 |

**インデックス:**
- PRIMARY KEY (id)
- UNIQUE INDEX (user_id, recorded_date)

### 7. measurements (測定値)

| カラム名 | 型 | NULL | 説明 |
|---------|-----|------|------|
| id | UUID | NO | プライマリキー |
| user_id | UUID | NO | 患者ID (FK: users.id) |
| measured_by_staff_id | UUID | NO | 測定職員ID (FK: staff.id) |
| measured_date | DATE | NO | 測定日 |
| weight_kg | DECIMAL(5,2) | YES | 体重 (kg), 0 < value < 500 |
| knee_extension_strength_left | DECIMAL(5,2) | YES | 左膝伸展筋力 (kgf), 0 ≤ value < 1000 |
| knee_extension_strength_right | DECIMAL(5,2) | YES | 右膝伸展筋力 (kgf), 0 ≤ value < 1000 |
| tug_seconds | DECIMAL(5,2) | YES | TUG (秒), 0 < value < 1000 |
| single_leg_stance_seconds | DECIMAL(5,2) | YES | 片脚立位 (秒), 0 ≤ value < 1000 |
| nrs_pain_score | INTEGER | YES | NRS痛みスコア (0-10) |
| mmt_score | INTEGER | YES | MMT筋力スコア (0-5) |
| notes | TEXT | YES | メモ |
| created_at | TIMESTAMP | NO | 作成日時 |
| updated_at | TIMESTAMP | NO | 更新日時 |

**インデックス:**
- PRIMARY KEY (id)
- INDEX (user_id, measured_date DESC)

### 8. patient_staff_assignments (患者担当職員)

| カラム名 | 型 | NULL | 説明 |
|---------|-----|------|------|
| id | UUID | NO | プライマリキー |
| user_id | UUID | NO | 患者ID (FK: users.id) |
| staff_id | UUID | NO | 職員ID (FK: staff.id) |
| assigned_at | TIMESTAMP | NO | 割当日時 |
| is_primary | BOOLEAN | NO | 主担当フラグ |
| created_at | TIMESTAMP | NO | 作成日時 |
| updated_at | TIMESTAMP | NO | 更新日時 |

**インデックス:**
- PRIMARY KEY (id)
- INDEX (user_id)
- INDEX (staff_id)

### 9. video_access_tokens (動画アクセストークン)

| カラム名 | 型 | NULL | 説明 |
|---------|-----|------|------|
| id | UUID | NO | プライマリキー |
| user_id | UUID | NO | 利用者ID (FK: users.id) |
| exercise_id | UUID | NO | 運動ID (FK: exercises.id) |
| token | VARCHAR(64) | NO | アクセストークン（64文字hex） |
| expires_at | TIMESTAMP | NO | 有効期限 |
| used_at | TIMESTAMP | YES | 使用日時（使い捨て対応用） |
| created_at | TIMESTAMP | NO | 作成日時 |
| updated_at | TIMESTAMP | NO | 更新日時 |

**インデックス:**
- PRIMARY KEY (id)
- UNIQUE INDEX (token)
- INDEX (user_id, exercise_id)
- INDEX (expires_at)
- INDEX (expires_at, used_at) - 有効トークン検索用

**外部キー:**
- user_id → users.id (ON DELETE CASCADE)
- exercise_id → exercises.id

**使用目的:**
- 動画ストリーミングの一時的なアクセス制御
- 1時間有効の使い捨てトークンを発行
- ユーザーと運動の紐付けで不正アクセス防止

### 10. audit_logs (監査ログ)

| カラム名 | 型 | NULL | 説明 |
|---------|-----|------|------|
| id | UUID | NO | プライマリキー |
| user_type | VARCHAR(20) | NO | ユーザー種別 (user/staff) |
| user_id | UUID | YES | ユーザーID |
| staff_id | UUID | YES | 職員ID |
| action | VARCHAR(100) | NO | アクション |
| resource_type | VARCHAR(50) | YES | リソース種別 |
| resource_id | UUID | YES | リソースID |
| ip_address | VARCHAR(45) | YES | IPアドレス |
| user_agent | TEXT | YES | User Agent |
| status | VARCHAR(20) | NO | 結果 (success/failure) |
| details | JSONB | YES | 詳細情報 |
| created_at | TIMESTAMP | NO | 作成日時 |

**インデックス:**
- PRIMARY KEY (id)
- INDEX (user_id, created_at DESC)
- INDEX (staff_id, created_at DESC)
- INDEX (action, created_at DESC)

## マイグレーション戦略

### 初期セットアップ
```ruby
# db/migrate/20260121000001_create_initial_schema.rb
class CreateInitialSchema < ActiveRecord::Migration[8.0]
  def change
    enable_extension 'pgcrypto' # UUIDサポート

    # テーブル作成
    # (上記定義に基づいて作成)
  end
end
```

### データ暗号化
```ruby
# app/models/concerns/encryptable.rb
module Encryptable
  extend ActiveSupport::Concern

  included do
    attr_encrypted :name, key: ENV['ENCRYPTION_KEY']
    attr_encrypted :name_kana, key: ENV['ENCRYPTION_KEY']
    attr_encrypted :email, key: ENV['ENCRYPTION_KEY']
    attr_encrypted :birth_date, key: ENV['ENCRYPTION_KEY']
  end
end

# app/models/user.rb
class User < ApplicationRecord
  include Encryptable
end
```
