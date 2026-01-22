---
description: TypeScript・ビルドエラーを段階的に修正。エラーごとにコンテキストを表示し、修正を適用、検証。
---

# /build-fix コマンド

ビルドエラーを段階的に修正するコマンド。

## 実行内容

1. ビルドを実行: `npm run build` または `bundle exec rake`

2. エラー出力をパース:
   - ファイルごとにグループ化
   - 重要度で並べ替え

3. 各エラーについて:
   - エラーのコンテキストを表示（前後5行）
   - 問題を説明
   - 修正を提案
   - 修正を適用
   - ビルドを再実行
   - エラーが解決したことを確認

4. 停止条件:
   - 修正が新しいエラーを引き起こした
   - 同じエラーが3回続いた
   - ユーザーが停止を要求

5. サマリーを表示:
   - 修正したエラー数
   - 残っているエラー数
   - 新しく発生したエラー数

## 重要

**安全のために一度に1つのエラーを修正!**

## フロントエンドコマンド

```bash
# TypeScript型チェック
npx tsc --noEmit

# Viteビルド
npm run build

# ESLintチェック
npx eslint . --ext .ts,.tsx
```

## バックエンドコマンド

```bash
# Rubyの構文チェック
ruby -c app/models/user.rb

# Railsの読み込みテスト
bin/rails runner "puts 'OK'"

# RSpecドライラン
bundle exec rspec --dry-run
```

## よくあるエラーパターン

### 型推論失敗
```typescript
// ❌ ERROR: Parameter 'x' implicitly has an 'any' type
function add(x, y) { return x + y }

// ✅ FIX
function add(x: number, y: number): number { return x + y }
```

### Null/Undefinedエラー
```typescript
// ❌ ERROR: Object is possibly 'undefined'
const name = user.name.toUpperCase()

// ✅ FIX
const name = user?.name?.toUpperCase()
```

### インポートエラー
```typescript
// ❌ ERROR: Cannot find module
import { formatDate } from '@/lib/utils'

// ✅ FIX: tsconfig pathsを確認、または相対パスを使用
import { formatDate } from '../lib/utils'
```

## 関連コマンド

- `/plan` - 実装計画を立てる
- `/tdd` - TDDで実装
- `/code-review` - 実装をレビュー
