import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
import { Dumbbell } from 'lucide-react'
import type { PatientExerciseRecord } from '../lib/api-types'

interface PatientExerciseRecordsTabProps {
  patientId: string
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

function exerciseTypeBadgeColor(type: string): string {
  switch (type) {
    case 'ストレッチ':
      return 'bg-blue-50 text-blue-700'
    case 'トレーニング':
      return 'bg-orange-50 text-orange-700'
    case 'ほぐす':
      return 'bg-purple-50 text-purple-700'
    case 'バランス':
      return 'bg-teal-50 text-teal-700'
    default:
      return 'bg-gray-50 text-gray-700'
  }
}

function formatCompletedAt(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
  }) + ' ' + date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function PatientExerciseRecordsTab({ patientId }: PatientExerciseRecordsTabProps) {
  const [records, setRecords] = useState<PatientExerciseRecord[]>([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().slice(0, 10)
  })
  const [endDate, setEndDate] = useState(todayString)

  const fetchRecords = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.getPatientExerciseRecords(patientId, startDate, endDate)
      const data = response.data
      setRecords(data?.records ?? [])
      setTotalRecords(data?.summary?.total_records ?? 0)
    } catch {
      setError('運動記録の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [patientId, startDate, endDate])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  return (
    <div aria-label="運動記録">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Dumbbell size={20} className="text-[#1E40AF]" />
        <h2 className="text-lg font-semibold text-gray-900">運動記録</h2>
      </div>

      {/* Date Filters */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <label htmlFor="exercise-start-date" className="block text-base font-medium text-gray-700 mb-1">
            開始日
          </label>
          <input
            id="exercise-start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base
              focus:outline-none focus:border-[#1E40AF] focus:ring-1 focus:ring-[#1E40AF]
              min-h-[44px]"
            aria-label="開始日"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="exercise-end-date" className="block text-base font-medium text-gray-700 mb-1">
            終了日
          </label>
          <input
            id="exercise-end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base
              focus:outline-none focus:border-[#1E40AF] focus:ring-1 focus:ring-[#1E40AF]
              min-h-[44px]"
            aria-label="終了日"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div role="status" className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E40AF] mx-auto mb-2" />
          <p className="text-gray-500">読み込み中...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchRecords}
            className="mt-2 px-3 py-1.5 bg-red-600 text-white rounded-lg text-base
              hover:bg-red-700 transition-colors min-h-[44px]"
          >
            再試行
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && records.length === 0 && (
        <div className="text-center py-8">
          <Dumbbell size={36} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">運動記録がありません</p>
        </div>
      )}

      {/* Summary + Table */}
      {!isLoading && !error && records.length > 0 && (
        <>
          {/* Summary Card */}
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
              <Dumbbell size={16} className="text-[#1E40AF]" />
              <span className="text-sm text-gray-600">実施回数</span>
              <span className="text-lg font-bold text-[#1E40AF]">{totalRecords}回</span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-base" aria-label="運動記録一覧">
              <thead>
                <tr className="border-b border-gray-200">
                  <th scope="col" className="text-left py-3 px-2 font-medium text-gray-700">実施日時</th>
                  <th scope="col" className="text-left py-3 px-2 font-medium text-gray-700">運動名</th>
                  <th scope="col" className="text-center py-3 px-2 font-medium text-gray-700">種類</th>
                  <th scope="col" className="text-center py-3 px-2 font-medium text-gray-700">回数</th>
                  <th scope="col" className="text-center py-3 px-2 font-medium text-gray-700">セット</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 text-gray-900 whitespace-nowrap">
                      {formatCompletedAt(record.completed_at)}
                    </td>
                    <td className="py-3 px-2 text-gray-900 font-medium">
                      {record.exercise_name}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${exerciseTypeBadgeColor(record.exercise_type)}`}>
                        {record.exercise_type}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-gray-700">
                      {record.completed_reps != null ? `${record.completed_reps}回` : '-'}
                    </td>
                    <td className="py-3 px-2 text-center text-gray-700">
                      {record.completed_sets != null ? `${record.completed_sets}セット` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
