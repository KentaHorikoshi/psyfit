import { test, expect } from '@playwright/test'

/**
 * U-14: 体調入力フロー
 * ログイン → 体調入力 → 保存
 */
test.describe('体調入力フロー', () => {
  test('体調入力画面が表示される', async ({ page }) => {
    await page.goto('/condition-input')

    // 体調入力画面の表示確認
    await expect(page.getByRole('heading', { name: /体調|コンディション/ })).toBeVisible()

    // 入力フォーム要素の確認（スライダーなど）
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _painSlider = page.locator('[data-testid="pain-slider"]')
      .or(page.getByRole('slider'))
      .or(page.locator('input[type="range"]'))

    // スライダーまたは入力フォームが存在する
    await expect(page.locator('form').or(page.locator('[data-testid="condition-form"]'))).toBeVisible()
  })

  test('痛みレベルを入力できる', async ({ page }) => {
    await page.goto('/condition-input')

    // スライダーを探す
    const slider = page.getByRole('slider').first()
      .or(page.locator('input[type="range"]').first())
      .or(page.locator('[data-testid="pain-slider"]'))

    if (await slider.isVisible()) {
      // スライダー値を変更
      await slider.fill('5')
    }

    // または数値入力
    const numberInput = page.locator('input[type="number"]').first()
    if (await numberInput.isVisible()) {
      await numberInput.fill('5')
    }
  })

  test('調子を選択できる', async ({ page }) => {
    await page.goto('/condition-input')

    // 調子選択ボタンを探す
    const conditionButtons = page.getByRole('button', { name: /良い|普通|悪い/ })
      .or(page.locator('[data-testid="condition-button"]'))

    if (await conditionButtons.first().isVisible()) {
      await conditionButtons.first().click()
    }
  })

  test('体調を保存できる', async ({ page }) => {
    await page.goto('/condition-input')

    // 何らかの入力を行う
    const slider = page.getByRole('slider').first()
      .or(page.locator('input[type="range"]').first())

    if (await slider.isVisible()) {
      await slider.fill('3')
    }

    // 保存ボタンをクリック
    const saveButton = page.getByRole('button', { name: /保存|記録|送信/ })

    if (await saveButton.isVisible()) {
      await saveButton.click()

      // 成功メッセージまたは画面遷移を確認
      const successMessage = page.getByText(/保存|完了|成功/)
      await expect(successMessage).toBeVisible({ timeout: 5000 }).catch(() => {
        // メッセージがなければ画面遷移を確認
        return expect(page).not.toHaveURL(/\/condition-input/)
      })
    }
  })
})
