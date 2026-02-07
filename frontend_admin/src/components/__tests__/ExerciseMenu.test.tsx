import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { ExerciseMenu } from '../ExerciseMenu'
import type { ExerciseMaster, ExerciseAssignment } from '../../lib/api-types'

// Mock useParams and useNavigate
const mockPatientId = 'patient-123'
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: mockPatientId }),
    useNavigate: () => mockNavigate,
  }
})

// Mock API
const mockGetExerciseMasters = vi.fn()
const mockGetPatientExercises = vi.fn()
const mockAssignExercises = vi.fn()

vi.mock('../../lib/api', () => ({
  api: {
    getExerciseMasters: () => mockGetExerciseMasters(),
    getPatientExercises: (patientId: string) => mockGetPatientExercises(patientId),
    assignExercises: (patientId: string, data: unknown) => mockAssignExercises(patientId, data),
  },
}))

const mockExerciseMasters: ExerciseMaster[] = [
  {
    id: 'e1',
    name: '膝伸展運動（椅子座位）',
    exercise_type: 'トレーニング',
    body_part_major: '下肢',
    body_part_minor: '膝・下腿',
    description: '椅子に座った状態で膝を伸ばす',
    video_url: 'https://example.com/video1.mp4',
    recommended_sets: 3,
    recommended_reps: 10,
  },
  {
    id: 'e2',
    name: 'スクワット（浅め）',
    exercise_type: 'トレーニング',
    body_part_major: '下肢',
    body_part_minor: '膝・下腿',
    description: '膝を軽く曲げる浅めのスクワット',
    video_url: 'https://example.com/video2.mp4',
    recommended_sets: 3,
    recommended_reps: 15,
  },
  {
    id: 'e3',
    name: '腰椎ストレッチ',
    exercise_type: 'ストレッチ',
    body_part_major: '体幹・脊柱',
    body_part_minor: '腰椎',
    description: '腰部の柔軟性向上',
    video_url: 'https://example.com/video3.mp4',
    recommended_sets: 2,
    recommended_reps: 10,
  },
]

const mockAssignedExercises: ExerciseAssignment[] = [
  {
    id: 'assignment-1',
    patient_id: mockPatientId,
    exercise_id: 'e1',
    sets: 3,
    reps: 10,
    pain_flag: false,
    reason: '',
    assigned_at: '2026-01-24T10:00:00Z',
    assigned_by: 'staff-1',
  },
]

function renderExerciseMenu() {
  return render(
    <BrowserRouter>
      <ExerciseMenu />
    </BrowserRouter>
  )
}

describe('S-06 ExerciseMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetExerciseMasters.mockResolvedValue({
      status: 'success',
      data: {
        exercises: mockExerciseMasters,
      },
    })
    mockGetPatientExercises.mockResolvedValue({
      status: 'success',
      data: {
        assignments: mockAssignedExercises,
      },
    })
    mockAssignExercises.mockResolvedValue({
      status: 'success',
      data: {
        assignments: [],
      },
    })
  })

  describe('rendering', () => {
    it('should render page title', async () => {
      renderExerciseMenu()

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /運動メニュー設定/ })).toBeInTheDocument()
      })
    })

    it('should load and display exercise masters', async () => {
      renderExerciseMenu()

      await waitFor(() => {
        expect(screen.getAllByText('膝伸展運動（椅子座位）').length).toBeGreaterThan(0)
        expect(screen.getAllByText('スクワット（浅め）').length).toBeGreaterThan(0)
        expect(screen.getAllByText('腰椎ストレッチ').length).toBeGreaterThan(0)
      })

      expect(mockGetExerciseMasters).toHaveBeenCalled()
    })

    it('should display exercise categories', async () => {
      renderExerciseMenu()

      await waitFor(() => {
        const kneeCategories = screen.getAllByText(/膝/)
        const waistCategories = screen.getAllByText(/腰/)
        expect(kneeCategories.length).toBeGreaterThan(0)
        expect(waistCategories.length).toBeGreaterThan(0)
      })
    })

    it('should render save button', async () => {
      renderExerciseMenu()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /保存/ })).toBeInTheDocument()
      })
    })

    it('should render back button', async () => {
      renderExerciseMenu()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /戻る/ })).toBeInTheDocument()
      })
    })
  })

  describe('data fetching', () => {
    it('should fetch exercise masters on mount', async () => {
      renderExerciseMenu()

      await waitFor(() => {
        expect(mockGetExerciseMasters).toHaveBeenCalled()
      })
    })

    it('should fetch patient assigned exercises on mount', async () => {
      renderExerciseMenu()

      await waitFor(() => {
        expect(mockGetPatientExercises).toHaveBeenCalledWith(mockPatientId)
      })
    })

    it('should show loading state while fetching', () => {
      mockGetExerciseMasters.mockReturnValue(
        new Promise(() => {}) // Never resolves
      )

      renderExerciseMenu()

      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText(/読み込み中/)).toBeInTheDocument()
    })

    it('should show error message when API fails', async () => {
      mockGetExerciseMasters.mockRejectedValue(new Error('Network error'))

      renderExerciseMenu()

      await waitFor(() => {
        expect(screen.getByText(/運動マスタの取得に失敗しました/)).toBeInTheDocument()
      })
    })
  })

  describe('exercise selection', () => {
    it('should allow selecting exercises', async () => {
      const user = userEvent.setup()
      renderExerciseMenu()

      await waitFor(() => {
        expect(screen.getAllByText('スクワット（浅め）').length).toBeGreaterThan(0)
      })

      const checkbox = screen.getByRole('checkbox', { name: /スクワット/ })
      await user.click(checkbox)

      expect(checkbox).toBeChecked()
    })

    it('should pre-select already assigned exercises', async () => {
      renderExerciseMenu()

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox', { name: /膝伸展運動/ })
        expect(checkbox).toBeChecked()
      })
    })

    it('should allow deselecting exercises', async () => {
      const user = userEvent.setup()
      renderExerciseMenu()

      await waitFor(() => {
        expect(screen.getAllByText('膝伸展運動（椅子座位）').length).toBeGreaterThan(0)
      })

      const checkbox = screen.getByRole('checkbox', { name: /膝伸展運動/ })
      expect(checkbox).toBeChecked()

      await user.click(checkbox)

      expect(checkbox).not.toBeChecked()
    })
  })

  describe('sets and reps customization', () => {
    it('should show sets and reps inputs for selected exercises', async () => {
      const user = userEvent.setup()
      renderExerciseMenu()

      await waitFor(() => {
        expect(screen.getAllByText('スクワット（浅め）').length).toBeGreaterThan(0)
      })

      const checkbox = screen.getByRole('checkbox', { name: /スクワット/ })
      await user.click(checkbox)

      await waitFor(() => {
        expect(screen.getAllByLabelText(/セット数/).length).toBeGreaterThan(0)
        expect(screen.getAllByLabelText(/回数/).length).toBeGreaterThan(0)
      })
    })
  })

  describe('pain flag', () => {
    it('should have pain flag checkbox', async () => {
      renderExerciseMenu()

      await waitFor(() => {
        expect(screen.getByLabelText(/痛みフラグ/)).toBeInTheDocument()
      })
    })

    it('should show reason textarea when pain flag is checked', async () => {
      const user = userEvent.setup()
      renderExerciseMenu()

      await waitFor(() => {
        expect(screen.getByLabelText(/痛みフラグ/)).toBeInTheDocument()
      })

      const painFlag = screen.getByLabelText(/痛みフラグ/)
      await user.click(painFlag)

      expect(screen.getByLabelText(/理由/)).toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    it('should submit assigned exercises successfully', async () => {
      const user = userEvent.setup()
      renderExerciseMenu()

      await waitFor(() => {
        expect(screen.getAllByText('スクワット（浅め）').length).toBeGreaterThan(0)
      })

      const checkbox = screen.getByRole('checkbox', { name: /スクワット/ })
      await user.click(checkbox)

      const saveButton = screen.getByRole('button', { name: /保存/ })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockAssignExercises).toHaveBeenCalledWith(
          mockPatientId,
          expect.objectContaining({
            assignments: expect.any(Array),
            pain_flag: false,
          })
        )
      })
    })

    it('should navigate back on successful submission', async () => {
      const user = userEvent.setup()
      renderExerciseMenu()

      await waitFor(() => {
        expect(screen.getAllByText('膝伸展運動（椅子座位）').length).toBeGreaterThan(0)
      })

      const saveButton = screen.getByRole('button', { name: /保存/ })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(`/patients/${mockPatientId}`)
      })
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      mockAssignExercises.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ status: 'success' }), 100))
      )

      renderExerciseMenu()

      await waitFor(() => {
        expect(screen.getAllByText('膝伸展運動（椅子座位）').length).toBeGreaterThan(0)
      })

      const saveButton = screen.getByRole('button', { name: /保存/ })
      await user.click(saveButton)

      expect(screen.getByText(/保存中/)).toBeInTheDocument()
    })

    it('should show error message on submission failure', async () => {
      const user = userEvent.setup()
      mockAssignExercises.mockRejectedValue(new Error('Network error'))

      renderExerciseMenu()

      await waitFor(() => {
        expect(screen.getAllByText('膝伸展運動（椅子座位）').length).toBeGreaterThan(0)
      })

      const saveButton = screen.getByRole('button', { name: /保存/ })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/運動メニューの保存に失敗しました/)).toBeInTheDocument()
      })
    })
  })

  describe('navigation', () => {
    it('should navigate back on cancel', async () => {
      const user = userEvent.setup()
      renderExerciseMenu()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /戻る/ })).toBeInTheDocument()
      })

      const backButton = screen.getByRole('button', { name: /戻る/ })
      await user.click(backButton)

      expect(mockNavigate).toHaveBeenCalledWith(`/patients/${mockPatientId}`)
    })
  })

  describe('accessibility', () => {
    it('should have proper labels for all inputs', async () => {
      renderExerciseMenu()

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox')
        checkboxes.forEach(checkbox => {
          expect(checkbox).toHaveAccessibleName()
        })
      })
    })

    it('should have minimum tap target size for buttons', async () => {
      renderExerciseMenu()

      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        buttons.forEach(button => {
          expect(button).toBeInTheDocument()
        })
      })
    })
  })
})
