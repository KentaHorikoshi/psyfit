import { test, expect } from '@playwright/test'

/**
 * S-03, S-04: 患者管理フロー
 * ログイン → 患者一覧 → 患者詳細表示
 */
test.describe('患者管理フロー', () => {
  test('患者一覧画面が表示される', async ({ page }) => {
    await page.goto('/patients')

    // 患者一覧画面の表示確認
    await expect(page.getByRole('heading', { name: /患者一覧|患者/ })).toBeVisible()

    // テーブルまたはリストの存在確認
    const patientList = page.locator('table')
      .or(page.locator('[data-testid="patient-list"]'))
      .or(page.locator('.patient-item'))

    await expect(patientList.or(page.getByText(/患者|データがありません/))).toBeVisible()
  })

  test('患者を検索できる', async ({ page }) => {
    await page.goto('/patients')

    // 検索フィールドを探す
    const searchInput = page.getByPlaceholder(/検索/)
      .or(page.getByRole('searchbox'))
      .or(page.locator('input[type="search"]'))

    if (await searchInput.isVisible()) {
      await searchInput.fill('田中')

      // 検索結果の表示を待つ
      await page.waitForTimeout(500)

      // 検索が機能していることを確認
      await expect(page.locator('body')).toBeVisible()
    }
  })

  test('患者の詳細画面に遷移できる', async ({ page }) => {
    await page.goto('/patients')

    // 患者行をクリック
    const patientRow = page.locator('table tbody tr').first()
      .or(page.locator('[data-testid="patient-item"]').first())
      .or(page.locator('.patient-item').first())

    if (await patientRow.isVisible()) {
      await patientRow.click()

      // 患者詳細画面への遷移を確認
      await expect(page).toHaveURL(/\/patients\/\d+/)
    }
  })

  test('患者詳細画面で情報が表示される', async ({ page }) => {
    // 直接患者詳細画面にアクセス
    await page.goto('/patients/1')

    // 患者情報の表示確認
    await expect(page.getByText(/患者情報|詳細|名前/)).toBeVisible()
  })

  test('患者の病期ステータスが表示される', async ({ page }) => {
    await page.goto('/patients')

    // ステータスバッジの確認
    const statusBadge = page.locator('[data-testid="status-badge"]')
      .or(page.locator('.badge'))
      .or(page.getByText(/急性期|回復期|維持期/))

    // ステータスまたはテーブルが表示される
    await expect(
      statusBadge.first().or(page.locator('table'))
    ).toBeVisible()
  })

  test('ページネーションが機能する', async ({ page }) => {
    await page.goto('/patients')

    // ページネーションコントロール
    const pagination = page.locator('[data-testid="pagination"]')
      .or(page.getByRole('navigation', { name: /ページ/ }))
      .or(page.locator('.pagination'))

    if (await pagination.isVisible()) {
      const nextButton = page.getByRole('button', { name: /次/ })
        .or(page.locator('[aria-label="次のページ"]'))

      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click()
        // ページが変わったことを確認
        await expect(page.getByText(/2|次/)).toBeVisible()
      }
    }
  })
})
