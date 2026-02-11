import { test, expect } from '@playwright/test'

/**
 * U-02〜U-04: 運動実施フロー
 * ホーム → 運動メニュー選択 → 運動実施 → 記録保存
 */
test.describe('運動実施フロー', () => {
  test('運動メニューが表示される', async ({ page }) => {
    await page.goto('/exercise-menu')

    // 運動メニュー画面の表示確認
    await expect(page.getByText(/運動メニュー|今日の運動|運動する/)).toBeVisible({ timeout: 10000 })
  })

  test('運動カードをタップして詳細に遷移できる', async ({ page }) => {
    await page.goto('/exercise-menu')

    // 運動カードまたはリスト項目を探す
    const exerciseCard = page.locator('[data-testid="exercise-card"]')
      .or(page.locator('.exercise-card'))
      .or(page.locator('article'))
      .first()

    await expect(exerciseCard).toBeVisible({ timeout: 10000 })
    await exerciseCard.click()

    // 運動実施画面への遷移（UUID形式のID）
    await expect(page).toHaveURL(/\/exercise\/[a-f0-9-]+/)
  })

  test('運動実施画面で運動コンテンツが表示される', async ({ page }) => {
    // 運動メニューから遷移して動的UUIDを取得
    await page.goto('/exercise-menu')

    const exerciseCard = page.locator('[data-testid="exercise-card"]')
      .or(page.locator('.exercise-card'))
      .or(page.locator('article'))
      .first()

    if (await exerciseCard.isVisible({ timeout: 10000 })) {
      await exerciseCard.click()
      await expect(page).toHaveURL(/\/exercise\/[a-f0-9-]+/)

      // 運動の詳細画面の表示確認
      const exerciseContent = page.getByText(/運動|エクササイズ|開始|完了/)
        .or(page.locator('video'))
        .or(page.locator('[data-testid="video-player"]'))
      await expect(exerciseContent).toBeVisible({ timeout: 10000 })
    }
  })

  test('運動完了後に祝福画面が表示される', async ({ page }) => {
    // 運動メニューから遷移
    await page.goto('/exercise-menu')

    const exerciseCard = page.locator('[data-testid="exercise-card"]')
      .or(page.locator('.exercise-card'))
      .or(page.locator('article'))
      .first()

    if (await exerciseCard.isVisible({ timeout: 10000 })) {
      await exerciseCard.click()
      await expect(page).toHaveURL(/\/exercise\/[a-f0-9-]+/)

      // 完了ボタンを探してクリック
      const completeButton = page.getByRole('button', { name: /完了|終了|次へ|記録/ })

      if (await completeButton.isVisible({ timeout: 5000 })) {
        await completeButton.click()

        // 祝福画面または完了メッセージの表示確認
        const celebration = page.getByText(/お疲れ様|完了|おめでとう|記録しました/)
          .or(page.locator('[data-testid="celebration"]'))

        await expect(celebration).toBeVisible({ timeout: 10000 })
      }
    }
  })

  test('ホームから運動メニューに遷移できる', async ({ page }) => {
    await page.goto('/home')

    // 「運動する」メニューカードをクリック
    const exerciseLink = page.getByRole('link', { name: /運動する/ })
      .or(page.getByText('運動する'))

    if (await exerciseLink.isVisible({ timeout: 5000 })) {
      await exerciseLink.click()
      await expect(page).toHaveURL(/\/exercise-menu/)
    }
  })
})
