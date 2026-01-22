FactoryBot.define do
  factory :staff do
    sequence(:staff_id) { |n| "STF#{n.to_s.rjust(3, '0')}" }
    sequence(:email) { |n| "staff#{n}@psyfit.example.com" }
    name { "職員 太郎" }
    name_kana { "ショクイン タロウ" }
    password { "Staff123!" }
    password_confirmation { "Staff123!" }
    role { "staff" }
    failed_login_count { 0 }
    locked_until { nil }

    trait :manager do
      role { "manager" }
      sequence(:staff_id) { |n| "MGR#{n.to_s.rjust(3, '0')}" }
    end

    trait :locked do
      failed_login_count { 5 }
      locked_until { 15.minutes.from_now }
    end

    trait :with_failed_attempts do
      failed_login_count { 3 }
    end
  end
end
