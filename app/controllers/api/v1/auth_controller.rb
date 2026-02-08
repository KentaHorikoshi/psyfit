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
        staff_id = staff_login_params[:staff_id]&.strip
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

      # Request password reset
      # POST /api/v1/auth/password_reset_request
      def password_reset_request
        email = password_reset_request_params[:email]
        staff_id = password_reset_request_params[:staff_id]

        if email.blank? && staff_id.blank?
          return render_error("email または staff_id が必要です", status: :unprocessable_entity)
        end

        if email.present?
          handle_user_password_reset_request(email)
        else
          handle_staff_password_reset_request(staff_id)
        end

        render_success({ message: "パスワードリセットのメールを送信しました" })
      end

      # Reset password with token
      # POST /api/v1/auth/password_reset
      def password_reset
        token_string = password_reset_params[:token]
        new_password = password_reset_params[:new_password]
        new_password_confirmation = password_reset_params[:new_password_confirmation]

        reset_token = PasswordResetToken.find_valid_token(token_string)

        if reset_token.nil?
          return render_error("トークンが無効または期限切れです", status: :unprocessable_entity)
        end

        if new_password != new_password_confirmation
          return render_error("パスワードが一致しません", status: :unprocessable_entity)
        end

        target = reset_token.target

        if target.update(password: new_password, password_confirmation: new_password_confirmation)
          reset_token.mark_as_used!
          target.reset_failed_login!
          AuditLog.log_password_reset(target, ip_address: client_ip, step: "complete")

          render_success({ message: "パスワードが更新されました" })
        else
          render_error(
            "パスワードの更新に失敗しました",
            errors: target.errors.to_hash,
            status: :unprocessable_entity
          )
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
          continue_days: user.respond_to?(:continue_days) ? user.continue_days : 0,
          next_visit_date: user.next_visit_date&.iso8601
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

      def password_reset_request_params
        params.permit(:email, :staff_id)
      end

      def password_reset_params
        params.permit(:token, :new_password, :new_password_confirmation)
      end

      def handle_user_password_reset_request(email)
        user = find_user_by_email(email)
        return unless user

        token = PasswordResetToken.generate_for_user(user)
        AuditLog.log_password_reset(user, ip_address: client_ip, step: "request")

        send_password_reset_email(user, token)
      end

      def handle_staff_password_reset_request(staff_id)
        staff = Staff.active.find_by(staff_id: staff_id)
        return unless staff

        token = PasswordResetToken.generate_for_staff(staff)
        AuditLog.log_password_reset(staff, ip_address: client_ip, step: "request")

        send_password_reset_email(staff, token)
      end

      def send_password_reset_email(recipient, token)
        UserMailer.password_reset_instructions(recipient, token).deliver_later
        Rails.logger.info("Password reset email enqueued for #{recipient.class.name} #{recipient.id}")
      rescue StandardError => e
        # Log the error but don't expose it to the user (security: no information leakage)
        Rails.logger.error("Failed to enqueue password reset email for #{recipient.class.name} #{recipient.id}: #{e.message}")
      end
    end
  end
end
