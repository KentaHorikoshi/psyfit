---
description: テスト駆動開発ワークフローを実行。インターフェース定義、テスト先行、最小限の実装。80%以上のカバレッジを確保。
---

# /tdd コマンド

TDD（テスト駆動開発）を実行するコマンド。

## 実行内容

1. **インターフェース定義** - 型/インターフェースを先に定義
2. **テスト作成** - 失敗するテストを書く (RED)
3. **最小限の実装** - テストを通す最小コード (GREEN)
4. **リファクタリング** - テストを維持しながら改善 (REFACTOR)
5. **カバレッジ確認** - 80%以上を確保

## 使用タイミング

- 新機能の実装時
- 新しい関数/コンポーネント追加時
- バグ修正時（先にバグを再現するテストを書く）
- リファクタリング時
- 重要なビジネスロジック実装時

## TDDサイクル

```
RED → GREEN → REFACTOR → REPEAT

RED:      失敗するテストを書く
GREEN:    テストを通す最小コードを書く
REFACTOR: テストを維持しながらコード改善
REPEAT:   次の機能/シナリオへ
```

## カバレッジ要件

- **80%以上**: 全コード
- **100%必須**:
  - 認証ロジック
  - セキュリティ関連
  - PII暗号化処理

## 使用例

```
User: /tdd 継続日数を更新する関数を実装

# Step 1: インターフェース定義
# Step 2: 失敗するテストを書く
# Step 3: テストを実行して失敗を確認
# Step 4: 最小限の実装
# Step 5: テストを実行してパスを確認
# Step 6: リファクタリング
# Step 7: カバレッジ確認
```

## PsyFit固有の注意点

### RSpec (Rails)
```ruby
# spec/models/user_spec.rb
RSpec.describe User, type: :model do
  describe '#update_continue_days' do
    it 'increments continue_days when exercised today' do
      user = create(:user, continue_days: 5, last_exercise_at: 1.day.ago)
      user.update_continue_days
      expect(user.continue_days).to eq(6)
    end
  end
end
```

### Vitest (React)
```tsx
// src_user/components/__tests__/U01_Login.test.tsx
import { render, screen } from '@testing-library/react';
import { U01_Login } from '../U01_Login';

describe('U01_Login', () => {
  it('renders login form', () => {
    render(<U01_Login />);
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
  });
});
```

## 関連コマンド

- `/plan` - 実装計画を立てる
- `/code-review` - 実装をレビュー
- `/build-fix` - ビルドエラーを修正
