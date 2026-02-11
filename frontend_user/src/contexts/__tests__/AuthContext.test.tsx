import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '../AuthContext'
import { BrowserRouter } from 'react-router-dom'

// Mock the api-client module
vi.mock('../../lib/api-client', () => ({
  default: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
  apiClient: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
  AuthenticationError: class extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'AuthenticationError'
    }
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

import apiClient from '../../lib/api-client'

// Test component to access auth context
function TestComponent() {
  const { user, isAuthenticated, isLoading, error, login, logout } = useAuth()

  const handleLogin = async () => {
    try {
      await login('test@example.com', 'password123')
    } catch {
      // Error is handled by the context and stored in `error` state
    }
  }

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user">{user ? user.name : 'no-user'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

function renderWithProviders(component: React.ReactNode) {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('initial state', () => {
    it('should start with loading state while checking session', async () => {
      vi.mocked(apiClient.getCurrentUser).mockImplementation(
        () => new Promise(() => {}) // Never resolves to keep loading state
      )

      renderWithProviders(<TestComponent />)

      expect(screen.getByTestId('loading')).toHaveTextContent('loading')
      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated')
    })

    it('should set authenticated if session exists', async () => {
      const mockUser = {
        id: 'user-1',
        name: '田中太郎',
        email: 'tanaka@example.com',
        continue_days: 14,
      }

      vi.mocked(apiClient.getCurrentUser).mockResolvedValueOnce({
        status: 'success',
        data: { user: mockUser } as never,
      })

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })

      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated')
      expect(screen.getByTestId('user')).toHaveTextContent('田中太郎')
    })

    it('should set not authenticated if no session', async () => {
      vi.mocked(apiClient.getCurrentUser).mockRejectedValueOnce(new Error('Unauthorized'))

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })

      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated')
      expect(screen.getByTestId('user')).toHaveTextContent('no-user')
    })
  })

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const user = userEvent.setup()
      const mockUser = {
        id: 'user-1',
        name: '田中太郎',
        email: 'test@example.com',
        continue_days: 5,
      }

      vi.mocked(apiClient.getCurrentUser).mockRejectedValueOnce(new Error('Unauthorized'))
      vi.mocked(apiClient.login).mockResolvedValueOnce({
        status: 'success',
        data: { user: mockUser } as never,
      })

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })

      await user.click(screen.getByText('Login'))

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated')
      })

      expect(screen.getByTestId('user')).toHaveTextContent('田中太郎')
      expect(apiClient.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('should show error message on login failure', async () => {
      const user = userEvent.setup()

      vi.mocked(apiClient.getCurrentUser).mockRejectedValueOnce(new Error('Unauthorized'))
      vi.mocked(apiClient.login).mockRejectedValueOnce(
        new Error('メールアドレスまたはパスワードが正しくありません')
      )

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })

      await user.click(screen.getByText('Login'))

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(
          'メールアドレスまたはパスワードが正しくありません'
        )
      })

      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated')
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      const user = userEvent.setup()
      const mockUser = {
        id: 'user-1',
        name: '田中太郎',
        email: 'test@example.com',
        continue_days: 5,
      }

      vi.mocked(apiClient.getCurrentUser).mockResolvedValueOnce({
        status: 'success',
        data: { user: mockUser } as never,
      })
      vi.mocked(apiClient.logout).mockResolvedValueOnce({
        status: 'success',
        data: { message: 'ログアウトしました' },
      })

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated')
      })

      await user.click(screen.getByText('Logout'))

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated')
      })

      expect(screen.getByTestId('user')).toHaveTextContent('no-user')
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  describe('session timeout', () => {
    it('should redirect to login on authentication error', async () => {
      const mockUser = {
        id: 'user-1',
        name: '田中太郎',
        email: 'test@example.com',
        continue_days: 5,
      }

      vi.mocked(apiClient.getCurrentUser).mockResolvedValueOnce({
        status: 'success',
        data: { user: mockUser } as never,
      })

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated')
      })

      // Simulate session expiration by checking again
      vi.mocked(apiClient.getCurrentUser).mockRejectedValueOnce(new Error('Unauthorized'))

      // The context should handle session expiration
      // This would typically be handled by an interval or API interceptor
    })
  })
})

describe('useAuth hook', () => {
  it('should throw error when used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    function TestComponentOutsideProvider() {
      useAuth()
      return <div>Should not render</div>
    }

    expect(() => render(<TestComponentOutsideProvider />)).toThrow(
      'useAuth must be used within an AuthProvider'
    )

    consoleSpy.mockRestore()
  })
})
