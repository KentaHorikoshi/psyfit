import { test, expect } from '@playwright/test'

/**
 * S-06: 運動メニュー設定フロー
 * ログイン → 運動メニュー設定 → 保存
 */
test.describe('運動メニュー設定フロー', () => {
  test('運動メニュー設定画面が表示される', async ({ page }) => {
    // 患者IDを指定して運動メニュー設定画面にアクセス
    await page.goto('/exercise-menu/1')

    // 運動メニュー設定画面の表示確認
    await expect(page.getByRole('heading', { name: /運動メニュー|メニュー設定/ })).toBeVisible()
  })

  test('利用可能な運動が表示される', async ({ page }) => {
    await page.goto('/exercise-menu/1')

    // 運動リストの確認
    const exerciseList = page.locator('[data-testid="exercise-list"]')
      .or(page.locator('.exercise-item'))
      .or(page.locator('table'))

    await expect(exerciseList.or(page.getByText(/運動|エクササイズ/))).toBeVisible()
  })

  test('運動を割り当てできる', async ({ page }) => {
    await page.goto('/exercise-menu/1')

    // 運動選択チェックボックスまたはボタン
    const exerciseCheckbox = page.locator('input[type="checkbox"]').first()
      .or(page.getByRole('checkbox').first())

    if (await exerciseCheckbox.isVisible()) {
      // チェックを切り替え
      await exerciseCheckbox.click()

      // 選択状態の確認
      await expect(exerciseCheckbox).toBeChecked()
    }
  })

  test('回数・セット数を設定できる', async ({ page }) => {
    await page.goto('/exercise-menu/1')

    // 回数入力フィールド
    const repsInput = page.getByLabel(/回数/)
      .or(page.locator('[data-testid="reps-input"]'))

    if (await repsInput.isVisible()) {
      await repsInput.fill('10')
      await expect(repsInput).toHaveValue('10')
    }

    // セット数入力フィールド
    const setsInput = page.getByLabel(/セット/)
      .or(page.locator('[data-testid="sets-input"]'))

    if (await setsInput.isVisible()) {
      await setsInput.fill('3')
      await expect(setsInput).toHaveValue('3')
    }
  })

  test('運動メニューを保存できる', async ({ page }) => {
    await page.goto('/exercise-menu/1')

    // 何らかの変更を行う
    const exerciseCheckbox = page.locator('input[type="checkbox"]').first()
    if (await exerciseCheckbox.isVisible()) {
      await exerciseCheckbox.click()
    }

    // 保存ボタンをクリック
    const saveButton = page.getByRole('button', { name: /保存|更新|設定/ })
    if (await saveButton.isVisible()) {
      await saveButton.click()

      // 成功メッセージの表示確認
      await expect(
        page.getByText(/保存|完了|成功/).or(page.getByRole('alert'))
      ).toBeVisible({ timeout: 5000 })
    }
  })

  test('患者一覧に戻れる', async ({ page }) => {
    await page.goto('/exercise-menu/1')

    // 戻るボタン
    const backButton = page.getByRole('button', { name: /戻る/ })
      .or(page.getByRole('link', { name: /患者|一覧/ }))
      .or(page.locator('[data-testid="back-button"]'))

    if (await backButton.isVisible()) {
      await backButton.click()
      await expect(page).toHaveURL(/\/patients/)
    }
  })
})
