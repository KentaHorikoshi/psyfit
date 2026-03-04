# frozen_string_literal: true

require 'rails_helper'

RSpec.describe NextVisitDate, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:user) }
  end

  describe 'validations' do
    let(:user) { create(:user) }

    describe 'visit_date presence' do
      it 'is invalid without a visit_date' do
        record = build(:next_visit_date, user: user, visit_date: nil)
        expect(record).not_to be_valid
        expect(record.errors[:visit_date]).to include("を入力してください")
      end

      it 'is valid with a visit_date' do
        record = build(:next_visit_date, user: user, visit_date: Date.current + 7)
        expect(record).to be_valid
      end
    end

    describe 'visit_date uniqueness per user' do
      let(:existing_date) { Date.current + 7 }

      before { create(:next_visit_date, user: user, visit_date: existing_date) }

      it 'is invalid when the same visit_date already exists for the same user' do
        duplicate = build(:next_visit_date, user: user, visit_date: existing_date)
        expect(duplicate).not_to be_valid
        expect(duplicate.errors[:visit_date]).to include("is already registered")
      end

      it 'is valid when the same date is used for a different user' do
        other_user = create(:user)
        record = build(:next_visit_date, user: other_user, visit_date: existing_date)
        expect(record).to be_valid
      end

      it 'is valid when a different date is used for the same user' do
        record = build(:next_visit_date, user: user, visit_date: existing_date + 7)
        expect(record).to be_valid
      end
    end

    describe 'visit_date_limit (max 10 per user)' do
      before do
        10.times do |i|
          create(:next_visit_date, user: user, visit_date: Date.current + (i + 1).days)
        end
      end

      it 'is invalid when user already has 10 visit dates' do
        eleventh = build(:next_visit_date, user: user, visit_date: Date.current + 20.days)
        expect(eleventh).not_to be_valid
        expect(eleventh.errors[:base]).to include("cannot register more than 10 visit dates")
      end

      it 'does not apply the limit on update' do
        # After hitting the limit on creation, we can still update existing records
        existing = user.next_visit_dates.first
        existing.visit_date = Date.current + 100.days
        expect(existing).to be_valid
      end

      it 'is valid when user has fewer than 10 visit dates' do
        user_with_few = create(:user)
        9.times { |i| create(:next_visit_date, user: user_with_few, visit_date: Date.current + (i + 20).days) }

        tenth = build(:next_visit_date, user: user_with_few, visit_date: Date.current + 30.days)
        expect(tenth).to be_valid
      end
    end
  end

  describe 'scopes' do
    let(:user) { create(:user) }

    let!(:past_date)   { create(:next_visit_date, user: user, visit_date: Date.current - 1.day) }
    let!(:today_date)  { create(:next_visit_date, user: user, visit_date: Date.current) }
    let!(:future_date1) { create(:next_visit_date, user: user, visit_date: Date.current + 7.days) }
    let!(:future_date2) { create(:next_visit_date, user: user, visit_date: Date.current + 14.days) }

    describe '.future' do
      it 'includes today and future dates' do
        future = NextVisitDate.future
        expect(future).to include(today_date, future_date1, future_date2)
      end

      it 'excludes past dates' do
        expect(NextVisitDate.future).not_to include(past_date)
      end
    end

    describe '.ordered' do
      it 'orders records by visit_date ascending' do
        ordered = NextVisitDate.where(user: user).ordered
        expect(ordered.to_a).to eq([past_date, today_date, future_date1, future_date2])
      end
    end

    describe '.future.ordered (combined)' do
      it 'returns future dates in ascending order' do
        result = NextVisitDate.where(user: user).future.ordered
        expect(result.to_a).to eq([today_date, future_date1, future_date2])
      end
    end
  end
end
