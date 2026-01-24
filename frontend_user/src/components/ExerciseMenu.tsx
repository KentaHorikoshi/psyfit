import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiClient } from '../lib/api-client'
import type { Exercise } from '../lib/api-types'
import { ArrowLeft, Play } from 'lucide-react'

const CATEGORY_LABELS: Record<Exercise['category'], string> = {
  upper_body: '上半身',
  lower_body: '下半身',
  core: '体幹',
  stretch: 'ストレッチ',
}

const CATEGORY_ORDER: Exercise['category'][] = ['lower_body', 'upper_body', 'core', 'stretch']

interface ExerciseCardItemProps {
  exercise: Exercise
  onClick: () => void
}

function ExerciseCardItem({ exercise, onClick }: ExerciseCardItemProps) {
  return (
    <li>
      <button
        onClick={onClick}
        className="w-full flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:border-[#1E40AF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2 min-h-[72px]"
        aria-label={`${exercise.name}を開始 ${exercise.sets}セット${exercise.reps}回`}
      >
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mr-4 shrink-0 overflow-hidden">
          {exercise.thumbnail_url ? (
            <img
              src={exercise.thumbnail_url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <Play size={24} className="text-[#1E40AF]" />
          )}
        </div>
        <div className="flex-1 text-left">
          <p className="text-gray-900 text-lg font-medium">{exercise.name}</p>
          <p className="text-gray-500 text-sm">
            {exercise.sets}セット × {exercise.reps}回
            {exercise.duration_seconds && ` (${exercise.duration_seconds}秒)`}
          </p>
        </div>
        <div className="w-10 h-10 bg-[#1E40AF] rounded-full flex items-center justify-center shrink-0">
          <Play size={20} className="text-white ml-0.5" />
        </div>
      </button>
    </li>
  )
}

export function ExerciseMenu() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate])

  useEffect(() => {
    async function fetchExercises() {
      if (!isAuthenticated) return

      try {
        setIsLoading(true)
        setError(null)
        const response = await apiClient.getUserExercises()
        if (response.data) {
          setExercises(response.data.exercises)
        }
      } catch {
        setError('エラーが発生しました。再度お試しください。')
      } finally {
        setIsLoading(false)
      }
    }

    fetchExercises()
  }, [isAuthenticated])

  const groupedExercises = useMemo(() => {
    const groups: Record<Exercise['category'], Exercise[]> = {
      upper_body: [],
      lower_body: [],
      core: [],
      stretch: [],
    }

    exercises.forEach(exercise => {
      groups[exercise.category].push(exercise)
    })

    return CATEGORY_ORDER
      .filter(category => groups[category].length > 0)
      .map(category => ({
        category,
        label: CATEGORY_LABELS[category],
        exercises: groups[category],
      }))
  }, [exercises])

  if (authLoading) {
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{ maxWidth: '390px', margin: '0 auto' }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/home')}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF]"
            aria-label="戻る"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 ml-2">運動メニュー</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-6">
        {isLoading && (
          <div role="status" className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E40AF] mx-auto mb-4" />
              <p className="text-gray-500">運動メニューを読み込み中...</p>
            </div>
          </div>
        )}

        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-red-600 underline hover:no-underline min-h-[44px]"
            >
              再読み込み
            </button>
          </div>
        )}

        {!isLoading && !error && exercises.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">運動メニューがありません</p>
            <p className="text-gray-400 mt-2">担当スタッフにお問い合わせください</p>
          </div>
        )}

        {!isLoading && !error && exercises.length > 0 && (
          <ul role="list" className="space-y-6">
            {groupedExercises.map(group => (
              <li key={group.category}>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  {group.label}
                </h2>
                <ul className="space-y-3">
                  {group.exercises.map(exercise => (
                    <ExerciseCardItem
                      key={exercise.id}
                      exercise={exercise}
                      onClick={() => navigate(`/exercise/${exercise.id}`)}
                    />
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}

export default ExerciseMenu
