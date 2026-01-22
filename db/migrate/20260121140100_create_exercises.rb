# frozen_string_literal: true

class CreateExercises < ActiveRecord::Migration[8.0]
  def change
    create_table :exercises, id: :uuid do |t|
      t.string :name, null: false, limit: 100
      t.text :description
      t.string :category, null: false, limit: 50
      t.string :difficulty, null: false, limit: 20
      t.string :target_body_part, limit: 100
      t.integer :recommended_reps
      t.integer :recommended_sets
      t.string :video_url, limit: 255
      t.string :thumbnail_url, limit: 255
      t.integer :duration_seconds

      t.timestamps
    end

    add_index :exercises, :category
  end
end
