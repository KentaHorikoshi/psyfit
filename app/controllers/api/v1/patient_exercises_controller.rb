# frozen_string_literal: true

module Api
  module V1
    class PatientExercisesController < BaseController
      before_action :authenticate_staff!
      before_action :set_patient
      before_action :authorize_patient_access!

      # GET /api/v1/patients/:patient_id/exercises
      def index
        patient_exercises = @patient.patient_exercises.active.includes(:exercise, :assigned_by_staff)

        assignments = patient_exercises.map do |pe|
          {
            id: pe.id,
            patient_id: pe.user_id,
            exercise_id: pe.exercise_id,
            sets: pe.target_sets || pe.exercise.recommended_sets || 3,
            reps: pe.target_reps || pe.exercise.recommended_reps || 10,
            daily_frequency: pe.daily_frequency,
            pain_flag: false,
            reason: "",
            assigned_at: pe.assigned_at.iso8601,
            assigned_by: pe.assigned_by_staff&.name || ""
          }
        end

        render_success({ assignments: assignments })
      end

      # POST /api/v1/patients/:patient_id/exercises
      # 一括割り当て対応: assignments配列を受け取り、既存を非アクティブ化して新規作成
      def create
        assignments_params = params[:assignments]

        # 配列かどうかチェック（ActionController::Parametersの場合も考慮）
        assignments_array = normalize_assignments(assignments_params)

        if assignments_array.blank?
          return render_error("assignmentsは必須です", status: :unprocessable_content)
        end

        created_exercises = []

        ActiveRecord::Base.transaction do
          # 既存の割り当てを非アクティブ化
          @patient.patient_exercises.active.update_all(is_active: false)

          # 新しい割り当てを作成
          assignments_array.each do |assignment|
            exercise_id = assignment["exercise_id"] || assignment[:exercise_id]
            exercise = Exercise.find(exercise_id)

            daily_freq = assignment["daily_frequency"] || assignment[:daily_frequency] || 1

            patient_exercise = PatientExercise.new(
              user: @patient,
              exercise: exercise,
              assigned_by_staff: current_staff,
              assigned_at: Time.current,
              target_sets: assignment["sets"] || assignment[:sets],
              target_reps: assignment["reps"] || assignment[:reps],
              daily_frequency: daily_freq.to_i,
              is_active: true
            )

            patient_exercise.save!
            created_exercises << patient_exercise
          end
        end

        # Update next visit date if provided
        if params[:next_visit_date].present?
          @patient.update_next_visit_date!(params[:next_visit_date])
        end

        log_audit("create", "success", created_exercises.map(&:exercise_id))

        render_success({
          assignments: created_exercises.map { |pe| serialize_patient_exercise(pe) }
        }, status: :created)
      end

      private

      def set_patient
        @patient = User.active.find(params[:patient_id])
      end

      def authorize_patient_access!
        return if current_staff.manager?
        return if patient_assigned_to_current_staff?

        render_forbidden("この患者へのアクセス権限がありません")
      end

      def patient_assigned_to_current_staff?
        @patient.patient_staff_assignments.exists?(staff_id: current_staff.id)
      end

      def normalize_assignments(assignments_params)
        return [] if assignments_params.blank?

        # ActionController::Parametersや配列を正規化
        if assignments_params.respond_to?(:to_a)
          assignments_params.to_a
        elsif assignments_params.is_a?(Array)
          assignments_params
        else
          []
        end
      end

      def serialize_patient_exercise(patient_exercise)
        {
          id: patient_exercise.id,
          exercise_id: patient_exercise.exercise_id,
          target_reps: patient_exercise.target_reps,
          target_sets: patient_exercise.target_sets,
          daily_frequency: patient_exercise.daily_frequency,
          assigned_at: patient_exercise.assigned_at.iso8601
        }
      end

      def log_audit(action, status, exercise_ids = [])
        AuditLog.create!(
          user_type: "staff",
          staff_id: current_staff.id,
          action: action,
          status: status,
          ip_address: client_ip,
          user_agent: user_agent,
          additional_info: {
            resource_type: "PatientExercise",
            patient_id: @patient.id,
            exercise_ids: exercise_ids
          }.to_json
        )
      end
    end
  end
end
