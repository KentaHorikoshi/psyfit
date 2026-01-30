# frozen_string_literal: true

module Api
  module V1
    class ExercisesController < BaseController
      before_action :authenticate_user!
      before_action :set_exercise, only: [:show]
      before_action :authorize_exercise_access, only: [:show]

      # GET /api/v1/exercises/:id
      def show
        log_audit("read", "success")

        render_success({ exercise: serialize_exercise(@exercise) })
      end

      private

      def set_exercise
        @exercise = Exercise.find(params[:id])
      end

      def authorize_exercise_access
        assigned = PatientExercise.exists?(
          user_id: current_user.id,
          exercise_id: @exercise.id,
          is_active: true
        )

        return if assigned

        render_forbidden("この運動へのアクセス権限がありません")
      end

      def serialize_exercise(exercise)
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

      def log_audit(action, status)
        AuditLog.create!(
          user_type: "user",
          user_id: current_user.id,
          action: action,
          status: status,
          ip_address: client_ip,
          user_agent: user_agent,
          additional_info: {
            resource_type: "Exercise",
            exercise_id: @exercise.id
          }.to_json
        )
      end
    end
  end
end
