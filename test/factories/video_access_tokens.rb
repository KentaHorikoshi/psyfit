FactoryBot.define do
  factory :video_access_token do
    association :user
    association :exercise
    token { SecureRandom.hex(32) }
    expires_at { 1.hour.from_now }
    used_at { nil }

    trait :expired do
      expires_at { 1.hour.ago }
    end

    trait :used do
      used_at { 10.minutes.ago }
    end
  end
end
