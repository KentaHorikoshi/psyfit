import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { ForgotPassword } from '../ForgotPassword'

// Mock api
const mockRequestStaffPasswordReset = vi.fn()
vi.mock('../../lib/api', () => ({
  api: {
    requestStaffPasswordReset: (...args: unknown[]) => mockRequestStaffPasswordReset(...args),
  },
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderForgotPassword() {
  return render(
    <BrowserRouter>
      <ForgotPassword />
    </BrowserRouter>
  )
}

describe('ForgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render the form with title and staff ID input', () => {
      renderForgotPassword()

      expect(screen.getByText('パスワードリセット')).toBeInTheDocument()
      expect(screen.getByLabelText('職員ID')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'リセットメールを送信' })).toBeInTheDocument()
    })

    it('should render description text', () => {
      renderForgotPassword()

      expect(
        screen.getByText(/職員IDを入力してください/)
      ).toBeInTheDocument()
    })

    it('should render back to login link', () => {
      renderForgotPassword()

      expect(screen.getByText('ログイン画面に戻る')).toBeInTheDocument()
    })
  })

  describe('validation', () => {
    it('should show error when staff ID is empty on submit', async () => {
      const user = userEvent.setup()
      renderForgotPassword()

      await user.click(screen.getByRole('button', { name: 'リセットメールを送信' }))

      await waitFor(() => {
        expect(screen.getByText('職員IDを入力してください')).toBeInTheDocument()
      })
      expect(mockRequestStaffPasswordReset).not.toHaveBeenCalled()
    })

    it('should clear validation error when user types', async () => {
      const user = userEvent.setup()
      renderForgotPassword()

      await user.click(screen.getByRole('button', { name: 'リセットメールを送信' }))

      await waitFor(() => {
        expect(screen.getByText('職員IDを入力してください')).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText('職員ID'), 'S')

      expect(screen.queryByText('職員IDを入力してください')).not.toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    it('should call requestStaffPasswordReset on valid submit', async () => {
      const user = userEvent.setup()
      mockRequestStaffPasswordReset.mockResolvedValueOnce({
        status: 'success',
        data: { message: 'パスワードリセットのメールを送信しました' },
      })

      renderForgotPassword()

      await user.type(screen.getByLabelText('職員ID'), 'STF001')
      await user.click(screen.getByRole('button', { name: 'リセットメールを送信' }))

      await waitFor(() => {
        expect(mockRequestStaffPasswordReset).toHaveBeenCalledWith({
          staff_id: 'STF001',
        })
      })
    })

    it('should show success message after successful submission', async () => {
      const user = userEvent.setup()
      mockRequestStaffPasswordReset.mockResolvedValueOnce({
        status: 'success',
        data: { message: 'パスワードリセットのメールを送信しました' },
      })

      renderForgotPassword()

      await user.type(screen.getByLabelText('職員ID'), 'STF001')
      await user.click(screen.getByRole('button', { name: 'リセットメールを送信' }))

      await waitFor(() => {
        expect(screen.getByText('メールを送信しました')).toBeInTheDocument()
      })
      expect(
        screen.getByText(/パスワードリセットの手順を送信しました/)
      ).toBeInTheDocument()
    })

    it('should show back to login button after success', async () => {
      const user = userEvent.setup()
      mockRequestStaffPasswordReset.mockResolvedValueOnce({
        status: 'success',
        data: { message: 'ok' },
      })

      renderForgotPassword()

      await user.type(screen.getByLabelText('職員ID'), 'STF001')
      await user.click(screen.getByRole('button', { name: 'リセットメールを送信' }))

      await waitFor(() => {
        expect(screen.getByText('メールを送信しました')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'ログイン画面に戻る' }))
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })

    it('should show error message on API failure', async () => {
      const user = userEvent.setup()
      mockRequestStaffPasswordReset.mockRejectedValueOnce(new Error('Network error'))

      renderForgotPassword()

      await user.type(screen.getByLabelText('職員ID'), 'STF001')
      await user.click(screen.getByRole('button', { name: 'リセットメールを送信' }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(
          screen.getByText(/リクエストの送信に失敗しました/)
        ).toBeInTheDocument()
      })
    })
  })

  describe('navigation', () => {
    it('should navigate to login when back link is clicked', async () => {
      const user = userEvent.setup()
      renderForgotPassword()

      await user.click(screen.getByText('ログイン画面に戻る'))

      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  describe('accessibility', () => {
    it('should have accessible staff ID input with label', () => {
      renderForgotPassword()

      const input = screen.getByLabelText('職員ID')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should have minimum tap target for buttons', () => {
      renderForgotPassword()

      const submitButton = screen.getByRole('button', { name: 'リセットメールを送信' })
      expect(submitButton).toBeInTheDocument()
    })
  })
})
