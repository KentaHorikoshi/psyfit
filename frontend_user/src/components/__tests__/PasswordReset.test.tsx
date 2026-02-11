import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { PasswordReset } from '../PasswordReset'

// Mock fetch API
const mockFetch = vi.fn()
global.fetch = mockFetch

// Helper to render with router
function renderWithRouter(initialRoute = '/password-reset') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/password-reset" element={<PasswordReset />} />
        <Route path="/password-reset/:token" element={<PasswordReset />} />
        <Route path="/login" element={<div data-testid="login-page">ログイン画面</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('PasswordReset', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('メールアドレス入力画面', () => {
    describe('レンダリング', () => {
      it('タイトルが表示される', () => {
        renderWithRouter()
        expect(screen.getByRole('heading', { name: 'パスワードリセット' })).toBeInTheDocument()
      })

      it('説明テキストが表示される', () => {
        renderWithRouter()
        expect(screen.getByText(/登録されているメールアドレスを入力してください/)).toBeInTheDocument()
      })

      it('メールアドレス入力フィールドが表示される', () => {
        renderWithRouter()
        expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument()
      })

      it('送信ボタンが表示される', () => {
        renderWithRouter()
        expect(screen.getByRole('button', { name: 'リセットリンクを送信' })).toBeInTheDocument()
      })

      it('ログイン画面へ戻るリンクが表示される', () => {
        renderWithRouter()
        expect(screen.getByRole('link', { name: 'ログイン画面に戻る' })).toBeInTheDocument()
      })
    })

    describe('バリデーション', () => {
      it('空のメールアドレスでエラーが表示される', async () => {
        renderWithRouter()

        const submitButton = screen.getByRole('button', { name: 'リセットリンクを送信' })
        fireEvent.click(submitButton)

        await waitFor(() => {
          // エラーメッセージがInputとアラートボックスに表示される
          const errors = screen.getAllByText('メールアドレスを入力してください')
          expect(errors.length).toBeGreaterThanOrEqual(1)
        })
      })

      it('無効なメールアドレス形式でエラーが表示される', async () => {
        renderWithRouter()

        const emailInput = screen.getByLabelText('メールアドレス')
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

        const form = emailInput.closest('form')!
        fireEvent.submit(form)

        await waitFor(() => {
          const errors = screen.getAllByText('メールアドレスの形式が正しくありません')
          expect(errors.length).toBeGreaterThanOrEqual(1)
        })
      })

      it('入力時にバリデーションエラーがクリアされる', async () => {
        renderWithRouter()

        // Trigger validation error
        const submitButton = screen.getByRole('button', { name: 'リセットリンクを送信' })
        fireEvent.click(submitButton)

        await waitFor(() => {
          const errors = screen.getAllByText('メールアドレスを入力してください')
          expect(errors.length).toBeGreaterThanOrEqual(1)
        })

        // Type in email field - error should clear
        const emailInput = screen.getByLabelText('メールアドレス')
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

        expect(screen.queryByText('メールアドレスを入力してください')).not.toBeInTheDocument()
      })
    })

    describe('API連携', () => {
      it('有効なメールアドレスでAPIが呼ばれる', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            status: 'success',
            data: { message: 'パスワードリセットのメールを送信しました' }
          })
        })

        renderWithRouter()

        const emailInput = screen.getByLabelText('メールアドレス')
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

        const submitButton = screen.getByRole('button', { name: 'リセットリンクを送信' })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(mockFetch).toHaveBeenCalledWith(
            '/api/v1/auth/password_reset_request',
            expect.objectContaining({
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: 'test@example.com' })
            })
          )
        })
      })

      it('API成功時に完了メッセージが表示される', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            status: 'success',
            data: { message: 'パスワードリセットのメールを送信しました' }
          })
        })

        renderWithRouter()

        const emailInput = screen.getByLabelText('メールアドレス')
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

        const submitButton = screen.getByRole('button', { name: 'リセットリンクを送信' })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(screen.getByText('メールを送信しました')).toBeInTheDocument()
        })

        expect(screen.getByText(/test@example.com にパスワードリセット用のリンクを送信しました/)).toBeInTheDocument()
      })

      it('APIエラー時にエラーメッセージが表示される', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({
            status: 'error',
            message: 'サーバーエラーが発生しました'
          })
        })

        renderWithRouter()

        const emailInput = screen.getByLabelText('メールアドレス')
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

        const submitButton = screen.getByRole('button', { name: 'リセットリンクを送信' })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(screen.getByRole('alert')).toHaveTextContent('サーバーエラーが発生しました')
        })
      })
    })

    describe('ローディング状態', () => {
      it('送信中はボタンがローディング状態になる', async () => {
        mockFetch.mockImplementationOnce(() => new Promise(() => {})) // Never resolves

        renderWithRouter()

        const emailInput = screen.getByLabelText('メールアドレス')
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

        const submitButton = screen.getByRole('button', { name: 'リセットリンクを送信' })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(screen.getByRole('button', { name: '送信中...' })).toBeDisabled()
        })
      })

      it('送信中は入力フィールドが無効になる', async () => {
        mockFetch.mockImplementationOnce(() => new Promise(() => {}))

        renderWithRouter()

        const emailInput = screen.getByLabelText('メールアドレス')
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

        const submitButton = screen.getByRole('button', { name: 'リセットリンクを送信' })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(emailInput).toBeDisabled()
        })
      })
    })
  })

  describe('新パスワード設定画面', () => {
    const tokenRoute = '/password-reset/valid-token-123'

    describe('レンダリング', () => {
      it('タイトルが表示される', () => {
        renderWithRouter(tokenRoute)
        expect(screen.getByRole('heading', { name: '新しいパスワードを設定' })).toBeInTheDocument()
      })

      it('新しいパスワード入力フィールドが表示される', () => {
        renderWithRouter(tokenRoute)
        expect(screen.getByLabelText('新しいパスワード')).toBeInTheDocument()
      })

      it('確認用パスワード入力フィールドが表示される', () => {
        renderWithRouter(tokenRoute)
        expect(screen.getByLabelText('パスワード（確認）')).toBeInTheDocument()
      })

      it('設定ボタンが表示される', () => {
        renderWithRouter(tokenRoute)
        expect(screen.getByRole('button', { name: 'パスワードを設定' })).toBeInTheDocument()
      })
    })

    describe('バリデーション', () => {
      it('空のパスワードでエラーが表示される', async () => {
        renderWithRouter(tokenRoute)

        const submitButton = screen.getByRole('button', { name: 'パスワードを設定' })
        fireEvent.click(submitButton)

        await waitFor(() => {
          const errors = screen.getAllByText('パスワードを入力してください')
          expect(errors.length).toBeGreaterThanOrEqual(1)
        })
      })

      it('8文字未満のパスワードでエラーが表示される', async () => {
        renderWithRouter(tokenRoute)

        const passwordInput = screen.getByLabelText('新しいパスワード')
        fireEvent.change(passwordInput, { target: { value: 'short' } })

        const confirmInput = screen.getByLabelText('パスワード（確認）')
        fireEvent.change(confirmInput, { target: { value: 'short' } })

        const submitButton = screen.getByRole('button', { name: 'パスワードを設定' })
        fireEvent.click(submitButton)

        await waitFor(() => {
          const errors = screen.getAllByText('パスワードは8文字以上で入力してください')
          expect(errors.length).toBeGreaterThanOrEqual(1)
        })
      })

      it('パスワードが一致しない場合エラーが表示される', async () => {
        renderWithRouter(tokenRoute)

        const passwordInput = screen.getByLabelText('新しいパスワード')
        fireEvent.change(passwordInput, { target: { value: 'password123' } })

        const confirmInput = screen.getByLabelText('パスワード（確認）')
        fireEvent.change(confirmInput, { target: { value: 'differentpassword' } })

        const submitButton = screen.getByRole('button', { name: 'パスワードを設定' })
        fireEvent.click(submitButton)

        await waitFor(() => {
          const errors = screen.getAllByText('パスワードが一致しません')
          expect(errors.length).toBeGreaterThanOrEqual(1)
        })
      })

      it('入力時にバリデーションエラーがクリアされる', async () => {
        renderWithRouter(tokenRoute)

        // Trigger validation error
        const submitButton = screen.getByRole('button', { name: 'パスワードを設定' })
        fireEvent.click(submitButton)

        await waitFor(() => {
          const errors = screen.getAllByText('パスワードを入力してください')
          expect(errors.length).toBeGreaterThanOrEqual(1)
        })

        // Type in password field - error should clear
        const passwordInput = screen.getByLabelText('新しいパスワード')
        fireEvent.change(passwordInput, { target: { value: 'newpassword123' } })

        expect(screen.queryByText('パスワードを入力してください')).not.toBeInTheDocument()
      })
    })

    describe('パスワード表示/非表示', () => {
      it('パスワード表示ボタンをクリックすると表示状態が切り替わる', () => {
        renderWithRouter(tokenRoute)

        const passwordInput = screen.getByLabelText('新しいパスワード')
        expect(passwordInput).toHaveAttribute('type', 'password')

        const toggleButton = screen.getAllByRole('button', { name: /パスワードを(表示|非表示)/ })[0]!
        fireEvent.click(toggleButton)

        expect(passwordInput).toHaveAttribute('type', 'text')
      })
    })

    describe('API連携', () => {
      it('有効なパスワードでAPIが呼ばれる', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            status: 'success',
            data: { message: 'パスワードが更新されました' }
          })
        })

        renderWithRouter(tokenRoute)

        const passwordInput = screen.getByLabelText('新しいパスワード')
        fireEvent.change(passwordInput, { target: { value: 'newpassword123' } })

        const confirmInput = screen.getByLabelText('パスワード（確認）')
        fireEvent.change(confirmInput, { target: { value: 'newpassword123' } })

        const submitButton = screen.getByRole('button', { name: 'パスワードを設定' })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(mockFetch).toHaveBeenCalledWith(
            '/api/v1/auth/password_reset',
            expect.objectContaining({
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                token: 'valid-token-123',
                new_password: 'newpassword123',
                new_password_confirmation: 'newpassword123'
              })
            })
          )
        })
      })

      it('API成功時に完了メッセージが表示される', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            status: 'success',
            data: { message: 'パスワードが更新されました' }
          })
        })

        renderWithRouter(tokenRoute)

        const passwordInput = screen.getByLabelText('新しいパスワード')
        fireEvent.change(passwordInput, { target: { value: 'newpassword123' } })

        const confirmInput = screen.getByLabelText('パスワード（確認）')
        fireEvent.change(confirmInput, { target: { value: 'newpassword123' } })

        const submitButton = screen.getByRole('button', { name: 'パスワードを設定' })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(screen.getByText('パスワードを変更しました')).toBeInTheDocument()
        })

        expect(screen.getByRole('link', { name: 'ログイン画面へ' })).toBeInTheDocument()
      })

      it('トークン無効エラーが表示される', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({
            status: 'error',
            message: 'トークンが無効または期限切れです'
          })
        })

        renderWithRouter(tokenRoute)

        const passwordInput = screen.getByLabelText('新しいパスワード')
        fireEvent.change(passwordInput, { target: { value: 'newpassword123' } })

        const confirmInput = screen.getByLabelText('パスワード（確認）')
        fireEvent.change(confirmInput, { target: { value: 'newpassword123' } })

        const submitButton = screen.getByRole('button', { name: 'パスワードを設定' })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(screen.getByRole('alert')).toHaveTextContent('トークンが無効または期限切れです')
        })
      })

      it('パスワードポリシーエラーが表示される', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({
            status: 'error',
            message: 'パスワードの更新に失敗しました',
            errors: { password: ['2種類以上の文字タイプを含む必要があります'] }
          })
        })

        renderWithRouter(tokenRoute)

        const passwordInput = screen.getByLabelText('新しいパスワード')
        fireEvent.change(passwordInput, { target: { value: 'simplepassword' } })

        const confirmInput = screen.getByLabelText('パスワード（確認）')
        fireEvent.change(confirmInput, { target: { value: 'simplepassword' } })

        const submitButton = screen.getByRole('button', { name: 'パスワードを設定' })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(screen.getByRole('alert')).toBeInTheDocument()
        })
      })
    })

    describe('ローディング状態', () => {
      it('送信中はボタンがローディング状態になる', async () => {
        mockFetch.mockImplementationOnce(() => new Promise(() => {}))

        renderWithRouter(tokenRoute)

        const passwordInput = screen.getByLabelText('新しいパスワード')
        fireEvent.change(passwordInput, { target: { value: 'newpassword123' } })

        const confirmInput = screen.getByLabelText('パスワード（確認）')
        fireEvent.change(confirmInput, { target: { value: 'newpassword123' } })

        const submitButton = screen.getByRole('button', { name: 'パスワードを設定' })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(screen.getByRole('button', { name: '設定中...' })).toBeDisabled()
        })
      })
    })
  })

  describe('アクセシビリティ', () => {
    it('フォーム要素にラベルが関連付けられている', () => {
      renderWithRouter()

      const emailInput = screen.getByLabelText('メールアドレス')
      expect(emailInput).toHaveAttribute('id')
    })

    it('エラーメッセージにrole="alert"が設定されている', async () => {
      renderWithRouter()

      const submitButton = screen.getByRole('button', { name: 'リセットリンクを送信' })
      fireEvent.click(submitButton)

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert')
        expect(alerts.length).toBeGreaterThanOrEqual(1)
      })
    })

    it('タップ領域が44px以上', () => {
      renderWithRouter()

      const submitButton = screen.getByRole('button', { name: 'リセットリンクを送信' })
      expect(submitButton).toHaveClass('min-h-[44px]')
    })

    it('新しいパスワード画面でもフォーム要素にラベルが関連付けられている', () => {
      renderWithRouter('/password-reset/token-123')

      const passwordInput = screen.getByLabelText('新しいパスワード')
      expect(passwordInput).toHaveAttribute('id')

      const confirmInput = screen.getByLabelText('パスワード（確認）')
      expect(confirmInput).toHaveAttribute('id')
    })
  })
})
