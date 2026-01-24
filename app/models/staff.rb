# Staff Model
# Represents a hospital staff member (manager or staff) in the PsyFit system
#
# Security Features:
# - PII encryption (name, name_kana, email) with AES-256-GCM
# - Blind index for email (enables search and uniqueness validation)
# - Password hashing with bcrypt
# - Account lockout after 5 failed login attempts (15 minutes for staff)
# - Soft delete support
# - Role-based access (manager, staff)

class Staff < ApplicationRecord
  # Table name is "staff" (not "staffs" - staff is uncountable)
  self.table_name = "staff"

  include Encryptable

  # Encrypt PII fields
  encrypts_pii :name, :name_kana, :email

  # Enable blind index for email (search and uniqueness validation)
  blind_index :email

  # Password authentication with bcrypt
  has_secure_password

  # Relationships
  has_many :patient_exercises, foreign_key: :assigned_by_staff_id, dependent: :restrict_with_error
  has_many :measurements, foreign_key: :measured_by_staff_id, dependent: :restrict_with_error
  has_many :audit_logs, dependent: :nullify
  has_many :patient_staff_assignments, dependent: :destroy
  has_many :assigned_patients, through: :patient_staff_assignments, source: :user

  # Validations
  validates :staff_id, presence: true, uniqueness: true
  validates :name, presence: true
  validates :email_bidx, uniqueness: { message: "has already been taken" }, allow_nil: true
  validates :role, presence: true, inclusion: { in: %w[manager staff] }
  validates :password, length: { minimum: 8 }, if: :password_digest_changed?
  validate :password_complexity, if: :password_digest_changed?

  # Default role
  attribute :role, :string, default: "staff"

  # Soft delete scope
  scope :active, -> { where(deleted_at: nil) }
  scope :deleted, -> { where.not(deleted_at: nil) }
  scope :managers, -> { where(role: "manager") }
  scope :staff_members, -> { where(role: "staff") }

  # Account Lockout Methods (15 minutes for staff)

  def increment_failed_login!
    self.failed_login_count += 1

    # Lock account after 5 failed attempts (15 min for staff)
    if failed_login_count >= 5
      self.locked_until = 15.minutes.from_now
    end

    save!
  end

  def reset_failed_login!
    update!(failed_login_count: 0, locked_until: nil)
  end

  def lock_account!
    update!(
      failed_login_count: 5,
      locked_until: 15.minutes.from_now
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

  # Role check methods
  def manager?
    role == "manager"
  end

  def staff_member?
    role == "staff"
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
