FactoryBot.define do
  factory :exercise do
    sequence(:name) { |n| "運動#{n}" }
    exercise_type { "トレーニング" }
    difficulty { "easy" }
    body_part_major { "下肢" }
    body_part_minor { "膝・下腿" }
    recommended_reps { 10 }
    recommended_sets { 3 }
    duration_seconds { 180 }
    description { "サンプル運動の説明文です。" }

    trait :stretch do
      exercise_type { "ストレッチ" }
    end

    trait :training do
      exercise_type { "トレーニング" }
    end

    trait :massage do
      exercise_type { "ほぐす" }
    end

    trait :balance do
      exercise_type { "バランス" }
    end

    trait :trunk do
      body_part_major { "体幹・脊柱" }
      body_part_minor { "腰椎" }
    end

    trait :upper_limb do
      body_part_major { "上肢" }
      body_part_minor { "肩・上腕" }
    end

    trait :lower_limb do
      body_part_major { "下肢" }
      body_part_minor { "膝・下腿" }
    end

    trait :medium_difficulty do
      difficulty { "medium" }
    end

    trait :hard_difficulty do
      difficulty { "hard" }
    end

    trait :with_video do
      after(:create) do |exercise|
        create(:video, exercise: exercise)
      end
    end
  end
end
