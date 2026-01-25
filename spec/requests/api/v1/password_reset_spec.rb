# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Auth Password Reset', type: :request do
  describe 'POST /api/v1/auth/password_reset_request' do
    context 'for user (email)' do
      let!(:user) { create(:user) }

      context 'when email exists' do
        it 'returns success' do
          post '/api/v1/auth/password_reset_request', params: { email: user.email }

          expect(response).to have_http_status(:ok)
          expect(json_response['status']).to eq('success')
          expect(json_response['data']['message']).to include('送信しました')
        end

        it 'creates a password reset token' do
          expect {
            post '/api/v1/auth/password_reset_request', params: { email: user.email }
          }.to change(PasswordResetToken, :count).by(1)

          token = PasswordResetToken.last
          expect(token.user).to eq(user)
          expect(token.staff).to be_nil
          expect(token.expires_at).to be > Time.current
        end

        it 'records password reset request in audit log' do
          expect {
            post '/api/v1/auth/password_reset_request', params: { email: user.email }
          }.to change(AuditLog, :count).by(1)

          log = AuditLog.recent.first
          expect(log.action).to eq('password_reset')
          expect(log.status).to eq('success')
          expect(log.user_id).to eq(user.id)
          expect(JSON.parse(log.additional_info)['step']).to eq('request')
        end
      end

      context 'when email does not exist' do
        it 'still returns success (to prevent email enumeration)' do
          post '/api/v1/auth/password_reset_request', params: { email: 'nonexistent@example.com' }

          expect(response).to have_http_status(:ok)
          expect(json_response['status']).to eq('success')
        end

        it 'does not create a token' do
          expect {
            post '/api/v1/auth/password_reset_request', params: { email: 'nonexistent@example.com' }
          }.not_to change(PasswordResetToken, :count)
        end
      end

      context 'when user is deleted' do
        let!(:deleted_user) { create(:user, :deleted) }

        it 'returns success but does not create token' do
          post '/api/v1/auth/password_reset_request', params: { email: deleted_user.email }

          expect(response).to have_http_status(:ok)
          expect(PasswordResetToken.for_user(deleted_user)).to be_empty
        end
      end
    end

    context 'for staff (staff_id)' do
      let!(:staff) { create(:staff, staff_id: 'test_staff') }

      context 'when staff_id exists' do
        it 'returns success' do
          post '/api/v1/auth/password_reset_request', params: { staff_id: 'test_staff' }

          expect(response).to have_http_status(:ok)
          expect(json_response['status']).to eq('success')
        end

        it 'creates a password reset token for staff' do
          expect {
            post '/api/v1/auth/password_reset_request', params: { staff_id: 'test_staff' }
          }.to change(PasswordResetToken, :count).by(1)

          token = PasswordResetToken.last
          expect(token.staff).to eq(staff)
          expect(token.user).to be_nil
        end

        it 'records password reset request in audit log' do
          expect {
            post '/api/v1/auth/password_reset_request', params: { staff_id: 'test_staff' }
          }.to change(AuditLog, :count).by(1)

          log = AuditLog.recent.first
          expect(log.action).to eq('password_reset')
          expect(log.staff_id).to eq(staff.id)
        end
      end

      context 'when staff_id does not exist' do
        it 'still returns success (to prevent enumeration)' do
          post '/api/v1/auth/password_reset_request', params: { staff_id: 'nonexistent' }

          expect(response).to have_http_status(:ok)
        end
      end

      context 'when staff is deleted' do
        let!(:deleted_staff) { create(:staff, :deleted, staff_id: 'deleted_staff') }

        it 'returns success but does not create token' do
          post '/api/v1/auth/password_reset_request', params: { staff_id: 'deleted_staff' }

          expect(response).to have_http_status(:ok)
          expect(PasswordResetToken.for_staff(deleted_staff)).to be_empty
        end
      end
    end

    context 'when neither email nor staff_id is provided' do
      it 'returns error' do
        post '/api/v1/auth/password_reset_request', params: {}

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['status']).to eq('error')
      end
    end
  end

  describe 'POST /api/v1/auth/password_reset' do
    let(:new_password) { 'NewPassword123!' }

    context 'for user' do
      let!(:user) { create(:user) }
      let!(:reset_token) { PasswordResetToken.generate_for_user(user) }

      context 'when token is valid' do
        it 'returns success' do
          post '/api/v1/auth/password_reset', params: {
            token: reset_token.token,
            new_password: new_password,
            new_password_confirmation: new_password
          }

          expect(response).to have_http_status(:ok)
          expect(json_response['status']).to eq('success')
          expect(json_response['data']['message']).to include('パスワード')
        end

        it 'updates the user password' do
          post '/api/v1/auth/password_reset', params: {
            token: reset_token.token,
            new_password: new_password,
            new_password_confirmation: new_password
          }

          expect(user.reload.authenticate(new_password)).to eq(user)
        end

        it 'marks the token as used' do
          post '/api/v1/auth/password_reset', params: {
            token: reset_token.token,
            new_password: new_password,
            new_password_confirmation: new_password
          }

          expect(reset_token.reload.used?).to be true
        end

        it 'records password reset in audit log' do
          expect {
            post '/api/v1/auth/password_reset', params: {
              token: reset_token.token,
              new_password: new_password,
              new_password_confirmation: new_password
            }
          }.to change(AuditLog, :count).by(1)

          log = AuditLog.recent.first
          expect(log.action).to eq('password_reset')
          expect(log.status).to eq('success')
          expect(log.user_id).to eq(user.id)
          expect(JSON.parse(log.additional_info)['step']).to eq('complete')
        end

        it 'resets failed login count' do
          user.update!(failed_login_count: 3, locked_until: 30.minutes.from_now)

          post '/api/v1/auth/password_reset', params: {
            token: reset_token.token,
            new_password: new_password,
            new_password_confirmation: new_password
          }

          user.reload
          expect(user.failed_login_count).to eq(0)
          expect(user.locked_until).to be_nil
        end
      end

      context 'when token is expired' do
        let!(:expired_token) { create(:password_reset_token, user: user, expires_at: 1.hour.ago) }

        it 'returns error' do
          post '/api/v1/auth/password_reset', params: {
            token: expired_token.token,
            new_password: new_password,
            new_password_confirmation: new_password
          }

          expect(response).to have_http_status(:unprocessable_entity)
          expect(json_response['status']).to eq('error')
          expect(json_response['message']).to include('無効')
        end
      end

      context 'when token is already used' do
        let!(:used_token) { create(:password_reset_token, user: user, used_at: 1.minute.ago) }

        it 'returns error' do
          post '/api/v1/auth/password_reset', params: {
            token: used_token.token,
            new_password: new_password,
            new_password_confirmation: new_password
          }

          expect(response).to have_http_status(:unprocessable_entity)
          expect(json_response['status']).to eq('error')
        end
      end

      context 'when token does not exist' do
        it 'returns error' do
          post '/api/v1/auth/password_reset', params: {
            token: 'nonexistent_token',
            new_password: new_password,
            new_password_confirmation: new_password
          }

          expect(response).to have_http_status(:unprocessable_entity)
          expect(json_response['status']).to eq('error')
        end
      end

      context 'when passwords do not match' do
        it 'returns error' do
          post '/api/v1/auth/password_reset', params: {
            token: reset_token.token,
            new_password: new_password,
            new_password_confirmation: 'DifferentPassword123!'
          }

          expect(response).to have_http_status(:unprocessable_entity)
          expect(json_response['status']).to eq('error')
        end
      end

      context 'when new password is too weak' do
        it 'returns validation error for short password' do
          post '/api/v1/auth/password_reset', params: {
            token: reset_token.token,
            new_password: 'short',
            new_password_confirmation: 'short'
          }

          expect(response).to have_http_status(:unprocessable_entity)
          expect(json_response['status']).to eq('error')
        end

        it 'returns validation error for password without character types' do
          post '/api/v1/auth/password_reset', params: {
            token: reset_token.token,
            new_password: 'alllowercase',
            new_password_confirmation: 'alllowercase'
          }

          expect(response).to have_http_status(:unprocessable_entity)
        end
      end
    end

    context 'for staff' do
      let!(:staff) { create(:staff) }
      let!(:reset_token) { PasswordResetToken.generate_for_staff(staff) }

      context 'when token is valid' do
        it 'returns success' do
          post '/api/v1/auth/password_reset', params: {
            token: reset_token.token,
            new_password: new_password,
            new_password_confirmation: new_password
          }

          expect(response).to have_http_status(:ok)
          expect(json_response['status']).to eq('success')
        end

        it 'updates the staff password' do
          post '/api/v1/auth/password_reset', params: {
            token: reset_token.token,
            new_password: new_password,
            new_password_confirmation: new_password
          }

          expect(staff.reload.authenticate(new_password)).to eq(staff)
        end

        it 'records password reset in audit log for staff' do
          expect {
            post '/api/v1/auth/password_reset', params: {
              token: reset_token.token,
              new_password: new_password,
              new_password_confirmation: new_password
            }
          }.to change(AuditLog, :count).by(1)

          log = AuditLog.recent.first
          expect(log.action).to eq('password_reset')
          expect(log.staff_id).to eq(staff.id)
        end
      end
    end
  end
end
