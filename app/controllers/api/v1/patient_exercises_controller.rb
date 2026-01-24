# frozen_string_literal: true

module Api
  module V1
    class PatientExercisesController < BaseController
      before_action :authenticate_staff!
      before_action :set_patient
      before_action :authorize_patient_access!
      before_action :validate_exercise_id, only: [:create]
      before_action :set_exercise, only: [:create]

      # POST /api/v1/patients/:patient_id/exercises
      def create
        @patient_exercise = PatientExercise.new(patient_exercise_params)
        @patient_exercise.user = @patient
        @patient_exercise.exercise = @exercise
        @patient_exercise.assigned_by_staff = current_staff
        @patient_exercise.assigned_at = Time.current

        @patient_exercise.save!

        log_audit('create', 'success')

        render_success(serialize_patient_exercise(@patient_exercise), status: :created)
      end

      private

      def set_patient
        @patient = User.active.find(params[:patient_id])
      end

      def validate_exercise_id
        return if params[:exercise_id].present?

        render_error('exercise_idは必須です', status: :unprocessable_entity)
      end

      def set_exercise
        @exercise = Exercise.find(params[:exercise_id])
      end

      def authorize_patient_access!
        return if current_staff.manager?
        return if patient_assigned_to_current_staff?

        render_forbidden('この患者へのアクセス権限がありません')
      end

      def patient_assigned_to_current_staff?
        @patient.patient_staff_assignments.exists?(staff_id: current_staff.id)
      end

      def patient_exercise_params
        params.permit(:target_reps, :target_sets)
      end

      def serialize_patient_exercise(patient_exercise)
        {
          id: patient_exercise.id,
          exercise_id: patient_exercise.exercise_id,
          target_reps: patient_exercise.target_reps,
          target_sets: patient_exercise.target_sets,
          assigned_at: patient_exercise.assigned_at.iso8601
        }
      end

      def log_audit(action, status)
        AuditLog.create!(
          user_type: 'staff',
          staff_id: current_staff.id,
          action: action,
          status: status,
          ip_address: client_ip,
          user_agent: user_agent,
          additional_info: {
            resource_type: 'PatientExercise',
            patient_id: @patient.id,
            exercise_id: @exercise&.id
          }.to_json
        )
      end
    end
  end
end
