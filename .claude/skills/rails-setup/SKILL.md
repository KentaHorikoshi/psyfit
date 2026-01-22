---
name: rails-setup
description: Rails 8プロジェクトのセットアップ手順。データベース作成、環境変数設定、依存関係インストール、暗号化キー生成を含む。
---

# Rails Setup Skill

Rails 8プロジェクトのセットアップ手順。

## 前提条件

- Ruby 3.3+
- PostgreSQL 15+
- Node.js 20+

## セットアップ手順

### 1. データベース作成

```bash
# PostgreSQLでデータベース作成
createdb psyfit_development
createdb psyfit_test
```

### 2. 環境変数設定

```bash
# .env.example をコピー
cp .env.example .env

# 必要な環境変数を設定
```

**.env に設定する項目:**

```bash
# Database
DATABASE_URL=postgres://localhost/psyfit_development

# Rails
RAILS_ENV=development
RAILS_MASTER_KEY=<master_key>

# Encryption (PII暗号化用)
ACTIVE_RECORD_ENCRYPTION_PRIMARY_KEY=<primary_key>
ACTIVE_RECORD_ENCRYPTION_DETERMINISTIC_KEY=<deterministic_key>
ACTIVE_RECORD_ENCRYPTION_KEY_DERIVATION_SALT=<salt>

# Session
SESSION_STORE_KEY=_psyfit_session
USER_SESSION_TIMEOUT=1800      # 30分（秒）
STAFF_SESSION_TIMEOUT=900      # 15分（秒）
```

### 3. 依存関係インストール

```bash
bundle install
```

### 4. データベースセットアップ

```bash
# マイグレーション実行
bin/rails db:migrate

# シードデータ投入（開発環境のみ）
bin/rails db:seed
```

### 5. 暗号化キー生成

```bash
# Active Record Encryptionのキー生成
bin/rails db:encryption:init

# 出力されたキーを.envに設定
```

### 6. サーバー起動

```bash
# Rails APIサーバー
bin/rails server -p 3001

# フロントエンド開発サーバー（別ターミナル）
cd src_user && npm run dev
cd src_admin && npm run dev
```

## Gemfile 必須Gem

```ruby
# Gemfile
source 'https://rubygems.org'

ruby '3.3.0'

gem 'rails', '~> 8.0'
gem 'pg', '~> 1.5'
gem 'puma', '>= 6.0'
gem 'bcrypt', '~> 3.1'      # パスワードハッシュ
gem 'rack-cors'              # CORS
gem 'rack-attack'            # レート制限
gem 'jwt'                    # トークン生成
gem 'pundit'                 # 認可
gem 'kaminari'               # ページネーション

group :development, :test do
  gem 'rspec-rails', '~> 7.0'
  gem 'factory_bot_rails'
  gem 'faker'
  gem 'dotenv-rails'
end

group :test do
  gem 'simplecov', require: false
end
```

## 初期設定ファイル

### config/application.rb

```ruby
require_relative 'boot'
require 'rails/all'

Bundler.require(*Rails.groups)

module Psyfit
  class Application < Rails::Application
    config.load_defaults 8.0

    # API only
    config.api_only = true

    # セッション有効化（APIモードでも）
    config.session_store :cookie_store, key: ENV['SESSION_STORE_KEY']
    config.middleware.use ActionDispatch::Cookies
    config.middleware.use ActionDispatch::Session::CookieStore

    # タイムゾーン
    config.time_zone = 'Tokyo'
    config.active_record.default_timezone = :local

    # セキュリティヘッダー
    config.action_dispatch.default_headers = {
      'X-Frame-Options' => 'SAMEORIGIN',
      'X-Content-Type-Options' => 'nosniff',
      'X-XSS-Protection' => '1; mode=block'
    }
  end
end
```

### config/database.yml

```yaml
default: &default
  adapter: postgresql
  encoding: unicode
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>

development:
  <<: *default
  database: psyfit_development

test:
  <<: *default
  database: psyfit_test

production:
  <<: *default
  url: <%= ENV['DATABASE_URL'] %>
```

## トラブルシューティング

### PostgreSQL接続エラー

```bash
# PostgreSQLが起動しているか確認
pg_isready

# 起動していない場合
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux
```

### マイグレーションエラー

```bash
# マイグレーションをやり直す
bin/rails db:drop db:create db:migrate
```

### 暗号化キーエラー

```bash
# キーが設定されていない場合
bin/rails db:encryption:init

# credentials.yml.encを使用する場合
EDITOR=vim bin/rails credentials:edit
```
