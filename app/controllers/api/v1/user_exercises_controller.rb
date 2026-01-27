# frozen_string_literal: true

module Api
  module V1
    class UserExercisesController < BaseController
      before_action :authenticate_user!

      # Category mapping from Japanese (DB) to English (frontend)
      CATEGORY_MAP = {
        '筋力' => 'lower_body',
        'バランス' => 'core',
        '柔軟性' => 'stretch'
      }.freeze

      # GET /api/v1/users/me/exercises
      # Returns assigned exercises for the current user
      def index
        patient_exercises = current_user
          .patient_exercises
          .active
          .includes(:exercise)

        exercises = patient_exercises.map do |pe|
          ex = pe.exercise
          {
            id: ex.id,
            name: ex.name,
            description: ex.description.to_s,
            video_url: ex.video_url,
            thumbnail_url: ex.thumbnail_url,
            sets: pe.target_sets || ex.recommended_sets || 1,
            reps: pe.target_reps || ex.recommended_reps || 1,
            duration_seconds: ex.duration_seconds,
            category: CATEGORY_MAP[ex.category] || 'lower_body'
          }
        end

        render_success({ exercises: exercises })
      end
    end
  end
end
