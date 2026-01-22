# セキュリティガイドライン

## 必須セキュリティチェック

コミット前に必ず確認:
- [ ] ハードコードされた秘密情報がない（APIキー、パスワード、トークン）
- [ ] 全てのユーザー入力が検証されている
- [ ] SQLインジェクション対策（パラメータ化クエリ）
- [ ] XSS対策（HTMLサニタイズ）
- [ ] CSRF保護が有効
- [ ] 認証・認可が正しく実装されている
- [ ] 全エンドポイントにレート制限がある
- [ ] エラーメッセージが機密データを漏洩しない
- [ ] **PII暗号化** (name, email, birth_date)
- [ ] **監査ログ記録**

## 秘密情報の管理

```ruby
# 絶対禁止: ハードコード
api_key = "sk-proj-xxxxx"

# 必須: 環境変数
api_key = ENV['API_KEY']

raise 'API_KEY not configured' if api_key.blank?
```

## PII暗号化

暗号化必須フィールド:
- `users.name`
- `users.name_kana`
- `users.email`
- `users.birth_date`

```ruby
class User < ApplicationRecord
  encrypts :name
  encrypts :name_kana
  encrypts :email, deterministic: true
  encrypts :birth_date
end
```

## セッション管理

タイムアウト設定:
- 利用者: 30分
- 職員: 15分

## 監査ログ

記録必須アクション:
- login, logout, login_failed
- create, read, update, delete
- password_change, password_reset
- video_access

## セキュリティ問題発見時

1. 即座に停止
2. **security-agent** を使用
3. CRITICALな問題を修正してから続行
4. 露出した秘密情報をローテート
5. 類似の問題がないかコードベース全体をレビュー
