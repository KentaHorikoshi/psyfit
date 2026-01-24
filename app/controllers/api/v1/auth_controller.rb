# frozen_string_literal: true

# Authentication controller for users and staff
# Handles login, logout, and session management
#
# Security features:
# - Account lockout after 5 failed attempts
# - Session timeout (30 min for users, 15 min for staff)
# - Audit logging for all authentication events
module Api
  module V1
    class AuthController < BaseController
      # User login
      # POST /api/v1/auth/login
      def login
        email = login_params[:email]
        password = login_params[:password]

        user = find_user_by_email(email)

        if user.nil?
          log_login_failure(email, reason: "user_not_found")
          return render_unauthorized("メールアドレスまたはパスワードが正しくありません")
        end

        if user.locked?
          log_login_failure(email, reason: "account_locked")
          return render_unauthorized("アカウントがロックされています。しばらく待ってから再試行してください")
        end

        if user.authenticate(password)
          create_user_session(user)
          user.reset_failed_login!
          AuditLog.log_login_success(user, ip_address: client_ip, user_agent: user_agent)

          render_success({ user: user_response(user) })
        else
          user.increment_failed_login!
          log_login_failure(email, reason: "invalid_password")
          render_unauthorized("メールアドレスまたはパスワードが正しくありません")
        end
      end

      # Staff login
      # POST /api/v1/auth/staff/login
      def staff_login
        staff_id = staff_login_params[:staff_id]
        password = staff_login_params[:password]

        staff = Staff.active.find_by(staff_id: staff_id)

        if staff.nil?
          log_login_failure(staff_id, reason: "staff_not_found")
          return render_unauthorized("職員IDまたはパスワードが正しくありません")
        end

        if staff.locked?
          log_login_failure(staff_id, reason: "account_locked")
          return render_unauthorized("アカウントがロックされています。しばらく待ってから再試行してください")
        end

        if staff.authenticate(password)
          create_staff_session(staff)
          staff.reset_failed_login!
          AuditLog.log_login_success(staff, ip_address: client_ip, user_agent: user_agent)

          render_success({ staff: staff_response(staff) })
        else
          staff.increment_failed_login!
          log_login_failure(staff_id, reason: "invalid_password")
          render_unauthorized("職員IDまたはパスワードが正しくありません")
        end
      end

      # Logout (for both users and staff)
      # DELETE /api/v1/auth/logout
      def logout
        if current_user
          AuditLog.log_logout(current_user, ip_address: client_ip)
        elsif current_staff
          AuditLog.log_logout(current_staff, ip_address: client_ip)
        end

        reset_session
        render_success({ message: "ログアウトしました" })
      end

      # Get current session info
      # GET /api/v1/auth/me
      def me
        if current_user && session_valid?(:user)
          render_success({ user: user_response(current_user) })
        elsif current_staff && session_valid?(:staff)
          render_success({ staff: staff_response(current_staff) })
        else
          render_unauthorized("認証が必要です")
        end
      end

      private

      def login_params
        params.require(:auth).permit(:email, :password)
      rescue ActionController::ParameterMissing
        params.permit(:email, :password)
      end

      def staff_login_params
        params.require(:auth).permit(:staff_id, :password)
      rescue ActionController::ParameterMissing
        params.permit(:staff_id, :password)
      end

      def find_user_by_email(email)
        # Use blind index for searching encrypted email
        # Then filter by active status
        user = User.find_by_email(email)
        user if user && !user.deleted?
      end

      def create_user_session(user)
        reset_session
        session[:user_id] = user.id
        session[:user_type] = "user"
        session[:last_activity] = Time.current.iso8601
      end

      def create_staff_session(staff)
        reset_session
        session[:staff_id] = staff.id
        session[:user_type] = "staff"
        session[:last_activity] = Time.current.iso8601
      end

      def user_response(user)
        {
          id: user.id,
          name: user.name,
          email: user.email,
          continue_days: user.respond_to?(:continue_days) ? user.continue_days : 0
        }
      end

      def staff_response(staff)
        {
          id: staff.id,
          staff_id: staff.staff_id,
          name: staff.name,
          role: staff.role
        }
      end

      def log_login_failure(identifier, reason:)
        AuditLog.log_login_failure(
          identifier,
          ip_address: client_ip,
          user_agent: user_agent,
          reason: reason
        )
      end
    end
  end
end
