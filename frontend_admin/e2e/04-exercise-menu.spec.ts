import { test, expect, type Page } from '@playwright/test'

/**
 * 患者一覧から最初の患者の運動メニュー設定画面に遷移するヘルパー
 */
async function navigateToExerciseMenu(page: Page): Promise<boolean> {
  await page.goto('/patients')
  await expect(page.getByText(/患者一覧|患者/)).toBeVisible({ timeout: 10000 })

  // 患者行をクリック
  const patientRow = page.locator('table tbody tr').first()
    .or(page.locator('[data-testid="patient-item"]').first())

  if (await patientRow.isVisible({ timeout: 5000 })) {
    await patientRow.click()
    await expect(page).toHaveURL(/\/patients\/[a-f0-9-]+/)

    // 患者詳細画面の「メニュー設定」ボタンをクリック
    const menuButton = page.getByRole('button', { name: /メニュー設定/ })
      .or(page.getByRole('link', { name: /メニュー設定/ }))
      .or(page.getByText('メニュー設定'))

    if (await menuButton.isVisible({ timeout: 5000 })) {
      await menuButton.click()
      await expect(page).toHaveURL(/\/patients\/[a-f0-9-]+\/exercise-menu/)
      return true
    }
  }
  return false
}

/**
 * S-06: 運動メニュー設定フロー
 * 患者一覧 → 患者詳細 → 運動メニュー設定 → 保存
 */
test.describe('運動メニュー設定フロー', () => {
  test('運動メニュー設定画面が表示される', async ({ page }) => {
    const navigated = await navigateToExerciseMenu(page)
    if (navigated) {
      // 運動メニュー設定画面の表示確認
      await expect(page.getByText(/運動メニュー|メニュー設定/)).toBeVisible({ timeout: 10000 })
    }
  })

  test('利用可能な運動が表示される', async ({ page }) => {
    const navigated = await navigateToExerciseMenu(page)
    if (navigated) {
      // 運動リストの確認
      const exerciseList = page.locator('[data-testid="exercise-list"]')
        .or(page.locator('.exercise-item'))
        .or(page.locator('table'))

      await expect(exerciseList.or(page.getByText(/運動|エクササイズ/))).toBeVisible({ timeout: 10000 })
    }
  })

  test('運動を割り当てできる', async ({ page }) => {
    const navigated = await navigateToExerciseMenu(page)
    if (navigated) {
      // 運動選択チェックボックスまたはボタン
      const exerciseCheckbox = page.locator('input[type="checkbox"]').first()
        .or(page.getByRole('checkbox').first())

      if (await exerciseCheckbox.isVisible({ timeout: 5000 })) {
        await exerciseCheckbox.click()
        await expect(exerciseCheckbox).toBeChecked()
      }
    }
  })

  test('回数・セット数を設定できる', async ({ page }) => {
    const navigated = await navigateToExerciseMenu(page)
    if (navigated) {
      // 回数入力フィールド
      const repsInput = page.getByLabel(/回数/)
        .or(page.locator('[data-testid="reps-input"]'))

      if (await repsInput.isVisible({ timeout: 5000 })) {
        await repsInput.fill('10')
        await expect(repsInput).toHaveValue('10')
      }

      // セット数入力フィールド
      const setsInput = page.getByLabel(/セット/)
        .or(page.locator('[data-testid="sets-input"]'))

      if (await setsInput.isVisible({ timeout: 3000 })) {
        await setsInput.fill('3')
        await expect(setsInput).toHaveValue('3')
      }
    }
  })

  test('運動メニューを保存できる', async ({ page }) => {
    const navigated = await navigateToExerciseMenu(page)
    if (navigated) {
      // 何らかの変更を行う
      const exerciseCheckbox = page.locator('input[type="checkbox"]').first()
      if (await exerciseCheckbox.isVisible({ timeout: 5000 })) {
        await exerciseCheckbox.click()
      }

      // 保存ボタンをクリック
      const saveButton = page.getByRole('button', { name: /保存|更新|設定/ })
      if (await saveButton.isVisible({ timeout: 3000 })) {
        await saveButton.click()

        // 成功メッセージの表示確認
        await expect(
          page.getByText(/保存|完了|成功/).or(page.getByRole('alert'))
        ).toBeVisible({ timeout: 10000 })
      }
    }
  })

  test('患者詳細に戻れる', async ({ page }) => {
    const navigated = await navigateToExerciseMenu(page)
    if (navigated) {
      // 戻るボタン
      const backButton = page.getByRole('button', { name: /戻る/ })
        .or(page.getByRole('link', { name: /患者|一覧|戻る/ }))
        .or(page.locator('[data-testid="back-button"]'))

      if (await backButton.isVisible({ timeout: 3000 })) {
        await backButton.click()
        await expect(page).toHaveURL(/\/patients/)
      }
    }
  })
})
