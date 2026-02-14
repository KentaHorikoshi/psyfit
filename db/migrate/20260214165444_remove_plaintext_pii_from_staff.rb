# frozen_string_literal: true

# Remove plaintext PII columns from staff table.
# These columns were kept during the initial encryption migration
# (20260122100001_encrypt_staff_pii_fields.rb) and are no longer needed
# since all data is now stored in encrypted columns (*_encrypted, *_encrypted_iv).
#
# Security: Eliminates plaintext PII exposure risk for staff records.
class RemovePlaintextPiiFromStaff < ActiveRecord::Migration[8.1]
  def up
    # Safety check: verify all staff records have encrypted name data
    # before removing plaintext columns.
    # Note: email is optional for staff (production seed creates staff without email),
    # so only name_encrypted is checked as a required field.
    missing = execute(<<~SQL).to_a
      SELECT id FROM staff
      WHERE name_encrypted IS NULL OR name_encrypted = ''
    SQL

    if missing.any?
      raise "Aborting: #{missing.count} staff record(s) missing encrypted name data. " \
            "IDs: #{missing.map { |r| r['id'] }.join(', ')}"
    end

    remove_column :staff, :name, :string
    remove_column :staff, :name_kana, :string
    remove_column :staff, :email, :string
  end

  def down
    add_column :staff, :name, :string
    add_column :staff, :name_kana, :string
    add_column :staff, :email, :string

    # Restore plaintext data from encrypted columns
    Staff.reset_column_information
    reversible_restore_count = 0
    Staff.find_each do |staff|
      # attr_encrypted virtual attributes decrypt from *_encrypted columns
      staff.update_columns(
        name: staff.name,
        name_kana: staff.name_kana,
        email: staff.email
      )
      reversible_restore_count += 1
    end
    say "Restored plaintext data for #{reversible_restore_count} staff records"
  end
end
