# frozen_string_literal: true

class PasswordResetToken < ApplicationRecord
  # Associations
  belongs_to :user, optional: true
  belongs_to :staff, optional: true

  # Validations
  validate :user_or_staff_present
  validate :user_and_staff_mutually_exclusive

  # Callbacks
  before_create :generate_token
  before_create :set_expiration

  # Scopes
  scope :valid, -> { where("expires_at > ? AND used_at IS NULL", Time.current) }
  scope :for_user, ->(user) { where(user: user) }
  scope :for_staff, ->(staff) { where(staff: staff) }

  # Check if token is expired
  def expired?
    expires_at < Time.current
  end

  # Check if token has been used
  def used?
    used_at.present?
  end

  # Check if token is valid for use (not expired and not used)
  def valid_for_use?
    !expired? && !used?
  end

  # Mark the token as used
  def mark_as_used!
    update!(used_at: Time.current)
  end

  # Return the target (user or staff) of this token
  def target
    user || staff
  end

  class << self
    # Generate a new token for a user, invalidating any existing tokens
    def generate_for_user(user)
      invalidate_existing_tokens_for_user(user)
      create!(user: user)
    end

    # Generate a new token for a staff member, invalidating any existing tokens
    def generate_for_staff(staff)
      invalidate_existing_tokens_for_staff(staff)
      create!(staff: staff)
    end

    # Find a valid (not expired, not used) token by token string
    def find_valid_token(token_string)
      valid.find_by(token: token_string)
    end

    private

    def invalidate_existing_tokens_for_user(user)
      for_user(user).valid.update_all(used_at: Time.current)
    end

    def invalidate_existing_tokens_for_staff(staff)
      for_staff(staff).valid.update_all(used_at: Time.current)
    end
  end

  private

  def generate_token
    self.token ||= SecureRandom.urlsafe_base64(32)
  end

  def set_expiration
    self.expires_at ||= 1.hour.from_now
  end

  def user_or_staff_present
    return if user_id.present? || staff_id.present?

    errors.add(:base, "user_id または staff_id のどちらかが必要です")
  end

  def user_and_staff_mutually_exclusive
    return unless user_id.present? && staff_id.present?

    errors.add(:base, "user_id と staff_id を同時に設定できません")
  end
end
