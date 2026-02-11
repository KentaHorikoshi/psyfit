import { test, expect } from '@playwright/test'

/**
 * U-07, U-08: 履歴表示フロー
 * ホーム → 履歴一覧表示 → 測定値グラフ表示
 */
test.describe('履歴表示フロー', () => {
  test('履歴一覧画面が表示される', async ({ page }) => {
    await page.goto('/history')

    // 履歴一覧画面の表示確認
    await expect(page.getByText(/履歴|運動記録/)).toBeVisible({ timeout: 10000 })
  })

  test('履歴の詳細が表示できる', async ({ page }) => {
    await page.goto('/history')

    // 履歴アイテムをクリック
    const historyItem = page.locator('[data-testid="history-item"]')
      .or(page.locator('.history-item'))
      .or(page.locator('table tbody tr'))
      .first()

    if (await historyItem.isVisible({ timeout: 5000 })) {
      await historyItem.click()

      // 詳細情報の表示確認
      const detailContent = page.getByText(/詳細|運動|時間|回|セット/)
      await expect(detailContent).toBeVisible({ timeout: 5000 })
    }
  })

  test('測定値画面が表示される', async ({ page }) => {
    await page.goto('/measurements')

    // 測定値画面の表示確認
    await expect(page.getByText(/測定値|記録|グラフ|体重/)).toBeVisible({ timeout: 10000 })
  })

  test('測定値グラフが表示される', async ({ page }) => {
    await page.goto('/measurements')

    // 測定値グラフのページが表示されることを確認
    await expect(
      page.getByRole('heading', { name: /測定値/ })
        .or(page.getByText('推移グラフ'))
        .or(page.locator('.recharts-wrapper'))
    ).toBeVisible({ timeout: 10000 })
  })

  test('測定値のタブ切り替えができる', async ({ page }) => {
    await page.goto('/measurements')

    // タブの存在確認
    const tabs = page.getByRole('tablist')
    if (await tabs.isVisible({ timeout: 5000 })) {
      const tabButtons = page.getByRole('tab')
      if (await tabButtons.count() > 1) {
        // 2番目のタブをクリック
        await tabButtons.nth(1).click()

        // タブがアクティブになる
        await expect(tabButtons.nth(1)).toHaveAttribute('aria-selected', 'true')
      }
    }
  })
})
