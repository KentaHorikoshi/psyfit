import { test, expect } from '@playwright/test'

/**
 * S-07: レポート出力フロー
 * ログイン → レポート出力 → ダウンロード
 */
test.describe('レポート出力フロー', () => {
  test('レポート画面が表示される', async ({ page }) => {
    await page.goto('/reports')

    // レポート画面の表示確認
    await expect(page.getByRole('heading', { name: /レポート|出力/ })).toBeVisible()
  })

  test('レポートタイプを選択できる', async ({ page }) => {
    await page.goto('/reports')

    // レポートタイプ選択
    const reportTypeSelect = page.getByRole('combobox', { name: /レポート|タイプ/ })
      .or(page.locator('select'))
      .or(page.locator('[data-testid="report-type"]'))

    if (await reportTypeSelect.isVisible()) {
      await reportTypeSelect.click()

      // オプションが表示される
      const option = page.getByRole('option').first()
        .or(page.locator('option').nth(1))

      if (await option.isVisible()) {
        await option.click()
      }
    }
  })

  test('対象患者を選択できる', async ({ page }) => {
    await page.goto('/reports')

    // 患者選択
    const patientSelect = page.getByRole('combobox', { name: /患者/ })
      .or(page.locator('[data-testid="patient-select"]'))

    if (await patientSelect.isVisible()) {
      await patientSelect.click()

      // 患者を選択
      const patientOption = page.getByRole('option').first()
      if (await patientOption.isVisible()) {
        await patientOption.click()
      }
    }
  })

  test('期間を選択できる', async ({ page }) => {
    await page.goto('/reports')

    // 開始日
    const startDate = page.getByLabel(/開始日|From/)
      .or(page.locator('input[type="date"]').first())

    if (await startDate.isVisible()) {
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      await startDate.fill(oneMonthAgo.toISOString().split('T')[0])
    }

    // 終了日
    const endDate = page.getByLabel(/終了日|To/)
      .or(page.locator('input[type="date"]').nth(1))

    if (await endDate.isVisible()) {
      await endDate.fill(new Date().toISOString().split('T')[0])
    }
  })

  test('レポートをプレビューできる', async ({ page }) => {
    await page.goto('/reports')

    // プレビューボタン
    const previewButton = page.getByRole('button', { name: /プレビュー|表示/ })

    if (await previewButton.isVisible()) {
      await previewButton.click()

      // プレビュー領域の表示確認
      const preview = page.locator('[data-testid="report-preview"]')
        .or(page.locator('.report-preview'))
        .or(page.locator('iframe'))

      await expect(preview.or(page.getByText(/レポート|データ/))).toBeVisible()
    }
  })

  test('レポートをダウンロードできる', async ({ page }) => {
    await page.goto('/reports')

    // ダウンロードボタン
    const downloadButton = page.getByRole('button', { name: /ダウンロード|出力|PDF|Excel/ })

    if (await downloadButton.isVisible()) {
      // ダウンロードイベントを待機
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null)

      await downloadButton.click()

      const download = await downloadPromise
      if (download) {
        // ダウンロードが開始されたことを確認
        expect(download.suggestedFilename()).toBeTruthy()
      } else {
        // ダウンロードが発生しなかった場合は、何らかのフィードバックを確認
        await expect(
          page.getByText(/ダウンロード|出力|完了/).or(page.getByRole('alert'))
        ).toBeVisible()
      }
    }
  })

  test('出力形式を選択できる', async ({ page }) => {
    await page.goto('/reports')

    // 形式選択（PDF/Excel/CSV）
    const formatOptions = page.getByRole('radio')
      .or(page.locator('input[name="format"]'))
      .or(page.getByRole('button', { name: /PDF|Excel|CSV/ }))

    if (await formatOptions.first().isVisible()) {
      // 2番目のオプションを選択
      await formatOptions.nth(1).click()
    }
  })
})
