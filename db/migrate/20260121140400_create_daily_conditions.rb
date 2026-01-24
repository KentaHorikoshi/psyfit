# frozen_string_literal: true

class CreateDailyConditions < ActiveRecord::Migration[8.0]
  def change
    create_table :daily_conditions, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.date :recorded_date, null: false
      t.integer :pain_level, null: false
      t.integer :body_condition, null: false
      t.text :notes

      t.timestamps
    end

    add_index :daily_conditions, [ :user_id, :recorded_date ], unique: true
  end
end
