# frozen_string_literal: true

# Staff-facing API for viewing patient daily condition records
# Provides read-only access with proper authorization and audit logging
module Api
  module V1
    class PatientDailyConditionsController < BaseController
      before_action :authenticate_staff!
      before_action :set_patient
      before_action :authorize_patient_access!

      # GET /api/v1/patients/:patient_id/daily_conditions
      def index
        conditions = @patient.daily_conditions.recent

        if date_filter_params?
          conditions = conditions.between_dates(
            params[:start_date].to_date,
            params[:end_date].to_date
          )
        end

        AuditLog.log_action(
          action: "read",
          status: "success",
          staff: current_staff,
          ip_address: client_ip,
          user_agent: user_agent,
          additional_info: {
            resource_type: "DailyCondition",
            patient_id: @patient.id
          }.to_json
        )

        render_success({
          conditions: conditions.map { |c| condition_response(c) }
        })
      rescue Date::Error, ArgumentError
        render_error("日付の形式が正しくありません", status: :unprocessable_entity)
      end

      private

      def set_patient
        @patient = User.active.find(params[:patient_id])
      end

      def authorize_patient_access!
        return if current_staff.manager?
        return if @patient.patient_staff_assignments.exists?(staff_id: current_staff.id)

        render_forbidden("この患者へのアクセス権限がありません")
      end

      def date_filter_params?
        params[:start_date].present? && params[:end_date].present?
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
    end
  end
end
