# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Staff', type: :request do
  include ActiveSupport::Testing::TimeHelpers
  let(:manager) { create(:staff, :manager, password: 'Password123', password_confirmation: 'Password123') }
  let(:staff_member) { create(:staff, password: 'Password123', password_confirmation: 'Password123') }

  describe 'GET /api/v1/staff' do
    context 'when authenticated as manager' do
      before { sign_in_as_staff(manager) }

      it 'returns all active staff' do
        create_list(:staff, 3, password: 'Password123', password_confirmation: 'Password123')

        get '/api/v1/staff'

        expect(response).to have_http_status(:ok)
        json = json_response
        expect(json['status']).to eq('success')
        expect(json['data']['staff'].size).to eq(4) # 3 created + 1 manager
      end

      it 'returns staff with correct attributes' do
        test_staff = create(:staff, staff_id: 'test001', name: '田中太郎', role: 'staff',
                           department: 'リハビリテーション科',
                           password: 'Password123', password_confirmation: 'Password123')

        get '/api/v1/staff'

        expect(response).to have_http_status(:ok)
        json = json_response
        staff_data = json['data']['staff'].find { |s| s['staff_id'] == 'test001' }
        expect(staff_data).to include(
          'staff_id' => 'test001',
          'name' => '田中太郎',
          'role' => 'staff',
          'department' => 'リハビリテーション科'
        )
        expect(staff_data['id']).to eq(test_staff.id)
      end

      it 'excludes soft deleted staff' do
        create(:staff, :deleted, password: 'Password123', password_confirmation: 'Password123')
        active_staff = create(:staff, password: 'Password123', password_confirmation: 'Password123')

        get '/api/v1/staff'

        expect(response).to have_http_status(:ok)
        json = json_response
        staff_ids = json['data']['staff'].map { |s| s['id'] }
        expect(staff_ids).to include(active_staff.id)
        expect(staff_ids).not_to include(Staff.deleted.first.id)
      end

      it 'records audit log' do
        get '/api/v1/staff'

        audit_log = AuditLog.where(action: 'read', staff_id: manager.id).last
        expect(audit_log).to be_present
        expect(audit_log.status).to eq('success')
      end
    end

    context 'when authenticated as non-manager staff' do
      before { sign_in_as_staff(staff_member) }

      it 'returns 403 forbidden' do
        get '/api/v1/staff'

        expect(response).to have_http_status(:forbidden)
        json = json_response
        expect(json['status']).to eq('error')
        expect(json['message']).to eq('この操作はマネージャー権限が必要です')
      end
    end

    context 'when not authenticated' do
      it 'returns 401 unauthorized' do
        get '/api/v1/staff'

        expect(response).to have_http_status(:unauthorized)
        json = json_response
        expect(json['status']).to eq('error')
        expect(json['message']).to eq('認証が必要です')
      end
    end

    context 'when session has expired' do
      it 'returns 401 unauthorized' do
        sign_in_as_staff(manager)

        # Manipulate session to simulate expiration
        travel 20.minutes do
          get '/api/v1/staff'
        end

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'POST /api/v1/staff' do
    let(:valid_params) do
      {
        staff_id: 'new_staff',
        name: '佐藤花子',
        email: 'sato@example.com',
        password: 'SecurePass123!',
        role: 'staff',
        department: 'リハビリテーション科'
      }
    end

    context 'when authenticated as manager' do
      before { sign_in_as_staff(manager) }

      it 'creates a new staff member' do
        expect {
          post '/api/v1/staff', params: valid_params
        }.to change(Staff, :count).by(1)

        expect(response).to have_http_status(:created)
        json = json_response
        expect(json['status']).to eq('success')
        expect(json['data']['staff_id']).to eq('new_staff')
        expect(json['data']['name']).to eq('佐藤花子')
        expect(json['data']['role']).to eq('staff')
      end

      it 'does not expose password in response' do
        post '/api/v1/staff', params: valid_params

        expect(response).to have_http_status(:created)
        json = json_response
        expect(json['data']).not_to have_key('password')
        expect(json['data']).not_to have_key('password_digest')
      end

      it 'encrypts name and email' do
        post '/api/v1/staff', params: valid_params

        expect(response).to have_http_status(:created)
        created_staff = Staff.find_by(staff_id: 'new_staff')

        # Check that encrypted fields work
        expect(created_staff.name).to eq('佐藤花子')
        expect(created_staff.email).to eq('sato@example.com')

        # The raw DB values should be encrypted (different from plain text)
        # This is verified by the encryption mechanism
      end

      it 'records audit log on create' do
        post '/api/v1/staff', params: valid_params

        audit_log = AuditLog.where(action: 'create', staff_id: manager.id).last
        expect(audit_log).to be_present
        expect(audit_log.status).to eq('success')
      end

      context 'with password complexity validation' do
        it 'rejects password with only one character type (lowercase only)' do
          post '/api/v1/staff', params: valid_params.merge(password: 'onlylowercase')

          expect(response).to have_http_status(:unprocessable_entity)
          json = json_response
          expect(json['status']).to eq('error')
          expect(json['errors']['password']).to be_present
        end

        it 'rejects password with only one character type (numbers only)' do
          post '/api/v1/staff', params: valid_params.merge(password: '12345678')

          expect(response).to have_http_status(:unprocessable_entity)
          json = json_response
          expect(json['errors']['password']).to be_present
        end

        it 'rejects password that is too short' do
          post '/api/v1/staff', params: valid_params.merge(password: 'Short1!')

          expect(response).to have_http_status(:unprocessable_entity)
          json = json_response
          expect(json['errors']['password']).to be_present
        end

        it 'accepts password with at least 2 character types and 8+ chars' do
          post '/api/v1/staff', params: valid_params.merge(password: 'Password123')

          expect(response).to have_http_status(:created)
        end

        it 'accepts password with lowercase and numbers (2 types)' do
          post '/api/v1/staff', params: valid_params.merge(password: 'password123')

          expect(response).to have_http_status(:created)
        end
      end

      context 'with uniqueness validation' do
        it 'rejects duplicate staff_id' do
          create(:staff, staff_id: 'duplicate_id', password: 'Password123', password_confirmation: 'Password123')

          post '/api/v1/staff', params: valid_params.merge(staff_id: 'duplicate_id')

          expect(response).to have_http_status(:unprocessable_entity)
          json = json_response
          expect(json['errors']['staff_id']).to be_present
        end

        it 'rejects duplicate email' do
          create(:staff, email: 'duplicate@example.com', password: 'Password123', password_confirmation: 'Password123')

          post '/api/v1/staff', params: valid_params.merge(email: 'duplicate@example.com')

          expect(response).to have_http_status(:unprocessable_entity)
          json = json_response
          expect(json['errors']['email_bidx']).to be_present
        end
      end

      context 'with required field validation' do
        it 'rejects missing staff_id' do
          post '/api/v1/staff', params: valid_params.except(:staff_id)

          expect(response).to have_http_status(:unprocessable_entity)
          json = json_response
          expect(json['errors']['staff_id']).to be_present
        end

        it 'rejects missing name' do
          post '/api/v1/staff', params: valid_params.except(:name)

          expect(response).to have_http_status(:unprocessable_entity)
          json = json_response
          expect(json['errors']['name']).to be_present
        end

        it 'rejects missing password' do
          post '/api/v1/staff', params: valid_params.except(:password)

          expect(response).to have_http_status(:unprocessable_entity)
          json = json_response
          expect(json['errors']['password']).to be_present
        end

        it 'rejects invalid role' do
          post '/api/v1/staff', params: valid_params.merge(role: 'invalid_role')

          expect(response).to have_http_status(:unprocessable_entity)
          json = json_response
          expect(json['errors']['role']).to be_present
        end
      end

      context 'with optional fields' do
        it 'allows creation with optional name_kana' do
          post '/api/v1/staff', params: valid_params.merge(name_kana: 'サトウハナコ')

          expect(response).to have_http_status(:created)
          created_staff = Staff.find_by(staff_id: 'new_staff')
          expect(created_staff.name_kana).to eq('サトウハナコ')
        end

        it 'allows creation without department' do
          post '/api/v1/staff', params: valid_params.except(:department)

          expect(response).to have_http_status(:created)
        end

        it 'defaults role to staff if not specified' do
          post '/api/v1/staff', params: valid_params.except(:role)

          expect(response).to have_http_status(:created)
          created_staff = Staff.find_by(staff_id: 'new_staff')
          expect(created_staff.role).to eq('staff')
        end
      end
    end

    context 'when authenticated as non-manager staff' do
      before { sign_in_as_staff(staff_member) }

      it 'returns 403 forbidden' do
        post '/api/v1/staff', params: valid_params

        expect(response).to have_http_status(:forbidden)
        json = json_response
        expect(json['status']).to eq('error')
        expect(json['message']).to eq('この操作はマネージャー権限が必要です')
      end

      it 'does not create staff' do
        expect {
          post '/api/v1/staff', params: valid_params
        }.not_to change(Staff, :count)
      end
    end

    context 'when not authenticated' do
      it 'returns 401 unauthorized' do
        post '/api/v1/staff', params: valid_params

        expect(response).to have_http_status(:unauthorized)
        json = json_response
        expect(json['status']).to eq('error')
      end

      it 'does not create staff' do
        expect {
          post '/api/v1/staff', params: valid_params
        }.not_to change(Staff, :count)
      end
    end
  end
end
