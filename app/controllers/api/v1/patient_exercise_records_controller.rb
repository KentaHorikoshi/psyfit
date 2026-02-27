# frozen_string_literal: true

# Staff-facing API for viewing patient exercise records
# Provides read-only access with proper authorization and audit logging
module Api
  module V1
    class PatientExerciseRecordsController < BaseController
      before_action :authenticate_staff!
      before_action :set_patient
      before_action :authorize_patient_access!

      # GET /api/v1/patients/:patient_id/exercise_records
      def index
        records = @patient.exercise_records.includes(:exercise).recent

        records = filter_by_date(records) if date_filter_params?

        AuditLog.log_action(
          action: "read",
          status: "success",
          staff: current_staff,
          ip_address: client_ip,
          user_agent: user_agent,
          additional_info: {
            resource_type: "ExerciseRecord",
            patient_id: @patient.id
          }.to_json
        )

        render_success({
          records: records.map { |r| record_response(r) },
          summary: {
            total_records: records.count
          }
        })
      rescue Date::Error, ArgumentError
        render_error("日付の形式が正しくありません", status: :unprocessable_content)
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

      def filter_by_date(records)
        start_date = Date.parse(params[:start_date]).beginning_of_day
        end_date = Date.parse(params[:end_date]).end_of_day
        records.where(completed_at: start_date..end_date)
      end

      def record_response(record)
        {
          id: record.id,
          exercise_name: record.exercise.name,
          exercise_type: record.exercise.exercise_type,
          completed_at: record.completed_at.iso8601,
          completed_reps: record.completed_reps,
          completed_sets: record.completed_sets
        }
      end
    end
  end
end
