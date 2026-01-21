FactoryBot.define do
  factory :user do
    sequence(:user_code) { |n| "U#{n.to_s.rjust(6, '0')}" }
    sequence(:email) { |n| "user#{n}@example.com" }
    name { "山田太郎" }
    name_kana { "ヤマダタロウ" }
    birth_date { "1980-01-15" }
    password { "Password123!" }
    password_confirmation { "Password123!" }
    failed_login_count { 0 }
    locked_until { nil }

    trait :locked do
      failed_login_count { 5 }
      locked_until { 30.minutes.from_now }
    end

    trait :with_failed_attempts do
      failed_login_count { 3 }
    end
  end
end
