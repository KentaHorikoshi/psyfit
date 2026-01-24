# frozen_string_literal: true

# Measurements API Controller
# Handles physical measurements recorded by staff for patients
module Api
  module V1
    class MeasurementsController < BaseController
      before_action :authenticate_staff!
      before_action :set_patient

      # GET /api/v1/patients/:patient_id/measurements
      # Returns measurement history for a patient with optional date filtering
      def index
        measurements = @patient.measurements.recent

        measurements = apply_date_filters(measurements)

        log_audit_read_success
        render_success({ measurements: measurements.map { |m| measurement_response(m) } })
      end

      # POST /api/v1/patients/:patient_id/measurements
      # Creates a new measurement record for a patient
      def create
        @measurement = @patient.measurements.build(measurement_params)
        @measurement.measured_by_staff = current_staff

        if @measurement.save
          log_audit_success
          render_success(measurement_response(@measurement), status: :created)
        else
          render_error(
            "バリデーションエラー",
            errors: @measurement.errors.to_hash,
            status: :unprocessable_entity
          )
        end
      end

      private

      def set_patient
        @patient = User.active.find(params[:patient_id])
      end

      def measurement_params
        params.permit(
          :measured_date,
          :weight_kg,
          :knee_extension_strength_left,
          :knee_extension_strength_right,
          :tug_seconds,
          :single_leg_stance_seconds,
          :nrs_pain_score,
          :mmt_score,
          :notes
        )
      end

      def measurement_response(measurement)
        {
          id: measurement.id,
          measured_date: measurement.measured_date.to_s,
          weight_kg: measurement.weight_kg&.to_s,
          knee_extension_strength_left: measurement.knee_extension_strength_left&.to_s,
          knee_extension_strength_right: measurement.knee_extension_strength_right&.to_s,
          tug_seconds: measurement.tug_seconds&.to_s,
          single_leg_stance_seconds: measurement.single_leg_stance_seconds&.to_s,
          nrs_pain_score: measurement.nrs_pain_score,
          mmt_score: measurement.mmt_score,
          notes: measurement.notes
        }
      end

      def log_audit_success
        AuditLog.log_action(
          action: "create",
          status: "success",
          staff: current_staff,
          ip_address: client_ip,
          user_agent: user_agent,
          additional_info: {
            resource_type: "Measurement",
            resource_id: @measurement.id,
            patient_id: @patient.id
          }.to_json
        )
      end

      def log_audit_read_success
        AuditLog.log_action(
          action: "read",
          status: "success",
          staff: current_staff,
          ip_address: client_ip,
          user_agent: user_agent,
          additional_info: {
            resource_type: "Measurement",
            patient_id: @patient.id
          }.to_json
        )
      end

      def apply_date_filters(measurements)
        if params[:start_date].present?
          measurements = measurements.where("measured_date >= ?", params[:start_date])
        end

        if params[:end_date].present?
          measurements = measurements.where("measured_date <= ?", params[:end_date])
        end

        measurements
      end
    end
  end
end
