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
    let(:valid_params) do
      {
        exercise_id: exercise.id,
        target_reps: 10,
        target_sets: 3
      }
    end

    context 'when staff is authenticated' do
      context 'as manager' do
        before { staff_login(manager) }

        it 'can assign exercise to any patient' do
          post "/api/v1/patients/#{patient.id}/exercises", params: valid_params

          expect(response).to have_http_status(:created)
          expect(json_response['status']).to eq('success')
        end

        it 'returns the created assignment data' do
          post "/api/v1/patients/#{patient.id}/exercises", params: valid_params

          data = json_response['data']
          expect(data['id']).to be_present
          expect(data['exercise_id']).to eq(exercise.id)
          expect(data['target_reps']).to eq(10)
          expect(data['target_sets']).to eq(3)
          expect(data['assigned_at']).to be_present
        end

        it 'creates a patient_exercise record' do
          expect {
            post "/api/v1/patients/#{patient.id}/exercises", params: valid_params
          }.to change(PatientExercise, :count).by(1)
        end

        it 'sets assigned_by_staff_id to current staff' do
          post "/api/v1/patients/#{patient.id}/exercises", params: valid_params

          assignment = PatientExercise.last
          expect(assignment.assigned_by_staff_id).to eq(manager.id)
        end

        it 'creates audit log entry' do
          expect {
            post "/api/v1/patients/#{patient.id}/exercises", params: valid_params
          }.to change(AuditLog, :count).by(1)

          audit = AuditLog.order(:created_at).last
          expect(audit.action).to eq('create')
          expect(audit.status).to eq('success')
          expect(audit.staff_id).to eq(manager.id)
        end

        context 'with optional parameters' do
          it 'allows target_reps to be nil' do
            post "/api/v1/patients/#{patient.id}/exercises", params: {
              exercise_id: exercise.id,
              target_sets: 3
            }

            expect(response).to have_http_status(:created)
            expect(json_response['data']['target_reps']).to be_nil
          end

          it 'allows target_sets to be nil' do
            post "/api/v1/patients/#{patient.id}/exercises", params: {
              exercise_id: exercise.id,
              target_reps: 10
            }

            expect(response).to have_http_status(:created)
            expect(json_response['data']['target_sets']).to be_nil
          end
        end

        context 'validation errors' do
          it 'returns error when exercise_id is missing' do
            post "/api/v1/patients/#{patient.id}/exercises", params: {
              target_reps: 10,
              target_sets: 3
            }

            expect(response).to have_http_status(:unprocessable_entity)
          end

          it 'returns error when exercise_id is invalid' do
            post "/api/v1/patients/#{patient.id}/exercises", params: {
              exercise_id: '00000000-0000-0000-0000-000000000000',
              target_reps: 10,
              target_sets: 3
            }

            expect(response).to have_http_status(:not_found)
          end

          it 'returns error when target_reps is negative' do
            post "/api/v1/patients/#{patient.id}/exercises", params: {
              exercise_id: exercise.id,
              target_reps: -1,
              target_sets: 3
            }

            expect(response).to have_http_status(:unprocessable_entity)
          end

          it 'returns error when target_sets is negative' do
            post "/api/v1/patients/#{patient.id}/exercises", params: {
              exercise_id: exercise.id,
              target_reps: 10,
              target_sets: -1
            }

            expect(response).to have_http_status(:unprocessable_entity)
          end

          it 'returns error when duplicate active assignment exists' do
            create(:patient_exercise,
              user: patient,
              exercise: exercise,
              assigned_by_staff: manager,
              is_active: true
            )

            post "/api/v1/patients/#{patient.id}/exercises", params: valid_params

            expect(response).to have_http_status(:unprocessable_entity)
            expect(json_response['message']).to include('バリデーション')
          end

          it 'allows same exercise when previous assignment is inactive' do
            create(:patient_exercise, :inactive,
              user: patient,
              exercise: exercise,
              assigned_by_staff: manager
            )

            post "/api/v1/patients/#{patient.id}/exercises", params: valid_params

            expect(response).to have_http_status(:created)
          end
        end

        context 'patient not found' do
          it 'returns not found for non-existent patient' do
            post '/api/v1/patients/00000000-0000-0000-0000-000000000000/exercises',
              params: valid_params

            expect(response).to have_http_status(:not_found)
          end

          it 'returns not found for soft deleted patient' do
            patient.soft_delete

            post "/api/v1/patients/#{patient.id}/exercises", params: valid_params

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
          post "/api/v1/patients/#{patient.id}/exercises", params: valid_params

          expect(response).to have_http_status(:created)
          expect(json_response['status']).to eq('success')
        end

        it 'sets assigned_by_staff_id to current staff' do
          post "/api/v1/patients/#{patient.id}/exercises", params: valid_params

          assignment = PatientExercise.last
          expect(assignment.assigned_by_staff_id).to eq(staff_member.id)
        end

        it 'returns forbidden for non-assigned patient' do
          post "/api/v1/patients/#{other_patient.id}/exercises", params: valid_params

          expect(response).to have_http_status(:forbidden)
          expect(json_response['message']).to include('アクセス権限')
        end

        it 'creates audit log entry for successful assignment' do
          expect {
            post "/api/v1/patients/#{patient.id}/exercises", params: valid_params
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
        post "/api/v1/patients/#{patient.id}/exercises", params: valid_params

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when not authenticated' do
      it 'returns unauthorized' do
        post "/api/v1/patients/#{patient.id}/exercises", params: valid_params

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
        post "/api/v1/patients/#{patient.id}/exercises", params: valid_params

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
