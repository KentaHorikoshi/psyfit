# frozen_string_literal: true

class CreatePasswordResetTokens < ActiveRecord::Migration[8.1]
  def change
    create_table :password_reset_tokens, id: :uuid do |t|
      # Token belongs to either a user or a staff (one must be present)
      t.uuid :user_id
      t.uuid :staff_id

      # Secure token (URL-safe base64, 32 bytes)
      t.string :token, null: false

      # Token lifecycle
      t.datetime :expires_at, null: false
      t.datetime :used_at

      t.timestamps
    end

    # Indexes for performance
    add_index :password_reset_tokens, :token, unique: true
    add_index :password_reset_tokens, :user_id
    add_index :password_reset_tokens, :staff_id
    add_index :password_reset_tokens, :expires_at
    add_index :password_reset_tokens, [ :user_id, :used_at ]
    add_index :password_reset_tokens, [ :staff_id, :used_at ]

    # Foreign keys
    add_foreign_key :password_reset_tokens, :users, column: :user_id, on_delete: :cascade
    add_foreign_key :password_reset_tokens, :staff, column: :staff_id, on_delete: :cascade
  end
end
