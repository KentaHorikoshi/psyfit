# frozen_string_literal: true

# Migrates Staff table PII fields to encrypted columns with blind index support
# Fields: name, name_kana, email
# - Adds encrypted columns ({field}_encrypted, {field}_encrypted_iv)
# - Adds blind index column for email (email_bidx)
class EncryptStaffPiiFields < ActiveRecord::Migration[8.1]
  def change
    # Add encrypted columns for name
    add_column :staff, :name_encrypted, :string
    add_column :staff, :name_encrypted_iv, :string

    # Add encrypted columns for name_kana
    add_column :staff, :name_kana_encrypted, :string
    add_column :staff, :name_kana_encrypted_iv, :string

    # Add encrypted columns for email
    add_column :staff, :email_encrypted, :string
    add_column :staff, :email_encrypted_iv, :string

    # Add blind index for email (enables search and uniqueness validation)
    add_column :staff, :email_bidx, :string

    # Add unique index on email blind index
    add_index :staff, :email_bidx, unique: true, name: 'index_staff_on_email_bidx'

    # Remove old plain text indexes on email
    remove_index :staff, :email, if_exists: true

    reversible do |dir|
      dir.up do
        say "NOTE: Run 'rails db:seed:staff_encrypt_migration' to migrate existing plain text data"
        say "After migration, remove old plain text columns with a separate migration"
      end
    end
  end
end
