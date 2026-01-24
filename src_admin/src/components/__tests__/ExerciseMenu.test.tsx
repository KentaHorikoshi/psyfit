import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExerciseMenu } from '../ExerciseMenu'
import type { ExerciseMaster } from '../../lib/api-types'

// Mock API client
const mockGetExerciseMasters = vi.fn()
const mockGetPatientExercises = vi.fn()
const mockAssignExercises = vi.fn()

vi.mock('../../lib/api-client', () => ({
  default: {
    getExerciseMasters: () => mockGetExerciseMasters(),
    getPatientExercises: (patientId: string) => mockGetPatientExercises(patientId),
    assignExercises: (patientId: string, data: any) => mockAssignExercises(patientId, data),
  },
}))

const mockNavigate = vi.fn()

const mockExerciseMasters: ExerciseMaster[] = [
  {
    id: 'e1',
    name: '膝伸展運動（椅子座位）',
    category: '膝',
    description: '椅子に座った状態で膝を伸ばす',
    video_url: 'https://example.com/video1.mp4',
    default_sets: 3,
    default_reps: 10,
  },
  {
    id: 'e2',
    name: 'スクワット（浅め）',
    category: '膝',
    description: '膝を軽く曲げる浅めのスクワット',
    video_url: 'https://example.com/video2.mp4',
    default_sets: 3,
    default_reps: 15,
  },
  {
    id: 'e3',
    name: '腰椎ストレッチ',
    category: '腰',
    description: '腰部の柔軟性向上',
    video_url: 'https://example.com/video3.mp4',
    default_sets: 2,
    default_reps: 10,
  },
  {
    id: 'e4',
    name: 'ウォーキング（平地）',
    category: '全身',
    description: '平地での歩行練習',
    video_url: 'https://example.com/video4.mp4',
    default_sets: 1,
    default_reps: 20,
  },
  {
    id: 'e5',
    name: '肩関節可動域訓練',
    category: '上肢',
    description: '肩の可動域改善',
    video_url: 'https://example.com/video5.mp4',
    default_sets: 2,
    default_reps: 12,
  },
]

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
        assignments: [],
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
      render(<ExerciseMenu patientId="patient-1" onNavigate={mockNavigate} />)

      await waitFor(() => {
        expect(screen.getByText('運動メニュー設定')).toBeInTheDocument()
      })
    })

    it('should load and display exercise masters grouped by category', async () => {
      render(<ExerciseMenu patientId="patient-1" onNavigate={mockNavigate} />)

      await waitFor(() => {
        expect(screen.getByText('膝')).toBeInTheDocument()
        expect(screen.getByText('腰')).toBeInTheDocument()
        expect(screen.getByText('全身')).toBeInTheDocument()
        expect(screen.getByText('上肢')).toBeInTheDocument()
      })

      expect(mockGetExerciseMasters).toHaveBeenCalled()
    })

    it('should render update button', async () => {
      render(<ExerciseMenu patientId="patient-1" onNavigate={mockNavigate} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /メニューを更新/ })).toBeInTheDocument()
      })
    })

    it('should render pain flag toggle', async () => {
      render(<ExerciseMenu patientId="patient-1" onNavigate={mockNavigate} />)

      await waitFor(() => {
        expect(screen.getByText('痛みの状態')).toBeInTheDocument()
      })
    })

    it('should render reason textarea', async () => {
      render(<ExerciseMenu patientId="patient-1" onNavigate={mockNavigate} />)

      await waitFor(() => {
        expect(screen.getByText('設定理由')).toBeInTheDocument()
        expect(screen.getByRole('textbox')).toBeInTheDocument()
      })
    })
  })

  describe('category expansion', () => {
    it('should expand category to show exercises when clicked', async () => {
      const user = userEvent.setup()
      render(<ExerciseMenu patientId="patient-1" onNavigate={mockNavigate} />)

      await waitFor(() => {
        expect(screen.getByText('膝')).toBeInTheDocument()
      })

      // Click category to expand
      const categoryButton = screen.getByText('膝').closest('button')!
      await user.click(categoryButton)

      // Should show exercises in that category
      await waitFor(() => {
        expect(screen.getByText('膝伸展運動（椅子座位）')).toBeInTheDocument()
        expect(screen.getByText('スクワット（浅め）')).toBeInTheDocument()
      })
    })

    it('should collapse category when clicked again', async () => {
      const user = userEvent.setup()
      render(<ExerciseMenu patientId="patient-1" onNavigate={mockNavigate} />)

      await waitFor(() => {
        expect(screen.getByText('膝')).toBeInTheDocument()
      })

      const categoryButton = screen.getByText('膝').closest('button')!

      // Expand
      await user.click(categoryButton)
      await waitFor(() => {
        expect(screen.getByText('膝伸展運動（椅子座位）')).toBeInTheDocument()
      })

      // Collapse
      await user.click(categoryButton)
      await waitFor(() => {
        expect(screen.queryByText('膝伸展運動（椅子座位）')).not.toBeInTheDocument()
      })
    })
  })

  describe('exercise selection', () => {
    it('should allow selecting exercises', async () => {
      const user = userEvent.setup()
      render(<ExerciseMenu patientId="patient-1" onNavigate={mockNavigate} />)

      await waitFor(() => {
        expect(screen.getByText('膝')).toBeInTheDocument()
      })

      // Expand category
      const categoryButton = screen.getByText('膝').closest('button')!
      await user.click(categoryButton)

      await waitFor(() => {
        expect(screen.getByText('膝伸展運動（椅子座位）')).toBeInTheDocument()
      })

      // Select exercise
      const checkbox = screen.getByLabelText('膝伸展運動（椅子座位）').closest('label')!.querySelector('input')!
      await user.click(checkbox)

      expect(checkbox).toBeChecked()
    })

    it('should allow selecting multiple exercises', async () => {
      const user = userEvent.setup()
      render(<ExerciseMenu patientId="patient-1" onNavigate={mockNavigate} />)

      await waitFor(() => {
        expect(screen.getByText('膝')).toBeInTheDocument()
      })

      // Expand category
      const categoryButton = screen.getByText('膝').closest('button')!
      await user.click(categoryButton)

      await waitFor(() => {
        expect(screen.getByText('膝伸展運動（椅子座位）')).toBeInTheDocument()
      })

      // Select multiple exercises
      const checkbox1 = screen.getByLabelText('膝伸展運動（椅子座位）').closest('label')!.querySelector('input')!
      const checkbox2 = screen.getByLabelText('スクワット（浅め）').closest('label')!.querySelector('input')!

      await user.click(checkbox1)
      await user.click(checkbox2)

      expect(checkbox1).toBeChecked()
      expect(checkbox2).toBeChecked()
    })

    it('should update selected count display', async () => {
      const user = userEvent.setup()
      render(<ExerciseMenu patientId="patient-1" onNavigate={mockNavigate} />)

      await waitFor(() => {
        expect(screen.getByText('膝')).toBeInTheDocument()
      })

      // Initially 0
      expect(screen.getByText(/0 種目/)).toBeInTheDocument()

      // Expand and select
      const categoryButton = screen.getByText('膝').closest('button')!
      await user.click(categoryButton)

      await waitFor(() => {
        expect(screen.getByText('膝伸展運動（椅子座位）')).toBeInTheDocument()
      })

      const checkbox = screen.getByLabelText('膝伸展運動（椅子座位）').closest('label')!.querySelector('input')!
      await user.click(checkbox)

      // Should show 1
      expect(screen.getByText(/1 種目/)).toBeInTheDocument()
    })
  })

  describe('pain flag', () => {
    it('should toggle pain flag', async () => {
      const user = userEvent.setup()
      render(<ExerciseMenu patientId="patient-1" onNavigate={mockNavigate} />)

      await waitFor(() => {
        expect(screen.getByText('痛みの状態')).toBeInTheDocument()
      })

      const toggle = screen.getByRole('checkbox', { name: /痛みがある場合/ })
      expect(toggle).not.toBeChecked()

      await user.click(toggle)
      expect(toggle).toBeChecked()

      // Should show warning
      expect(screen.getByText(/痛みに配慮したメニューになります/)).toBeInTheDocument()
    })
  })

  describe('reason input', () => {
    it('should allow editing reason text', async () => {
      const user = userEvent.setup()
      render(<ExerciseMenu patientId="patient-1" onNavigate={mockNavigate} />)

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument()
      })

      const textarea = screen.getByRole('textbox')

      await user.clear(textarea)
      await user.type(textarea, '膝関節の可動域改善のため')

      expect(textarea).toHaveValue('膝関節の可動域改善のため')
    })
  })

  describe('form submission', () => {
    it('should submit selected exercises with API call', async () => {
      const user = userEvent.setup()
      render(<ExerciseMenu patientId="patient-1" onNavigate={mockNavigate} />)

      await waitFor(() => {
        expect(screen.getByText('膝')).toBeInTheDocument()
      })

      // Expand and select exercises
      const categoryButton = screen.getByText('膝').closest('button')!
      await user.click(categoryButton)

      await waitFor(() => {
        expect(screen.getByText('膝伸展運動（椅子座位）')).toBeInTheDocument()
      })

      const checkbox1 = screen.getByLabelText('膝伸展運動（椅子座位）').closest('label')!.querySelector('input')!
      await user.click(checkbox1)

      // Submit
      const submitButton = screen.getByRole('button', { name: /メニューを更新/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAssignExercises).toHaveBeenCalledWith('patient-1', expect.objectContaining({
          assignments: expect.arrayContaining([
            expect.objectContaining({
              exercise_id: 'e1',
            }),
          ]),
          pain_flag: false,
        }))
      })
    })

    it('should navigate to patient detail on successful submission', async () => {
      const user = userEvent.setup()
      render(<ExerciseMenu patientId="patient-1" onNavigate={mockNavigate} />)

      await waitFor(() => {
        expect(screen.getByText('膝')).toBeInTheDocument()
      })

      // Expand and select
      const categoryButton = screen.getByText('膝').closest('button')!
      await user.click(categoryButton)

      await waitFor(() => {
        expect(screen.getByText('膝伸展運動（椅子座位）')).toBeInTheDocument()
      })

      const checkbox = screen.getByLabelText('膝伸展運動（椅子座位）').closest('label')!.querySelector('input')!
      await user.click(checkbox)

      // Submit
      const submitButton = screen.getByRole('button', { name: /メニューを更新/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('patient-detail', 'patient-1')
      })
    })

    it('should show error message on submission failure', async () => {
      const user = userEvent.setup()
      mockAssignExercises.mockRejectedValue(new Error('Network error'))

      render(<ExerciseMenu patientId="patient-1" onNavigate={mockNavigate} />)

      await waitFor(() => {
        expect(screen.getByText('膝')).toBeInTheDocument()
      })

      // Expand and select
      const categoryButton = screen.getByText('膝').closest('button')!
      await user.click(categoryButton)

      await waitFor(() => {
        expect(screen.getByText('膝伸展運動（椅子座位）')).toBeInTheDocument()
      })

      const checkbox = screen.getByLabelText('膝伸展運動（椅子座位）').closest('label')!.querySelector('input')!
      await user.click(checkbox)

      // Submit
      const submitButton = screen.getByRole('button', { name: /メニューを更新/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/更新に失敗しました/)).toBeInTheDocument()
      })
    })

    it('should include pain flag in submission', async () => {
      const user = userEvent.setup()
      render(<ExerciseMenu patientId="patient-1" onNavigate={mockNavigate} />)

      await waitFor(() => {
        expect(screen.getByText('膝')).toBeInTheDocument()
      })

      // Toggle pain flag
      const painToggle = screen.getByRole('checkbox', { name: /痛みがある場合/ })
      await user.click(painToggle)

      // Expand and select
      const categoryButton = screen.getByText('膝').closest('button')!
      await user.click(categoryButton)

      await waitFor(() => {
        expect(screen.getByText('膝伸展運動（椅子座位）')).toBeInTheDocument()
      })

      const checkbox = screen.getByLabelText('膝伸展運動（椅子座位）').closest('label')!.querySelector('input')!
      await user.click(checkbox)

      // Submit
      const submitButton = screen.getByRole('button', { name: /メニューを更新/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAssignExercises).toHaveBeenCalledWith('patient-1', expect.objectContaining({
          pain_flag: true,
        }))
      })
    })

    it('should include reason in submission', async () => {
      const user = userEvent.setup()
      render(<ExerciseMenu patientId="patient-1" onNavigate={mockNavigate} />)

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument()
      })

      // Set reason
      const textarea = screen.getByRole('textbox')
      await user.clear(textarea)
      await user.type(textarea, '膝関節の可動域改善のため')

      // Expand and select
      await waitFor(() => {
        expect(screen.getByText('膝')).toBeInTheDocument()
      })

      const categoryButton = screen.getByText('膝').closest('button')!
      await user.click(categoryButton)

      await waitFor(() => {
        expect(screen.getByText('膝伸展運動（椅子座位）')).toBeInTheDocument()
      })

      const checkbox = screen.getByLabelText('膝伸展運動（椅子座位）').closest('label')!.querySelector('input')!
      await user.click(checkbox)

      // Submit
      const submitButton = screen.getByRole('button', { name: /メニューを更新/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAssignExercises).toHaveBeenCalledWith('patient-1', expect.objectContaining({
          reason: '膝関節の可動域改善のため',
        }))
      })
    })
  })

  describe('accessibility', () => {
    it('should have proper heading structure', async () => {
      render(<ExerciseMenu patientId="patient-1" onNavigate={mockNavigate} />)

      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 1 })
        expect(heading).toBeInTheDocument()
        expect(heading).toHaveTextContent('運動メニュー設定')
      })
    })

    it('should have accessible checkboxes', async () => {
      const user = userEvent.setup()
      render(<ExerciseMenu patientId="patient-1" onNavigate={mockNavigate} />)

      await waitFor(() => {
        expect(screen.getByText('膝')).toBeInTheDocument()
      })

      // Expand category
      const categoryButton = screen.getByText('膝').closest('button')!
      await user.click(categoryButton)

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox')
        checkboxes.forEach(checkbox => {
          expect(checkbox).toHaveAccessibleName()
        })
      })
    })

    it('should have accessible submit button', async () => {
      render(<ExerciseMenu patientId="patient-1" onNavigate={mockNavigate} />)

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /メニューを更新/ })
        expect(button).toHaveAccessibleName()
      })
    })
  })

  describe('loading state', () => {
    it('should show loading state while fetching exercises', () => {
      mockGetExerciseMasters.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ data: { exercises: [] } }), 1000))
      )

      render(<ExerciseMenu patientId="patient-1" onNavigate={mockNavigate} />)

      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('should show message when no exercise masters available', async () => {
      mockGetExerciseMasters.mockResolvedValue({
        status: 'success',
        data: {
          exercises: [],
        },
      })

      render(<ExerciseMenu patientId="patient-1" onNavigate={mockNavigate} />)

      await waitFor(() => {
        expect(screen.getByText(/運動マスタがありません/)).toBeInTheDocument()
      })
    })
  })
})
