# Exercise Model
# Master data for rehabilitation exercises

class Exercise < ApplicationRecord
  # Relationships
  has_many :patient_exercises, dependent: :restrict_with_error
  has_many :users, through: :patient_exercises
  has_many :exercise_records, dependent: :restrict_with_error
  has_many :videos, dependent: :destroy

  # Exercise type constants (運動別分類)
  EXERCISE_TYPES = %w[ストレッチ トレーニング ほぐす バランス].freeze

  # Body part major constants (大分類)
  BODY_PART_MAJORS = %w[体幹・脊柱 上肢 下肢].freeze

  # Body part minor constants (中分類) grouped by major
  BODY_PART_MINORS = {
    '体幹・脊柱' => %w[頸部 胸部 腹部 腰椎 胸部・腹部 腹部・胸部 腰椎・骨盤 その他],
    '上肢' => %w[肩・上腕 肘・前腕 手関節・手指],
    '下肢' => %w[股関節・大腿 膝・下腿 足関節・足部]
  }.freeze

  ALL_BODY_PART_MINORS = BODY_PART_MINORS.values.flatten.freeze

  # Difficulty constants
  DIFFICULTIES = %w[easy medium hard].freeze

  # Validations
  validates :name, presence: true, length: { maximum: 100 }
  validates :exercise_type, presence: true, inclusion: { in: EXERCISE_TYPES }
  validates :difficulty, presence: true, inclusion: { in: DIFFICULTIES }
  validates :body_part_major, inclusion: { in: BODY_PART_MAJORS }, allow_nil: true
  validates :body_part_minor, inclusion: { in: ALL_BODY_PART_MINORS }, allow_nil: true
  validates :recommended_reps, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
  validates :recommended_sets, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
  validates :duration_seconds, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
  validates :video_url, length: { maximum: 255 }, allow_nil: true
  validates :thumbnail_url, length: { maximum: 255 }, allow_nil: true

  validate :body_part_minor_matches_major

  # Scopes
  scope :by_exercise_type, ->(exercise_type) { where(exercise_type: exercise_type) }
  scope :by_body_part_major, ->(major) { where(body_part_major: major) }
  scope :by_body_part_minor, ->(minor) { where(body_part_minor: minor) }
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

  private

  def body_part_minor_matches_major
    return if body_part_minor.blank? || body_part_major.blank?

    valid_minors = BODY_PART_MINORS[body_part_major]
    return if valid_minors&.include?(body_part_minor)

    errors.add(:body_part_minor, "は#{body_part_major}の中分類として無効です")
  end
end
