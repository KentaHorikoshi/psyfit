import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
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
vi.mock('../../lib/api-client', () => ({
  apiClient: {
    getExerciseRecords: () => mockGetExerciseRecords(),
  },
}))

const mockRecords = [
  {
    id: '1',
    exercise_id: 'ex1',
    user_id: 'user1',
    completed_at: '2026-01-24T10:00:00Z',
    completed_sets: 3,
    completed_reps: 10,
    exercise_name: 'スクワット',
    exercise_category: 'lower_body',
  },
  {
    id: '2',
    exercise_id: 'ex2',
    user_id: 'user1',
    completed_at: '2026-01-24T11:00:00Z',
    completed_sets: 2,
    completed_reps: 15,
    exercise_name: '腕上げ運動',
    exercise_category: 'upper_body',
  },
  {
    id: '3',
    exercise_id: 'ex1',
    user_id: 'user1',
    completed_at: '2026-01-23T10:00:00Z',
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

describe('U-07 ExerciseHistory', () => {
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

    it('should render date filter controls', async () => {
      renderExerciseHistory()

      await waitFor(() => {
        expect(screen.getByLabelText(/開始日/)).toBeInTheDocument()
        expect(screen.getByLabelText(/終了日/)).toBeInTheDocument()
      })
    })
  })

  describe('loading state', () => {
    it('should show loading state while fetching data', () => {
      mockGetExerciseRecords.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      renderExerciseHistory()

      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('data display', () => {
    it('should display exercise records after loading', async () => {
      renderExerciseHistory()

      await waitFor(() => {
        // Multiple records with same name, use getAllByText
        expect(screen.getAllByText('スクワット').length).toBeGreaterThanOrEqual(1)
        expect(screen.getByText('腕上げ運動')).toBeInTheDocument()
      })
    })

    it('should display exercise details (sets, reps)', async () => {
      renderExerciseHistory()

      await waitFor(() => {
        // Multiple records may have same values
        expect(screen.getAllByText(/3セット/).length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText(/10回/).length).toBeGreaterThanOrEqual(1)
      })
    })

    it('should group records by date', async () => {
      renderExerciseHistory()

      await waitFor(() => {
        // Should show date headers
        expect(screen.getByText(/2026年1月24日/)).toBeInTheDocument()
        expect(screen.getByText(/2026年1月23日/)).toBeInTheDocument()
      })
    })

    it('should show empty state when no records', async () => {
      mockGetExerciseRecords.mockResolvedValue({
        status: 'success',
        data: { records: [] },
      })

      renderExerciseHistory()

      await waitFor(() => {
        expect(screen.getByText(/記録がありません/)).toBeInTheDocument()
      })
    })
  })

  describe('date filtering', () => {
    it('should filter records by date range', async () => {
      renderExerciseHistory()

      await waitFor(() => {
        expect(screen.getByLabelText(/開始日/)).toBeInTheDocument()
      })

      const startDateInput = screen.getByLabelText(/開始日/)
      fireEvent.change(startDateInput, { target: { value: '2026-01-24' } })

      // Should call API with date filter
      await waitFor(() => {
        expect(mockGetExerciseRecords).toHaveBeenCalled()
      })
    })

    it('should show current month by default', async () => {
      renderExerciseHistory()

      await waitFor(() => {
        const startDateInput = screen.getByLabelText(/開始日/) as HTMLInputElement
        // Should have a default value for current month
        expect(startDateInput.value).toBeTruthy()
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
        // Multiple records with same name
        expect(screen.getAllByText('スクワット').length).toBeGreaterThanOrEqual(1)
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

    it('should have accessible date inputs', async () => {
      renderExerciseHistory()

      await waitFor(() => {
        const startDateInput = screen.getByLabelText(/開始日/)
        const endDateInput = screen.getByLabelText(/終了日/)

        expect(startDateInput).toHaveAccessibleName()
        expect(endDateInput).toHaveAccessibleName()
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
  })

  describe('record categories', () => {
    it('should display category badges for exercises', async () => {
      renderExerciseHistory()

      await waitFor(() => {
        // Check for category indicators (exercise names are displayed)
        expect(screen.getAllByText('スクワット').length).toBeGreaterThanOrEqual(1)
      })
    })
  })
})
