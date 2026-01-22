FactoryBot.define do
  factory :patient_exercise do
    association :user
    association :exercise
    association :assigned_by_staff, factory: :staff
    target_reps { 10 }
    target_sets { 3 }
    assigned_at { Time.current }
    is_active { true }

    trait :inactive do
      is_active { false }
    end
  end
end
