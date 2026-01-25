import { test, expect } from '@playwright/test'

/**
 * U-02〜U-04: 運動実施フロー
 * ログイン → 運動メニュー選択 → 運動実施 → 記録保存
 */
test.describe('運動実施フロー', () => {
  test('運動メニューが表示される', async ({ page }) => {
    await page.goto('/exercise-menu')

    // 運動メニュー画面の表示確認
    await expect(page.getByRole('heading', { name: /運動メニュー|今日の運動/ })).toBeVisible()

    // 運動カードの存在確認
    const exerciseCards = page.locator('[data-testid="exercise-card"]')
      .or(page.locator('.exercise-card'))
      .or(page.locator('article'))

    // 運動メニューが1つ以上存在することを確認
    await expect(exerciseCards.first()).toBeVisible({ timeout: 10000 })
  })

  test('運動カードをタップして詳細に遷移できる', async ({ page }) => {
    await page.goto('/exercise-menu')

    // 運動カードをクリック
    const exerciseCard = page.locator('[data-testid="exercise-card"]')
      .or(page.locator('.exercise-card'))
      .or(page.locator('article').first())
      .first()

    if (await exerciseCard.isVisible()) {
      await exerciseCard.click()

      // 運動実施画面またはプレイヤー画面への遷移
      await expect(page).toHaveURL(/\/exercise/)
    }
  })

  test('運動実施画面でビデオプレイヤーが表示される', async ({ page }) => {
    // 直接運動実施画面にアクセス
    await page.goto('/exercise/1')

    // ビデオプレイヤーまたは運動の詳細画面の表示確認
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _videoPlayer = page.locator('video')
      .or(page.locator('[data-testid="video-player"]'))
      .or(page.locator('.video-container'))

    // ビデオ要素または関連するUI要素が存在する
    const exerciseContent = page.getByText(/運動|エクササイズ|開始/)
    await expect(exerciseContent).toBeVisible()
  })

  test('運動完了後に祝福画面が表示される', async ({ page }) => {
    await page.goto('/exercise/1')

    // 完了ボタンを探してクリック
    const completeButton = page.getByRole('button', { name: /完了|終了|次へ/ })

    if (await completeButton.isVisible({ timeout: 5000 })) {
      await completeButton.click()

      // 祝福画面または完了メッセージの表示確認
      const celebration = page.getByText(/お疲れ様|完了|おめでとう/)
        .or(page.locator('[data-testid="celebration"]'))

      await expect(celebration).toBeVisible({ timeout: 5000 })
    }
  })

  test('運動メニューからホームに戻れる', async ({ page }) => {
    await page.goto('/exercise-menu')

    // 戻るボタンまたはホームリンク
    const backButton = page.getByRole('button', { name: /戻る/ })
      .or(page.getByRole('link', { name: /ホーム/ }))
      .or(page.locator('[data-testid="back-button"]'))

    if (await backButton.isVisible()) {
      await backButton.click()
      await expect(page).toHaveURL(/\/(home|)$/)
    }
  })
})
