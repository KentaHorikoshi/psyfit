# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::PatientExercises', type: :request do
  let(:manager) { create(:staff, :manager) }
  let(:staff_member) { create(:staff) }
  let(:other_staff) { create(:staff) }

  let!(:patient) { create(:user) }
  let!(:other_patient) { create(:user) }
  let!(:exercise) { create(:exercise) }
  let!(:another_exercise) { create(:exercise) }

  describe 'POST /api/v1/patients/:patient_id/exercises' do
    # 一括割り当て形式（フロントエンドが使用する形式）
    let(:valid_params) do
      {
        assignments: [
          { exercise_id: exercise.id, sets: 3, reps: 10 }
        ],
        pain_flag: false,
        reason: ""
      }
    end

    let(:multiple_assignments_params) do
      {
        assignments: [
          { exercise_id: exercise.id, sets: 3, reps: 10 },
          { exercise_id: another_exercise.id, sets: 2, reps: 15 }
        ],
        pain_flag: false,
        reason: ""
      }
    end

    context 'when staff is authenticated' do
      context 'as manager' do
        before { staff_login(manager) }

        it 'can assign exercise to any patient' do
          post "/api/v1/patients/#{patient.id}/exercises", params: valid_params, as: :json

          expect(response).to have_http_status(:created)
          expect(json_response['status']).to eq('success')
        end

        it 'returns the created assignment data' do
          post "/api/v1/patients/#{patient.id}/exercises", params: valid_params, as: :json

          data = json_response['data']['assignments'].first
          expect(data['id']).to be_present
          expect(data['exercise_id']).to eq(exercise.id)
          expect(data['target_reps']).to eq(10)
          expect(data['target_sets']).to eq(3)
          expect(data['assigned_at']).to be_present
        end

        it 'creates a patient_exercise record' do
          expect {
            post "/api/v1/patients/#{patient.id}/exercises", params: valid_params, as: :json
          }.to change(PatientExercise, :count).by(1)
        end

        it 'creates multiple patient_exercise records for batch assignment' do
          expect {
            post "/api/v1/patients/#{patient.id}/exercises", params: multiple_assignments_params, as: :json
          }.to change(PatientExercise, :count).by(2)
        end

        it 'sets assigned_by_staff_id to current staff' do
          post "/api/v1/patients/#{patient.id}/exercises", params: valid_params, as: :json

          assignment = PatientExercise.last
          expect(assignment.assigned_by_staff_id).to eq(manager.id)
        end

        it 'creates audit log entry' do
          expect {
            post "/api/v1/patients/#{patient.id}/exercises", params: valid_params, as: :json
          }.to change(AuditLog, :count).by(1)

          audit = AuditLog.order(:created_at).last
          expect(audit.action).to eq('create')
          expect(audit.status).to eq('success')
          expect(audit.staff_id).to eq(manager.id)
        end

        context 'with next_visit_date' do
          let(:params_with_date) do
            {
              assignments: [
                { exercise_id: exercise.id, sets: 3, reps: 10 }
              ],
              pain_flag: false,
              reason: "",
              next_visit_date: "2026-03-15"
            }
          end

          it 'sets next_visit_date on the patient' do
            post "/api/v1/patients/#{patient.id}/exercises", params: params_with_date, as: :json

            expect(response).to have_http_status(:created)
            expect(patient.reload.next_visit_date).to eq(Date.parse('2026-03-15'))
          end

          it 'shifts existing next_visit_date to previous_visit_date' do
            patient.update!(next_visit_date: Date.parse('2026-02-01'))

            post "/api/v1/patients/#{patient.id}/exercises", params: params_with_date, as: :json

            patient.reload
            expect(patient.next_visit_date).to eq(Date.parse('2026-03-15'))
            expect(patient.previous_visit_date).to eq(Date.parse('2026-02-01'))
          end

          it 'does not update visit date when next_visit_date is not provided' do
            patient.update!(next_visit_date: Date.parse('2026-02-01'))

            post "/api/v1/patients/#{patient.id}/exercises", params: valid_params, as: :json

            expect(patient.reload.next_visit_date).to eq(Date.parse('2026-02-01'))
          end
        end

        context 'with optional parameters' do
          it 'allows target_reps to be nil' do
            post "/api/v1/patients/#{patient.id}/exercises", params: {
              assignments: [ { exercise_id: exercise.id, sets: 3 } ]
            }, as: :json

            expect(response).to have_http_status(:created)
            expect(json_response['data']['assignments'].first['target_reps']).to be_nil
          end

          it 'allows target_sets to be nil' do
            post "/api/v1/patients/#{patient.id}/exercises", params: {
              assignments: [ { exercise_id: exercise.id, reps: 10 } ]
            }, as: :json

            expect(response).to have_http_status(:created)
            expect(json_response['data']['assignments'].first['target_sets']).to be_nil
          end
        end

        context 'validation errors' do
          it 'returns error when assignments is missing' do
            post "/api/v1/patients/#{patient.id}/exercises", params: {
              pain_flag: false
            }, as: :json

            expect(response).to have_http_status(:unprocessable_entity)
          end

          it 'returns error when assignments is empty' do
            post "/api/v1/patients/#{patient.id}/exercises", params: {
              assignments: []
            }, as: :json

            expect(response).to have_http_status(:unprocessable_entity)
          end

          it 'returns error when exercise_id is invalid' do
            post "/api/v1/patients/#{patient.id}/exercises", params: {
              assignments: [
                { exercise_id: '00000000-0000-0000-0000-000000000000', sets: 3, reps: 10 }
              ]
            }, as: :json

            expect(response).to have_http_status(:not_found)
          end

          it 'deactivates existing assignments when reassigning' do
            existing = create(:patient_exercise,
              user: patient,
              exercise: exercise,
              assigned_by_staff: manager,
              is_active: true
            )

            post "/api/v1/patients/#{patient.id}/exercises", params: {
              assignments: [ { exercise_id: another_exercise.id, sets: 2, reps: 15 } ]
            }, as: :json

            expect(response).to have_http_status(:created)
            expect(existing.reload.is_active).to be false
          end

          it 'allows same exercise when previous assignment is inactive' do
            create(:patient_exercise, :inactive,
              user: patient,
              exercise: exercise,
              assigned_by_staff: manager
            )

            post "/api/v1/patients/#{patient.id}/exercises", params: valid_params, as: :json

            expect(response).to have_http_status(:created)
          end
        end

        context 'patient not found' do
          it 'returns not found for non-existent patient' do
            post '/api/v1/patients/00000000-0000-0000-0000-000000000000/exercises',
              params: valid_params, as: :json

            expect(response).to have_http_status(:not_found)
          end

          it 'returns not found for soft deleted patient' do
            patient.soft_delete

            post "/api/v1/patients/#{patient.id}/exercises", params: valid_params, as: :json

            expect(response).to have_http_status(:not_found)
          end
        end
      end

      context 'as regular staff' do
        before do
          create(:patient_staff_assignment, user: patient, staff: staff_member)
          staff_login(staff_member)
        end

        it 'can assign exercise to assigned patient' do
          post "/api/v1/patients/#{patient.id}/exercises", params: valid_params, as: :json

          expect(response).to have_http_status(:created)
          expect(json_response['status']).to eq('success')
        end

        it 'sets assigned_by_staff_id to current staff' do
          post "/api/v1/patients/#{patient.id}/exercises", params: valid_params, as: :json

          assignment = PatientExercise.last
          expect(assignment.assigned_by_staff_id).to eq(staff_member.id)
        end

        it 'returns forbidden for non-assigned patient' do
          post "/api/v1/patients/#{other_patient.id}/exercises", params: valid_params, as: :json

          expect(response).to have_http_status(:forbidden)
          expect(json_response['message']).to include('アクセス権限')
        end

        it 'creates audit log entry for successful assignment' do
          expect {
            post "/api/v1/patients/#{patient.id}/exercises", params: valid_params, as: :json
          }.to change(AuditLog, :count).by(1)

          audit = AuditLog.order(:created_at).last
          expect(audit.action).to eq('create')
          expect(audit.staff_id).to eq(staff_member.id)
        end
      end
    end

    context 'when user (patient) is authenticated' do
      before { sign_in_as_user(patient) }

      it 'returns unauthorized' do
        post "/api/v1/patients/#{patient.id}/exercises", params: valid_params, as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when not authenticated' do
      it 'returns unauthorized' do
        post "/api/v1/patients/#{patient.id}/exercises", params: valid_params, as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when session is expired' do
      before do
        staff_login(manager)
        Timecop.travel(16.minutes.from_now)
      end

      after { Timecop.return }

      it 'returns unauthorized' do
        post "/api/v1/patients/#{patient.id}/exercises", params: valid_params, as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  private

  def staff_login(staff)
    post '/api/v1/auth/staff/login', params: {
      staff_id: staff.staff_id,
      password: 'Staff123!'
    }
  end
end
