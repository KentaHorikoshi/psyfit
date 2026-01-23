# frozen_string_literal: true

module RequestSpecHelper
  # JSON response body parsed
  def json_response
    JSON.parse(response.body)
  end

  # Sign in as user (creates session)
  def sign_in_as_user(user)
    post '/api/v1/auth/login', params: {
      email: user.email,
      password: 'Password123'
    }
  end

  # Sign in as staff (creates session)
  def sign_in_as_staff(staff)
    post '/api/v1/auth/staff/login', params: {
      staff_id: staff.staff_id,
      password: 'Password123'
    }
  end

  # Set session directly for testing
  def set_user_session(user)
    # For request specs, we need to sign in via the endpoint
    # This helper is for when we need to manipulate session timing
    sign_in_as_user(user)
  end

  def set_staff_session(staff)
    sign_in_as_staff(staff)
  end
end
