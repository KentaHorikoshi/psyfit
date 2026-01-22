require "test_helper"

class CreateAuditLogsTest < ActiveSupport::TestCase
  def setup
    # This test verifies the audit_logs table schema
  end

  test "audit_logs table exists" do
    assert ActiveRecord::Base.connection.table_exists?(:audit_logs),
           "Expected audit_logs table to exist"
  end

  test "audit_logs table has id primary key" do
    assert ActiveRecord::Base.connection.column_exists?(:audit_logs, :id, :uuid),
           "Expected audit_logs table to have UUID id column"
  end

  test "audit_logs table has user_id for tracking user actions" do
    assert ActiveRecord::Base.connection.column_exists?(:audit_logs, :user_id, :uuid),
           "Expected user_id column to track user actions"
  end

  test "audit_logs table has staff_id for tracking staff actions" do
    assert ActiveRecord::Base.connection.column_exists?(:audit_logs, :staff_id, :uuid),
           "Expected staff_id column to track staff actions"
  end

  test "audit_logs table has user_type for polymorphic tracking" do
    assert ActiveRecord::Base.connection.column_exists?(:audit_logs, :user_type),
           "Expected user_type column for polymorphic association"
  end

  test "audit_logs table has action field" do
    assert ActiveRecord::Base.connection.column_exists?(:audit_logs, :action),
           "Expected action column (e.g., 'login', 'logout', 'login_failed')"
  end

  test "audit_logs table has status field" do
    assert ActiveRecord::Base.connection.column_exists?(:audit_logs, :status),
           "Expected status column (e.g., 'success', 'failure')"
  end

  test "audit_logs table has ip_address field" do
    assert ActiveRecord::Base.connection.column_exists?(:audit_logs, :ip_address),
           "Expected ip_address column to track request origin"
  end

  test "audit_logs table has user_agent field" do
    assert ActiveRecord::Base.connection.column_exists?(:audit_logs, :user_agent),
           "Expected user_agent column to track browser/device"
  end

  test "audit_logs table has additional_info field for extra data" do
    assert ActiveRecord::Base.connection.column_exists?(:audit_logs, :additional_info),
           "Expected additional_info column for storing extra metadata"
  end

  test "audit_logs table has timestamps" do
    assert ActiveRecord::Base.connection.column_exists?(:audit_logs, :created_at, :datetime),
           "Expected created_at timestamp"

    assert ActiveRecord::Base.connection.column_exists?(:audit_logs, :updated_at, :datetime),
           "Expected updated_at timestamp"
  end

  test "audit_logs table has index on user_id" do
    indexes = ActiveRecord::Base.connection.indexes(:audit_logs)
    user_id_index = indexes.find { |idx| idx.columns.include?("user_id") }

    assert_not_nil user_id_index, "Expected index on user_id for querying user actions"
  end

  test "audit_logs table has index on staff_id" do
    indexes = ActiveRecord::Base.connection.indexes(:audit_logs)
    staff_id_index = indexes.find { |idx| idx.columns.include?("staff_id") }

    assert_not_nil staff_id_index, "Expected index on staff_id for querying staff actions"
  end

  test "audit_logs table has index on action" do
    indexes = ActiveRecord::Base.connection.indexes(:audit_logs)
    action_index = indexes.find { |idx| idx.columns.include?("action") }

    assert_not_nil action_index, "Expected index on action for filtering by action type"
  end

  test "audit_logs table has index on created_at for date range queries" do
    indexes = ActiveRecord::Base.connection.indexes(:audit_logs)
    created_at_index = indexes.find { |idx| idx.columns.include?("created_at") }

    assert_not_nil created_at_index, "Expected index on created_at for date range queries"
  end

  test "audit_logs table has composite index on user_type and user_id" do
    indexes = ActiveRecord::Base.connection.indexes(:audit_logs)
    composite_index = indexes.find do |idx|
      idx.columns.include?("user_type") && idx.columns.include?("user_id")
    end

    assert_not_nil composite_index, "Expected composite index on [user_type, user_id] for polymorphic queries"
  end
end
