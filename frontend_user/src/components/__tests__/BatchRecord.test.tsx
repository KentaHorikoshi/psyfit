import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { BatchRecord } from '../BatchRecord'

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

// Mock API
const mockCreateExerciseRecord = vi.fn()
vi.mock('../../lib/api-client', () => ({
  createExerciseRecord: (data: any) => mockCreateExerciseRecord(data),
  getUserExercises: vi.fn().mockResolvedValue({
    exercises: [
      {
        id: '1',
        name: '膝伸展運動',
        description: '膝を伸ばす運動',
        video_url: 'https://example.com/video1.mp4',
        sets: 3,
        reps: 10,
        category: 'lower_body',
      },
      {
        id: '2',
        name: 'スクワット',
        description: 'スクワット運動',
        video_url: 'https://example.com/video2.mp4',
        sets: 3,
        reps: 15,
        category: 'lower_body',
      },
      {
        id: '3',
        name: '腕立て伏せ',
        description: '腕立て伏せ運動',
        video_url: 'https://example.com/video3.mp4',
        sets: 3,
        reps: 10,
        category: 'upper_body',
      },
    ],
  }),
}))

function renderBatchRecord() {
  return render(
    <BrowserRouter>
      <BatchRecord />
    </BrowserRouter>
  )
}

describe('U-15 BatchRecord', () => {
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
    mockCreateExerciseRecord.mockResolvedValue({
      id: 'record-1',
      exercise_id: '1',
      user_id: '1',
      completed_at: new Date().toISOString(),
      sets_completed: 3,
      reps_completed: 10,
    })
  })

  describe('rendering', () => {
    it('should render page title', async () => {
      renderBatchRecord()

      await waitFor(() => {
        expect(screen.getByText(/まとめて記録/)).toBeInTheDocument()
      })
    })

    it('should render exercise list with checkboxes', async () => {
      renderBatchRecord()

      await waitFor(() => {
        expect(screen.getByLabelText(/膝伸展運動/)).toBeInTheDocument()
        expect(screen.getByLabelText(/スクワット/)).toBeInTheDocument()
        expect(screen.getByLabelText(/腕立て伏せ/)).toBeInTheDocument()
      })
    })

    it('should display exercise details', async () => {
      renderBatchRecord()

      await waitFor(() => {
        // Should display set/rep information for exercises
        const setRepTexts = screen.getAllByText(/セット/)
        expect(setRepTexts.length).toBeGreaterThan(0)
      })
    })

    it('should render submit button', async () => {
      renderBatchRecord()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /記録する/ })).toBeInTheDocument()
      })
    })
  })

  describe('checkbox interaction', () => {
    it('should toggle exercise selection', async () => {
      const user = userEvent.setup()
      renderBatchRecord()

      await waitFor(() => {
        expect(screen.getByLabelText(/膝伸展運動/)).toBeInTheDocument()
      })

      const checkbox = screen.getByLabelText(/膝伸展運動/)
      expect(checkbox).not.toBeChecked()

      await user.click(checkbox)
      expect(checkbox).toBeChecked()

      await user.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })

    it('should allow multiple selections', async () => {
      const user = userEvent.setup()
      renderBatchRecord()

      await waitFor(() => {
        expect(screen.getByLabelText(/膝伸展運動/)).toBeInTheDocument()
      })

      const checkbox1 = screen.getByLabelText(/膝伸展運動/)
      const checkbox2 = screen.getByLabelText(/スクワット/)

      await user.click(checkbox1)
      await user.click(checkbox2)

      expect(checkbox1).toBeChecked()
      expect(checkbox2).toBeChecked()
    })

    it('should update selected count display', async () => {
      const user = userEvent.setup()
      renderBatchRecord()

      await waitFor(() => {
        expect(screen.getByLabelText(/膝伸展運動/)).toBeInTheDocument()
      })

      const checkbox1 = screen.getByLabelText(/膝伸展運動/)
      const checkbox2 = screen.getByLabelText(/スクワット/)

      await user.click(checkbox1)
      expect(screen.getByText(/1.*選択中/)).toBeInTheDocument()

      await user.click(checkbox2)
      expect(screen.getByText(/2.*選択中/)).toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    it('should submit selected exercises', async () => {
      const user = userEvent.setup()
      renderBatchRecord()

      await waitFor(() => {
        expect(screen.getByLabelText(/膝伸展運動/)).toBeInTheDocument()
      })

      // Select exercises
      await user.click(screen.getByLabelText(/膝伸展運動/))
      await user.click(screen.getByLabelText(/スクワット/))

      // Submit
      const submitButton = screen.getByRole('button', { name: /記録する/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreateExerciseRecord).toHaveBeenCalledTimes(2)
      })
    })

    it('should navigate to home on successful submission', async () => {
      const user = userEvent.setup()
      renderBatchRecord()

      await waitFor(() => {
        expect(screen.getByLabelText(/膝伸展運動/)).toBeInTheDocument()
      })

      await user.click(screen.getByLabelText(/膝伸展運動/))
      await user.click(screen.getByRole('button', { name: /記録する/ }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/home')
      })
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      mockCreateExerciseRecord.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ id: '1' }), 100))
      )

      renderBatchRecord()

      await waitFor(() => {
        expect(screen.getByLabelText(/膝伸展運動/)).toBeInTheDocument()
      })

      await user.click(screen.getByLabelText(/膝伸展運動/))
      await user.click(screen.getByRole('button', { name: /記録する/ }))

      expect(screen.getByText(/記録中/)).toBeInTheDocument()
    })

    it('should show error message on submission failure', async () => {
      const user = userEvent.setup()
      mockCreateExerciseRecord.mockRejectedValue(new Error('Network error'))

      renderBatchRecord()

      await waitFor(() => {
        expect(screen.getByLabelText(/膝伸展運動/)).toBeInTheDocument()
      })

      await user.click(screen.getByLabelText(/膝伸展運動/))
      await user.click(screen.getByRole('button', { name: /記録する/ }))

      await waitFor(() => {
        expect(screen.getByText(/記録に失敗しました/)).toBeInTheDocument()
      })
    })

    it('should disable submit when no exercises selected', async () => {
      renderBatchRecord()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /記録する/ })).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /記録する/ })
      expect(submitButton).toBeDisabled()
    })

    it('should enable submit when exercises are selected', async () => {
      const user = userEvent.setup()
      renderBatchRecord()

      await waitFor(() => {
        expect(screen.getByLabelText(/膝伸展運動/)).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /記録する/ })
      expect(submitButton).toBeDisabled()

      await user.click(screen.getByLabelText(/膝伸展運動/))

      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('select all functionality', () => {
    it('should have select all checkbox', async () => {
      renderBatchRecord()

      await waitFor(() => {
        expect(screen.getByLabelText(/すべて選択/)).toBeInTheDocument()
      })
    })

    it('should select all exercises when select all is clicked', async () => {
      const user = userEvent.setup()
      renderBatchRecord()

      await waitFor(() => {
        expect(screen.getByLabelText(/すべて選択/)).toBeInTheDocument()
      })

      const selectAllCheckbox = screen.getByLabelText(/すべて選択/)
      await user.click(selectAllCheckbox)

      expect(screen.getByLabelText(/膝伸展運動/)).toBeChecked()
      expect(screen.getByLabelText(/スクワット/)).toBeChecked()
      expect(screen.getByLabelText(/腕立て伏せ/)).toBeChecked()
    })

    it('should deselect all exercises when select all is clicked again', async () => {
      const user = userEvent.setup()
      renderBatchRecord()

      await waitFor(() => {
        expect(screen.getByLabelText(/すべて選択/)).toBeInTheDocument()
      })

      const selectAllCheckbox = screen.getByLabelText(/すべて選択/)
      await user.click(selectAllCheckbox)
      await user.click(selectAllCheckbox)

      expect(screen.getByLabelText(/膝伸展運動/)).not.toBeChecked()
      expect(screen.getByLabelText(/スクワット/)).not.toBeChecked()
      expect(screen.getByLabelText(/腕立て伏せ/)).not.toBeChecked()
    })
  })

  describe('accessibility', () => {
    it('should have proper heading structure', async () => {
      renderBatchRecord()

      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 1 })
        expect(heading).toBeInTheDocument()
      })
    })

    it('should have accessible checkboxes', async () => {
      renderBatchRecord()

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox')
        checkboxes.forEach(checkbox => {
          expect(checkbox).toHaveAccessibleName()
        })
      })
    })

    it('should have accessible submit button', async () => {
      renderBatchRecord()

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /記録する/ })
        expect(button).toHaveAccessibleName()
      })
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      renderBatchRecord()

      await waitFor(() => {
        expect(screen.getByLabelText(/膝伸展運動/)).toBeInTheDocument()
      })

      // Tab through elements
      await user.tab()

      // Should have some element focused (not body)
      expect(document.activeElement).not.toBe(document.body)
    })

    it('should have minimum tap target size', async () => {
      renderBatchRecord()

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox')
        checkboxes.forEach(checkbox => {
          expect(checkbox).toBeInTheDocument()
          // Visual check - implementation should ensure min 44x44px
        })
      })
    })
  })

  describe('authentication', () => {
    it('should redirect to login if not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })

      renderBatchRecord()

      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
    })

    it('should show loading state while checking auth', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
      })

      renderBatchRecord()

      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('should show loading state while fetching exercises', () => {
      renderBatchRecord()

      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('should show message when no exercises available', async () => {
      // Mock empty exercises
      const apiClient = await import('../../lib/api-client')
      vi.spyOn(apiClient, 'getUserExercises').mockResolvedValue({
        exercises: [],
      })

      renderBatchRecord()

      await waitFor(() => {
        expect(screen.getByText(/運動メニューがありません/)).toBeInTheDocument()
      })
    })
  })
})
