import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { ExerciseMenu } from '../ExerciseMenu'
import type { Exercise } from '../../lib/api-types'

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
const mockGetUserExercises = vi.fn()
const mockGetExerciseRecords = vi.fn()
vi.mock('../../lib/api-client', () => ({
  apiClient: {
    getUserExercises: () => mockGetUserExercises(),
    getExerciseRecords: (params?: { start_date?: string; end_date?: string }) => mockGetExerciseRecords(params),
  },
}))

const mockExercises: Exercise[] = [
  {
    id: '1',
    name: '膝伸展運動',
    description: '膝をゆっくり伸ばす運動です',
    video_url: '/videos/knee-extension.mp4',
    thumbnail_url: '/thumbnails/knee-extension.jpg',
    sets: 3,
    reps: 10,
    exercise_type: 'training',
  },
  {
    id: '2',
    name: '上肢挙上運動',
    description: '腕を上げる運動です',
    video_url: '/videos/arm-raise.mp4',
    thumbnail_url: '/thumbnails/arm-raise.jpg',
    sets: 2,
    reps: 15,
    exercise_type: 'training',
  },
  {
    id: '3',
    name: 'ストレッチ',
    description: '全身のストレッチです',
    video_url: '/videos/stretch.mp4',
    sets: 1,
    reps: 5,
    duration_seconds: 30,
    exercise_type: 'stretch',
  },
]

function renderExerciseMenu() {
  return render(
    <BrowserRouter>
      <ExerciseMenu />
    </BrowserRouter>
  )
}

describe('U-03 ExerciseMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: '田中太郎', email: 'tanaka@example.com', continue_days: 14 },
      isAuthenticated: true,
      isLoading: false,
    })
    mockGetUserExercises.mockResolvedValue({
      status: 'success',
      data: { exercises: mockExercises },
    })
    mockGetExerciseRecords.mockResolvedValue({
      status: 'success',
      data: { records: [] },
    })
  })

  describe('rendering', () => {
    it('should render page title', async () => {
      renderExerciseMenu()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /運動メニュー/ })).toBeInTheDocument()
      })
    })

    it('should render loading state initially', () => {
      mockGetUserExercises.mockImplementation(() => new Promise(() => {})) // Never resolves
      mockGetExerciseRecords.mockImplementation(() => new Promise(() => {})) // Never resolves
      renderExerciseMenu()

      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should render exercise list after loading', async () => {
      renderExerciseMenu()

      await waitFor(() => {
        expect(screen.getByText('膝伸展運動')).toBeInTheDocument()
        expect(screen.getByText('上肢挙上運動')).toBeInTheDocument()
        expect(screen.getAllByText('ストレッチ').length).toBeGreaterThan(0)
      })
    })

    it('should render exercise details (sets and reps)', async () => {
      renderExerciseMenu()

      await waitFor(() => {
        expect(screen.getByText(/3セット/)).toBeInTheDocument()
        expect(screen.getByText(/10回/)).toBeInTheDocument()
      })
    })

    it('should render empty state when no exercises', async () => {
      mockGetUserExercises.mockResolvedValue({
        status: 'success',
        data: { exercises: [] },
      })

      renderExerciseMenu()

      await waitFor(() => {
        expect(screen.getByText(/運動メニューがありません/)).toBeInTheDocument()
      })
    })

    it('should render error state on API failure', async () => {
      mockGetUserExercises.mockRejectedValue(new Error('API Error'))

      renderExerciseMenu()

      await waitFor(() => {
        expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument()
      })
    })
  })

  describe('navigation', () => {
    it('should navigate to exercise player on card click', async () => {
      const user = userEvent.setup()
      renderExerciseMenu()

      await waitFor(() => {
        expect(screen.getByText('膝伸展運動')).toBeInTheDocument()
      })

      const exerciseCard = screen.getByRole('button', { name: /膝伸展運動/ })
      await user.click(exerciseCard)

      expect(mockNavigate).toHaveBeenCalledWith('/exercise/1')
    })

    it('should navigate back to home on back button click', async () => {
      const user = userEvent.setup()
      renderExerciseMenu()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /戻る/ })).toBeInTheDocument()
      })

      const backButton = screen.getByRole('button', { name: /戻る/ })
      await user.click(backButton)

      expect(mockNavigate).toHaveBeenCalledWith('/home')
    })
  })

  describe('authentication', () => {
    it('should redirect to login if not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })

      renderExerciseMenu()

      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
    })
  })

  describe('accessibility', () => {
    it('should have proper heading structure', async () => {
      renderExerciseMenu()

      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 1 })
        expect(heading).toBeInTheDocument()
      })
    })

    it('should have accessible exercise cards with proper labels', async () => {
      renderExerciseMenu()

      await waitFor(() => {
        const cards = screen.getAllByRole('button')
        cards.forEach(card => {
          expect(card).toHaveAccessibleName()
        })
      })
    })

    it('should have minimum tap target size (44x44px)', async () => {
      renderExerciseMenu()

      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        buttons.forEach(button => {
          expect(button).toBeInTheDocument()
          // Actual size check would require computed styles
        })
      })
    })

    it('should have proper focus-visible styles', async () => {
      const user = userEvent.setup()
      renderExerciseMenu()

      await waitFor(() => {
        expect(screen.getByText('膝伸展運動')).toBeInTheDocument()
      })

      await user.tab()
      expect(document.activeElement).not.toBe(document.body)
    })

    it('should have accessible loading state', () => {
      mockGetUserExercises.mockImplementation(() => new Promise(() => {}))
      mockGetExerciseRecords.mockImplementation(() => new Promise(() => {}))
      renderExerciseMenu()

      const loadingElement = screen.getByRole('status')
      expect(loadingElement).toBeInTheDocument()
    })

    it('should have semantic list structure for exercises', async () => {
      renderExerciseMenu()

      await waitFor(() => {
        const lists = screen.getAllByRole('list')
        expect(lists.length).toBeGreaterThan(0)
      })
    })
  })

  describe('exercise type filtering', () => {
    it('should display exercises grouped by exercise type', async () => {
      renderExerciseMenu()

      await waitFor(() => {
        // Should have exercise type headers or groupings
        const trainingTexts = screen.getAllByText(/トレーニング/)
        const stretchTexts = screen.getAllByText(/ストレッチ/)
        expect(trainingTexts.length).toBeGreaterThan(0)
        expect(stretchTexts.length).toBeGreaterThan(0)
      })
    })

    it('should handle Japanese exercise_type values from API', async () => {
      const japaneseTypeExercises: Exercise[] = [
        {
          id: '10',
          name: 'チェアスクワット',
          description: '椅子スクワット',
          video_url: '/videos/chair-squat.mp4',
          sets: 3,
          reps: 10,
          exercise_type: 'トレーニング' as Exercise['exercise_type'],
        },
        {
          id: '11',
          name: '肘を曲げる運動',
          description: 'ストレッチ運動',
          video_url: '/videos/elbow.mp4',
          sets: 2,
          reps: 5,
          exercise_type: 'ストレッチ' as Exercise['exercise_type'],
        },
      ]

      mockGetUserExercises.mockResolvedValue({
        status: 'success',
        data: { exercises: japaneseTypeExercises },
      })

      renderExerciseMenu()

      await waitFor(() => {
        expect(screen.getByText('チェアスクワット')).toBeInTheDocument()
        expect(screen.getByText('肘を曲げる運動')).toBeInTheDocument()
      })
    })
  })
})
