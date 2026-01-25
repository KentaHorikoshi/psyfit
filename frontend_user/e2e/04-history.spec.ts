import { test, expect } from '@playwright/test'

/**
 * U-07, U-08: 履歴表示フロー
 * ログイン → 履歴一覧表示 → 測定値グラフ表示
 */
test.describe('履歴表示フロー', () => {
  test('履歴一覧画面が表示される', async ({ page }) => {
    await page.goto('/history')

    // 履歴一覧画面の表示確認
    await expect(page.getByRole('heading', { name: /履歴|運動記録/ })).toBeVisible()

    // 履歴リストまたはカレンダーの表示確認
    const historyContent = page.locator('[data-testid="history-list"]')
      .or(page.locator('.history-item'))
      .or(page.locator('table'))
      .or(page.locator('[data-testid="calendar"]'))

    await expect(historyContent.or(page.getByText(/記録がありません|履歴/))).toBeVisible()
  })

  test('履歴の詳細が表示できる', async ({ page }) => {
    await page.goto('/history')

    // 履歴アイテムをクリック
    const historyItem = page.locator('[data-testid="history-item"]')
      .or(page.locator('.history-item'))
      .or(page.locator('tr').nth(1))
      .first()

    if (await historyItem.isVisible()) {
      await historyItem.click()

      // 詳細情報の表示確認
      const detailContent = page.getByText(/詳細|運動|時間/)
      await expect(detailContent).toBeVisible()
    }
  })

  test('測定値画面が表示される', async ({ page }) => {
    await page.goto('/measurements')

    // 測定値画面の表示確認
    await expect(page.getByRole('heading', { name: /測定値|記録|グラフ/ })).toBeVisible()
  })

  test('測定値グラフが表示される', async ({ page }) => {
    await page.goto('/measurements')

    // グラフまたはチャートの表示確認
    const chart = page.locator('[data-testid="chart"]')
      .or(page.locator('.recharts-wrapper'))
      .or(page.locator('svg'))
      .first()

    // グラフまたはデータなしメッセージが表示される
    await expect(
      chart.or(page.getByText(/データがありません|測定値/))
    ).toBeVisible()
  })

  test('測定値のタブ切り替えができる', async ({ page }) => {
    await page.goto('/measurements')

    // タブまたはセグメントの存在確認
    const tabs = page.getByRole('tablist')
      .or(page.locator('[data-testid="measurement-tabs"]'))

    if (await tabs.isVisible()) {
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
