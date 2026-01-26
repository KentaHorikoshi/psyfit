# frozen_string_literal: true

# SimpleCov must be required before any application code
require 'simplecov'
SimpleCov.start 'rails' do
  add_filter '/spec/'
  add_filter '/config/'
  add_filter '/vendor/'

  # 認証・セキュリティ関連は100%カバレッジ必須
  add_group 'Authentication', 'app/controllers/api/v1/auth'
  add_group 'Security', [ 'app/models/concerns/encryptable', 'app/services/security' ]
  add_group 'Models', 'app/models'
  add_group 'Controllers', 'app/controllers'

  minimum_coverage 80
  minimum_coverage_by_file 60
end

require 'spec_helper'
ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
abort("The Rails environment is running in production mode!") if Rails.env.production?

require 'rspec/rails'
require 'factory_bot_rails'
require 'database_cleaner/active_record'
require 'timecop'
require 'shoulda/matchers'

# Configure shoulda-matchers
Shoulda::Matchers.configure do |config|
  config.integrate do |with|
    with.test_framework :rspec
    with.library :rails
  end
end

# Load support files
Rails.root.glob('spec/support/**/*.rb').sort_by(&:to_s).each { |f| require f }

# Checks for pending migrations and applies them before tests are run.
begin
  ActiveRecord::Migration.maintain_test_schema!
rescue ActiveRecord::PendingMigrationError => e
  abort e.to_s.strip
end

RSpec.configure do |config|
  # FactoryBot setup
  config.include FactoryBot::Syntax::Methods

  # ActiveJob inline execution for mailer tests
  config.include ActiveJob::TestHelper
  config.before(:each) do
    ActiveJob::Base.queue_adapter = :test
  end

  # Request spec helpers
  config.include RequestSpecHelper, type: :request

  # Database cleaner setup
  config.before(:suite) do
    DatabaseCleaner.strategy = :transaction
    DatabaseCleaner.clean_with(:truncation)
  end

  config.around(:each) do |example|
    DatabaseCleaner.cleaning do
      example.run
    end
  end

  # Timecop reset after each test
  config.after(:each) do
    Timecop.return
  end

  # Remove this line if you're not using ActiveRecord or ActiveRecord fixtures
  config.fixture_paths = [
    Rails.root.join('spec/fixtures')
  ]

  # Use transactional fixtures
  config.use_transactional_fixtures = true

  # Infer spec type from file location
  config.infer_spec_type_from_file_location!

  # Filter lines from Rails gems in backtraces.
  config.filter_rails_from_backtrace!
end
