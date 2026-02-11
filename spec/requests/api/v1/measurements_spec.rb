# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Measurements', type: :request do
  let(:staff) { create(:staff) }
  let(:manager) { create(:staff, :manager) }
  let(:patient) { create(:user) }

  describe 'POST /api/v1/patients/:patient_id/measurements' do
    let(:valid_params) do
      {
        measured_date: Date.current.to_s,
        weight_kg: 65.5,
        knee_extension_strength_left: 250.0,
        knee_extension_strength_right: 260.0,
        wbi_left: 38.9,
        wbi_right: 40.4,
        tug_seconds: 12.5,
        single_leg_stance_seconds: 15.2,
        nrs_pain_score: 3,
        mmt_score: 4,
        notes: '前回より改善傾向'
      }
    end

    context 'when staff is authenticated' do
      before { staff_login(staff) }

      context 'with valid parameters' do
        it 'creates a new measurement' do
          expect {
            post "/api/v1/patients/#{patient.id}/measurements", params: valid_params
          }.to change(Measurement, :count).by(1)
        end

        it 'returns created status' do
          post "/api/v1/patients/#{patient.id}/measurements", params: valid_params

          expect(response).to have_http_status(:created)
        end

        it 'returns the created measurement data' do
          post "/api/v1/patients/#{patient.id}/measurements", params: valid_params

          expect(json_response['status']).to eq('success')
          expect(json_response['data']['measured_date']).to eq(Date.current.to_s)
          expect(json_response['data']['weight_kg']).to eq('65.5')
          expect(json_response['data']['nrs_pain_score']).to eq(3)
          expect(json_response['data']['mmt_score']).to eq(4)
        end

        it 'associates measurement with the current staff' do
          post "/api/v1/patients/#{patient.id}/measurements", params: valid_params

          measurement = Measurement.last
          expect(measurement.measured_by_staff_id).to eq(staff.id)
        end

        it 'associates measurement with the patient' do
          post "/api/v1/patients/#{patient.id}/measurements", params: valid_params

          measurement = Measurement.last
          expect(measurement.user_id).to eq(patient.id)
        end

        it 'creates an audit log entry' do
          expect {
            post "/api/v1/patients/#{patient.id}/measurements", params: valid_params
          }.to change(AuditLog, :count).by(1)
        end

        it 'logs correct audit action' do
          post "/api/v1/patients/#{patient.id}/measurements", params: valid_params

          audit = AuditLog.order(:created_at).last
          expect(audit.action).to eq('create')
          expect(audit.status).to eq('success')
          expect(audit.staff_id).to eq(staff.id)
        end
      end

      context 'with minimal parameters (only required fields)' do
        let(:minimal_params) do
          {
            measured_date: Date.current.to_s
          }
        end

        it 'creates a measurement with only measured_date' do
          expect {
            post "/api/v1/patients/#{patient.id}/measurements", params: minimal_params
          }.to change(Measurement, :count).by(1)
        end

        it 'returns created status' do
          post "/api/v1/patients/#{patient.id}/measurements", params: minimal_params

          expect(response).to have_http_status(:created)
        end
      end

      context 'with partial measurements' do
        let(:partial_params) do
          {
            measured_date: Date.current.to_s,
            weight_kg: 70.0,
            nrs_pain_score: 5
          }
        end

        it 'creates a measurement with partial data' do
          post "/api/v1/patients/#{patient.id}/measurements", params: partial_params

          expect(response).to have_http_status(:created)
          expect(json_response['data']['weight_kg']).to eq('70.0')
          expect(json_response['data']['nrs_pain_score']).to eq(5)
          expect(json_response['data']['tug_seconds']).to be_nil
        end
      end

      context 'without measured_date (defaults to current date)' do
        it 'creates measurement with current date as default' do
          post "/api/v1/patients/#{patient.id}/measurements", params: {
            weight_kg: 65.5
          }

          expect(response).to have_http_status(:created)
          expect(json_response['data']['measured_date']).to eq(Date.current.to_s)
        end
      end

      context 'with invalid parameters' do
        it 'returns error when weight_kg is negative' do
          post "/api/v1/patients/#{patient.id}/measurements", params: {
            measured_date: Date.current.to_s,
            weight_kg: -1
          }

          expect(response).to have_http_status(:unprocessable_content)
        end

        it 'returns error when weight_kg exceeds limit' do
          post "/api/v1/patients/#{patient.id}/measurements", params: {
            measured_date: Date.current.to_s,
            weight_kg: 600
          }

          expect(response).to have_http_status(:unprocessable_content)
        end

        it 'returns error when nrs_pain_score is out of range' do
          post "/api/v1/patients/#{patient.id}/measurements", params: {
            measured_date: Date.current.to_s,
            nrs_pain_score: 11
          }

          expect(response).to have_http_status(:unprocessable_content)
        end

        it 'returns error when mmt_score is out of range' do
          post "/api/v1/patients/#{patient.id}/measurements", params: {
            measured_date: Date.current.to_s,
            mmt_score: 6
          }

          expect(response).to have_http_status(:unprocessable_content)
        end

        it 'returns error when knee_extension_strength exceeds 500' do
          post "/api/v1/patients/#{patient.id}/measurements", params: {
            measured_date: Date.current.to_s,
            knee_extension_strength_left: 501
          }

          expect(response).to have_http_status(:unprocessable_content)
        end

        it 'returns error when wbi_left exceeds 200' do
          post "/api/v1/patients/#{patient.id}/measurements", params: {
            measured_date: Date.current.to_s,
            wbi_left: 201
          }

          expect(response).to have_http_status(:unprocessable_content)
        end

        it 'returns error when wbi_right is negative' do
          post "/api/v1/patients/#{patient.id}/measurements", params: {
            measured_date: Date.current.to_s,
            wbi_right: -1
          }

          expect(response).to have_http_status(:unprocessable_content)
        end

        it 'accepts valid wbi values' do
          post "/api/v1/patients/#{patient.id}/measurements", params: {
            measured_date: Date.current.to_s,
            wbi_left: 45.5,
            wbi_right: 50.2
          }

          expect(response).to have_http_status(:created)
          expect(json_response['data']['wbi_left']).to eq('45.5')
          expect(json_response['data']['wbi_right']).to eq('50.2')
        end
      end

      context 'when patient does not exist' do
        it 'returns not found' do
          post '/api/v1/patients/00000000-0000-0000-0000-000000000000/measurements', params: valid_params

          expect(response).to have_http_status(:not_found)
        end
      end
    end

    context 'when manager is authenticated' do
      before { staff_login(manager) }

      it 'allows manager to create measurements' do
        post "/api/v1/patients/#{patient.id}/measurements", params: valid_params

        expect(response).to have_http_status(:created)
      end
    end

    context 'when user (patient) is authenticated instead of staff' do
      before { sign_in_as_user(patient) }

      it 'returns forbidden' do
        post "/api/v1/patients/#{patient.id}/measurements", params: valid_params

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when not authenticated' do
      it 'returns unauthorized' do
        post "/api/v1/patients/#{patient.id}/measurements", params: valid_params

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when session is expired' do
      before do
        staff_login(staff)
        # Simulate session expiry (15 minutes for staff)
        Timecop.travel(16.minutes.from_now)
      end

      it 'returns unauthorized' do
        post "/api/v1/patients/#{patient.id}/measurements", params: valid_params

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'GET /api/v1/patients/:patient_id/measurements (職員用)' do
    let!(:measurements) do
      [
        create(:measurement, user: patient, measured_by_staff: staff, measured_date: 5.days.ago.to_date),
        create(:measurement, user: patient, measured_by_staff: staff, measured_date: 3.days.ago.to_date),
        create(:measurement, user: patient, measured_by_staff: staff, measured_date: 1.day.ago.to_date),
        create(:measurement, user: patient, measured_by_staff: staff, measured_date: Date.current)
      ]
    end

    context 'when staff is authenticated' do
      before { staff_login(staff) }

      context 'without date filters' do
        it 'returns all measurements for the patient' do
          get "/api/v1/patients/#{patient.id}/measurements"

          expect(response).to have_http_status(:ok)
          expect(json_response['status']).to eq('success')
          expect(json_response['data']['measurements'].length).to eq(4)
        end

        it 'returns measurements in descending order by date' do
          get "/api/v1/patients/#{patient.id}/measurements"

          measurements_data = json_response['data']['measurements']
          expect(measurements_data.first['measured_date']).to eq(Date.current.to_s)
          expect(measurements_data.last['measured_date']).to eq(5.days.ago.to_date.to_s)
        end

        it 'includes all measurement fields in response' do
          get "/api/v1/patients/#{patient.id}/measurements"

          measurement = json_response['data']['measurements'].first
          expect(measurement).to include(
            'id',
            'measured_date',
            'weight_kg',
            'knee_extension_strength_left',
            'knee_extension_strength_right',
            'wbi_left',
            'wbi_right',
            'tug_seconds',
            'single_leg_stance_seconds',
            'nrs_pain_score',
            'mmt_score'
          )
        end
      end

      context 'with date filters' do
        it 'filters by start_date' do
          get "/api/v1/patients/#{patient.id}/measurements", params: {
            start_date: 2.days.ago.to_date.to_s
          }

          expect(response).to have_http_status(:ok)
          measurements_data = json_response['data']['measurements']
          expect(measurements_data.length).to eq(2)
        end

        it 'filters by end_date' do
          get "/api/v1/patients/#{patient.id}/measurements", params: {
            end_date: 2.days.ago.to_date.to_s
          }

          expect(response).to have_http_status(:ok)
          measurements_data = json_response['data']['measurements']
          expect(measurements_data.length).to eq(2)
        end

        it 'filters by both start_date and end_date' do
          get "/api/v1/patients/#{patient.id}/measurements", params: {
            start_date: 4.days.ago.to_date.to_s,
            end_date: 2.days.ago.to_date.to_s
          }

          expect(response).to have_http_status(:ok)
          measurements_data = json_response['data']['measurements']
          expect(measurements_data.length).to eq(1)
          expect(measurements_data.first['measured_date']).to eq(3.days.ago.to_date.to_s)
        end

        it 'returns empty array when no measurements in date range' do
          get "/api/v1/patients/#{patient.id}/measurements", params: {
            start_date: 10.days.ago.to_date.to_s,
            end_date: 8.days.ago.to_date.to_s
          }

          expect(response).to have_http_status(:ok)
          expect(json_response['data']['measurements']).to eq([])
        end
      end

      context 'when patient has no measurements' do
        let(:other_patient) { create(:user) }

        it 'returns empty array' do
          get "/api/v1/patients/#{other_patient.id}/measurements"

          expect(response).to have_http_status(:ok)
          expect(json_response['data']['measurements']).to eq([])
        end
      end

      context 'does not return other patients measurements' do
        let(:other_patient) { create(:user) }

        before do
          create(:measurement, user: other_patient, measured_by_staff: staff, measured_date: Date.current)
        end

        it 'only returns measurements for the specified patient' do
          get "/api/v1/patients/#{patient.id}/measurements"

          measurements_data = json_response['data']['measurements']
          expect(measurements_data.length).to eq(4)
          measurements_data.each do |m|
            expect(m['user_id']).to be_nil # user_id is not exposed in response
          end
        end
      end

      context 'when patient does not exist' do
        it 'returns not found' do
          get '/api/v1/patients/00000000-0000-0000-0000-000000000000/measurements'

          expect(response).to have_http_status(:not_found)
        end
      end
    end

    context 'when manager is authenticated' do
      before { staff_login(manager) }

      it 'allows manager to view measurements' do
        get "/api/v1/patients/#{patient.id}/measurements"

        expect(response).to have_http_status(:ok)
        expect(json_response['data']['measurements'].length).to eq(4)
      end
    end

    context 'when user (patient) is authenticated instead of staff' do
      before { sign_in_as_user(patient) }

      it 'returns unauthorized' do
        get "/api/v1/patients/#{patient.id}/measurements"

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when not authenticated' do
      it 'returns unauthorized' do
        get "/api/v1/patients/#{patient.id}/measurements"

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'creates audit log entry' do
      before { staff_login(staff) }

      it 'logs the read action' do
        expect {
          get "/api/v1/patients/#{patient.id}/measurements"
        }.to change(AuditLog, :count).by(1)
      end

      it 'logs correct audit details' do
        get "/api/v1/patients/#{patient.id}/measurements"

        audit = AuditLog.order(:created_at).last
        expect(audit.action).to eq('read')
        expect(audit.status).to eq('success')
        expect(audit.staff_id).to eq(staff.id)
      end
    end
  end

  describe 'GET /api/v1/users/me/measurements (利用者用)' do
    let!(:user_measurements) do
      [
        create(:measurement, user: patient, measured_by_staff: staff, measured_date: 5.days.ago.to_date),
        create(:measurement, user: patient, measured_by_staff: staff, measured_date: 3.days.ago.to_date),
        create(:measurement, user: patient, measured_by_staff: staff, measured_date: 1.day.ago.to_date),
        create(:measurement, user: patient, measured_by_staff: staff, measured_date: Date.current)
      ]
    end

    context 'when user is authenticated' do
      before { sign_in_as_user(patient) }

      context 'without date filters' do
        it 'returns all measurements for the current user' do
          get '/api/v1/users/me/measurements'

          expect(response).to have_http_status(:ok)
          expect(json_response['status']).to eq('success')
          expect(json_response['data']['measurements'].length).to eq(4)
        end

        it 'returns measurements in descending order by date' do
          get '/api/v1/users/me/measurements'

          measurements_data = json_response['data']['measurements']
          expect(measurements_data.first['measured_date']).to eq(Date.current.to_s)
          expect(measurements_data.last['measured_date']).to eq(5.days.ago.to_date.to_s)
        end

        it 'includes all measurement fields in response' do
          get '/api/v1/users/me/measurements'

          measurement = json_response['data']['measurements'].first
          expect(measurement).to include(
            'id',
            'measured_date',
            'weight_kg',
            'knee_extension_strength_left',
            'knee_extension_strength_right',
            'wbi_left',
            'wbi_right',
            'tug_seconds',
            'single_leg_stance_seconds',
            'nrs_pain_score',
            'mmt_score'
          )
        end
      end

      context 'with date filters' do
        it 'filters by start_date' do
          get '/api/v1/users/me/measurements', params: {
            start_date: 2.days.ago.to_date.to_s
          }

          expect(response).to have_http_status(:ok)
          measurements_data = json_response['data']['measurements']
          expect(measurements_data.length).to eq(2)
        end

        it 'filters by end_date' do
          get '/api/v1/users/me/measurements', params: {
            end_date: 2.days.ago.to_date.to_s
          }

          expect(response).to have_http_status(:ok)
          measurements_data = json_response['data']['measurements']
          expect(measurements_data.length).to eq(2)
        end

        it 'filters by both start_date and end_date' do
          get '/api/v1/users/me/measurements', params: {
            start_date: 4.days.ago.to_date.to_s,
            end_date: 2.days.ago.to_date.to_s
          }

          expect(response).to have_http_status(:ok)
          measurements_data = json_response['data']['measurements']
          expect(measurements_data.length).to eq(1)
          expect(measurements_data.first['measured_date']).to eq(3.days.ago.to_date.to_s)
        end

        it 'returns empty array when no measurements in date range' do
          get '/api/v1/users/me/measurements', params: {
            start_date: 10.days.ago.to_date.to_s,
            end_date: 8.days.ago.to_date.to_s
          }

          expect(response).to have_http_status(:ok)
          expect(json_response['data']['measurements']).to eq([])
        end
      end

      context 'when user has no measurements' do
        let(:new_user) { create(:user) }

        before do
          sign_in_as_user(new_user)
        end

        it 'returns empty array' do
          get '/api/v1/users/me/measurements'

          expect(response).to have_http_status(:ok)
          expect(json_response['data']['measurements']).to eq([])
        end
      end

      context 'does not return other users measurements' do
        let(:other_user) { create(:user) }

        before do
          create(:measurement, user: other_user, measured_by_staff: staff, measured_date: Date.current)
        end

        it 'only returns current users measurements' do
          get '/api/v1/users/me/measurements'

          measurements_data = json_response['data']['measurements']
          expect(measurements_data.length).to eq(4)
        end
      end
    end

    context 'when staff is authenticated instead of user' do
      before { staff_login(staff) }

      it 'returns unauthorized' do
        get '/api/v1/users/me/measurements'

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when not authenticated' do
      it 'returns unauthorized' do
        get '/api/v1/users/me/measurements'

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  private

  def staff_login(staff_member)
    post '/api/v1/auth/staff/login', params: {
      staff_id: staff_member.staff_id,
      password: 'Staff123!'
    }
  end
end
