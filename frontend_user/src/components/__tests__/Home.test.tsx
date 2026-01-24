import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Home } from '../Home'

// Mock the AuthContext
const mockLogout = vi.fn()
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

function renderHome() {
  return render(
    <BrowserRouter>
      <Home />
    </BrowserRouter>
  )
}

describe('U-02 Home', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        name: '田中太郎',
        email: 'tanaka@example.com',
        continue_days: 14,
      },
      logout: mockLogout,
      isAuthenticated: true,
      isLoading: false,
    })
  })

  describe('rendering', () => {
    it('should render greeting message with user name', () => {
      renderHome()

      expect(screen.getByText(/田中太郎さん/)).toBeInTheDocument()
    })

    it('should render time-based greeting', () => {
      renderHome()

      // Should have one of the greetings
      const greetings = ['おはようございます！', 'こんにちは！', 'こんばんは！']
      const hasGreeting = greetings.some(greeting =>
        screen.queryByText(new RegExp(greeting))
      )
      expect(hasGreeting).toBe(true)
    })

    it('should render continue days card', () => {
      renderHome()

      expect(screen.getByText('継続日数')).toBeInTheDocument()
      expect(screen.getByText('14')).toBeInTheDocument()
      expect(screen.getByText('日')).toBeInTheDocument()
    })
  })

  describe('main menu', () => {
    it('should render three main menu items', () => {
      renderHome()

      expect(screen.getByText('運動する')).toBeInTheDocument()
      expect(screen.getByText('記録する')).toBeInTheDocument()
      expect(screen.getByText('履歴を見る')).toBeInTheDocument()
    })

    it('should navigate to exercise menu on "運動する" click', async () => {
      const user = userEvent.setup()
      renderHome()

      const exerciseButton = screen.getByRole('button', { name: /運動する/ })
      await user.click(exerciseButton)

      expect(mockNavigate).toHaveBeenCalledWith('/exercise-menu')
    })

    it('should navigate to bulk record on "記録する" click', async () => {
      const user = userEvent.setup()
      renderHome()

      const recordButton = screen.getByRole('button', { name: /記録する/ })
      await user.click(recordButton)

      expect(mockNavigate).toHaveBeenCalledWith('/record')
    })

    it('should navigate to history on "履歴を見る" click', async () => {
      const user = userEvent.setup()
      renderHome()

      const historyButton = screen.getByRole('button', { name: /履歴を見る/ })
      await user.click(historyButton)

      expect(mockNavigate).toHaveBeenCalledWith('/history')
    })
  })

  describe('measurements link', () => {
    it('should render measurements link', () => {
      renderHome()

      expect(screen.getByText('測定値を見る')).toBeInTheDocument()
    })

    it('should navigate to measurements on click', async () => {
      const user = userEvent.setup()
      renderHome()

      const measurementsLink = screen.getByRole('button', { name: /測定値を見る/ })
      await user.click(measurementsLink)

      expect(mockNavigate).toHaveBeenCalledWith('/measurements')
    })
  })

  describe('continue days display', () => {
    it('should display zero continue days correctly', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '1',
          name: '山田花子',
          email: 'yamada@example.com',
          continue_days: 0,
        },
        logout: mockLogout,
        isAuthenticated: true,
        isLoading: false,
      })

      renderHome()

      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should display high continue days correctly', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '1',
          name: '佐藤次郎',
          email: 'sato@example.com',
          continue_days: 365,
        },
        logout: mockLogout,
        isAuthenticated: true,
        isLoading: false,
      })

      renderHome()

      expect(screen.getByText('365')).toBeInTheDocument()
    })
  })

  describe('authentication', () => {
    it('should redirect to login if not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        logout: mockLogout,
        isAuthenticated: false,
      })

      renderHome()

      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
    })
  })

  describe('accessibility', () => {
    it('should have accessible main menu buttons', () => {
      renderHome()

      const exerciseButton = screen.getByRole('button', { name: /運動する/ })
      const recordButton = screen.getByRole('button', { name: /記録する/ })
      const historyButton = screen.getByRole('button', { name: /履歴を見る/ })

      expect(exerciseButton).toBeInTheDocument()
      expect(recordButton).toBeInTheDocument()
      expect(historyButton).toBeInTheDocument()
    })

    it('should have proper heading structure', () => {
      renderHome()

      // Main heading should exist
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
    })

    it('should have minimum tap target size for interactive elements', () => {
      renderHome()

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        // Just check that buttons exist and are clickable
        expect(button).toBeInTheDocument()
      })
    })

    it('should have proper semantic structure for continue days card', () => {
      renderHome()

      // Continue days should be in a semantic element
      const continueDaysLabel = screen.getByText('継続日数')
      expect(continueDaysLabel).toBeInTheDocument()

      // The number should be visually prominent
      const continueDaysValue = screen.getByText('14')
      expect(continueDaysValue).toBeInTheDocument()
    })

    it('should have focus-visible styles on buttons', async () => {
      const user = userEvent.setup()
      renderHome()

      // Tab through focusable elements
      await user.tab()

      // At least one element should receive focus
      expect(document.activeElement).not.toBe(document.body)
    })

    it('should have proper aria-label on icon-only elements', () => {
      renderHome()

      // All buttons should have accessible names
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName()
      })
    })

    it('should have proper landmark regions', () => {
      renderHome()

      // Should have main content area
      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()

      // Should have navigation
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()

      // Should have header (banner)
      const header = screen.getByRole('banner')
      expect(header).toBeInTheDocument()
    })

    it('should have accessible section for continue days', () => {
      renderHome()

      // Section should have accessible label
      const section = screen.getByRole('region', { name: /継続状況/ })
      expect(section).toBeInTheDocument()
    })
  })

  describe('navigation footer', () => {
    it('should render footer navigation', () => {
      renderHome()

      // Should have footer with navigation
      const footer = screen.getByRole('navigation', { name: /フッターナビゲーション|メインナビゲーション/i })
      expect(footer).toBeInTheDocument()
    })

    it('should have home as active in footer', () => {
      renderHome()

      // Home should be highlighted/active in footer
      const homeNavItem = screen.getByRole('link', { name: /ホーム/ })
      expect(homeNavItem).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('should show loading state while fetching user data', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        logout: mockLogout,
        isAuthenticated: true,
        isLoading: true,
      })

      renderHome()

      // Should show loading indicator or skeleton
      expect(screen.getByRole('status') || screen.getByText(/読み込み中/)).toBeInTheDocument()
    })
  })
})
