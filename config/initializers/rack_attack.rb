# frozen_string_literal: true

# Rack::Attack configuration for rate limiting
# Protects API endpoints with per-role rate limits and brute force prevention

class Rack::Attack
  # Cache store for tracking requests
  # Uses Rails cache (memory store in dev, Redis in production)
  Rack::Attack.cache.store = Rails.cache

  ### Authentication endpoint throttling ###

  # Throttle login attempts by IP address
  # 10 requests per minute (brute force protection)
  throttle("auth/login/ip", limit: 10, period: 60.seconds) do |req|
    if login_path?(req) && req.post?
      req.ip
    end
  end

  # Throttle login attempts by identifier
  # 10 requests per minute per account
  throttle("auth/login/identifier", limit: 10, period: 60.seconds) do |req|
    if login_path?(req) && req.post?
      extract_login_identifier(req)
    end
  end

  ### Password reset throttling ###

  # 5 requests per hour per IP
  throttle("auth/password_reset/ip", limit: 5, period: 1.hour) do |req|
    if password_reset_path?(req) && req.post?
      req.ip
    end
  end

  ### Session-based API rate limiting ###

  # User sessions: 60 requests per minute
  throttle("api/user", limit: 60, period: 60.seconds) do |req|
    if general_api_path?(req)
      session = req.env["rack.session"] || {}
      if session["user_type"] == "user" && session["user_id"]
        "user:#{session['user_id']}"
      end
    end
  end

  # Staff sessions: 120 requests per minute
  throttle("api/staff", limit: 120, period: 60.seconds) do |req|
    if general_api_path?(req)
      session = req.env["rack.session"] || {}
      if session["user_type"] == "staff" && session["staff_id"]
        "staff:#{session['staff_id']}"
      end
    end
  end

  # Fallback IP-based rate limit for unauthenticated API requests
  # Uses the higher staff limit as default
  throttle("api/ip", limit: 120, period: 60.seconds) do |req|
    if general_api_path?(req)
      session = req.env["rack.session"] || {}
      unless session["user_type"]
        req.ip
      end
    end
  end

  ### Suspicious request blocking ###

  blocklist("block/suspicious") do |req|
    Rack::Attack::Fail2Ban.filter("suspicious-#{req.ip}", maxretry: 3, findtime: 10.minutes, bantime: 1.hour) do
      suspicious_patterns = [
        /union.*select/i,
        /insert.*into/i,
        /delete.*from/i,
        /drop.*table/i,
        /<script/i,
        /javascript:/i,
        /on(error|load|click)=/i
      ]

      full_request = "#{req.path}?#{req.query_string}"
      suspicious_patterns.any? { |pattern| full_request.match?(pattern) }
    end
  end

  ### Response handlers ###

  # Custom response for throttled requests
  self.throttled_responder = lambda do |req|
    match_data = req.env["rack.attack.match_data"]
    now = match_data[:epoch_time]
    retry_after = (match_data[:period] - (now % match_data[:period])).to_i

    headers = {
      "Content-Type" => "application/json",
      "Retry-After" => retry_after.to_s
    }

    body = {
      error: "Rate limit exceeded",
      retry_after: retry_after
    }.to_json

    [429, headers, [body]]
  end

  # Custom response for blocked requests
  self.blocklisted_responder = lambda do |req|
    body = { error: "Access denied" }.to_json
    [403, { "Content-Type" => "application/json" }, [body]]
  end

  ### Helper methods ###

  class << self
    def login_path?(req)
      req.path == "/api/v1/auth/login" || req.path == "/api/v1/auth/staff/login"
    end

    def password_reset_path?(req)
      req.path == "/api/v1/auth/password_reset_request" || req.path == "/api/v1/auth/password_reset"
    end

    def general_api_path?(req)
      req.path.start_with?("/api/") && !login_path?(req) && !password_reset_path?(req)
    end

    def extract_login_identifier(req)
      body = begin
        JSON.parse(req.body.read)
      rescue StandardError
        {}
      ensure
        req.body.rewind
      end

      body["email"] || body["staff_id"]
    end
  end
end

# Logging for throttled/blocked requests
ActiveSupport::Notifications.subscribe("throttle.rack_attack") do |_name, _start, _finish, _id, payload|
  req = payload[:request]
  Rails.logger.warn "[Rack::Attack] Throttled #{req.ip} for #{req.path}"

  if defined?(AuditLog)
    AuditLog.log_action(
      action: "rate_limit_exceeded",
      status: "failure",
      ip_address: req.ip,
      user_agent: req.user_agent,
      additional_info: { path: req.path }.to_json
    )
  end
end

ActiveSupport::Notifications.subscribe("blocklist.rack_attack") do |_name, _start, _finish, _id, payload|
  req = payload[:request]
  Rails.logger.error "[Rack::Attack] Blocked #{req.ip} for #{req.path}"

  if defined?(AuditLog)
    AuditLog.log_action(
      action: "blocked_request",
      status: "failure",
      ip_address: req.ip,
      user_agent: req.user_agent,
      additional_info: { path: req.path }.to_json
    )
  end
end
