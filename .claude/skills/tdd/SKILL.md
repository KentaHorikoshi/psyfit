---
name: tdd
description: テスト駆動開発（TDD）ワークフロー。新機能実装、バグ修正、リファクタリング時に使用。80%以上のカバレッジを目標に、Red-Green-Refactorサイクルを実践。
---

# /tdd - Test-Driven Development Skill

テスト駆動開発（TDD）ワークフローを実行するスキル。

## 使用方法

```
/tdd <機能名または説明>
```

## TDDワークフロー

### 1. Red（テスト作成）

まず失敗するテストを書く。

```ruby
# spec/models/user_spec.rb
RSpec.describe User, type: :model do
  describe '#update_continue_days' do
    it 'increments continue_days when exercised today' do
      user = create(:user, continue_days: 5, last_exercise_at: 1.day.ago)
      user.update_continue_days

      expect(user.continue_days).to eq(6)
    end

    it 'resets continue_days when gap is more than 1 day' do
      user = create(:user, continue_days: 5, last_exercise_at: 3.days.ago)
      user.update_continue_days

      expect(user.continue_days).to eq(1)
    end
  end
end
```

### 2. Green（実装）

テストを通す最小限のコードを書く。

```ruby
# app/models/user.rb
class User < ApplicationRecord
  def update_continue_days
    if last_exercise_at.nil? || last_exercise_at < 2.days.ago
      self.continue_days = 1
    else
      self.continue_days += 1
    end
    save!
  end
end
```

### 3. Refactor（リファクタリング）

テストを維持しながらコードを改善。

```ruby
# app/models/user.rb
class User < ApplicationRecord
  def update_continue_days
    self.continue_days = consecutive? ? continue_days + 1 : 1
    save!
  end

  private

  def consecutive?
    last_exercise_at.present? && last_exercise_at >= 2.days.ago
  end
end
```

## カバレッジ目標

| 対象 | 目標 |
|------|------|
| 全体 | 80%以上 |
| 認証関連 | 100% |
| セキュリティ関連 | 100% |
| 金額計算 | 100% |

## テストツール

### バックエンド (Rails)

```ruby
# Gemfile
group :test do
  gem 'rspec-rails', '~> 7.0'
  gem 'factory_bot_rails'
  gem 'faker'
  gem 'simplecov', require: false
end
```

```ruby
# spec/rails_helper.rb
require 'simplecov'
SimpleCov.start 'rails' do
  add_filter '/spec/'
  minimum_coverage 80
end
```

### フロントエンド (React)

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80
        }
      }
    }
  }
});
```

## テストパターン

### モデルテスト

```ruby
RSpec.describe User, type: :model do
  # バリデーション
  describe 'validations' do
    it { should validate_presence_of(:email) }
    it { should validate_uniqueness_of(:email).case_insensitive }
  end

  # アソシエーション
  describe 'associations' do
    it { should have_many(:exercise_records) }
    it { should have_many(:daily_conditions) }
  end

  # メソッド
  describe '#full_name' do
    it 'returns formatted name' do
      user = build(:user, name: '田中太郎', name_kana: 'タナカタロウ')
      expect(user.full_name).to eq('田中太郎（タナカタロウ）')
    end
  end
end
```

### コントローラ/リクエストテスト

```ruby
RSpec.describe 'Api::V1::Patients', type: :request do
  let(:staff) { create(:staff, role: 'manager') }

  before { sign_in_as_staff(staff) }

  describe 'GET /api/v1/patients' do
    it 'returns paginated patients' do
      create_list(:user, 25)

      get '/api/v1/patients', params: { page: 1, per_page: 10 }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['data']['patients'].size).to eq(10)
      expect(json['data']['meta']['total']).to eq(25)
    end
  end

  describe 'POST /api/v1/patients/:id/measurements' do
    it 'creates measurement record' do
      patient = create(:user)

      post "/api/v1/patients/#{patient.id}/measurements", params: {
        measured_date: Date.current,
        weight_kg: 65.5,
        tug_seconds: 12.3
      }

      expect(response).to have_http_status(:created)
      expect(patient.measurements.count).to eq(1)
    end
  end
end
```

### コンポーネントテスト

```tsx
// src_user/components/__tests__/U01_Login.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { U01_Login } from '../U01_Login';
import { vi } from 'vitest';

describe('U01_Login', () => {
  it('renders login form', () => {
    render(<U01_Login />);

    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    render(<U01_Login />);

    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'invalid-email' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(screen.getByText('メールアドレスの形式が正しくありません')).toBeInTheDocument();
    });
  });

  it('calls onSubmit with valid data', async () => {
    const handleSubmit = vi.fn();
    render(<U01_Login onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'Password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123'
      });
    });
  });
});
```

## コマンド

### テスト実行

```bash
# Rails
bundle exec rspec                    # 全テスト
bundle exec rspec spec/models/       # モデルのみ
bundle exec rspec --tag focus        # focusタグのみ

# React
npm run test                         # 全テスト
npm run test -- --coverage           # カバレッジ付き
npm run test -- --watch              # ウォッチモード
```

### カバレッジ確認

```bash
# Rails - coverage/index.html を確認
open coverage/index.html

# React - coverage/index.html を確認
open coverage/index.html
```

## チェックリスト

実装完了時に確認:

- [ ] テストが全てパスする
- [ ] カバレッジが80%以上
- [ ] 認証・セキュリティ関連は100%
- [ ] エッジケースをカバー
- [ ] 既存テストが壊れていない
