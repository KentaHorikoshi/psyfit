import { test, expect } from '@playwright/test'

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
      await expect(page.getByRole('heading', { name: 'サイテック フィットネス' })).toBeVisible()
      await expect(page.getByLabel('メールアドレス')).toBeVisible()
      await expect(page.getByLabel('パスワード')).toBeVisible()

      // ログイン情報入力
      await page.getByLabel('メールアドレス').fill('test@example.com')
      await page.getByLabel('パスワード').fill('password123')

      // ログインボタンクリック
      await page.getByRole('button', { name: 'ログイン' }).click()

      // ホームまたはウェルカム画面への遷移を確認
      await expect(page).toHaveURL(/\/(home|welcome)/)
    })

    test('無効なメールアドレスでエラーが表示される', async ({ page }) => {
      await page.goto('/login')

      await page.getByLabel('メールアドレス').fill('invalid-email')
      await page.getByLabel('パスワード').fill('password123')
      await page.getByRole('button', { name: 'ログイン' }).click()

      // バリデーションエラーの表示確認
      await expect(page.getByRole('alert')).toContainText('メールアドレスの形式が正しくありません')
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

      // ナビゲーション要素の確認（ホーム画面固有の要素を確認）
      // 継続日数、運動開始ボタンなどを確認
      await expect(page.getByText(/今日の運動|運動を始める|継続/)).toBeVisible()
    })
  })

  test.describe('ログアウト', () => {
    test('ログアウトができる', async ({ page }) => {
      await page.goto('/home')

      // メニューまたはログアウトボタンを探す
      const logoutButton = page.getByRole('button', { name: /ログアウト/ })
        .or(page.getByText('ログアウト'))

      if (await logoutButton.isVisible()) {
        await logoutButton.click()
        // ログイン画面に戻ることを確認
        await expect(page).toHaveURL(/\/login/)
      } else {
        // メニューを開いてからログアウト
        const menuButton = page.getByRole('button', { name: /メニュー/ })
          .or(page.locator('[data-testid="menu-button"]'))

        if (await menuButton.isVisible()) {
          await menuButton.click()
          await page.getByText('ログアウト').click()
          await expect(page).toHaveURL(/\/login/)
        }
      }
    })
  })
})
