# frozen_string_literal: true

class RenameExerciseCategoryColumns < ActiveRecord::Migration[8.1]
  def up
    # Rename category → exercise_type
    rename_column :exercises, :category, :exercise_type

    # Remove old target_body_part, add body_part_major + body_part_minor
    remove_column :exercises, :target_body_part

    add_column :exercises, :body_part_major, :string, limit: 50
    add_column :exercises, :body_part_minor, :string, limit: 50

    # Add new indexes
    add_index :exercises, :body_part_major

    # Migrate existing data: map old categories to new exercise_types
    execute <<-SQL
      UPDATE exercises SET exercise_type = CASE exercise_type
        WHEN '筋力' THEN 'トレーニング'
        WHEN '柔軟性' THEN 'ストレッチ'
        WHEN 'バランス' THEN 'バランス'
        ELSE exercise_type
      END
    SQL
  end

  def down
    # Reverse data migration
    execute <<-SQL
      UPDATE exercises SET exercise_type = CASE exercise_type
        WHEN 'トレーニング' THEN '筋力'
        WHEN 'ストレッチ' THEN '柔軟性'
        WHEN 'バランス' THEN 'バランス'
        ELSE exercise_type
      END
    SQL

    remove_index :exercises, :body_part_major

    remove_column :exercises, :body_part_minor
    remove_column :exercises, :body_part_major

    add_column :exercises, :target_body_part, :string, limit: 100

    rename_column :exercises, :exercise_type, :category
  end
end
