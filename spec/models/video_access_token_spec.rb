# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VideoAccessToken, type: :model do
  let(:user) { create(:user) }
  let(:staff) { create(:staff) }
  let(:exercise) { create(:exercise) }
  let(:video) { create(:video, exercise: exercise) }

  before do
    # 患者にexerciseを割り当てる
    create(:patient_exercise, user: user, exercise: exercise, assigned_by_staff: staff)
  end

  describe 'associations' do
    it { should belong_to(:user) }
    it { should belong_to(:exercise) }
  end

  describe 'validations' do
    it { should validate_presence_of(:token) }
    it { should validate_presence_of(:expires_at) }

    it 'validates uniqueness of token' do
      token = VideoAccessToken.generate_for(user: user, exercise: exercise)
      duplicate = VideoAccessToken.new(
        user: user,
        exercise: exercise,
        token: token.token,
        expires_at: 1.hour.from_now
      )
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:token]).to be_present
    end
  end

  describe '.generate_for' do
    it 'creates a new token for user and exercise' do
      token = VideoAccessToken.generate_for(user: user, exercise: exercise)

      expect(token).to be_persisted
      expect(token.user).to eq(user)
      expect(token.exercise).to eq(exercise)
      expect(token.token).to be_present
      expect(token.token.length).to be >= 32
    end

    it 'sets expiration to 1 hour from now by default' do
      Timecop.freeze do
        token = VideoAccessToken.generate_for(user: user, exercise: exercise)
        expect(token.expires_at).to be_within(1.second).of(1.hour.from_now)
      end
    end

    it 'allows custom expiration time' do
      Timecop.freeze do
        token = VideoAccessToken.generate_for(user: user, exercise: exercise, expires_in: 30.minutes)
        expect(token.expires_at).to be_within(1.second).of(30.minutes.from_now)
      end
    end

    it 'generates cryptographically secure random tokens' do
      tokens = 10.times.map { VideoAccessToken.generate_for(user: user, exercise: exercise).token }
      expect(tokens.uniq.length).to eq(10)
    end
  end

  describe '.find_valid_token' do
    it 'returns token when valid and not expired' do
      token = VideoAccessToken.generate_for(user: user, exercise: exercise)
      found = VideoAccessToken.find_valid_token(token.token)

      expect(found).to eq(token)
    end

    it 'returns nil for expired token' do
      token = VideoAccessToken.generate_for(user: user, exercise: exercise)
      Timecop.travel(2.hours.from_now) do
        expect(VideoAccessToken.find_valid_token(token.token)).to be_nil
      end
    end

    it 'returns nil for used token' do
      token = VideoAccessToken.generate_for(user: user, exercise: exercise)
      token.mark_as_used!

      expect(VideoAccessToken.find_valid_token(token.token)).to be_nil
    end

    it 'returns nil for non-existent token' do
      expect(VideoAccessToken.find_valid_token('non-existent-token')).to be_nil
    end
  end

  describe '#expired?' do
    it 'returns false when token is not expired' do
      token = VideoAccessToken.generate_for(user: user, exercise: exercise)
      expect(token.expired?).to be false
    end

    it 'returns true when token is expired' do
      token = VideoAccessToken.generate_for(user: user, exercise: exercise)
      Timecop.travel(2.hours.from_now) do
        expect(token.expired?).to be true
      end
    end
  end

  describe '#used?' do
    it 'returns false when token is not used' do
      token = VideoAccessToken.generate_for(user: user, exercise: exercise)
      expect(token.used?).to be false
    end

    it 'returns true when token is marked as used' do
      token = VideoAccessToken.generate_for(user: user, exercise: exercise)
      token.mark_as_used!
      expect(token.used?).to be true
    end
  end

  describe '#mark_as_used!' do
    it 'sets used_at timestamp' do
      Timecop.freeze do
        token = VideoAccessToken.generate_for(user: user, exercise: exercise)
        token.mark_as_used!

        expect(token.used_at).to be_within(1.second).of(Time.current)
      end
    end
  end

  describe '#valid_for_streaming?' do
    it 'returns true when token is valid' do
      token = VideoAccessToken.generate_for(user: user, exercise: exercise)
      expect(token.valid_for_streaming?).to be true
    end

    it 'returns false when token is expired' do
      token = VideoAccessToken.generate_for(user: user, exercise: exercise)
      Timecop.travel(2.hours.from_now) do
        expect(token.valid_for_streaming?).to be false
      end
    end

    it 'returns false when token is used' do
      token = VideoAccessToken.generate_for(user: user, exercise: exercise)
      token.mark_as_used!
      expect(token.valid_for_streaming?).to be false
    end
  end

  describe 'scopes' do
    describe '.valid' do
      it 'returns only valid (not expired, not used) tokens' do
        valid_token = VideoAccessToken.generate_for(user: user, exercise: exercise)

        # Create expired token
        expired_token = VideoAccessToken.generate_for(user: user, exercise: exercise)
        expired_token.update_column(:expires_at, 1.hour.ago)

        # Create used token
        used_token = VideoAccessToken.generate_for(user: user, exercise: exercise)
        used_token.mark_as_used!

        expect(VideoAccessToken.valid).to include(valid_token)
        expect(VideoAccessToken.valid).not_to include(expired_token)
        expect(VideoAccessToken.valid).not_to include(used_token)
      end
    end

    describe '.for_user' do
      it 'returns tokens for specific user' do
        another_user = create(:user)
        create(:patient_exercise, user: another_user, exercise: exercise, assigned_by_staff: staff)

        token1 = VideoAccessToken.generate_for(user: user, exercise: exercise)
        token2 = VideoAccessToken.generate_for(user: another_user, exercise: exercise)

        expect(VideoAccessToken.for_user(user.id)).to include(token1)
        expect(VideoAccessToken.for_user(user.id)).not_to include(token2)
      end
    end
  end
end
