# DailyCondition Model
# Daily body condition and pain level records from patients

class DailyCondition < ApplicationRecord
  # Relationships
  belongs_to :user

  # Validations
  validates :user_id, presence: true
  validates :recorded_date, presence: true
  validates :pain_level, presence: true, numericality: {
    only_integer: true,
    greater_than_or_equal_to: 0,
    less_than_or_equal_to: 10
  }
  validates :body_condition, presence: true, numericality: {
    only_integer: true,
    greater_than_or_equal_to: 0,
    less_than_or_equal_to: 10
  }

  # One record per user per day
  validates :recorded_date, uniqueness: { scope: :user_id }

  # Default values
  attribute :recorded_date, :date, default: -> { Date.current }

  # Scopes
  scope :for_user, ->(user_id) { where(user_id: user_id) }
  scope :recent, -> { order(recorded_date: :desc) }
  scope :today, -> { where(recorded_date: Date.current) }
  scope :this_week, -> { where('recorded_date >= ?', 1.week.ago.to_date) }
  scope :this_month, -> { where('recorded_date >= ?', 1.month.ago.to_date) }
  scope :between_dates, ->(start_date, end_date) { where(recorded_date: start_date..end_date) }

  # Pain level descriptions
  PAIN_LEVELS = {
    0 => '痛みなし',
    1..3 => '軽い痛み',
    4..6 => '中程度の痛み',
    7..9 => '強い痛み',
    10 => '激しい痛み'
  }.freeze

  # Methods
  def pain_level_description
    PAIN_LEVELS.find { |range, _| range === pain_level }&.last || '不明'
  end

  def body_condition_description
    case body_condition
    when 0..3 then '悪い'
    when 4..6 then '普通'
    when 7..10 then '良い'
    else '不明'
    end
  end
end
