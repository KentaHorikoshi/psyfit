import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import apiClient from '../lib/api-client'
import { Exercise } from '../lib/api-types'
import { CheckSquare, Square, Dumbbell, ArrowLeft } from 'lucide-react'

export function BatchRecord() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate])

  // Fetch exercises
  useEffect(() => {
    if (!user) return

    const fetchExercises = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.getUserExercises()
        setExercises(response.data?.exercises || [])
      } catch {
        setError('運動メニューの取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchExercises()
  }, [user])

  const toggleExercise = (exerciseId: string) => {
    setSelectedExercises(prev => {
      const newSet = new Set(prev)
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId)
      } else {
        newSet.add(exerciseId)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selectedExercises.size === exercises.length) {
      setSelectedExercises(new Set())
    } else {
      setSelectedExercises(new Set(exercises.map(ex => ex.id)))
    }
  }

  const handleSubmit = async () => {
    if (selectedExercises.size === 0) return

    try {
      setIsSubmitting(true)
      setError(null)

      // Create records for all selected exercises
      const promises = Array.from(selectedExercises).map(exerciseId => {
        const exercise = exercises.find(ex => ex.id === exerciseId)
        if (!exercise) return Promise.resolve()

        return apiClient.createExerciseRecord({
          exercise_id: exerciseId,
          sets_completed: exercise.sets,
          reps_completed: exercise.reps,
        })
      })

      await Promise.all(promises)

      // Navigate to home on success
      navigate('/home')
    } catch {
      setError('記録に失敗しました。もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ maxWidth: '390px', margin: '0 auto' }}>
        <div role="status" className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E40AF] mx-auto mb-4" />
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null
  }

  const isAllSelected = exercises.length > 0 && selectedExercises.size === exercises.length

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ maxWidth: '390px', margin: '0 auto' }}>
      {/* Header */}
      <header className="px-6 pt-8 pb-6 bg-gradient-to-b from-blue-50 to-white border-b border-gray-200">
        <button
          onClick={() => navigate('/home')}
          className="mb-4 text-gray-600 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] rounded p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="戻る"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">まとめて記録</h1>
        <p className="text-gray-600 text-sm">実施した運動を選択して記録します</p>
      </header>

      {/* Main content */}
      <main className="flex-1 px-6 py-6">
        {/* Selection count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {selectedExercises.size}件選択中
          </p>
          <button
            onClick={toggleSelectAll}
            className="text-sm text-[#1E40AF] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] rounded px-2 py-1"
            aria-label="すべて選択"
          >
            {isAllSelected ? 'すべて解除' : 'すべて選択'}
          </button>
        </div>

        {/* Exercise list */}
        {exercises.length === 0 ? (
          <div className="text-center py-12">
            <Dumbbell size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">運動メニューがありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {exercises.map(exercise => {
              const isSelected = selectedExercises.has(exercise.id)
              return (
                <label
                  key={exercise.id}
                  className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#1E40AF] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } min-h-[72px]`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleExercise(exercise.id)}
                        className="sr-only"
                        aria-label={exercise.name}
                      />
                      <div className="w-6 h-6 flex items-center justify-center">
                        {isSelected ? (
                          <CheckSquare size={24} className="text-[#1E40AF]" />
                        ) : (
                          <Square size={24} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 mb-1">{exercise.name}</h3>
                      <p className="text-sm text-gray-500">
                        {exercise.sets}セット × {exercise.reps}回
                      </p>
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl" role="alert">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </main>

      {/* Footer with submit button */}
      <footer className="px-6 py-4 border-t border-gray-200 bg-white">
        <button
          onClick={handleSubmit}
          disabled={selectedExercises.size === 0 || isSubmitting}
          className="w-full bg-[#1E40AF] text-white px-6 py-4 rounded-xl font-medium hover:bg-[#1E3A8A] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2 min-h-[52px]"
          aria-label="記録する"
        >
          {isSubmitting ? '記録中...' : '記録する'}
        </button>
      </footer>
    </div>
  )
}

export default BatchRecord
