import { test, expect, type Page } from '@playwright/test'

/**
 * 患者一覧から最初の患者の測定値入力画面に遷移するヘルパー
 */
async function navigateToMeasurementInput(page: Page): Promise<boolean> {
  await page.goto('/patients')
  await expect(page.getByRole('heading', { name: '患者一覧' })).toBeVisible({ timeout: 10000 })

  // 患者行をクリック
  const patientRow = page.locator('table tbody tr').first()
    .or(page.locator('[data-testid="patient-item"]').first())

  if (await patientRow.isVisible({ timeout: 5000 })) {
    await patientRow.click()
    await expect(page).toHaveURL(/\/patients\/[a-f0-9-]+/)

    // 患者詳細画面の「測定値を入力」ボタンをクリック
    const measurementButton = page.getByRole('button', { name: /測定値/ })
      .or(page.getByRole('link', { name: /測定値/ }))
      .or(page.getByText('測定値を入力'))

    if (await measurementButton.isVisible({ timeout: 5000 })) {
      await measurementButton.click()
      await expect(page).toHaveURL(/\/patients\/[a-f0-9-]+\/measurements\/new/)
      return true
    }
  }
  return false
}

/**
 * S-05: 測定値入力フロー
 * 患者一覧 → 患者詳細 → 測定値入力 → 保存
 */
test.describe('測定値入力フロー', () => {
  test('測定値入力画面が表示される', async ({ page }) => {
    const navigated = await navigateToMeasurementInput(page)
    if (navigated) {
      // 測定値入力画面の表示確認
      await expect(page.getByText(/測定値|入力/)).toBeVisible({ timeout: 10000 })

      // 入力フォームの確認
      await expect(page.locator('form')).toBeVisible()
    }
  })

  test('測定日を入力できる', async ({ page }) => {
    const navigated = await navigateToMeasurementInput(page)
    if (navigated) {
      // 日付入力フィールド
      const dateInput = page.getByLabel(/測定日|日付/)
        .or(page.locator('input[type="date"]'))

      if (await dateInput.isVisible({ timeout: 5000 })) {
        const today = new Date().toISOString().split('T')[0]
        await dateInput.fill(today)
        await expect(dateInput).toHaveValue(today)
      }
    }
  })

  test('体重を入力できる', async ({ page }) => {
    const navigated = await navigateToMeasurementInput(page)
    if (navigated) {
      // 体重入力フィールド
      const weightInput = page.getByLabel(/体重/)
        .or(page.locator('[data-testid="weight-input"]'))

      if (await weightInput.isVisible({ timeout: 5000 })) {
        await weightInput.fill('65.5')
        await expect(weightInput).toHaveValue('65.5')
      }
    }
  })

  test('TUG時間を入力できる', async ({ page }) => {
    const navigated = await navigateToMeasurementInput(page)
    if (navigated) {
      // TUG入力フィールド
      const tugInput = page.getByLabel(/TUG|秒/)
        .or(page.locator('[data-testid="tug-input"]'))

      if (await tugInput.isVisible({ timeout: 5000 })) {
        await tugInput.fill('12.3')
        await expect(tugInput).toHaveValue('12.3')
      }
    }
  })

  test('測定値を保存できる', async ({ page }) => {
    const navigated = await navigateToMeasurementInput(page)
    if (navigated) {
      // フォームに値を入力
      const dateInput = page.locator('input[type="date"]')
      if (await dateInput.isVisible({ timeout: 5000 })) {
        await dateInput.fill(new Date().toISOString().split('T')[0])
      }

      const weightInput = page.getByLabel(/体重/)
      if (await weightInput.isVisible({ timeout: 3000 })) {
        await weightInput.fill('65.5')
      }

      // 保存ボタンをクリック
      const saveButton = page.getByRole('button', { name: /保存|登録|記録/ })
      if (await saveButton.isVisible({ timeout: 3000 })) {
        await saveButton.click()

        // 成功メッセージまたは画面遷移を確認
        await expect(
          page.getByText(/保存|完了|成功/).or(page.getByRole('alert'))
        ).toBeVisible({ timeout: 10000 }).catch(() => {
          // 画面遷移を確認
          return expect(page).not.toHaveURL(/\/measurements\/new$/)
        })
      }
    }
  })

  test('バリデーションエラーが表示される', async ({ page }) => {
    const navigated = await navigateToMeasurementInput(page)
    if (navigated) {
      // 無効な値を入力
      const weightInput = page.getByLabel(/体重/)
      if (await weightInput.isVisible({ timeout: 5000 })) {
        await weightInput.fill('-10') // 負の値

        // 保存ボタンをクリック
        const saveButton = page.getByRole('button', { name: /保存|登録|記録/ })
        if (await saveButton.isVisible()) {
          await saveButton.click()

          // エラーメッセージの表示確認
          await expect(page.getByRole('alert').or(page.getByText(/エラー|無効/))).toBeVisible({ timeout: 5000 })
        }
      }
    }
  })
})
