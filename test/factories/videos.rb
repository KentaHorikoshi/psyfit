FactoryBot.define do
  factory :video do
    association :exercise
    sequence(:title) { |n| "動画#{n}" }
    video_url { "https://example.com/videos/sample.mp4" }
    thumbnail_url { "https://example.com/thumbnails/sample.jpg" }
    duration_seconds { 120 }
    display_order { 0 }
    is_active { true }
    description { "サンプル動画の説明文です。" }

    trait :inactive do
      is_active { false }
    end
  end
end
