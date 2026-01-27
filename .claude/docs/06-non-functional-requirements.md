# Non-Functional Requirements (非機能要件)

## 1. アクセシビリティ要件

### WCAG 2.1 AA準拠

| 項目 | 基準 | 実装 |
|------|------|------|
| 最小フォントサイズ | 本文：16px以上 | --font-size: 16px |
| タップ領域 | 最小44×44px（iOS HIG準拠） | py-4 px-6 (Tailwind) |
| コントラスト比 | WCAG 2.1 AA準拠（4.5:1以上） | カラーパレット検証済み |
| キーボードナビゲーション | 全機能キーボードでアクセス可能 | focus-visible, tabindex |
| スクリーンリーダー | 適切な代替テキスト | aria-label, role属性 |

### 実装ガイドライン
```tsx
// アクセシビリティの良い例
<button
  className="py-4 px-6 text-base"
  aria-label="運動を開始する"
  onClick={handleStart}
>
  開始
</button>

// 悪い例
<div onClick={handleStart}>開始</div> // divをボタンとして使用
```

## 2. パフォーマンス要件

### レスポンスタイム
| 操作 | 目標レスポンスタイム |
|------|---------------------|
| ページ初期表示 | 2秒以内 |
| 画面遷移 | 1秒以内 |
| API レスポンス | 500ms以内 |
| 動画読み込み開始 | 3秒以内 |

### スループット
- **同時接続数**: 100ユーザー
- **ピークタイム**: 平日18:00-21:00（利用者の運動時間帯）
- **想定利用者数**: 初期50名、最大200名

### 最適化戦略
```typescript
// Code splitting
const Dashboard = lazy(() => import('./components/Dashboard'))
const PatientDetail = lazy(() => import('./components/PatientDetail'))

// 画像最適化
<img
  src="/images/exercise.webp"
  loading="lazy"
  width="400"
  height="300"
  alt="運動画像"
/>

// APIレスポンスキャッシング
const { data, isLoading } = useQuery('patients', fetchPatients, {
  staleTime: 5 * 60 * 1000, // 5分間キャッシュ
})
```

## 3. ブラウザ対応

### 対応ブラウザ
| ブラウザ | バージョン |
|----------|-----------|
| Chrome | 最新版 + 1つ前 |
| Safari | 最新版 + 1つ前 |
| Firefox | 最新版 + 1つ前 |
| Edge | 最新版 + 1つ前 |

### モバイル対応
- **iOS**: Safari (iOS 15以降)
- **Android**: Chrome (Android 10以降)
- **レスポンシブ**: 320px〜2560px

### Progressive Web App (PWA)
- オフライン閲覧（基本画面のみ）
- ホーム画面追加対応
- プッシュ通知対応（将来実装）

## 4. 可用性・信頼性

### 稼働時間
- **目標稼働率**: 99.5%
- **メンテナンス時間**: 毎週日曜 2:00-4:00（2時間）
- **計画停止**: 月1回、事前通知あり

### バックアップ
| 対象 | 頻度 | 保持期間 |
|------|------|---------|
| データベース | 日次（深夜2:00） | 30日間 |
| 動画ファイル | 週次 | 90日間 |
| 設定ファイル | 変更時 | 無期限 |

### 障害復旧
- **RTO (Recovery Time Objective)**: 4時間
- **RPO (Recovery Point Objective)**: 24時間
- **自動フェイルオーバー**: データベースレプリケーション

## 5. スケーラビリティ

### 水平スケーリング
```yaml
# 将来的なスケーリング戦略
# Railsアプリケーションサーバー
app_servers:
  min: 2
  max: 5
  scale_up_threshold: CPU 70%
  scale_down_threshold: CPU 30%

# データベース
database:
  primary: 1
  read_replicas: 2 # 読み取り負荷分散
```

### キャッシング戦略
- **Redis 7**: セッション、APIレスポンスキャッシュ（Docker環境で構成済み）
- **CDN**: 静的アセット（画像、CSS、JS）
- **ブラウザキャッシュ**: 適切なCache-Controlヘッダー

## 6. 保守性・運用性

### ログ管理
```ruby
# ログレベル
# - DEBUG: 開発環境のみ
# - INFO: 通常のリクエスト、重要なイベント
# - WARN: 非推奨機能の使用、軽微な問題
# - ERROR: エラー発生時
# - FATAL: システム停止レベルのエラー

# ログ出力例
Rails.logger.info "Patient #{patient.id} logged in from IP #{request.remote_ip}"
Rails.logger.error "Failed to save exercise record: #{e.message}"
```

### モニタリング
- **APM**: Application Performance Monitoring
- **エラートラッキング**: Sentry / Rollbar
- **アップタイムモニタリング**: 外部サービスによる死活監視
- **アラート通知**: 管理者へのメール・Slack通知

### デプロイ
- **デプロイ頻度**: 週1回（金曜午前）
- **デプロイ方式**: Blue-Greenデプロイメント
- **ロールバック**: ワンクリックロールバック可能
- **コンテナ化**: Docker + Docker Compose（Kamal対応）

### Docker環境構成（実装済み）

| 環境 | 構成ファイル | サービス |
|------|------------|---------|
| 開発 | `docker-compose.yml` | api, db(PostgreSQL 16), redis(Redis 7), frontend_user, frontend_admin |
| 本番 | `docker-compose.prod.yml` | api, db(PostgreSQL 16), redis(Redis 7) |

**本番環境の特徴**:
- ヘルスチェック設定（DB: 10秒間隔、API: 30秒間隔）
- ログローテーション（json-file、最大50MB x 5ファイル）
- restart: unless-stopped による自動復旧
- ネットワーク分離（psyfit_prod）

## 7. セキュリティ非機能要件

### 定期的なセキュリティ監査
- **脆弱性スキャン**: 月次
- **ペネトレーションテスト**: 年次
- **依存パッケージ更新**: 週次チェック

### セキュリティヘッダー
```ruby
# config/application.rb
config.action_dispatch.default_headers = {
  'X-Frame-Options' => 'SAMEORIGIN',
  'X-Content-Type-Options' => 'nosniff',
  'X-XSS-Protection' => '1; mode=block',
  'Strict-Transport-Security' => 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy' => "default-src 'self'; script-src 'self' 'unsafe-inline'"
}
```

## 8. 多言語対応（将来実装）

### 対応言語
- 日本語（現在）
- 英語（Phase 2）
- 中国語（Phase 3）

### 実装方式
- **i18n**: react-i18next
- **日付フォーマット**: date-fns
- **数値フォーマット**: Intl.NumberFormat

## 9. テスト要件

### テストカバレッジ
| テストタイプ | 目標カバレッジ |
|-------------|---------------|
| 単体テスト | 80%以上 |
| 結合テスト | 主要機能100% |
| E2Eテスト | クリティカルパス100% |

### テスト環境
- **開発環境**: ローカル / Docker (`docker-compose.yml`)
- **ステージング環境**: 本番同等構成 (`docker-compose.prod.yml`)
- **Docker環境テスト**: `bin/docker-test`（41項目の自動検証）
- **CI/CD**: GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          npm run test
          npm run test:e2e
```
