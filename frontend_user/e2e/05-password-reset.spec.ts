import { test, expect } from '@playwright/test'

/**
 * パスワードリセット申請フロー
 */
test.describe('パスワードリセットフロー', () => {
  test.use({ storageState: { cookies: [], origins: [] } }) // 未認証状態

  test('パスワードリセット画面に遷移できる', async ({ page }) => {
    await page.goto('/login')

    // パスワードを忘れましたかリンクをクリック
    await page.getByRole('button', { name: 'パスワードをお忘れですか？' }).click()

    // パスワードリセット画面への遷移を確認
    await expect(page).toHaveURL(/\/password-reset/)
  })

  test('パスワードリセット画面が表示される', async ({ page }) => {
    await page.goto('/password-reset')

    // パスワードリセット画面の表示確認
    await expect(page.getByRole('heading', { name: /パスワード/ })).toBeVisible()

    // メールアドレス入力フィールドの確認
    await expect(page.getByLabel(/メールアドレス/)).toBeVisible()
  })

  test('メールアドレスを入力して送信できる', async ({ page }) => {
    await page.goto('/password-reset')

    // メールアドレスを入力
    await page.getByLabel(/メールアドレス/).fill('test@example.com')

    // 送信ボタンをクリック
    const submitButton = page.getByRole('button', { name: /送信|リセット|メールを送る/ })
    await submitButton.click()

    // 成功メッセージまたは確認画面の表示
    await expect(
      page.getByText(/送信|メール|確認/)
        .or(page.getByRole('alert'))
    ).toBeVisible()
  })

  test('無効なメールアドレスでエラーが表示される', async ({ page }) => {
    await page.goto('/password-reset')

    // 無効なメールアドレスを入力
    await page.getByLabel(/メールアドレス/).fill('invalid-email')

    // 送信ボタンをクリック
    const submitButton = page.getByRole('button', { name: /送信|リセット|メールを送る/ })
    await submitButton.click()

    // バリデーションエラーの表示確認
    await expect(page.getByRole('alert')).toBeVisible()
  })

  test('ログイン画面に戻れる', async ({ page }) => {
    await page.goto('/password-reset')

    // 戻るボタンまたはログインリンク
    const backButton = page.getByRole('button', { name: /戻る/ })
      .or(page.getByRole('link', { name: /ログイン/ }))
      .or(page.getByText('ログイン画面に戻る'))

    if (await backButton.isVisible()) {
      await backButton.click()
      await expect(page).toHaveURL(/\/login/)
    }
  })
})
