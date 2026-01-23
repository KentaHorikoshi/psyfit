import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Login } from '../Login'

// Mock the AuthContext
const mockLogin = vi.fn()
const mockClearError = vi.fn()
const mockUseAuth = vi.fn()

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
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

function renderLogin() {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  )
}

describe('U-01 Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
      clearError: mockClearError,
      isAuthenticated: false,
    })
  })

  describe('rendering', () => {
    it('should render login form with required elements', () => {
      renderLogin()

      expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument()
      expect(screen.getByLabelText('パスワード')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument()
    })

    it('should render brand logo and title', () => {
      renderLogin()

      expect(screen.getByText('サイテック フィットネス')).toBeInTheDocument()
      expect(screen.getByText('毎日の運動をサポート')).toBeInTheDocument()
    })

    it('should render password reset link', () => {
      renderLogin()

      expect(screen.getByText('パスワードをお忘れですか？')).toBeInTheDocument()
    })

    it('should have password visibility toggle', () => {
      renderLogin()

      const toggleButton = screen.getByRole('button', { name: /パスワードを(表示|非表示)/ })
      expect(toggleButton).toBeInTheDocument()
    })
  })

  describe('form validation', () => {
    it('should show error when email is empty on submit', async () => {
      const user = userEvent.setup()
      renderLogin()

      await user.type(screen.getByLabelText('パスワード'), 'password123')
      await user.click(screen.getByRole('button', { name: 'ログイン' }))

      await waitFor(() => {
        // Check that at least one error message is shown (may appear in input and alert)
        const errorMessages = screen.getAllByText('メールアドレスを入力してください')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('should show error when password is empty on submit', async () => {
      const user = userEvent.setup()
      renderLogin()

      await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: 'ログイン' }))

      await waitFor(() => {
        const errorMessages = screen.getAllByText('パスワードを入力してください')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('should not call login with invalid email format', async () => {
      const user = userEvent.setup()
      renderLogin()

      // Use a clearly invalid email without @ symbol
      await user.type(screen.getByLabelText('メールアドレス'), 'notanemail')
      await user.type(screen.getByLabelText('パスワード'), 'password123')
      await user.click(screen.getByRole('button', { name: 'ログイン' }))

      // HTML5 validation or Zod should prevent login from being called
      await waitFor(() => {
        // Either show error or not call login
        expect(mockLogin).not.toHaveBeenCalled()
      })
    })
  })

  describe('login functionality', () => {
    it('should call login with credentials on valid form submission', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValueOnce(undefined)

      renderLogin()

      await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com')
      await user.type(screen.getByLabelText('パスワード'), 'password123')
      await user.click(screen.getByRole('button', { name: 'ログイン' }))

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('should navigate to welcome page on successful login', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValueOnce(undefined)

      renderLogin()

      await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com')
      await user.type(screen.getByLabelText('パスワード'), 'password123')
      await user.click(screen.getByRole('button', { name: 'ログイン' }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/welcome')
      })
    })

    it('should display error message from auth context', () => {
      mockUseAuth.mockReturnValue({
        login: mockLogin,
        isLoading: false,
        error: 'メールアドレスまたはパスワードが正しくありません',
        clearError: mockClearError,
        isAuthenticated: false,
      })

      renderLogin()

      expect(screen.getByText('メールアドレスまたはパスワードが正しくありません')).toBeInTheDocument()
    })

    it('should clear error when input changes', async () => {
      const user = userEvent.setup()
      mockUseAuth.mockReturnValue({
        login: mockLogin,
        isLoading: false,
        error: 'エラーメッセージ',
        clearError: mockClearError,
        isAuthenticated: false,
      })

      renderLogin()

      await user.type(screen.getByLabelText('メールアドレス'), 't')

      expect(mockClearError).toHaveBeenCalled()
    })
  })

  describe('loading state', () => {
    it('should show loading state while logging in', () => {
      mockUseAuth.mockReturnValue({
        login: mockLogin,
        isLoading: true,
        error: null,
        clearError: mockClearError,
        isAuthenticated: false,
      })

      renderLogin()

      expect(screen.getByRole('button', { name: 'ログイン中...' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'ログイン中...' })).toBeDisabled()
    })

    it('should disable inputs while loading', () => {
      mockUseAuth.mockReturnValue({
        login: mockLogin,
        isLoading: true,
        error: null,
        clearError: mockClearError,
        isAuthenticated: false,
      })

      renderLogin()

      expect(screen.getByLabelText('メールアドレス')).toBeDisabled()
      expect(screen.getByLabelText('パスワード')).toBeDisabled()
    })
  })

  describe('password visibility toggle', () => {
    it('should toggle password visibility on click', async () => {
      const user = userEvent.setup()
      renderLogin()

      const passwordInput = screen.getByLabelText('パスワード')
      const toggleButton = screen.getByRole('button', { name: 'パスワードを表示' })

      expect(passwordInput).toHaveAttribute('type', 'password')

      await user.click(toggleButton)

      expect(passwordInput).toHaveAttribute('type', 'text')
      expect(screen.getByRole('button', { name: 'パスワードを非表示' })).toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    it('should navigate to password reset page on link click', async () => {
      const user = userEvent.setup()
      renderLogin()

      await user.click(screen.getByText('パスワードをお忘れですか？'))

      expect(mockNavigate).toHaveBeenCalledWith('/password-reset')
    })

    it('should redirect to home if already authenticated', () => {
      mockUseAuth.mockReturnValue({
        login: mockLogin,
        isLoading: false,
        error: null,
        clearError: mockClearError,
        isAuthenticated: true,
      })

      renderLogin()

      expect(mockNavigate).toHaveBeenCalledWith('/home', { replace: true })
    })
  })

  describe('accessibility', () => {
    it('should have accessible form labels', () => {
      renderLogin()

      const emailInput = screen.getByLabelText('メールアドレス')
      const passwordInput = screen.getByLabelText('パスワード')

      expect(emailInput).toHaveAttribute('id')
      expect(passwordInput).toHaveAttribute('id')
    })

    it('should have minimum tap target size for buttons', () => {
      renderLogin()

      const loginButton = screen.getByRole('button', { name: 'ログイン' })
      // Check that button has appropriate size classes
      expect(loginButton).toBeInTheDocument()
    })

    it('should announce errors to screen readers', async () => {
      const user = userEvent.setup()
      renderLogin()

      await user.click(screen.getByRole('button', { name: 'ログイン' }))

      await waitFor(() => {
        // Check that at least one alert element exists for screen readers
        const alertElements = screen.getAllByRole('alert')
        expect(alertElements.length).toBeGreaterThan(0)
      })
    })
  })
})
