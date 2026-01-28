# frozen_string_literal: true

module Api
  module V1
    class PatientsController < BaseController
      before_action :authenticate_staff!, except: [ :create ]
      before_action :require_manager!, only: [ :create ]
      before_action :set_patient, only: [ :show, :update ]
      before_action :authorize_patient_access!, only: [ :show, :update ]

      # GET /api/v1/patients
      def index
        patients = fetch_patients
        patients = apply_filters(patients)
        patients = apply_search(patients)

        paginated = paginate(patients)

        log_audit("read", "success")

        render_success({
          patients: serialize_patients(paginated),
          meta: pagination_meta(patients, paginated)
        })
      end

      # GET /api/v1/patients/:id
      def show
        log_audit("read", "success", resource_id: @patient.id)

        render_success(serialize_patient_detail(@patient))
      end

      # POST /api/v1/patients
      def create
        patient = User.new(patient_create_params)

        if patient.save
          log_audit("create", "success", resource_id: patient.id)

          render json: {
            status: "success",
            data: {
              id: patient.id,
              user_code: patient.user_code,
              name: patient.name,
              email: patient.email,
              status: patient.status,
              message: "患者を登録しました。初期パスワードは別途お知らせください。"
            }
          }, status: :created
        else
          render_error(
            "バリデーションエラー",
            errors: patient.errors.to_hash,
            status: :unprocessable_entity
          )
        end
      end

      # PATCH /api/v1/patients/:id
      def update
        if @patient.update(patient_update_params)
          log_audit("update", "success", resource_id: @patient.id)

          render_success(serialize_patient_detail(@patient))
        else
          render_error(
            "バリデーションエラー",
            errors: @patient.errors.to_hash,
            status: :unprocessable_entity
          )
        end
      end

      private

      def patient_update_params
        params.permit(
          :name, :name_kana, :email, :birth_date,
          :gender, :phone, :status, :condition
        )
      end

      def patient_create_params
        params.permit(
          :user_code, :name, :name_kana, :email, :birth_date,
          :password, :gender, :phone, :status, :condition
        )
      end

      def set_patient
        @patient = User.active.find(params[:id])
      end

      def authorize_patient_access!
        return if current_staff.manager?
        return if patient_assigned_to_current_staff?(@patient)

        render_forbidden("この患者へのアクセス権限がありません")
      end

      def fetch_patients
        if current_staff.manager?
          User.active
        else
          User.active.assigned_to(current_staff.id)
        end
      end

      def apply_filters(scope)
        scope = scope.by_status(params[:status]) if params[:status].present?
        scope
      end

      def apply_search(scope)
        return scope unless params[:search].present?

        # Search by name and name_kana (encrypted fields - need Ruby-level filtering)
        search_term = params[:search].downcase
        scope.select do |user|
          user.name&.downcase&.include?(search_term) ||
            user.name_kana&.downcase&.include?(search_term)
        end
      end

      def paginate(patients)
        # Convert to array if it's a relation that was filtered with select block
        patients_array = patients.is_a?(Array) ? patients : patients.to_a
        page = [ params[:page].to_i, 1 ].max
        per_page_param = params[:per_page].to_i
        per_page = per_page_param.positive? ? [ per_page_param, 100 ].min : 20

        start_index = (page - 1) * per_page
        patients_array.slice(start_index, per_page) || []
      end

      def pagination_meta(all_patients, paginated)
        total = all_patients.is_a?(Array) ? all_patients.length : all_patients.count
        per_page_param = params[:per_page].to_i
        per_page = per_page_param.positive? ? [ per_page_param, 100 ].min : 20
        page = [ params[:page].to_i, 1 ].max

        {
          total: total,
          page: page,
          per_page: per_page,
          total_pages: (total.to_f / per_page).ceil
        }
      end

      def serialize_patients(patients)
        patients.map do |patient|
          {
            id: patient.id,
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            status: patient.status,
            condition: patient.condition,
            assigned_staff: primary_staff_name(patient)
          }
        end
      end

      def serialize_patient_detail(patient)
        {
          id: patient.id,
          name: patient.name,
          name_kana: patient.name_kana,
          birth_date: patient.birth_date,
          age: patient.age,
          gender: patient.gender,
          email: patient.email,
          phone: patient.phone,
          condition: patient.condition,
          status: patient.status,
          continue_days: patient.continue_days,
          assigned_staff: serialize_assigned_staff(patient)
        }
      end

      def serialize_assigned_staff(patient)
        patient.patient_staff_assignments.includes(:staff).map do |assignment|
          {
            id: assignment.staff.id,
            name: assignment.staff.name,
            is_primary: assignment.is_primary
          }
        end
      end

      def primary_staff_name(patient)
        assignment = patient.patient_staff_assignments.find_by(is_primary: true)
        assignment ||= patient.patient_staff_assignments.first
        assignment&.staff&.name
      end

      def patient_assigned_to_current_staff?(patient)
        patient.patient_staff_assignments.exists?(staff_id: current_staff.id)
      end

      def log_audit(action, status, resource_id: nil)
        AuditLog.create!(
          user_type: "staff",
          staff_id: current_staff.id,
          action: action,
          status: status,
          ip_address: client_ip,
          user_agent: user_agent,
          additional_info: { resource_type: "Patient", resource_id: resource_id }.to_json
        )
      end
    end
  end
end
