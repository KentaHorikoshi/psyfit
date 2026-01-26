# frozen_string_literal: true

class CreateVideoAccessTokens < ActiveRecord::Migration[8.0]
  def change
    create_table :video_access_tokens, id: :uuid do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }, type: :uuid
      t.references :exercise, null: false, foreign_key: true, type: :uuid
      t.string :token, null: false, limit: 64
      t.datetime :expires_at, null: false
      t.datetime :used_at

      t.timestamps
    end

    add_index :video_access_tokens, :token, unique: true
    add_index :video_access_tokens, [:user_id, :exercise_id]
    add_index :video_access_tokens, :expires_at
    add_index :video_access_tokens, [:expires_at, :used_at], name: 'index_video_access_tokens_on_valid'
  end
end
