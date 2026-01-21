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

ActiveRecord::Schema[8.1].define(version: 2026_01_21_140042) do
  create_table "audit_logs", force: :cascade do |t|
    t.string "action", null: false
    t.text "additional_info"
    t.datetime "created_at", null: false
    t.string "ip_address"
    t.integer "staff_id"
    t.string "status", null: false
    t.datetime "updated_at", null: false
    t.text "user_agent"
    t.integer "user_id"
    t.string "user_type"
    t.index ["action"], name: "index_audit_logs_on_action"
    t.index ["created_at"], name: "index_audit_logs_on_created_at"
    t.index ["staff_id"], name: "index_audit_logs_on_staff_id"
    t.index ["user_id"], name: "index_audit_logs_on_user_id"
    t.index ["user_type", "user_id"], name: "index_audit_logs_on_user_type_and_user_id"
  end

  create_table "staff", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "deleted_at"
    t.string "email"
    t.integer "failed_login_count", default: 0, null: false
    t.datetime "locked_until"
    t.string "name", null: false
    t.string "name_kana"
    t.string "password_digest", null: false
    t.string "role", default: "staff", null: false
    t.string "staff_id", null: false
    t.datetime "updated_at", null: false
    t.index ["deleted_at"], name: "index_staff_on_deleted_at"
    t.index ["email"], name: "index_staff_on_email"
    t.index ["role"], name: "index_staff_on_role"
    t.index ["staff_id"], name: "index_staff_on_staff_id", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "birth_date_encrypted"
    t.string "birth_date_encrypted_iv"
    t.datetime "created_at", null: false
    t.datetime "deleted_at"
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
    t.index ["email_encrypted"], name: "index_users_on_email_encrypted", unique: true
    t.index ["failed_login_count"], name: "index_users_on_failed_login_count"
    t.index ["user_code"], name: "index_users_on_user_code", unique: true
  end
end
