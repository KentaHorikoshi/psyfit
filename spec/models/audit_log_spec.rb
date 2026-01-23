# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AuditLog, type: :model do
  describe 'validations' do
    it { is_expected.to validate_presence_of(:action) }
    it { is_expected.to validate_presence_of(:status) }
    it { is_expected.to validate_inclusion_of(:status).in_array(%w[success failure]) }
    it { is_expected.to validate_inclusion_of(:user_type).in_array(%w[user staff]).allow_nil }
  end

  describe 'associations' do
    it { is_expected.to belong_to(:user).optional }
    it { is_expected.to belong_to(:staff).optional }
  end

  describe 'scopes' do
    let!(:success_log) { create(:audit_log, :login_success, created_at: 1.hour.ago) }
    let!(:failure_log) { create(:audit_log, :login_failure, created_at: 2.hours.ago) }
    let!(:logout_log) { create(:audit_log, :logout, created_at: 3.hours.ago) }
    let!(:old_log) { create(:audit_log, created_at: 2.weeks.ago) }

    describe '.recent' do
      it 'orders by created_at desc' do
        expect(AuditLog.recent.first).to eq(success_log)
        expect(AuditLog.recent.last).to eq(old_log)
      end
    end

    describe '.successful' do
      it 'returns only success status logs' do
        successful = AuditLog.successful
        expect(successful).to include(success_log, logout_log)
        expect(successful).not_to include(failure_log)
      end
    end

    describe '.failed' do
      it 'returns only failure status logs' do
        failed = AuditLog.failed
        expect(failed).to include(failure_log)
        expect(failed).not_to include(success_log)
      end
    end

    describe '.by_action' do
      it 'filters by action' do
        expect(AuditLog.by_action('login')).to include(success_log)
        expect(AuditLog.by_action('login')).not_to include(failure_log)
        expect(AuditLog.by_action('login_failed')).to include(failure_log)
      end
    end

    describe '.today' do
      it 'returns only logs from today' do
        expect(AuditLog.today).to include(success_log, failure_log, logout_log)
        expect(AuditLog.today).not_to include(old_log)
      end
    end

    describe '.this_week' do
      it 'returns logs from the past week' do
        expect(AuditLog.this_week).to include(success_log, failure_log, logout_log)
        expect(AuditLog.this_week).not_to include(old_log)
      end
    end

    describe '.by_user and .by_staff' do
      let!(:user) { create(:user) }
      let!(:staff) { create(:staff) }
      let!(:user_log) { create(:audit_log, user: user, user_type: 'user') }
      let!(:staff_log) { create(:audit_log, staff: staff, user_type: 'staff') }

      it 'filters by user_id' do
        expect(AuditLog.by_user(user.id)).to include(user_log)
        expect(AuditLog.by_user(user.id)).not_to include(staff_log)
      end

      it 'filters by staff_id' do
        expect(AuditLog.by_staff(staff.id)).to include(staff_log)
        expect(AuditLog.by_staff(staff.id)).not_to include(user_log)
      end
    end
  end

  describe '.log_action' do
    let(:user) { create(:user) }
    let(:staff) { create(:staff) }

    it 'creates a log entry with all attributes' do
      log = AuditLog.log_action(
        action: 'login',
        status: 'success',
        staff: staff,
        ip_address: '192.168.1.1',
        user_agent: 'Test Browser',
        additional_info: { test: 'data' }.to_json
      )

      expect(log).to be_persisted
      expect(log.action).to eq('login')
      expect(log.status).to eq('success')
      expect(log.staff_id).to eq(staff.id)
      expect(log.user_type).to eq('staff')
      expect(log.ip_address).to eq('192.168.1.1')
      expect(log.user_agent).to eq('Test Browser')
    end

    it 'sets user_type to user when user is provided' do
      log = AuditLog.log_action(
        action: 'login',
        status: 'success',
        user: user,
        ip_address: '127.0.0.1'
      )

      expect(log.user_type).to eq('user')
      expect(log.user_id).to eq(user.id)
    end
  end

  describe '.log_login_success' do
    let(:user) { create(:user) }
    let(:staff) { create(:staff) }

    context 'for user' do
      it 'creates login success log for user' do
        log = AuditLog.log_login_success(user, ip_address: '127.0.0.1', user_agent: 'Browser')

        expect(log.action).to eq('login')
        expect(log.status).to eq('success')
        expect(log.user_id).to eq(user.id)
        expect(log.user_type).to eq('user')
        expect(log.ip_address).to eq('127.0.0.1')
      end
    end

    context 'for staff' do
      it 'creates login success log for staff' do
        log = AuditLog.log_login_success(staff, ip_address: '192.168.1.1')

        expect(log.action).to eq('login')
        expect(log.status).to eq('success')
        expect(log.staff_id).to eq(staff.id)
        expect(log.user_type).to eq('staff')
      end
    end
  end

  describe '.log_login_failure' do
    it 'creates login failure log with identifier' do
      log = AuditLog.log_login_failure(
        'test@example.com',
        ip_address: '127.0.0.1',
        user_agent: 'Browser',
        reason: 'invalid_password'
      )

      expect(log.action).to eq('login_failed')
      expect(log.status).to eq('failure')
      expect(log.ip_address).to eq('127.0.0.1')

      additional_info = JSON.parse(log.additional_info)
      expect(additional_info['identifier']).to eq('test@example.com')
      expect(additional_info['reason']).to eq('invalid_password')
    end

    it 'handles missing reason' do
      log = AuditLog.log_login_failure(
        'unknown_user',
        ip_address: '127.0.0.1'
      )

      additional_info = JSON.parse(log.additional_info)
      expect(additional_info['identifier']).to eq('unknown_user')
      expect(additional_info).not_to have_key('reason')
    end
  end

  describe '.log_logout' do
    let(:user) { create(:user) }
    let(:staff) { create(:staff) }

    context 'for user' do
      it 'creates logout log for user' do
        log = AuditLog.log_logout(user, ip_address: '127.0.0.1')

        expect(log.action).to eq('logout')
        expect(log.status).to eq('success')
        expect(log.user_id).to eq(user.id)
      end
    end

    context 'for staff' do
      it 'creates logout log for staff' do
        log = AuditLog.log_logout(staff, ip_address: '192.168.1.1')

        expect(log.action).to eq('logout')
        expect(log.status).to eq('success')
        expect(log.staff_id).to eq(staff.id)
      end
    end
  end

  describe '.log_video_access' do
    let(:user) { create(:user) }

    it 'creates video access log' do
      log = AuditLog.log_video_access(
        user: user,
        video_id: 'video-uuid-123',
        ip_address: '127.0.0.1'
      )

      expect(log.action).to eq('video_access')
      expect(log.status).to eq('success')
      expect(log.user_id).to eq(user.id)

      additional_info = JSON.parse(log.additional_info)
      expect(additional_info['video_id']).to eq('video-uuid-123')
    end
  end

  describe 'ACTIONS constant' do
    it 'includes all required actions' do
      expected_actions = %w[
        login
        logout
        login_failed
        create
        read
        update
        delete
        password_change
        password_reset
        video_access
      ]

      expect(AuditLog::ACTIONS).to match_array(expected_actions)
    end
  end
end
