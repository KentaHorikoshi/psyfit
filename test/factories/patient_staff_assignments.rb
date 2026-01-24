FactoryBot.define do
  factory :patient_staff_assignment do
    association :user
    association :staff
    assigned_at { Time.current }
    is_primary { false }

    trait :primary do
      is_primary { true }
    end
  end
end
