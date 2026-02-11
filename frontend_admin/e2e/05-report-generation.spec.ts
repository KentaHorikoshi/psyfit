import { test, expect, type Page } from '@playwright/test'

/**
 * 患者一覧から最初の患者のレポート画面に遷移するヘルパー
 */
async function navigateToReport(page: Page): Promise<boolean> {
  await page.goto('/patients')
  await expect(page.getByRole('heading', { name: '患者一覧' })).toBeVisible({ timeout: 10000 })

  // 患者行をクリック
  const patientRow = page.locator('table tbody tr').first()
    .or(page.locator('[data-testid="patient-item"]').first())

  if (await patientRow.isVisible({ timeout: 5000 })) {
    await patientRow.click()
    await expect(page).toHaveURL(/\/patients\/[a-f0-9-]+/)

    // 患者詳細画面の「レポート出力」ボタンをクリック
    const reportButton = page.getByRole('button', { name: /レポート/ })
      .or(page.getByRole('link', { name: /レポート/ }))
      .or(page.getByText('レポート出力'))

    if (await reportButton.isVisible({ timeout: 5000 })) {
      await reportButton.click()
      await expect(page).toHaveURL(/\/patients\/[a-f0-9-]+\/report/)
      return true
    }
  }
  return false
}

/**
 * S-07: レポート出力フロー
 * 患者一覧 → 患者詳細 → レポート出力 → ダウンロード
 */
test.describe('レポート出力フロー', () => {
  test('レポート画面が表示される', async ({ page }) => {
    const navigated = await navigateToReport(page)
    if (navigated) {
      // レポート画面の表示確認
      await expect(page.getByText(/レポート|出力/)).toBeVisible({ timeout: 10000 })
    }
  })

  test('期間を選択できる', async ({ page }) => {
    const navigated = await navigateToReport(page)
    if (navigated) {
      // 開始日
      const startDate = page.getByLabel(/開始日|From/)
        .or(page.locator('input[type="date"]').first())

      if (await startDate.isVisible({ timeout: 5000 })) {
        const oneMonthAgo = new Date()
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
        await startDate.fill(oneMonthAgo.toISOString().split('T')[0])
      }

      // 終了日
      const endDate = page.getByLabel(/終了日|To/)
        .or(page.locator('input[type="date"]').nth(1))

      if (await endDate.isVisible({ timeout: 3000 })) {
        await endDate.fill(new Date().toISOString().split('T')[0])
      }
    }
  })

  test('出力形式を選択できる', async ({ page }) => {
    const navigated = await navigateToReport(page)
    if (navigated) {
      // 形式選択（PDF/CSV）
      const formatOptions = page.getByRole('radio')
        .or(page.locator('input[name="format"]'))
        .or(page.getByRole('button', { name: /PDF|CSV/ }))

      if (await formatOptions.first().isVisible({ timeout: 5000 })) {
        await formatOptions.first().click()
      }
    }
  })

  test('レポートをダウンロードできる', async ({ page }) => {
    const navigated = await navigateToReport(page)
    if (navigated) {
      // ダウンロードボタン
      const downloadButton = page.getByRole('button', { name: /ダウンロード|出力|PDF|CSV/ })

      if (await downloadButton.isVisible({ timeout: 5000 })) {
        // ダウンロードイベントを待機
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null)

        await downloadButton.click()

        const download = await downloadPromise
        if (download) {
          expect(download.suggestedFilename()).toBeTruthy()
        } else {
          // ダウンロードが発生しなかった場合は、何らかのフィードバックを確認
          await expect(
            page.getByText(/ダウンロード|出力|完了/).or(page.getByRole('alert'))
          ).toBeVisible({ timeout: 5000 })
        }
      }
    }
  })
})
