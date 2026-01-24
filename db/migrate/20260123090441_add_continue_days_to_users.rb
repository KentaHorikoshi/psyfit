class AddContinueDaysToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :continue_days, :integer, default: 0, null: false
    add_column :users, :last_exercise_at, :datetime
    add_index :users, :last_exercise_at
  end
end
