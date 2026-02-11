# frozen_string_literal: true

# Middleware to add X-RateLimit-* headers to API responses
# Reads Rack::Attack throttle data and session info to provide accurate rate limit information
class RateLimitHeaders
  USER_LIMIT = 60
  STAFF_LIMIT = 120
  DEFAULT_LIMIT = 120
  AUTH_LIMIT = 10
  PASSWORD_RESET_LIMIT = 5
  PASSWORD_RESET_PERIOD = 3600
  API_PERIOD = 60

  def initialize(app)
    @app = app
  end

  def call(env)
    request = Rack::Request.new(env)

    unless request.path.start_with?("/api/")
      return @app.call(env)
    end

    status, headers, body = @app.call(env)

    if status == 429
      return [ status, headers, body ]
    end

    inject_rate_limit_headers(env, request, headers)

    [ status, headers, body ]
  end

  private

  def inject_rate_limit_headers(env, request, headers)
    throttle_data = env["rack.attack.throttle_data"] || {}
    session = env["rack.session"] || {}
    user_type = session["user_type"]

    limit, remaining, reset_time = extract_rate_info(throttle_data, user_type, request)

    headers["X-RateLimit-Limit"] = limit.to_s
    headers["X-RateLimit-Remaining"] = [ remaining, 0 ].max.to_s
    headers["X-RateLimit-Reset"] = reset_time.to_s
  end

  def extract_rate_info(throttle_data, user_type, request)
    now = Time.now.to_i

    if auth_path?(request)
      return rate_info_for(throttle_data, %w[auth/login/ip auth/login/identifier], AUTH_LIMIT, API_PERIOD, now)
    end

    if password_reset_path?(request)
      return rate_info_for(throttle_data, %w[auth/password_reset/ip], PASSWORD_RESET_LIMIT, PASSWORD_RESET_PERIOD, now)
    end

    limit = case user_type
    when "staff" then STAFF_LIMIT
    when "user" then USER_LIMIT
    else DEFAULT_LIMIT
    end

    throttle_key = case user_type
    when "staff" then "api/staff"
    when "user" then "api/user"
    else "api/ip"
    end

    rate_info_for(throttle_data, [ throttle_key ], limit, API_PERIOD, now)
  end

  def rate_info_for(throttle_data, keys, limit, period, now)
    data = keys.filter_map { |k| throttle_data[k] }.first
    if data
      count = data[:count] || 0
      effective_period = data[:period] || period
      reset_time = now + (effective_period - (now % effective_period))
      [ limit, limit - count, reset_time ]
    else
      reset_time = now + (period - (now % period))
      [ limit, limit, reset_time ]
    end
  end

  def auth_path?(request)
    request.path == "/api/v1/auth/login" || request.path == "/api/v1/auth/staff/login"
  end

  def password_reset_path?(request)
    request.path == "/api/v1/auth/password_reset_request" || request.path == "/api/v1/auth/password_reset"
  end
end
