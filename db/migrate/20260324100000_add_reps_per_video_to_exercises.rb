class AddRepsPerVideoToExercises < ActiveRecord::Migration[8.0]
  def change
    add_column :exercises, :reps_per_video, :integer, default: 1, null: false
  end
end
