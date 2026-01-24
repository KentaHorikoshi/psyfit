# Session Store Configuration
# Session-based authentication with different timeouts for users and staff

Rails.application.config.session_store :cookie_store,
  key: "_psyfit_session",
  expire_after: 30.minutes,  # Default timeout (will be managed per user type)
  secure: Rails.env.production?,
  httponly: true,
  same_site: :lax

# Session timeout constants (used by authentication controllers)
module SessionTimeout
  USER_TIMEOUT = 30.minutes   # 利用者: 30分
  STAFF_TIMEOUT = 15.minutes  # 職員: 15分
end
