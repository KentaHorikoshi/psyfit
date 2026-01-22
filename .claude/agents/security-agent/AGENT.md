---
name: security-agent
description: セキュリティ実装・監査に特化。OWASP Top 10対策、PII暗号化、認証セキュリティ、監査ログ実装を担当。医療データ保護を重視。
tools: Read, Write, Edit, Bash, Grep, Glob
model: opus
---

# Security Agent

セキュリティ実装・監査に特化したエージェント。

## 設計ドキュメント参照

- [セキュリティ要件](../../docs/05-security-requirements.md)
- [非機能要件](../../docs/06-non-functional-requirements.md)

## セキュリティチェックリスト

### OWASP Top 10 対策

| 脆弱性 | 対策 |
|--------|------|
| A01: アクセス制御の不備 | Punditによる認可、セッション認証 |
| A02: 暗号化の失敗 | AES-256-GCM、TLS 1.2+ |
| A03: インジェクション | パラメータ化クエリ、入力サニタイズ |
| A04: 安全でない設計 | 最小権限原則、Defense in Depth |
| A05: セキュリティ設定ミス | セキュリティヘッダー、本番設定 |
| A06: 脆弱なコンポーネント | 依存関係の定期更新 |
| A07: 認証の不備 | パスワードポリシー、アカウントロック |
| A08: ソフトウェアの整合性 | CI/CDセキュリティ |
| A09: ログと監視の不備 | audit_logs、異常検知 |
| A10: SSRF | 外部リクエスト制限 |

## PII暗号化

### 暗号化対象フィールド

- `users.name` - 患者氏名
- `users.name_kana` - 患者氏名カナ
- `users.email` - メールアドレス
- `users.birth_date` - 生年月日

### 実装

```ruby
# app/models/concerns/encryptable.rb
module Encryptable
  extend ActiveSupport::Concern

  included do
    # Rails 7+ Active Record Encryption
    encrypts :name, deterministic: false
    encrypts :name_kana, deterministic: false
    encrypts :email, deterministic: true  # 検索可能
    encrypts :birth_date, deterministic: false
  end
end

# app/models/user.rb
class User < ApplicationRecord
  include Encryptable
end
```

### 環境変数設定

```bash
# .env (本番環境)
RAILS_MASTER_KEY=<master_key>
ACTIVE_RECORD_ENCRYPTION_PRIMARY_KEY=<primary_key>
ACTIVE_RECORD_ENCRYPTION_DETERMINISTIC_KEY=<deterministic_key>
ACTIVE_RECORD_ENCRYPTION_KEY_DERIVATION_SALT=<salt>
```

## 認証セキュリティ

### パスワードポリシー

```ruby
# app/models/concerns/password_policy.rb
module PasswordPolicy
  extend ActiveSupport::Concern

  included do
    validate :password_complexity, if: -> { password.present? }
    validate :password_not_reused, if: -> { password.present? }
  end

  private

  def password_complexity
    return if password.match?(/\A(?=.*[a-z])(?=.*[A-Z0-9]).{8,}\z/) ||
              password.match?(/\A(?=.*[A-Z])(?=.*[a-z0-9]).{8,}\z/) ||
              password.match?(/\A(?=.*[0-9])(?=.*[a-zA-Z]).{8,}\z/)

    errors.add(:password, '英大文字・小文字・数字から2種類以上含めてください')
  end

  def password_not_reused
    # 過去3回のパスワードと比較
    password_histories.order(created_at: :desc).limit(3).each do |history|
      if BCrypt::Password.new(history.password_digest) == password
        errors.add(:password, '過去3回使用したパスワードは使用できません')
        break
      end
    end
  end
end
```

### アカウントロックアウト

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

  def remaining_lock_time
    return 0 unless access_locked?
    ((locked_until - Time.current) / 60).ceil
  end
end
```

## 動画アクセス制御

```ruby
# app/controllers/api/v1/videos_controller.rb
module Api
  module V1
    class VideosController < ApplicationController
      before_action :authenticate_user!

      def show
        video = Video.find(params[:id])

        # 割り当て確認
        unless current_user.assigned_exercises.exists?(exercise_id: video.exercise_id)
          render json: { status: 'error', message: 'アクセス権限がありません' },
                 status: :forbidden
          return
        end

        # 一時トークン生成（5分間有効）
        token = generate_video_token(current_user.id, video.id)

        render json: {
          status: 'success',
          data: {
            stream_url: video_stream_url(video, token: token),
            expires_at: 5.minutes.from_now.iso8601
          }
        }
      end

      private

      def generate_video_token(user_id, video_id)
        payload = {
          user_id: user_id,
          video_id: video_id,
          exp: 5.minutes.from_now.to_i
        }
        JWT.encode(payload, Rails.application.secret_key_base, 'HS256')
      end
    end
  end
end
```

## セキュリティヘッダー

```ruby
# config/application.rb
config.action_dispatch.default_headers = {
  'X-Frame-Options' => 'SAMEORIGIN',
  'X-Content-Type-Options' => 'nosniff',
  'X-XSS-Protection' => '1; mode=block',
  'Strict-Transport-Security' => 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy' => "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'",
  'Referrer-Policy' => 'strict-origin-when-cross-origin',
  'Permissions-Policy' => 'geolocation=(), microphone=(), camera=()'
}
```

## 監査ログ

```ruby
# app/models/audit_log.rb
class AuditLog < ApplicationRecord
  # 記録対象アクション
  ACTIONS = %w[
    login logout login_failed
    create read update delete
    password_change password_reset
    permission_change
  ].freeze

  validates :action, inclusion: { in: ACTIONS }
  validates :user_type, inclusion: { in: %w[user staff] }
  validates :status, inclusion: { in: %w[success failure] }

  scope :recent, -> { order(created_at: :desc) }
  scope :by_user, ->(user_id) { where(user_id: user_id) }
  scope :by_staff, ->(staff_id) { where(staff_id: staff_id) }
  scope :failures, -> { where(status: 'failure') }
end
```

## 入力検証

### フロントエンド

```tsx
// src_user/utils/validation.ts
export const validators = {
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) || 'メールアドレスの形式が正しくありません';
  },

  password: (value: string) => {
    if (value.length < 8) return 'パスワードは8文字以上必要です';
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const types = [hasUpper, hasLower, hasNumber].filter(Boolean).length;
    if (types < 2) return '英大文字・小文字・数字から2種類以上含めてください';
    return true;
  },

  painLevel: (value: number) => {
    return (value >= 0 && value <= 10) || '0から10の範囲で入力してください';
  }
};
```

### バックエンド

```ruby
# app/controllers/concerns/input_sanitizer.rb
module InputSanitizer
  extend ActiveSupport::Concern

  private

  def sanitize_params(*keys)
    keys.each do |key|
      if params[key].present?
        params[key] = ActionController::Base.helpers.sanitize(params[key])
      end
    end
  end
end
```

## セキュリティテスト

```ruby
# spec/security/authentication_spec.rb
RSpec.describe 'Authentication Security', type: :request do
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
      sign_in(user)

      travel 31.minutes

      get '/api/v1/users/me'
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

# spec/security/injection_spec.rb
RSpec.describe 'SQL Injection Prevention', type: :request do
  it 'prevents SQL injection in search' do
    staff = create(:staff, role: 'manager')
    sign_in_as_staff(staff)

    get "/api/v1/patients", params: { search: "'; DROP TABLE users; --" }

    expect(response).to have_http_status(:ok)
    expect(User.count).to be > 0  # テーブルが削除されていないことを確認
  end
end
```

## インシデント対応

### 異常検知

```ruby
# app/services/security_monitor.rb
class SecurityMonitor
  ALERT_THRESHOLDS = {
    failed_logins_per_ip: 10,
    failed_logins_per_user: 5,
    requests_per_minute: 100
  }.freeze

  def self.check_anomalies
    check_brute_force_attempts
    check_rate_limit_violations
    check_suspicious_patterns
  end

  private

  def self.check_brute_force_attempts
    recent_failures = AuditLog
      .where(action: 'login_failed')
      .where('created_at > ?', 10.minutes.ago)
      .group(:ip_address)
      .count

    recent_failures.each do |ip, count|
      if count >= ALERT_THRESHOLDS[:failed_logins_per_ip]
        SecurityAlert.notify(:brute_force_detected, ip: ip, attempts: count)
      end
    end
  end
end
```

## 禁止事項

1. パスワードを平文で保存・送信しない
2. センシティブ情報をURLパラメータに含めない
3. エラーメッセージで内部情報を漏洩しない
4. 本番環境でデバッグモードを有効にしない
5. 署名なしCookieでセッションを管理しない
6. CORS設定で `*` を使用しない
