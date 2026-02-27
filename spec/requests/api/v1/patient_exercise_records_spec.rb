# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::PatientExerciseRecords', type: :request do
  let(:manager) { create(:staff, :manager, password: 'Password123', password_confirmation: 'Password123') }
  let(:staff_member) { create(:staff, password: 'Password123', password_confirmation: 'Password123') }
  let(:patient) { create(:user) }
  let(:exercise) { create(:exercise, name: 'スクワット', exercise_type: 'トレーニング') }

  describe 'GET /api/v1/patients/:patient_id/exercise_records' do
    context 'when not authenticated' do
      it 'returns unauthorized status' do
        get "/api/v1/patients/#{patient.id}/exercise_records"

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when authenticated as manager' do
      before { sign_in_as_staff(manager) }

      context 'with existing records' do
        before do
          create(:exercise_record, user: patient, exercise: exercise,
                 completed_at: 2.hours.ago, completed_reps: 10, completed_sets: 3, duration_seconds: 300)
          create(:exercise_record, user: patient, exercise: exercise,
                 completed_at: 1.hour.ago, completed_reps: 8, completed_sets: 2, duration_seconds: 240)
        end

        it 'returns all records in descending order' do
          get "/api/v1/patients/#{patient.id}/exercise_records"

          expect(response).to have_http_status(:ok)
          expect(json_response['status']).to eq('success')

          records = json_response['data']['records']
          expect(records.length).to eq(2)
          # Most recent first
          expect(records.first['completed_reps']).to eq(8)
        end

        it 'returns record fields correctly' do
          get "/api/v1/patients/#{patient.id}/exercise_records"

          record = json_response['data']['records'].first
          expect(record).to have_key('id')
          expect(record).to have_key('exercise_name')
          expect(record).to have_key('exercise_type')
          expect(record).to have_key('completed_at')
          expect(record).to have_key('completed_reps')
          expect(record).to have_key('completed_sets')
          expect(record).to have_key('duration_seconds')
        end

        it 'returns summary data' do
          get "/api/v1/patients/#{patient.id}/exercise_records"

          summary = json_response['data']['summary']
          expect(summary['total_records']).to eq(2)
          expect(summary['total_minutes']).to eq(9) # (300 + 240) / 60 = 9
        end
      end

      context 'with date filtering' do
        before do
          create(:exercise_record, :historical, user: patient, exercise: exercise,
                 completed_at: 3.days.ago, completed_reps: 10, completed_sets: 3, duration_seconds: 300)
          create(:exercise_record, user: patient, exercise: exercise,
                 completed_at: 1.day.ago, completed_reps: 8, completed_sets: 2, duration_seconds: 240)
          create(:exercise_record, user: patient, exercise: exercise,
                 completed_at: Time.current, completed_reps: 12, completed_sets: 3, duration_seconds: 360)
        end

        it 'filters by date range' do
          get "/api/v1/patients/#{patient.id}/exercise_records", params: {
            start_date: 2.days.ago.to_date.to_s,
            end_date: Date.current.to_s
          }

          expect(response).to have_http_status(:ok)
          records = json_response['data']['records']
          expect(records.length).to eq(2)
        end
      end

      context 'with no records' do
        it 'returns empty array' do
          get "/api/v1/patients/#{patient.id}/exercise_records"

          expect(response).to have_http_status(:ok)
          expect(json_response['data']['records']).to eq([])
          expect(json_response['data']['summary']['total_records']).to eq(0)
        end
      end

      it 'can access any patient regardless of assignment' do
        get "/api/v1/patients/#{patient.id}/exercise_records"

        expect(response).to have_http_status(:ok)
      end

      it 'creates an audit log entry' do
        expect {
          get "/api/v1/patients/#{patient.id}/exercise_records"
        }.to change(AuditLog, :count).by(1)

        audit = AuditLog.order(:created_at).last
        expect(audit.action).to eq('read')
        expect(audit.status).to eq('success')
        expect(audit.staff_id).to eq(manager.id)
      end
    end

    context 'when authenticated as regular staff' do
      before { sign_in_as_staff(staff_member) }

      context 'with assigned patient' do
        before do
          create(:patient_staff_assignment, user: patient, staff: staff_member, is_primary: true)
          create(:exercise_record, user: patient, exercise: exercise,
                 completed_at: Time.current, completed_reps: 10, completed_sets: 3, duration_seconds: 300)
        end

        it 'returns records for assigned patient' do
          get "/api/v1/patients/#{patient.id}/exercise_records"

          expect(response).to have_http_status(:ok)
          records = json_response['data']['records']
          expect(records.length).to eq(1)
        end
      end

      context 'with non-assigned patient' do
        it 'returns forbidden status' do
          get "/api/v1/patients/#{patient.id}/exercise_records"

          expect(response).to have_http_status(:forbidden)
        end
      end
    end

    context 'when patient does not exist' do
      before { sign_in_as_staff(manager) }

      it 'returns not found status' do
        get '/api/v1/patients/non-existent-id/exercise_records'

        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
