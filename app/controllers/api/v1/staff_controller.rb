# frozen_string_literal: true

module Api
  module V1
    class StaffController < BaseController
      before_action :require_manager!

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
      end

      private

      ALLOWED_ROLES = %w[manager staff].freeze

      def staff_params
        permitted = params.permit(:staff_id, :name, :name_kana, :email, :password, :department)
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
    end
  end
end
