# SimpleCov must be loaded BEFORE any application code
if ENV['COVERAGE']
  require 'simplecov'
  SimpleCov.start 'rails' do
    add_filter '/test/'
    add_filter '/config/'
    add_filter '/vendor/'

    add_group 'Models', 'app/models'
    add_group 'Controllers', 'app/controllers'
    add_group 'Concerns', 'app/models/concerns'

    # Require 100% coverage for authentication components
    minimum_coverage 100
    minimum_coverage_by_file 100
  end
end

ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

# Load test dependencies
require 'minitest/reporters'
require 'database_cleaner/active_record'
require 'timecop'

# Better test output formatting
Minitest::Reporters.use! [
  Minitest::Reporters::ProgressReporter.new,
  Minitest::Reporters::JUnitReporter.new
]

# Database cleaner configuration
DatabaseCleaner.strategy = :transaction

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    # Note: Disable for debugging if needed
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    # Database cleaner hooks
    setup do
      DatabaseCleaner.start
    end

    teardown do
      DatabaseCleaner.clean
      Timecop.return # Always reset time after tests
    end

    # Authentication helper methods
    def login_as(user_or_staff)
      if user_or_staff.is_a?(User)
        post api_v1_users_auth_login_url, params: {
          email: user_or_staff.email,
          password: 'password123' # Default test password
        }, as: :json
      elsif user_or_staff.is_a?(Staff)
        post api_v1_staff_auth_login_url, params: {
          staff_id: user_or_staff.staff_id,
          password: 'password123' # Default test password
        }, as: :json
      end
      @current_session = session
    end

    def logout
      if @current_session
        delete api_v1_users_auth_logout_url, as: :json if session[:user_id]
        delete api_v1_staff_auth_logout_url, as: :json if session[:staff_id]
        @current_session = nil
      end
    end

    def current_session
      @current_session ||= session
    end

    def assert_encrypted(record, field)
      # Verify field is encrypted in database (not plaintext)
      encrypted_value = record.read_attribute("#{field}_encrypted")
      assert_not_nil encrypted_value, "Expected #{field} to be encrypted"
      assert_not_equal record.send(field), encrypted_value, "#{field} should not match encrypted value"
    end

    def assert_audit_log(action:, status:, user: nil, staff: nil)
      # Verify audit log was created
      log = AuditLog.last
      assert_not_nil log, "Expected audit log to be created"
      assert_equal action, log.action
      assert_equal status, log.status
      assert_equal user&.id, log.user_id if user
      assert_equal staff&.id, log.staff_id if staff
    end
  end
end
