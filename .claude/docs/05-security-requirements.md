# Security & Compliance Requirements

## 1. 認証・アクセス制御

### パスワードポリシー
- **最低文字数**: 8文字
- **文字種要件**: 英大文字・小文字・数字から2種類以上
- **有効期限**: 90日（職員アカウント）
- **再利用禁止**: 過去3回のパスワードは使用不可

### アカウントロックアウト
- **ロック条件**: ログイン失敗5回
- **ロック期間**: 30分間
- **解除方法**: 時間経過または管理者による手動解除

### セッション管理
- **利用者**: 30分無操作で自動ログアウト
- **職員**: 15分無操作で自動ログアウト
- **セッション更新**: アクティブ操作時に自動延長
- **セッションID**: 暗号学的に安全な乱数生成

### アクセスログ
- **記録対象**: 全ログイン試行、操作履歴
- **保存先**: audit_logs テーブル
- **保持期間**: 3年間
- **記録内容**:
  - ユーザーID
  - アクション種別
  - IPアドレス
  - タイムスタンプ
  - 結果（成功/失敗）

## 2. データ保護

### 個人情報暗号化
- **暗号化方式**: AES-256-GCM
- **暗号化対象フィールド**:
  - name (患者氏名)
  - name_kana (患者氏名カナ)
  - email (メールアドレス)
  - birth_date (生年月日)
- **鍵管理**: 環境変数による管理、定期ローテーション

### 通信暗号化
- **プロトコル**: HTTPS必須
- **TLS バージョン**: TLS 1.2以上
- **証明書**: 有効なSSL/TLS証明書
- **HSTS**: Strict-Transport-Security ヘッダー有効化

### データ削除
- **削除方式**: 論理削除（deleted_at フィールド）
- **保持期間**: 3年間
- **完全削除**: 保持期間経過後、バッチ処理で物理削除

## 3. 動画配信のアクセス制御

### 配信方式
- **格納先**: 自社サーバー内専用ストレージ (`storage/videos/`)
- **配信経路**: Rails APIサーバー経由の専用エンドポイント
- **直接アクセス**: 禁止（Webサーバー経由の直接アクセス不可）

### 実装済みエンドポイント ✅

| エンドポイント | 機能 | 認証 |
|--------------|------|------|
| GET /api/v1/videos/:exercise_id/token | 一時トークン発行 | セッション認証 |
| GET /api/v1/videos/:exercise_id/stream?token=xxx | 動画ストリーミング | トークン認証 |

### アクセス制御フロー

```
1. 利用者がログイン（セッション認証）
   ↓
2. トークン発行API呼び出し
   - セッション認証確認
   - 運動割り当て確認（patient_exercises テーブル）
   - 一時トークン生成（1時間有効）
   ↓
3. 動画ストリーミングAPI呼び出し
   - トークン検証（有効期限、使用済み、ユーザー一致、運動一致）
   - Range requestサポート（動画シーク対応）
   - 監査ログ記録
   ↓
4. 動画配信
```

### 実装コード

```ruby
# app/models/video_access_token.rb
class VideoAccessToken < ApplicationRecord
  belongs_to :user
  belongs_to :exercise

  scope :valid, -> { where('expires_at > ? AND used_at IS NULL', Time.current) }

  def self.generate_for(user:, exercise:, expires_in: 1.hour)
    create!(
      user: user,
      exercise: exercise,
      token: SecureRandom.hex(32),  # 64文字
      expires_at: Time.current + expires_in
    )
  end

  def valid_for_streaming?
    !expired? && !used?
  end
end
```

```ruby
# app/controllers/api/v1/videos_controller.rb
class VideosController < BaseController
  def token
    # セッション認証 + 運動割り当て確認
    verify_exercise_assignment
    access_token = VideoAccessToken.generate_for(user: current_user, exercise: @exercise)
    render_success(token: access_token.token, ...)
  end

  def stream
    # トークン検証
    access_token = VideoAccessToken.find_valid_token(params[:token])
    # ユーザー・運動一致確認
    # 監査ログ記録
    # Range request対応でストリーミング
    stream_video(video_path)
  end
end
```

### セキュリティ対策
- **セッション認証**: ログイン済みユーザーのみトークン発行可能
- **割り当て確認**: 職員が患者に割り当てた運動動画のみ視聴可能（`patient_exercises` テーブルで管理）
- **一時トークン**: 1時間有効、暗号学的に安全な乱数（SecureRandom.hex(32)）
- **トークンバインディング**: ユーザーIDと運動IDに紐付け、他ユーザーは使用不可
- **監査ログ**: 動画アクセスを `audit_logs` に記録（action: 'video_access'）
- **Range request**: 動画シーク対応、不正なRangeは416エラー

### データベーステーブル

```sql
CREATE TABLE video_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  token VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_video_access_tokens_valid ON video_access_tokens(expires_at, used_at);
```

### テストカバレッジ

| ファイル | カバレッジ | テスト数 |
|---------|-----------|---------|
| VideoAccessToken モデル | 100% | 23件 |
| VideosController | 100% | 24件 |

**テストシナリオ**:
- トークン生成・検証
- 期限切れトークンの拒否
- 使用済みトークンの拒否
- 未割当運動へのアクセス拒否（403）
- 他ユーザーのトークン使用拒否（403）
- Range request処理（206 Partial Content）
- 不正なRange headerの拒否（416）
- 監査ログ記録

## 4. 権限制御

### 職員権限レベル
| 権限 | 役職 | アクセス範囲 |
|------|------|------------|
| Manager | マネージャー | 全機能アクセス可能、職員管理可能 |
| Staff | 一般職員 | 担当患者のみアクセス、職員管理不可 |

### 権限別機能一覧
| 機能 | Manager | Staff |
|------|---------|-------|
| ダッシュボード閲覧 | ✓ | ✓ |
| 担当患者情報閲覧 | ✓ | ✓ |
| 全患者情報閲覧 | ✓ | ✗ |
| **患者登録** | ✓ | ✗ |
| 測定値入力 | ✓ | ✓（担当患者のみ） |
| 運動メニュー設定 | ✓ | ✓（担当患者のみ） |
| レポート出力 | ✓ | ✓（担当患者のみ） |
| 職員管理 | ✓ | ✗ |
| システム設定 | ✓ | ✗ |

### 患者登録セキュリティフロー

```
1. マネージャーがS-03画面で「新規患者登録」ボタンをクリック
   - 認証: 職員セッション必須
   - 認可: role = 'manager' のみ
   ↓
2. フロントエンドでバリデーション
   - 必須項目チェック
   - メールアドレス形式
   - パスワード複雑性表示
   ↓
3. POST /api/v1/patients API呼び出し
   ↓
4. バックエンド処理
   - セッション認証確認
   - マネージャー権限確認（403 Forbidden for non-managers）
   - 入力検証（SQLインジェクション対策）
   - user_code一意性チェック
   - email一意性チェック（blind index使用）
   - PII暗号化（name, name_kana, email, birth_date → AES-256-GCM）
   - パスワードハッシュ化（bcrypt）
   - DB保存
   - 監査ログ記録（action: 'create', resource_type: 'User'）
   ↓
5. 成功レスポンス + 初期パスワード通知
   - 画面表示（印刷して患者に渡す）
   - または パスワードリセットメール送信
```

**初期パスワードの取り扱い**:
- ランダム生成推奨（SecureRandom.base64(12)）
- 固定初期パスワードは禁止
- 登録後、患者にパスワードリセットを促す運用を推奨

## 5. 入力検証

### フロントエンド検証
- メールアドレス形式
- パスワード強度
- 数値範囲（0-10スライダー等）
- 必須項目チェック

### バックエンド検証
- **入力サニタイゼーション**: 全ユーザー入力をサニタイズ
- **SQLインジェクション対策**: パラメータ化クエリのみ使用
- **XSS対策**: HTMLエスケープ処理
- **CSRF対策**: トークン検証必須

```ruby
# バリデーション例
class Patient < ApplicationRecord
  validates :name, presence: true, length: { maximum: 100 }
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :pain_level, numericality: {
    only_integer: true,
    greater_than_or_equal_to: 0,
    less_than_or_equal_to: 10
  }
end
```

## 6. 監査・コンプライアンス

### ログ記録
- **認証イベント**: ログイン成功/失敗
- **データアクセス**: 患者情報閲覧・編集
- **権限変更**: 職員権限の変更
- **データ削除**: 論理削除・物理削除

### コンプライアンス
- **個人情報保護法**: 適切な同意取得、目的外利用禁止
- **医療情報ガイドライン**: 3省2ガイドライン準拠
- **GDPR対応**: データポータビリティ、削除権対応

### インシデント対応
1. **検知**: 異常アクセスパターンの自動検知
2. **通知**: 管理者への即時通知
3. **調査**: ログ分析による原因究明
4. **対応**: アカウント停止、パスワードリセット強制
5. **報告**: インシデントレポート作成
