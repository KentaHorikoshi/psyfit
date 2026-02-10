import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../../lib/api-client'
import { getCalendarDateRange } from './calendar-utils'
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
import type { DailyCondition } from '../../lib/api-types'

interface ConditionGraphProps {
  year: number
  month: number
}

export function ConditionGraph({ year, month }: ConditionGraphProps) {
  const [conditions, setConditions] = useState<DailyCondition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConditions = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { start_date, end_date } = getCalendarDateRange(year, month)
      const response = await apiClient.getMyDailyConditions({ start_date, end_date })
      setConditions(response.data?.conditions || [])
    } catch {
      setError('データの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [year, month])

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
    <section className="bg-white rounded-xl p-4 shadow-sm" aria-label="体調の推移" role="region">
      <div className="flex items-center gap-2 mb-3">
        <Activity size={18} className="text-[#1E40AF]" />
        <h2 className="text-base font-semibold text-gray-900">体調の推移</h2>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div role="status" className="text-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E40AF] mx-auto mb-2" />
          <p className="text-gray-500">読み込み中...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">データの取得に失敗しました</p>
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
        <div className="text-center py-6">
          <Activity size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="text-gray-500">この月の体調データはありません</p>
        </div>
      )}

      {/* Chart */}
      {!isLoading && !error && conditions.length > 0 && (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
            <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '13px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line
              type="monotone"
              dataKey="痛みの程度"
              stroke="#EF4444"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name="痛みの程度"
            />
            <Line
              type="monotone"
              dataKey="体の調子"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name="体の調子"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </section>
  )
}
