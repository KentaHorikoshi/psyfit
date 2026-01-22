# frozen_string_literal: true

# Adds blind index column for encrypted email field in users table
# This enables efficient search and uniqueness validation on encrypted email data
# without exposing the actual email values
class AddEmailBlindIndexToUsers < ActiveRecord::Migration[8.1]
  def change
    # Add blind index column for email
    add_column :users, :email_bidx, :string

    # Add unique index on blind index for uniqueness validation
    add_index :users, :email_bidx, unique: true, name: 'index_users_on_email_bidx'

    # Remove the old unique index on email_encrypted (it's not reliable for uniqueness)
    remove_index :users, :email_encrypted, if_exists: true

    # Add non-unique index on email_encrypted for any direct lookups (optional)
    add_index :users, :email_encrypted, name: 'index_users_on_email_encrypted'

    # Backfill existing records' blind indexes
    reversible do |dir|
      dir.up do
        # This will be handled by a rake task or the model callback
        # since we need the BLIND_INDEX_KEY which isn't available in migrations
        say "NOTE: Run 'rails db:seed:blind_index_backfill' to populate email_bidx for existing users"
      end
    end
  end
end
