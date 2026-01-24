# frozen_string_literal: true

class CreateVideos < ActiveRecord::Migration[8.0]
  def change
    create_table :videos, id: :uuid do |t|
      t.references :exercise, null: false, foreign_key: true, type: :uuid
      t.string :title, null: false, limit: 100
      t.text :description
      t.string :video_url, null: false, limit: 255
      t.string :thumbnail_url, limit: 255
      t.integer :duration_seconds
      t.integer :display_order, default: 0
      t.boolean :is_active, null: false, default: true

      t.timestamps
    end

    add_index :videos, [ :exercise_id, :display_order ]
    add_index :videos, :is_active
  end
end
