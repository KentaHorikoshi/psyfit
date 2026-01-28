# frozen_string_literal: true

module Api
  module V1
    class ExerciseMastersController < BaseController
      before_action :authenticate_staff!

      # GET /api/v1/exercise_masters
      def index
        exercises = Exercise.all
        exercises = exercises.by_category(params[:category]) if params[:category].present?
        exercises = exercises.by_difficulty(params[:difficulty]) if params[:difficulty].present?

        log_audit("read", "success")

        render_success({ exercises: serialize_exercises(exercises) })
      end

      private

      def serialize_exercises(exercises)
        exercises.map do |exercise|
          {
            id: exercise.id,
            name: exercise.name,
            description: exercise.description,
            category: exercise.category,
            difficulty: exercise.difficulty,
            recommended_reps: exercise.recommended_reps,
            recommended_sets: exercise.recommended_sets,
            video_url: exercise.video_url,
            thumbnail_url: exercise.thumbnail_url,
            duration_seconds: exercise.duration_seconds
          }
        end
      end

      def log_audit(action, status)
        AuditLog.create!(
          user_type: "staff",
          staff_id: current_staff.id,
          action: action,
          status: status,
          ip_address: client_ip,
          user_agent: user_agent,
          additional_info: { resource_type: "Exercise" }.to_json
        )
      end
    end
  end
end
