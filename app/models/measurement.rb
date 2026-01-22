# Measurement Model
# Physical measurements taken by staff for patients

class Measurement < ApplicationRecord
  # Relationships
  belongs_to :user
  belongs_to :measured_by_staff, class_name: 'Staff', foreign_key: :measured_by_staff_id

  # Validations
  validates :user_id, presence: true
  validates :measured_by_staff_id, presence: true
  validates :measured_date, presence: true
  validates :weight_kg, numericality: { greater_than: 0, less_than: 500 }, allow_nil: true
  validates :knee_extension_strength_left, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :knee_extension_strength_right, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :tug_seconds, numericality: { greater_than: 0 }, allow_nil: true
  validates :single_leg_stance_seconds, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :nrs_pain_score, numericality: {
    only_integer: true,
    greater_than_or_equal_to: 0,
    less_than_or_equal_to: 10
  }, allow_nil: true
  validates :mmt_score, numericality: {
    only_integer: true,
    greater_than_or_equal_to: 0,
    less_than_or_equal_to: 5
  }, allow_nil: true

  # Default values
  attribute :measured_date, :date, default: -> { Date.current }

  # Scopes
  scope :for_user, ->(user_id) { where(user_id: user_id) }
  scope :recent, -> { order(measured_date: :desc) }
  scope :between_dates, ->(start_date, end_date) { where(measured_date: start_date..end_date) }

  # Methods

  # MMT Score descriptions (0-5 scale)
  MMT_SCORES = {
    0 => '筋収縮なし',
    1 => 'わずかな筋収縮',
    2 => '重力を除いた運動',
    3 => '重力に抗した運動',
    4 => '軽い抵抗に抗した運動',
    5 => '正常筋力'
  }.freeze

  def mmt_score_description
    MMT_SCORES[mmt_score] || '未測定'
  end

  def nrs_pain_description
    case nrs_pain_score
    when nil then '未測定'
    when 0 then '痛みなし'
    when 1..3 then '軽度の痛み'
    when 4..6 then '中等度の痛み'
    when 7..10 then '重度の痛み'
    end
  end

  # Check if at least one measurement was taken
  def has_measurements?
    [weight_kg, knee_extension_strength_left, knee_extension_strength_right,
     tug_seconds, single_leg_stance_seconds, nrs_pain_score, mmt_score].any?(&:present?)
  end
end
