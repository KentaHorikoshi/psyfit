# AuditLog Model
# Records all security-relevant actions for compliance and monitoring
#
# Required Actions to Log:
# - login, logout, login_failed
# - create, read, update, delete
# - password_change, password_reset
# - video_access

class AuditLog < ApplicationRecord
  # Relationships
  belongs_to :user, optional: true
  belongs_to :staff, optional: true

  # Validations
  validates :action, presence: true
  validates :status, presence: true, inclusion: { in: %w[success failure] }
  validates :user_type, inclusion: { in: %w[user staff] }, allow_nil: true

  # Scopes
  scope :recent, -> { order(created_at: :desc) }
  scope :successful, -> { where(status: "success") }
  scope :failed, -> { where(status: "failure") }
  scope :by_action, ->(action) { where(action: action) }
  scope :by_user, ->(user_id) { where(user_id: user_id) }
  scope :by_staff, ->(staff_id) { where(staff_id: staff_id) }
  scope :today, -> { where("created_at >= ?", Time.current.beginning_of_day) }
  scope :this_week, -> { where("created_at >= ?", 1.week.ago) }

  # Action constants
  ACTIONS = %w[
    login
    logout
    login_failed
    create
    read
    update
    delete
    password_change
    password_reset
    video_access
  ].freeze

  # Class methods for logging

  def self.log_action(action:, status:, user: nil, staff: nil, ip_address: nil, user_agent: nil, additional_info: nil)
    create!(
      action: action,
      status: status,
      user: user,
      staff: staff,
      user_type: user ? "user" : (staff ? "staff" : nil),
      user_id: user&.id,
      staff_id: staff&.id,
      ip_address: ip_address,
      user_agent: user_agent,
      additional_info: additional_info
    )
  end

  def self.log_login_success(user_or_staff, ip_address:, user_agent: nil)
    if user_or_staff.is_a?(User)
      log_action(action: "login", status: "success", user: user_or_staff, ip_address: ip_address, user_agent: user_agent)
    else
      log_action(action: "login", status: "success", staff: user_or_staff, ip_address: ip_address, user_agent: user_agent)
    end
  end

  def self.log_login_failure(identifier, ip_address:, user_agent: nil, reason: nil)
    log_action(
      action: "login_failed",
      status: "failure",
      ip_address: ip_address,
      user_agent: user_agent,
      additional_info: { identifier: identifier, reason: reason }.compact.to_json
    )
  end

  def self.log_logout(user_or_staff, ip_address:)
    if user_or_staff.is_a?(User)
      log_action(action: "logout", status: "success", user: user_or_staff, ip_address: ip_address)
    else
      log_action(action: "logout", status: "success", staff: user_or_staff, ip_address: ip_address)
    end
  end

  def self.log_video_access(user:, video_id:, ip_address:)
    log_action(
      action: "video_access",
      status: "success",
      user: user,
      ip_address: ip_address,
      additional_info: { video_id: video_id }.to_json
    )
  end
end
