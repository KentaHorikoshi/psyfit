# frozen_string_literal: true

# UserMeasurements API Controller
# Handles measurement retrieval for the currently logged-in user
module Api
  module V1
    class UserMeasurementsController < BaseController
      before_action :authenticate_user!

      # GET /api/v1/users/me/measurements
      # Returns measurement history for the current user with optional date filtering
      def index
        measurements = current_user.measurements.recent

        measurements = apply_date_filters(measurements)

        render_success({ measurements: measurements.map { |m| measurement_response(m) } })
      end

      private

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

      def apply_date_filters(measurements)
        if params[:start_date].present?
          measurements = measurements.where('measured_date >= ?', params[:start_date])
        end

        if params[:end_date].present?
          measurements = measurements.where('measured_date <= ?', params[:end_date])
        end

        measurements
      end
    end
  end
end
