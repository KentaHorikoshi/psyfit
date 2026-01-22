# Video Model
# Exercise instruction videos

class Video < ApplicationRecord
  # Relationships
  belongs_to :exercise

  # Validations
  validates :exercise_id, presence: true
  validates :title, presence: true, length: { maximum: 100 }
  validates :video_url, presence: true, length: { maximum: 255 }
  validates :thumbnail_url, length: { maximum: 255 }, allow_nil: true
  validates :duration_seconds, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
  validates :display_order, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  # Default values
  attribute :is_active, :boolean, default: true
  attribute :display_order, :integer, default: 0

  # Scopes
  scope :active, -> { where(is_active: true) }
  scope :inactive, -> { where(is_active: false) }
  scope :ordered, -> { order(:display_order) }
  scope :for_exercise, ->(exercise_id) { where(exercise_id: exercise_id) }

  # Methods
  def duration_formatted
    return nil unless duration_seconds

    minutes = duration_seconds / 60
    seconds = duration_seconds % 60
    format('%d:%02d', minutes, seconds)
  end

  def deactivate!
    update!(is_active: false)
  end

  def activate!
    update!(is_active: true)
  end
end
