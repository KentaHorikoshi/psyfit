# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Patients', type: :request do
  let(:manager) { create(:staff, :manager) }
  let(:staff_member) { create(:staff) }
  let(:other_staff) { create(:staff) }

  # Create patients with different statuses
  let!(:patient_acute) { create(:user, :acute, name: '田中太郎') }
  let!(:patient_recovery) { create(:user, :recovery, name: '佐藤花子') }
  let!(:patient_maintenance) { create(:user, :maintenance, name: '鈴木一郎') }

  describe 'GET /api/v1/patients' do
    context 'when staff is authenticated' do
      context 'as manager' do
        before { staff_login(manager) }

        it 'returns all patients' do
          get '/api/v1/patients'

          expect(response).to have_http_status(:ok)
          expect(json_response['status']).to eq('success')
          expect(json_response['data']['patients'].length).to eq(3)
        end

        it 'returns patient data with required fields' do
          get '/api/v1/patients'

          patient = json_response['data']['patients'].first
          expect(patient).to include(
            'id',
            'name',
            'age',
            'gender',
            'status',
            'condition'
          )
        end

        it 'returns pagination metadata' do
          get '/api/v1/patients'

          meta = json_response['data']['meta']
          expect(meta).to include(
            'total',
            'page',
            'per_page',
            'total_pages'
          )
          expect(meta['total']).to eq(3)
        end

        context 'pagination' do
          before do
            # Create additional patients for pagination testing
            create_list(:user, 25)
          end

          it 'returns paginated results with default per_page' do
            get '/api/v1/patients', params: { page: 1 }

            expect(response).to have_http_status(:ok)
            expect(json_response['data']['patients'].length).to eq(20) # default per_page
            expect(json_response['data']['meta']['total']).to eq(28)
            expect(json_response['data']['meta']['total_pages']).to eq(2)
          end

          it 'returns second page' do
            get '/api/v1/patients', params: { page: 2 }

            expect(response).to have_http_status(:ok)
            expect(json_response['data']['patients'].length).to eq(8) # remaining patients
            expect(json_response['data']['meta']['page']).to eq(2)
          end

          it 'respects per_page parameter' do
            get '/api/v1/patients', params: { page: 1, per_page: 10 }

            expect(json_response['data']['patients'].length).to eq(10)
            expect(json_response['data']['meta']['per_page']).to eq(10)
            expect(json_response['data']['meta']['total_pages']).to eq(3)
          end

          it 'limits per_page to maximum 100' do
            get '/api/v1/patients', params: { page: 1, per_page: 200 }

            expect(json_response['data']['meta']['per_page']).to eq(100)
          end
        end

        context 'search' do
          it 'filters patients by name' do
            get '/api/v1/patients', params: { search: '田中' }

            expect(response).to have_http_status(:ok)
            expect(json_response['data']['patients'].length).to eq(1)
            expect(json_response['data']['patients'].first['name']).to eq('田中太郎')
          end

          it 'returns empty array when no match' do
            get '/api/v1/patients', params: { search: '存在しない' }

            expect(response).to have_http_status(:ok)
            expect(json_response['data']['patients']).to eq([])
            expect(json_response['data']['meta']['total']).to eq(0)
          end
        end

        context 'status filter' do
          it 'filters by status 急性期' do
            get '/api/v1/patients', params: { status: '急性期' }

            expect(response).to have_http_status(:ok)
            expect(json_response['data']['patients'].length).to eq(1)
            expect(json_response['data']['patients'].first['status']).to eq('急性期')
          end

          it 'filters by status 回復期' do
            get '/api/v1/patients', params: { status: '回復期' }

            expect(response).to have_http_status(:ok)
            expect(json_response['data']['patients'].length).to eq(1)
            expect(json_response['data']['patients'].first['status']).to eq('回復期')
          end

          it 'filters by status 維持期' do
            get '/api/v1/patients', params: { status: '維持期' }

            expect(response).to have_http_status(:ok)
            expect(json_response['data']['patients'].length).to eq(1)
            expect(json_response['data']['patients'].first['status']).to eq('維持期')
          end
        end

        context 'combined filters' do
          before do
            create(:user, :recovery, name: '田中二郎')
          end

          it 'combines search and status filter' do
            get '/api/v1/patients', params: { search: '田中', status: '回復期' }

            expect(response).to have_http_status(:ok)
            expect(json_response['data']['patients'].length).to eq(1)
            expect(json_response['data']['patients'].first['name']).to eq('田中二郎')
          end
        end

        it 'does not return soft deleted patients' do
          patient_acute.soft_delete

          get '/api/v1/patients'

          expect(json_response['data']['patients'].length).to eq(2)
          patient_ids = json_response['data']['patients'].map { |p| p['id'] }
          expect(patient_ids).not_to include(patient_acute.id)
        end

        it 'includes assigned_staff name when patient has assignment' do
          create(:patient_staff_assignment, :primary, user: patient_acute, staff: staff_member)

          get '/api/v1/patients'

          patient = json_response['data']['patients'].find { |p| p['id'] == patient_acute.id }
          expect(patient['assigned_staff']).to eq(staff_member.name)
        end

        it 'creates audit log entry' do
          expect {
            get '/api/v1/patients'
          }.to change(AuditLog, :count).by(1)

          audit = AuditLog.order(:created_at).last
          expect(audit.action).to eq('read')
          expect(audit.status).to eq('success')
          expect(audit.staff_id).to eq(manager.id)
        end
      end

      context 'as regular staff' do
        before do
          # Assign patient_acute and patient_recovery to staff_member
          create(:patient_staff_assignment, user: patient_acute, staff: staff_member)
          create(:patient_staff_assignment, user: patient_recovery, staff: staff_member)
          # patient_maintenance is assigned to other_staff
          create(:patient_staff_assignment, user: patient_maintenance, staff: other_staff)

          staff_login(staff_member)
        end

        it 'returns only assigned patients' do
          get '/api/v1/patients'

          expect(response).to have_http_status(:ok)
          expect(json_response['data']['patients'].length).to eq(2)

          patient_ids = json_response['data']['patients'].map { |p| p['id'] }
          expect(patient_ids).to include(patient_acute.id, patient_recovery.id)
          expect(patient_ids).not_to include(patient_maintenance.id)
        end

        it 'returns correct pagination for assigned patients only' do
          get '/api/v1/patients'

          expect(json_response['data']['meta']['total']).to eq(2)
        end

        it 'applies search filter to assigned patients only' do
          get '/api/v1/patients', params: { search: '田中' }

          expect(json_response['data']['patients'].length).to eq(1)
          expect(json_response['data']['patients'].first['id']).to eq(patient_acute.id)
        end

        it 'applies status filter to assigned patients only' do
          get '/api/v1/patients', params: { status: '急性期' }

          expect(json_response['data']['patients'].length).to eq(1)
        end
      end
    end

    context 'when user (patient) is authenticated' do
      before { sign_in_as_user(patient_acute) }

      it 'returns unauthorized' do
        get '/api/v1/patients'

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when not authenticated' do
      it 'returns unauthorized' do
        get '/api/v1/patients'

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when session is expired' do
      before do
        staff_login(manager)
        Timecop.travel(16.minutes.from_now)
      end

      it 'returns unauthorized' do
        get '/api/v1/patients'

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'GET /api/v1/patients/:id' do
    context 'when staff is authenticated' do
      context 'as manager' do
        before { staff_login(manager) }

        it 'returns patient details' do
          get "/api/v1/patients/#{patient_acute.id}"

          expect(response).to have_http_status(:ok)
          expect(json_response['status']).to eq('success')
        end

        it 'returns all patient fields' do
          get "/api/v1/patients/#{patient_acute.id}"

          patient = json_response['data']
          expect(patient).to include(
            'id',
            'name',
            'name_kana',
            'birth_date',
            'age',
            'gender',
            'email',
            'phone',
            'condition',
            'status',
            'continue_days'
          )
        end

        it 'returns correct patient data' do
          get "/api/v1/patients/#{patient_acute.id}"

          patient = json_response['data']
          expect(patient['id']).to eq(patient_acute.id)
          expect(patient['name']).to eq('田中太郎')
          expect(patient['status']).to eq('急性期')
        end

        it 'returns assigned_staff array' do
          primary_staff = create(:patient_staff_assignment, :primary, user: patient_acute, staff: staff_member)
          secondary_staff = create(:patient_staff_assignment, user: patient_acute, staff: other_staff)

          get "/api/v1/patients/#{patient_acute.id}"

          assigned_staff = json_response['data']['assigned_staff']
          expect(assigned_staff.length).to eq(2)

          primary = assigned_staff.find { |s| s['is_primary'] == true }
          expect(primary['id']).to eq(staff_member.id)
          expect(primary['name']).to eq(staff_member.name)
        end

        it 'returns empty assigned_staff array when no assignment' do
          get "/api/v1/patients/#{patient_acute.id}"

          expect(json_response['data']['assigned_staff']).to eq([])
        end

        it 'can view any patient' do
          get "/api/v1/patients/#{patient_maintenance.id}"

          expect(response).to have_http_status(:ok)
          expect(json_response['data']['id']).to eq(patient_maintenance.id)
        end

        it 'returns not found for non-existent patient' do
          get '/api/v1/patients/00000000-0000-0000-0000-000000000000'

          expect(response).to have_http_status(:not_found)
        end

        it 'returns not found for soft deleted patient' do
          patient_acute.soft_delete

          get "/api/v1/patients/#{patient_acute.id}"

          expect(response).to have_http_status(:not_found)
        end

        it 'creates audit log entry' do
          expect {
            get "/api/v1/patients/#{patient_acute.id}"
          }.to change(AuditLog, :count).by(1)

          audit = AuditLog.order(:created_at).last
          expect(audit.action).to eq('read')
          expect(audit.status).to eq('success')
          expect(audit.staff_id).to eq(manager.id)
        end
      end

      context 'as regular staff' do
        before do
          create(:patient_staff_assignment, user: patient_acute, staff: staff_member)
          staff_login(staff_member)
        end

        it 'can view assigned patient' do
          get "/api/v1/patients/#{patient_acute.id}"

          expect(response).to have_http_status(:ok)
          expect(json_response['data']['id']).to eq(patient_acute.id)
        end

        it 'returns forbidden for non-assigned patient' do
          get "/api/v1/patients/#{patient_maintenance.id}"

          expect(response).to have_http_status(:forbidden)
          expect(json_response['message']).to include('アクセス権限')
        end
      end
    end

    context 'when user (patient) is authenticated' do
      before { sign_in_as_user(patient_acute) }

      it 'returns unauthorized' do
        get "/api/v1/patients/#{patient_acute.id}"

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when not authenticated' do
      it 'returns unauthorized' do
        get "/api/v1/patients/#{patient_acute.id}"

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
