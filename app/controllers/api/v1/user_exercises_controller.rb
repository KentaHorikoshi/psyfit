# frozen_string_literal: true

module Api
  module V1
    class UserExercisesController < BaseController
      before_action :authenticate_user!

      # Exercise type mapping from Japanese (DB) to English (frontend)
      EXERCISE_TYPE_MAP = {
        "\u30B9\u30C8\u30EC\u30C3\u30C1" => "stretch",
        "\u30C8\u30EC\u30FC\u30CB\u30F3\u30B0" => "training",
        "\u307B\u3050\u3059" => "massage",
        "\u30D0\u30E9\u30F3\u30B9" => "balance"
      }.freeze

      # GET /api/v1/users/me/exercises
      # Returns assigned exercises for the current user
      def index
        patient_exercises = current_user
          .patient_exercises
          .active
          .includes(:exercise)

        today_exercise_ids = ExerciseRecord
          .where(user_id: current_user.id)
          .where("completed_at >= ?", Time.current.beginning_of_day)
          .pluck(:exercise_id)
          .to_set

        assigned_exercises = patient_exercises.map do |pe|
          ex = pe.exercise
          {
            id: pe.id,
            target_reps: pe.target_reps,
            target_sets: pe.target_sets,
            completed_today: today_exercise_ids.include?(ex.id),
            exercise: {
              id: ex.id,
              name: ex.name,
              description: ex.description.to_s,
              video_url: ex.video_url,
              thumbnail_url: ex.thumbnail_url,
              duration_seconds: ex.duration_seconds,
              exercise_type: EXERCISE_TYPE_MAP[ex.exercise_type] || "training"
            }
          }
        end

        render_success({ exercises: assigned_exercises })
      end
    end
  end
end
