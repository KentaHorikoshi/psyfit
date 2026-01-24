# frozen_string_literal: true

module Api
  module V1
    class PatientReportsController < BaseController
      before_action :authenticate_staff!
      before_action :set_patient
      before_action :authorize_patient_access!
      before_action :validate_date_params

      # GET /api/v1/patients/:patient_id/report
      def show
        pdf = PatientReportService.new(
          patient: @patient,
          start_date: report_start_date,
          end_date: report_end_date,
          generated_by: current_staff
        ).generate

        log_audit('read', 'success', resource_id: @patient.id)

        send_data pdf,
                  filename: report_filename,
                  type: 'application/pdf',
                  disposition: 'attachment'
      end

      private

      def set_patient
        @patient = User.active.find(params[:patient_id])
      end

      def authorize_patient_access!
        return if current_staff.manager?
        return if patient_assigned_to_current_staff?(@patient)

        render_forbidden('この患者へのアクセス権限がありません')
      end

      def validate_date_params
        return unless params[:start_date].present? && params[:end_date].present?

        start_date = Date.parse(params[:start_date])
        end_date = Date.parse(params[:end_date])

        if start_date > end_date
          render_error('開始日付は終了日付より前である必要があります', status: :unprocessable_entity)
        end
      rescue ArgumentError
        render_error('日付の形式が正しくありません', status: :unprocessable_entity)
      end

      def report_start_date
        params[:start_date].present? ? Date.parse(params[:start_date]) : 30.days.ago.to_date
      end

      def report_end_date
        params[:end_date].present? ? Date.parse(params[:end_date]) : Date.current
      end

      def report_filename
        sanitized_name = @patient.name.gsub(/[^\p{Han}\p{Hiragana}\p{Katakana}a-zA-Z0-9]/, '_')
        "patient_report_#{sanitized_name}_#{report_start_date}_#{report_end_date}.pdf"
      end

      def patient_assigned_to_current_staff?(patient)
        patient.patient_staff_assignments.exists?(staff_id: current_staff.id)
      end

      def log_audit(action, status, resource_id: nil)
        AuditLog.create!(
          user_type: 'staff',
          staff_id: current_staff.id,
          action: action,
          status: status,
          ip_address: client_ip,
          user_agent: user_agent,
          additional_info: {
            resource_type: 'PatientReport',
            resource_id: resource_id,
            start_date: report_start_date,
            end_date: report_end_date
          }.to_json
        )
      end
    end
  end
end
