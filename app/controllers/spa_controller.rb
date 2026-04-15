# frozen_string_literal: true

# Serves a "service ended" thank-you page for all non-API routes.
#
# NOTE: サービス終了につき、利用者向け・職員向け両方のSPAを一時的に
# サービス終了メッセージに差し替えている。元に戻す手順は CLAUDE.md の
# 「サービス終了メッセージからの復帰手順」を参照。
class SpaController < ActionController::Base
  before_action :set_no_cache_headers

  def user_index
    render template: "spa/service_ended", layout: false, status: :ok
  end

  def admin_index
    render template: "spa/service_ended", layout: false, status: :ok
  end

  private

  def set_no_cache_headers
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
  end
end
