# frozen_string_literal: true

# PatientStaffAssignment Model
# Represents the assignment of a staff member to a patient
# Supports primary assignment designation for determining main responsible staff

class PatientStaffAssignment < ApplicationRecord
  belongs_to :user
  belongs_to :staff

  # Validations
  validates :user_id, presence: true
  validates :staff_id, presence: true
  validates :assigned_at, presence: true
  validates :user_id, uniqueness: { scope: :staff_id, message: "is already assigned to this staff" }

  # Scopes
  scope :primary, -> { where(is_primary: true) }
  scope :active_staff, -> { joins(:staff).merge(Staff.active) }

  # Callbacks
  before_validation :set_assigned_at, on: :create

  private

  def set_assigned_at
    self.assigned_at ||= Time.current
  end
end
