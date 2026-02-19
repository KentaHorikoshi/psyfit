FactoryBot.define do
  factory :measurement do
    association :user
    association :measured_by_staff, factory: :staff
    measured_date { Date.current }
    weight_kg { 65.5 }
    knee_extension_strength_left { 245.0 }
    knee_extension_strength_right { 255.0 }
    wbi_left { 38.2 }
    wbi_right { 39.7 }
    tug_seconds { 12.5 }
    single_leg_stance_seconds { 30.0 }
    nrs_pain_score { 2 }
    mmt_score { 4 }
    percent_mv { 45.0 }
    notes { nil }

    trait :with_notes do
      notes { "測定時の特記事項" }
    end

    trait :initial_assessment do
      nrs_pain_score { 5 }
      mmt_score { 3 }
      tug_seconds { 18.0 }
      single_leg_stance_seconds { 10.0 }
    end

    trait :improved do
      nrs_pain_score { 1 }
      mmt_score { 5 }
      tug_seconds { 9.0 }
      single_leg_stance_seconds { 60.0 }
    end
  end
end
