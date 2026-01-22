FactoryBot.define do
  factory :audit_log do
    action { "login" }
    status { "success" }
    user_type { "user" }
    ip_address { "192.168.1.100" }
    user_agent { "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
    additional_info { nil }

    trait :for_user do
      user_type { "user" }
      association :user
      staff { nil }
    end

    trait :for_staff do
      user_type { "staff" }
      user { nil }
      association :staff
    end

    trait :login_failed do
      action { "login_failed" }
      status { "failure" }
    end

    trait :logout do
      action { "logout" }
    end

    trait :video_access do
      action { "video_access" }
      additional_info { { video_id: SecureRandom.uuid }.to_json }
    end

    trait :password_change do
      action { "password_change" }
    end
  end
end
