class NextVisitDate < ApplicationRecord
  belongs_to :user

  validates :visit_date, presence: true
  validates :visit_date, uniqueness: { scope: :user_id, message: "is already registered" }
  validate :visit_date_limit, on: :create

  scope :future, -> { where("visit_date >= ?", Date.current) }
  scope :ordered, -> { order(visit_date: :asc) }

  private

  def visit_date_limit
    return unless user

    if user.next_visit_dates.count >= 10
      errors.add(:base, "cannot register more than 10 visit dates")
    end
  end
end
