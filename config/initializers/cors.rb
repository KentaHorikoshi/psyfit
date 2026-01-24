# CORS configuration for frontend applications
# Allows cross-origin requests from user and admin frontends

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # Development origins
    if Rails.env.development? || Rails.env.test?
      origins "http://localhost:5173",     # Vite dev server (user)
              "http://localhost:5174",     # Vite dev server (admin)
              "http://127.0.0.1:5173",
              "http://127.0.0.1:5174",
              "http://localhost:3000",      # Rails default
              "http://127.0.0.1:3000"
    end

    # Production origins from environment variable
    if Rails.env.production?
      # CORS_ORIGINS should be comma-separated list of allowed origins
      # Example: https://psyfit-user.example.com,https://psyfit-admin.example.com
      production_origins = ENV.fetch("CORS_ORIGINS", "").split(",").map(&:strip)

      if production_origins.empty?
        Rails.logger.warn "CORS_ORIGINS not set in production!"
      end

      origins(*production_origins) unless production_origins.empty?
    end

    resource "/api/*",
      headers: :any,
      methods: [ :get, :post, :put, :patch, :delete, :options, :head ],
      credentials: true,
      max_age: 86400  # Cache preflight for 24 hours
  end
end
