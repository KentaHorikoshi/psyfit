# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PasswordResetToken, type: :model do
  describe 'validations' do
    it 'requires either user_id or staff_id' do
      token = build(:password_reset_token, user: nil, staff: nil)
      expect(token).not_to be_valid
      expect(token.errors[:base]).to include('user_id または staff_id のどちらかが必要です')
    end

    it 'does not allow both user_id and staff_id' do
      user = create(:user)
      staff = create(:staff)
      token = build(:password_reset_token, user: user, staff: staff)
      expect(token).not_to be_valid
      expect(token.errors[:base]).to include('user_id と staff_id を同時に設定できません')
    end

    it 'is valid with only user_id' do
      user = create(:user)
      token = build(:password_reset_token, user: user, staff: nil)
      expect(token).to be_valid
    end

    it 'is valid with only staff_id' do
      staff = create(:staff)
      token = build(:password_reset_token, user: nil, staff: staff)
      expect(token).to be_valid
    end
  end

  describe 'token generation' do
    it 'auto-generates a secure token on create' do
      user = create(:user)
      token = create(:password_reset_token, user: user)
      expect(token.token).to be_present
      expect(token.token.length).to be >= 32
    end

    it 'generates unique tokens' do
      user = create(:user)
      token1 = create(:password_reset_token, user: user)
      token2 = create(:password_reset_token, user: user)
      expect(token1.token).not_to eq(token2.token)
    end
  end

  describe 'expiration' do
    it 'sets expires_at to 1 hour from now by default' do
      user = create(:user)
      token = create(:password_reset_token, user: user)
      expect(token.expires_at).to be_within(5.seconds).of(1.hour.from_now)
    end

    describe '#expired?' do
      it 'returns false when expires_at is in the future' do
        token = build(:password_reset_token, expires_at: 30.minutes.from_now)
        expect(token.expired?).to be false
      end

      it 'returns true when expires_at is in the past' do
        token = build(:password_reset_token, expires_at: 1.minute.ago)
        expect(token.expired?).to be true
      end
    end
  end

  describe 'usage' do
    describe '#used?' do
      it 'returns false when used_at is nil' do
        token = build(:password_reset_token, used_at: nil)
        expect(token.used?).to be false
      end

      it 'returns true when used_at is present' do
        token = build(:password_reset_token, used_at: Time.current)
        expect(token.used?).to be true
      end
    end

    describe '#mark_as_used!' do
      let(:user) { create(:user) }
      let(:token) { create(:password_reset_token, user: user) }

      it 'sets used_at to current time' do
        expect { token.mark_as_used! }
          .to change { token.used_at }.from(nil)
        expect(token.used_at).to be_within(1.second).of(Time.current)
      end
    end

    describe '#valid_for_use?' do
      let(:user) { create(:user) }

      it 'returns true when not expired and not used' do
        token = create(:password_reset_token, user: user)
        expect(token.valid_for_use?).to be true
      end

      it 'returns false when expired' do
        token = create(:password_reset_token, user: user, expires_at: 1.minute.ago)
        expect(token.valid_for_use?).to be false
      end

      it 'returns false when already used' do
        token = create(:password_reset_token, user: user, used_at: 1.minute.ago)
        expect(token.valid_for_use?).to be false
      end

      it 'returns false when both expired and used' do
        token = create(:password_reset_token, user: user, expires_at: 1.minute.ago, used_at: 2.minutes.ago)
        expect(token.valid_for_use?).to be false
      end
    end
  end

  describe 'scopes' do
    let(:user) { create(:user) }

    describe '.valid' do
      it 'returns only valid tokens (not expired, not used)' do
        valid_token = create(:password_reset_token, user: user)
        expired_token = create(:password_reset_token, user: user, expires_at: 1.minute.ago)
        used_token = create(:password_reset_token, user: user, used_at: 1.minute.ago)

        expect(PasswordResetToken.valid).to include(valid_token)
        expect(PasswordResetToken.valid).not_to include(expired_token)
        expect(PasswordResetToken.valid).not_to include(used_token)
      end
    end

    describe '.for_user' do
      let(:other_user) { create(:user) }

      it 'returns tokens for the specified user' do
        user_token = create(:password_reset_token, user: user)
        other_token = create(:password_reset_token, user: other_user)

        expect(PasswordResetToken.for_user(user)).to include(user_token)
        expect(PasswordResetToken.for_user(user)).not_to include(other_token)
      end
    end

    describe '.for_staff' do
      let(:staff) { create(:staff) }
      let(:other_staff) { create(:staff) }

      it 'returns tokens for the specified staff' do
        staff_token = create(:password_reset_token, staff: staff)
        other_token = create(:password_reset_token, staff: other_staff)

        expect(PasswordResetToken.for_staff(staff)).to include(staff_token)
        expect(PasswordResetToken.for_staff(staff)).not_to include(other_token)
      end
    end
  end

  describe '.generate_for_user' do
    let(:user) { create(:user) }

    it 'creates a new token for the user' do
      token = PasswordResetToken.generate_for_user(user)
      expect(token).to be_persisted
      expect(token.user).to eq(user)
      expect(token.staff).to be_nil
    end

    it 'invalidates previous tokens for the same user' do
      old_token = create(:password_reset_token, user: user)
      new_token = PasswordResetToken.generate_for_user(user)

      expect(old_token.reload.used?).to be true
      expect(new_token.valid_for_use?).to be true
    end
  end

  describe '.generate_for_staff' do
    let(:staff) { create(:staff) }

    it 'creates a new token for the staff' do
      token = PasswordResetToken.generate_for_staff(staff)
      expect(token).to be_persisted
      expect(token.staff).to eq(staff)
      expect(token.user).to be_nil
    end

    it 'invalidates previous tokens for the same staff' do
      old_token = create(:password_reset_token, staff: staff)
      new_token = PasswordResetToken.generate_for_staff(staff)

      expect(old_token.reload.used?).to be true
      expect(new_token.valid_for_use?).to be true
    end
  end

  describe '.find_valid_token' do
    let(:user) { create(:user) }

    it 'returns the token if valid' do
      token = create(:password_reset_token, user: user)
      found = PasswordResetToken.find_valid_token(token.token)
      expect(found).to eq(token)
    end

    it 'returns nil if token is expired' do
      token = create(:password_reset_token, user: user, expires_at: 1.minute.ago)
      found = PasswordResetToken.find_valid_token(token.token)
      expect(found).to be_nil
    end

    it 'returns nil if token is already used' do
      token = create(:password_reset_token, user: user, used_at: 1.minute.ago)
      found = PasswordResetToken.find_valid_token(token.token)
      expect(found).to be_nil
    end

    it 'returns nil if token does not exist' do
      found = PasswordResetToken.find_valid_token('nonexistent_token')
      expect(found).to be_nil
    end
  end

  describe '#target' do
    it 'returns the user when user_id is present' do
      user = create(:user)
      token = create(:password_reset_token, user: user)
      expect(token.target).to eq(user)
    end

    it 'returns the staff when staff_id is present' do
      staff = create(:staff)
      token = create(:password_reset_token, staff: staff)
      expect(token.target).to eq(staff)
    end
  end
end
