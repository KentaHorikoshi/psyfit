# コーディングスタイル

## 不変性 (CRITICAL)

常に新しいオブジェクトを作成し、ミューテーションを避ける:

```javascript
// 禁止: ミューテーション
function updateUser(user, name) {
  user.name = name  // ミューテーション!
  return user
}

// 正解: 不変性
function updateUser(user, name) {
  return {
    ...user,
    name
  }
}
```

## ファイル構成

多数の小さなファイル > 少数の大きなファイル:
- 高凝集、低結合
- 200-400行が標準、最大800行
- 大きなコンポーネントからユーティリティを抽出
- 機能/ドメインで整理（タイプではなく）

## エラーハンドリング

常に包括的にエラーを処理:

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error('ユーザーフレンドリーなメッセージ')
}
```

## 入力検証

常にユーザー入力を検証:

```ruby
# Rails
validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
validates :pain_level, numericality: { in: 0..10 }
```

```typescript
// TypeScript (Zod)
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  painLevel: z.number().int().min(0).max(10)
})

const validated = schema.parse(input)
```

## コード品質チェックリスト

作業完了前に確認:
- [ ] コードが読みやすく、適切な命名
- [ ] 関数が小さい（<50行）
- [ ] ファイルが集中している（<800行）
- [ ] 深いネストがない（>4レベル）
- [ ] 適切なエラーハンドリング
- [ ] console.log文がない
- [ ] ハードコードされた値がない
- [ ] ミューテーションがない（不変パターン使用）
- [ ] any型を使用していない

## 命名規則

### フロントエンド
- コンポーネント: PascalCase (`UserProfile.tsx`)
- 関数: camelCase (`formatDate`)
- 定数: UPPER_SNAKE_CASE (`MAX_RETRIES`)

### バックエンド
- クラス: PascalCase (`PatientService`)
- メソッド: snake_case (`update_continue_days`)
- 定数: UPPER_SNAKE_CASE (`SESSION_TIMEOUT`)
