FactoryBot.define do
  factory :exercise_record do
    association :user
    association :exercise
    completed_at { Time.current }
    completed_reps { 10 }
    completed_sets { 3 }
    duration_seconds { 300 }
    notes { nil }

    trait :with_notes do
      notes { "今日は調子が良かった" }
    end

    trait :yesterday do
      completed_at { 1.day.ago }
    end

    trait :last_week do
      completed_at { 1.week.ago }
      to_create { |instance| instance.save!(validate: false) }
    end

    trait :historical do
      to_create { |instance| instance.save!(validate: false) }
    end
  end
end
