# テスト要件

## 最小テストカバレッジ: 80%

テストタイプ（全て必須）:
1. **単体テスト** - 個別の関数、ユーティリティ、コンポーネント
2. **統合テスト** - APIエンドポイント、データベース操作
3. **E2Eテスト** - 重要なユーザーフロー（Playwright）

## 100%カバレッジ必須

- 認証ロジック
- セキュリティ関連コード
- PII暗号化処理
- 監査ログ記録

## テスト駆動開発

必須ワークフロー:
1. テストを先に書く (RED)
2. テストを実行 - 失敗すべき
3. 最小限の実装 (GREEN)
4. テストを実行 - パスすべき
5. リファクタリング (IMPROVE)
6. カバレッジ確認 (80%+)

## テストコマンド

### Rails (RSpec)
```bash
bundle exec rspec                    # 全テスト
bundle exec rspec spec/models/       # モデルのみ
bundle exec rspec --coverage         # カバレッジ付き
```

### React (Vitest)
```bash
npm run test                         # 全テスト
npm run test -- --coverage           # カバレッジ付き
npm run test -- --watch              # ウォッチモード
```

## テストファイル配置

### Rails
```
spec/
├── models/
│   └── user_spec.rb
├── requests/
│   └── api/v1/patients_spec.rb
└── services/
    └── security_monitor_spec.rb
```

### React
```
src_user/
├── components/
│   ├── U01_Login.tsx
│   └── __tests__/
│       └── U01_Login.test.tsx
```

## テスト失敗時のトラブルシューティング

1. **tdd-guide** エージェントを使用
2. テストの分離を確認
3. モックが正しいか確認
4. 実装を修正（テストではなく、テストが間違っている場合を除く）

## エージェントサポート

- **tdd-guide** - 新機能でプロアクティブに使用、テスト先行を強制
