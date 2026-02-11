import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '../AuthContext'
import { BrowserRouter } from 'react-router-dom'

// Mock the api module
vi.mock('../../lib/api', () => ({
  api: {
    staffLogin: vi.fn(),
    logout: vi.fn(),
    getCurrentStaff: vi.fn(),
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

import { api } from '../../lib/api'

// Test component to access auth context
function TestComponent() {
  const { staff, isAuthenticated, isLoading, error, login, logout } = useAuth()

  const handleLogin = async () => {
    try {
      await login('ST001', 'password123')
    } catch {
      // Error is handled by the context
    }
  }

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="staff">{staff ? staff.name : 'no-staff'}</div>
      <div data-testid="role">{staff ? staff.role : 'no-role'}</div>
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

describe('Staff AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('initial state', () => {
    it('should start with loading state while checking session', async () => {
      vi.mocked(api.getCurrentStaff).mockImplementation(
        () => new Promise(() => {}) // Never resolves to keep loading state
      )

      renderWithProviders(<TestComponent />)

      expect(screen.getByTestId('loading')).toHaveTextContent('loading')
      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated')
    })

    it('should set authenticated if session exists', async () => {
      const mockStaff = {
        id: 'staff-1',
        staff_id: 'ST001',
        name: '山田太郎',
        role: 'manager' as const,
      }

      vi.mocked(api.getCurrentStaff).mockResolvedValueOnce({
        status: 'success',
        data: { staff: mockStaff } as never,
      })

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })

      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated')
      expect(screen.getByTestId('staff')).toHaveTextContent('山田太郎')
      expect(screen.getByTestId('role')).toHaveTextContent('manager')
    })

    it('should set not authenticated if no session', async () => {
      vi.mocked(api.getCurrentStaff).mockRejectedValueOnce(new Error('Unauthorized'))

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })

      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated')
      expect(screen.getByTestId('staff')).toHaveTextContent('no-staff')
    })
  })

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const user = userEvent.setup()
      const mockStaff = {
        id: 'staff-1',
        staff_id: 'ST001',
        name: '山田太郎',
        role: 'manager' as const,
      }

      vi.mocked(api.getCurrentStaff).mockRejectedValueOnce(new Error('Unauthorized'))
      vi.mocked(api.staffLogin).mockResolvedValueOnce({
        status: 'success',
        data: { staff: mockStaff } as never,
      })

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })

      await user.click(screen.getByText('Login'))

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated')
      })

      expect(screen.getByTestId('staff')).toHaveTextContent('山田太郎')
      expect(api.staffLogin).toHaveBeenCalledWith({
        staff_id: 'ST001',
        password: 'password123',
      })
    })

    it('should show error message on login failure', async () => {
      const user = userEvent.setup()

      vi.mocked(api.getCurrentStaff).mockRejectedValueOnce(new Error('Unauthorized'))
      vi.mocked(api.staffLogin).mockRejectedValueOnce(
        new Error('職員IDまたはパスワードが正しくありません')
      )

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })

      await user.click(screen.getByText('Login'))

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(
          '職員IDまたはパスワードが正しくありません'
        )
      })

      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated')
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      const user = userEvent.setup()
      const mockStaff = {
        id: 'staff-1',
        staff_id: 'ST001',
        name: '山田太郎',
        role: 'manager' as const,
      }

      vi.mocked(api.getCurrentStaff).mockResolvedValueOnce({
        status: 'success',
        data: { staff: mockStaff } as never,
      })
      vi.mocked(api.logout).mockResolvedValueOnce({
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

      expect(screen.getByTestId('staff')).toHaveTextContent('no-staff')
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })
})

describe('useAuth hook', () => {
  it('should throw error when used outside AuthProvider', () => {
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
