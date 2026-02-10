import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
import { Activity } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { DailyCondition } from '../lib/api-types'

interface PatientConditionChartProps {
  patientId: string
}

export function PatientConditionChart({ patientId }: PatientConditionChartProps) {
  const [conditions, setConditions] = useState<DailyCondition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])

  const fetchConditions = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.getPatientDailyConditions(patientId, startDate, endDate)
      setConditions(response.data?.conditions || [])
    } catch {
      setError('データの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [patientId, startDate, endDate])

  useEffect(() => {
    fetchConditions()
  }, [fetchConditions])

  const chartData = conditions
    .slice()
    .reverse()
    .map((c) => ({
      date: new Date(c.recorded_date).toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
      }),
      痛みの程度: c.pain_level,
      体の調子: c.body_condition,
    }))

  return (
    <section className="bg-white rounded-xl p-6 shadow-sm" aria-label="体調の推移">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={20} className="text-[#1E40AF]" />
        <h2 className="text-lg font-semibold text-gray-900">体調の推移</h2>
      </div>

      {/* Date Filters */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <label htmlFor="condition-start-date" className="block text-base font-medium text-gray-700 mb-1">
            開始日
          </label>
          <input
            id="condition-start-date"
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
          <label htmlFor="condition-end-date" className="block text-base font-medium text-gray-700 mb-1">
            終了日
          </label>
          <input
            id="condition-end-date"
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
            onClick={fetchConditions}
            className="mt-2 px-3 py-1.5 bg-red-600 text-white rounded-lg text-base
              hover:bg-red-700 transition-colors min-h-[44px]"
          >
            再試行
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && conditions.length === 0 && (
        <div className="text-center py-8">
          <Activity size={36} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">体調データがありません</p>
          <p className="text-gray-400 mt-1">患者が体調を記録するとグラフが表示されます</p>
        </div>
      )}

      {/* Chart */}
      {!isLoading && !error && conditions.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-500">{conditions.length}件</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="痛みの程度"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="痛みの程度"
              />
              <Line
                type="monotone"
                dataKey="体の調子"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="体の調子"
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </section>
  )
}
