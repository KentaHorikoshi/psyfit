# frozen_string_literal: true

class CreateExerciseRecords < ActiveRecord::Migration[8.0]
  def change
    create_table :exercise_records, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.references :exercise, null: false, foreign_key: true, type: :uuid
      t.integer :completed_reps
      t.integer :completed_sets
      t.datetime :completed_at, null: false
      t.integer :duration_seconds
      t.text :notes

      t.datetime :created_at, null: false
    end

    add_index :exercise_records, [:user_id, :completed_at]
  end
end
