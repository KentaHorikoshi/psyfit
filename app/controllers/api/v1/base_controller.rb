# frozen_string_literal: true

# Base controller for all API v1 endpoints
# Provides common authentication, authorization, and response helpers
module Api
  module V1
    class BaseController < ActionController::API
      include ActionController::Cookies

      # Exception handling
      rescue_from ActiveRecord::RecordNotFound, with: :not_found
      rescue_from ActiveRecord::RecordInvalid, with: :unprocessable_entity
      rescue_from ActiveRecord::RangeError, with: :range_error
      rescue_from ActionController::ParameterMissing, with: :bad_request

      protected

      # Authentication helpers

      def current_user
        return @current_user if defined?(@current_user)

        @current_user = session[:user_id] ? User.active.find_by(id: session[:user_id]) : nil
      end

      def current_staff
        return @current_staff if defined?(@current_staff)

        @current_staff = session[:staff_id] ? Staff.active.find_by(id: session[:staff_id]) : nil
      end

      def user_signed_in?
        current_user.present?
      end

      def staff_signed_in?
        current_staff.present?
      end

      def authenticate_user!
        return if user_signed_in? && session_valid?(:user)

        render_unauthorized("認証が必要です")
      end

      def authenticate_staff!
        return if staff_signed_in? && session_valid?(:staff)

        render_unauthorized("認証が必要です")
      end

      def require_manager!
        authenticate_staff!
        return if performed?
        return if current_staff&.manager?

        render_forbidden("この操作はマネージャー権限が必要です")
      end

      # Session management

      def session_valid?(type)
        last_activity = session[:last_activity]
        return false unless last_activity

        timeout = case type
        when :user then 30.minutes
        when :staff then 15.minutes
        else 15.minutes
        end

        if Time.current - Time.parse(last_activity.to_s) > timeout
          reset_session
          false
        else
          session[:last_activity] = Time.current.iso8601
          true
        end
      end

      # Response helpers

      def render_success(data = {}, status: :ok)
        render json: { status: "success", data: data }, status: status
      end

      def render_error(message, errors: nil, status: :unprocessable_content)
        response = { status: "error", message: message }
        response[:errors] = errors if errors.present?
        render json: response, status: status
      end

      def render_unauthorized(message = "認証が必要です")
        render_error(message, status: :unauthorized)
      end

      def render_forbidden(message = "アクセス権限がありません")
        render_error(message, status: :forbidden)
      end

      # Exception handlers

      def not_found
        render_error("リソースが見つかりません", status: :not_found)
      end

      def unprocessable_entity(exception)
        render_error(
          "バリデーションエラー",
          errors: exception.record.errors.to_hash,
          status: :unprocessable_content
        )
      end

      def bad_request(exception)
        render_error(exception.message, status: :bad_request)
      end

      def range_error(_exception)
        render_error("入力値が許容範囲を超えています", status: :unprocessable_content)
      end

      # Request info helpers

      def client_ip
        request.remote_ip
      end

      def user_agent
        request.user_agent
      end
    end
  end
end
