# frozen_string_literal: true

require "rails_helper"

RSpec.describe "SPA routing", type: :request do
  let(:index_html) { "<html><body>app</body></html>" }
  let(:admin_index_html) { "<html><body>admin</body></html>" }

  before do
    # Create temporary public/index.html and public/admin/index.html for testing
    FileUtils.mkdir_p(Rails.public_path.join("admin"))
    File.write(Rails.public_path.join("index.html"), index_html)
    File.write(Rails.public_path.join("admin", "index.html"), admin_index_html)
  end

  after do
    FileUtils.rm_f(Rails.public_path.join("index.html"))
    FileUtils.rm_f(Rails.public_path.join("admin", "index.html"))
  end

  describe "GET /" do
    it "serves user SPA index.html" do
      get "/"
      expect(response).to have_http_status(:ok)
      expect(response.body).to include("app")
    end
  end

  describe "GET /admin" do
    it "serves admin SPA index.html" do
      get "/admin"
      expect(response).to have_http_status(:ok)
      expect(response.body).to include("admin")
    end
  end

  describe "GET /admin/dashboard" do
    it "serves admin SPA index.html for nested admin paths" do
      get "/admin/dashboard"
      expect(response).to have_http_status(:ok)
      expect(response.body).to include("admin")
    end
  end

  describe "GET /home" do
    it "serves user SPA index.html for user paths" do
      get "/home"
      expect(response).to have_http_status(:ok)
      expect(response.body).to include("app")
    end
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
