# frozen_string_literal: true

module Api
  module V1
    class UserExercisesController < BaseController
      before_action :authenticate_user!

      # GET /api/v1/users/me/exercises
      # Returns assigned exercises for the current user
      def index
        patient_exercises = current_user
          .patient_exercises
          .active
          .includes(:exercise)

        # Get today's exercise records for completed_today calculation
        today_records = current_user
          .exercise_records
          .today
          .pluck(:exercise_id)

        assigned_exercises = patient_exercises.map do |pe|
          {
            id: pe.id,
            exercise: {
              id: pe.exercise.id,
              name: pe.exercise.name,
              video_url: pe.exercise.video_url,
              thumbnail_url: pe.exercise.thumbnail_url
            },
            target_reps: pe.target_reps,
            target_sets: pe.target_sets,
            completed_today: today_records.include?(pe.exercise_id)
          }
        end

        render_success({ assigned_exercises: assigned_exercises })
      end
    end
  end
end
