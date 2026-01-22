---
name: database-design
description: PostgreSQLデータベース設計・マイグレーション作成。UUID主キー、PII暗号化カラム、インデックス設計、シードデータ作成を含む。
---

# Database Design Skill

データベース設計・マイグレーション作成の手順。

## 参照ドキュメント

- [データベーススキーマ](../../docs/03-database-schema.md)

## マイグレーション作成手順

### 1. テーブル作成

```bash
# マイグレーションファイル生成
bin/rails generate migration CreateUsers

# または一括で
bin/rails generate migration CreateInitialSchema
```

### 2. マイグレーション記述

```ruby
# db/migrate/20260121000001_create_initial_schema.rb
class CreateInitialSchema < ActiveRecord::Migration[8.0]
  def change
    # UUID拡張有効化
    enable_extension 'pgcrypto'

    # users (患者・利用者)
    create_table :users, id: :uuid do |t|
      t.string :email, null: false
      t.string :password_digest, null: false
      t.text :name_ciphertext           # 暗号化
      t.text :name_kana_ciphertext      # 暗号化
      t.text :email_ciphertext          # 暗号化（検索用）
      t.text :birth_date_ciphertext     # 暗号化
      t.string :gender, null: false
      t.string :phone
      t.string :condition
      t.string :status, null: false, default: '回復期'
      t.integer :continue_days, null: false, default: 0
      t.datetime :last_login_at
      t.timestamps
      t.datetime :deleted_at

      t.index :email, unique: true
      t.index :deleted_at
    end

    # staff (職員)
    create_table :staff, id: :uuid do |t|
      t.string :staff_id, null: false
      t.string :password_digest, null: false
      t.string :name, null: false
      t.string :email, null: false
      t.string :role, null: false, default: 'staff'
      t.string :department
      t.integer :failed_login_attempts, null: false, default: 0
      t.datetime :locked_until
      t.timestamps
      t.datetime :deleted_at

      t.index :staff_id, unique: true
      t.index :role
    end

    # exercises (運動マスタ)
    create_table :exercises, id: :uuid do |t|
      t.string :name, null: false
      t.text :description
      t.string :category, null: false
      t.string :difficulty, null: false
      t.string :target_body_part
      t.integer :recommended_reps
      t.integer :recommended_sets
      t.string :video_url
      t.string :thumbnail_url
      t.integer :duration_seconds
      t.timestamps

      t.index :category
    end

    # patient_exercises (患者運動メニュー割当)
    create_table :patient_exercises, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.references :exercise, null: false, foreign_key: true, type: :uuid
      t.references :assigned_by_staff, null: false, foreign_key: { to_table: :staff }, type: :uuid
      t.integer :target_reps
      t.integer :target_sets
      t.boolean :is_active, null: false, default: true
      t.datetime :assigned_at, null: false
      t.timestamps

      t.index [:user_id, :is_active]
    end

    # exercise_records (運動記録)
    create_table :exercise_records, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.references :exercise, null: false, foreign_key: true, type: :uuid
      t.integer :completed_reps
      t.integer :completed_sets
      t.datetime :completed_at, null: false
      t.integer :duration_seconds
      t.text :notes
      t.datetime :created_at, null: false

      t.index [:user_id, :completed_at]
    end

    # daily_conditions (体調記録)
    create_table :daily_conditions, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.date :recorded_date, null: false
      t.integer :pain_level, null: false
      t.integer :body_condition, null: false
      t.text :notes
      t.timestamps

      t.index [:user_id, :recorded_date], unique: true
    end

    # measurements (測定値)
    create_table :measurements, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.references :measured_by_staff, null: false, foreign_key: { to_table: :staff }, type: :uuid
      t.date :measured_date, null: false
      t.decimal :weight_kg, precision: 5, scale: 2
      t.decimal :knee_extension_strength_left, precision: 5, scale: 2
      t.decimal :knee_extension_strength_right, precision: 5, scale: 2
      t.decimal :tug_seconds, precision: 5, scale: 2
      t.decimal :single_leg_stance_seconds, precision: 5, scale: 2
      t.integer :nrs_pain_score
      t.integer :mmt_score
      t.text :notes
      t.timestamps

      t.index [:user_id, :measured_date]
    end

    # patient_staff_assignments (患者担当職員)
    create_table :patient_staff_assignments, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.references :staff, null: false, foreign_key: true, type: :uuid
      t.datetime :assigned_at, null: false
      t.boolean :is_primary, null: false, default: false
      t.timestamps

      t.index :user_id
      t.index :staff_id
    end

    # audit_logs (監査ログ)
    create_table :audit_logs, id: :uuid do |t|
      t.string :user_type, null: false
      t.uuid :user_id
      t.uuid :staff_id
      t.string :action, null: false
      t.string :resource_type
      t.uuid :resource_id
      t.string :ip_address
      t.text :user_agent
      t.string :status, null: false
      t.jsonb :details
      t.datetime :created_at, null: false

      t.index [:user_id, :created_at]
      t.index [:staff_id, :created_at]
      t.index [:action, :created_at]
    end
  end
end
```

### 3. マイグレーション実行

```bash
bin/rails db:migrate

# ステータス確認
bin/rails db:migrate:status
```

## インデックス設計

### 必須インデックス

| テーブル | カラム | 種類 | 理由 |
|---------|--------|------|------|
| users | email | UNIQUE | ログイン検索 |
| users | deleted_at | BTREE | 論理削除フィルタ |
| staff | staff_id | UNIQUE | ログイン検索 |
| exercise_records | (user_id, completed_at) | BTREE | 履歴検索 |
| daily_conditions | (user_id, recorded_date) | UNIQUE | 重複防止 |
| audit_logs | (user_id, created_at) | BTREE | ログ検索 |

### インデックス追加

```ruby
# 追加インデックスのマイグレーション
class AddIndexes < ActiveRecord::Migration[8.0]
  def change
    add_index :measurements, [:user_id, :measured_date, :created_at],
              order: { created_at: :desc },
              name: 'index_measurements_on_user_date_created'
  end
end
```

## 暗号化カラム

### Active Record Encryption設定

```ruby
# config/application.rb
config.active_record.encryption.primary_key = ENV['ACTIVE_RECORD_ENCRYPTION_PRIMARY_KEY']
config.active_record.encryption.deterministic_key = ENV['ACTIVE_RECORD_ENCRYPTION_DETERMINISTIC_KEY']
config.active_record.encryption.key_derivation_salt = ENV['ACTIVE_RECORD_ENCRYPTION_KEY_DERIVATION_SALT']
```

### モデルでの暗号化定義

```ruby
# app/models/user.rb
class User < ApplicationRecord
  # 暗号化フィールド
  encrypts :name
  encrypts :name_kana
  encrypts :email, deterministic: true  # 検索可能
  encrypts :birth_date

  # バリデーション
  validates :email, presence: true, uniqueness: { case_sensitive: false }
  validates :name, presence: true
  validates :gender, inclusion: { in: %w[male female other] }
  validates :status, inclusion: { in: %w[急性期 回復期 維持期] }
end
```

## シードデータ

```ruby
# db/seeds.rb
if Rails.env.development?
  # 職員作成
  manager = Staff.create!(
    staff_id: 'admin',
    password: 'Password123',
    name: '管理者',
    email: 'admin@example.com',
    role: 'manager',
    department: 'リハビリテーション科'
  )

  staff = Staff.create!(
    staff_id: 'yamada',
    password: 'Password123',
    name: '山田太郎',
    email: 'yamada@example.com',
    role: 'staff',
    department: 'リハビリテーション科'
  )

  # 運動マスタ作成
  exercises = [
    { name: 'スクワット', category: '筋力', difficulty: 'medium', recommended_reps: 10, recommended_sets: 3 },
    { name: '片脚立ち', category: 'バランス', difficulty: 'easy', recommended_reps: 1, recommended_sets: 2 },
    { name: 'ストレッチ', category: '柔軟性', difficulty: 'easy', recommended_reps: 1, recommended_sets: 1 }
  ]

  exercises.each { |e| Exercise.create!(e) }

  # テスト患者作成
  user = User.create!(
    email: 'patient@example.com',
    password: 'Password123',
    name: '田中太郎',
    name_kana: 'タナカタロウ',
    birth_date: Date.new(1960, 5, 15),
    gender: 'male',
    condition: '変形性膝関節症',
    status: '回復期',
    continue_days: 14
  )

  # 担当割当
  PatientStaffAssignment.create!(
    user: user,
    staff: staff,
    assigned_at: Time.current,
    is_primary: true
  )

  puts "Seed data created successfully!"
end
```

## バックアップ・リストア

```bash
# バックアップ
pg_dump psyfit_production > backup_$(date +%Y%m%d).sql

# リストア
psql psyfit_production < backup_20260121.sql
```
