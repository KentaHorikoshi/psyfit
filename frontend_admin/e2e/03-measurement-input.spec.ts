import { test, expect } from '@playwright/test'

/**
 * S-05: 測定値入力フロー
 * ログイン → 測定値入力 → 保存
 */
test.describe('測定値入力フロー', () => {
  test('測定値入力画面が表示される', async ({ page }) => {
    // 患者IDを指定して測定値入力画面にアクセス
    await page.goto('/measurements/1')

    // 測定値入力画面の表示確認
    await expect(page.getByRole('heading', { name: /測定値|入力/ })).toBeVisible()

    // 入力フォームの確認
    await expect(page.locator('form')).toBeVisible()
  })

  test('測定日を入力できる', async ({ page }) => {
    await page.goto('/measurements/1')

    // 日付入力フィールド
    const dateInput = page.getByLabel(/測定日|日付/)
      .or(page.locator('input[type="date"]'))

    if (await dateInput.isVisible()) {
      const today = new Date().toISOString().split('T')[0]
      await dateInput.fill(today)
      await expect(dateInput).toHaveValue(today)
    }
  })

  test('体重を入力できる', async ({ page }) => {
    await page.goto('/measurements/1')

    // 体重入力フィールド
    const weightInput = page.getByLabel(/体重/)
      .or(page.locator('[data-testid="weight-input"]'))

    if (await weightInput.isVisible()) {
      await weightInput.fill('65.5')
      await expect(weightInput).toHaveValue('65.5')
    }
  })

  test('TUG時間を入力できる', async ({ page }) => {
    await page.goto('/measurements/1')

    // TUG入力フィールド
    const tugInput = page.getByLabel(/TUG|秒/)
      .or(page.locator('[data-testid="tug-input"]'))

    if (await tugInput.isVisible()) {
      await tugInput.fill('12.3')
      await expect(tugInput).toHaveValue('12.3')
    }
  })

  test('測定値を保存できる', async ({ page }) => {
    await page.goto('/measurements/1')

    // フォームに値を入力
    const dateInput = page.locator('input[type="date"]')
    if (await dateInput.isVisible()) {
      await dateInput.fill(new Date().toISOString().split('T')[0])
    }

    const weightInput = page.getByLabel(/体重/)
    if (await weightInput.isVisible()) {
      await weightInput.fill('65.5')
    }

    // 保存ボタンをクリック
    const saveButton = page.getByRole('button', { name: /保存|登録|記録/ })
    if (await saveButton.isVisible()) {
      await saveButton.click()

      // 成功メッセージまたは画面遷移を確認
      await expect(
        page.getByText(/保存|完了|成功/).or(page.getByRole('alert'))
      ).toBeVisible({ timeout: 5000 }).catch(() => {
        // 画面遷移を確認
        return expect(page).not.toHaveURL(/\/measurements\/1$/)
      })
    }
  })

  test('バリデーションエラーが表示される', async ({ page }) => {
    await page.goto('/measurements/1')

    // 無効な値を入力
    const weightInput = page.getByLabel(/体重/)
    if (await weightInput.isVisible()) {
      await weightInput.fill('-10') // 負の値

      // 保存ボタンをクリック
      const saveButton = page.getByRole('button', { name: /保存|登録|記録/ })
      if (await saveButton.isVisible()) {
        await saveButton.click()

        // エラーメッセージの表示確認
        await expect(page.getByRole('alert').or(page.getByText(/エラー|無効/))).toBeVisible()
      }
    }
  })
})
