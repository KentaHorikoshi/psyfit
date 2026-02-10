# frozen_string_literal: true

class UserMailer < ApplicationMailer
  # パスワードリセット案内メールを送信
  # @param recipient [User, Staff] パスワードリセット対象のユーザーまたは職員
  # @param reset_token [PasswordResetToken] パスワードリセットトークン
  def password_reset_instructions(recipient, reset_token)
    @recipient = recipient
    @reset_token = reset_token
    @reset_url = build_reset_url(recipient, reset_token)
    @expiration_hours = 1

    mail(
      to: recipient.email,
      subject: "【PsyFit】パスワードリセットのご案内"
    )
  end

  private

  def build_reset_url(recipient, reset_token)
    base_url = if recipient.is_a?(Staff)
                 ENV.fetch("ADMIN_APP_URL", "http://localhost:3003")
               else
                 ENV.fetch("USER_APP_URL", "http://localhost:3000")
               end

    "#{base_url}/password_reset?token=#{reset_token.token}"
  end
end
