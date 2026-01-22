---
name: frontend-agent
description: React/TypeScriptフロントエンド開発に特化。利用者向け(src_user)・職員向け(src_admin)アプリのUI実装、アクセシビリティ、レスポンシブ対応を担当。
tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

# Frontend Agent

利用者向け・職員向けフロントエンド開発に特化したエージェント。

## 対象領域

- `src_user/` - 利用者向けアプリ (U-01〜U-15画面)
- `src_admin/` - 職員向けアプリ (S-01〜S-09画面)

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | React 18 + TypeScript |
| ビルドツール | Vite 6.3.5 |
| CSS | Tailwind CSS v4 |
| UI | Radix UI + shadcn/ui |
| グラフ | Recharts 2.15.2 |
| ルーティング | React Router |

## 設計ドキュメント参照

- [画面設計書](../../docs/02-screen-design.md)
- [非機能要件](../../docs/06-non-functional-requirements.md)

## コーディング規約

### ファイル構成

```
src_user/
├── components/
│   ├── U01_Login.tsx
│   ├── U02_Home.tsx
│   └── ...
├── hooks/
├── utils/
└── App.tsx

src_admin/
├── components/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   └── ...
├── hooks/
├── utils/
└── App.tsx
```

### コンポーネント命名

- 利用者向け: `U{番号}_{画面名}.tsx` (例: `U01_Login.tsx`)
- 職員向け: `{画面名}.tsx` (例: `Dashboard.tsx`)

### デザインシステム

```tsx
// カラーパレット
const colors = {
  primary: '#1E40AF',      // サイドバー背景、プライマリボタン
  primaryHover: '#1E3A8A', // ホバー時
  success: '#10B981',      // 継続日数表示
  celebration: '#F59E0B',  // 祝福演出
};

// ステータスバッジ
const statusBadge = {
  急性期: 'bg-red-100 text-red-700',
  回復期: 'bg-yellow-100 text-yellow-700',
  維持期: 'bg-green-100 text-green-700',
};
```

## アクセシビリティ要件

WCAG 2.1 AA準拠必須。

| 項目 | 基準 |
|------|------|
| 最小フォントサイズ | 16px以上 |
| タップ領域 | 最小44×44px |
| コントラスト比 | 4.5:1以上 |
| キーボード操作 | 全機能アクセス可能 |

### 実装例

```tsx
// 良い例
<button
  className="py-4 px-6 text-base min-h-[44px] min-w-[44px]"
  aria-label="運動を開始する"
  onClick={handleStart}
>
  開始
</button>

// 悪い例 - 使用禁止
<div onClick={handleStart}>開始</div>
```

## レスポンシブ対応

### 利用者向け (Mobile-first)

```tsx
// src_user のコンポーネント
<div className="px-4 md:px-6 lg:px-8">
  <h1 className="text-xl md:text-2xl">タイトル</h1>
</div>
```

### 職員向け (PC/Tablet優先)

```tsx
// src_admin のコンポーネント - Sidebar-centric SPA
<div className="flex">
  <aside className="w-64 bg-primary hidden md:block">
    {/* サイドバー */}
  </aside>
  <main className="flex-1 p-6">
    {/* メインコンテンツ */}
  </main>
</div>
```

## パフォーマンス最適化

### Code Splitting

```tsx
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./components/Dashboard'));
const PatientDetail = lazy(() => import('./components/PatientDetail'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/patient/:id" element={<PatientDetail />} />
      </Routes>
    </Suspense>
  );
}
```

### 画像最適化

```tsx
<img
  src="/images/exercise.webp"
  loading="lazy"
  width="400"
  height="300"
  alt="運動画像"
/>
```

## テスト

- Vitest + React Testing Library
- カバレッジ目標: 80%以上
- E2Eテスト: Playwright

```tsx
// コンポーネントテスト例
import { render, screen } from '@testing-library/react';
import { U01_Login } from './U01_Login';

describe('U01_Login', () => {
  it('renders login form', () => {
    render(<U01_Login />);
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
  });
});
```

## 禁止事項

1. `console.log` を本番コードに残さない
2. インラインスタイルを使用しない（Tailwind CSSを使用）
3. `any` 型を使用しない
4. ハードコードされた文字列（i18n対応準備）
5. アクセシビリティ属性の省略
