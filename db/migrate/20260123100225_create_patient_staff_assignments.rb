class CreatePatientStaffAssignments < ActiveRecord::Migration[8.1]
  def change
    create_table :patient_staff_assignments, id: :uuid do |t|
      t.uuid :user_id, null: false
      t.uuid :staff_id, null: false
      t.datetime :assigned_at, null: false
      t.boolean :is_primary, default: false, null: false
      t.timestamps
    end

    add_index :patient_staff_assignments, :user_id
    add_index :patient_staff_assignments, :staff_id
    add_index :patient_staff_assignments, [:user_id, :staff_id], unique: true
    add_index :patient_staff_assignments, [:user_id, :is_primary]

    add_foreign_key :patient_staff_assignments, :users
    add_foreign_key :patient_staff_assignments, :staff
  end
end
