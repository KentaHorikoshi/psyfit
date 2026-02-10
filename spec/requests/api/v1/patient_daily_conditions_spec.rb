# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::PatientDailyConditions', type: :request do
  let(:manager) { create(:staff, :manager, password: 'Password123', password_confirmation: 'Password123') }
  let(:staff_member) { create(:staff, password: 'Password123', password_confirmation: 'Password123') }
  let(:patient) { create(:user) }

  describe 'GET /api/v1/patients/:patient_id/daily_conditions' do
    context 'when not authenticated' do
      it 'returns unauthorized status' do
        get "/api/v1/patients/#{patient.id}/daily_conditions"

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when authenticated as manager' do
      before { sign_in_as_staff(manager) }

      context 'with existing conditions' do
        before do
          create(:daily_condition, user: patient, recorded_date: 3.days.ago.to_date, pain_level: 5, body_condition: 5)
          create(:daily_condition, user: patient, recorded_date: 2.days.ago.to_date, pain_level: 4, body_condition: 6)
          create(:daily_condition, user: patient, recorded_date: 1.day.ago.to_date, pain_level: 3, body_condition: 7)
          create(:daily_condition, user: patient, recorded_date: Date.current, pain_level: 2, body_condition: 8)
        end

        it 'returns all conditions in descending order' do
          get "/api/v1/patients/#{patient.id}/daily_conditions"

          expect(response).to have_http_status(:ok)
          expect(json_response['status']).to eq('success')

          conditions = json_response['data']['conditions']
          expect(conditions.length).to eq(4)
          expect(conditions.first['recorded_date']).to eq(Date.current.to_s)
        end

        it 'returns condition fields correctly' do
          get "/api/v1/patients/#{patient.id}/daily_conditions"

          condition = json_response['data']['conditions'].first
          expect(condition).to have_key('id')
          expect(condition).to have_key('recorded_date')
          expect(condition).to have_key('pain_level')
          expect(condition).to have_key('body_condition')
          expect(condition).to have_key('notes')
        end

        it 'filters by date range' do
          get "/api/v1/patients/#{patient.id}/daily_conditions", params: {
            start_date: 2.days.ago.to_date.to_s,
            end_date: Date.current.to_s
          }

          expect(response).to have_http_status(:ok)
          conditions = json_response['data']['conditions']
          expect(conditions.length).to eq(3)
        end
      end

      context 'with no conditions' do
        it 'returns empty array' do
          get "/api/v1/patients/#{patient.id}/daily_conditions"

          expect(response).to have_http_status(:ok)
          expect(json_response['data']['conditions']).to eq([])
        end
      end

      it 'can access any patient regardless of assignment' do
        get "/api/v1/patients/#{patient.id}/daily_conditions"

        expect(response).to have_http_status(:ok)
      end

      it 'creates an audit log entry' do
        expect {
          get "/api/v1/patients/#{patient.id}/daily_conditions"
        }.to change(AuditLog, :count).by(1)

        audit = AuditLog.last
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
          create(:daily_condition, user: patient, recorded_date: Date.current, pain_level: 3, body_condition: 7)
        end

        it 'returns conditions for assigned patient' do
          get "/api/v1/patients/#{patient.id}/daily_conditions"

          expect(response).to have_http_status(:ok)
          conditions = json_response['data']['conditions']
          expect(conditions.length).to eq(1)
        end
      end

      context 'with non-assigned patient' do
        it 'returns forbidden status' do
          get "/api/v1/patients/#{patient.id}/daily_conditions"

          expect(response).to have_http_status(:forbidden)
        end
      end
    end

    context 'when patient does not exist' do
      before { sign_in_as_staff(manager) }

      it 'returns not found status' do
        get '/api/v1/patients/non-existent-id/daily_conditions'

        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
