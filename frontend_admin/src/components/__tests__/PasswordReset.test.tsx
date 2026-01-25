import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { PasswordReset } from '../PasswordReset'
import { AuthContext, type AuthContextType } from '../../contexts/AuthContext'
import type { Staff } from '../../lib/api-types'
import { api } from '../../lib/api'

// Mock API
vi.mock('../../lib/api', () => ({
  api: {
    changePassword: vi.fn(),
  },
}))

const mockStaff: Staff = {
  id: 'staff1',
  staff_id: 'STF001',
  name: 'テスト スタッフ',
  role: 'staff',
  department: 'リハビリテーション科',
}

function createMockAuthContext(
  staff: Staff | null,
  logout: () => Promise<void> = vi.fn()
): AuthContextType {
  return {
    staff,
    isAuthenticated: staff !== null,
    isLoading: false,
    error: null,
    login: vi.fn(),
    logout,
    clearError: vi.fn(),
  }
}

function renderWithAuth(
  staff: Staff | null = mockStaff,
  logout: () => Promise<void> = vi.fn()
) {
  const authContext = createMockAuthContext(staff, logout)

  return {
    ...render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <PasswordReset />
        </AuthContext.Provider>
      </BrowserRouter>
    ),
    authContext,
  }
}

describe('S-09 PasswordReset', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render page title', () => {
      renderWithAuth()

      expect(screen.getByRole('heading', { name: 'パスワード変更' })).toBeInTheDocument()
    })

    it('should render current password input', () => {
      renderWithAuth()

      expect(screen.getByLabelText(/現在のパスワード/)).toBeInTheDocument()
    })

    it('should render new password input', () => {
      renderWithAuth()

      expect(screen.getByLabelText(/^新しいパスワード \*/)).toBeInTheDocument()
    })

    it('should render confirm password input', () => {
      renderWithAuth()

      expect(screen.getByLabelText(/新しいパスワード（確認） \*/)).toBeInTheDocument()
    })

    it('should render password complexity indicators', () => {
      renderWithAuth()

      expect(screen.getByText('8文字以上')).toBeInTheDocument()
      expect(screen.getByText('2種類以上の文字')).toBeInTheDocument()
    })

    it('should render change password button', () => {
      renderWithAuth()

      expect(screen.getByRole('button', { name: 'パスワードを変更' })).toBeInTheDocument()
    })

    it('should render description text', () => {
      renderWithAuth()

      expect(screen.getByText(/自分のパスワードを変更できます/)).toBeInTheDocument()
    })
  })

  describe('password complexity indicator', () => {
    it('should show length requirement as unmet initially', () => {
      renderWithAuth()

      const lengthIndicator = screen.getByTestId('password-length-check')
      expect(lengthIndicator).toHaveClass('text-gray-500')
    })

    it('should show length requirement as met when 8+ characters', async () => {
      const user = userEvent.setup()
      renderWithAuth()

      const newPasswordInput = screen.getByLabelText(/^新しいパスワード \*/)
      await user.type(newPasswordInput, '12345678')

      await waitFor(() => {
        const lengthIndicator = screen.getByTestId('password-length-check')
        expect(lengthIndicator).toHaveClass('text-green-600')
      })
    })

    it('should show complexity requirement as unmet with single character type', async () => {
      const user = userEvent.setup()
      renderWithAuth()

      const newPasswordInput = screen.getByLabelText(/^新しいパスワード \*/)
      await user.type(newPasswordInput, 'abcdefgh')

      await waitFor(() => {
        const complexityIndicator = screen.getByTestId('password-complexity-check')
        expect(complexityIndicator).toHaveClass('text-gray-500')
      })
    })

    it('should show complexity requirement as met with 2+ character types', async () => {
      const user = userEvent.setup()
      renderWithAuth()

      const newPasswordInput = screen.getByLabelText(/^新しいパスワード \*/)
      await user.type(newPasswordInput, 'abc123')

      await waitFor(() => {
        const complexityIndicator = screen.getByTestId('password-complexity-check')
        expect(complexityIndicator).toHaveClass('text-green-600')
      })
    })
  })

  describe('password match validation', () => {
    it('should show match indicator when passwords match', async () => {
      const user = userEvent.setup()
      renderWithAuth()

      const newPasswordInput = screen.getByLabelText(/^新しいパスワード \*/)
      const confirmPasswordInput = screen.getByLabelText(/新しいパスワード（確認） \*/)

      await user.type(newPasswordInput, 'Password123')
      await user.type(confirmPasswordInput, 'Password123')

      await waitFor(() => {
        const matchIndicator = screen.getByTestId('password-match-check')
        expect(matchIndicator).toHaveClass('text-green-600')
      })
    })

    it('should show mismatch indicator when passwords do not match', async () => {
      const user = userEvent.setup()
      renderWithAuth()

      const newPasswordInput = screen.getByLabelText(/^新しいパスワード \*/)
      const confirmPasswordInput = screen.getByLabelText(/新しいパスワード（確認） \*/)

      await user.type(newPasswordInput, 'Password123')
      await user.type(confirmPasswordInput, 'Different456')

      await waitFor(() => {
        const matchIndicator = screen.getByTestId('password-match-check')
        expect(matchIndicator).toHaveClass('text-gray-500')
      })
    })
  })

  describe('form validation', () => {
    it('should show error when current password is empty', async () => {
      const user = userEvent.setup()
      renderWithAuth()

      const submitButton = screen.getByRole('button', { name: 'パスワードを変更' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('現在のパスワードを入力してください')).toBeInTheDocument()
      })
    })

    it('should show error when new password does not meet requirements', async () => {
      const user = userEvent.setup()
      renderWithAuth()

      await user.type(screen.getByLabelText(/現在のパスワード/), 'OldPassword123')
      await user.type(screen.getByLabelText(/^新しいパスワード \*/), 'short')
      await user.type(screen.getByLabelText(/新しいパスワード（確認） \*/), 'short')

      const submitButton = screen.getByRole('button', { name: 'パスワードを変更' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText('パスワードは8文字以上、2種類以上の文字を含めてください')
        ).toBeInTheDocument()
      })
    })

    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup()
      renderWithAuth()

      await user.type(screen.getByLabelText(/現在のパスワード/), 'OldPassword123')
      await user.type(screen.getByLabelText(/^新しいパスワード \*/), 'NewPassword123')
      await user.type(screen.getByLabelText(/新しいパスワード（確認） \*/), 'DifferentPass456')

      const submitButton = screen.getByRole('button', { name: 'パスワードを変更' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('パスワードが一致しません')).toBeInTheDocument()
      })
    })

    it('should clear error when user starts typing', async () => {
      const user = userEvent.setup()
      renderWithAuth()

      const submitButton = screen.getByRole('button', { name: 'パスワードを変更' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('現在のパスワードを入力してください')).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/現在のパスワード/), 'a')

      await waitFor(() => {
        expect(
          screen.queryByText('現在のパスワードを入力してください')
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('form submission', () => {
    it('should call API with correct data on valid submission', async () => {
      const user = userEvent.setup()
      vi.mocked(api.changePassword).mockResolvedValue({
        status: 'success',
        data: { message: 'パスワードを変更しました' },
      })

      renderWithAuth()

      await user.type(screen.getByLabelText(/現在のパスワード/), 'OldPassword123')
      await user.type(screen.getByLabelText(/^新しいパスワード \*/), 'NewPassword456')
      await user.type(screen.getByLabelText(/新しいパスワード（確認） \*/), 'NewPassword456')

      const submitButton = screen.getByRole('button', { name: 'パスワードを変更' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(api.changePassword).toHaveBeenCalledWith({
          current_password: 'OldPassword123',
          new_password: 'NewPassword456',
          new_password_confirmation: 'NewPassword456',
        })
      })
    })

    it('should show success message after successful password change', async () => {
      const user = userEvent.setup()
      vi.mocked(api.changePassword).mockResolvedValue({
        status: 'success',
        data: { message: 'パスワードを変更しました' },
      })

      renderWithAuth()

      await user.type(screen.getByLabelText(/現在のパスワード/), 'OldPassword123')
      await user.type(screen.getByLabelText(/^新しいパスワード \*/), 'NewPassword456')
      await user.type(screen.getByLabelText(/新しいパスワード（確認） \*/), 'NewPassword456')

      const submitButton = screen.getByRole('button', { name: 'パスワードを変更' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/パスワードを変更しました/)).toBeInTheDocument()
      })
    })

    it('should call logout and redirect after success', async () => {
      const user = userEvent.setup()
      const mockLogout = vi.fn().mockResolvedValue(undefined)
      vi.mocked(api.changePassword).mockResolvedValue({
        status: 'success',
        data: { message: 'パスワードを変更しました' },
      })

      vi.useFakeTimers({ shouldAdvanceTime: true })

      renderWithAuth(mockStaff, mockLogout)

      await user.type(screen.getByLabelText(/現在のパスワード/), 'OldPassword123')
      await user.type(screen.getByLabelText(/^新しいパスワード \*/), 'NewPassword456')
      await user.type(screen.getByLabelText(/新しいパスワード（確認） \*/), 'NewPassword456')

      const submitButton = screen.getByRole('button', { name: 'パスワードを変更' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/パスワードを変更しました/)).toBeInTheDocument()
      })

      // Wait for auto logout
      vi.advanceTimersByTime(2000)

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled()
      })

      vi.useRealTimers()
    })

    it('should show error message on API failure', async () => {
      const user = userEvent.setup()
      vi.mocked(api.changePassword).mockRejectedValue(
        new Error('現在のパスワードが正しくありません')
      )

      renderWithAuth()

      await user.type(screen.getByLabelText(/現在のパスワード/), 'WrongPassword')
      await user.type(screen.getByLabelText(/^新しいパスワード \*/), 'NewPassword456')
      await user.type(screen.getByLabelText(/新しいパスワード（確認） \*/), 'NewPassword456')

      const submitButton = screen.getByRole('button', { name: 'パスワードを変更' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('現在のパスワードが正しくありません')).toBeInTheDocument()
      })
    })

    it('should disable button while submitting', async () => {
      const user = userEvent.setup()
      vi.mocked(api.changePassword).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ status: 'success', data: { message: 'OK' } }),
              100
            )
          )
      )

      renderWithAuth()

      await user.type(screen.getByLabelText(/現在のパスワード/), 'OldPassword123')
      await user.type(screen.getByLabelText(/^新しいパスワード \*/), 'NewPassword456')
      await user.type(screen.getByLabelText(/新しいパスワード（確認） \*/), 'NewPassword456')

      const submitButton = screen.getByRole('button', { name: 'パスワードを変更' })
      await user.click(submitButton)

      expect(submitButton).toBeDisabled()
      expect(screen.getByText('変更中...')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have accessible form labels', () => {
      renderWithAuth()

      const currentPasswordInput = screen.getByLabelText(/現在のパスワード/)
      expect(currentPasswordInput).toHaveAccessibleName()

      const newPasswordInput = screen.getByLabelText(/^新しいパスワード \*/)
      expect(newPasswordInput).toHaveAccessibleName()

      const confirmPasswordInput = screen.getByLabelText(/新しいパスワード（確認） \*/)
      expect(confirmPasswordInput).toHaveAccessibleName()
    })

    it('should have minimum tap target size for button', () => {
      renderWithAuth()

      const submitButton = screen.getByRole('button', { name: 'パスワードを変更' })
      expect(submitButton).toHaveClass('min-h-[44px]')
    })

    it('should mark error messages with role alert', async () => {
      const user = userEvent.setup()
      renderWithAuth()

      const submitButton = screen.getByRole('button', { name: 'パスワードを変更' })
      await user.click(submitButton)

      await waitFor(() => {
        const errorAlerts = screen.getAllByRole('alert')
        expect(errorAlerts.length).toBeGreaterThan(0)
      })
    })

    it('should have aria-invalid on invalid inputs', async () => {
      const user = userEvent.setup()
      renderWithAuth()

      const submitButton = screen.getByRole('button', { name: 'パスワードを変更' })
      await user.click(submitButton)

      await waitFor(() => {
        const currentPasswordInput = screen.getByLabelText(/現在のパスワード/)
        expect(currentPasswordInput).toHaveAttribute('aria-invalid', 'true')
      })
    })
  })

  describe('security', () => {
    it('should use password input type for all password fields', () => {
      renderWithAuth()

      const currentPasswordInput = screen.getByLabelText(/現在のパスワード/)
      expect(currentPasswordInput).toHaveAttribute('type', 'password')

      const newPasswordInput = screen.getByLabelText(/^新しいパスワード \*/)
      expect(newPasswordInput).toHaveAttribute('type', 'password')

      const confirmPasswordInput = screen.getByLabelText(/新しいパスワード（確認） \*/)
      expect(confirmPasswordInput).toHaveAttribute('type', 'password')
    })

    it('should have autocomplete attributes for password managers', () => {
      renderWithAuth()

      const currentPasswordInput = screen.getByLabelText(/現在のパスワード/)
      expect(currentPasswordInput).toHaveAttribute('autocomplete', 'current-password')

      const newPasswordInput = screen.getByLabelText(/^新しいパスワード \*/)
      expect(newPasswordInput).toHaveAttribute('autocomplete', 'new-password')

      const confirmPasswordInput = screen.getByLabelText(/新しいパスワード（確認） \*/)
      expect(confirmPasswordInput).toHaveAttribute('autocomplete', 'new-password')
    })
  })
})
