import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
import { Activity, BarChart3, Table2, Plus, Pencil, Trash2 } from 'lucide-react'
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
import { DailyConditionCreateDialog } from './DailyConditionCreateDialog'
import { DailyConditionEditDialog } from './DailyConditionEditDialog'
import { DeleteDailyConditionConfirmDialog } from './DeleteDailyConditionConfirmDialog'

interface PatientConditionChartProps {
  patientId: string
}

type ViewMode = 'chart' | 'table'

function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

function painLevelColor(level: number): string {
  if (level <= 3) return 'text-green-700 bg-green-50'
  if (level <= 6) return 'text-amber-700 bg-amber-50'
  return 'text-red-700 bg-red-50'
}

function bodyConditionColor(level: number): string {
  if (level <= 3) return 'text-red-700 bg-red-50'
  if (level <= 6) return 'text-amber-700 bg-amber-50'
  return 'text-green-700 bg-green-50'
}

export function PatientConditionChart({ patientId }: PatientConditionChartProps) {
  const [conditions, setConditions] = useState<DailyCondition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('chart')

  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().slice(0, 10)
  })
  const [endDate, setEndDate] = useState(todayString)

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedCondition, setSelectedCondition] = useState<DailyCondition | null>(null)

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

  const handleEdit = (condition: DailyCondition) => {
    setSelectedCondition(condition)
    setIsEditOpen(true)
  }

  const handleDeleteClick = (condition: DailyCondition) => {
    setSelectedCondition(condition)
    setIsDeleteOpen(true)
  }

  const handleCrudSuccess = () => {
    fetchConditions()
  }

  return (
    <div aria-label="体調の推移">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={20} className="text-[#1E40AF]" />
          <h2 className="text-lg font-semibold text-gray-900">体調の推移</h2>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden" role="group" aria-label="表示切り替え">
            <button
              type="button"
              onClick={() => setViewMode('chart')}
              className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors ${
                viewMode === 'chart'
                  ? 'bg-[#1E40AF] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              aria-label="グラフ表示"
              aria-pressed={viewMode === 'chart'}
            >
              <BarChart3 size={18} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors ${
                viewMode === 'table'
                  ? 'bg-[#1E40AF] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              aria-label="テーブル表示"
              aria-pressed={viewMode === 'table'}
            >
              <Table2 size={18} />
            </button>
          </div>
          {/* Add Button */}
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1 px-4 py-2 bg-[#10B981] text-white rounded-lg font-medium hover:bg-[#059669] transition-colors min-h-[44px]"
            aria-label="体調データを追加"
          >
            <Plus size={18} />
            <span>追加</span>
          </button>
        </div>
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
          <p className="text-gray-400 mt-1">「追加」ボタンから体調データを登録できます</p>
        </div>
      )}

      {/* Chart View */}
      {!isLoading && !error && conditions.length > 0 && viewMode === 'chart' && (
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

      {/* Table View */}
      {!isLoading && !error && conditions.length > 0 && viewMode === 'table' && (
        <>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-500">{conditions.length}件</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-base" aria-label="体調データ一覧">
              <thead>
                <tr className="border-b border-gray-200">
                  <th scope="col" className="text-left py-3 px-2 font-medium text-gray-700">記録日</th>
                  <th scope="col" className="text-center py-3 px-2 font-medium text-gray-700">痛みの程度</th>
                  <th scope="col" className="text-center py-3 px-2 font-medium text-gray-700">体の調子</th>
                  <th scope="col" className="text-left py-3 px-2 font-medium text-gray-700">備考</th>
                  <th scope="col" className="text-center py-3 px-2 font-medium text-gray-700">
                    <span className="sr-only">操作</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {conditions.map((condition) => (
                  <tr key={condition.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 text-gray-900">{condition.recorded_date}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${painLevelColor(condition.pain_level)}`}>
                        {condition.pain_level}/10
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${bodyConditionColor(condition.body_condition)}`}>
                        {condition.body_condition}/10
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-600 max-w-[200px] truncate">
                      {condition.notes || '-'}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(condition)}
                          className="p-2 text-gray-500 hover:text-[#1E40AF] hover:bg-blue-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                          aria-label={`${condition.recorded_date}の体調データを編集`}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(condition)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                          aria-label={`${condition.recorded_date}の体調データを削除`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Dialogs */}
      <DailyConditionCreateDialog
        isOpen={isCreateOpen}
        patientId={patientId}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCrudSuccess}
      />
      <DailyConditionEditDialog
        isOpen={isEditOpen}
        patientId={patientId}
        condition={selectedCondition}
        onClose={() => {
          setIsEditOpen(false)
          setSelectedCondition(null)
        }}
        onSuccess={handleCrudSuccess}
      />
      <DeleteDailyConditionConfirmDialog
        isOpen={isDeleteOpen}
        patientId={patientId}
        condition={selectedCondition}
        onClose={() => {
          setIsDeleteOpen(false)
          setSelectedCondition(null)
        }}
        onSuccess={handleCrudSuccess}
      />
    </div>
  )
}
