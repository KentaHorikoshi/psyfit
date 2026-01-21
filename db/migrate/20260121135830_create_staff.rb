class CreateStaff < ActiveRecord::Migration[8.1]
  def change
    create_table :staff do |t|
      # Staff identification
      t.string :staff_id, null: false

      # Staff information
      t.string :name, null: false
      t.string :name_kana
      t.string :email

      # Role-based authorization (staff or manager)
      t.string :role, null: false, default: 'staff'

      # Authentication fields
      t.string :password_digest, null: false
      t.integer :failed_login_count, default: 0, null: false
      t.datetime :locked_until

      # Soft delete
      t.datetime :deleted_at

      t.timestamps
    end

    # Indexes for performance and uniqueness
    add_index :staff, :staff_id, unique: true
    add_index :staff, :role
    add_index :staff, :deleted_at
    add_index :staff, :email
  end
end
