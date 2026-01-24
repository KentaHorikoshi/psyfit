# frozen_string_literal: true

require "test_helper"

# Authentication API Tests
# Covers login, logout, and session management for users and staff
#
# Security coverage requirements (100%):
# - Account lockout after 5 failed attempts
# - Session timeout verification
# - Audit logging for all authentication events
class Api::V1::AuthTest < ActionDispatch::IntegrationTest
  include FactoryBot::Syntax::Methods

  setup do
    @user = create(:user, email: "test@example.com", password: "Password123!", password_confirmation: "Password123!")
    @staff = create(:staff, staff_id: "teststaff", password: "Staff123!", password_confirmation: "Staff123!")
    @manager = create(:staff, :manager, staff_id: "testmanager", password: "Manager123!", password_confirmation: "Manager123!")
  end

  # ===== User Login Tests =====

  test "user can login with valid credentials" do
    post "/api/v1/auth/login", params: { email: "test@example.com", password: "Password123!" }, as: :json

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert_equal @user.name, json["data"]["user"]["name"]
    assert_equal "test@example.com", json["data"]["user"]["email"]
  end

  test "user login creates session" do
    post "/api/v1/auth/login", params: { email: "test@example.com", password: "Password123!" }, as: :json

    assert_response :success
    assert_equal @user.id, session[:user_id]
    assert_equal "user", session[:user_type]
    assert_not_nil session[:last_activity]
  end

  test "user login fails with wrong email" do
    post "/api/v1/auth/login", params: { email: "wrong@example.com", password: "Password123!" }, as: :json

    assert_response :unauthorized
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_includes json["message"], "メールアドレスまたはパスワード"
  end

  test "user login fails with wrong password" do
    post "/api/v1/auth/login", params: { email: "test@example.com", password: "wrong_password" }, as: :json

    assert_response :unauthorized
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  test "user login increments failed login count" do
    assert_equal 0, @user.failed_login_count

    post "/api/v1/auth/login", params: { email: "test@example.com", password: "wrong" }, as: :json

    @user.reload
    assert_equal 1, @user.failed_login_count
  end

  test "user account locks after 5 failed attempts" do
    5.times do
      post "/api/v1/auth/login", params: { email: "test@example.com", password: "wrong" }, as: :json
    end

    @user.reload
    assert @user.locked?
    assert_not_nil @user.locked_until
    assert @user.locked_until > Time.current
  end

  test "locked user cannot login even with correct password" do
    locked_user = create(:user, :locked, email: "locked@example.com", password: "Password123!")

    post "/api/v1/auth/login", params: { email: "locked@example.com", password: "Password123!" }, as: :json

    assert_response :unauthorized
    json = JSON.parse(response.body)
    assert_includes json["message"], "ロック"
  end

  test "successful login resets failed login count" do
    @user.update!(failed_login_count: 3)

    post "/api/v1/auth/login", params: { email: "test@example.com", password: "Password123!" }, as: :json

    assert_response :success
    @user.reload
    assert_equal 0, @user.failed_login_count
  end

  test "user login creates audit log" do
    assert_difference -> { AuditLog.count }, 1 do
      post "/api/v1/auth/login", params: { email: "test@example.com", password: "Password123!" }, as: :json
    end

    log = AuditLog.last
    assert_equal "login", log.action
    assert_equal "success", log.status
    assert_equal @user.id, log.user_id
  end

  test "failed user login creates audit log" do
    assert_difference -> { AuditLog.count }, 1 do
      post "/api/v1/auth/login", params: { email: "test@example.com", password: "wrong" }, as: :json
    end

    log = AuditLog.last
    assert_equal "login_failed", log.action
    assert_equal "failure", log.status
  end

  # ===== Staff Login Tests =====

  test "staff can login with valid credentials" do
    post "/api/v1/auth/staff/login", params: { staff_id: "teststaff", password: "Staff123!" }, as: :json

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert_equal @staff.name, json["data"]["staff"]["name"]
    assert_equal "staff", json["data"]["staff"]["role"]
  end

  test "manager can login with valid credentials" do
    post "/api/v1/auth/staff/login", params: { staff_id: "testmanager", password: "Manager123!" }, as: :json

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert_equal "manager", json["data"]["staff"]["role"]
  end

  test "staff login creates session" do
    post "/api/v1/auth/staff/login", params: { staff_id: "teststaff", password: "Staff123!" }, as: :json

    assert_response :success
    assert_equal @staff.id, session[:staff_id]
    assert_equal "staff", session[:user_type]
    assert_not_nil session[:last_activity]
  end

  test "staff login fails with wrong staff_id" do
    post "/api/v1/auth/staff/login", params: { staff_id: "wrong", password: "Staff123!" }, as: :json

    assert_response :unauthorized
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_includes json["message"], "職員IDまたはパスワード"
  end

  test "staff login fails with wrong password" do
    post "/api/v1/auth/staff/login", params: { staff_id: "teststaff", password: "wrong" }, as: :json

    assert_response :unauthorized
  end

  test "staff account locks after 5 failed attempts" do
    5.times do
      post "/api/v1/auth/staff/login", params: { staff_id: "teststaff", password: "wrong" }, as: :json
    end

    @staff.reload
    assert @staff.locked?
  end

  test "locked staff cannot login" do
    locked_staff = create(:staff, :locked, staff_id: "lockedstaff", password: "Staff123!")

    post "/api/v1/auth/staff/login", params: { staff_id: "lockedstaff", password: "Staff123!" }, as: :json

    assert_response :unauthorized
    json = JSON.parse(response.body)
    assert_includes json["message"], "ロック"
  end

  test "staff login creates audit log" do
    assert_difference -> { AuditLog.count }, 1 do
      post "/api/v1/auth/staff/login", params: { staff_id: "teststaff", password: "Staff123!" }, as: :json
    end

    log = AuditLog.last
    assert_equal "login", log.action
    assert_equal "success", log.status
    assert_equal @staff.id, log.staff_id
  end

  # ===== Logout Tests =====

  test "user can logout" do
    post "/api/v1/auth/login", params: { email: "test@example.com", password: "Password123!" }, as: :json
    assert_response :success

    delete "/api/v1/auth/logout", as: :json

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert_includes json["data"]["message"], "ログアウト"
  end

  test "logout clears session" do
    post "/api/v1/auth/login", params: { email: "test@example.com", password: "Password123!" }, as: :json
    assert_equal @user.id, session[:user_id]

    delete "/api/v1/auth/logout", as: :json

    assert_nil session[:user_id]
  end

  test "staff can logout" do
    post "/api/v1/auth/staff/login", params: { staff_id: "teststaff", password: "Staff123!" }, as: :json
    assert_response :success

    delete "/api/v1/auth/logout", as: :json

    assert_response :success
    assert_nil session[:staff_id]
  end

  test "logout creates audit log for user" do
    post "/api/v1/auth/login", params: { email: "test@example.com", password: "Password123!" }, as: :json
    assert_response :success

    # Get the count of logout logs before
    logout_logs_before = AuditLog.where(action: "logout").count

    delete "/api/v1/auth/logout", as: :json
    assert_response :success

    # Verify a new logout log was created
    logout_logs_after = AuditLog.where(action: "logout").count
    assert_equal logout_logs_before + 1, logout_logs_after, "Expected one logout log to be created"

    log = AuditLog.where(action: "logout").last
    assert_equal "logout", log.action
    assert_equal "success", log.status
  end

  test "logout without session still succeeds" do
    delete "/api/v1/auth/logout", as: :json

    assert_response :success
  end

  # ===== Session Info (me) Tests =====

  test "user can get current session info" do
    post "/api/v1/auth/login", params: { email: "test@example.com", password: "Password123!" }, as: :json

    get "/api/v1/auth/me", as: :json

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert_equal @user.name, json["data"]["user"]["name"]
  end

  test "staff can get current session info" do
    post "/api/v1/auth/staff/login", params: { staff_id: "teststaff", password: "Staff123!" }, as: :json

    get "/api/v1/auth/me", as: :json

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
    assert_equal @staff.name, json["data"]["staff"]["name"]
  end

  test "me returns unauthorized without session" do
    get "/api/v1/auth/me", as: :json

    assert_response :unauthorized
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
  end

  # ===== Session Timeout Tests =====

  test "user session expires after 30 minutes of inactivity" do
    post "/api/v1/auth/login", params: { email: "test@example.com", password: "Password123!" }, as: :json
    assert_response :success

    Timecop.travel(31.minutes.from_now) do
      get "/api/v1/auth/me", as: :json
      assert_response :unauthorized
    end
  end

  test "staff session expires after 15 minutes of inactivity" do
    post "/api/v1/auth/staff/login", params: { staff_id: "teststaff", password: "Staff123!" }, as: :json
    assert_response :success

    Timecop.travel(16.minutes.from_now) do
      get "/api/v1/auth/me", as: :json
      assert_response :unauthorized
    end
  end

  test "user session extends on activity" do
    post "/api/v1/auth/login", params: { email: "test@example.com", password: "Password123!" }, as: :json
    assert_response :success

    # First activity at 15 minutes
    Timecop.travel(15.minutes.from_now) do
      get "/api/v1/auth/me", as: :json
      assert_response :success
    end

    # Second activity at 40 minutes from start (25 minutes since last activity)
    Timecop.travel(40.minutes.from_now) do
      get "/api/v1/auth/me", as: :json
      assert_response :success
    end
  end

  # ===== Soft Delete Tests =====

  test "deleted user cannot login" do
    @user.soft_delete

    post "/api/v1/auth/login", params: { email: "test@example.com", password: "Password123!" }, as: :json

    assert_response :unauthorized
  end

  test "deleted staff cannot login" do
    @staff.soft_delete

    post "/api/v1/auth/staff/login", params: { staff_id: "teststaff", password: "Staff123!" }, as: :json

    assert_response :unauthorized
  end
end
