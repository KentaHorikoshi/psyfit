# /build-fix - Build Error Fix Skill

ビルドエラー・型エラーの修正スキル。

## 使用方法

```
/build-fix
```

## エラー診断フロー

### 1. エラー種別の特定

| エラー種別 | 発生場所 | 対処方法 |
|-----------|---------|---------|
| TypeScript型エラー | フロントエンド | 型定義の修正 |
| ESLintエラー | フロントエンド | コードスタイル修正 |
| Viteビルドエラー | フロントエンド | 設定・依存関係確認 |
| Railsエラー | バックエンド | Ruby/Rails修正 |
| RSpecエラー | バックエンド | テスト修正 |
| マイグレーションエラー | バックエンド | DB設定確認 |

### 2. エラーログの確認

```bash
# フロントエンド
npm run build 2>&1 | tee build.log
npm run type-check 2>&1 | tee typecheck.log
npm run lint 2>&1 | tee lint.log

# バックエンド
bin/rails db:migrate 2>&1 | tee migrate.log
bundle exec rspec 2>&1 | tee rspec.log
```

## TypeScriptエラー

### よくあるエラーと修正

#### TS2304: Cannot find name

```typescript
// エラー: Cannot find name 'Patient'
// 修正: importを追加
import { Patient } from '@/types';
```

#### TS2345: Argument type mismatch

```typescript
// エラー: Argument of type 'string | undefined' is not assignable to parameter of type 'string'
// 修正: nullチェックを追加
const value = params.id;
if (value) {
  processId(value);
}

// または
processId(params.id ?? '');
```

#### TS2339: Property does not exist

```typescript
// エラー: Property 'name' does not exist on type '{}'
// 修正: 型を定義
interface User {
  name: string;
  email: string;
}

const user: User = response.data;
console.log(user.name);
```

#### TS7006: Implicit any

```typescript
// エラー: Parameter 'e' implicitly has an 'any' type
// 修正: 型アノテーションを追加
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};
```

### 型定義ファイルの作成

```typescript
// src/types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  continue_days: number;
  status: '急性期' | '回復期' | '維持期';
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}
```

## ESLintエラー

### よくあるエラーと修正

#### react-hooks/exhaustive-deps

```typescript
// エラー: React Hook useEffect has a missing dependency
// 修正: 依存配列に追加
useEffect(() => {
  fetchData(userId);
}, [userId]); // userIdを追加
```

#### @typescript-eslint/no-unused-vars

```typescript
// エラー: 'value' is defined but never used
// 修正: 使用しない変数は削除、またはアンダースコアプレフィックス
const { data, _unused } = response;
// または
const { data } = response;
```

#### react/jsx-no-target-blank

```tsx
// エラー: Using target="_blank" without rel="noopener noreferrer"
// 修正: rel属性を追加
<a href={url} target="_blank" rel="noopener noreferrer">
  リンク
</a>
```

## Railsエラー

### よくあるエラーと修正

#### ActiveRecord::RecordNotFound

```ruby
# エラー: Couldn't find User with 'id'=xxx
# 修正: 存在チェックを追加
user = User.find_by(id: params[:id])
return render_not_found unless user
```

#### ActiveRecord::StatementInvalid

```ruby
# エラー: PG::UndefinedColumn
# 修正: マイグレーションを確認、カラムを追加
rails generate migration AddColumnToUsers column_name:string
```

#### NoMethodError: undefined method

```ruby
# エラー: undefined method 'name' for nil:NilClass
# 修正: nilチェックを追加
user&.name  # またはガード句
return unless user
```

### マイグレーションエラー

```bash
# マイグレーション状態確認
bin/rails db:migrate:status

# ロールバック
bin/rails db:rollback

# 特定バージョンまでロールバック
bin/rails db:migrate:down VERSION=20260121000001

# データベースリセット（開発環境のみ）
bin/rails db:drop db:create db:migrate db:seed
```

## 依存関係エラー

### npm依存関係

```bash
# node_modulesをクリーンインストール
rm -rf node_modules package-lock.json
npm install

# キャッシュクリア
npm cache clean --force
```

### Gem依存関係

```bash
# bundlerをクリーンインストール
rm -rf vendor/bundle
bundle install

# Gemfileの更新
bundle update
```

## トラブルシューティング

### フロントエンドが起動しない

```bash
# ポート確認
lsof -i :5173

# プロセス強制終了
kill -9 $(lsof -t -i :5173)

# 再起動
npm run dev
```

### Railsが起動しない

```bash
# サーバープロセス確認
ps aux | grep puma

# PIDファイル削除
rm tmp/pids/server.pid

# 再起動
bin/rails server
```

### データベース接続エラー

```bash
# PostgreSQL確認
pg_isready

# 接続テスト
psql -d psyfit_development -c "SELECT 1"

# PostgreSQL再起動
brew services restart postgresql  # macOS
sudo systemctl restart postgresql # Linux
```

## 修正後の確認

```bash
# フロントエンド
npm run type-check  # 型チェック
npm run lint        # Lintチェック
npm run build       # ビルド確認
npm run test        # テスト実行

# バックエンド
bin/rails db:migrate:status  # マイグレーション状態
bundle exec rspec            # テスト実行
bin/rails server             # 起動確認
```

## チェックリスト

修正完了時に確認:

- [ ] すべてのエラーが解消
- [ ] ビルドが成功
- [ ] テストがパス
- [ ] 開発サーバーが起動
- [ ] 既存機能が壊れていない
