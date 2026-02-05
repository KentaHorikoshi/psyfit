# frozen_string_literal: true

module Api
  module V1
    class ExercisesController < BaseController
      before_action :authenticate_user!
      before_action :set_exercise, only: [:show]
      before_action :authorize_exercise_access, only: [:show]

      # Category mapping from Japanese (DB) to English (frontend)
      CATEGORY_MAP = {
        '筋力' => 'lower_body',
        'バランス' => 'core',
        '柔軟性' => 'stretch'
      }.freeze

      # GET /api/v1/exercises/:id
      def show
        log_audit("read", "success")

        render_success(serialize_exercise(@exercise, @patient_exercise))
      end

      private

      def set_exercise
        @exercise = Exercise.find(params[:id])
      end

      def authorize_exercise_access
        @patient_exercise = PatientExercise.find_by(
          user_id: current_user.id,
          exercise_id: @exercise.id,
          is_active: true
        )

        return if @patient_exercise

        render_forbidden("この運動へのアクセス権限がありません")
      end

      def serialize_exercise(exercise, patient_exercise)
        {
          id: exercise.id,
          name: exercise.name,
          description: exercise.description.to_s,
          video_url: exercise.video_url,
          thumbnail_url: exercise.thumbnail_url,
          sets: patient_exercise&.target_sets || exercise.recommended_sets || 1,
          reps: patient_exercise&.target_reps || exercise.recommended_reps || 1,
          duration_seconds: exercise.duration_seconds,
          category: CATEGORY_MAP[exercise.category] || 'lower_body'
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
