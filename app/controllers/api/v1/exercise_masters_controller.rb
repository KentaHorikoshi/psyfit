# frozen_string_literal: true

module Api
  module V1
    class ExerciseMastersController < BaseController
      before_action :authenticate_staff!

      # GET /api/v1/exercise_masters
      def index
        exercises = Exercise.all
        exercises = exercises.by_exercise_type(params[:exercise_type]) if params[:exercise_type].present?
        exercises = exercises.by_body_part_major(params[:body_part_major]) if params[:body_part_major].present?
        exercises = exercises.by_body_part_minor(params[:body_part_minor]) if params[:body_part_minor].present?
        exercises = exercises.by_difficulty(params[:difficulty]) if params[:difficulty].present?

        log_audit("read", "success")

        render_success({ exercises: serialize_exercises(exercises) })
      end

      # POST /api/v1/exercise_masters
      def create
        exercise = Exercise.new(exercise_params)

        if exercise.save
          log_audit("create", "success", resource_id: exercise.id)
          render_success({ exercise: serialize_exercise(exercise) }, status: :created)
        else
          render_error(
            "バリデーションエラー",
            errors: exercise.errors.to_hash,
            status: :unprocessable_entity
          )
        end
      end

      # DELETE /api/v1/exercise_masters/:id
      def destroy
        exercise = Exercise.find(params[:id])

        if exercise.destroy
          log_audit("delete", "success", resource_id: exercise.id)
          render_success({ message: "運動を削除しました" })
        else
          log_audit("delete", "failure", resource_id: exercise.id)
          render_error(
            "この運動は患者に割り当てられているため削除できません",
            status: :unprocessable_entity
          )
        end
      rescue ActiveRecord::RecordNotFound
        render_error("運動が見つかりません", status: :not_found)
      end

      private

      def exercise_params
        params.permit(
          :name, :description, :exercise_type, :difficulty,
          :body_part_major, :body_part_minor,
          :recommended_reps, :recommended_sets,
          :video_url, :thumbnail_url, :duration_seconds
        )
      end

      def serialize_exercise(exercise)
        {
          id: exercise.id,
          name: exercise.name,
          description: exercise.description,
          exercise_type: exercise.exercise_type,
          difficulty: exercise.difficulty,
          body_part_major: exercise.body_part_major,
          body_part_minor: exercise.body_part_minor,
          recommended_reps: exercise.recommended_reps,
          recommended_sets: exercise.recommended_sets,
          video_url: exercise.video_url,
          thumbnail_url: exercise.thumbnail_url,
          duration_seconds: exercise.duration_seconds
        }
      end

      def serialize_exercises(exercises)
        exercises.map { |exercise| serialize_exercise(exercise) }
      end

      def log_audit(action, status, resource_id: nil)
        AuditLog.create!(
          user_type: "staff",
          staff_id: current_staff.id,
          action: action,
          status: status,
          ip_address: client_ip,
          user_agent: user_agent,
          additional_info: { resource_type: "Exercise", resource_id: resource_id }.compact.to_json
        )
      end
    end
  end
end
