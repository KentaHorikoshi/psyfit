# frozen_string_literal: true

# Health check endpoint for connection testing
module Api
  module V1
    class HealthController < BaseController
      # GET /api/v1/health
      def show
        render_success({
          health_status: 'healthy',
          timestamp: Time.current.iso8601,
          version: '1.0.0'
        })
      end
    end
  end
end
