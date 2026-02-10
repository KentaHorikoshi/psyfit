import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiClient } from '../lib/api-client'
import { ChevronLeft } from 'lucide-react'

function getLocalDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function ConditionInput() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  const [painLevel, setPainLevel] = useState(5)
  const [bodyCondition, setBodyCondition] = useState(5)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCondition, setIsLoadingCondition] = useState(true)
  const [existingConditionId, setExistingConditionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate])

  useEffect(() => {
    if (!user) return

    const fetchTodayCondition = async () => {
      try {
        const today = getLocalDateString()
        const res = await apiClient.getMyDailyConditions({
          start_date: today,
          end_date: today,
        })
        const conditions = res.data?.conditions ?? []
        const existing = conditions[0]
        if (existing) {
          setPainLevel(existing.pain_level)
          setBodyCondition(existing.body_condition)
          setNotes(existing.notes || '')
          setExistingConditionId(existing.id)
        }
      } catch {
        // Silently fail - use default values
      } finally {
        setIsLoadingCondition(false)
      }
    }

    fetchTodayCondition()
  }, [user])

  if (authLoading || isLoadingCondition) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ maxWidth: '390px', margin: '0 auto' }}>
        <div role="status" className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E40AF] mx-auto mb-4" />
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const today = getLocalDateString()
      const trimmedNotes = notes.trim()
      await apiClient.createDailyCondition({
        recorded_date: today,
        pain_level: painLevel,
        body_condition: bodyCondition,
        notes: trimmedNotes || undefined,
      })
      navigate('/home')
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    navigate('/home')
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ maxWidth: '390px', margin: '0 auto' }}>
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <div className="flex items-center">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="戻る"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 ml-2">今日の体調</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-6">
        {/* Error Message */}
        {error && (
          <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Pain Level Slider */}
        <section className="mb-8">
          <label htmlFor="pain-slider" className="block text-lg font-medium text-gray-900 mb-4">
            痛みの程度
          </label>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 w-6 text-center">0</span>
            <input
              id="pain-slider"
              type="range"
              min="0"
              max="10"
              value={painLevel}
              onChange={(e) => setPainLevel(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-6
                [&::-webkit-slider-thumb]:h-6
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-[#1E40AF]
                [&::-webkit-slider-thumb]:shadow-md
                [&::-moz-range-thumb]:w-6
                [&::-moz-range-thumb]:h-6
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-[#1E40AF]
                [&::-moz-range-thumb]:border-0"
              aria-label="痛みの程度"
              aria-valuemin={0}
              aria-valuemax={10}
              aria-valuenow={painLevel}
            />
            <span className="text-sm text-gray-500 w-6 text-center">10</span>
          </div>
          <div className="mt-3 flex justify-between text-sm text-gray-500">
            <span>痛みなし</span>
            <span
              data-testid="pain-level-value"
              className="text-2xl font-bold text-[#1E40AF]"
            >
              {painLevel}
            </span>
            <span>強い痛み</span>
          </div>
        </section>

        {/* Body Condition Slider */}
        <section className="mb-8">
          <label htmlFor="body-slider" className="block text-lg font-medium text-gray-900 mb-4">
            体の調子
          </label>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 w-6 text-center">0</span>
            <input
              id="body-slider"
              type="range"
              min="0"
              max="10"
              value={bodyCondition}
              onChange={(e) => setBodyCondition(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-6
                [&::-webkit-slider-thumb]:h-6
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-[#10B981]
                [&::-webkit-slider-thumb]:shadow-md
                [&::-moz-range-thumb]:w-6
                [&::-moz-range-thumb]:h-6
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-[#10B981]
                [&::-moz-range-thumb]:border-0"
              aria-label="体の調子"
              aria-valuemin={0}
              aria-valuemax={10}
              aria-valuenow={bodyCondition}
            />
            <span className="text-sm text-gray-500 w-6 text-center">10</span>
          </div>
          <div className="mt-3 flex justify-between text-sm text-gray-500">
            <span>悪い</span>
            <span
              data-testid="body-condition-value"
              className="text-2xl font-bold text-[#10B981]"
            >
              {bodyCondition}
            </span>
            <span>良い</span>
          </div>
        </section>

        {/* Notes */}
        <section className="mb-8">
          <label htmlFor="notes" className="block text-lg font-medium text-gray-900 mb-4">
            メモ（任意）
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="今日の調子や気づいたことを記入"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl
              text-gray-900 placeholder:text-gray-400
              focus:outline-none focus:border-[#1E40AF] focus:ring-1 focus:ring-[#1E40AF]
              transition-colors resize-none min-h-[120px]"
            rows={4}
          />
        </section>
      </main>

      {/* Footer Actions */}
      <footer className="px-6 pb-8 pt-4 bg-white border-t border-gray-100">
        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            disabled={isSubmitting}
            className="flex-1 py-4 px-6 border border-gray-300 text-gray-700 rounded-xl font-medium
              hover:bg-gray-50 transition-colors min-h-[52px]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="スキップ"
          >
            スキップ
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-1 py-4 px-6 bg-[#1E40AF] text-white rounded-xl font-medium
              hover:bg-[#1E3A8A] transition-colors min-h-[52px]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={existingConditionId ? '更新' : '保存'}
          >
            {isSubmitting ? '保存中...' : existingConditionId ? '更新' : '保存'}
          </button>
        </div>
      </footer>
    </div>
  )
}

export default ConditionInput
