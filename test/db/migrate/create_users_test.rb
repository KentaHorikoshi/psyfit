require "test_helper"

class CreateUsersTest < ActiveSupport::TestCase
  def setup
    # This test verifies the users table schema
  end

  test "users table exists" do
    assert ActiveRecord::Base.connection.table_exists?(:users),
           "Expected users table to exist"
  end

  test "users table has id primary key" do
    assert ActiveRecord::Base.connection.column_exists?(:users, :id, :uuid),
           "Expected users table to have UUID id column"
  end

  test "users table has encrypted PII fields" do
    # Email encryption fields
    assert ActiveRecord::Base.connection.column_exists?(:users, :email_encrypted),
           "Expected email_encrypted column"
    assert ActiveRecord::Base.connection.column_exists?(:users, :email_encrypted_iv),
           "Expected email_encrypted_iv column"

    # Name encryption fields
    assert ActiveRecord::Base.connection.column_exists?(:users, :name_encrypted),
           "Expected name_encrypted column"
    assert ActiveRecord::Base.connection.column_exists?(:users, :name_encrypted_iv),
           "Expected name_encrypted_iv column"

    # Name kana encryption fields
    assert ActiveRecord::Base.connection.column_exists?(:users, :name_kana_encrypted),
           "Expected name_kana_encrypted column"
    assert ActiveRecord::Base.connection.column_exists?(:users, :name_kana_encrypted_iv),
           "Expected name_kana_encrypted_iv column"

    # Birth date encryption fields
    assert ActiveRecord::Base.connection.column_exists?(:users, :birth_date_encrypted),
           "Expected birth_date_encrypted column"
    assert ActiveRecord::Base.connection.column_exists?(:users, :birth_date_encrypted_iv),
           "Expected birth_date_encrypted_iv column"
  end

  test "users table has authentication fields" do
    assert ActiveRecord::Base.connection.column_exists?(:users, :password_digest),
           "Expected password_digest column for bcrypt"

    assert ActiveRecord::Base.connection.column_exists?(:users, :failed_login_count, :integer),
           "Expected failed_login_count column"

    assert ActiveRecord::Base.connection.column_exists?(:users, :locked_until, :datetime),
           "Expected locked_until column for account lockout"
  end

  test "users table has user_code for identification" do
    assert ActiveRecord::Base.connection.column_exists?(:users, :user_code),
           "Expected user_code column for user identification"
  end

  test "users table has soft delete field" do
    assert ActiveRecord::Base.connection.column_exists?(:users, :deleted_at, :datetime),
           "Expected deleted_at column for soft delete"
  end

  test "users table has timestamps" do
    assert ActiveRecord::Base.connection.column_exists?(:users, :created_at, :datetime),
           "Expected created_at timestamp"

    assert ActiveRecord::Base.connection.column_exists?(:users, :updated_at, :datetime),
           "Expected updated_at timestamp"
  end

  test "users table has unique index on email_encrypted" do
    indexes = ActiveRecord::Base.connection.indexes(:users)
    email_index = indexes.find { |idx| idx.columns.include?("email_encrypted") }

    assert_not_nil email_index, "Expected index on email_encrypted"
    assert email_index.unique, "Expected email_encrypted index to be unique"
  end

  test "users table has unique index on user_code" do
    indexes = ActiveRecord::Base.connection.indexes(:users)
    user_code_index = indexes.find { |idx| idx.columns.include?("user_code") }

    assert_not_nil user_code_index, "Expected index on user_code"
    assert user_code_index.unique, "Expected user_code index to be unique"
  end

  test "users table has index on deleted_at for soft delete queries" do
    indexes = ActiveRecord::Base.connection.indexes(:users)
    deleted_at_index = indexes.find { |idx| idx.columns.include?("deleted_at") }

    assert_not_nil deleted_at_index, "Expected index on deleted_at"
  end

  test "users table has index on failed_login_count for lockout queries" do
    indexes = ActiveRecord::Base.connection.indexes(:users)
    failed_login_index = indexes.find { |idx| idx.columns.include?("failed_login_count") }

    assert_not_nil failed_login_index, "Expected index on failed_login_count"
  end
end
