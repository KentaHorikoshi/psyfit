require "test_helper"

class StaffTest < ActiveSupport::TestCase
  # Blind Index tests

  test "email blind index is computed on create" do
    staff = Staff.create!(
      staff_id: "S001",
      name: "佐藤医師",
      email: "staff@example.com",
      role: "staff",
      password: "Password123!"
    )

    assert_not_nil staff.email_bidx, "Expected email_bidx to be computed"
    assert_equal 64, staff.email_bidx.length, "Blind index should be SHA256 hex (64 chars)"
  end

  test "duplicate email is rejected via blind index" do
    Staff.create!(
      staff_id: "S002",
      name: "佐藤医師",
      email: "duplicate@example.com",
      role: "staff",
      password: "Password123!"
    )

    duplicate_staff = Staff.new(
      staff_id: "S003",
      name: "田中医師",
      email: "duplicate@example.com",
      role: "staff",
      password: "Password123!"
    )

    assert_not duplicate_staff.valid?, "Expected duplicate email to be rejected"
    assert_includes duplicate_staff.errors[:email_bidx], "has already been taken"
  end

  test "duplicate email with different case is rejected" do
    Staff.create!(
      staff_id: "S004",
      name: "佐藤医師",
      email: "CaseTest@example.com",
      role: "staff",
      password: "Password123!"
    )

    duplicate_staff = Staff.new(
      staff_id: "S005",
      name: "田中医師",
      email: "casetest@example.com",
      role: "staff",
      password: "Password123!"
    )

    assert_not duplicate_staff.valid?, "Expected case-insensitive duplicate email to be rejected"
    assert_includes duplicate_staff.errors[:email_bidx], "has already been taken"
  end

  test "find_by_email uses blind index" do
    staff = Staff.create!(
      staff_id: "S006",
      name: "佐藤医師",
      email: "findbyemail@example.com",
      role: "manager",
      password: "Password123!"
    )

    found_staff = Staff.find_by_email("findbyemail@example.com")
    assert_equal staff.id, found_staff.id, "Should find staff by email"

    found_staff_case = Staff.find_by_email("FINDBYEMAIL@example.com")
    assert_equal staff.id, found_staff_case.id, "Should find staff by email (case insensitive)"
  end

  test "find_by_email returns nil for non-existent email" do
    found_staff = Staff.find_by_email("nonexistent@example.com")
    assert_nil found_staff, "Should return nil for non-existent email"
  end

  test "nil email is allowed and does not create blind index" do
    staff = Staff.create!(
      staff_id: "S007",
      name: "佐藤医師",
      email: nil,
      role: "staff",
      password: "Password123!"
    )

    assert_nil staff.email_bidx, "Blind index should be nil for nil email"
  end

  test "blank email is allowed and does not create blind index" do
    staff = Staff.create!(
      staff_id: "S008",
      name: "佐藤医師",
      email: "",
      role: "staff",
      password: "Password123!"
    )

    assert_nil staff.email_bidx, "Blind index should be nil for blank email"
  end

  test "blind index is updated when email changes" do
    staff = Staff.create!(
      staff_id: "S009",
      name: "佐藤医師",
      email: "original@example.com",
      role: "staff",
      password: "Password123!"
    )

    original_bidx = staff.email_bidx

    staff.update!(email: "updated@example.com")

    assert_not_equal original_bidx, staff.email_bidx, "Blind index should change when email changes"
    assert_equal Staff.compute_blind_index("updated@example.com"), staff.email_bidx
  end

  # Role tests

  test "manager? returns true for manager role" do
    staff = Staff.new(role: "manager")
    assert staff.manager?, "Expected manager? to return true for manager role"
    assert_not staff.staff_member?, "Expected staff_member? to return false for manager role"
  end

  test "staff_member? returns true for staff role" do
    staff = Staff.new(role: "staff")
    assert staff.staff_member?, "Expected staff_member? to return true for staff role"
    assert_not staff.manager?, "Expected manager? to return false for staff role"
  end

  # Account lockout tests (15 minutes for staff)

  test "account locks for 15 minutes after 5 failed attempts" do
    staff = Staff.create!(
      staff_id: "S010",
      name: "佐藤医師",
      email: "locktest@example.com",
      role: "staff",
      password: "Password123!"
    )

    5.times { staff.increment_failed_login! }

    assert staff.locked?, "Account should be locked after 5 failures"

    # Check locked_until is approximately 15 minutes from now
    expected_unlock_time = Time.current + 15.minutes
    assert_in_delta expected_unlock_time, staff.locked_until, 1.second,
                    "locked_until should be 15 minutes from now for staff"
  end
end
