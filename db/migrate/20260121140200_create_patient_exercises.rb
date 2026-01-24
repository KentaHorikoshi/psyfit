# frozen_string_literal: true

class CreatePatientExercises < ActiveRecord::Migration[8.0]
  def change
    create_table :patient_exercises, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.references :exercise, null: false, foreign_key: true, type: :uuid
      t.references :assigned_by_staff, null: false, foreign_key: { to_table: :staff }, type: :uuid
      t.integer :target_reps
      t.integer :target_sets
      t.boolean :is_active, null: false, default: true
      t.datetime :assigned_at, null: false

      t.timestamps
    end

    add_index :patient_exercises, [ :user_id, :is_active ]
  end
end
