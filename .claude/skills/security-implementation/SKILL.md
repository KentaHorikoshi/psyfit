---
name: security-implementation
description: セキュリティ機能の実装手順。PII暗号化、パスワードポリシー、アカウントロックアウト、セッション管理、監査ログ、レート制限を含む。
---

# Security Implementation Skill

セキュリティ機能の実装手順。

## 参照ドキュメント

- [セキュリティ要件](../../docs/05-security-requirements.md)

## 1. PII暗号化

### Rails Active Record Encryption設定

```ruby
# config/application.rb
module Psyfit
  class Application < Rails::Application
    config.active_record.encryption.primary_key = ENV['ACTIVE_RECORD_ENCRYPTION_PRIMARY_KEY']
    config.active_record.encryption.deterministic_key = ENV['ACTIVE_RECORD_ENCRYPTION_DETERMINISTIC_KEY']
    config.active_record.encryption.key_derivation_salt = ENV['ACTIVE_RECORD_ENCRYPTION_KEY_DERIVATION_SALT']
  end
end
```

### キー生成

```bash
bin/rails db:encryption:init

# 出力例:
# active_record_encryption:
#   primary_key: <base64_key>
#   deterministic_key: <base64_key>
#   key_derivation_salt: <base64_salt>
```

### モデル実装

```ruby
# app/models/user.rb
class User < ApplicationRecord
  # 暗号化フィールド定義
  encrypts :name                          # 非決定的暗号化
  encrypts :name_kana                     # 非決定的暗号化
  encrypts :email, deterministic: true    # 決定的暗号化（検索可能）
  encrypts :birth_date                    # 非決定的暗号化

  # パスワードハッシュ
  has_secure_password

  # バリデーション
  validates :email, presence: true, uniqueness: { case_sensitive: false }
  validates :name, presence: true, length: { maximum: 100 }
end
```

## 2. パスワードポリシー

```ruby
# app/models/concerns/password_policy.rb
module PasswordPolicy
  extend ActiveSupport::Concern

  PASSWORD_MIN_LENGTH = 8
  PASSWORD_HISTORY_COUNT = 3

  included do
    has_many :password_histories, dependent: :destroy

    validate :password_complexity, if: -> { password.present? }
    validate :password_not_reused, if: -> { password.present? }

    after_save :save_password_history, if: :saved_change_to_password_digest?
  end

  private

  def password_complexity
    unless password.length >= PASSWORD_MIN_LENGTH
      errors.add(:password, "は#{PASSWORD_MIN_LENGTH}文字以上必要です")
      return
    end

    types = 0
    types += 1 if password.match?(/[A-Z]/)
    types += 1 if password.match?(/[a-z]/)
    types += 1 if password.match?(/[0-9]/)

    if types < 2
      errors.add(:password, 'は英大文字・小文字・数字から2種類以上含めてください')
    end
  end

  def password_not_reused
    return if password_histories.empty?

    password_histories.order(created_at: :desc).limit(PASSWORD_HISTORY_COUNT).each do |history|
      if BCrypt::Password.new(history.password_digest) == password
        errors.add(:password, '過去3回使用したパスワードは使用できません')
        break
      end
    end
  end

  def save_password_history
    password_histories.create!(password_digest: password_digest)
  end
end

# app/models/password_history.rb
class PasswordHistory < ApplicationRecord
  belongs_to :passwordable, polymorphic: true
end
```

## 3. アカウントロックアウト

```ruby
# app/models/concerns/lockable.rb
module Lockable
  extend ActiveSupport::Concern

  MAX_FAILED_ATTEMPTS = 5
  LOCK_DURATION = 30.minutes

  def lock_access!
    update!(
      failed_login_attempts: MAX_FAILED_ATTEMPTS,
      locked_until: Time.current + LOCK_DURATION
    )

    AuditLog.log_event(
      user_type: self.class.name.downcase,
      user_id: self.is_a?(User) ? id : nil,
      staff_id: self.is_a?(Staff) ? id : nil,
      action: 'account_locked',
      status: 'success',
      details: { reason: 'max_failed_attempts' }
    )
  end

  def unlock_access!
    update!(failed_login_attempts: 0, locked_until: nil)
  end

  def access_locked?
    locked_until.present? && locked_until > Time.current
  end

  def increment_failed_attempts!
    increment!(:failed_login_attempts)
    lock_access! if failed_login_attempts >= MAX_FAILED_ATTEMPTS
  end

  def reset_failed_attempts!
    update!(failed_login_attempts: 0) if failed_login_attempts > 0
  end

  def remaining_lock_time
    return 0 unless access_locked?
    ((locked_until - Time.current) / 60).ceil
  end
end
```

## 4. セッション管理

```ruby
# app/controllers/concerns/session_management.rb
module SessionManagement
  extend ActiveSupport::Concern

  USER_SESSION_TIMEOUT = 30.minutes
  STAFF_SESSION_TIMEOUT = 15.minutes

  included do
    before_action :check_session_timeout
    after_action :update_session_activity
  end

  private

  def check_session_timeout
    return unless session[:last_activity_at]

    timeout = current_staff ? STAFF_SESSION_TIMEOUT : USER_SESSION_TIMEOUT
    last_activity = Time.parse(session[:last_activity_at])

    if Time.current - last_activity > timeout
      reset_session
      render json: { status: 'error', message: 'セッションがタイムアウトしました' },
             status: :unauthorized
    end
  end

  def update_session_activity
    session[:last_activity_at] = Time.current.iso8601
  end
end
```

## 5. 監査ログ

```ruby
# app/models/audit_log.rb
class AuditLog < ApplicationRecord
  ACTIONS = %w[
    login logout login_failed account_locked
    create read update delete
    password_change password_reset
    permission_change video_access
  ].freeze

  validates :action, inclusion: { in: ACTIONS }
  validates :user_type, inclusion: { in: %w[user staff system] }
  validates :status, inclusion: { in: %w[success failure] }

  scope :recent, -> { order(created_at: :desc) }
  scope :by_user, ->(user_id) { where(user_id: user_id) }
  scope :by_staff, ->(staff_id) { where(staff_id: staff_id) }
  scope :failures, -> { where(status: 'failure') }

  def self.log_event(attrs)
    create!(
      attrs.merge(
        ip_address: Current.ip_address,
        user_agent: Current.user_agent,
        created_at: Time.current
      )
    )
  rescue => e
    Rails.logger.error "Failed to create audit log: #{e.message}"
  end
end

# app/models/current.rb
class Current < ActiveSupport::CurrentAttributes
  attribute :user, :staff, :ip_address, :user_agent

  def user_type
    return 'staff' if staff
    return 'user' if user
    'system'
  end
end
```

## 6. 入力検証・サニタイズ

```ruby
# app/controllers/concerns/input_sanitizer.rb
module InputSanitizer
  extend ActiveSupport::Concern

  private

  def sanitize_string_params(*keys)
    keys.each do |key|
      if params[key].is_a?(String)
        params[key] = ActionController::Base.helpers.sanitize(params[key])
      end
    end
  end

  def sanitize_html(text)
    ActionController::Base.helpers.sanitize(text)
  end

  def strip_tags(text)
    ActionController::Base.helpers.strip_tags(text)
  end
end
```

## 7. CSRF対策

```ruby
# app/controllers/application_controller.rb
class ApplicationController < ActionController::API
  include ActionController::RequestForgeryProtection

  protect_from_forgery with: :exception

  # SPA用: CSRFトークンをCookieに設定
  after_action :set_csrf_cookie

  private

  def set_csrf_cookie
    cookies['CSRF-TOKEN'] = {
      value: form_authenticity_token,
      same_site: :strict,
      secure: Rails.env.production?
    }
  end
end
```

## 8. レート制限

```ruby
# config/initializers/rack_attack.rb
Rack::Attack.throttle('api/user', limit: 60, period: 1.minute) do |req|
  if req.path.start_with?('/api/v1') && req.session[:user_id]
    req.session[:user_id]
  end
end

Rack::Attack.throttle('api/staff', limit: 120, period: 1.minute) do |req|
  if req.path.start_with?('/api/v1') && req.session[:staff_id]
    req.session[:staff_id]
  end
end

# ログイン試行制限
Rack::Attack.throttle('auth/login', limit: 10, period: 1.minute) do |req|
  if req.path.include?('/auth/login') && req.post?
    req.ip
  end
end

# ブロック時のレスポンス
Rack::Attack.throttled_responder = lambda do |request|
  [
    429,
    { 'Content-Type' => 'application/json' },
    [{ status: 'error', message: 'リクエスト数の制限を超えました' }.to_json]
  ]
end
```

## 9. セキュリティヘッダー

```ruby
# config/application.rb
config.action_dispatch.default_headers = {
  'X-Frame-Options' => 'SAMEORIGIN',
  'X-Content-Type-Options' => 'nosniff',
  'X-XSS-Protection' => '1; mode=block',
  'Strict-Transport-Security' => 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy' => [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "media-src 'self'",
    "connect-src 'self'"
  ].join('; '),
  'Referrer-Policy' => 'strict-origin-when-cross-origin',
  'Permissions-Policy' => 'geolocation=(), microphone=(), camera=()'
}
```

## セキュリティテスト

```ruby
# spec/models/user_spec.rb
RSpec.describe User, type: :model do
  describe 'password policy' do
    it 'requires minimum 8 characters' do
      user = build(:user, password: 'Short1')
      expect(user).not_to be_valid
      expect(user.errors[:password]).to include('は8文字以上必要です')
    end

    it 'requires 2 character types' do
      user = build(:user, password: 'onlylowercase')
      expect(user).not_to be_valid
    end

    it 'accepts valid password' do
      user = build(:user, password: 'Password123')
      expect(user).to be_valid
    end
  end
end

# spec/requests/security_spec.rb
RSpec.describe 'Security', type: :request do
  describe 'account lockout' do
    it 'locks account after 5 failed attempts' do
      user = create(:user)

      5.times do
        post '/api/v1/auth/login', params: { email: user.email, password: 'wrong' }
      end

      expect(user.reload).to be_access_locked
    end
  end

  describe 'session timeout' do
    it 'expires user session after 30 minutes' do
      user = create(:user)
      post '/api/v1/auth/login', params: { email: user.email, password: 'Password123' }

      travel 31.minutes

      get '/api/v1/users/me'
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
```
