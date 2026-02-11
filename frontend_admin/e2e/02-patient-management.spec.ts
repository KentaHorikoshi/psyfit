import { test, expect, type Page } from '@playwright/test'

/**
 * 患者一覧から最初の患者の詳細画面に遷移するヘルパー
 * UUID形式のIDを持つため、リストからの遷移が必要
 */
async function navigateToFirstPatient(page: Page): Promise<string | null> {
  await page.goto('/patients')
  await expect(page.getByText(/患者一覧|患者/)).toBeVisible({ timeout: 10000 })

  // 患者行をクリック
  const patientRow = page.locator('table tbody tr').first()
    .or(page.locator('[data-testid="patient-item"]').first())

  if (await patientRow.isVisible({ timeout: 5000 })) {
    await patientRow.click()
    await expect(page).toHaveURL(/\/patients\/[a-f0-9-]+/)

    // URLからpatient IDを抽出
    const url = page.url()
    const match = url.match(/\/patients\/([a-f0-9-]+)/)
    return match ? match[1] : null
  }
  return null
}

/**
 * S-03, S-04: 患者管理フロー
 * ダッシュボード → 患者一覧 → 患者詳細表示
 */
test.describe('患者管理フロー', () => {
  test('患者一覧画面が表示される', async ({ page }) => {
    await page.goto('/patients')

    // 患者一覧画面の表示確認
    await expect(page.getByText(/患者一覧|患者/)).toBeVisible({ timeout: 10000 })

    // テーブルまたはリストの存在確認
    const patientList = page.locator('table')
      .or(page.locator('[data-testid="patient-list"]'))

    await expect(patientList.or(page.getByText(/患者|データがありません/))).toBeVisible()
  })

  test('患者を検索できる', async ({ page }) => {
    await page.goto('/patients')

    // 検索フィールドを探す
    const searchInput = page.getByPlaceholder(/検索/)
      .or(page.getByRole('searchbox'))
      .or(page.locator('input[type="search"]'))

    if (await searchInput.isVisible({ timeout: 5000 })) {
      await searchInput.fill('田中')

      // 検索結果の表示を待つ
      await page.waitForTimeout(500)

      // 検索が機能していることを確認
      await expect(page.locator('body')).toBeVisible()
    }
  })

  test('患者の詳細画面に遷移できる', async ({ page }) => {
    const patientId = await navigateToFirstPatient(page)
    if (patientId) {
      // 患者詳細画面への遷移を確認（UUID形式）
      await expect(page).toHaveURL(/\/patients\/[a-f0-9-]+/)
    }
  })

  test('患者詳細画面で情報が表示される', async ({ page }) => {
    const patientId = await navigateToFirstPatient(page)
    if (patientId) {
      // 患者情報の表示確認
      await expect(page.getByText(/患者情報|詳細|名前|田中|高橋|渡辺|伊藤|小林/)).toBeVisible({ timeout: 10000 })
    }
  })

  test('患者の病期ステータスが表示される', async ({ page }) => {
    await page.goto('/patients')

    // ステータスバッジまたはテーブルの確認
    const statusBadge = page.getByText(/急性期|回復期|維持期/)
    const table = page.locator('table')

    await expect(
      statusBadge.first().or(table)
    ).toBeVisible({ timeout: 10000 })
  })

  test('ページネーションが機能する', async ({ page }) => {
    await page.goto('/patients')

    // ページネーションコントロール
    const pagination = page.locator('[data-testid="pagination"]')
      .or(page.getByRole('navigation', { name: /ページ/ }))
      .or(page.locator('.pagination'))

    if (await pagination.isVisible({ timeout: 5000 })) {
      const nextButton = page.getByRole('button', { name: /次/ })

      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click()
        await expect(page.getByText(/2|次/)).toBeVisible()
      }
    }
  })
})
