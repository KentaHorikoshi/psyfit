FactoryBot.define do
  factory :next_visit_date do
    association :user
    sequence(:visit_date) { |n| Date.current + n.days }
  end
end
