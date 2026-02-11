# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Dashboard', type: :request do
  let(:manager) { create(:staff, :manager) }
  let(:staff_member) { create(:staff) }
  let(:other_staff) { create(:staff) }

  let(:exercise) { create(:exercise) }

  let!(:patient1) { create(:user, name: '田中太郎', next_visit_date: Date.current) }
  let!(:patient2) { create(:user, name: '佐藤花子', next_visit_date: Date.current) }
  let!(:patient3) { create(:user, name: '鈴木一郎', next_visit_date: Date.tomorrow) }

  describe 'GET /api/v1/dashboard/stats' do
    context 'when not authenticated' do
      it 'returns 401 unauthorized' do
        get '/api/v1/dashboard/stats'

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'as manager' do
      before { staff_login(manager) }

      it 'returns today_appointments_count for all patients visiting today' do
        get '/api/v1/dashboard/stats'

        expect(response).to have_http_status(:ok)
        expect(json_response['status']).to eq('success')
        expect(json_response['data']['today_appointments_count']).to eq(2)
      end

      it 'returns 0 when no patients have appointments today' do
        patient1.update!(next_visit_date: Date.tomorrow)
        patient2.update!(next_visit_date: Date.tomorrow)

        get '/api/v1/dashboard/stats'

        expect(json_response['data']['today_appointments_count']).to eq(0)
      end

      it 'returns weekly_exercises_count for all patients' do
        create(:exercise_record, :historical, user: patient1, exercise: exercise, completed_at: 1.day.ago)
        create(:exercise_record, :historical, user: patient2, exercise: exercise, completed_at: 2.days.ago)
        create(:exercise_record, :historical, user: patient3, exercise: exercise, completed_at: 3.days.ago)

        get '/api/v1/dashboard/stats'

        expect(json_response['data']['weekly_exercises_count']).to eq(3)
      end

      it 'does not count exercise records older than 1 week' do
        create(:exercise_record, :historical, user: patient1, exercise: exercise, completed_at: 1.day.ago)
        create(:exercise_record, :historical, user: patient2, exercise: exercise, completed_at: 8.days.ago)

        get '/api/v1/dashboard/stats'

        expect(json_response['data']['weekly_exercises_count']).to eq(1)
      end

      it 'returns 0 when no exercise records exist this week' do
        get '/api/v1/dashboard/stats'

        expect(json_response['data']['weekly_exercises_count']).to eq(0)
      end

      it 'does not count deleted patients' do
        patient1.update!(deleted_at: Time.current)

        get '/api/v1/dashboard/stats'

        expect(json_response['data']['today_appointments_count']).to eq(1)
      end

      it 'creates an audit log entry' do
        expect {
          get '/api/v1/dashboard/stats'
        }.to change(AuditLog, :count).by(1)
      end
    end

    context 'as regular staff' do
      before do
        staff_login(staff_member)
      end

      it 'counts all patients for today_appointments_count' do
        get '/api/v1/dashboard/stats'

        expect(response).to have_http_status(:ok)
        expect(json_response['data']['today_appointments_count']).to eq(2)
      end

      it 'counts all patients exercise records for weekly_exercises_count' do
        create(:exercise_record, user: patient1, exercise: exercise, completed_at: 1.day.ago)
        create(:exercise_record, user: patient2, exercise: exercise, completed_at: 1.day.ago)

        get '/api/v1/dashboard/stats'

        expect(json_response['data']['weekly_exercises_count']).to eq(2)
      end
    end
  end

  describe 'GET /api/v1/dashboard/today_appointments' do
    context 'when not authenticated' do
      it 'returns 401 unauthorized' do
        get '/api/v1/dashboard/today_appointments'

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'as authenticated staff' do
      before { staff_login(manager) }

      it 'returns patients with today appointments' do
        get '/api/v1/dashboard/today_appointments'

        expect(response).to have_http_status(:ok)
        expect(json_response['status']).to eq('success')

        patients = json_response['data']['patients']
        expect(patients.length).to eq(2)
      end

      it 'returns patient details with required fields' do
        get '/api/v1/dashboard/today_appointments'

        patient = json_response['data']['patients'].first
        expect(patient).to have_key('id')
        expect(patient).to have_key('name')
        expect(patient).to have_key('age')
        expect(patient).to have_key('gender')
        expect(patient).to have_key('status')
        expect(patient).to have_key('condition')
      end

      it 'does not include patients with future visit dates' do
        get '/api/v1/dashboard/today_appointments'

        patient_ids = json_response['data']['patients'].map { |p| p['id'] }
        expect(patient_ids).not_to include(patient3.id)
      end

      it 'does not include deleted patients' do
        patient1.update!(deleted_at: Time.current)

        get '/api/v1/dashboard/today_appointments'

        patients = json_response['data']['patients']
        expect(patients.length).to eq(1)
      end

      it 'returns empty array when no patients have appointments today' do
        patient1.update!(next_visit_date: Date.tomorrow)
        patient2.update!(next_visit_date: Date.tomorrow)

        get '/api/v1/dashboard/today_appointments'

        expect(json_response['data']['patients']).to eq([])
      end

      it 'creates an audit log entry' do
        expect {
          get '/api/v1/dashboard/today_appointments'
        }.to change(AuditLog, :count).by(1)
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
