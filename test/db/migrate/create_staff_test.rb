require "test_helper"

class CreateStaffTest < ActiveSupport::TestCase
  def setup
    # This test verifies the staff table schema
  end

  test "staff table exists" do
    assert ActiveRecord::Base.connection.table_exists?(:staff),
           "Expected staff table to exist"
  end

  test "staff table has id primary key" do
    assert ActiveRecord::Base.connection.column_exists?(:staff, :id, :integer),
           "Expected staff table to have id column"
  end

  test "staff table has staff_id for identification" do
    assert ActiveRecord::Base.connection.column_exists?(:staff, :staff_id),
           "Expected staff_id column for staff identification"
  end

  test "staff table has name fields" do
    assert ActiveRecord::Base.connection.column_exists?(:staff, :name),
           "Expected name column"

    assert ActiveRecord::Base.connection.column_exists?(:staff, :name_kana),
           "Expected name_kana column"
  end

  test "staff table has email field" do
    assert ActiveRecord::Base.connection.column_exists?(:staff, :email),
           "Expected email column for staff communication"
  end

  test "staff table has role field for authorization" do
    assert ActiveRecord::Base.connection.column_exists?(:staff, :role),
           "Expected role column for staff/manager distinction"
  end

  test "staff table has authentication fields" do
    assert ActiveRecord::Base.connection.column_exists?(:staff, :password_digest),
           "Expected password_digest column for bcrypt"

    assert ActiveRecord::Base.connection.column_exists?(:staff, :failed_login_count, :integer),
           "Expected failed_login_count column"

    assert ActiveRecord::Base.connection.column_exists?(:staff, :locked_until, :datetime),
           "Expected locked_until column for account lockout"
  end

  test "staff table has soft delete field" do
    assert ActiveRecord::Base.connection.column_exists?(:staff, :deleted_at, :datetime),
           "Expected deleted_at column for soft delete"
  end

  test "staff table has timestamps" do
    assert ActiveRecord::Base.connection.column_exists?(:staff, :created_at, :datetime),
           "Expected created_at timestamp"

    assert ActiveRecord::Base.connection.column_exists?(:staff, :updated_at, :datetime),
           "Expected updated_at timestamp"
  end

  test "staff table has unique index on staff_id" do
    indexes = ActiveRecord::Base.connection.indexes(:staff)
    staff_id_index = indexes.find { |idx| idx.columns.include?("staff_id") }

    assert_not_nil staff_id_index, "Expected index on staff_id"
    assert staff_id_index.unique, "Expected staff_id index to be unique"
  end

  test "staff table has index on role for authorization queries" do
    indexes = ActiveRecord::Base.connection.indexes(:staff)
    role_index = indexes.find { |idx| idx.columns.include?("role") }

    assert_not_nil role_index, "Expected index on role"
  end

  test "staff table has index on deleted_at for soft delete queries" do
    indexes = ActiveRecord::Base.connection.indexes(:staff)
    deleted_at_index = indexes.find { |idx| idx.columns.include?("deleted_at") }

    assert_not_nil deleted_at_index, "Expected index on deleted_at"
  end

  test "staff table has index on email" do
    indexes = ActiveRecord::Base.connection.indexes(:staff)
    email_index = indexes.find { |idx| idx.columns.include?("email") }

    assert_not_nil email_index, "Expected index on email"
  end
end
