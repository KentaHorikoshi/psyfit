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
          staff_login(staff_member)
        end

        it 'returns all patients' do
          get '/api/v1/patients'

          expect(response).to have_http_status(:ok)
          expect(json_response['data']['patients'].length).to eq(3)
        end

        it 'returns correct pagination for all patients' do
          get '/api/v1/patients'

          expect(json_response['data']['meta']['total']).to eq(3)
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
          staff_login(staff_member)
        end

        it 'can view any patient' do
          get "/api/v1/patients/#{patient_acute.id}"

          expect(response).to have_http_status(:ok)
          expect(json_response['data']['id']).to eq(patient_acute.id)
        end

        it 'can view non-assigned patient' do
          get "/api/v1/patients/#{patient_maintenance.id}"

          expect(response).to have_http_status(:ok)
          expect(json_response['data']['id']).to eq(patient_maintenance.id)
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

  describe 'POST /api/v1/patients' do
    let(:valid_params) do
      {
        name: '新規 太郎',
        name_kana: 'シンキ タロウ',
        email: 'shinki@example.com',
        birth_date: '1980-01-01',
        password: 'Patient1!',
        gender: 'male',
        phone: '090-1234-5678',
        status: '回復期',
        condition: '変形性膝関節症'
      }
    end

    context 'when authenticated as manager' do
      before { staff_login(manager) }

      it 'creates a patient successfully with auto-generated user_code' do
        expect {
          post '/api/v1/patients', params: valid_params
        }.to change(User, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(json_response['status']).to eq('success')
        expect(json_response['data']).to include(
          'id',
          'name' => '新規 太郎',
          'email' => 'shinki@example.com',
          'status' => '回復期',
          'message' => '患者を登録しました。初期パスワードは別途お知らせください。'
        )
        expect(json_response['data']['user_code']).to match(/\AUSR\d{3,}\z/)
      end

      it 'returns 422 when email is duplicated' do
        create(:user, email: 'shinki@example.com')

        post '/api/v1/patients', params: valid_params

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['status']).to eq('error')
        expect(json_response['errors']).to have_key('email_bidx')
      end

      it 'returns 422 when required fields are missing' do
        post '/api/v1/patients', params: { name: '太郎' }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['status']).to eq('error')
      end

      it 'returns 422 when password is too weak' do
        post '/api/v1/patients', params: valid_params.merge(password: 'weak')

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['errors']).to have_key('password')
      end

      it 'returns 422 when status is invalid' do
        post '/api/v1/patients', params: valid_params.merge(status: '無効な状態')

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['errors']).to have_key('status')
      end

      it 'returns 422 when gender is invalid' do
        post '/api/v1/patients', params: valid_params.merge(gender: 'invalid')

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['errors']).to have_key('gender')
      end

      it 'returns 422 when birth_date is in the future' do
        post '/api/v1/patients', params: valid_params.merge(birth_date: 1.year.from_now.to_date.to_s)

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['errors']).to have_key('birth_date')
      end

      it 'encrypts PII fields in database' do
        post '/api/v1/patients', params: valid_params

        user = User.find(json_response['data']['id'])

        # Encrypted fields should be readable via model but stored encrypted
        expect(user.name).to eq('新規 太郎')
        expect(user.email).to eq('shinki@example.com')

        # Verify raw database values are encrypted (not plaintext)
        raw = ActiveRecord::Base.connection.select_one(
          "SELECT name_encrypted, email_encrypted FROM users WHERE id = '#{user.id}'"
        )
        expect(raw['name_encrypted']).not_to eq('新規 太郎')
        expect(raw['email_encrypted']).not_to eq('shinki@example.com')
      end

      it 'creates audit log entry' do
        expect {
          post '/api/v1/patients', params: valid_params
        }.to change(AuditLog, :count).by(1)

        audit = AuditLog.order(:created_at).last
        expect(audit.action).to eq('create')
        expect(audit.status).to eq('success')
        expect(audit.staff_id).to eq(manager.id)
        info = JSON.parse(audit.additional_info)
        expect(info['resource_type']).to eq('Patient')
      end

      context 'with assigned_staff_ids' do
        it 'creates patient with staff assignments' do
          expect {
            post '/api/v1/patients', params: valid_params.merge(
              assigned_staff_ids: [ staff_member.id, other_staff.id ]
            )
          }.to change(User, :count).by(1)
            .and change(PatientStaffAssignment, :count).by(2)

          expect(response).to have_http_status(:created)

          patient = User.find(json_response['data']['id'])
          assignments = patient.patient_staff_assignments.order(:created_at)
          expect(assignments.length).to eq(2)
          expect(assignments.first.staff_id).to eq(staff_member.id)
          expect(assignments.first.is_primary).to be true
          expect(assignments.second.staff_id).to eq(other_staff.id)
          expect(assignments.second.is_primary).to be false
        end

        it 'creates patient without assignments when assigned_staff_ids is empty' do
          expect {
            post '/api/v1/patients', params: valid_params.merge(assigned_staff_ids: [])
          }.to change(User, :count).by(1)
            .and change(PatientStaffAssignment, :count).by(0)

          expect(response).to have_http_status(:created)
        end

        it 'returns 422 and rolls back when assigned_staff_ids contains invalid staff id' do
          expect {
            post '/api/v1/patients', params: valid_params.merge(
              assigned_staff_ids: [ '00000000-0000-0000-0000-000000000000' ]
            )
          }.not_to change(User, :count)

          expect(response).to have_http_status(:unprocessable_entity)
        end
      end
    end

    context 'when authenticated as regular staff' do
      before { staff_login(staff_member) }

      it 'creates a patient successfully' do
        expect {
          post '/api/v1/patients', params: valid_params
        }.to change(User, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(json_response['status']).to eq('success')
      end
    end

    context 'when not authenticated' do
      it 'returns 401 Unauthorized' do
        post '/api/v1/patients', params: valid_params

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when session is expired' do
      before do
        staff_login(manager)
        Timecop.travel(16.minutes.from_now)
      end

      it 'returns 401 Unauthorized' do
        post '/api/v1/patients', params: valid_params

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'PATCH /api/v1/patients/:id' do
    let(:update_params) do
      {
        name: '田中 健一',
        name_kana: 'タナカ ケンイチ',
        email: 'tanaka_new@example.com',
        phone: '090-9876-5432',
        status: '回復期',
        condition: '変形性膝関節症（改善傾向）',
        gender: 'male',
        birth_date: '1960-05-15'
      }
    end

    context 'when authenticated as manager' do
      before { staff_login(manager) }

      it 'updates patient information successfully' do
        patch "/api/v1/patients/#{patient_acute.id}", params: update_params

        expect(response).to have_http_status(:ok)
        expect(json_response['status']).to eq('success')

        data = json_response['data']
        expect(data['name']).to eq('田中 健一')
        expect(data['name_kana']).to eq('タナカ ケンイチ')
        expect(data['email']).to eq('tanaka_new@example.com')
        expect(data['phone']).to eq('090-9876-5432')
        expect(data['status']).to eq('回復期')
        expect(data['condition']).to eq('変形性膝関節症（改善傾向）')
        expect(data['gender']).to eq('male')
        expect(data['birth_date']).to eq('1960-05-15')
      end

      it 'returns all expected fields in response' do
        patch "/api/v1/patients/#{patient_acute.id}", params: update_params

        data = json_response['data']
        expect(data).to include(
          'id', 'name', 'name_kana', 'email', 'birth_date',
          'age', 'gender', 'phone', 'status', 'condition', 'continue_days'
        )
      end

      it 'updates status from 急性期 to 回復期' do
        patch "/api/v1/patients/#{patient_acute.id}", params: { status: '回復期' }

        expect(response).to have_http_status(:ok)
        expect(json_response['data']['status']).to eq('回復期')

        patient_acute.reload
        expect(patient_acute.status).to eq('回復期')
      end

      it 'updates multiple fields simultaneously' do
        patch "/api/v1/patients/#{patient_acute.id}", params: {
          status: '回復期',
          condition: '改善傾向',
          phone: '080-1111-2222'
        }

        expect(response).to have_http_status(:ok)
        data = json_response['data']
        expect(data['status']).to eq('回復期')
        expect(data['condition']).to eq('改善傾向')
        expect(data['phone']).to eq('080-1111-2222')
      end

      it 'updates a single field only (partial update)' do
        original_name = patient_acute.name

        patch "/api/v1/patients/#{patient_acute.id}", params: { phone: '080-9999-0000' }

        expect(response).to have_http_status(:ok)
        expect(json_response['data']['phone']).to eq('080-9999-0000')
        expect(json_response['data']['name']).to eq(original_name)
      end

      it 'returns 422 for invalid status value' do
        patch "/api/v1/patients/#{patient_acute.id}", params: { status: '無効な状態' }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['status']).to eq('error')
        expect(json_response['errors']).to have_key('status')
      end

      it 'returns 422 for invalid gender value' do
        patch "/api/v1/patients/#{patient_acute.id}", params: { gender: 'invalid' }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['status']).to eq('error')
        expect(json_response['errors']).to have_key('gender')
      end

      it 'returns 422 for duplicate email' do
        patch "/api/v1/patients/#{patient_acute.id}", params: { email: patient_recovery.email }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['status']).to eq('error')
        expect(json_response['errors']).to have_key('email_bidx')
      end

      it 'returns 422 for future birth_date' do
        patch "/api/v1/patients/#{patient_acute.id}", params: { birth_date: 1.year.from_now.to_date.to_s }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['status']).to eq('error')
        expect(json_response['errors']).to have_key('birth_date')
      end

      it 'returns 404 for non-existent patient' do
        patch '/api/v1/patients/00000000-0000-0000-0000-000000000000', params: { status: '回復期' }

        expect(response).to have_http_status(:not_found)
      end

      it 'returns 404 for soft deleted patient' do
        patient_acute.soft_delete

        patch "/api/v1/patients/#{patient_acute.id}", params: { status: '回復期' }

        expect(response).to have_http_status(:not_found)
      end

      it 'does not update user_code even if provided' do
        original_code = patient_acute.user_code

        patch "/api/v1/patients/#{patient_acute.id}", params: { user_code: 'HACKED001', name: '更新太郎' }

        expect(response).to have_http_status(:ok)
        patient_acute.reload
        expect(patient_acute.user_code).to eq(original_code)
      end

      it 'does not update password even if provided' do
        original_digest = patient_acute.password_digest

        patch "/api/v1/patients/#{patient_acute.id}", params: { password: 'NewPass1!', name: '更新太郎' }

        expect(response).to have_http_status(:ok)
        patient_acute.reload
        expect(patient_acute.password_digest).to eq(original_digest)
      end

      it 'creates audit log entry' do
        expect {
          patch "/api/v1/patients/#{patient_acute.id}", params: { status: '回復期' }
        }.to change(AuditLog, :count).by(1)

        audit = AuditLog.order(:created_at).last
        expect(audit.action).to eq('update')
        expect(audit.status).to eq('success')
        expect(audit.staff_id).to eq(manager.id)
        info = JSON.parse(audit.additional_info)
        expect(info['resource_type']).to eq('Patient')
        expect(info['resource_id']).to eq(patient_acute.id)
      end
    end

    context 'when authenticated as regular staff' do
      before do
        staff_login(staff_member)
      end

      it 'updates any patient successfully' do
        patch "/api/v1/patients/#{patient_acute.id}", params: { status: '回復期' }

        expect(response).to have_http_status(:ok)
        expect(json_response['data']['status']).to eq('回復期')
      end

      it 'can update non-assigned patient' do
        patch "/api/v1/patients/#{patient_maintenance.id}", params: { status: '回復期' }

        expect(response).to have_http_status(:ok)
        expect(json_response['data']['status']).to eq('回復期')
      end
    end

    context 'when not authenticated' do
      it 'returns 401 Unauthorized' do
        patch "/api/v1/patients/#{patient_acute.id}", params: { status: '回復期' }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when session is expired' do
      before do
        staff_login(manager)
        Timecop.travel(16.minutes.from_now)
      end

      it 'returns 401 Unauthorized' do
        patch "/api/v1/patients/#{patient_acute.id}", params: { status: '回復期' }

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
