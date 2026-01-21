class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      # User identification
      t.string :user_code, null: false

      # Encrypted PII fields (AES-256-GCM)
      # Email
      t.string :email_encrypted, null: false
      t.string :email_encrypted_iv, null: false

      # Name (full name)
      t.string :name_encrypted
      t.string :name_encrypted_iv

      # Name Kana (full name in katakana)
      t.string :name_kana_encrypted
      t.string :name_kana_encrypted_iv

      # Birth date
      t.string :birth_date_encrypted
      t.string :birth_date_encrypted_iv

      # Authentication fields
      t.string :password_digest, null: false
      t.integer :failed_login_count, default: 0, null: false
      t.datetime :locked_until

      # Soft delete
      t.datetime :deleted_at

      t.timestamps
    end

    # Indexes for performance and uniqueness
    add_index :users, :email_encrypted, unique: true
    add_index :users, :user_code, unique: true
    add_index :users, :deleted_at
    add_index :users, :failed_login_count
  end
end
