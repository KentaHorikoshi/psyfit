# frozen_string_literal: true

module Api
  module V1
    class DashboardController < BaseController
      before_action :authenticate_staff!

      # GET /api/v1/dashboard/stats
      def stats
        patient_ids = assigned_patient_ids

        today_appointments = User.active
          .where(id: patient_ids, next_visit_date: Date.current)
          .count

        weekly_exercises = ExerciseRecord
          .this_week
          .where(user_id: patient_ids)
          .count

        log_audit("read", "success")

        render_success({
          today_appointments_count: today_appointments,
          weekly_exercises_count: weekly_exercises
        })
      end

      private

      def assigned_patient_ids
        User.active.pluck(:id)
      end

      def log_audit(action, status)
        AuditLog.create!(
          user_type: "staff",
          staff_id: current_staff.id,
          action: action,
          status: status,
          ip_address: client_ip,
          user_agent: user_agent,
          additional_info: { resource_type: "DashboardStats" }.to_json
        )
      end
    end
  end
end
