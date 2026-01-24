# Rack::Attack configuration for rate limiting
# Protects authentication endpoints from brute force attacks

class Rack::Attack
  # Cache store for tracking requests
  # Uses Rails cache (memory store in dev, Redis in production)
  Rack::Attack.cache.store = Rails.cache

  # Throttle login attempts by IP address
  # 5 requests per 20 seconds
  throttle("logins/ip", limit: 5, period: 20.seconds) do |req|
    if req.path == "/api/v1/auth/login" && req.post?
      req.ip
    end
  end

  # Throttle login attempts by email/user_code
  # 5 requests per minute per account
  throttle("logins/identifier", limit: 5, period: 60.seconds) do |req|
    if req.path == "/api/v1/auth/login" && req.post?
      # Extract email or user_code from request body
      body = begin
        JSON.parse(req.body.read)
      rescue
        {}
      ensure
        req.body.rewind
      end

      body["email"] || body["user_code"] || body["staff_id"]
    end
  end

  # Throttle password reset requests
  # 3 requests per hour per IP
  throttle("password_reset/ip", limit: 3, period: 1.hour) do |req|
    if req.path == "/api/v1/auth/password_reset" && req.post?
      req.ip
    end
  end

  # General API rate limit
  # 100 requests per minute per IP
  throttle("api/ip", limit: 100, period: 1.minute) do |req|
    if req.path.start_with?("/api/")
      req.ip
    end
  end

  # Block suspicious requests (SQL injection attempts, etc.)
  blocklist("block/suspicious") do |req|
    # Block requests with suspicious patterns
    Rack::Attack::Fail2Ban.filter("suspicious-#{req.ip}", maxretry: 3, findtime: 10.minutes, bantime: 1.hour) do
      # Suspicious patterns in path or query string
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

  # Custom response for throttled requests
  self.throttled_responder = lambda do |req|
    match_data = req.env["rack.attack.match_data"]
    now = match_data[:epoch_time]

    headers = {
      "Content-Type" => "application/json",
      "Retry-After" => (match_data[:period] - (now % match_data[:period])).to_s
    }

    body = {
      error: "Rate limit exceeded",
      retry_after: headers["Retry-After"].to_i
    }.to_json

    [ 429, headers, [ body ] ]
  end

  # Custom response for blocked requests
  self.blocklisted_responder = lambda do |req|
    body = {
      error: "Access denied"
    }.to_json

    [ 403, { "Content-Type" => "application/json" }, [ body ] ]
  end
end

# Logging for throttled/blocked requests
ActiveSupport::Notifications.subscribe("throttle.rack_attack") do |_name, _start, _finish, _id, payload|
  req = payload[:request]
  Rails.logger.warn "[Rack::Attack] Throttled #{req.ip} for #{req.path}"

  # Log to audit_logs
  AuditLog.log_action(
    action: "rate_limit_exceeded",
    status: "failure",
    ip_address: req.ip,
    user_agent: req.user_agent,
    additional_info: { path: req.path }.to_json
  ) if defined?(AuditLog)
end

ActiveSupport::Notifications.subscribe("blocklist.rack_attack") do |_name, _start, _finish, _id, payload|
  req = payload[:request]
  Rails.logger.error "[Rack::Attack] Blocked #{req.ip} for #{req.path}"

  # Log to audit_logs
  AuditLog.log_action(
    action: "blocked_request",
    status: "failure",
    ip_address: req.ip,
    user_agent: req.user_agent,
    additional_info: { path: req.path }.to_json
  ) if defined?(AuditLog)
end
