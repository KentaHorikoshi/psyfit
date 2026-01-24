# Screen Design (UI設計)

利用者（患者様）と職員（医療スタッフ）それぞれに最適化した画面構成を設計する。

## デザインシステム

### カラーパレット

| 用途 | 変数名 | 値 |
|------|--------|-----|
| 背景色 | --background | #ffffff |
| 前景色 | --foreground | oklch(0.145 0 0) |
| プライマリ | --primary | #030213 |
| ミュート | --muted | #ececf0 |
| 破壊的アクション | --destructive | #d4183d |
| ボーダー | --border | rgba(0, 0, 0, 0.1) |
| 角丸 | --radius | 0.625rem |

### ブランドカラー（実装値）

| 用途 | カラーコード | 適用箇所 |
|------|-------------|---------|
| サイドバー背景 | #1E40AF | Sidebar全体（職員向け） |
| プライマリボタン | #1E40AF → #1E3A8A（ホバー） | 保存・確定ボタン |
| 継続日数表示 | #10B981（green-500） | ウェルカム画面 |
| 祝福演出 | #F59E0B（amber-500） | セレブレーション画面 |
| ステータス：急性期 | bg-red-100 / text-red-700 | ステータスバッジ |
| ステータス：回復期 | bg-yellow-100 / text-yellow-700 | ステータスバッジ |
| ステータス：維持期 | bg-green-100 / text-green-700 | ステータスバッジ |

### レイアウト原則

**利用者向け:**
- Mobile-first デザイン
- シンプルさを重視
- メインメニュー数は3個程度に絞る
- 大きなタップターゲット（最小44×44px）

**職員向け:**
- Sidebar-centric SPA
- PC・タブレット最適化
- 情報密度高め、効率重視

## 利用者向け画面一覧（U-01〜U-15）

### U-01: ログイン
- メールアドレス・パスワード入力
- ログインボタン
- パスワードリセットリンク
- 実装: `frontend_user/src/components/Login.tsx` ✅
- テスト: 18 tests passed

### U-02: トップ（ホーム）
- 3つのメインメニュー:
  - 運動する
  - 記録する
  - 履歴を見る
- 継続日数カード表示
- 実装: `frontend_user/src/components/Home.tsx` ✅
- テスト: 15 tests passed

### U-03: 運動メニュー選択
- 担当職員が指示した運動メニュー一覧
- 身体状態・疾患に応じて出し分け
- 実装: `frontend_user/src/components/ExerciseMenu.tsx` ✅
- テスト: 12 tests passed

### U-04: 運動実施（動画あり）
- 運動動画再生
- 回数・セット数カウント
- 完了ボタン
- 実装: `frontend_user/src/components/ExercisePlayer.tsx` ✅
- テスト: 14 tests passed

### U-07: 履歴一覧
- 日付ごとの運動実施履歴
- 継続状況の可視化（カレンダー形式等）
- 実装: `frontend_user/src/components/ExerciseHistory.tsx` ✅
- テスト: 10 tests passed

### U-08: 測定値履歴
- 体重・筋力等の推移グラフ
- 主観データとの統合表示
- Recharts使用
- 実装: `frontend_user/src/components/Measurements.tsx` ✅
- テスト: 11 tests passed

### U-09: パスワードリセット
- メールアドレス入力
- リセット用リンク送信
- 新パスワード設定
- 実装: 未着手

### U-10: ウェルカム
- 継続日数の大きな表示
- 3秒後に自動遷移（タップで即時遷移）
- モチベーション向上演出
- 実装: `frontend_user/src/components/Welcome.tsx` ✅
- テスト: 8 tests passed

### U-11: 運動カード
- 本日の運動メニューをカード形式で表示
- 動画再生ボタン
- 実装: `frontend_user/src/components/ExerciseCard.tsx` ✅
- テスト: 9 tests passed

### U-13: 祝福
- 運動完了時の祝福演出
- クラッカーアニメーション
- 達成感の演出
- 実装: `frontend_user/src/components/Celebration.tsx` ✅
- テスト: 7 tests passed

### U-14: 体調入力
- 痛みレベル（0-10スライダー）
- 身体の調子（0-10スライダー）
- 主観的評価の記録
- 実装: `frontend_user/src/components/ConditionInput.tsx` ✅
- テスト: 13 tests passed

### U-15: まとめて記録
- 複数の運動を一括で完了記録
- チェックボックス形式
- 効率的な記録入力
- 実装: `frontend_user/src/components/BatchRecord.tsx` ✅
- テスト: 11 tests passed

## 職員向け画面一覧（S-01〜S-09）

### 共通レイアウト: Sidebar
- サイドバー背景色: #1E40AF
- ナビゲーション: ダッシュボード、患者一覧
- 役割ベース表示: マネージャーのみ職員管理メニュー表示
- 職員プロフィール表示
- ログアウトボタン
- 実装: `frontend_admin/src/components/Sidebar.tsx` ✅
- テスト: 15 tests passed (100% coverage)

### S-01: ログイン
- 職員ID・パスワード入力
- セッションタイムアウト: 15分
- 実装: `frontend_admin/src/components/Login.tsx` ✅
- テスト: 19 tests passed

### S-02: ダッシュボード
- 担当患者一覧
- 本日の来院予定
- KPI表示（担当患者数、運動実施数など）
- 実装: `frontend_admin/src/components/Dashboard.tsx` ✅
- テスト: 22 tests passed (100% coverage)

### S-03: 患者一覧
- 患者リスト
- 検索・フィルタ機能（患者名、カナ検索 + ステータス絞り込み）
- ステータスバッジ表示（急性期:赤/回復期:黄/維持期:緑）
- ページネーション機能
- 実装: `frontend_admin/src/components/PatientList.tsx` ✅
- テスト: 29 tests passed (97.9% coverage)

### S-04: 患者詳細
- 個人情報
- 疾患・身体状態
- 経過グラフ
- 実装: `frontend_admin/src/components/PatientDetail.tsx` ✅
- テスト: 16 tests passed

### S-05: 測定値入力
- 膝伸展筋力
- TUG、NRS、MMT等入力
- 実装: `frontend_admin/src/components/MeasurementInput.tsx` ✅
- テスト: 22 tests passed

### S-06: 運動メニュー設定
- 患者ごとの運動メニュー割当
- 疾患・状態に応じた推奨表示
- 実装: `frontend_admin/src/components/ExerciseMenu.tsx` ✅
- テスト: 18 tests passed

### S-07: レポート出力
- 患者別レポート生成
- PDF/CSV出力機能
- 期間指定可能
- 実装: `frontend_admin/src/components/ReportGeneration.tsx` ✅
- テスト: 14 tests passed

### S-08: 職員管理
- 職員一覧表示（GET /api/v1/staff）
- 職員新規作成ダイアログ（POST /api/v1/staff）
- マネージャーのみアクセス可能（roleチェック）
- パスワード複雑性表示（8文字以上、2種類以上の文字）
- 実装: `frontend_admin/src/components/StaffManagement.tsx` ✅
- テスト: 26 tests passed

### S-09: パスワードリセット
- パスワード変更機能
- 実装: 未着手

## アクセシビリティ要件

| 項目 | 基準 | 実装 |
|------|------|------|
| 最小フォントサイズ | 本文：16px以上 | --font-size: 16px |
| タップ領域 | 最小44×44px（iOS HIG準拠） | py-4 px-6 |
| コントラスト比 | WCAG 2.1 AA準拠（4.5:1以上） | カラーパレット準拠 |
| キーボードナビゲーション | 全機能アクセス可能 | focus-visible対応 |
| スクリーンリーダー | aria-label, role属性 | 適切なセマンティクス |

## レスポンシブブレークポイント

Tailwind CSS v4デフォルト値を使用:
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px
