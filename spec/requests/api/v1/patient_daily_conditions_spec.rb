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

  describe 'GET /api/v1/patients/:patient_id/daily_conditions/:id' do
    let!(:condition) { create(:daily_condition, user: patient, pain_level: 5, body_condition: 7, notes: 'テストメモ') }

    context 'when not authenticated' do
      it 'returns unauthorized status' do
        get "/api/v1/patients/#{patient.id}/daily_conditions/#{condition.id}"

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when authenticated as manager' do
      before { sign_in_as_staff(manager) }

      it 'returns the condition' do
        get "/api/v1/patients/#{patient.id}/daily_conditions/#{condition.id}"

        expect(response).to have_http_status(:ok)
        data = json_response['data']['condition']
        expect(data['id']).to eq(condition.id)
        expect(data['pain_level']).to eq(5)
        expect(data['body_condition']).to eq(7)
        expect(data['notes']).to eq('テストメモ')
      end

      it 'returns not found for non-existent condition' do
        get "/api/v1/patients/#{patient.id}/daily_conditions/non-existent-id"

        expect(response).to have_http_status(:not_found)
      end

      it 'creates an audit log entry' do
        expect {
          get "/api/v1/patients/#{patient.id}/daily_conditions/#{condition.id}"
        }.to change(AuditLog, :count).by(1)

        audit = AuditLog.order(:created_at).last
        expect(audit.action).to eq('read')
      end
    end

    context 'when authenticated as regular staff without assignment' do
      before { sign_in_as_staff(staff_member) }

      it 'returns forbidden status' do
        get "/api/v1/patients/#{patient.id}/daily_conditions/#{condition.id}"

        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe 'POST /api/v1/patients/:patient_id/daily_conditions' do
    let(:valid_params) do
      { recorded_date: Date.current.to_s, pain_level: 3, body_condition: 7, notes: '職員が入力' }
    end

    context 'when not authenticated' do
      it 'returns unauthorized status' do
        post "/api/v1/patients/#{patient.id}/daily_conditions", params: valid_params

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when authenticated as manager' do
      before { sign_in_as_staff(manager) }

      it 'creates a new condition' do
        expect {
          post "/api/v1/patients/#{patient.id}/daily_conditions", params: valid_params
        }.to change(DailyCondition, :count).by(1)

        expect(response).to have_http_status(:created)
        data = json_response['data']['condition']
        expect(data['pain_level']).to eq(3)
        expect(data['body_condition']).to eq(7)
        expect(data['notes']).to eq('職員が入力')
      end

      it 'creates an audit log with action create' do
        expect {
          post "/api/v1/patients/#{patient.id}/daily_conditions", params: valid_params
        }.to change(AuditLog, :count).by(1)

        audit = AuditLog.order(:created_at).last
        expect(audit.action).to eq('create')
      end

      it 'returns validation error for invalid pain_level' do
        post "/api/v1/patients/#{patient.id}/daily_conditions", params: valid_params.merge(pain_level: 11)

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response['status']).to eq('error')
      end

      it 'returns validation error for missing required fields' do
        post "/api/v1/patients/#{patient.id}/daily_conditions", params: { notes: 'メモだけ' }

        expect(response).to have_http_status(:unprocessable_content)
      end

      it 'returns validation error for duplicate date' do
        create(:daily_condition, user: patient, recorded_date: Date.current)

        post "/api/v1/patients/#{patient.id}/daily_conditions", params: valid_params

        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context 'when authenticated as assigned staff' do
      before do
        sign_in_as_staff(staff_member)
        create(:patient_staff_assignment, user: patient, staff: staff_member, is_primary: true)
      end

      it 'creates a condition for assigned patient' do
        post "/api/v1/patients/#{patient.id}/daily_conditions", params: valid_params

        expect(response).to have_http_status(:created)
      end
    end

    context 'when authenticated as non-assigned staff' do
      before { sign_in_as_staff(staff_member) }

      it 'returns forbidden status' do
        post "/api/v1/patients/#{patient.id}/daily_conditions", params: valid_params

        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe 'PATCH /api/v1/patients/:patient_id/daily_conditions/:id' do
    let!(:condition) { create(:daily_condition, user: patient, pain_level: 5, body_condition: 5) }
    let(:update_params) { { pain_level: 3, body_condition: 8, notes: '改善した' } }

    context 'when not authenticated' do
      it 'returns unauthorized status' do
        patch "/api/v1/patients/#{patient.id}/daily_conditions/#{condition.id}", params: update_params

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when authenticated as manager' do
      before { sign_in_as_staff(manager) }

      it 'updates the condition' do
        patch "/api/v1/patients/#{patient.id}/daily_conditions/#{condition.id}", params: update_params

        expect(response).to have_http_status(:ok)
        data = json_response['data']['condition']
        expect(data['pain_level']).to eq(3)
        expect(data['body_condition']).to eq(8)
        expect(data['notes']).to eq('改善した')
      end

      it 'creates an audit log with action update' do
        expect {
          patch "/api/v1/patients/#{patient.id}/daily_conditions/#{condition.id}", params: update_params
        }.to change(AuditLog, :count).by(1)

        audit = AuditLog.order(:created_at).last
        expect(audit.action).to eq('update')
      end

      it 'returns validation error for invalid values' do
        patch "/api/v1/patients/#{patient.id}/daily_conditions/#{condition.id}", params: { pain_level: -1 }

        expect(response).to have_http_status(:unprocessable_content)
      end

      it 'returns not found for non-existent condition' do
        patch "/api/v1/patients/#{patient.id}/daily_conditions/non-existent-id", params: update_params

        expect(response).to have_http_status(:not_found)
      end

      it 'can update only notes' do
        patch "/api/v1/patients/#{patient.id}/daily_conditions/#{condition.id}", params: { notes: '備考のみ更新' }

        expect(response).to have_http_status(:ok)
        data = json_response['data']['condition']
        expect(data['notes']).to eq('備考のみ更新')
        expect(data['pain_level']).to eq(5)
      end
    end

    context 'when authenticated as non-assigned staff' do
      before { sign_in_as_staff(staff_member) }

      it 'returns forbidden status' do
        patch "/api/v1/patients/#{patient.id}/daily_conditions/#{condition.id}", params: update_params

        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe 'DELETE /api/v1/patients/:patient_id/daily_conditions/:id' do
    let!(:condition) { create(:daily_condition, user: patient, pain_level: 5, body_condition: 5) }

    context 'when not authenticated' do
      it 'returns unauthorized status' do
        delete "/api/v1/patients/#{patient.id}/daily_conditions/#{condition.id}"

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when authenticated as manager' do
      before { sign_in_as_staff(manager) }

      it 'deletes the condition' do
        expect {
          delete "/api/v1/patients/#{patient.id}/daily_conditions/#{condition.id}"
        }.to change(DailyCondition, :count).by(-1)

        expect(response).to have_http_status(:ok)
        expect(json_response['data']['message']).to eq('体調データを削除しました')
      end

      it 'creates an audit log with action delete' do
        expect {
          delete "/api/v1/patients/#{patient.id}/daily_conditions/#{condition.id}"
        }.to change(AuditLog, :count).by(1)

        audit = AuditLog.order(:created_at).last
        expect(audit.action).to eq('delete')
      end

      it 'returns not found for non-existent condition' do
        delete "/api/v1/patients/#{patient.id}/daily_conditions/non-existent-id"

        expect(response).to have_http_status(:not_found)
      end
    end

    context 'when authenticated as assigned staff' do
      before do
        sign_in_as_staff(staff_member)
        create(:patient_staff_assignment, user: patient, staff: staff_member, is_primary: true)
      end

      it 'deletes the condition for assigned patient' do
        expect {
          delete "/api/v1/patients/#{patient.id}/daily_conditions/#{condition.id}"
        }.to change(DailyCondition, :count).by(-1)

        expect(response).to have_http_status(:ok)
      end
    end

    context 'when authenticated as non-assigned staff' do
      before { sign_in_as_staff(staff_member) }

      it 'returns forbidden status' do
        delete "/api/v1/patients/#{patient.id}/daily_conditions/#{condition.id}"

        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end
