# frozen_string_literal: true

# Serves React SPA index.html files for client-side routing.
# All non-API paths are handled here to support browser history navigation.
# index.html must not be cached long-term so that new deploys (with updated
# asset hashes) are picked up immediately by browsers.
class SpaController < ActionController::Base
  before_action :set_no_cache_headers

  def user_index
    render file: Rails.public_path.join("index.html"), layout: false
  end

  def admin_index
    render file: Rails.public_path.join("admin", "index.html"), layout: false
  end

  private

  def set_no_cache_headers
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
  end
end
