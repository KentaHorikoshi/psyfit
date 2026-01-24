# Exercise Model
# Master data for rehabilitation exercises

class Exercise < ApplicationRecord
  # Relationships
  has_many :patient_exercises, dependent: :restrict_with_error
  has_many :users, through: :patient_exercises
  has_many :exercise_records, dependent: :restrict_with_error
  has_many :videos, dependent: :destroy

  # Validations
  validates :name, presence: true, length: { maximum: 100 }
  validates :category, presence: true, inclusion: { in: %w[筋力 バランス 柔軟性] }
  validates :difficulty, presence: true, inclusion: { in: %w[easy medium hard] }
  validates :target_body_part, length: { maximum: 100 }, allow_nil: true
  validates :recommended_reps, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
  validates :recommended_sets, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
  validates :duration_seconds, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
  validates :video_url, length: { maximum: 255 }, allow_nil: true
  validates :thumbnail_url, length: { maximum: 255 }, allow_nil: true

  # Category constants
  CATEGORIES = %w[筋力 バランス 柔軟性].freeze

  # Difficulty constants
  DIFFICULTIES = %w[easy medium hard].freeze

  # Scopes
  scope :by_category, ->(category) { where(category: category) }
  scope :by_difficulty, ->(difficulty) { where(difficulty: difficulty) }
  scope :active_videos, -> { joins(:videos).where(videos: { is_active: true }) }

  # Helper methods
  def difficulty_label
    case difficulty
    when "easy" then "易しい"
    when "medium" then "普通"
    when "hard" then "難しい"
    end
  end

  def primary_video
    videos.where(is_active: true).order(:display_order).first
  end
end
