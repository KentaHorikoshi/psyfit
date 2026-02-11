import { test as setup, expect } from '@playwright/test'

const authFile = 'e2e/.auth/user.json'

/**
 * 認証セットアップ - ログイン状態を保存
 * テスト用の認証情報でログインし、セッション状態を保存する
 */
setup('authenticate', async ({ page }) => {
  // テスト用の認証情報（シードデータに合わせたデフォルト値）
  const testEmail = process.env.E2E_USER_EMAIL || 'tanaka@example.com'
  const testPassword = process.env.E2E_USER_PASSWORD || 'Patient1!'

  // ログインページにアクセス
  await page.goto('/login')

  // ログインフォームが表示されるまで待機
  await expect(page.getByLabel('メールアドレス')).toBeVisible()

  // 認証情報を入力
  await page.getByLabel('メールアドレス').fill(testEmail)
  await page.getByLabel('パスワード').fill(testPassword)

  // ログインボタンをクリック
  await page.getByRole('button', { name: 'ログイン' }).click()

  // ホーム画面への遷移を確認（ログイン成功の証拠）
  await expect(page).toHaveURL(/\/(home|welcome)/)

  // 認証状態を保存
  await page.context().storageState({ path: authFile })
})
