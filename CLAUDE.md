# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PsyFit - リハビリ運動支援アプリ（利用者向け・職員向け 統合版）

サイテック病院向けに、患者様が自宅でリハビリ運動を継続的に実施し、その結果を医療スタッフが効率的に確認・管理できるシステム。

**クライアント**: サイテック病院
**バージョン**: 4.1 (基本設計書v4.1準拠)

## Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 6.3.5
- **CSS Framework**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **Charts**: Recharts 2.15.2
- **Routing**: React Router

### Backend
- **Framework**: Ruby on Rails 8 (API mode)
- **Database**: PostgreSQL 16
- **Cache/Session**: Redis 7
- **Authentication**: Session-based auth
- **Container**: Docker + Docker Compose

## Critical Rules

### 1. Code Organization
- Many small files over few large files
- High cohesion, low coupling
- 200-400 lines typical, 800 max per file
- Organize by feature/domain, not by type

### 2. Design System Compliance
- Follow design system in `.claude/docs/02-screen-design.md`
- Use defined color palette (primary: #1E40AF, green: #10B981, amber: #F59E0B)
- Maintain consistent UI patterns between src_user and src_admin
- Ensure accessibility (WCAG 2.1 AA, minimum 16px font, 44x44px tap targets)

### 3. Security Requirements
- No hardcoded secrets
- Environment variables for sensitive data
- Parameterized queries only
- Session-based authentication with timeout (利用者: 30分, 職員: 15分)
- Encrypt PII data (name, name_kana, email, birth_date) with AES-256-GCM
- Log all access in audit_logs table

### 4. UI Implementation Guidelines
- **利用者向け (User)**: Mobile-first, simple navigation (max 3 main menu items)
- **職員向け (Staff)**: Sidebar-centric SPA, PC/tablet optimized
- Use status badges with specific colors:
  - 急性期: bg-red-100 text-red-700
  - 回復期: bg-yellow-100 text-yellow-700
  - 維持期: bg-green-100 text-green-700

### 5. Testing
- TDD: Write tests first
- 80% minimum coverage
- 100% coverage for authentication, security, and financial calculations

## Development Server

### 起動方法

```bash
# 1. バックエンド (Rails API) - ポート4001
bin/rails server -b 0.0.0.0 -p 4001

# 2. フロントエンド (利用者向け) - ポート3000
cd frontend_user && npm run dev -- --host 0.0.0.0 --port 3000

# 3. フロントエンド (職員向け) - ポート3003
cd frontend_admin && npm run dev -- --host 0.0.0.0 --port 3003
```

### アクセスURL

| アプリ | URL |
|--------|-----|
| 利用者向けフロントエンド | http://localhost:3000 |
| 職員向けフロントエンド | http://localhost:3003 |
| バックエンドAPI | http://localhost:4001 |
| APIヘルスチェック | http://localhost:4001/api/v1/health |

### Docker環境での起動

```bash
# 初回セットアップ（.env作成、ビルド、DB作成）
bin/docker-setup

# 全サービス起動
bin/docker-start

# バックグラウンド起動
bin/docker-start -d

# 特定サービスのみ起動
bin/docker-start api       # APIのみ
bin/docker-start db        # DB+Redisのみ
bin/docker-start frontend  # フロントエンドのみ

# 停止
bin/docker-start stop

# Docker環境テスト（41項目）
bin/docker-test
```

### 開発用アカウント

```bash
# シードデータ投入
bin/rails db:seed
```

| 種別 | ID/メール | パスワード |
|------|-----------|-----------|
| マネージャー | MGR001 | Manager1! |
| 職員 | STF001 | Staff123! |
| 職員 | STF002 | Staff123! |
| 利用者 | tanaka@example.com | Patient1! |
| 利用者 | takahashi@example.com | Patient1! |

## File Structure

```
psyfit/
├── frontend_user/         # 利用者向けアプリ (U-01〜U-15画面)
│   └── src/
├── frontend_admin/        # 職員向けアプリ (S-01〜S-09画面)
│   └── src/
├── app/                   # Rails backend
├── .claude/
│   ├── docs/              # Design specifications
│   ├── agents/            # Specialized agents
│   └── skills/            # Reusable skills
├── Dockerfile             # 本番用 (マルチステージビルド)
├── Dockerfile.dev         # 開発用
├── docker-compose.yml     # 開発環境 (api, db, redis, frontends)
├── docker-compose.prod.yml # 本番環境 (api, db, redis)
├── .env.example           # 環境変数テンプレート
├── .env.docker            # Docker開発用デフォルト値
├── bin/docker-setup       # 初回セットアップ
├── bin/docker-start       # 起動スクリプト
├── bin/docker-test        # Docker環境テスト
└── CLAUDE.md              # This file
```

## Screen Design Reference

### 利用者向け画面 (U-01〜U-15)
- U-01: ログイン
- U-02: トップ (ホーム)
- U-03: 運動メニュー選択
- U-04: 運動実施 (動画)
- U-07: 履歴一覧
- U-08: 測定値履歴
- U-10: ウェルカム (継続日数表示)
- U-11: 運動カード
- U-13: 祝福 (達成感演出)
- U-14: 体調入力 (痛み・調子スライダー)
- U-15: まとめて記録

### 職員向け画面 (S-01〜S-09)
- S-01: ログイン
- S-02: ダッシュボード
- S-03: 患者一覧
- S-04: 患者詳細
- S-05: 測定値入力
- S-06: 運動メニュー設定
- S-07: レポート出力
- S-08: 職員管理 (マネージャーのみ)
- S-09: パスワードリセット
- S-10: 運動メニュー管理 (運動マスタ一覧・新規登録)

## Available Commands

Commands are located in `.claude/skills/`:

- `/tdd` - Test-driven development workflow
- `/plan` - Create implementation plan before coding
- `/code-review` - Review code quality and security
- `/build-fix` - Fix build errors

## Development Workflow

1. Use `/plan` to create implementation plan
2. Get user approval before implementation
3. Use `/tdd` to implement with tests first
4. Run tests and ensure 80%+ coverage
5. Use `/code-review` for final review
6. Update relevant docs in `.claude/docs/` if implementation changes schema, API, screens, or test scope
7. Generate a git commit message following conventional commits format and output it to the user
8. Commit after user approval

## Git Workflow

- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- Never commit to main directly
- All tests must pass before merge
- No console.log in production code

## Documentation

Detailed specifications are in `.claude/docs/`:

1. `01-system-overview.md` - System architecture and scope
2. `02-screen-design.md` - UI/UX design system and screen specifications
3. `03-database-schema.md` - Database schema and relationships
4. `04-api-specification.md` - API endpoints and contracts
5. `05-security-requirements.md` - Security policies and compliance
6. `06-non-functional-requirements.md` - Performance, accessibility, etc.
7. `07-browser-test-checklist.md` - Browser testing checklist for manual QA
8. `08-deployment-checklist.md` - Pre-deployment checklist and configuration
9. `99-confirmation-items.md` - Outstanding questions and TODOs

## Key Principles

1. **Agent-First**: Use specialized agents for complex tasks
2. **Plan Before Execute**: Always plan before writing code
3. **Test-Driven**: Write tests before implementation
4. **Security-First**: Never compromise on security or patient data protection
5. **Accessibility**: Follow WCAG 2.1 AA standards
6. **Design Consistency**: Maintain visual and UX consistency across all screens
7. **Docs in Sync**: Keep `.claude/docs/` updated when implementation changes spec-level behavior
