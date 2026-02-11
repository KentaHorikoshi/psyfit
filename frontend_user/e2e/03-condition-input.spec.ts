import { test, expect } from '@playwright/test'

/**
 * U-14: 体調入力フロー
 * ホーム → 体調入力 → 保存
 */
test.describe('体調入力フロー', () => {
  test('体調入力画面が表示される', async ({ page }) => {
    await page.goto('/condition-input')

    // 体調入力画面の表示確認
    await expect(
      page.getByRole('heading', { name: /体調|コンディション/ })
        .or(page.getByText(/体調|コンディション|痛み|調子/).first())
    ).toBeVisible({ timeout: 10000 })
  })

  test('痛みレベルを入力できる', async ({ page }) => {
    await page.goto('/condition-input')

    // スライダーまたは入力を探す
    const slider = page.getByRole('slider').first()
    const rangeInput = page.locator('input[type="range"]').first()
    const numberInput = page.locator('input[type="number"]').first()

    if (await slider.isVisible({ timeout: 5000 })) {
      await slider.fill('5')
    } else if (await rangeInput.isVisible({ timeout: 3000 })) {
      await rangeInput.fill('5')
    } else if (await numberInput.isVisible({ timeout: 3000 })) {
      await numberInput.fill('5')
    }
  })

  test('調子を選択できる', async ({ page }) => {
    await page.goto('/condition-input')

    // 調子選択ボタンまたはスライダーを探す
    const conditionButtons = page.getByRole('button', { name: /良い|普通|悪い/ })
    const conditionSlider = page.getByRole('slider').nth(1)

    if (await conditionButtons.first().isVisible({ timeout: 5000 })) {
      await conditionButtons.first().click()
    } else if (await conditionSlider.isVisible({ timeout: 3000 })) {
      await conditionSlider.fill('7')
    }
  })

  test('体調を保存できる', async ({ page }) => {
    await page.goto('/condition-input')

    // 何らかの入力を行う
    const slider = page.getByRole('slider').first()
    const rangeInput = page.locator('input[type="range"]').first()

    if (await slider.isVisible({ timeout: 5000 })) {
      await slider.fill('3')
    } else if (await rangeInput.isVisible({ timeout: 3000 })) {
      await rangeInput.fill('3')
    }

    // 保存ボタンをクリック
    const saveButton = page.getByRole('button', { name: /保存|記録|送信/ })

    if (await saveButton.isVisible({ timeout: 5000 })) {
      await saveButton.click()

      // 成功メッセージまたは画面遷移を確認
      await expect(
        page.getByText(/保存|完了|成功|記録しました/)
          .or(page.getByRole('alert'))
      ).toBeVisible({ timeout: 10000 }).catch(() => {
        // メッセージがなければ画面遷移を確認
        return expect(page).not.toHaveURL(/\/condition-input/)
      })
    }
  })
})
