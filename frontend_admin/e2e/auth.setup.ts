import { test as setup, expect } from '@playwright/test'

const authFile = 'e2e/.auth/staff.json'

/**
 * 認証セットアップ - 職員ログイン状態を保存
 * テスト用の認証情報でログインし、セッション状態を保存する
 */
setup('authenticate', async ({ page }) => {
  // テスト用の認証情報（シードデータに合わせたデフォルト値）
  const testStaffId = process.env.E2E_STAFF_ID || 'STF001'
  const testPassword = process.env.E2E_STAFF_PASSWORD || 'Staff123!'

  // ログインページにアクセス
  await page.goto('/login')

  // ログインフォームが表示されるまで待機
  await expect(page.getByLabel('職員ID')).toBeVisible()

  // 認証情報を入力
  await page.getByLabel('職員ID').fill(testStaffId)
  await page.getByLabel('パスワード').fill(testPassword)

  // ログインボタンをクリック
  await page.getByRole('button', { name: 'ログイン' }).click()

  // ダッシュボード画面への遷移を確認（ログイン成功の証拠）
  await expect(page).toHaveURL(/\/dashboard/)

  // 認証状態を保存
  await page.context().storageState({ path: authFile })
})
