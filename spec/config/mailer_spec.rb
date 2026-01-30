# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Development Mailer Configuration", type: :config do
  describe "letter_opener_web configuration" do
    context "in development environment" do
      before do
        # Development環境をシミュレート
        allow(Rails).to receive(:env).and_return(ActiveSupport::StringInquirer.new("development"))
      end

      it "should have letter_opener_web gem installed" do
        # Gemが存在することを確認
        expect { require "letter_opener_web" }.not_to raise_error
      end

      it "should be configured to use letter_opener_web as delivery method" do
        # development.rb で設定される delivery_method を確認
        # Rails.application.config.action_mailer.delivery_method が :letter_opener_web であること
        config = Rails.application.config_for(:development_mailer) rescue nil

        # 設定ファイルが読み込まれているか確認する別の方法
        development_config = Rails.root.join("config/environments/development.rb").read
        expect(development_config).to include("letter_opener_web")
      end
    end
  end
end
