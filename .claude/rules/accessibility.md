# アクセシビリティ要件

## WCAG 2.1 AA準拠必須

### 1. フォントサイズ
- 最小: 16px
- 見出し: 適切な階層構造

```tsx
// 良い例
<p className="text-base">本文テキスト</p>  // 16px
<h1 className="text-2xl">見出し</h1>      // 24px

// 悪い例
<p className="text-xs">小さすぎる</p>     // 12px
```

### 2. タップ領域
- 最小: 44×44px
- ボタン、リンク、フォーム要素

```tsx
// 良い例
<button className="py-4 px-6 min-h-[44px] min-w-[44px]">
  クリック
</button>

// 悪い例
<button className="py-1 px-2">
  小さすぎる
</button>
```

### 3. コントラスト比
- 通常テキスト: 4.5:1以上
- 大きいテキスト: 3:1以上

### 4. キーボード操作
- 全機能がキーボードでアクセス可能
- フォーカス順序が論理的
- フォーカス状態が視覚的に明確

```tsx
<button
  className="focus:ring-2 focus:ring-primary focus:outline-none"
  onKeyDown={(e) => e.key === 'Enter' && handleAction()}
>
  アクション
</button>
```

### 5. ARIA属性
- 適切なaria-label
- 適切なrole属性
- 状態の通知（aria-live）

```tsx
// 良い例
<button aria-label="運動を開始する">
  <PlayIcon />
</button>

<div role="alert" aria-live="polite">
  {errorMessage}
</div>

// 悪い例
<div onClick={handleClick}>クリック可能</div>
```

### 6. フォーム
- label要素との関連付け
- エラーメッセージの明確な表示
- 必須フィールドの明示

```tsx
<label htmlFor="email" className="block mb-1">
  メールアドレス
  <span className="text-red-500" aria-hidden="true">*</span>
  <span className="sr-only">（必須）</span>
</label>
<input
  id="email"
  type="email"
  required
  aria-required="true"
  aria-invalid={!!error}
  aria-describedby={error ? "email-error" : undefined}
/>
{error && (
  <p id="email-error" role="alert" className="text-red-500">
    {error}
  </p>
)}
```

## チェックリスト

コンポーネント作成時:
- [ ] フォントサイズが16px以上
- [ ] タップ領域が44×44px以上
- [ ] コントラスト比が4.5:1以上
- [ ] キーボードでアクセス可能
- [ ] aria-label/role属性が適切
- [ ] フォーカス状態が明確

## テストツール

```bash
# axe-core
npm run test:a11y

# Lighthouse
npx lighthouse --accessibility
```
