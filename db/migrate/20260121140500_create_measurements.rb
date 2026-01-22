# frozen_string_literal: true

class CreateMeasurements < ActiveRecord::Migration[8.0]
  def change
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
    end

    add_index :measurements, [:user_id, :measured_date]
  end
end
