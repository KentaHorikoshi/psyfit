class AddAssignedCountToExerciseRecords < ActiveRecord::Migration[8.1]
  def up
    add_column :exercise_records, :assigned_count, :integer

    # Backfill: 既存レコードに記録時点の割当数を設定
    # assigned_at <= completed_at の patient_exercises 数をカウント
    execute <<~SQL
      UPDATE exercise_records er
      SET assigned_count = (
        SELECT COUNT(*)
        FROM patient_exercises pe
        WHERE pe.user_id = er.user_id
          AND pe.assigned_at <= er.completed_at
      )
    SQL
  end

  def down
    remove_column :exercise_records, :assigned_count
  end
end
