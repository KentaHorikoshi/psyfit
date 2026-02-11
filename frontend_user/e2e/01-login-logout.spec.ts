import { test, expect } from '@playwright/test'

// テスト用認証情報（シードデータに合わせたデフォルト値）
const TEST_EMAIL = process.env.E2E_USER_EMAIL || 'tanaka@example.com'
const TEST_PASSWORD = process.env.E2E_USER_PASSWORD || 'Patient1!'

/**
 * U-01: ログイン・ログアウトフロー
 * ログイン → ホーム表示 → ログアウト
 */
test.describe('ログイン・ログアウトフロー', () => {
  test.describe('ログイン', () => {
    test.use({ storageState: { cookies: [], origins: [] } }) // 未認証状態

    test('正常なログインができる', async ({ page }) => {
      await page.goto('/login')

      // ログインフォームの表示確認
      await expect(page.getByRole('heading', { name: /サイテック/ })).toBeVisible()
      await expect(page.getByLabel('メールアドレス')).toBeVisible()
      await expect(page.getByLabel('パスワード', { exact: true })).toBeVisible()

      // ログイン情報入力
      await page.getByLabel('メールアドレス').fill(TEST_EMAIL)
      await page.getByLabel('パスワード', { exact: true }).fill(TEST_PASSWORD)

      // ログインボタンクリック
      await page.getByRole('button', { name: 'ログイン' }).click()

      // ホームまたはウェルカム画面への遷移を確認
      await expect(page).toHaveURL(/\/(home|welcome)/, { timeout: 10000 })
    })

    test('無効なメールアドレスでエラーが表示される', async ({ page }) => {
      await page.goto('/login')

      // HTML5 email validationを回避するためにtype属性を一時変更
      const emailInput = page.getByLabel('メールアドレス')
      await emailInput.evaluate((el: HTMLInputElement) => {
        el.type = 'text'
      })
      await emailInput.fill('invalid-email')
      await page.getByLabel('パスワード', { exact: true }).fill('password123')
      await page.getByRole('button', { name: 'ログイン' }).click()

      // バリデーションエラーの表示確認
      await expect(page.getByRole('alert').first()).toBeVisible()
    })

    test('未入力でエラーが表示される', async ({ page }) => {
      await page.goto('/login')

      // 空のまま送信
      await page.getByRole('button', { name: 'ログイン' }).click()

      // バリデーションエラーの表示確認
      await expect(page.getByRole('alert').first()).toBeVisible()
    })

    test('パスワード表示/非表示の切り替えができる', async ({ page }) => {
      await page.goto('/login')

      const passwordInput = page.getByLabel('パスワード', { exact: true })
      await passwordInput.fill('testpassword')

      // 初期状態はパスワード非表示
      await expect(passwordInput).toHaveAttribute('type', 'password')

      // パスワード表示ボタンをクリック
      await page.getByRole('button', { name: 'パスワードを表示' }).click()
      await expect(passwordInput).toHaveAttribute('type', 'text')

      // パスワード非表示ボタンをクリック
      await page.getByRole('button', { name: 'パスワードを非表示' }).click()
      await expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  test.describe('ホーム画面', () => {
    test('ログイン後ホーム画面が表示される', async ({ page }) => {
      await page.goto('/home')

      // ホーム画面の主要要素が表示されることを確認
      await expect(page.locator('body')).toBeVisible()

      // ナビゲーション要素の確認（継続日数、運動メニューなど）
      await expect(page.getByText(/継続日数|運動する|ホーム/).first()).toBeVisible()
    })
  })

  test.describe('ログアウト', () => {
    test('ログアウトができる', async ({ page }) => {
      // ログアウトはマイページ（プロフィール画面）にある
      await page.goto('/profile')

      // ログアウトボタンをクリック
      const logoutButton = page.getByRole('button', { name: /ログアウト/ })
      await expect(logoutButton).toBeVisible({ timeout: 5000 })
      await logoutButton.click()

      // ログイン画面に戻ることを確認
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
    })
  })
})
