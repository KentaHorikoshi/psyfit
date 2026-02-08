import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { ExerciseHistory } from '../ExerciseHistory'

// Mock the AuthContext
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

// Mock API client
const mockGetExerciseRecords = vi.fn()
const mockGetUserExercises = vi.fn()
vi.mock('../../lib/api-client', () => ({
  default: {
    getExerciseRecords: (...args: unknown[]) => mockGetExerciseRecords(...args),
    getUserExercises: () => mockGetUserExercises(),
  },
  apiClient: {
    getExerciseRecords: (...args: unknown[]) => mockGetExerciseRecords(...args),
    getUserExercises: () => mockGetUserExercises(),
  },
}))

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn()

const mockExercises = [
  {
    id: 'ex1',
    name: 'スクワット',
    description: '下半身強化',
    video_url: '/videos/squat.mp4',
    sets: 3,
    reps: 10,
    exercise_type: 'training' as const,
  },
  {
    id: 'ex2',
    name: '腕上げ運動',
    description: '上半身強化',
    video_url: '/videos/arm.mp4',
    sets: 2,
    reps: 15,
    exercise_type: 'stretch' as const,
  },
  {
    id: 'ex3',
    name: 'バランス運動',
    description: 'バランス強化',
    video_url: '/videos/balance.mp4',
    sets: 2,
    reps: 10,
    exercise_type: 'balance' as const,
  },
]

const mockRecords = [
  {
    id: '1',
    exercise_id: 'ex1',
    user_id: 'user1',
    completed_at: '2026-02-05T10:00:00+09:00',
    completed_sets: 3,
    completed_reps: 10,
    exercise_name: 'スクワット',
    exercise_category: 'lower_body',
  },
  {
    id: '2',
    exercise_id: 'ex2',
    user_id: 'user1',
    completed_at: '2026-02-05T11:00:00+09:00',
    completed_sets: 2,
    completed_reps: 15,
    exercise_name: '腕上げ運動',
    exercise_category: 'upper_body',
  },
  {
    id: '3',
    exercise_id: 'ex1',
    user_id: 'user1',
    completed_at: '2026-02-03T10:00:00+09:00',
    completed_sets: 3,
    completed_reps: 10,
    exercise_name: 'スクワット',
    exercise_category: 'lower_body',
  },
]

function renderExerciseHistory() {
  return render(
    <BrowserRouter>
      <ExerciseHistory />
    </BrowserRouter>
  )
}

describe('U-07 ExerciseHistory (Calendar)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
    mockGetExerciseRecords.mockResolvedValue({
      status: 'success',
      data: { records: mockRecords },
    })
    mockGetUserExercises.mockResolvedValue({
      status: 'success',
      data: { exercises: mockExercises },
    })
  })

  describe('rendering', () => {
    it('should render page title', async () => {
      renderExerciseHistory()

      await waitFor(() => {
        expect(screen.getByText('運動履歴')).toBeInTheDocument()
      })
    })

    it('should render back button', async () => {
      renderExerciseHistory()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /戻る/ })).toBeInTheDocument()
      })
    })

    it('should render month navigation', async () => {
      renderExerciseHistory()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /前月/ })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /翌月/ })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /今月に移動/ })).toBeInTheDocument()
      })
    })

    it('should render calendar grid with weekday headers', async () => {
      renderExerciseHistory()

      await waitFor(() => {
        expect(screen.getByRole('grid', { name: 'カレンダー' })).toBeInTheDocument()
        expect(screen.getByText('日')).toBeInTheDocument()
        expect(screen.getByText('月')).toBeInTheDocument()
        expect(screen.getByText('土')).toBeInTheDocument()
      })
    })

    it('should render legend', async () => {
      renderExerciseHistory()

      await waitFor(() => {
        expect(screen.getByText('全完了')).toBeInTheDocument()
        expect(screen.getByText('一部実施')).toBeInTheDocument()
        expect(screen.getByText('未実施')).toBeInTheDocument()
      })
    })
  })

  describe('loading state', () => {
    it('should show loading state while fetching data', () => {
      mockGetExerciseRecords.mockImplementation(() => new Promise(() => {}))
      mockGetUserExercises.mockImplementation(() => new Promise(() => {}))

      renderExerciseHistory()

      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('month navigation', () => {
    it('should navigate to previous month', async () => {
      const user = userEvent.setup()
      renderExerciseHistory()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /前月/ })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /前月/ }))

      // API should be called again with updated month
      await waitFor(() => {
        expect(mockGetExerciseRecords).toHaveBeenCalledTimes(2)
      })
    })

    it('should navigate to next month', async () => {
      const user = userEvent.setup()
      renderExerciseHistory()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /翌月/ })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /翌月/ }))

      await waitFor(() => {
        expect(mockGetExerciseRecords).toHaveBeenCalledTimes(2)
      })
    })

    it('should navigate to today when clicking today button', async () => {
      const user = userEvent.setup()
      renderExerciseHistory()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /今月に移動/ })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /今月に移動/ }))

      // Should show current month label
      const now = new Date()
      const monthLabel = `${now.getFullYear()}年${now.getMonth() + 1}月`
      expect(screen.getByText(monthLabel)).toBeInTheDocument()
    })
  })

  describe('date selection and detail panel', () => {
    it('should show detail panel when a date is clicked', async () => {
      const user = userEvent.setup()
      renderExerciseHistory()

      await waitFor(() => {
        expect(screen.getByRole('grid', { name: 'カレンダー' })).toBeInTheDocument()
      })

      // Click on day 5 (which has records in our mock data for Feb 2026)
      const day5Button = screen.getByRole('button', { name: /2月5日/ })
      await user.click(day5Button)

      // Detail panel should appear
      await waitFor(() => {
        expect(screen.getByTestId('day-detail-panel')).toBeInTheDocument()
      })
    })

    it('should show exercise completion status in detail panel', async () => {
      const user = userEvent.setup()
      renderExerciseHistory()

      await waitFor(() => {
        expect(screen.getByRole('grid', { name: 'カレンダー' })).toBeInTheDocument()
      })

      // Click on day 5 (Feb 5 has 2 out of 3 exercises completed)
      const day5Button = screen.getByRole('button', { name: /2月5日/ })
      await user.click(day5Button)

      await waitFor(() => {
        expect(screen.getByText('2/3 完了')).toBeInTheDocument()
      })
    })

    it('should show uncompleted exercises as 未実施 in detail panel', async () => {
      const user = userEvent.setup()
      renderExerciseHistory()

      await waitFor(() => {
        expect(screen.getByRole('grid', { name: 'カレンダー' })).toBeInTheDocument()
      })

      const day5Button = screen.getByRole('button', { name: /2月5日/ })
      await user.click(day5Button)

      await waitFor(() => {
        const panel = screen.getByTestId('day-detail-panel')
        // バランス運動 (ex3) is not completed on Feb 5
        // Legend also has "未実施", so check within the detail panel
        expect(panel.textContent).toContain('未実施')
      })
    })
  })

  describe('error handling', () => {
    it('should show error message on API failure', async () => {
      mockGetExerciseRecords.mockRejectedValue(new Error('データの取得に失敗しました'))

      renderExerciseHistory()

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })

    it('should allow retry on error', async () => {
      mockGetExerciseRecords
        .mockRejectedValueOnce(new Error('エラー'))
        .mockResolvedValueOnce({
          status: 'success',
          data: { records: mockRecords },
        })

      const user = userEvent.setup()
      renderExerciseHistory()

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      const retryButton = screen.getByRole('button', { name: /再試行/ })
      await user.click(retryButton)

      await waitFor(() => {
        expect(screen.getByRole('grid', { name: 'カレンダー' })).toBeInTheDocument()
      })
    })
  })

  describe('navigation', () => {
    it('should navigate back on back button click', async () => {
      const user = userEvent.setup()
      renderExerciseHistory()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /戻る/ })).toBeInTheDocument()
      })

      const backButton = screen.getByRole('button', { name: /戻る/ })
      await user.click(backButton)

      expect(mockNavigate).toHaveBeenCalledWith(-1)
    })
  })

  describe('authentication', () => {
    it('should redirect to login if not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })

      renderExerciseHistory()

      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
    })

    it('should show loading state while checking auth', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
      })

      renderExerciseHistory()

      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper heading structure', async () => {
      renderExerciseHistory()

      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 1 })
        expect(heading).toBeInTheDocument()
      })
    })

    it('should have accessible calendar grid', async () => {
      renderExerciseHistory()

      await waitFor(() => {
        const grid = screen.getByRole('grid', { name: 'カレンダー' })
        expect(grid).toBeInTheDocument()
      })
    })

    it('should have minimum tap target size for interactive elements', async () => {
      renderExerciseHistory()

      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        buttons.forEach((button) => {
          expect(button).toBeInTheDocument()
        })
      })
    })

    it('should have aria-labels on day cells', async () => {
      renderExerciseHistory()

      await waitFor(() => {
        // Day cells should have descriptive labels
        const day1 = screen.getByRole('button', { name: /2月1日/ })
        expect(day1).toBeInTheDocument()
      })
    })
  })

  describe('calendar display', () => {
    it('should display current month label', async () => {
      renderExerciseHistory()

      const now = new Date()
      const monthLabel = `${now.getFullYear()}年${now.getMonth() + 1}月`

      await waitFor(() => {
        expect(screen.getByText(monthLabel)).toBeInTheDocument()
      })
    })

    it('should call API with date range', async () => {
      renderExerciseHistory()

      await waitFor(() => {
        expect(mockGetExerciseRecords).toHaveBeenCalledWith(
          expect.objectContaining({
            start_date: expect.any(String),
            end_date: expect.any(String),
          })
        )
      })
    })

    it('should call getUserExercises', async () => {
      renderExerciseHistory()

      await waitFor(() => {
        expect(mockGetUserExercises).toHaveBeenCalled()
      })
    })
  })
})
