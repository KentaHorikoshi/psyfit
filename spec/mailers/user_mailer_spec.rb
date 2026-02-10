# frozen_string_literal: true

require "rails_helper"

RSpec.describe UserMailer, type: :mailer do
  describe "#password_reset_instructions" do
    let(:user) { create(:user, name: "田中太郎", email: "tanaka@example.com") }
    let(:reset_token) { PasswordResetToken.generate_for_user(user) }
    let(:mail) { described_class.password_reset_instructions(user, reset_token) }

    it "renders the headers" do
      expect(mail.subject).to eq("【PsyFit】パスワードリセットのご案内")
      expect(mail.to).to eq(["tanaka@example.com"])
      expect(mail.from).to eq(["noreply@psyfit.jp"])
    end

    it "includes the user name in the body" do
      text_body = mail.text_part.body.decoded
      expect(text_body).to include("田中太郎")
    end

    it "includes the reset link with token in the body" do
      text_body = mail.text_part.body.decoded
      expect(text_body).to include(reset_token.token)
    end

    it "includes the expiration notice (1 hour) in the body" do
      text_body = mail.text_part.body.decoded
      expect(text_body).to include("1時間")
    end

    it "renders both text and HTML parts" do
      expect(mail.parts.map(&:content_type)).to include(
        a_string_matching(/text\/plain/),
        a_string_matching(/text\/html/)
      )
    end

    context "text part" do
      let(:text_body) { mail.text_part.body.decoded }

      it "includes the reset link" do
        expect(text_body).to include("password-reset")
        expect(text_body).to include(reset_token.token)
      end

      it "includes instructions" do
        expect(text_body).to include("パスワード")
        expect(text_body).to include("リセット")
      end
    end

    context "HTML part" do
      let(:html_body) { mail.html_part.body.decoded }

      it "includes the reset link as a clickable link" do
        expect(html_body).to include("<a")
        expect(html_body).to include(reset_token.token)
      end

      it "is properly formatted HTML" do
        expect(html_body).to include("<!DOCTYPE html>").or include("<html")
      end
    end

    it "uses the correct charset" do
      expect(mail.charset).to eq("UTF-8")
    end
  end

  describe "#password_reset_instructions for staff" do
    let(:staff) { create(:staff, name: "山田花子", email: "yamada@hospital.jp") }
    let(:reset_token) { PasswordResetToken.generate_for_staff(staff) }
    let(:mail) { described_class.password_reset_instructions(staff, reset_token) }

    it "renders the headers for staff" do
      expect(mail.subject).to eq("【PsyFit】パスワードリセットのご案内")
      expect(mail.to).to eq(["yamada@hospital.jp"])
    end

    it "includes the staff name in the body" do
      text_body = mail.text_part.body.decoded
      expect(text_body).to include("山田花子")
    end

    it "includes the correct reset link for staff" do
      text_body = mail.text_part.body.decoded
      expect(text_body).to include(reset_token.token)
    end
  end
end
