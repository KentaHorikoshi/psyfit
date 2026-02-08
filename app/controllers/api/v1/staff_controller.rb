# frozen_string_literal: true

module Api
  module V1
    class StaffController < BaseController
      before_action :require_manager!, except: [ :change_password ]
      before_action :authenticate_staff!, only: [ :change_password ]

      # POST /api/v1/staff/me/password
      def change_password
        staff = current_staff

        unless staff.authenticate(change_password_params[:current_password].to_s)
          return render_error("現在のパスワードが正しくありません", status: :unprocessable_entity)
        end

        new_password = change_password_params[:new_password]
        new_password_confirmation = change_password_params[:new_password_confirmation]

        if new_password.blank?
          return render_error("新しいパスワードを入力してください", status: :unprocessable_entity)
        end

        if new_password != new_password_confirmation
          return render_error("新しいパスワードが一致しません", status: :unprocessable_entity)
        end

        if staff.update(password: new_password, password_confirmation: new_password_confirmation)
          log_password_change(staff)
          reset_session
          render_success({ message: "パスワードを変更しました" })
        else
          render_error(
            "パスワードの更新に失敗しました",
            errors: staff.errors.to_hash,
            status: :unprocessable_entity
          )
        end
      end

      # GET /api/v1/staff
      def index
        staff_members = Staff.active.order(:staff_id)

        log_audit("read", "success")

        render_success({
          staff: serialize_staff_list(staff_members)
        })
      end

      # POST /api/v1/staff
      def create
        staff = Staff.new(staff_params)

        retries = 0
        begin
          if staff.save
            log_audit("create", "success", resource_id: staff.id)

            render json: {
              status: "success",
              data: serialize_staff(staff)
            }, status: :created
          else
            render_error(
              "バリデーションエラー",
              errors: staff.errors.to_hash,
              status: :unprocessable_entity
            )
          end
        rescue ActiveRecord::RecordNotUnique => e
          if e.message.include?("staff_id") && retries < 3
            retries += 1
            staff.staff_id = nil
            retry
          end
          raise
        end
      end

      private

      ALLOWED_ROLES = %w[manager staff].freeze

      def staff_params
        permitted = params.permit(:name, :name_kana, :email, :password, :department)
        permitted[:role] = sanitized_role if params[:role].present?
        permitted
      end

      def sanitized_role
        ALLOWED_ROLES.include?(params[:role]) ? params[:role] : "staff"
      end

      def serialize_staff_list(staff_members)
        staff_members.map { |s| serialize_staff(s) }
      end

      def serialize_staff(staff)
        {
          id: staff.id,
          staff_id: staff.staff_id,
          name: staff.name,
          role: staff.role,
          department: staff.department
        }
      end

      def change_password_params
        params.permit(:current_password, :new_password, :new_password_confirmation)
      end

      def log_audit(action, status, resource_id: nil)
        AuditLog.create!(
          user_type: "staff",
          staff_id: current_staff.id,
          action: action,
          status: status,
          ip_address: client_ip,
          user_agent: user_agent,
          additional_info: { resource_type: "Staff", resource_id: resource_id }.to_json
        )
      end

      def log_password_change(staff)
        AuditLog.log_action(
          action: "password_change",
          status: "success",
          staff: staff,
          ip_address: client_ip,
          user_agent: user_agent
        )
      end
    end
  end
end
