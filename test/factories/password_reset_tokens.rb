FactoryBot.define do
  factory :password_reset_token do
    token { SecureRandom.urlsafe_base64(32) }
    expires_at { 1.hour.from_now }
    used_at { nil }
    user { nil }
    staff { nil }

    trait :expired do
      expires_at { 1.hour.ago }
    end

    trait :used do
      used_at { 10.minutes.ago }
    end

    trait :for_user do
      association :user
      staff { nil }
    end

    trait :for_staff do
      user { nil }
      association :staff
    end
  end
end
