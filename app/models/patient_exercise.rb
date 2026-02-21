# PatientExercise Model
# Assignment of exercises to patients by staff members

class PatientExercise < ApplicationRecord
  # Relationships
  belongs_to :user
  belongs_to :exercise
  belongs_to :assigned_by_staff, class_name: "Staff", foreign_key: :assigned_by_staff_id

  # Validations
  validates :user_id, presence: true
  validates :exercise_id, presence: true
  validates :assigned_by_staff_id, presence: true
  validates :assigned_at, presence: true
  validates :target_reps, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
  validates :target_sets, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
  validates :daily_frequency, numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: 10 }

  # Prevent duplicate active assignments
  validates :exercise_id, uniqueness: {
    scope: [ :user_id, :is_active ],
    message: "is already assigned to this patient",
    conditions: -> { where(is_active: true) }
  }

  # Default values
  attribute :is_active, :boolean, default: true
  attribute :assigned_at, :datetime, default: -> { Time.current }

  # Scopes
  scope :active, -> { where(is_active: true) }
  scope :inactive, -> { where(is_active: false) }
  scope :for_user, ->(user_id) { where(user_id: user_id) }
  scope :recent, -> { order(assigned_at: :desc) }

  # Methods
  def deactivate!
    update!(is_active: false)
  end

  def activate!
    update!(is_active: true)
  end
end
