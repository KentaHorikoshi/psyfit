require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Psyfit
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 8.1

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w[assets tasks])

    # Time zone for Japan
    config.time_zone = "Tokyo"

    # Default locale
    config.i18n.default_locale = :ja
    config.i18n.available_locales = [ :ja, :en ]

    # Generators configuration
    config.generators do |g|
      g.orm :active_record, primary_key_type: :uuid
      g.test_framework :minitest, fixture: false
    end
  end
end
