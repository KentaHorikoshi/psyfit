import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiClient } from '../lib/api-client'
import { ChevronLeft, Calendar } from 'lucide-react'
import type { ExerciseRecordWithExercise } from '../lib/api-types'

interface GroupedRecords {
  [date: string]: ExerciseRecordWithExercise[]
}

export function ExerciseHistory() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  const [records, setRecords] = useState<ExerciseRecordWithExercise[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Date filters - default to current month
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate])

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchRecords()
    }
  }, [isAuthenticated, user, startDate, endDate])

  const fetchRecords = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.getExerciseRecords({
        start_date: startDate,
        end_date: endDate,
      })
      setRecords(response.data?.records || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    fetchRecords()
  }

  const handleBack = () => {
    navigate(-1)
  }

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

  // Group records by date
  const groupedRecords: GroupedRecords = records.reduce<GroupedRecords>((acc, record) => {
    const date = new Date(record.completed_at).toISOString().split('T')[0]!
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date]!.push(record)
    return acc
  }, {})

  const sortedDates = Object.keys(groupedRecords).sort((a, b) => b.localeCompare(a))

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{ maxWidth: '390px', margin: '0 auto' }}>
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
          <h1 className="text-xl font-bold text-gray-900 ml-2">運動履歴</h1>
        </div>

        {/* Date Filters */}
        <div className="mt-4 flex gap-3">
          <div className="flex-1">
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
              開始日
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                focus:outline-none focus:border-[#1E40AF] focus:ring-1 focus:ring-[#1E40AF]
                min-h-[44px]"
              aria-label="開始日"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
              終了日
            </label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                focus:outline-none focus:border-[#1E40AF] focus:ring-1 focus:ring-[#1E40AF]
                min-h-[44px]"
              aria-label="終了日"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-4">
        {/* Loading State */}
        {isLoading && (
          <div role="status" className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E40AF] mx-auto mb-4" />
            <p className="text-gray-500">読み込み中...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 mb-3">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium
                hover:bg-red-700 transition-colors min-h-[44px]"
              aria-label="再試行"
            >
              再試行
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && records.length === 0 && (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">記録がありません</p>
            <p className="text-gray-400 text-sm mt-2">運動を実施すると履歴が表示されます</p>
          </div>
        )}

        {/* Records List */}
        {!isLoading && !error && sortedDates.length > 0 && (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <section key={date} className="bg-white rounded-xl p-4 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar size={20} className="text-[#1E40AF]" />
                  {formatDate(date)}
                </h2>
                <div className="space-y-3">
                  {groupedRecords[date]?.map((record) => (
                    <div
                      key={record.id}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{record.exercise_name}</h3>
                        <span className="text-sm text-gray-500">{formatTime(record.completed_at)}</span>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>{record.sets_completed}セット</span>
                        <span>{record.reps_completed}回</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default ExerciseHistory
