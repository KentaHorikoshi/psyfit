# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Auth', type: :request do
  # Use factory default password for consistency
  let(:default_password) { 'Staff123!' }
  let(:user_password) { 'Password123!' }

  describe 'POST /api/v1/auth/staff/login' do
    let!(:staff) { create(:staff, staff_id: 'yamada') }

    context 'when credentials are valid' do
      it 'returns success with staff info' do
        post '/api/v1/auth/staff/login', params: {
          staff_id: 'yamada',
          password: default_password
        }

        expect(response).to have_http_status(:ok)
        expect(json_response['status']).to eq('success')
        expect(json_response['data']['staff']).to include(
          'id' => staff.id,
          'staff_id' => 'yamada',
          'role' => 'staff'
        )
      end

      it 'creates a session' do
        post '/api/v1/auth/staff/login', params: {
          staff_id: 'yamada',
          password: default_password
        }

        # Verify session by calling /me endpoint
        get '/api/v1/auth/me'
        expect(response).to have_http_status(:ok)
        expect(json_response['data']['staff']['id']).to eq(staff.id)
      end

      it 'resets failed login count on successful login' do
        staff.update!(failed_login_count: 3)

        post '/api/v1/auth/staff/login', params: {
          staff_id: 'yamada',
          password: default_password
        }

        expect(response).to have_http_status(:ok)
        expect(staff.reload.failed_login_count).to eq(0)
      end

      it 'records successful login in audit log' do
        expect {
          post '/api/v1/auth/staff/login', params: {
            staff_id: 'yamada',
            password: default_password
          }
        }.to change(AuditLog, :count).by(1)

        log = AuditLog.recent.first
        expect(log.action).to eq('login')
        expect(log.status).to eq('success')
        expect(log.staff_id).to eq(staff.id)
        expect(log.user_type).to eq('staff')
      end

      context 'when staff is a manager' do
        let!(:manager) { create(:staff, :manager, staff_id: 'manager01') }

        it 'returns role as manager' do
          post '/api/v1/auth/staff/login', params: {
            staff_id: 'manager01',
            password: default_password
          }

          expect(response).to have_http_status(:ok)
          expect(json_response['data']['staff']['role']).to eq('manager')
        end
      end
    end

    context 'when staff_id is invalid' do
      it 'returns unauthorized error' do
        post '/api/v1/auth/staff/login', params: {
          staff_id: 'nonexistent',
          password: default_password
        }

        expect(response).to have_http_status(:unauthorized)
        expect(json_response['status']).to eq('error')
        expect(json_response['message']).to include('正しくありません')
      end

      it 'records failed login in audit log' do
        expect {
          post '/api/v1/auth/staff/login', params: {
            staff_id: 'nonexistent',
            password: default_password
          }
        }.to change(AuditLog, :count).by(1)

        log = AuditLog.recent.first
        expect(log.action).to eq('login_failed')
        expect(log.status).to eq('failure')
      end
    end

    context 'when password is invalid' do
      it 'returns unauthorized error' do
        post '/api/v1/auth/staff/login', params: {
          staff_id: 'yamada',
          password: 'WrongPassword123'
        }

        expect(response).to have_http_status(:unauthorized)
        expect(json_response['status']).to eq('error')
      end

      it 'increments failed login count' do
        expect {
          post '/api/v1/auth/staff/login', params: {
            staff_id: 'yamada',
            password: 'WrongPassword123'
          }
        }.to change { staff.reload.failed_login_count }.by(1)
      end

      it 'records failed login in audit log' do
        expect {
          post '/api/v1/auth/staff/login', params: {
            staff_id: 'yamada',
            password: 'WrongPassword123'
          }
        }.to change(AuditLog, :count).by(1)

        log = AuditLog.recent.first
        expect(log.action).to eq('login_failed')
        expect(log.status).to eq('failure')
      end
    end

    context 'when account is locked' do
      let!(:locked_staff) { create(:staff, :locked, staff_id: 'locked_user') }

      it 'returns unauthorized error with lockout message' do
        post '/api/v1/auth/staff/login', params: {
          staff_id: 'locked_user',
          password: default_password
        }

        expect(response).to have_http_status(:unauthorized)
        expect(json_response['message']).to include('ロックされています')
      end

      it 'records locked account login attempt in audit log' do
        expect {
          post '/api/v1/auth/staff/login', params: {
            staff_id: 'locked_user',
            password: default_password
          }
        }.to change(AuditLog, :count).by(1)

        log = AuditLog.recent.first
        expect(log.action).to eq('login_failed')
        expect(JSON.parse(log.additional_info)['reason']).to eq('account_locked')
      end
    end

    context 'when lock period has expired' do
      let!(:expired_lock_staff) { create(:staff, :lock_expired, staff_id: 'expired_lock') }

      it 'allows login after lock expires' do
        post '/api/v1/auth/staff/login', params: {
          staff_id: 'expired_lock',
          password: default_password
        }

        expect(response).to have_http_status(:ok)
        expect(json_response['status']).to eq('success')
      end
    end

    context 'when staff is soft deleted' do
      let!(:deleted_staff) { create(:staff, :deleted, staff_id: 'deleted_user') }

      it 'returns unauthorized error' do
        post '/api/v1/auth/staff/login', params: {
          staff_id: 'deleted_user',
          password: default_password
        }

        expect(response).to have_http_status(:unauthorized)
        expect(json_response['status']).to eq('error')
      end
    end

    context 'account lockout after 5 failed attempts' do
      it 'locks account after 5 consecutive failed attempts' do
        5.times do
          post '/api/v1/auth/staff/login', params: {
            staff_id: 'yamada',
            password: 'WrongPassword'
          }
        end

        expect(staff.reload.locked?).to be true
        expect(staff.locked_until).to be > Time.current
      end

      it 'returns lockout message on 6th attempt' do
        5.times do
          post '/api/v1/auth/staff/login', params: {
            staff_id: 'yamada',
            password: 'WrongPassword'
          }
        end

        # 6th attempt with correct password should still fail
        post '/api/v1/auth/staff/login', params: {
          staff_id: 'yamada',
          password: default_password
        }

        expect(response).to have_http_status(:unauthorized)
        expect(json_response['message']).to include('ロックされています')
      end
    end
  end

  describe 'GET /api/v1/auth/me' do
    context 'when staff is authenticated' do
      let!(:staff) { create(:staff, staff_id: 'teststaff') }

      before do
        post '/api/v1/auth/staff/login', params: {
          staff_id: 'teststaff',
          password: default_password
        }
      end

      it 'returns current staff info' do
        get '/api/v1/auth/me'

        expect(response).to have_http_status(:ok)
        expect(json_response['status']).to eq('success')
        expect(json_response['data']['staff']).to include(
          'id' => staff.id,
          'staff_id' => 'teststaff'
        )
      end
    end

    context 'when user is authenticated' do
      let!(:user) { create(:user) }

      before do
        post '/api/v1/auth/login', params: {
          email: user.email,
          password: user_password
        }
      end

      it 'returns current user info' do
        get '/api/v1/auth/me'

        expect(response).to have_http_status(:ok)
        expect(json_response['status']).to eq('success')
        expect(json_response['data']['user']).to include(
          'id' => user.id
        )
      end
    end

    context 'when not authenticated' do
      it 'returns unauthorized error' do
        get '/api/v1/auth/me'

        expect(response).to have_http_status(:unauthorized)
        expect(json_response['status']).to eq('error')
        expect(json_response['message']).to include('認証')
      end
    end

    context 'session timeout' do
      let!(:staff) { create(:staff, staff_id: 'timeouttest') }

      context 'staff session (15 minutes timeout)' do
        it 'invalidates session after 15 minutes of inactivity' do
          post '/api/v1/auth/staff/login', params: {
            staff_id: 'timeouttest',
            password: default_password
          }

          # Advance time by 16 minutes
          Timecop.travel(16.minutes.from_now) do
            get '/api/v1/auth/me'

            expect(response).to have_http_status(:unauthorized)
            expect(json_response['message']).to include('認証')
          end
        end

        it 'keeps session valid within 15 minutes' do
          post '/api/v1/auth/staff/login', params: {
            staff_id: 'timeouttest',
            password: default_password
          }

          # Advance time by 14 minutes
          Timecop.travel(14.minutes.from_now) do
            get '/api/v1/auth/me'

            expect(response).to have_http_status(:ok)
            expect(json_response['data']['staff']['id']).to eq(staff.id)
          end
        end

        it 'extends session on activity' do
          post '/api/v1/auth/staff/login', params: {
            staff_id: 'timeouttest',
            password: default_password
          }

          # Activity at 10 minutes (extends session)
          Timecop.travel(10.minutes.from_now) do
            get '/api/v1/auth/me'
            expect(response).to have_http_status(:ok)
          end

          # Check session at 20 minutes from original (but only 10 from last activity)
          Timecop.travel(20.minutes.from_now) do
            get '/api/v1/auth/me'
            expect(response).to have_http_status(:ok)
          end
        end
      end

      context 'user session (30 minutes timeout)' do
        let!(:user) { create(:user) }

        it 'invalidates session after 30 minutes of inactivity' do
          post '/api/v1/auth/login', params: {
            email: user.email,
            password: user_password
          }

          Timecop.travel(31.minutes.from_now) do
            get '/api/v1/auth/me'

            expect(response).to have_http_status(:unauthorized)
          end
        end

        it 'keeps session valid within 30 minutes' do
          post '/api/v1/auth/login', params: {
            email: user.email,
            password: user_password
          }

          Timecop.travel(29.minutes.from_now) do
            get '/api/v1/auth/me'

            expect(response).to have_http_status(:ok)
          end
        end
      end
    end
  end

  describe 'DELETE /api/v1/auth/logout' do
    let!(:staff) { create(:staff, staff_id: 'logouttest') }

    context 'when staff is authenticated' do
      before do
        post '/api/v1/auth/staff/login', params: {
          staff_id: 'logouttest',
          password: default_password
        }
      end

      it 'returns success message' do
        delete '/api/v1/auth/logout'

        expect(response).to have_http_status(:ok)
        expect(json_response['status']).to eq('success')
        expect(json_response['data']['message']).to include('ログアウト')
      end

      it 'invalidates the session' do
        delete '/api/v1/auth/logout'

        get '/api/v1/auth/me'
        expect(response).to have_http_status(:unauthorized)
      end

      it 'records logout in audit log' do
        expect {
          delete '/api/v1/auth/logout'
        }.to change(AuditLog, :count).by(1)

        log = AuditLog.recent.first
        expect(log.action).to eq('logout')
        expect(log.status).to eq('success')
        expect(log.staff_id).to eq(staff.id)
      end
    end

    context 'when user is authenticated' do
      let!(:user) { create(:user) }

      before do
        post '/api/v1/auth/login', params: {
          email: user.email,
          password: user_password
        }
      end

      it 'returns success message' do
        delete '/api/v1/auth/logout'

        expect(response).to have_http_status(:ok)
        expect(json_response['status']).to eq('success')
      end

      it 'records logout in audit log with user' do
        expect {
          delete '/api/v1/auth/logout'
        }.to change(AuditLog, :count).by(1)

        log = AuditLog.recent.first
        expect(log.action).to eq('logout')
        expect(log.status).to eq('success')
        expect(log.user_id).to eq(user.id)
      end
    end

    context 'when not authenticated' do
      it 'still returns success (idempotent)' do
        delete '/api/v1/auth/logout'

        expect(response).to have_http_status(:ok)
        expect(json_response['status']).to eq('success')
      end
    end
  end

  describe 'POST /api/v1/auth/login (User Login)' do
    let!(:user) { create(:user) }

    context 'when credentials are valid' do
      it 'returns success with user info' do
        post '/api/v1/auth/login', params: {
          email: user.email,
          password: user_password
        }

        expect(response).to have_http_status(:ok)
        expect(json_response['status']).to eq('success')
        expect(json_response['data']['user']).to include(
          'id' => user.id
        )
      end

      it 'records successful login in audit log' do
        expect {
          post '/api/v1/auth/login', params: {
            email: user.email,
            password: user_password
          }
        }.to change(AuditLog, :count).by(1)

        log = AuditLog.recent.first
        expect(log.action).to eq('login')
        expect(log.status).to eq('success')
        expect(log.user_id).to eq(user.id)
        expect(log.user_type).to eq('user')
      end
    end

    context 'when email is invalid' do
      it 'returns unauthorized error' do
        post '/api/v1/auth/login', params: {
          email: 'nonexistent@example.com',
          password: user_password
        }

        expect(response).to have_http_status(:unauthorized)
        expect(json_response['status']).to eq('error')
      end

      it 'records failed login in audit log' do
        expect {
          post '/api/v1/auth/login', params: {
            email: 'nonexistent@example.com',
            password: user_password
          }
        }.to change(AuditLog, :count).by(1)

        log = AuditLog.recent.first
        expect(log.action).to eq('login_failed')
        expect(log.status).to eq('failure')
      end
    end

    context 'when password is invalid' do
      it 'increments failed login count' do
        expect {
          post '/api/v1/auth/login', params: {
            email: user.email,
            password: 'WrongPassword'
          }
        }.to change { user.reload.failed_login_count }.by(1)
      end
    end

    context 'when user account is locked' do
      let!(:locked_user) { create(:user, :locked) }

      it 'returns unauthorized error with lockout message' do
        post '/api/v1/auth/login', params: {
          email: locked_user.email,
          password: user_password
        }

        expect(response).to have_http_status(:unauthorized)
        expect(json_response['message']).to include('ロックされています')
      end

      it 'records locked account login attempt in audit log' do
        expect {
          post '/api/v1/auth/login', params: {
            email: locked_user.email,
            password: user_password
          }
        }.to change(AuditLog, :count).by(1)

        log = AuditLog.recent.first
        expect(log.action).to eq('login_failed')
        expect(JSON.parse(log.additional_info)['reason']).to eq('account_locked')
      end
    end

    context 'account lockout after 5 failed attempts (30 min for users)' do
      it 'locks account after 5 consecutive failed attempts' do
        5.times do
          post '/api/v1/auth/login', params: {
            email: user.email,
            password: 'WrongPassword'
          }
        end

        expect(user.reload.locked?).to be true
        expect(user.locked_until).to be > Time.current
        expect(user.locked_until).to be <= 30.minutes.from_now
      end
    end
  end
end
