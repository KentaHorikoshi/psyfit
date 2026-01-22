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

  # Validations
  validates :user_code, presence: true, uniqueness: true
  validates :email_bidx, presence: true, uniqueness: { message: 'has already been taken' }
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
  validates :password, length: { minimum: 8 }, if: :password_digest_changed?
  validate :password_complexity, if: :password_digest_changed?

  # Soft delete scope
  scope :active, -> { where(deleted_at: nil) }
  scope :deleted, -> { where.not(deleted_at: nil) }

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
