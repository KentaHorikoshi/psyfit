import { test, expect } from '@playwright/test'
import { SERVICE_ENDED_MESSAGE, SERVICE_ENDED_MODE, SERVICE_ENDED_THANKS } from './support/service-ended'

test.skip(!SERVICE_ENDED_MODE, 'サービス終了状態でのみ実行する')

test.describe('サービス終了画面', () => {
  test('主要な導線でお礼メッセージが表示される', async ({ page }) => {
    for (const route of ['/', '/login', '/dashboard', '/patients']) {
      await page.goto(route)
      await expect(page.getByText(SERVICE_ENDED_MESSAGE)).toBeVisible()
      await expect(page.getByText(SERVICE_ENDED_THANKS)).toBeVisible()
    }
  })

  test('職員ログインフォームは表示されない', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByText(SERVICE_ENDED_MESSAGE)).toBeVisible()
    await expect(page.getByLabel('職員ID')).toHaveCount(0)
    await expect(page.getByLabel('パスワード', { exact: true })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'ログイン' })).toHaveCount(0)
  })
})
