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

ActiveRecord::Schema[8.1].define(version: 2026_02_19_100000) do
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
    t.integer "assigned_count"
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
    t.string "body_part_major", limit: 50
    t.string "body_part_minor", limit: 50
    t.datetime "created_at", null: false
    t.text "description"
    t.string "difficulty", limit: 20, null: false
    t.integer "duration_seconds"
    t.string "exercise_type", limit: 50, null: false
    t.string "name", limit: 100, null: false
    t.integer "recommended_reps"
    t.integer "recommended_sets"
    t.string "thumbnail_url", limit: 255
    t.datetime "updated_at", null: false
    t.string "video_url", limit: 255
    t.index ["body_part_major"], name: "index_exercises_on_body_part_major"
    t.index ["exercise_type"], name: "index_exercises_on_exercise_type"
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
    t.decimal "percent_mv", precision: 5, scale: 2
    t.decimal "single_leg_stance_seconds", precision: 5, scale: 2
    t.decimal "tug_seconds", precision: 5, scale: 2
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.decimal "wbi_left", precision: 5, scale: 2
    t.decimal "wbi_right", precision: 5, scale: 2
    t.decimal "weight_kg", precision: 5, scale: 2
    t.index ["measured_by_staff_id"], name: "index_measurements_on_measured_by_staff_id"
    t.index ["user_id", "measured_date"], name: "index_measurements_on_user_id_and_measured_date"
    t.index ["user_id"], name: "index_measurements_on_user_id"
  end

  create_table "password_reset_tokens", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.uuid "staff_id"
    t.string "token", null: false
    t.datetime "updated_at", null: false
    t.datetime "used_at"
    t.uuid "user_id"
    t.index ["expires_at"], name: "index_password_reset_tokens_on_expires_at"
    t.index ["staff_id", "used_at"], name: "index_password_reset_tokens_on_staff_id_and_used_at"
    t.index ["staff_id"], name: "index_password_reset_tokens_on_staff_id"
    t.index ["token"], name: "index_password_reset_tokens_on_token", unique: true
    t.index ["user_id", "used_at"], name: "index_password_reset_tokens_on_user_id_and_used_at"
    t.index ["user_id"], name: "index_password_reset_tokens_on_user_id"
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

  create_table "patient_staff_assignments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "assigned_at", null: false
    t.datetime "created_at", null: false
    t.boolean "is_primary", default: false, null: false
    t.uuid "staff_id", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["staff_id"], name: "index_patient_staff_assignments_on_staff_id"
    t.index ["user_id", "is_primary"], name: "index_patient_staff_assignments_on_user_id_and_is_primary"
    t.index ["user_id", "staff_id"], name: "index_patient_staff_assignments_on_user_id_and_staff_id", unique: true
    t.index ["user_id"], name: "index_patient_staff_assignments_on_user_id"
  end

  create_table "staff", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "deleted_at"
    t.string "department"
    t.string "email_bidx"
    t.string "email_encrypted"
    t.string "email_encrypted_iv"
    t.integer "failed_login_count", default: 0, null: false
    t.datetime "locked_until"
    t.string "name_encrypted"
    t.string "name_encrypted_iv"
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
    t.string "condition", limit: 255
    t.integer "continue_days", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "deleted_at"
    t.string "email_bidx"
    t.string "email_encrypted", null: false
    t.string "email_encrypted_iv", null: false
    t.integer "failed_login_count", default: 0, null: false
    t.string "gender", limit: 10
    t.datetime "last_exercise_at"
    t.datetime "locked_until"
    t.string "name_encrypted"
    t.string "name_encrypted_iv"
    t.string "name_kana_encrypted"
    t.string "name_kana_encrypted_iv"
    t.date "next_visit_date"
    t.string "password_digest", null: false
    t.string "phone", limit: 20
    t.date "previous_visit_date"
    t.string "status", limit: 20, default: "維持期", null: false
    t.datetime "updated_at", null: false
    t.string "user_code", null: false
    t.index ["deleted_at"], name: "index_users_on_deleted_at"
    t.index ["email_bidx"], name: "index_users_on_email_bidx", unique: true
    t.index ["email_encrypted"], name: "index_users_on_email_encrypted"
    t.index ["failed_login_count"], name: "index_users_on_failed_login_count"
    t.index ["gender"], name: "index_users_on_gender"
    t.index ["last_exercise_at"], name: "index_users_on_last_exercise_at"
    t.index ["status"], name: "index_users_on_status"
    t.index ["user_code"], name: "index_users_on_user_code", unique: true
  end

  create_table "video_access_tokens", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.uuid "exercise_id", null: false
    t.datetime "expires_at", null: false
    t.string "token", limit: 64, null: false
    t.datetime "updated_at", null: false
    t.datetime "used_at"
    t.uuid "user_id", null: false
    t.index ["exercise_id"], name: "index_video_access_tokens_on_exercise_id"
    t.index ["expires_at", "used_at"], name: "index_video_access_tokens_on_valid"
    t.index ["expires_at"], name: "index_video_access_tokens_on_expires_at"
    t.index ["token"], name: "index_video_access_tokens_on_token", unique: true
    t.index ["user_id", "exercise_id"], name: "index_video_access_tokens_on_user_id_and_exercise_id"
    t.index ["user_id"], name: "index_video_access_tokens_on_user_id"
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
  add_foreign_key "password_reset_tokens", "staff", on_delete: :cascade
  add_foreign_key "password_reset_tokens", "users", on_delete: :cascade
  add_foreign_key "patient_exercises", "exercises"
  add_foreign_key "patient_exercises", "staff", column: "assigned_by_staff_id"
  add_foreign_key "patient_exercises", "users"
  add_foreign_key "patient_staff_assignments", "staff"
  add_foreign_key "patient_staff_assignments", "users"
  add_foreign_key "video_access_tokens", "exercises"
  add_foreign_key "video_access_tokens", "users", on_delete: :cascade
  add_foreign_key "videos", "exercises"
end
