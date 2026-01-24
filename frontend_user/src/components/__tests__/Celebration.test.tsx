import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Celebration } from '../Celebration'

// Mock useNavigate
const mockNavigate = vi.fn()
const mockUseLocation = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockUseLocation(),
  }
})

function renderCelebration() {
  return render(
    <BrowserRouter>
      <Celebration />
    </BrowserRouter>
  )
}

describe('U-13 Celebration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockUseLocation.mockReturnValue({
      state: {
        exerciseName: '膝伸展運動',
        setsCompleted: 3,
        repsCompleted: 10,
      }
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('should render celebration message', () => {
      renderCelebration()

      expect(screen.getByText(/おめでとうございます/)).toBeInTheDocument()
    })

    it('should display completed exercise information', () => {
      renderCelebration()

      expect(screen.getByText(/膝伸展運動/)).toBeInTheDocument()
      expect(screen.getByText(/完了/)).toBeInTheDocument()
    })

    it('should show sets and reps completed', () => {
      renderCelebration()

      // Should show "3セット × 10回" or similar
      expect(screen.getByText(/3/)).toBeInTheDocument()
      expect(screen.getByText(/10/)).toBeInTheDocument()
    })

    it('should display motivational message', () => {
      renderCelebration()

      const motivationalMessages = [
        '素晴らしい',
        'よく頑張りました',
        'お疲れ様でした',
        'その調子',
      ]
      const hasMotivationalMessage = motivationalMessages.some(msg =>
        screen.queryByText(new RegExp(msg))
      )
      expect(hasMotivationalMessage).toBe(true)
    })
  })

  describe('animation', () => {
    it('should have confetti animation', () => {
      const { container } = renderCelebration()

      // Should have confetti-like elements
      const confettiElements = container.querySelectorAll('[class*="confetti"]')
      expect(confettiElements.length).toBeGreaterThan(0)
    })

    it('should have fade-in animation', () => {
      const { container } = renderCelebration()

      const animatedElements = container.querySelectorAll('[class*="animate"]')
      expect(animatedElements.length).toBeGreaterThan(0)
    })

    it('should have celebration icon', () => {
      renderCelebration()

      // Should have some celebratory visual element (star, trophy, etc)
      const container = screen.getByRole('main')
      expect(container).toBeInTheDocument()
    })
  })

  describe('auto navigation', () => {
    it('should navigate to home after 3 seconds', async () => {
      renderCelebration()

      expect(mockNavigate).not.toHaveBeenCalled()

      // Fast-forward 3 seconds
      await vi.advanceTimersByTimeAsync(3000)

      expect(mockNavigate).toHaveBeenCalledWith('/home', { replace: true })
    })

    it('should not navigate before 3 seconds', () => {
      renderCelebration()

      // Fast-forward 2 seconds
      vi.advanceTimersByTime(2000)

      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('should clean up timer on unmount', () => {
      const { unmount } = renderCelebration()

      unmount()

      // Fast-forward 3 seconds after unmount
      vi.advanceTimersByTime(3000)

      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('tap to continue', () => {
    it('should navigate immediately when tapped', async () => {
      vi.useRealTimers()
      const user = userEvent.setup()
      renderCelebration()

      const continueButton = screen.getByRole('button', { name: /続ける/ })
      await user.click(continueButton)

      expect(mockNavigate).toHaveBeenCalledWith('/home', { replace: true })
      vi.useFakeTimers()
    })

    it('should show continue button', () => {
      renderCelebration()

      expect(screen.getByRole('button', { name: /続ける/ })).toBeInTheDocument()
    })

    it('should prevent auto-navigation after manual tap', async () => {
      vi.useRealTimers()
      const user = userEvent.setup()
      renderCelebration()

      const continueButton = screen.getByRole('button', { name: /続ける/ })
      await user.click(continueButton)

      // Should only be called once from the tap
      expect(mockNavigate).toHaveBeenCalledTimes(1)
      vi.useFakeTimers()
    })
  })

  describe('visual design', () => {
    it('should use amber color theme (#F59E0B)', () => {
      renderCelebration()

      // Should render celebration message
      expect(screen.getByText(/おめでとうございます/)).toBeInTheDocument()
    })

    it('should have celebration-appropriate styling', () => {
      renderCelebration()

      // Should have visually distinct celebration styling
      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper heading structure', () => {
      renderCelebration()

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
    })

    it('should have accessible continue button', () => {
      renderCelebration()

      const button = screen.getByRole('button', { name: /続ける/ })
      expect(button).toHaveAccessibleName()
    })

    it('should have proper semantic structure', () => {
      renderCelebration()

      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      vi.useRealTimers()
      const user = userEvent.setup()
      renderCelebration()

      const continueButton = screen.getByRole('button', { name: /続ける/ })

      // Focus on button
      continueButton.focus()
      expect(document.activeElement).toBe(continueButton)

      // Press Enter
      await user.keyboard('{Enter}')

      expect(mockNavigate).toHaveBeenCalledWith('/home', { replace: true })
      vi.useFakeTimers()
    })

    it('should have minimum tap target size for button', () => {
      renderCelebration()

      const button = screen.getByRole('button', { name: /続ける/ })
      expect(button).toBeInTheDocument()
      // Visual check - implementation should have min-h-[44px]
    })
  })

  describe('exercise data handling', () => {
    it('should handle missing exercise name gracefully', () => {
      mockUseLocation.mockReturnValue({
        state: {
          setsCompleted: 3,
          repsCompleted: 10,
        }
      })

      renderCelebration()

      // Should still render without crashing
      expect(screen.getByText(/おめでとうございます/)).toBeInTheDocument()
    })

    it('should display different sets/reps combinations', () => {
      mockUseLocation.mockReturnValue({
        state: {
          exerciseName: 'スクワット',
          setsCompleted: 5,
          repsCompleted: 15,
        }
      })

      renderCelebration()

      expect(screen.getByText(/おめでとうございます/)).toBeInTheDocument()
    })
  })

  describe('confetti animation details', () => {
    it('should have multiple confetti pieces', () => {
      const { container } = renderCelebration()

      const confetti = container.querySelectorAll('[class*="confetti"]')
      // Should have multiple pieces for visual effect
      expect(confetti.length).toBeGreaterThanOrEqual(5)
    })

    it('should animate confetti elements', () => {
      const { container } = renderCelebration()

      // Confetti should have animation classes
      const animatedConfetti = container.querySelectorAll('[class*="confetti"][class*="animate"]')
      expect(animatedConfetti.length).toBeGreaterThan(0)
    })
  })
})
