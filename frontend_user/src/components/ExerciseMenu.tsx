import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiClient } from '../lib/api-client'
import type { Exercise, ExerciseType, ExerciseRecordWithExercise } from '../lib/api-types'
import { ArrowLeft, Play, CheckCircle2 } from 'lucide-react'

const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  stretch: 'ストレッチ',
  training: 'トレーニング',
  massage: 'ほぐす',
  balance: 'バランス',
}

const EXERCISE_TYPE_ORDER: ExerciseType[] = ['training', 'stretch', 'massage', 'balance']

// Fallback mapping: Japanese DB values → English frontend keys
const EXERCISE_TYPE_JP_MAP: Record<string, ExerciseType> = {
  'ストレッチ': 'stretch',
  'トレーニング': 'training',
  'ほぐす': 'massage',
  'バランス': 'balance',
}

function normalizeExerciseType(type: string): ExerciseType {
  if (EXERCISE_TYPE_LABELS[type as ExerciseType]) return type as ExerciseType
  return EXERCISE_TYPE_JP_MAP[type] ?? 'training'
}

interface ExerciseCardItemProps {
  exercise: Exercise
  onClick: () => void
  isCompleted: boolean
  completedCount: number
}

function ExerciseCardItem({ exercise, onClick, isCompleted, completedCount }: ExerciseCardItemProps) {
  const dailyFrequency = exercise.daily_frequency ?? 1
  const allCompleted = completedCount >= dailyFrequency
  const showProgress = dailyFrequency > 1

  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full flex items-center p-4 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2 min-h-[72px] border ${
          (isCompleted || allCompleted)
            ? 'bg-green-50 border-green-200'
            : completedCount > 0
              ? 'bg-blue-50 border-blue-200'
              : 'bg-white border-gray-200 hover:border-[#1E40AF]'
        }`}
        aria-label={`${exercise.name}${showProgress ? ` ${completedCount}/${dailyFrequency}回実施` : isCompleted ? '（実施済み）' : 'を開始'} ${exercise.sets}セット${exercise.reps}回`}
      >
        <div className={`w-16 h-16 rounded-lg flex items-center justify-center mr-4 shrink-0 overflow-hidden ${
          (isCompleted || allCompleted) && !exercise.thumbnail_url ? 'bg-green-100' : 'bg-gray-100'
        }`}>
          {exercise.thumbnail_url ? (
            <img
              src={exercise.thumbnail_url}
              alt=""
              className={`w-full h-full object-cover ${(isCompleted || allCompleted) ? 'opacity-60' : ''}`}
            />
          ) : (
            <Play size={24} className={(isCompleted || allCompleted) ? 'text-green-600' : 'text-[#1E40AF]'} />
          )}
        </div>
        <div className="flex-1 text-left">
          <p className={`text-lg font-medium ${(isCompleted || allCompleted) ? 'text-green-700' : 'text-gray-900'}`}>
            {exercise.name}
          </p>
          <p className="text-gray-500 text-sm">
            {exercise.sets}セット × {exercise.reps}回
            {exercise.duration_seconds && ` (${exercise.duration_seconds}秒)`}
          </p>
          {showProgress && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${allCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(100, Math.round((completedCount / dailyFrequency) * 100))}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${allCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                {completedCount}/{dailyFrequency}
              </span>
            </div>
          )}
        </div>
        {(isCompleted || allCompleted) ? (
          <div className="flex flex-col items-center shrink-0">
            <CheckCircle2 size={24} className="text-green-600" />
            <span className="text-xs text-green-600 font-medium mt-1">{showProgress ? '達成' : '実施済み'}</span>
          </div>
        ) : completedCount > 0 ? (
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
            <Play size={20} className="text-white ml-0.5" />
          </div>
        ) : (
          <div className="w-10 h-10 bg-[#1E40AF] rounded-full flex items-center justify-center shrink-0">
            <Play size={20} className="text-white ml-0.5" />
          </div>
        )}
      </button>
    </li>
  )
}

export function ExerciseMenu() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [todayRecords, setTodayRecords] = useState<ExerciseRecordWithExercise[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate])

  useEffect(() => {
    async function fetchExercisesAndRecords() {
      if (!isAuthenticated) return

      try {
        setIsLoading(true)
        setError(null)
        const today = new Date().toISOString().split('T')[0]

        const [exercisesRes, recordsRes] = await Promise.all([
          apiClient.getUserExercises(),
          apiClient.getExerciseRecords({ start_date: today, end_date: today }),
        ])

        if (exercisesRes.status === 'success' && exercisesRes.data) {
          const data = exercisesRes.data as unknown as Record<string, unknown>
          const list = data.exercises ?? data.assigned_exercises
          setExercises(Array.isArray(list) ? list as Exercise[] : [])
        }
        if (recordsRes.status === 'success' && recordsRes.data) {
          setTodayRecords(recordsRes.data.records)
        }
      } catch {
        setError('エラーが発生しました。再度お試しください。')
      } finally {
        setIsLoading(false)
      }
    }

    fetchExercisesAndRecords()
  }, [isAuthenticated])

  const completedCountMap = useMemo(() => {
    const map = new Map<string, number>()
    todayRecords.forEach(record => {
      map.set(record.exercise_id, (map.get(record.exercise_id) ?? 0) + 1)
    })
    return map
  }, [todayRecords])

  const remainingCount = useMemo(() => {
    return exercises.filter(ex => {
      const count = completedCountMap.get(ex.id) ?? 0
      const freq = ex.daily_frequency ?? 1
      return count < freq
    }).length
  }, [exercises, completedCountMap])

  const groupedExercises = useMemo(() => {
    const groups: Record<ExerciseType, Exercise[]> = {
      stretch: [],
      training: [],
      massage: [],
      balance: [],
    }

    exercises.forEach(exercise => {
      const type = normalizeExerciseType(exercise.exercise_type)
      groups[type].push(exercise)
    })

    return EXERCISE_TYPE_ORDER
      .filter(type => groups[type].length > 0)
      .map(type => ({
        type,
        label: EXERCISE_TYPE_LABELS[type],
        exercises: groups[type],
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
          <h1 className="text-xl font-bold text-gray-900 ml-2 flex-1">運動メニュー</h1>
          {!isLoading && exercises.length > 0 && (
            remainingCount > 0 ? (
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                残り {remainingCount} 件
              </span>
            ) : (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                すべて完了
              </span>
            )
          )}
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
              <li key={group.type}>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  {group.label}
                </h2>
                <ul className="space-y-3">
                  {group.exercises.map(exercise => {
                    const count = completedCountMap.get(exercise.id) ?? 0
                    const freq = exercise.daily_frequency ?? 1
                    return (
                      <ExerciseCardItem
                        key={exercise.id}
                        exercise={exercise}
                        isCompleted={count >= freq}
                        completedCount={count}
                        onClick={() => navigate(`/exercise/${exercise.id}`)}
                      />
                    )
                  })}
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
