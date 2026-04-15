# frozen_string_literal: true

require "rails_helper"

# NOTE: サービス終了につき、SpaController は両SPAに替えて
# service_ended テンプレートを返す。復帰時はこのテストも元の内容に戻すこと。
RSpec.describe "SPA routing", type: :request do
  shared_examples "renders service ended page" do
    it "returns 200 with the service ended message" do
      expect(response).to have_http_status(:ok)
      expect(response.body).to include("本サービスの提供は終了いたしました")
      expect(response.body).to include("お使いいただきありがとうございました")
    end

    it "sets no-cache headers" do
      expect(response.headers["Cache-Control"]).to include("no-cache")
    end
  end

  describe "GET /" do
    before { get "/" }
    include_examples "renders service ended page"
  end

  describe "GET /home" do
    before { get "/home" }
    include_examples "renders service ended page"
  end

  describe "GET /admin" do
    before { get "/admin" }
    include_examples "renders service ended page"
  end

  describe "GET /admin/dashboard" do
    before { get "/admin/dashboard" }
    include_examples "renders service ended page"
  end

  describe "API routes" do
    it "does not route /api/ paths to SPA" do
      get "/api/v1/health"
      expect(response).not_to have_http_status(:not_found)
      # API routes are handled by API controllers, not SPA
      expect(response.content_type).to include("application/json")
    end
  end
end
