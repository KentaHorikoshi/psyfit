# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User, type: :model do
  describe '#update_continue_days!' do
    let(:user) { create(:user, continue_days: 0, last_exercise_at: nil) }

    context 'when first exercise ever' do
      it 'sets continue_days to 1' do
        user.update_continue_days!

        expect(user.continue_days).to eq(1)
      end

      it 'sets last_exercise_at to current time' do
        freeze_time = Time.current
        Timecop.freeze(freeze_time) do
          user.update_continue_days!

          expect(user.last_exercise_at).to be_within(1.second).of(freeze_time)
        end
      end
    end

    context 'when exercised yesterday' do
      before do
        user.update!(continue_days: 5, last_exercise_at: 1.day.ago.beginning_of_day)
      end

      it 'increments continue_days by 1' do
        user.update_continue_days!

        expect(user.continue_days).to eq(6)
      end
    end

    context 'when already exercised today' do
      before do
        user.update!(continue_days: 5, last_exercise_at: Time.current.beginning_of_day + 1.hour)
      end

      it 'does not change continue_days' do
        expect { user.update_continue_days! }.not_to change { user.continue_days }
      end

      it 'does not update last_exercise_at' do
        original_time = user.last_exercise_at
        user.update_continue_days!

        expect(user.reload.last_exercise_at).to eq(original_time)
      end
    end

    context 'when gap is more than 1 day' do
      before do
        user.update!(continue_days: 10, last_exercise_at: 3.days.ago)
      end

      it 'resets continue_days to 1' do
        user.update_continue_days!

        expect(user.continue_days).to eq(1)
      end
    end

    context 'when exercised 2 days ago (within consecutive window)' do
      before do
        user.update!(continue_days: 5, last_exercise_at: 2.days.ago.beginning_of_day + 1.hour)
      end

      it 'increments continue_days (1-day skip allowed)' do
        user.update_continue_days!

        expect(user.continue_days).to eq(6)
      end
    end
  end

  describe '#exercised_today?' do
    let(:user) { create(:user) }

    context 'when last_exercise_at is nil' do
      before { user.update!(last_exercise_at: nil) }

      it 'returns false' do
        expect(user.exercised_today?).to be false
      end
    end

    context 'when last exercise was today' do
      before { user.update!(last_exercise_at: Time.current.beginning_of_day + 2.hours) }

      it 'returns true' do
        expect(user.exercised_today?).to be true
      end
    end

    context 'when last exercise was yesterday' do
      before { user.update!(last_exercise_at: 1.day.ago) }

      it 'returns false' do
        expect(user.exercised_today?).to be false
      end
    end
  end
end
