FactoryBot.define do
  factory :exercise do
    sequence(:name) { |n| "運動#{n}" }
    category { "筋力" }
    difficulty { "easy" }
    target_body_part { "下肢" }
    recommended_reps { 10 }
    recommended_sets { 3 }
    duration_seconds { 180 }
    description { "サンプル運動の説明文です。" }

    trait :strength do
      category { "筋力" }
    end

    trait :balance do
      category { "バランス" }
    end

    trait :flexibility do
      category { "柔軟性" }
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
