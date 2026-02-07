import { useState, useEffect, useMemo } from 'react'
import { Plus, Search, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { ApiError } from '../lib/api'
import type { ExerciseMasterDetail, CreateExerciseMasterRequest } from '../lib/api-types'

type Category = '筋力' | 'バランス' | '柔軟性'
type Difficulty = 'easy' | 'medium' | 'hard'

const CATEGORY_STYLES: Record<Category, string> = {
  '筋力': 'bg-red-100 text-red-700 border-red-200',
  'バランス': 'bg-blue-100 text-blue-700 border-blue-200',
  '柔軟性': 'bg-green-100 text-green-700 border-green-200',
}

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  easy: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  hard: 'bg-red-100 text-red-700 border-red-200',
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '易しい',
  medium: '普通',
  hard: '難しい',
}

function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${CATEGORY_STYLES[category]}`}>
      {category}
    </span>
  )
}

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${DIFFICULTY_STYLES[difficulty]}`}>
      {DIFFICULTY_LABELS[difficulty]}
    </span>
  )
}

interface FormErrors {
  name?: string
  category?: string
  difficulty?: string
  target_body_part?: string
  recommended_reps?: string
  recommended_sets?: string
  video_url?: string
  thumbnail_url?: string
  duration_seconds?: string
}

interface DeleteConfirmDialogProps {
  isOpen: boolean
  exercise: ExerciseMasterDetail | null
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
  error: string | null
}

function DeleteConfirmDialog({ isOpen, exercise, onClose, onConfirm, isDeleting, error }: DeleteConfirmDialogProps) {
  if (!isOpen || !exercise) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 id="delete-dialog-title" className="text-xl font-bold text-gray-900 mb-4">
            運動の削除
          </h2>
          <p className="text-base text-gray-700 mb-2">
            以下の運動を削除しますか？
          </p>
          <p className="text-base font-medium text-gray-900 mb-4">
            {exercise.name}
          </p>
          <p className="text-sm text-gray-500">
            この操作は取り消せません。患者に割り当て済みの運動は削除できません。
          </p>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl" role="alert">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2 min-h-[44px]"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 min-h-[44px]"
            >
              {isDeleting ? '削除中...' : '削除'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface CreateExerciseDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

function CreateExerciseDialog({ isOpen, onClose, onSuccess }: CreateExerciseDialogProps) {
  const [formData, setFormData] = useState<Partial<CreateExerciseMasterRequest>>({})
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name?.trim()) {
      newErrors.name = '運動名を入力してください'
    } else if (formData.name.length > 100) {
      newErrors.name = '運動名は100文字以内で入力してください'
    }

    if (!formData.category) {
      newErrors.category = 'カテゴリを選択してください'
    }

    if (!formData.difficulty) {
      newErrors.difficulty = '難易度を選択してください'
    }

    if (formData.target_body_part && formData.target_body_part.length > 100) {
      newErrors.target_body_part = '対象部位は100文字以内で入力してください'
    }

    if (formData.recommended_reps !== undefined && formData.recommended_reps !== null) {
      if (!Number.isInteger(formData.recommended_reps) || formData.recommended_reps <= 0) {
        newErrors.recommended_reps = '正の整数を入力してください'
      }
    }

    if (formData.recommended_sets !== undefined && formData.recommended_sets !== null) {
      if (!Number.isInteger(formData.recommended_sets) || formData.recommended_sets <= 0) {
        newErrors.recommended_sets = '正の整数を入力してください'
      }
    }

    if (formData.video_url && formData.video_url.length > 255) {
      newErrors.video_url = '動画URLは255文字以内で入力してください'
    }

    if (formData.thumbnail_url && formData.thumbnail_url.length > 255) {
      newErrors.thumbnail_url = 'サムネイルURLは255文字以内で入力してください'
    }

    if (formData.duration_seconds !== undefined && formData.duration_seconds !== null) {
      if (!Number.isInteger(formData.duration_seconds) || formData.duration_seconds <= 0) {
        newErrors.duration_seconds = '正の整数を入力してください'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: keyof CreateExerciseMasterRequest, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field as keyof FormErrors]
        return newErrors
      })
    }
  }

  const handleNumberChange = (field: keyof CreateExerciseMasterRequest, value: string) => {
    if (value === '') {
      handleChange(field, undefined)
    } else {
      const num = parseInt(value, 10)
      if (!isNaN(num)) {
        handleChange(field, num)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError(null)

      await api.createExerciseMaster(formData as CreateExerciseMasterRequest)

      setSubmitSuccess(true)
      setTimeout(() => {
        onSuccess()
        onClose()
        setFormData({})
        setSubmitSuccess(false)
      }, 1500)
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        const serverErrors: FormErrors = {}
        for (const [key, messages] of Object.entries(err.errors)) {
          if (key in errors || ['name', 'category', 'difficulty'].includes(key)) {
            serverErrors[key as keyof FormErrors] = messages[0]
          }
        }
        if (Object.keys(serverErrors).length > 0) {
          setErrors(serverErrors)
        } else {
          setSubmitError(err.message)
        }
      } else {
        setSubmitError(err instanceof Error ? err.message : '登録に失敗しました')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({})
    setErrors({})
    setSubmitError(null)
    setSubmitSuccess(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 id="dialog-title" className="text-2xl font-bold text-gray-900">
            新規運動登録
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="exercise-name" className="block text-sm font-medium text-gray-700 mb-1">
              運動名 <span className="text-red-500">*</span>
            </label>
            <input
              id="exercise-name"
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              maxLength={100}
            />
            {errors.name && (
              <p id="name-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="exercise-description" className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <textarea
              id="exercise-description"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base"
            />
          </div>

          {/* Category & Difficulty Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="exercise-category" className="block text-sm font-medium text-gray-700 mb-1">
                カテゴリ <span className="text-red-500">*</span>
              </label>
              <select
                id="exercise-category"
                value={formData.category || ''}
                onChange={(e) => handleChange('category', e.target.value as Category)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
                aria-invalid={!!errors.category}
                aria-describedby={errors.category ? 'category-error' : undefined}
              >
                <option value="">選択してください</option>
                <option value="筋力">筋力</option>
                <option value="バランス">バランス</option>
                <option value="柔軟性">柔軟性</option>
              </select>
              {errors.category && (
                <p id="category-error" role="alert" className="mt-1 text-sm text-red-600">
                  {errors.category}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="exercise-difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                難易度 <span className="text-red-500">*</span>
              </label>
              <select
                id="exercise-difficulty"
                value={formData.difficulty || ''}
                onChange={(e) => handleChange('difficulty', e.target.value as Difficulty)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
                aria-invalid={!!errors.difficulty}
                aria-describedby={errors.difficulty ? 'difficulty-error' : undefined}
              >
                <option value="">選択してください</option>
                <option value="easy">易しい</option>
                <option value="medium">普通</option>
                <option value="hard">難しい</option>
              </select>
              {errors.difficulty && (
                <p id="difficulty-error" role="alert" className="mt-1 text-sm text-red-600">
                  {errors.difficulty}
                </p>
              )}
            </div>
          </div>

          {/* Target Body Part */}
          <div>
            <label htmlFor="exercise-target" className="block text-sm font-medium text-gray-700 mb-1">
              対象部位
            </label>
            <input
              id="exercise-target"
              type="text"
              value={formData.target_body_part || ''}
              onChange={(e) => handleChange('target_body_part', e.target.value)}
              placeholder="例: 下肢、上肢、体幹"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.target_body_part}
              aria-describedby={errors.target_body_part ? 'target-error' : undefined}
              maxLength={100}
            />
            {errors.target_body_part && (
              <p id="target-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.target_body_part}
              </p>
            )}
          </div>

          {/* Reps & Sets Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="exercise-reps" className="block text-sm font-medium text-gray-700 mb-1">
                推奨回数
              </label>
              <input
                id="exercise-reps"
                type="number"
                min="1"
                value={formData.recommended_reps ?? ''}
                onChange={(e) => handleNumberChange('recommended_reps', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
                aria-invalid={!!errors.recommended_reps}
                aria-describedby={errors.recommended_reps ? 'reps-error' : undefined}
              />
              {errors.recommended_reps && (
                <p id="reps-error" role="alert" className="mt-1 text-sm text-red-600">
                  {errors.recommended_reps}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="exercise-sets" className="block text-sm font-medium text-gray-700 mb-1">
                推奨セット数
              </label>
              <input
                id="exercise-sets"
                type="number"
                min="1"
                value={formData.recommended_sets ?? ''}
                onChange={(e) => handleNumberChange('recommended_sets', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
                aria-invalid={!!errors.recommended_sets}
                aria-describedby={errors.recommended_sets ? 'sets-error' : undefined}
              />
              {errors.recommended_sets && (
                <p id="sets-error" role="alert" className="mt-1 text-sm text-red-600">
                  {errors.recommended_sets}
                </p>
              )}
            </div>
          </div>

          {/* Video URL */}
          <div>
            <label htmlFor="exercise-video-url" className="block text-sm font-medium text-gray-700 mb-1">
              動画URL
            </label>
            <input
              id="exercise-video-url"
              type="text"
              value={formData.video_url || ''}
              onChange={(e) => handleChange('video_url', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.video_url}
              aria-describedby={errors.video_url ? 'video-url-error' : undefined}
              maxLength={255}
            />
            {errors.video_url && (
              <p id="video-url-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.video_url}
              </p>
            )}
          </div>

          {/* Thumbnail URL */}
          <div>
            <label htmlFor="exercise-thumbnail-url" className="block text-sm font-medium text-gray-700 mb-1">
              サムネイルURL
            </label>
            <input
              id="exercise-thumbnail-url"
              type="text"
              value={formData.thumbnail_url || ''}
              onChange={(e) => handleChange('thumbnail_url', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.thumbnail_url}
              aria-describedby={errors.thumbnail_url ? 'thumbnail-url-error' : undefined}
              maxLength={255}
            />
            {errors.thumbnail_url && (
              <p id="thumbnail-url-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.thumbnail_url}
              </p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="exercise-duration" className="block text-sm font-medium text-gray-700 mb-1">
              所要時間（秒）
            </label>
            <input
              id="exercise-duration"
              type="number"
              min="1"
              value={formData.duration_seconds ?? ''}
              onChange={(e) => handleNumberChange('duration_seconds', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.duration_seconds}
              aria-describedby={errors.duration_seconds ? 'duration-error' : undefined}
            />
            {errors.duration_seconds && (
              <p id="duration-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.duration_seconds}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl" role="alert">
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          {/* Submit Success */}
          {submitSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl" role="alert">
              <p className="text-sm text-green-700">運動を登録しました</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2 min-h-[44px]"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting || submitSuccess}
              className="px-6 py-3 bg-[#1E40AF] text-white rounded-lg font-medium hover:bg-[#1E3A8A] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2 min-h-[44px]"
            >
              {isSubmitting ? '登録中...' : '登録'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function ExerciseMenuManagement() {
  const [exercises, setExercises] = useState<ExerciseMasterDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all')
  const [deleteTarget, setDeleteTarget] = useState<ExerciseMasterDetail | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    loadExercises()
  }, [])

  const loadExercises = async () => {
    try {
      setIsLoading(true)
      const response = await api.getExerciseMasterList()
      if (response.status === 'success' && response.data) {
        setExercises(response.data.exercises)
      }
    } catch (err) {
      console.error('Failed to load exercises:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (exercise: ExerciseMasterDetail) => {
    setDeleteTarget(exercise)
    setDeleteError(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    try {
      setIsDeleting(true)
      setDeleteError(null)
      await api.deleteExerciseMaster(deleteTarget.id)
      setDeleteTarget(null)
      loadExercises()
    } catch (err) {
      if (err instanceof ApiError) {
        setDeleteError(err.message)
      } else {
        setDeleteError(err instanceof Error ? err.message : '削除に失敗しました')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteClose = () => {
    setDeleteTarget(null)
    setDeleteError(null)
  }

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      if (categoryFilter !== 'all' && exercise.category !== categoryFilter) {
        return false
      }
      if (difficultyFilter !== 'all' && exercise.difficulty !== difficultyFilter) {
        return false
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        return (
          exercise.name.toLowerCase().includes(query) ||
          (exercise.description?.toLowerCase().includes(query) ?? false) ||
          (exercise.target_body_part?.toLowerCase().includes(query) ?? false)
        )
      }
      return true
    })
  }, [exercises, categoryFilter, difficultyFilter, searchQuery])

  const formatDuration = (seconds: number | null): string => {
    if (seconds === null) return '-'
    if (seconds < 60) return `${seconds}秒`
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return sec > 0 ? `${min}分${sec}秒` : `${min}分`
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">運動メニュー管理</h1>
          <p className="text-gray-600">全{exercises.length}件の運動マスタ</p>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#1E40AF] text-white rounded-lg font-medium hover:bg-[#1E3A8A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2 min-h-[44px]"
          aria-label="新規運動登録"
        >
          <Plus className="w-5 h-5" />
          新規運動登録
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="運動名・説明・部位で検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-label="検索"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as Category | 'all')}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
            aria-label="カテゴリフィルター"
          >
            <option value="all">すべてのカテゴリ</option>
            <option value="筋力">筋力</option>
            <option value="バランス">バランス</option>
            <option value="柔軟性">柔軟性</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as Difficulty | 'all')}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
            aria-label="難易度フィルター"
          >
            <option value="all">すべての難易度</option>
            <option value="easy">易しい</option>
            <option value="medium">普通</option>
            <option value="hard">難しい</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredExercises.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">
            {exercises.length === 0
              ? '運動マスタが登録されていません'
              : '条件に一致する運動がありません'}
          </p>
        </div>
      )}

      {/* Exercise Table */}
      {!isLoading && filteredExercises.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    運動名
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    カテゴリ
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    難易度
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    対象部位
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    推奨回数
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    推奨セット数
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    所要時間
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredExercises.map((exercise) => (
                  <tr key={exercise.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{exercise.name}</div>
                      {exercise.description && (
                        <div className="text-sm text-gray-500 mt-1 line-clamp-1">{exercise.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <CategoryBadge category={exercise.category} />
                    </td>
                    <td className="px-6 py-4">
                      <DifficultyBadge difficulty={exercise.difficulty} />
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {exercise.target_body_part || '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {exercise.recommended_reps ?? '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {exercise.recommended_sets ?? '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {formatDuration(exercise.duration_seconds)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDeleteClick(exercise)}
                        className="inline-flex items-center justify-center w-11 h-11 rounded-lg text-red-600 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                        aria-label={`${exercise.name}を削除`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Exercise Dialog */}
      <CreateExerciseDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={loadExercises}
      />

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteTarget !== null}
        exercise={deleteTarget}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </div>
  )
}

export default ExerciseMenuManagement
