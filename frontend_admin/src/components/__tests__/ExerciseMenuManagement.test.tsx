import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { ExerciseMenuManagement } from '../ExerciseMenuManagement'
import type { ExerciseMasterDetail } from '../../lib/api-types'

// Mock API
vi.mock('../../lib/api', () => ({
  api: {
    getExerciseMasterList: vi.fn(),
    createExerciseMaster: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number
    errors?: Record<string, string[]>
    constructor(message: string, status: number, errors?: Record<string, string[]>) {
      super(message)
      this.name = 'ApiError'
      this.status = status
      this.errors = errors
    }
  },
}))

import { api } from '../../lib/api'

const mockExercises: ExerciseMasterDetail[] = [
  {
    id: 'ex-1',
    name: 'スクワット',
    description: '下半身の筋力トレーニング',
    category: '筋力',
    difficulty: 'medium',
    target_body_part: '下肢',
    recommended_reps: 10,
    recommended_sets: 3,
    video_url: '/videos/squat.mp4',
    thumbnail_url: '/thumbnails/squat.jpg',
    duration_seconds: 120,
  },
  {
    id: 'ex-2',
    name: '片足立ち',
    description: 'バランス能力の向上',
    category: 'バランス',
    difficulty: 'easy',
    target_body_part: '体幹',
    recommended_reps: 5,
    recommended_sets: 2,
    video_url: null,
    thumbnail_url: null,
    duration_seconds: 60,
  },
  {
    id: 'ex-3',
    name: 'ストレッチ',
    description: null,
    category: '柔軟性',
    difficulty: 'easy',
    target_body_part: null,
    recommended_reps: null,
    recommended_sets: null,
    video_url: null,
    thumbnail_url: null,
    duration_seconds: null,
  },
]

function renderExerciseMenuManagement() {
  return render(
    <BrowserRouter>
      <ExerciseMenuManagement />
    </BrowserRouter>
  )
}

describe('S-10 ExerciseMenuManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.getExerciseMasterList).mockResolvedValue({
      status: 'success',
      data: {
        exercises: mockExercises,
      },
    })
  })

  describe('rendering', () => {
    it('should render page title', async () => {
      renderExerciseMenuManagement()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '運動メニュー管理' })).toBeInTheDocument()
      })
    })

    it('should render total count display', async () => {
      renderExerciseMenuManagement()

      await waitFor(() => {
        expect(screen.getByText(/全3件の運動マスタ/)).toBeInTheDocument()
      })
    })

    it('should render create exercise button', async () => {
      renderExerciseMenuManagement()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新規運動登録/ })).toBeInTheDocument()
      })
    })
  })

  describe('exercise table', () => {
    it('should render table headers', async () => {
      renderExerciseMenuManagement()

      await waitFor(() => {
        expect(screen.getByRole('columnheader', { name: '運動名' })).toBeInTheDocument()
        expect(screen.getByRole('columnheader', { name: 'カテゴリ' })).toBeInTheDocument()
        expect(screen.getByRole('columnheader', { name: '難易度' })).toBeInTheDocument()
        expect(screen.getByRole('columnheader', { name: '対象部位' })).toBeInTheDocument()
        expect(screen.getByRole('columnheader', { name: '推奨回数' })).toBeInTheDocument()
        expect(screen.getByRole('columnheader', { name: '推奨セット数' })).toBeInTheDocument()
        expect(screen.getByRole('columnheader', { name: '所要時間' })).toBeInTheDocument()
      })
    })

    it('should render exercise rows', async () => {
      renderExerciseMenuManagement()

      await waitFor(() => {
        expect(screen.getByText('スクワット')).toBeInTheDocument()
        expect(screen.getByText('片足立ち')).toBeInTheDocument()
        expect(screen.getByText('ストレッチ')).toBeInTheDocument()
      })
    })

    it('should render exercise details', async () => {
      renderExerciseMenuManagement()

      await waitFor(() => {
        expect(screen.getByText('下半身の筋力トレーニング')).toBeInTheDocument()
        expect(screen.getByText('下肢')).toBeInTheDocument()
        expect(screen.getByText('2分')).toBeInTheDocument()
      })
    })

    it('should render CategoryBadge with correct styles', async () => {
      renderExerciseMenuManagement()

      await waitFor(() => {
        const categoryBadges = screen.getAllByText('筋力')
        const tableBadge = categoryBadges.find((badge) =>
          badge.classList.contains('bg-red-100')
        )
        expect(tableBadge).toBeDefined()
        expect(tableBadge!).toHaveClass('bg-red-100', 'text-red-700', 'border-red-200')
      })
    })

    it('should render DifficultyBadge with correct styles and labels', async () => {
      renderExerciseMenuManagement()

      await waitFor(() => {
        // Check medium difficulty badge
        const mediumBadges = screen.getAllByText('普通')
        const mediumBadge = mediumBadges.find((badge) =>
          badge.classList.contains('bg-yellow-100')
        )
        expect(mediumBadge).toBeDefined()
        expect(mediumBadge!).toHaveClass('bg-yellow-100', 'text-yellow-700', 'border-yellow-200')

        // Check easy difficulty badge
        const easyBadges = screen.getAllByText('易しい')
        const easyBadge = easyBadges.find((badge) =>
          badge.classList.contains('bg-green-100')
        )
        expect(easyBadge).toBeDefined()
        expect(easyBadge!).toHaveClass('bg-green-100', 'text-green-700', 'border-green-200')
      })
    })

    it('should display dash for null values', async () => {
      renderExerciseMenuManagement()

      await waitFor(() => {
        const rows = screen.getAllByRole('row')
        const stretchRow = rows.find((row) => row.textContent?.includes('ストレッチ'))
        expect(stretchRow).toBeDefined()
        expect(within(stretchRow!).getAllByText('-').length).toBeGreaterThan(0)
      })
    })
  })

  describe('filtering', () => {
    it('should filter by category', async () => {
      const user = userEvent.setup()
      renderExerciseMenuManagement()

      await waitFor(() => {
        expect(screen.getByText('スクワット')).toBeInTheDocument()
        expect(screen.getByText('片足立ち')).toBeInTheDocument()
        expect(screen.getByText('ストレッチ')).toBeInTheDocument()
      })

      const categoryFilter = screen.getByLabelText('カテゴリフィルター')
      await user.selectOptions(categoryFilter, '筋力')

      await waitFor(() => {
        expect(screen.getByText('スクワット')).toBeInTheDocument()
        expect(screen.queryByText('片足立ち')).not.toBeInTheDocument()
        expect(screen.queryByText('ストレッチ')).not.toBeInTheDocument()
      })
    })

    it('should filter by difficulty', async () => {
      const user = userEvent.setup()
      renderExerciseMenuManagement()

      await waitFor(() => {
        expect(screen.getByText('スクワット')).toBeInTheDocument()
        expect(screen.getByText('片足立ち')).toBeInTheDocument()
      })

      const difficultyFilter = screen.getByLabelText('難易度フィルター')
      await user.selectOptions(difficultyFilter, 'easy')

      await waitFor(() => {
        expect(screen.queryByText('スクワット')).not.toBeInTheDocument()
        expect(screen.getByText('片足立ち')).toBeInTheDocument()
        expect(screen.getByText('ストレッチ')).toBeInTheDocument()
      })
    })

    it('should search by name', async () => {
      const user = userEvent.setup()
      renderExerciseMenuManagement()

      await waitFor(() => {
        expect(screen.getByText('スクワット')).toBeInTheDocument()
      })

      const searchInput = screen.getByLabelText('検索')
      await user.type(searchInput, 'スクワット')

      await waitFor(() => {
        expect(screen.getByText('スクワット')).toBeInTheDocument()
        expect(screen.queryByText('片足立ち')).not.toBeInTheDocument()
        expect(screen.queryByText('ストレッチ')).not.toBeInTheDocument()
      })
    })

    it('should search by description', async () => {
      const user = userEvent.setup()
      renderExerciseMenuManagement()

      await waitFor(() => {
        expect(screen.getByText('スクワット')).toBeInTheDocument()
      })

      const searchInput = screen.getByLabelText('検索')
      await user.type(searchInput, 'バランス')

      await waitFor(() => {
        expect(screen.queryByText('スクワット')).not.toBeInTheDocument()
        expect(screen.getByText('片足立ち')).toBeInTheDocument()
      })
    })

    it('should search by target body part', async () => {
      const user = userEvent.setup()
      renderExerciseMenuManagement()

      await waitFor(() => {
        expect(screen.getByText('スクワット')).toBeInTheDocument()
      })

      const searchInput = screen.getByLabelText('検索')
      await user.type(searchInput, '下肢')

      await waitFor(() => {
        expect(screen.getByText('スクワット')).toBeInTheDocument()
        expect(screen.queryByText('片足立ち')).not.toBeInTheDocument()
      })
    })

    it('should combine filters', async () => {
      const user = userEvent.setup()
      renderExerciseMenuManagement()

      await waitFor(() => {
        expect(screen.getByText('スクワット')).toBeInTheDocument()
      })

      const categoryFilter = screen.getByLabelText('カテゴリフィルター')
      await user.selectOptions(categoryFilter, 'バランス')

      const difficultyFilter = screen.getByLabelText('難易度フィルター')
      await user.selectOptions(difficultyFilter, 'easy')

      await waitFor(() => {
        expect(screen.queryByText('スクワット')).not.toBeInTheDocument()
        expect(screen.getByText('片足立ち')).toBeInTheDocument()
        expect(screen.queryByText('ストレッチ')).not.toBeInTheDocument()
      })
    })
  })

  describe('empty state', () => {
    it('should show empty message when no exercises exist', async () => {
      vi.mocked(api.getExerciseMasterList).mockResolvedValue({
        status: 'success',
        data: { exercises: [] },
      })

      renderExerciseMenuManagement()

      await waitFor(() => {
        expect(screen.getByText('運動マスタが登録されていません')).toBeInTheDocument()
      })
    })

    it('should show filter empty state when no matches', async () => {
      const user = userEvent.setup()
      renderExerciseMenuManagement()

      await waitFor(() => {
        expect(screen.getByText('スクワット')).toBeInTheDocument()
      })

      const searchInput = screen.getByLabelText('検索')
      await user.type(searchInput, '存在しない運動名')

      await waitFor(() => {
        expect(screen.getByText('条件に一致する運動がありません')).toBeInTheDocument()
      })
    })
  })

  describe('create dialog', () => {
    it('should open dialog when create button is clicked', async () => {
      const user = userEvent.setup()
      renderExerciseMenuManagement()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新規運動登録/ })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /新規運動登録/ }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: '新規運動登録' })).toBeInTheDocument()
      })
    })

    it('should render all input fields', async () => {
      const user = userEvent.setup()
      renderExerciseMenuManagement()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新規運動登録/ })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /新規運動登録/ }))

      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        expect(within(dialog).getByLabelText(/^運動名/)).toBeInTheDocument()
        expect(within(dialog).getByLabelText(/説明/)).toBeInTheDocument()
        expect(within(dialog).getByLabelText(/^カテゴリ/)).toBeInTheDocument()
        expect(within(dialog).getByLabelText(/^難易度/)).toBeInTheDocument()
        expect(within(dialog).getByLabelText(/対象部位/)).toBeInTheDocument()
        expect(within(dialog).getByLabelText(/推奨回数/)).toBeInTheDocument()
        expect(within(dialog).getByLabelText(/推奨セット数/)).toBeInTheDocument()
        expect(within(dialog).getByLabelText(/動画URL/)).toBeInTheDocument()
        expect(within(dialog).getByLabelText(/サムネイルURL/)).toBeInTheDocument()
        expect(within(dialog).getByLabelText(/所要時間/)).toBeInTheDocument()
      })
    })

    it('should close dialog when cancel button is clicked', async () => {
      const user = userEvent.setup()
      renderExerciseMenuManagement()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新規運動登録/ })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /新規運動登録/ }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'キャンセル' }))

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })

  describe('form validation', () => {
    it('should show error when name is empty', async () => {
      const user = userEvent.setup()
      renderExerciseMenuManagement()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新規運動登録/ })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /新規運動登録/ }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: '登録' }))

      await waitFor(() => {
        expect(screen.getByText('運動名を入力してください')).toBeInTheDocument()
      })
    })

    it('should show error when category is not selected', async () => {
      const user = userEvent.setup()
      renderExerciseMenuManagement()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新規運動登録/ })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /新規運動登録/ }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/^運動名/), 'テスト運動')
      await user.click(screen.getByRole('button', { name: '登録' }))

      await waitFor(() => {
        expect(screen.getByText('カテゴリを選択してください')).toBeInTheDocument()
      })
    })

    it('should show error when difficulty is not selected', async () => {
      const user = userEvent.setup()
      renderExerciseMenuManagement()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新規運動登録/ })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /新規運動登録/ }))

      const dialog = await screen.findByRole('dialog')

      await user.type(within(dialog).getByLabelText(/^運動名/), 'テスト運動')
      await user.selectOptions(within(dialog).getByLabelText(/^カテゴリ/), '筋力')
      await user.click(screen.getByRole('button', { name: '登録' }))

      await waitFor(() => {
        expect(screen.getByText('難易度を選択してください')).toBeInTheDocument()
      })
    })

    it('should accept valid form data and submit', async () => {
      const user = userEvent.setup()
      vi.mocked(api.createExerciseMaster).mockResolvedValue({
        status: 'success',
        data: {
          exercise: {
            id: 'ex-new', name: 'テスト運動', description: null,
            category: '筋力', difficulty: 'easy', target_body_part: null,
            recommended_reps: null, recommended_sets: null,
            video_url: null, thumbnail_url: null, duration_seconds: null,
          },
        },
      })

      renderExerciseMenuManagement()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新規運動登録/ })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /新規運動登録/ }))

      const dialog = await screen.findByRole('dialog')

      await user.type(within(dialog).getByLabelText(/^運動名/), 'テスト運動')
      await user.selectOptions(within(dialog).getByLabelText(/^カテゴリ/), '筋力')
      await user.selectOptions(within(dialog).getByLabelText(/^難易度/), 'easy')
      await user.click(within(dialog).getByRole('button', { name: '登録' }))

      await waitFor(() => {
        expect(api.createExerciseMaster).toHaveBeenCalled()
      })
    })
  })

  describe('form submission', () => {
    it('should submit form and show success message', async () => {
      const user = userEvent.setup()
      vi.mocked(api.createExerciseMaster).mockResolvedValue({
        status: 'success',
        data: {
          exercise: {
            id: 'ex-4',
            name: '新規運動',
            description: 'テスト用運動',
            category: '筋力',
            difficulty: 'easy',
            target_body_part: '上肢',
            recommended_reps: 8,
            recommended_sets: 2,
            video_url: null,
            thumbnail_url: null,
            duration_seconds: 90,
          },
        },
      })

      renderExerciseMenuManagement()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新規運動登録/ })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /新規運動登録/ }))

      const dialog = await screen.findByRole('dialog')

      await user.type(within(dialog).getByLabelText(/^運動名/), '新規運動')
      await user.type(within(dialog).getByLabelText(/説明/), 'テスト用運動')
      await user.selectOptions(within(dialog).getByLabelText(/^カテゴリ/), '筋力')
      await user.selectOptions(within(dialog).getByLabelText(/^難易度/), 'easy')
      await user.type(within(dialog).getByLabelText(/対象部位/), '上肢')
      await user.type(within(dialog).getByLabelText(/推奨回数/), '8')
      await user.type(within(dialog).getByLabelText(/推奨セット数/), '2')
      await user.type(within(dialog).getByLabelText(/所要時間/), '90')

      await user.click(within(dialog).getByRole('button', { name: '登録' }))

      await waitFor(() => {
        expect(screen.getByText('運動を登録しました')).toBeInTheDocument()
      })

      expect(api.createExerciseMaster).toHaveBeenCalledWith({
        name: '新規運動',
        description: 'テスト用運動',
        category: '筋力',
        difficulty: 'easy',
        target_body_part: '上肢',
        recommended_reps: 8,
        recommended_sets: 2,
        duration_seconds: 90,
      })
    })

    it('should refresh list after successful submission', async () => {
      const user = userEvent.setup()
      vi.mocked(api.createExerciseMaster).mockResolvedValue({
        status: 'success',
        data: {
          exercise: {
            id: 'ex-4',
            name: '新規運動',
            description: null,
            category: '筋力',
            difficulty: 'easy',
            target_body_part: null,
            recommended_reps: null,
            recommended_sets: null,
            video_url: null,
            thumbnail_url: null,
            duration_seconds: null,
          },
        },
      })

      renderExerciseMenuManagement()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新規運動登録/ })).toBeInTheDocument()
      })

      expect(api.getExerciseMasterList).toHaveBeenCalledTimes(1)

      await user.click(screen.getByRole('button', { name: /新規運動登録/ }))

      const dialog = await screen.findByRole('dialog')

      await user.type(within(dialog).getByLabelText(/^運動名/), '新規運動')
      await user.selectOptions(within(dialog).getByLabelText(/^カテゴリ/), '筋力')
      await user.selectOptions(within(dialog).getByLabelText(/^難易度/), 'easy')

      await user.click(within(dialog).getByRole('button', { name: '登録' }))

      await waitFor(() => {
        expect(screen.getByText('運動を登録しました')).toBeInTheDocument()
      })

      // Wait for dialog to close and list to refresh
      await waitFor(
        () => {
          expect(api.getExerciseMasterList).toHaveBeenCalledTimes(2)
        },
        { timeout: 2000 }
      )
    })

    it('should show error message on API failure', async () => {
      const user = userEvent.setup()
      vi.mocked(api.createExerciseMaster).mockRejectedValue(new Error('登録に失敗しました'))

      renderExerciseMenuManagement()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新規運動登録/ })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /新規運動登録/ }))

      const dialog = await screen.findByRole('dialog')

      await user.type(within(dialog).getByLabelText(/^運動名/), '新規運動')
      await user.selectOptions(within(dialog).getByLabelText(/^カテゴリ/), '筋力')
      await user.selectOptions(within(dialog).getByLabelText(/^難易度/), 'easy')

      await user.click(within(dialog).getByRole('button', { name: '登録' }))

      await waitFor(() => {
        expect(screen.getByText('登録に失敗しました')).toBeInTheDocument()
      })
    })
  })

  describe('loading state', () => {
    it('should show loading indicator while fetching exercises', async () => {
      vi.mocked(api.getExerciseMasterList).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  status: 'success',
                  data: { exercises: [] },
                }),
              100
            )
          )
      )

      renderExerciseMenuManagement()

      expect(screen.getByText('読み込み中...')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper table structure', async () => {
      renderExerciseMenuManagement()

      await waitFor(() => {
        const table = screen.getByRole('table')
        expect(table).toBeInTheDocument()
        expect(within(table).getAllByRole('columnheader')).toHaveLength(7)
      })
    })

    it('should have minimum tap target size for buttons', async () => {
      renderExerciseMenuManagement()

      await waitFor(() => {
        const createButton = screen.getByRole('button', { name: /新規運動登録/ })
        expect(createButton).toHaveClass('min-h-[44px]')
      })
    })

    it('should have accessible form labels', async () => {
      const user = userEvent.setup()
      renderExerciseMenuManagement()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新規運動登録/ })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /新規運動登録/ }))

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/^運動名/)
        expect(nameInput).toHaveAccessibleName()
      })
    })

    it('should have aria-invalid on error fields', async () => {
      const user = userEvent.setup()
      renderExerciseMenuManagement()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新規運動登録/ })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /新規運動登録/ }))
      await user.click(screen.getByRole('button', { name: '登録' }))

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/^運動名/)
        expect(nameInput).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('should have dialog role with aria attributes', async () => {
      const user = userEvent.setup()
      renderExerciseMenuManagement()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新規運動登録/ })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /新規運動登録/ }))

      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        expect(dialog).toHaveAttribute('aria-modal', 'true')
        expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title')
      })
    })
  })
})
