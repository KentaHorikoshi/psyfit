# frozen_string_literal: true

# Register RateLimitHeaders middleware after Rack::Attack
# Adds X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset headers to API responses
require_relative "../../app/middleware/rate_limit_headers"

Rails.application.config.middleware.insert_after Rack::Attack, RateLimitHeaders
