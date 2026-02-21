# frozen_string_literal: true

class AddDailyFrequencyToPatientExercises < ActiveRecord::Migration[8.1]
  def change
    add_column :patient_exercises, :daily_frequency, :integer, default: 1, null: false
  end
end
