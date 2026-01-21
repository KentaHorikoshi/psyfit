require "test_helper"

class UserTest < ActiveSupport::TestCase
  # Email validation & uniqueness tests

  test "valid email is accepted" do
    user = User.new(
      user_code: "U001",
      email: "patient@example.com",
      name: "山田太郎",
      password: "Password123!",
      password_confirmation: "Password123!"
    )
    assert user.valid?, "Expected user with valid email to be valid"
  end

  test "invalid email is rejected" do
    user = User.new(
      user_code: "U002",
      email: "invalid-email",
      name: "山田太郎",
      password: "Password123!"
    )
    assert_not user.valid?, "Expected user with invalid email to be invalid"
    assert_includes user.errors[:email], "is invalid"
  end

  test "duplicate email is rejected" do
    # Create first user
    User.create!(
      user_code: "U003",
      email: "duplicate@example.com",
      name: "山田太郎",
      password: "Password123!"
    )

    # Try to create second user with same email
    duplicate_user = User.new(
      user_code: "U004",
      email: "duplicate@example.com",
      name: "田中花子",
      password: "Password123!"
    )

    assert_not duplicate_user.valid?, "Expected duplicate email to be rejected"
    assert_includes duplicate_user.errors[:email], "has already been taken"
  end

  test "email is stored encrypted in database" do
    user = User.create!(
      user_code: "U005",
      email: "encrypted@example.com",
      name: "山田太郎",
      password: "Password123!"
    )

    # Check that email_encrypted exists and is different from plaintext
    encrypted_value = user.read_attribute(:email_encrypted)
    assert_not_nil encrypted_value, "Expected email_encrypted to have a value"
    assert_not_equal "encrypted@example.com", encrypted_value, "Email should be encrypted"

    # Check IV exists
    assert_not_nil user.read_attribute(:email_encrypted_iv), "Expected email_encrypted_iv to exist"
  end

  test "email is retrieved decrypted" do
    user = User.create!(
      user_code: "U006",
      email: "decrypted@example.com",
      name: "山田太郎",
      password: "Password123!"
    )

    # Retrieve user from database
    retrieved_user = User.find(user.id)
    assert_equal "decrypted@example.com", retrieved_user.email, "Email should be decrypted when retrieved"
  end

  # Password validation tests

  test "minimum 8 characters required for password" do
    user = User.new(
      user_code: "U007",
      email: "short@example.com",
      name: "山田太郎",
      password: "Pass1!",
      password_confirmation: "Pass1!"
    )

    assert_not user.valid?, "Expected password under 8 characters to be invalid"
    assert_includes user.errors[:password], "is too short (minimum is 8 characters)"
  end

  test "password requires 2+ character types" do
    # Only lowercase letters
    user = User.new(
      user_code: "U008",
      email: "weak@example.com",
      name: "山田太郎",
      password: "password",
      password_confirmation: "password"
    )

    assert_not user.valid?, "Expected password with only lowercase to be invalid"
  end

  test "password is stored as bcrypt digest" do
    user = User.create!(
      user_code: "U009",
      email: "bcrypt@example.com",
      name: "山田太郎",
      password: "Password123!"
    )

    # Check password_digest exists and starts with bcrypt prefix
    assert_not_nil user.password_digest, "Expected password_digest to exist"
    assert user.password_digest.start_with?("$2"), "Expected bcrypt hash format"
  end

  test "password is not stored in plaintext" do
    user = User.create!(
      user_code: "U010",
      email: "secure@example.com",
      name: "山田太郎",
      password: "Password123!"
    )

    assert_not_equal "Password123!", user.password_digest, "Password should not be stored in plaintext"
    assert_not_includes user.password_digest, "Password123!", "Password should not appear in digest"
  end

  test "authenticate method works correctly" do
    user = User.create!(
      user_code: "U011",
      email: "auth@example.com",
      name: "山田太郎",
      password: "Password123!"
    )

    # Correct password should authenticate
    assert user.authenticate("Password123!"), "Expected correct password to authenticate"

    # Wrong password should not authenticate
    assert_not user.authenticate("WrongPassword"), "Expected wrong password to fail authentication"
  end

  # PII encryption tests

  test "name is encrypted in database" do
    user = User.create!(
      user_code: "U012",
      email: "nameenc@example.com",
      name: "山田太郎",
      password: "Password123!"
    )

    encrypted_value = user.read_attribute(:name_encrypted)
    assert_not_nil encrypted_value, "Expected name_encrypted to have a value"
    assert_not_equal "山田太郎", encrypted_value, "Name should be encrypted"
    assert_not_nil user.read_attribute(:name_encrypted_iv), "Expected name_encrypted_iv to exist"
  end

  test "name_kana is encrypted in database" do
    user = User.create!(
      user_code: "U013",
      email: "kanaenc@example.com",
      name: "山田太郎",
      name_kana: "ヤマダタロウ",
      password: "Password123!"
    )

    encrypted_value = user.read_attribute(:name_kana_encrypted)
    assert_not_nil encrypted_value, "Expected name_kana_encrypted to have a value"
    assert_not_equal "ヤマダタロウ", encrypted_value, "Name kana should be encrypted"
    assert_not_nil user.read_attribute(:name_kana_encrypted_iv), "Expected name_kana_encrypted_iv to exist"
  end

  test "birth_date is encrypted in database" do
    user = User.create!(
      user_code: "U014",
      email: "birthenc@example.com",
      name: "山田太郎",
      birth_date: "1980-01-15",
      password: "Password123!"
    )

    encrypted_value = user.read_attribute(:birth_date_encrypted)
    assert_not_nil encrypted_value, "Expected birth_date_encrypted to have a value"
    assert_not_equal "1980-01-15", encrypted_value, "Birth date should be encrypted"
    assert_not_nil user.read_attribute(:birth_date_encrypted_iv), "Expected birth_date_encrypted_iv to exist"
  end

  test "decryption works correctly for all PII fields" do
    user = User.create!(
      user_code: "U015",
      email: "alldecrypt@example.com",
      name: "山田太郎",
      name_kana: "ヤマダタロウ",
      birth_date: "1980-01-15",
      password: "Password123!"
    )

    retrieved_user = User.find(user.id)
    assert_equal "alldecrypt@example.com", retrieved_user.email
    assert_equal "山田太郎", retrieved_user.name
    assert_equal "ヤマダタロウ", retrieved_user.name_kana
    assert_equal "1980-01-15", retrieved_user.birth_date
  end

  # Account lockout tests

  test "failed_login_count increments on authentication failure" do
    user = User.create!(
      user_code: "U016",
      email: "failcount@example.com",
      name: "山田太郎",
      password: "Password123!"
    )

    assert_equal 0, user.failed_login_count, "Initial failed_login_count should be 0"

    user.increment_failed_login!
    assert_equal 1, user.failed_login_count, "Failed login count should increment"

    user.increment_failed_login!
    assert_equal 2, user.failed_login_count, "Failed login count should increment again"
  end

  test "account locks after 5 failed attempts" do
    user = User.create!(
      user_code: "U017",
      email: "lockafter5@example.com",
      name: "山田太郎",
      password: "Password123!"
    )

    # Increment 4 times - should not lock
    4.times { user.increment_failed_login! }
    assert_not user.locked?, "Account should not be locked after 4 failures"

    # 5th failure should lock
    user.increment_failed_login!
    assert user.locked?, "Account should be locked after 5 failures"
  end

  test "locked_until is set to 30 minutes from now on lockout" do
    user = User.create!(
      user_code: "U018",
      email: "locktime@example.com",
      name: "山田太郎",
      password: "Password123!"
    )

    # Lock the account
    5.times { user.increment_failed_login! }

    # Check locked_until is approximately 30 minutes from now (within 1 second tolerance)
    expected_unlock_time = Time.current + 30.minutes
    assert_in_delta expected_unlock_time, user.locked_until, 1.second,
                    "locked_until should be 30 minutes from now"
  end

  test "cannot authenticate when account is locked" do
    user = User.create!(
      user_code: "U019",
      email: "cantauth@example.com",
      name: "山田太郎",
      password: "Password123!"
    )

    # Lock the account
    5.times { user.increment_failed_login! }

    # Even with correct password, should not authenticate
    assert_not user.can_authenticate?, "Locked account should not be able to authenticate"
  end

  test "can authenticate after lockout expires" do
    user = User.create!(
      user_code: "U020",
      email: "unlockafter@example.com",
      name: "山田太郎",
      password: "Password123!"
    )

    # Lock the account
    5.times { user.increment_failed_login! }
    assert user.locked?, "Account should be locked"

    # Travel 31 minutes into the future
    Timecop.freeze(Time.current + 31.minutes) do
      assert_not user.locked?, "Account should be unlocked after 30 minutes"
      assert user.can_authenticate?, "Should be able to authenticate after lockout expires"
    end
  end

  test "successful authentication resets failed_login_count" do
    user = User.create!(
      user_code: "U021",
      email: "resetcount@example.com",
      name: "山田太郎",
      password: "Password123!"
    )

    # Increment failed login count
    3.times { user.increment_failed_login! }
    assert_equal 3, user.failed_login_count

    # Successful authentication should reset
    user.reset_failed_login!
    assert_equal 0, user.failed_login_count, "Failed login count should reset after successful login"
  end

  test "lock_account! and unlock_account! methods work" do
    user = User.create!(
      user_code: "U022",
      email: "manuallock@example.com",
      name: "山田太郎",
      password: "Password123!"
    )

    # Manual lock
    user.lock_account!
    assert user.locked?, "Account should be locked after lock_account!"

    # Manual unlock
    user.unlock_account!
    assert_not user.locked?, "Account should be unlocked after unlock_account!"
    assert_equal 0, user.failed_login_count, "Failed login count should be reset on unlock"
  end
end
