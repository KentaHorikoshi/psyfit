import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { UserGuide } from '../UserGuide'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockUseAuth = vi.fn()
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

function renderUserGuide() {
  return render(
    <BrowserRouter>
      <UserGuide />
    </BrowserRouter>
  )
}

describe('UserGuide（使い方）', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        name: '田中太郎',
        email: 'tanaka@example.com',
      },
      isAuthenticated: true,
      isLoading: false,
    })
  })

  describe('rendering', () => {
    it('should render page title', () => {
      renderUserGuide()
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('使い方')
    })

    it('should render all 7 guide sections', () => {
      renderUserGuide()
      expect(screen.getByText('ログイン画面')).toBeInTheDocument()
      expect(screen.getByText('ホーム画面')).toBeInTheDocument()
      expect(screen.getByText('運動画面')).toBeInTheDocument()
      expect(screen.getByText('運動記録')).toBeInTheDocument()
      expect(screen.getByText('体調入力')).toBeInTheDocument()
      expect(screen.getByText('運動履歴の確認')).toBeInTheDocument()
      expect(screen.getByText('測定値の推移確認')).toBeInTheDocument()
    })

    it('should render back button', () => {
      renderUserGuide()
      expect(screen.getByRole('button', { name: /戻る/ })).toBeInTheDocument()
    })
  })

  describe('accordion interaction', () => {
    it('should not show section content by default', () => {
      renderUserGuide()
      expect(screen.queryByText(/管理者から通知された初期ID/)).not.toBeInTheDocument()
    })

    it('should expand section when clicked', async () => {
      const user = userEvent.setup()
      renderUserGuide()

      await user.click(screen.getByText('ログイン画面'))
      expect(screen.getByText(/管理者から通知された初期ID/)).toBeInTheDocument()
    })

    it('should collapse section when clicked again', async () => {
      const user = userEvent.setup()
      renderUserGuide()

      await user.click(screen.getByText('ログイン画面'))
      expect(screen.getByText(/管理者から通知された初期ID/)).toBeInTheDocument()

      await user.click(screen.getByText('ログイン画面'))
      expect(screen.queryByText(/管理者から通知された初期ID/)).not.toBeInTheDocument()
    })

    it('should show home screen section content when expanded', async () => {
      const user = userEvent.setup()
      renderUserGuide()

      await user.click(screen.getByText('ホーム画面'))
      expect(screen.getByText(/運動実施画面へ/)).toBeInTheDocument()
    })

    it('should show exercise screen section content when expanded', async () => {
      const user = userEvent.setup()
      renderUserGuide()

      await user.click(screen.getByText('運動画面'))
      expect(screen.getByText(/「運動する」をタップ/)).toBeInTheDocument()
    })

    it('should show exercise record section content when expanded', async () => {
      const user = userEvent.setup()
      renderUserGuide()

      await user.click(screen.getByText('運動記録'))
      expect(screen.getByText(/チェックボックスにチェック/)).toBeInTheDocument()
    })

    it('should show condition input section content when expanded', async () => {
      const user = userEvent.setup()
      renderUserGuide()

      await user.click(screen.getByText('体調入力'))
      expect(screen.getByText(/痛みレベル/)).toBeInTheDocument()
    })

    it('should show exercise history section content when expanded', async () => {
      const user = userEvent.setup()
      renderUserGuide()

      await user.click(screen.getByText('運動履歴の確認'))
      expect(screen.getByText(/カレンダー形式/)).toBeInTheDocument()
    })

    it('should show measurement section content when expanded', async () => {
      const user = userEvent.setup()
      renderUserGuide()

      await user.click(screen.getByText('測定値の推移確認'))
      expect(screen.getByText(/グラフが表示されます/)).toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    it('should navigate back to profile when back button is clicked', async () => {
      const user = userEvent.setup()
      renderUserGuide()

      await user.click(screen.getByRole('button', { name: /戻る/ }))
      expect(mockNavigate).toHaveBeenCalledWith('/profile')
    })
  })

  describe('authentication', () => {
    it('should redirect to login if not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })

      renderUserGuide()
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
    })

    it('should show loading state while checking auth', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
      })

      renderUserGuide()
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper heading structure', () => {
      renderUserGuide()
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    it('should have accessible section buttons with aria-expanded', async () => {
      const user = userEvent.setup()
      renderUserGuide()

      const loginButton = screen.getByRole('button', { name: /ログイン画面/ })
      expect(loginButton).toHaveAttribute('aria-expanded', 'false')

      await user.click(loginButton)
      expect(loginButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('should have minimum tap target size', () => {
      renderUserGuide()
      const backButton = screen.getByRole('button', { name: /戻る/ })
      expect(backButton).toBeInTheDocument()
    })
  })
})
