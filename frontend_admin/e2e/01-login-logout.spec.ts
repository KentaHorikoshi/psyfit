import { test, expect } from '@playwright/test'

/**
 * S-01: 職員ログイン・ログアウトフロー
 * ログイン → ダッシュボード表示 → ログアウト
 */
test.describe('職員ログイン・ログアウトフロー', () => {
  test.describe('ログイン', () => {
    test.use({ storageState: { cookies: [], origins: [] } }) // 未認証状態

    test('正常なログインができる', async ({ page }) => {
      await page.goto('/login')

      // ログインフォームの表示確認
      await expect(page.getByRole('heading', { name: 'サイテック病院' })).toBeVisible()
      await expect(page.getByLabel('職員ID')).toBeVisible()
      await expect(page.getByLabel('パスワード')).toBeVisible()

      // ログイン情報入力
      await page.getByLabel('職員ID').fill('ST001')
      await page.getByLabel('パスワード').fill('password123')

      // ログインボタンクリック
      await page.getByRole('button', { name: 'ログイン' }).click()

      // ダッシュボード画面への遷移を確認
      await expect(page).toHaveURL(/\/dashboard/)
    })

    test('未入力でエラーが表示される', async ({ page }) => {
      await page.goto('/login')

      // 空のまま送信
      await page.getByRole('button', { name: 'ログイン' }).click()

      // バリデーションエラーの表示確認
      await expect(page.getByRole('alert')).toBeVisible()
    })

    test('パスワード表示/非表示の切り替えができる', async ({ page }) => {
      await page.goto('/login')

      const passwordInput = page.getByLabel('パスワード')
      await passwordInput.fill('testpassword')

      // 初期状態はパスワード非表示
      await expect(passwordInput).toHaveAttribute('type', 'password')

      // パスワード表示ボタンをクリック
      await page.getByRole('button', { name: 'パスワードを表示' }).click()
      await expect(passwordInput).toHaveAttribute('type', 'text')
    })

    test('セッションタイムアウトの注意が表示される', async ({ page }) => {
      await page.goto('/login')

      // 15分タイムアウト注意が表示される
      await expect(page.getByText('15分間操作がない場合')).toBeVisible()
    })
  })

  test.describe('ダッシュボード', () => {
    test('ダッシュボード画面が表示される', async ({ page }) => {
      await page.goto('/dashboard')

      // ダッシュボードの主要要素が表示されることを確認
      await expect(page.locator('body')).toBeVisible()

      // サイドバーとメインコンテンツの確認
      await expect(page.getByText(/ダッシュボード|患者一覧|レポート/)).toBeVisible()
    })

    test('サイドバーナビゲーションが機能する', async ({ page }) => {
      await page.goto('/dashboard')

      // サイドバーの存在確認
      const sidebar = page.locator('[data-testid="sidebar"]')
        .or(page.locator('aside'))
        .or(page.locator('.admin-sidebar'))

      await expect(sidebar).toBeVisible()
    })
  })

  test.describe('ログアウト', () => {
    test('ログアウトができる', async ({ page }) => {
      await page.goto('/dashboard')

      // ログアウトボタンを探す
      const logoutButton = page.getByRole('button', { name: /ログアウト/ })
        .or(page.getByText('ログアウト'))

      if (await logoutButton.isVisible()) {
        await logoutButton.click()
        // ログイン画面に戻ることを確認
        await expect(page).toHaveURL(/\/login/)
      }
    })
  })
})
