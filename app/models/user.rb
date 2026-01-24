# User Model
# Represents a patient/user in the PsyFit rehabilitation system
#
# Security Features:
# - PII encryption (email, name, name_kana, birth_date) with AES-256-GCM
# - Blind index for email (enables search and uniqueness validation)
# - Password hashing with bcrypt
# - Account lockout after 5 failed login attempts (30 minutes)
# - Soft delete support

class User < ApplicationRecord
  include Encryptable

  # Status constants
  STATUSES = %w[急性期 回復期 維持期].freeze
  GENDERS = %w[male female other].freeze

  # Encrypt PII fields
  encrypts_pii :email, :name, :name_kana, :birth_date

  # Enable blind index for email (search and uniqueness validation)
  blind_index :email

  # Password authentication with bcrypt
  has_secure_password

  # Relationships
  has_many :patient_exercises, dependent: :destroy
  has_many :exercises, through: :patient_exercises
  has_many :exercise_records, dependent: :destroy
  has_many :daily_conditions, dependent: :destroy
  has_many :measurements, dependent: :destroy
  has_many :audit_logs, dependent: :nullify
  has_many :patient_staff_assignments, dependent: :destroy
  has_many :assigned_staff, through: :patient_staff_assignments, source: :staff

  # Validations
  validates :user_code, presence: true, uniqueness: true
  validates :email_bidx, presence: true, uniqueness: { message: 'has already been taken' }
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
  validates :password, length: { minimum: 8 }, if: :password_digest_changed?
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :gender, inclusion: { in: GENDERS }, allow_blank: true
  validate :password_complexity, if: :password_digest_changed?

  # Soft delete scope
  scope :active, -> { where(deleted_at: nil) }
  scope :deleted, -> { where.not(deleted_at: nil) }
  scope :by_status, ->(status) { where(status: status) if status.present? }
  scope :assigned_to, ->(staff_id) { joins(:patient_staff_assignments).where(patient_staff_assignments: { staff_id: staff_id }) }
  scope :search_by_name, ->(query) { where('name_encrypted LIKE ?', "%#{query}%") if query.present? }

  # Account Lockout Methods

  def increment_failed_login!
    self.failed_login_count += 1

    # Lock account after 5 failed attempts
    if failed_login_count >= 5
      self.locked_until = 30.minutes.from_now
    end

    save!
  end

  def reset_failed_login!
    update!(failed_login_count: 0, locked_until: nil)
  end

  def lock_account!
    update!(
      failed_login_count: 5,
      locked_until: 30.minutes.from_now
    )
  end

  def unlock_account!
    update!(
      failed_login_count: 0,
      locked_until: nil
    )
  end

  def locked?
    locked_until.present? && locked_until > Time.current
  end

  def can_authenticate?
    !locked?
  end

  # Soft Delete Methods

  def soft_delete
    update(deleted_at: Time.current)
  end

  def restore
    update(deleted_at: nil)
  end

  def deleted?
    deleted_at.present?
  end

  # Continue Days Methods

  def update_continue_days!
    today = Time.current.beginning_of_day

    # Check if last exercise was today
    return if last_exercise_at.present? && last_exercise_at >= today

    # Calculate new continue_days
    new_days = if last_exercise_at.nil?
                 1 # First exercise ever
               elsif last_exercise_at >= 2.days.ago.beginning_of_day
                 continue_days + 1 # Consecutive exercise
               else
                 1 # Gap > 1 day, reset streak
               end

    update!(continue_days: new_days, last_exercise_at: Time.current)
  end

  def exercised_today?
    last_exercise_at.present? && last_exercise_at >= Time.current.beginning_of_day
  end

  # Calculate age from birth_date
  def age
    return nil if birth_date.blank?

    today = Date.current
    birth = birth_date.is_a?(String) ? Date.parse(birth_date) : birth_date
    age = today.year - birth.year
    age -= 1 if today < birth + age.years
    age
  end

  # Get primary assigned staff
  def primary_staff
    patient_staff_assignments.primary.first&.staff
  end

  private

  def password_complexity
    return if password.blank?

    # Password must contain at least 2 of: uppercase, lowercase, number, special character
    types = 0
    types += 1 if password =~ /[a-z]/
    types += 1 if password =~ /[A-Z]/
    types += 1 if password =~ /[0-9]/
    types += 1 if password =~ /[^a-zA-Z0-9]/

    if types < 2
      errors.add(:password, "must contain at least 2 different character types (uppercase, lowercase, numbers, special characters)")
    end
  end
end
