# frozen_string_literal: true

module Api
  module V1
    class ExerciseRecordsController < BaseController
      before_action :authenticate_user!

      # POST /api/v1/exercise_records
      def create
        if params[:exercise_id].blank?
          render_error('バリデーションエラー', errors: { exercise_id: ['を入力してください'] }, status: :unprocessable_entity)
          return
        end

        exercise = Exercise.find(params[:exercise_id])

        record = current_user.exercise_records.build(exercise_record_params)
        record.exercise = exercise

        if record.save
          current_user.update_continue_days!
          log_create_action(record)
          render_success(record_response(record), status: :created)
        else
          render_error('バリデーションエラー', errors: record.errors.to_hash, status: :unprocessable_entity)
        end
      end

      # GET /api/v1/users/me/exercise_records
      def index
        records = filter_by_date(current_user.exercise_records.includes(:exercise).recent)

        render_success({
          records: records.map { |r| record_with_exercise(r) },
          summary: build_summary(records)
        })
      end

      private

      def exercise_record_params
        params.permit(:completed_reps, :completed_sets, :duration_seconds, :completed_at, :notes)
      end

      def filter_by_date(records)
        records = records.where('completed_at >= ?', Date.parse(params[:start_date]).beginning_of_day) if params[:start_date].present?
        records = records.where('completed_at <= ?', Date.parse(params[:end_date]).end_of_day) if params[:end_date].present?
        records
      end

      def record_response(record)
        {
          id: record.id,
          exercise_id: record.exercise_id,
          completed_reps: record.completed_reps,
          completed_sets: record.completed_sets,
          completed_at: record.completed_at.iso8601
        }
      end

      def record_with_exercise(record)
        {
          id: record.id,
          exercise: {
            id: record.exercise.id,
            name: record.exercise.name
          },
          completed_reps: record.completed_reps,
          completed_sets: record.completed_sets,
          completed_at: record.completed_at.iso8601
        }
      end

      def build_summary(records)
        total_seconds = records.sum(:duration_seconds) || 0
        {
          total_exercises: records.count,
          total_minutes: total_seconds / 60,
          continue_days: current_user.continue_days
        }
      end

      def log_create_action(record)
        AuditLog.log_action(
          action: 'create',
          status: 'success',
          user: current_user,
          ip_address: client_ip,
          user_agent: user_agent,
          additional_info: { record_id: record.id, exercise_id: record.exercise_id }.to_json
        )
      end
    end
  end
end
