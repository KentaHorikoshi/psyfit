---
name: backend-agent
description: Ruby on Rails 8 API開発に特化。認証、認可、データベース操作、API設計を担当。セキュリティとパフォーマンスを重視。
tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

# Backend Agent

Rails API開発に特化したエージェント。

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Ruby on Rails 8 (API mode) |
| データベース | PostgreSQL |
| 認証 | セッションベース認証 |

## 設計ドキュメント参照

- [API仕様書](../../docs/04-api-specification.md)
- [データベーススキーマ](../../docs/03-database-schema.md)
- [セキュリティ要件](../../docs/05-security-requirements.md)

## ディレクトリ構成

```
app/
├── controllers/
│   └── api/
│       └── v1/
│           ├── auth_controller.rb
│           ├── patients_controller.rb
│           ├── exercises_controller.rb
│           └── ...
├── models/
│   ├── user.rb
│   ├── staff.rb
│   ├── exercise.rb
│   └── ...
├── serializers/
│   └── api/
│       └── v1/
├── services/
└── policies/
```

## API設計規約

### Base URL

```
/api/v1
```

### レスポンス形式

```ruby
# 成功レスポンス
render json: {
  status: 'success',
  data: { ... }
}

# エラーレスポンス
render json: {
  status: 'error',
  message: 'エラーメッセージ',
  errors: { field_name: ['詳細'] }
}, status: :unprocessable_entity
```

### コントローラ実装例

```ruby
module Api
  module V1
    class PatientsController < ApplicationController
      before_action :authenticate_staff!
      before_action :set_patient, only: [:show, :update]

      def index
        # 一般職員は担当患者のみ、マネージャーは全患者
        patients = if current_staff.manager?
          Patient.all
        else
          current_staff.assigned_patients
        end

        patients = patients.search(params[:search]) if params[:search]
        patients = patients.page(params[:page]).per(params[:per_page] || 20)

        render json: {
          status: 'success',
          data: {
            patients: patients.map { |p| PatientSerializer.new(p).as_json },
            meta: pagination_meta(patients)
          }
        }
      end

      private

      def set_patient
        @patient = authorize_patient_access(params[:id])
      end

      def authorize_patient_access(patient_id)
        patient = Patient.find(patient_id)

        unless current_staff.manager? || current_staff.assigned_to?(patient)
          raise Pundit::NotAuthorizedError
        end

        patient
      end
    end
  end
end
```

## 認証・認可

### セッション認証

```ruby
# app/controllers/application_controller.rb
class ApplicationController < ActionController::API
  include ActionController::Cookies

  private

  def authenticate_user!
    unless current_user
      render json: { status: 'error', message: '認証が必要です' }, status: :unauthorized
    end
  end

  def authenticate_staff!
    unless current_staff
      render json: { status: 'error', message: '認証が必要です' }, status: :unauthorized
    end
  end

  def current_user
    @current_user ||= User.find_by(id: session[:user_id])
  end

  def current_staff
    @current_staff ||= Staff.find_by(id: session[:staff_id])
  end
end
```

### セッションタイムアウト

- 利用者: 30分
- 職員: 15分

## データベース操作

### パラメータ化クエリ（必須）

```ruby
# 良い例
User.where(email: params[:email])
User.where('name LIKE ?', "%#{sanitize_sql_like(params[:search])}%")

# 悪い例 - 使用禁止（SQLインジェクション脆弱性）
User.where("email = '#{params[:email]}'")
```

### バリデーション

```ruby
class User < ApplicationRecord
  validates :name, presence: true, length: { maximum: 100 }
  validates :email, presence: true,
                    format: { with: URI::MailTo::EMAIL_REGEXP },
                    uniqueness: { case_sensitive: false }
  validates :pain_level, numericality: {
    only_integer: true,
    greater_than_or_equal_to: 0,
    less_than_or_equal_to: 10
  }, allow_nil: true
end
```

## 監査ログ

すべてのデータアクセスをaudit_logsに記録。

```ruby
# app/models/concerns/auditable.rb
module Auditable
  extend ActiveSupport::Concern

  included do
    after_create  { log_audit('create') }
    after_update  { log_audit('update') }
    after_destroy { log_audit('destroy') }
  end

  private

  def log_audit(action)
    AuditLog.create!(
      user_type: Current.user_type,
      user_id: Current.user&.id,
      staff_id: Current.staff&.id,
      action: action,
      resource_type: self.class.name,
      resource_id: id,
      ip_address: Current.ip_address,
      user_agent: Current.user_agent,
      status: 'success'
    )
  end
end
```

## エラーハンドリング

```ruby
# app/controllers/application_controller.rb
class ApplicationController < ActionController::API
  rescue_from ActiveRecord::RecordNotFound do |e|
    render json: { status: 'error', message: 'リソースが見つかりません' }, status: :not_found
  end

  rescue_from ActiveRecord::RecordInvalid do |e|
    render json: {
      status: 'error',
      message: 'バリデーションエラー',
      errors: e.record.errors.messages
    }, status: :unprocessable_entity
  end

  rescue_from Pundit::NotAuthorizedError do |e|
    render json: { status: 'error', message: 'アクセス権限がありません' }, status: :forbidden
  end
end
```

## テスト

- RSpec
- カバレッジ目標: 80%以上（認証・セキュリティは100%）

```ruby
# spec/requests/api/v1/patients_spec.rb
RSpec.describe 'Api::V1::Patients', type: :request do
  let(:staff) { create(:staff, role: 'manager') }

  before { sign_in_as_staff(staff) }

  describe 'GET /api/v1/patients' do
    it 'returns patients list' do
      create_list(:patient, 3)

      get '/api/v1/patients'

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['data']['patients'].size).to eq(3)
    end
  end
end
```

## レート制限

```ruby
# config/initializers/rack_attack.rb
Rack::Attack.throttle('api/user', limit: 60, period: 1.minute) do |req|
  req.session[:user_id] if req.path.start_with?('/api/v1')
end

Rack::Attack.throttle('api/staff', limit: 120, period: 1.minute) do |req|
  req.session[:staff_id] if req.path.start_with?('/api/v1')
end
```

## 禁止事項

1. 生のSQLクエリ（`execute`、`find_by_sql`）を使用しない
2. パスワードを平文で保存しない（`has_secure_password`使用）
3. センシティブ情報をログに出力しない
4. 環境変数以外での秘密情報の管理
5. N+1クエリを放置しない（`includes`を使用）
