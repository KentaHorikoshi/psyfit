# frozen_string_literal: true

# Serves React SPA index.html files for client-side routing.
# All non-API paths are handled here to support browser history navigation.
class SpaController < ActionController::Base
  def user_index
    render file: Rails.public_path.join("index.html"), layout: false
  end

  def admin_index
    render file: Rails.public_path.join("admin", "index.html"), layout: false
  end
end
