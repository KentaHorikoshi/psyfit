# frozen_string_literal: true

module Api
  module V1
    class StaffController < BaseController
      before_action :require_manager!, except: [ :change_password, :options ]
      before_action :authenticate_staff!, only: [ :change_password, :options ]
      before_action :set_staff_member, only: [ :show, :update, :destroy, :assigned_patients, :update_assigned_patients ]

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

      # GET /api/v1/staff/options
      # Returns minimal staff list for dropdown filters (accessible to all authenticated staff)
      def options
        staff_members = Staff.active.order(:name)

        render_success({
          staff_options: staff_members.map { |s| { id: s.id, name: s.name } }
        })
      end

      # GET /api/v1/staff
      def index
        staff_members = Staff.active.order(:staff_id)

        log_audit("read", "success")

        render_success({
          staff: serialize_staff_list(staff_members)
        })
      end

      # GET /api/v1/staff/:id
      def show
        log_audit("read", "success", resource_id: @staff_member.id)

        render_success(serialize_staff_detail(@staff_member))
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

      # PATCH /api/v1/staff/:id
      def update
        if @staff_member.update(staff_update_params)
          log_audit("update", "success", resource_id: @staff_member.id)
          render_success(serialize_staff_detail(@staff_member))
        else
          render_error(
            "バリデーションエラー",
            errors: @staff_member.errors.to_hash,
            status: :unprocessable_entity
          )
        end
      end

      # DELETE /api/v1/staff/:id
      def destroy
        if @staff_member.id == current_staff.id
          return render_error("自分自身を削除することはできません", status: :unprocessable_entity)
        end

        @staff_member.soft_delete
        log_audit("delete", "success", resource_id: @staff_member.id)
        render_success({ message: "職員を削除しました" })
      end

      # GET /api/v1/staff/:id/assigned_patients
      def assigned_patients
        assignments = @staff_member.patient_staff_assignments.includes(:user)
        patients = assignments.map do |a|
          { id: a.user.id, name: a.user.name, is_primary: a.is_primary }
        end

        render_success({ patients: patients })
      end

      # PUT /api/v1/staff/:id/assigned_patients
      def update_assigned_patients
        patient_ids = params[:patient_ids] || []

        ActiveRecord::Base.transaction do
          @staff_member.patient_staff_assignments.destroy_all
          patient_ids.each do |pid|
            @staff_member.patient_staff_assignments.create!(
              user_id: pid,
              assigned_at: Time.current,
              is_primary: false
            )
          end
        end

        log_audit("update", "success", resource_id: @staff_member.id)
        render_success({ message: "担当患者を更新しました" })
      rescue ActiveRecord::RecordInvalid => e
        render_error(e.message, status: :unprocessable_entity)
      end

      private

      ALLOWED_ROLES = %w[manager staff].freeze

      def set_staff_member
        @staff_member = Staff.active.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_error("職員が見つかりません", status: :not_found)
      end

      def staff_params
        permitted = params.permit(:name, :name_kana, :email, :password, :department)
        permitted[:role] = sanitized_role if params[:role].present?
        permitted
      end

      def staff_update_params
        permitted = params.permit(:name, :name_kana, :email, :department)
        permitted[:role] = sanitized_role if params[:role].present?
        permitted
      end

      def sanitized_role
        params[:role]
      end

      def serialize_staff_list(staff_members)
        staff_members.map { |s| serialize_staff(s) }
      end

      def serialize_staff(staff)
        {
          id: staff.id,
          staff_id: staff.staff_id,
          name: staff.name,
          name_kana: staff.name_kana,
          email: staff.email,
          role: staff.role,
          department: staff.department,
          created_at: staff.created_at&.iso8601
        }
      end

      def serialize_staff_detail(staff)
        serialize_staff(staff).merge(
          assigned_patients: staff.patient_staff_assignments.includes(:user).map do |a|
            { id: a.user.id, name: a.user.name, is_primary: a.is_primary }
          end
        )
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
