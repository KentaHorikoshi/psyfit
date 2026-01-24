# ExerciseRecord Model
# Records of completed exercises by patients

class ExerciseRecord < ApplicationRecord
  # Relationships
  belongs_to :user
  belongs_to :exercise

  # Validations
  validates :user_id, presence: true
  validates :exercise_id, presence: true
  validates :completed_at, presence: true
  validates :completed_reps, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
  validates :completed_sets, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
  validates :duration_seconds, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true

  # Default values
  attribute :completed_at, :datetime, default: -> { Time.current }

  # Scopes
  scope :for_user, ->(user_id) { where(user_id: user_id) }
  scope :for_exercise, ->(exercise_id) { where(exercise_id: exercise_id) }
  scope :recent, -> { order(completed_at: :desc) }
  scope :today, -> { where("completed_at >= ?", Time.current.beginning_of_day) }
  scope :this_week, -> { where("completed_at >= ?", 1.week.ago.beginning_of_day) }
  scope :this_month, -> { where("completed_at >= ?", 1.month.ago.beginning_of_day) }
  scope :between_dates, ->(start_date, end_date) { where(completed_at: start_date..end_date) }

  # Callbacks
  after_create :update_continue_days

  # Methods
  def duration_formatted
    return nil unless duration_seconds

    minutes = duration_seconds / 60
    seconds = duration_seconds % 60
    format("%d:%02d", minutes, seconds)
  end

  private

  def update_continue_days
    # This will be implemented in a service object for proper continue_days calculation
  end
end
