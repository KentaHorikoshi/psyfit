# frozen_string_literal: true

# VideoAccessToken Model
# Temporary tokens for video streaming access control
#
# Security features:
# - Tokens expire after 1 hour (configurable)
# - Single-use tokens (marked as used after streaming)
# - Cryptographically secure random generation
# - User and exercise binding for authorization

class VideoAccessToken < ApplicationRecord
  # Relationships
  belongs_to :user
  belongs_to :exercise

  # Validations
  validates :token, presence: true, uniqueness: true
  validates :expires_at, presence: true

  # Default values
  DEFAULT_EXPIRATION = 1.hour

  # Scopes
  scope :valid, -> { where("expires_at > ? AND used_at IS NULL", Time.current) }
  scope :expired, -> { where("expires_at <= ?", Time.current) }
  scope :used, -> { where.not(used_at: nil) }
  scope :for_user, ->(user_id) { where(user_id: user_id) }
  scope :for_exercise, ->(exercise_id) { where(exercise_id: exercise_id) }

  # Class methods

  # Generate a new access token for a user and exercise
  # @param user [User] the user requesting access
  # @param exercise [Exercise] the exercise to access
  # @param expires_in [ActiveSupport::Duration] optional custom expiration time
  # @return [VideoAccessToken] the generated token
  def self.generate_for(user:, exercise:, expires_in: DEFAULT_EXPIRATION)
    create!(
      user: user,
      exercise: exercise,
      token: generate_secure_token,
      expires_at: Time.current + expires_in
    )
  end

  # Find a valid token by token string
  # @param token_string [String] the token to find
  # @return [VideoAccessToken, nil] the token if valid, nil otherwise
  def self.find_valid_token(token_string)
    valid.find_by(token: token_string)
  end

  # Instance methods

  # Check if token is expired
  # @return [Boolean]
  def expired?
    expires_at <= Time.current
  end

  # Check if token has been used
  # @return [Boolean]
  def used?
    used_at.present?
  end

  # Mark token as used
  # @return [Boolean] save result
  def mark_as_used!
    update!(used_at: Time.current)
  end

  # Check if token is valid for streaming
  # @return [Boolean]
  def valid_for_streaming?
    !expired? && !used?
  end

  private

  # Generate a cryptographically secure random token
  # @return [String] 32-byte hex string (64 characters)
  def self.generate_secure_token
    SecureRandom.hex(32)
  end
end
