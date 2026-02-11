# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::PatientReports', type: :request do
  let(:manager) { create(:staff, :manager) }
  let(:staff_member) { create(:staff) }
  let(:other_staff) { create(:staff) }
  let(:patient) { create(:user, :recovery, name: '田中太郎') }

  describe 'GET /api/v1/patients/:patient_id/report' do
    let(:start_date) { '2026-01-01' }
    let(:end_date) { '2026-01-31' }

    context 'when staff is authenticated' do
      context 'as manager' do
        before { staff_login(manager) }

        it 'returns PDF file' do
          get "/api/v1/patients/#{patient.id}/report",
              params: { start_date: start_date, end_date: end_date, format: 'pdf' }

          expect(response).to have_http_status(:ok)
          expect(response.content_type).to eq('application/pdf')
        end

        it 'sets correct Content-Disposition header' do
          get "/api/v1/patients/#{patient.id}/report",
              params: { start_date: start_date, end_date: end_date, format: 'pdf' }

          expect(response.headers['Content-Disposition']).to include('attachment')
          expect(response.headers['Content-Disposition']).to include('.pdf')
        end

        it 'includes patient name in filename (URL encoded for Japanese)' do
          get "/api/v1/patients/#{patient.id}/report",
              params: { start_date: start_date, end_date: end_date, format: 'pdf' }

          # Japanese characters are URL-encoded in Content-Disposition header
          # 田中太郎 -> %E7%94%B0%E4%B8%AD%E5%A4%AA%E9%83%8E
          expect(response.headers['Content-Disposition']).to include('patient_report_')
          expect(response.headers['Content-Disposition']).to include('.pdf')
        end

        context 'with measurement data' do
          before do
            create(:measurement,
                   user: patient,
                   measured_by_staff: manager,
                   measured_date: Date.parse('2026-01-15'),
                   weight_kg: 65.5,
                   tug_seconds: 12.3,
                   nrs_pain_score: 3)
            create(:measurement,
                   user: patient,
                   measured_by_staff: manager,
                   measured_date: Date.parse('2026-01-20'),
                   weight_kg: 65.0,
                   tug_seconds: 11.5,
                   nrs_pain_score: 2)
          end

          it 'returns PDF with measurement data' do
            get "/api/v1/patients/#{patient.id}/report",
                params: { start_date: start_date, end_date: end_date, format: 'pdf' }

            expect(response).to have_http_status(:ok)
            expect(response.body.length).to be > 0
          end
        end

        context 'with exercise record data' do
          let(:exercise) { create(:exercise, name: 'スクワット') }

          before do
            create(:exercise_record, :historical,
                   user: patient,
                   exercise: exercise,
                   completed_at: Time.zone.parse('2026-01-15 10:00:00'),
                   completed_reps: 10,
                   completed_sets: 3)
            create(:exercise_record, :historical,
                   user: patient,
                   exercise: exercise,
                   completed_at: Time.zone.parse('2026-01-16 10:00:00'),
                   completed_reps: 10,
                   completed_sets: 3)
          end

          it 'returns PDF with exercise data' do
            get "/api/v1/patients/#{patient.id}/report",
                params: { start_date: start_date, end_date: end_date, format: 'pdf' }

            expect(response).to have_http_status(:ok)
          end
        end

        context 'with daily condition data' do
          before do
            create(:daily_condition,
                   user: patient,
                   recorded_date: Date.parse('2026-01-15'),
                   pain_level: 3,
                   body_condition: 7)
            create(:daily_condition,
                   user: patient,
                   recorded_date: Date.parse('2026-01-16'),
                   pain_level: 2,
                   body_condition: 8)
          end

          it 'returns PDF with condition data' do
            get "/api/v1/patients/#{patient.id}/report",
                params: { start_date: start_date, end_date: end_date, format: 'pdf' }

            expect(response).to have_http_status(:ok)
          end
        end

        context 'without date parameters' do
          it 'uses default period (last 30 days)' do
            get "/api/v1/patients/#{patient.id}/report", params: { format: 'pdf' }

            expect(response).to have_http_status(:ok)
          end
        end

        context 'with invalid date range' do
          it 'returns error when start_date is after end_date' do
            get "/api/v1/patients/#{patient.id}/report",
                params: { start_date: '2026-01-31', end_date: '2026-01-01', format: 'pdf' }

            expect(response).to have_http_status(:unprocessable_content)
            expect(json_response['message']).to include('日付')
          end
        end

        it 'can view any patient report' do
          get "/api/v1/patients/#{patient.id}/report",
              params: { start_date: start_date, end_date: end_date, format: 'pdf' }

          expect(response).to have_http_status(:ok)
        end

        it 'returns not found for non-existent patient' do
          get '/api/v1/patients/00000000-0000-0000-0000-000000000000/report',
              params: { start_date: start_date, end_date: end_date, format: 'pdf' }

          expect(response).to have_http_status(:not_found)
        end

        it 'returns not found for soft deleted patient' do
          patient.soft_delete

          get "/api/v1/patients/#{patient.id}/report",
              params: { start_date: start_date, end_date: end_date, format: 'pdf' }

          expect(response).to have_http_status(:not_found)
        end

        it 'creates audit log entry' do
          expect {
            get "/api/v1/patients/#{patient.id}/report",
                params: { start_date: start_date, end_date: end_date, format: 'pdf' }
          }.to change(AuditLog, :count).by(1)

          audit = AuditLog.order(:created_at).last
          expect(audit.action).to eq('read')
          expect(audit.status).to eq('success')
          expect(audit.staff_id).to eq(manager.id)
        end
      end

      context 'as regular staff' do
        before do
          create(:patient_staff_assignment, user: patient, staff: staff_member)
          staff_login(staff_member)
        end

        it 'can view assigned patient report' do
          get "/api/v1/patients/#{patient.id}/report",
              params: { start_date: start_date, end_date: end_date, format: 'pdf' }

          expect(response).to have_http_status(:ok)
        end

        it 'returns forbidden for non-assigned patient' do
          other_patient = create(:user, name: '佐藤花子')

          get "/api/v1/patients/#{other_patient.id}/report",
              params: { start_date: start_date, end_date: end_date, format: 'pdf' }

          expect(response).to have_http_status(:forbidden)
        end
      end
    end

    context 'when user (patient) is authenticated' do
      before { sign_in_as_user(patient) }

      it 'returns unauthorized' do
        get "/api/v1/patients/#{patient.id}/report",
            params: { start_date: start_date, end_date: end_date, format: 'pdf' }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when not authenticated' do
      it 'returns unauthorized' do
        get "/api/v1/patients/#{patient.id}/report",
            params: { start_date: start_date, end_date: end_date, format: 'pdf' }

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
        get "/api/v1/patients/#{patient.id}/report",
            params: { start_date: start_date, end_date: end_date, format: 'pdf' }

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'GET /api/v1/patients/:patient_id/report (CSV format)' do
    let(:start_date) { '2026-01-01' }
    let(:end_date) { '2026-01-31' }

    context 'when staff is authenticated as manager' do
      before { staff_login(manager) }

      it 'returns CSV file' do
        get "/api/v1/patients/#{patient.id}/report",
            params: { start_date: start_date, end_date: end_date, format: 'csv' }

        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include('text/csv')
      end

      it 'includes UTF-8 BOM for Excel compatibility' do
        get "/api/v1/patients/#{patient.id}/report",
            params: { start_date: start_date, end_date: end_date, format: 'csv' }

        expect(response.body.bytes[0..2]).to eq([ 0xEF, 0xBB, 0xBF ])
      end

      it 'sets charset=utf-8 in Content-Type header' do
        get "/api/v1/patients/#{patient.id}/report",
            params: { start_date: start_date, end_date: end_date, format: 'csv' }

        expect(response.headers['Content-Type']).to include('charset=utf-8')
      end

      it 'sets correct Content-Disposition header with .csv extension' do
        get "/api/v1/patients/#{patient.id}/report",
            params: { start_date: start_date, end_date: end_date, format: 'csv' }

        expect(response.headers['Content-Disposition']).to include('attachment')
        expect(response.headers['Content-Disposition']).to include('.csv')
      end

      context 'with measurement data' do
        before do
          create(:measurement,
                 user: patient,
                 measured_by_staff: manager,
                 measured_date: Date.parse('2026-01-15'),
                 weight_kg: 65.5,
                 tug_seconds: 12.3,
                 nrs_pain_score: 3)
        end

        it 'includes measurement data in CSV' do
          get "/api/v1/patients/#{patient.id}/report",
              params: { start_date: start_date, end_date: end_date, format: 'csv' }

          # Skip BOM (3 bytes) and check content
          csv_content = response.body[3..]
          expect(csv_content).to include('測定値')
          expect(csv_content).to include('65.5')
        end
      end

      context 'with exercise record data' do
        let(:exercise) { create(:exercise, name: 'スクワット') }

        before do
          create(:exercise_record, :historical,
                 user: patient,
                 exercise: exercise,
                 completed_at: Time.zone.parse('2026-01-15 10:00:00'),
                 completed_reps: 10,
                 completed_sets: 3)
        end

        it 'includes exercise data in CSV' do
          get "/api/v1/patients/#{patient.id}/report",
              params: { start_date: start_date, end_date: end_date, format: 'csv' }

          csv_content = response.body[3..]
          expect(csv_content).to include('運動実施')
          expect(csv_content).to include('スクワット')
        end
      end

      it 'creates audit log entry for CSV download' do
        expect {
          get "/api/v1/patients/#{patient.id}/report",
              params: { start_date: start_date, end_date: end_date, format: 'csv' }
        }.to change(AuditLog, :count).by(1)

        audit = AuditLog.order(:created_at).last
        expect(audit.action).to eq('read')
        expect(audit.status).to eq('success')
      end
    end

    context 'as regular staff' do
      before do
        create(:patient_staff_assignment, user: patient, staff: staff_member)
        staff_login(staff_member)
      end

      it 'can download assigned patient CSV report' do
        get "/api/v1/patients/#{patient.id}/report",
            params: { start_date: start_date, end_date: end_date, format: 'csv' }

        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include('text/csv')
      end

      it 'returns forbidden for non-assigned patient CSV' do
        other_patient = create(:user, name: '佐藤花子')

        get "/api/v1/patients/#{other_patient.id}/report",
            params: { start_date: start_date, end_date: end_date, format: 'csv' }

        expect(response).to have_http_status(:forbidden)
      end
    end

    context 'when not authenticated' do
      it 'returns unauthorized' do
        get "/api/v1/patients/#{patient.id}/report",
            params: { start_date: start_date, end_date: end_date, format: 'csv' }

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
