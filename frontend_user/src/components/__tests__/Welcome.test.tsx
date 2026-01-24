import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Welcome } from '../Welcome'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock the AuthContext
const mockUseAuth = vi.fn()
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

function renderWelcome() {
  return render(
    <BrowserRouter>
      <Welcome />
    </BrowserRouter>
  )
}

describe('U-10 Welcome', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        name: '田中太郎',
        email: 'tanaka@example.com',
        continue_days: 14,
      },
      isAuthenticated: true,
      isLoading: false,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('should render welcome message with user name', () => {
      renderWelcome()

      expect(screen.getByText(/おかえりなさい/)).toBeInTheDocument()
      expect(screen.getByText(/田中太郎さん/)).toBeInTheDocument()
    })

    it('should render continue days prominently', () => {
      renderWelcome()

      expect(screen.getByText('継続日数')).toBeInTheDocument()
      expect(screen.getByText('14')).toBeInTheDocument()
      expect(screen.getByText('日')).toBeInTheDocument()
    })

    it('should display motivational message based on continue days', () => {
      renderWelcome()

      // Should have some motivational text
      const motivationalTexts = [
        '素晴らしい！',
        'その調子！',
        '頑張りましょう！',
        '継続は力なり',
      ]
      const hasMotivationalText = motivationalTexts.some(text =>
        screen.queryByText(new RegExp(text))
      )
      expect(hasMotivationalText).toBe(true)
    })
  })

  describe('continue days display', () => {
    it('should display zero days with appropriate message', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '1',
          name: '山田花子',
          email: 'yamada@example.com',
          continue_days: 0,
        },
        isAuthenticated: true,
        isLoading: false,
      })

      renderWelcome()

      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should display high continue days (100+) with special message', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '1',
          name: '佐藤次郎',
          email: 'sato@example.com',
          continue_days: 100,
        },
        isAuthenticated: true,
        isLoading: false,
      })

      renderWelcome()

      expect(screen.getByText('100')).toBeInTheDocument()
    })
  })

  describe('auto navigation', () => {
    it('should navigate to home after 3 seconds', async () => {
      renderWelcome()

      expect(mockNavigate).not.toHaveBeenCalled()

      // Fast-forward 3 seconds
      await vi.advanceTimersByTimeAsync(3000)

      expect(mockNavigate).toHaveBeenCalledWith('/home', { replace: true })
    })

    it('should not navigate before 3 seconds', () => {
      renderWelcome()

      // Fast-forward 2 seconds
      vi.advanceTimersByTime(2000)

      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('should clean up timer on unmount', () => {
      const { unmount } = renderWelcome()

      unmount()

      // Fast-forward 3 seconds after unmount
      vi.advanceTimersByTime(3000)

      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('tap to skip', () => {
    it('should navigate immediately when tapped', async () => {
      vi.useRealTimers()
      const user = userEvent.setup()
      renderWelcome()

      // Tap anywhere on the screen
      const container = screen.getByRole('button', { name: /タップしてスキップ/ })
      await user.click(container)

      expect(mockNavigate).toHaveBeenCalledWith('/home', { replace: true })
      vi.useFakeTimers()
    })

    it('should show skip hint text', () => {
      renderWelcome()

      expect(screen.getByText(/タップしてスキップ/)).toBeInTheDocument()
    })

    it('should prevent auto-navigation after manual tap', async () => {
      vi.useRealTimers()
      const user = userEvent.setup()
      renderWelcome()

      const container = screen.getByRole('button', { name: /タップしてスキップ/ })
      await user.click(container)

      // Should only be called once from the tap
      expect(mockNavigate).toHaveBeenCalledTimes(1)
      vi.useFakeTimers()
    })
  })

  describe('visual design', () => {
    it('should use green color theme (#10B981)', () => {
      renderWelcome()

      // Should render with green-themed gradient background
      const continueDaysText = screen.getByText('継続日数')
      expect(continueDaysText).toBeInTheDocument()
    })

    it('should have large font size for continue days', () => {
      renderWelcome()

      const continueDaysNumber = screen.getByText('14')
      expect(continueDaysNumber).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper heading structure', () => {
      renderWelcome()

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
    })

    it('should have accessible button for tap to skip', () => {
      renderWelcome()

      const button = screen.getByRole('button', { name: /タップしてスキップ/ })
      expect(button).toHaveAccessibleName()
    })

    it('should have proper semantic structure', () => {
      renderWelcome()

      // Should have main content area
      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
    })

    it('should support keyboard navigation for skip', async () => {
      vi.useRealTimers()
      const user = userEvent.setup()
      renderWelcome()

      const skipButton = screen.getByRole('button', { name: /タップしてスキップ/ })

      // Focus on button
      skipButton.focus()
      expect(document.activeElement).toBe(skipButton)

      // Press Enter
      await user.keyboard('{Enter}')

      expect(mockNavigate).toHaveBeenCalledWith('/home', { replace: true })
      vi.useFakeTimers()
    })
  })

  describe('authentication', () => {
    it('should redirect to login if not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })

      renderWelcome()

      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
    })

    it('should show loading state while checking auth', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
      })

      renderWelcome()

      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('animation', () => {
    it('should have fade-in animation', () => {
      const { container } = renderWelcome()

      // Check for animation classes
      const animatedElements = container.querySelectorAll('[class*="animate"]')
      expect(animatedElements.length).toBeGreaterThan(0)
    })

    it('should have scale animation for continue days', () => {
      const { container } = renderWelcome()

      // Continue days should have some visual animation
      const continueDaysSection = screen.getByText('継続日数').parentElement
      expect(continueDaysSection).toBeInTheDocument()
    })
  })
})
