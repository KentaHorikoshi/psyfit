FactoryBot.define do
  factory :daily_condition do
    association :user
    recorded_date { Date.current }
    pain_level { 3 }
    body_condition { 7 }
    notes { nil }

    trait :high_pain do
      pain_level { 8 }
    end

    trait :low_pain do
      pain_level { 1 }
    end

    trait :good_condition do
      body_condition { 9 }
    end

    trait :poor_condition do
      body_condition { 3 }
    end

    trait :with_notes do
      notes { "今日は膝が少し痛む" }
    end

    trait :yesterday do
      recorded_date { 1.day.ago.to_date }
    end
  end
end
