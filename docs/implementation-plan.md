# PsyFit 実装計画書

作成日: 2026-01-23
最終更新: 2026-01-23
バージョン: 1.3

---

## 1. 現状サマリー

### 完了済み
| カテゴリ | 項目 | 状況 |
|----------|------|------|
| 設計ドキュメント | 6ファイル作成 | ✅ 完了 |
| UIコンポーネント | 利用者12画面 + 職員9画面 | ✅ 完了 |
| DBマイグレーション | 11テーブル | ✅ 完了 |
| モデル | 9モデル（バリデーション・暗号化含む） | ✅ 完了 |
| API | 認証（login/logout/me） | ✅ 完了 |
| フロントエンド認証 | AuthContext + Login画面（U-01, S-01） | ✅ 完了 |
| フロントエンドテスト | 認証機能（カバレッジ97%+） | ✅ 完了 |
| バックエンドテスト | 認証機能（カバレッジ100%） | ✅ 完了 |

### 進行中
- バックエンドAPI実装（認証以外のエンドポイント）
- セキュリティ完全実装（レート制限）

### 未着手
- 運動メニュー・記録API
- 患者管理API
- バックエンドテスト（認証以外）

---

## 2. Phase 1: MVP（最小機能製品）

### 2.1 認証機能の完全実装

#### バックエンド
| タスク | 優先度 | 依存 | 状態 |
|--------|:------:|------|:----:|
| POST /api/v1/auth/login（利用者） | P1 | - | ✅ |
| POST /api/v1/auth/staff/login（職員） | P1 | - | ✅ |
| DELETE /api/v1/auth/logout | P1 | - | ✅ |
| GET /api/v1/auth/me（セッション確認） | P1 | login | ✅ |
| セッションタイムアウト実装 | P1 | login | ✅ |
| ログイン失敗時のアカウントロック | P2 | login | ✅ |
| 監査ログ記録（login/logout） | P1 | login | ✅ |

#### フロントエンド
| タスク | 優先度 | 依存 | 状態 |
|--------|:------:|------|:----:|
| U-01: ログイン画面API接続 | P1 | auth API | ✅ |
| S-01: 職員ログイン画面API接続 | P1 | staff auth API | ✅ |
| 認証状態管理（Context/Store） | P1 | - | ✅ |
| セッション切れ時の自動リダイレクト | P2 | auth state | ✅ |

#### テスト
| タスク | 優先度 | 状態 |
|--------|:------:|:----:|
| AuthController単体テスト | P1 | ✅ 100% |
| ログインフロー統合テスト | P1 | ✅ 100% |
| セッションタイムアウトテスト | P1 | ✅ 100% |
| フロントエンド認証テスト（利用者） | P1 | ✅ 97% |
| フロントエンド認証テスト（職員） | P1 | ✅ 98% |

---

### 2.2 運動メニュー表示

#### バックエンド
| タスク | 優先度 | 依存 | 状態 |
|--------|:------:|------|:----:|
| GET /api/v1/exercises | P1 | - | ⬜ |
| GET /api/v1/users/me/exercises | P1 | auth | ⬜ |
| ExercisesController作成 | P1 | - | ⬜ |
| PatientExercisesController作成 | P1 | - | ⬜ |

#### フロントエンド
| タスク | 優先度 | 依存 | 状態 |
|--------|:------:|------|:----:|
| U-03: 運動メニュー選択API接続 | P1 | exercises API | ⬜ |
| U-11: 運動カードAPI接続 | P1 | my exercises API | ⬜ |
| U-04: 運動実施画面API接続 | P1 | exercises API | ⬜ |

#### テスト
| タスク | 優先度 | 状態 |
|--------|:------:|:----:|
| ExercisesController単体テスト | P1 | ⬜ |
| 運動メニュー取得統合テスト | P2 | ⬜ |

---

### 2.3 運動記録（基本）

#### バックエンド
| タスク | 優先度 | 依存 | 状態 |
|--------|:------:|------|:----:|
| POST /api/v1/exercise_records | P1 | auth | ⬜ |
| GET /api/v1/users/me/exercise_records | P1 | auth | ⬜ |
| ExerciseRecordsController作成 | P1 | - | ⬜ |
| 継続日数（continue_days）自動更新 | P1 | exercise_records | ⬜ |

#### フロントエンド
| タスク | 優先度 | 依存 | 状態 |
|--------|:------:|------|:----:|
| U-04: 運動完了記録送信 | P1 | exercise_records API | ⬜ |
| U-07: 履歴一覧API接続 | P1 | exercise_records API | ⬜ |
| U-10: ウェルカム画面（継続日数表示） | P1 | users/me API | ⬜ |
| U-13: 祝福画面（記録完了時） | P2 | exercise_records API | ⬜ |

#### テスト
| タスク | 優先度 | 状態 |
|--------|:------:|:----:|
| ExerciseRecordsController単体テスト | P1 | ⬜ |
| 継続日数計算ロジックテスト | P1 | ⬜ |

---

### 2.4 体調記録

#### バックエンド
| タスク | 優先度 | 依存 | 状態 |
|--------|:------:|------|:----:|
| POST /api/v1/daily_conditions | P1 | auth | ⬜ |
| GET /api/v1/users/me/daily_conditions | P1 | auth | ⬜ |
| DailyConditionsController作成 | P1 | - | ⬜ |

#### フロントエンド
| タスク | 優先度 | 依存 | 状態 |
|--------|:------:|------|:----:|
| U-14: 体調入力API接続 | P1 | daily_conditions API | ⬜ |

#### テスト
| タスク | 優先度 | 状態 |
|--------|:------:|:----:|
| DailyConditionsController単体テスト | P1 | ⬜ |

---

### 2.5 測定値入力（職員）

#### バックエンド
| タスク | 優先度 | 依存 | 状態 |
|--------|:------:|------|:----:|
| POST /api/v1/patients/:id/measurements | P1 | staff auth | ⬜ |
| GET /api/v1/patients/:id/measurements | P1 | staff auth | ⬜ |
| MeasurementsController作成 | P1 | - | ⬜ |

#### フロントエンド
| タスク | 優先度 | 依存 | 状態 |
|--------|:------:|------|:----:|
| S-05: 測定値入力API接続 | P1 | measurements API | ⬜ |
| U-08: 測定値履歴API接続（利用者） | P2 | users/me/measurements API | ⬜ |

#### テスト
| タスク | 優先度 | 状態 |
|--------|:------:|:----:|
| MeasurementsController単体テスト | P1 | ⬜ |
| 権限制御テスト（職員のみ） | P1 | ⬜ |

---

### 2.6 ダッシュボード（職員）

#### バックエンド
| タスク | 優先度 | 依存 | 状態 |
|--------|:------:|------|:----:|
| GET /api/v1/patients | P1 | staff auth | ⬜ |
| GET /api/v1/patients/:id | P1 | staff auth | ⬜ |
| GET /api/v1/dashboard/summary | P2 | staff auth | ⬜ |
| PatientsController作成 | P1 | - | ⬜ |

#### フロントエンド
| タスク | 優先度 | 依存 | 状態 |
|--------|:------:|------|:----:|
| S-02: ダッシュボードAPI接続 | P1 | dashboard API | ⬜ |
| S-03: 患者一覧API接続 | P1 | patients API | ⬜ |
| S-04: 患者詳細API接続 | P1 | patients/:id API | ⬜ |

#### テスト
| タスク | 優先度 | 状態 |
|--------|:------:|:----:|
| PatientsController単体テスト | P1 | ⬜ |
| 担当患者フィルタリングテスト | P1 | ⬜ |

---

## 3. Phase 2: 拡張機能

### 3.1 履歴グラフ表示
| タスク | 優先度 | 状態 |
|--------|:------:|:----:|
| 体調履歴グラフAPI | P2 | ⬜ |
| 測定値推移グラフAPI | P2 | ⬜ |
| U-07/U-08: グラフコンポーネント実装 | P2 | ⬜ |
| S-04: 患者詳細グラフ実装 | P2 | ⬜ |

### 3.2 レポート出力（CSV形式）
| タスク | 優先度 | 状態 |
|--------|:------:|:----:|
| GET /api/v1/patients/:id/report | P2 | ⬜ |
| CSV生成ロジック実装 | P2 | ⬜ |
| CSVカラム定義・テンプレート作成 | P2 | ⬜ |
| S-07: レポート画面API接続 | P2 | ⬜ |

### 3.3 運動メニュー割当（職員）
| タスク | 優先度 | 状態 |
|--------|:------:|:----:|
| POST /api/v1/patients/:id/exercises | P2 | ⬜ |
| DELETE /api/v1/patients/:id/exercises/:id | P2 | ⬜ |
| S-06: 運動メニュー設定API接続 | P2 | ⬜ |

### 3.4 職員管理（マネージャー）
| タスク | 優先度 | 状態 |
|--------|:------:|:----:|
| GET /api/v1/staff | P2 | ⬜ |
| POST /api/v1/staff | P2 | ⬜ |
| PUT /api/v1/staff/:id | P2 | ⬜ |
| DELETE /api/v1/staff/:id | P2 | ⬜ |
| マネージャー権限チェック | P2 | ⬜ |
| S-08: 職員管理画面API接続 | P2 | ⬜ |

### 3.5 まとめて記録機能
| タスク | 優先度 | 状態 |
|--------|:------:|:----:|
| POST /api/v1/exercise_records/bulk | P2 | ⬜ |
| U-15: まとめて記録API接続 | P2 | ⬜ |

### 3.6 パスワードリセット
| タスク | 優先度 | 状態 |
|--------|:------:|:----:|
| POST /api/v1/auth/password_reset/request | P2 | ⬜ |
| POST /api/v1/auth/password_reset/confirm | P2 | ⬜ |
| メール送信機能 | P2 | ⬜ |
| U-09: パスワードリセットAPI接続 | P2 | ⬜ |
| S-09: 職員パスワードリセットAPI接続 | P2 | ⬜ |

---

## 4. Phase 3: 最適化・改善

### 4.1 パフォーマンス最適化
| タスク | 優先度 | 状態 |
|--------|:------:|:----:|
| N+1クエリ解消 | P3 | ⬜ |
| インデックス最適化 | P3 | ⬜ |
| フロントエンドCode Splitting | P3 | ⬜ |
| 画像最適化 | P3 | ⬜ |
| バンドルサイズ削減 | P3 | ⬜ |

### 4.2 プッシュ通知
| タスク | 優先度 | 状態 |
|--------|:------:|:----:|
| Web Push API実装 | P3 | ⬜ |
| 通知設定UI | P3 | ⬜ |
| 運動リマインダー | P3 | ⬜ |

### 4.3 テストカバレッジ80%達成
| タスク | 優先度 | 状態 |
|--------|:------:|:----:|
| モデル単体テスト100% | P1 | 🔄 部分完了（Staff/AuditLog: 100%、User: 88%） |
| コントローラーテスト100% | P1 | 🔄 部分完了（AuthController: 100%） |
| Reactコンポーネントテスト | P2 | ✅ 完了（97-98%） |
| E2Eテスト（主要フロー） | P2 | ⬜ |
| セキュリティテスト100% | P1 | ✅ 完了（認証関連） |

---

## 5. 実装順序（推奨）

```
Week 1-2: Phase 1.1 認証機能完全実装
    ├── 職員ログインAPI
    ├── セッション管理
    ├── フロントエンド接続
    └── 認証テスト

Week 3-4: Phase 1.2-1.3 運動機能
    ├── 運動メニューAPI
    ├── 運動記録API
    ├── 継続日数ロジック
    └── フロントエンド接続

Week 5: Phase 1.4-1.5 記録機能
    ├── 体調記録API
    ├── 測定値入力API
    └── フロントエンド接続

Week 6: Phase 1.6 職員機能
    ├── 患者一覧・詳細API
    ├── ダッシュボードAPI
    └── フロントエンド接続

Week 7-8: Phase 2 拡張機能
    ├── グラフ表示
    ├── レポート出力
    ├── 職員管理
    └── パスワードリセット

Week 9-10: Phase 3 最適化
    ├── パフォーマンス改善
    ├── テストカバレッジ向上
    └── プッシュ通知（必要に応じて）
```

---

## 6. 実装済みコンポーネント

### 6.1 フロントエンド認証（2026-01-23 完了）

#### 利用者向け（frontend_user）
| ファイル | 説明 |
|----------|------|
| `src/lib/api-client.ts` | APIクライアント（fetch wrapper、エラーハンドリング） |
| `src/lib/api-types.ts` | User, LoginResponse等の型定義 |
| `src/contexts/AuthContext.tsx` | 認証状態管理（30分タイムアウト） |
| `src/components/Login.tsx` | U-01 ログイン画面（Zod検証、エラー表示） |
| `src/components/ui/Button.tsx` | ボタンコンポーネント（ローディング対応） |
| `src/components/ui/Input.tsx` | 入力コンポーネント（エラー表示、ARIA対応） |

#### 職員向け（frontend_admin）
| ファイル | 説明 |
|----------|------|
| `src/lib/api.ts` | APIクライアント（staff認証対応） |
| `src/lib/api-types.ts` | Staff, StaffLoginResponse等の型定義 |
| `src/contexts/AuthContext.tsx` | 認証状態管理（15分タイムアウト） |
| `src/components/Login.tsx` | S-01 職員ログイン画面 |
| `src/components/ui/Button.tsx` | ボタンコンポーネント |
| `src/components/ui/Input.tsx` | 入力コンポーネント |

#### 主な機能
- **バリデーション**: Zodによるフォーム入力検証
- **エラー表示**: インライン + アラート形式
- **セッション管理**: 自動タイムアウト検出・リダイレクト
- **アクセシビリティ**: WCAG 2.1 AA準拠（44x44pxタップ領域、ARIA属性）
- **パスワード表示切替**: 目アイコンによるトグル

#### テストカバレッジ
```
frontend_user:  97.01% (27 tests passed)
frontend_admin: 98.81% (26 tests passed)
```

### 6.2 バックエンド認証テスト（2026-01-23 完了）

#### RSpec テストファイル
| ファイル | 説明 |
|----------|------|
| `spec/requests/api/v1/auth_spec.rb` | 認証API統合テスト（102テスト） |
| `spec/models/staff_spec.rb` | Staffモデル単体テスト |
| `spec/models/audit_log_spec.rb` | AuditLogモデル単体テスト |

#### テスト対象機能
| 機能 | テストケース数 | カバレッジ |
|------|:--------------:|:----------:|
| POST /api/v1/auth/login（利用者） | 12 | 100% |
| POST /api/v1/auth/staff/login（職員） | 18 | 100% |
| GET /api/v1/auth/me | 10 | 100% |
| DELETE /api/v1/auth/logout | 8 | 100% |
| セッションタイムアウト | 6 | 100% |
| アカウントロックアウト | 8 | 100% |
| 監査ログ記録 | 12 | 100% |
| Staffモデル | 28 | 100% |

#### 主なテストシナリオ
- **正常系**: 有効な認証情報でログイン成功
- **異常系**: 無効なID/パスワード、アカウントロック、削除済みユーザー
- **セキュリティ**: 5回失敗でロック、タイムアウト後自動ロック解除
- **セッション**: 利用者30分/職員15分タイムアウト、アクティビティ延長
- **監査**: 全認証イベント（成功/失敗）のログ記録

#### テストカバレッジ
```
Backend (RSpec):
  auth_controller.rb: 100%
  audit_log.rb:       100%
  staff.rb:           100%
  user.rb:            87.8%

Total: 102 examples, 0 failures
```

#### セットアップファイル
| ファイル | 説明 |
|----------|------|
| `spec/rails_helper.rb` | RSpec設定（SimpleCov、FactoryBot、Timecop、shoulda-matchers） |
| `spec/support/request_spec_helper.rb` | リクエストスペック用ヘルパーメソッド |
| `test/factories/staff.rb` | Staffファクトリ（:locked、:lock_expired、:deleted等のtrait） |
| `test/factories/users.rb` | Userファクトリ（:locked、:with_failed_attempts等のtrait） |
| `test/factories/audit_logs.rb` | AuditLogファクトリ（:login_success、:login_failure等のtrait） |

---

## 7. 技術的決定事項（確定）

### API設計
- RESTful API（JSON）
- セッションベース認証（Cookie）
- ページネーション: `page` + `per_page` パラメータ

### 認証
- bcryptでパスワードハッシュ
- セッションタイムアウト: 利用者30分、職員15分
- ログイン失敗5回でアカウントロック

### 暗号化
- PII（name, email, birth_date）はAES-256-GCMで暗号化
- Rails 7+ Active Record Encryption使用

### 監査ログ
- 全API呼び出しをaudit_logsに記録
- action, user_id, ip_address, status, timestampを保存

---

## 8. 確認事項

### 確定済み（2026-01-23）
| 項目 | 決定内容 |
|------|----------|
| 動画ファイル形式 | **MP4** |
| オフライン視聴 | **不要**（Phase 3から削除） |
| ダークモード | **不要** |
| レポート出力形式 | **CSV** |
| 未言及機能 | **全て実装** |

### 未決定
| 項目 | 状況 | 担当 |
|------|------|------|
| 動画ストリーミング方式 | プログレッシブダウンロード推奨 | 開発チーム |
| メール送信サービス | 未確定 | インフラ担当 |
| 本番環境サーバー | 未確定 | インフラ担当 |
| ドメイン | 未確定 | クライアント確認 |

---

## 9. リスク・懸念事項

| リスク | 影響度 | 対策 |
|--------|:------:|------|
| 動画配信の帯域 | 高 | HLS採用、複数ビットレート対応 |
| PII暗号化のパフォーマンス | 中 | 検索はblind indexで対応 |
| テストカバレッジ不足 | 高 | TDD厳守、CI/CDで強制 |
| セッション管理の複雑さ | 中 | Railsデフォルト機能活用 |

---

*この計画書は開発の進捗に応じて更新されます。*
