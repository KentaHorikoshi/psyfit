# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Staff, type: :model do
  describe 'validations' do
    subject { build(:staff) }

    it { is_expected.to validate_presence_of(:staff_id) }
    it { is_expected.to validate_uniqueness_of(:staff_id) }
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:role) }
    it { is_expected.to validate_inclusion_of(:role).in_array(%w[manager staff]) }
  end

  describe 'password validation' do
    it 'requires minimum 8 characters' do
      staff = build(:staff, password: 'Pass1', password_confirmation: 'Pass1')
      expect(staff).not_to be_valid
      expect(staff.errors[:password]).to include(/minimum/)
    end

    it 'requires at least 2 character types' do
      staff = build(:staff, password: 'abcdefgh', password_confirmation: 'abcdefgh')
      expect(staff).not_to be_valid
      expect(staff.errors[:password]).to include(/2 different character types/)
    end

    it 'accepts password with 2 character types' do
      staff = build(:staff, password: 'Password1', password_confirmation: 'Password1')
      expect(staff).to be_valid
    end

    it 'accepts password with 3 character types' do
      staff = build(:staff, password: 'Password123', password_confirmation: 'Password123')
      expect(staff).to be_valid
    end
  end

  describe 'account lockout' do
    let(:staff) { create(:staff) }

    describe '#increment_failed_login!' do
      it 'increments failed_login_count' do
        expect { staff.increment_failed_login! }
          .to change { staff.failed_login_count }.from(0).to(1)
      end

      it 'locks account after 5 failed attempts' do
        4.times { staff.increment_failed_login! }
        expect(staff.locked?).to be false

        staff.increment_failed_login!
        expect(staff.locked?).to be true
      end

      it 'sets locked_until to 15 minutes from now for staff' do
        5.times { staff.increment_failed_login! }

        expect(staff.locked_until).to be_within(1.second).of(15.minutes.from_now)
      end
    end

    describe '#reset_failed_login!' do
      it 'resets failed_login_count to 0' do
        staff.update!(failed_login_count: 3)
        staff.reset_failed_login!

        expect(staff.failed_login_count).to eq(0)
      end

      it 'clears locked_until' do
        staff.update!(failed_login_count: 5, locked_until: 15.minutes.from_now)
        staff.reset_failed_login!

        expect(staff.locked_until).to be_nil
      end
    end

    describe '#lock_account!' do
      it 'sets failed_login_count to 5' do
        staff.lock_account!
        expect(staff.failed_login_count).to eq(5)
      end

      it 'sets locked_until to 15 minutes from now' do
        staff.lock_account!
        expect(staff.locked_until).to be_within(1.second).of(15.minutes.from_now)
      end
    end

    describe '#unlock_account!' do
      let(:locked_staff) { create(:staff, :locked) }

      it 'resets failed_login_count to 0' do
        locked_staff.unlock_account!
        expect(locked_staff.failed_login_count).to eq(0)
      end

      it 'clears locked_until' do
        locked_staff.unlock_account!
        expect(locked_staff.locked_until).to be_nil
      end
    end

    describe '#locked?' do
      it 'returns true when locked_until is in the future' do
        staff.update!(locked_until: 10.minutes.from_now)
        expect(staff.locked?).to be true
      end

      it 'returns false when locked_until is in the past' do
        staff.update!(locked_until: 10.minutes.ago)
        expect(staff.locked?).to be false
      end

      it 'returns false when locked_until is nil' do
        expect(staff.locked?).to be false
      end
    end

    describe '#can_authenticate?' do
      it 'returns true when not locked' do
        expect(staff.can_authenticate?).to be true
      end

      it 'returns false when locked' do
        staff.lock_account!
        expect(staff.can_authenticate?).to be false
      end
    end
  end

  describe 'role methods' do
    describe '#manager?' do
      it 'returns true for manager role' do
        staff = create(:staff, :manager)
        expect(staff.manager?).to be true
      end

      it 'returns false for staff role' do
        staff = create(:staff, role: 'staff')
        expect(staff.manager?).to be false
      end
    end

    describe '#staff_member?' do
      it 'returns true for staff role' do
        staff = create(:staff, role: 'staff')
        expect(staff.staff_member?).to be true
      end

      it 'returns false for manager role' do
        staff = create(:staff, :manager)
        expect(staff.staff_member?).to be false
      end
    end
  end

  describe 'soft delete' do
    let(:staff) { create(:staff) }

    describe '#soft_delete' do
      it 'sets deleted_at timestamp' do
        expect { staff.soft_delete }
          .to change { staff.deleted_at }.from(nil)

        expect(staff.deleted_at).to be_within(1.second).of(Time.current)
      end
    end

    describe '#restore' do
      let(:deleted_staff) { create(:staff, :deleted) }

      it 'clears deleted_at' do
        expect { deleted_staff.restore }
          .to change { deleted_staff.deleted_at }.to(nil)
      end
    end

    describe '#deleted?' do
      it 'returns true when deleted_at is present' do
        staff = create(:staff, :deleted)
        expect(staff.deleted?).to be true
      end

      it 'returns false when deleted_at is nil' do
        expect(staff.deleted?).to be false
      end
    end

    describe 'scopes' do
      let!(:active_staff) { create(:staff) }
      let!(:deleted_staff) { create(:staff, :deleted) }

      describe '.active' do
        it 'returns only non-deleted staff' do
          expect(Staff.active).to include(active_staff)
          expect(Staff.active).not_to include(deleted_staff)
        end
      end

      describe '.deleted' do
        it 'returns only deleted staff' do
          expect(Staff.deleted).to include(deleted_staff)
          expect(Staff.deleted).not_to include(active_staff)
        end
      end
    end
  end

  describe 'scopes' do
    let!(:manager) { create(:staff, :manager) }
    let!(:staff_member) { create(:staff, role: 'staff') }

    describe '.managers' do
      it 'returns only managers' do
        expect(Staff.managers).to include(manager)
        expect(Staff.managers).not_to include(staff_member)
      end
    end

    describe '.staff_members' do
      it 'returns only staff members' do
        expect(Staff.staff_members).to include(staff_member)
        expect(Staff.staff_members).not_to include(manager)
      end
    end
  end

  describe 'PII encryption' do
    let(:staff) { create(:staff, name: 'Test Name', name_kana: 'テストネーム', email: 'test@example.com') }

    it 'encrypts name' do
      # The decrypted value should match
      expect(staff.name).to eq('Test Name')

      # The encrypted value should be different from the original
      expect(staff.name_encrypted).not_to eq('Test Name')
    end

    it 'encrypts name_kana' do
      expect(staff.name_kana).to eq('テストネーム')
      expect(staff.name_kana_encrypted).not_to eq('テストネーム')
    end

    it 'encrypts email' do
      expect(staff.email).to eq('test@example.com')
      expect(staff.email_encrypted).not_to eq('test@example.com')
    end
  end

  describe 'authentication' do
    let(:staff) { create(:staff) }  # Uses factory default password

    it 'authenticates with correct password' do
      expect(staff.authenticate('Staff123!')).to eq(staff)
    end

    it 'rejects incorrect password' do
      expect(staff.authenticate('WrongPassword')).to be false
    end
  end
end
