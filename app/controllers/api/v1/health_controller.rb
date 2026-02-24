# frozen_string_literal: true

# Health check endpoint for connection testing
module Api
  module V1
    class HealthController < BaseController
      # GET /api/v1/health
      def show
        db_ok = database_healthy?

        status = db_ok ? :ok : :service_unavailable
        render json: {
          status: db_ok ? "success" : "error",
          data: {
            health_status: db_ok ? "healthy" : "degraded",
            timestamp: Time.current.iso8601,
            version: "1.0.0",
            checks: {
              database: db_ok ? "ok" : "error"
            }
          }
        }, status: status
      end

      private

      def database_healthy?
        ActiveRecord::Base.connection.execute("SELECT 1")
        true
      rescue StandardError
        false
      end
    end
  end
end
