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
    status { "維持期" }
    condition { "変形性膝関節症" }
    gender { "male" }
    phone { "090-1234-5678" }

    trait :locked do
      failed_login_count { 5 }
      locked_until { 30.minutes.from_now }
    end

    trait :with_failed_attempts do
      failed_login_count { 3 }
    end

    trait :lock_expired do
      failed_login_count { 5 }
      locked_until { 1.minute.ago }
    end

    trait :deleted do
      deleted_at { 1.day.ago }
    end

    trait :acute do
      status { "急性期" }
    end

    trait :recovery do
      status { "回復期" }
    end

    trait :maintenance do
      status { "維持期" }
    end

    trait :female do
      gender { "female" }
      name { "田中花子" }
      name_kana { "タナカハナコ" }
    end
  end
end
