# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_01_22_100001) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pgcrypto"

  create_table "audit_logs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "action", null: false
    t.text "additional_info"
    t.datetime "created_at", null: false
    t.string "ip_address"
    t.uuid "staff_id"
    t.string "status", null: false
    t.datetime "updated_at", null: false
    t.text "user_agent"
    t.uuid "user_id"
    t.string "user_type"
    t.index ["action"], name: "index_audit_logs_on_action"
    t.index ["created_at"], name: "index_audit_logs_on_created_at"
    t.index ["staff_id"], name: "index_audit_logs_on_staff_id"
    t.index ["user_id"], name: "index_audit_logs_on_user_id"
    t.index ["user_type", "user_id"], name: "index_audit_logs_on_user_type_and_user_id"
  end

  create_table "daily_conditions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.integer "body_condition", null: false
    t.datetime "created_at", null: false
    t.text "notes"
    t.integer "pain_level", null: false
    t.date "recorded_date", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["user_id", "recorded_date"], name: "index_daily_conditions_on_user_id_and_recorded_date", unique: true
    t.index ["user_id"], name: "index_daily_conditions_on_user_id"
  end

  create_table "exercise_records", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "completed_at", null: false
    t.integer "completed_reps"
    t.integer "completed_sets"
    t.datetime "created_at", null: false
    t.integer "duration_seconds"
    t.uuid "exercise_id", null: false
    t.text "notes"
    t.uuid "user_id", null: false
    t.index ["exercise_id"], name: "index_exercise_records_on_exercise_id"
    t.index ["user_id", "completed_at"], name: "index_exercise_records_on_user_id_and_completed_at"
    t.index ["user_id"], name: "index_exercise_records_on_user_id"
  end

  create_table "exercises", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "category", limit: 50, null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.string "difficulty", limit: 20, null: false
    t.integer "duration_seconds"
    t.string "name", limit: 100, null: false
    t.integer "recommended_reps"
    t.integer "recommended_sets"
    t.string "target_body_part", limit: 100
    t.string "thumbnail_url", limit: 255
    t.datetime "updated_at", null: false
    t.string "video_url", limit: 255
    t.index ["category"], name: "index_exercises_on_category"
  end

  create_table "measurements", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.decimal "knee_extension_strength_left", precision: 5, scale: 2
    t.decimal "knee_extension_strength_right", precision: 5, scale: 2
    t.uuid "measured_by_staff_id", null: false
    t.date "measured_date", null: false
    t.integer "mmt_score"
    t.text "notes"
    t.integer "nrs_pain_score"
    t.decimal "single_leg_stance_seconds", precision: 5, scale: 2
    t.decimal "tug_seconds", precision: 5, scale: 2
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.decimal "weight_kg", precision: 5, scale: 2
    t.index ["measured_by_staff_id"], name: "index_measurements_on_measured_by_staff_id"
    t.index ["user_id", "measured_date"], name: "index_measurements_on_user_id_and_measured_date"
    t.index ["user_id"], name: "index_measurements_on_user_id"
  end

  create_table "patient_exercises", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "assigned_at", null: false
    t.uuid "assigned_by_staff_id", null: false
    t.datetime "created_at", null: false
    t.uuid "exercise_id", null: false
    t.boolean "is_active", default: true, null: false
    t.integer "target_reps"
    t.integer "target_sets"
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["assigned_by_staff_id"], name: "index_patient_exercises_on_assigned_by_staff_id"
    t.index ["exercise_id"], name: "index_patient_exercises_on_exercise_id"
    t.index ["user_id", "is_active"], name: "index_patient_exercises_on_user_id_and_is_active"
    t.index ["user_id"], name: "index_patient_exercises_on_user_id"
  end

  create_table "staff", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "deleted_at"
    t.string "email"
    t.string "email_bidx"
    t.string "email_encrypted"
    t.string "email_encrypted_iv"
    t.integer "failed_login_count", default: 0, null: false
    t.datetime "locked_until"
    t.string "name", null: false
    t.string "name_encrypted"
    t.string "name_encrypted_iv"
    t.string "name_kana"
    t.string "name_kana_encrypted"
    t.string "name_kana_encrypted_iv"
    t.string "password_digest", null: false
    t.string "role", default: "staff", null: false
    t.string "staff_id", null: false
    t.datetime "updated_at", null: false
    t.index ["deleted_at"], name: "index_staff_on_deleted_at"
    t.index ["email_bidx"], name: "index_staff_on_email_bidx", unique: true
    t.index ["role"], name: "index_staff_on_role"
    t.index ["staff_id"], name: "index_staff_on_staff_id", unique: true
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "birth_date_encrypted"
    t.string "birth_date_encrypted_iv"
    t.datetime "created_at", null: false
    t.datetime "deleted_at"
    t.string "email_bidx"
    t.string "email_encrypted", null: false
    t.string "email_encrypted_iv", null: false
    t.integer "failed_login_count", default: 0, null: false
    t.datetime "locked_until"
    t.string "name_encrypted"
    t.string "name_encrypted_iv"
    t.string "name_kana_encrypted"
    t.string "name_kana_encrypted_iv"
    t.string "password_digest", null: false
    t.datetime "updated_at", null: false
    t.string "user_code", null: false
    t.index ["deleted_at"], name: "index_users_on_deleted_at"
    t.index ["email_bidx"], name: "index_users_on_email_bidx", unique: true
    t.index ["email_encrypted"], name: "index_users_on_email_encrypted"
    t.index ["failed_login_count"], name: "index_users_on_failed_login_count"
    t.index ["user_code"], name: "index_users_on_user_code", unique: true
  end

  create_table "videos", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.integer "display_order", default: 0
    t.integer "duration_seconds"
    t.uuid "exercise_id", null: false
    t.boolean "is_active", default: true, null: false
    t.string "thumbnail_url", limit: 255
    t.string "title", limit: 100, null: false
    t.datetime "updated_at", null: false
    t.string "video_url", limit: 255, null: false
    t.index ["exercise_id", "display_order"], name: "index_videos_on_exercise_id_and_display_order"
    t.index ["exercise_id"], name: "index_videos_on_exercise_id"
    t.index ["is_active"], name: "index_videos_on_is_active"
  end

  add_foreign_key "daily_conditions", "users"
  add_foreign_key "exercise_records", "exercises"
  add_foreign_key "exercise_records", "users"
  add_foreign_key "measurements", "staff", column: "measured_by_staff_id"
  add_foreign_key "measurements", "users"
  add_foreign_key "patient_exercises", "exercises"
  add_foreign_key "patient_exercises", "staff", column: "assigned_by_staff_id"
  add_foreign_key "patient_exercises", "users"
  add_foreign_key "videos", "exercises"
end
