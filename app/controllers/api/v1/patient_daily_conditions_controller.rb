# frozen_string_literal: true

# Staff-facing API for managing patient daily condition records
# Provides CRUD access with proper authorization and audit logging
module Api
  module V1
    class PatientDailyConditionsController < BaseController
      before_action :authenticate_staff!
      before_action :set_patient
      before_action :authorize_patient_access!
      before_action :set_condition, only: [ :show, :update, :destroy ]

      # GET /api/v1/patients/:patient_id/daily_conditions
      def index
        conditions = @patient.daily_conditions.recent

        if date_filter_params?
          conditions = conditions.between_dates(
            params[:start_date].to_date,
            params[:end_date].to_date
          )
        end

        log_audit("read")

        render_success({
          conditions: conditions.map { |c| condition_response(c) }
        })
      rescue Date::Error, ArgumentError
        render_error("日付の形式が正しくありません", status: :unprocessable_content)
      end

      # GET /api/v1/patients/:patient_id/daily_conditions/:id
      def show
        log_audit("read", @condition.id)

        render_success({ condition: condition_response(@condition) })
      end

      # POST /api/v1/patients/:patient_id/daily_conditions
      def create
        @condition = @patient.daily_conditions.build(condition_params)

        if @condition.save
          log_audit("create", @condition.id)
          render_success({ condition: condition_response(@condition) }, status: :created)
        else
          render_error("バリデーションエラー", errors: @condition.errors.to_hash, status: :unprocessable_content)
        end
      end

      # PATCH /api/v1/patients/:patient_id/daily_conditions/:id
      def update
        if @condition.update(condition_params)
          log_audit("update", @condition.id)
          render_success({ condition: condition_response(@condition) })
        else
          render_error("バリデーションエラー", errors: @condition.errors.to_hash, status: :unprocessable_content)
        end
      end

      # DELETE /api/v1/patients/:patient_id/daily_conditions/:id
      def destroy
        @condition.destroy!
        log_audit("delete", @condition.id)

        render_success({ message: "体調データを削除しました" })
      end

      private

      def set_patient
        @patient = User.active.find(params[:patient_id])
      end

      def set_condition
        @condition = @patient.daily_conditions.find(params[:id])
      end

      def authorize_patient_access!
        return if current_staff.manager?
        return if @patient.patient_staff_assignments.exists?(staff_id: current_staff.id)

        render_forbidden("この患者へのアクセス権限がありません")
      end

      def date_filter_params?
        params[:start_date].present? && params[:end_date].present?
      end

      def condition_params
        params.permit(:recorded_date, :pain_level, :body_condition, :notes)
      end

      def condition_response(condition)
        {
          id: condition.id,
          recorded_date: condition.recorded_date.to_s,
          pain_level: condition.pain_level,
          body_condition: condition.body_condition,
          notes: condition.notes
        }
      end

      def log_audit(action, resource_id = nil)
        AuditLog.log_action(
          action: action,
          status: "success",
          staff: current_staff,
          ip_address: client_ip,
          user_agent: user_agent,
          additional_info: {
            resource_type: "DailyCondition",
            resource_id: resource_id,
            patient_id: @patient.id
          }.to_json
        )
      end
    end
  end
end
