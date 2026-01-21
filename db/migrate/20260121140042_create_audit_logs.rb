class CreateAuditLogs < ActiveRecord::Migration[8.1]
  def change
    create_table :audit_logs do |t|
      # Polymorphic association to track both users and staff
      t.string :user_type
      t.integer :user_id
      t.integer :staff_id

      # Action details
      t.string :action, null: false
      t.string :status, null: false

      # Request metadata
      t.string :ip_address
      t.text :user_agent

      # Additional context as JSON
      t.text :additional_info

      t.timestamps
    end

    # Indexes for efficient querying
    add_index :audit_logs, :user_id
    add_index :audit_logs, :staff_id
    add_index :audit_logs, :action
    add_index :audit_logs, :created_at
    add_index :audit_logs, [:user_type, :user_id]
  end
end
