import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
import { Ruler } from 'lucide-react'
import type { Measurement } from '../lib/api-types'

interface PatientMeasurementsTabProps {
  patientId: string
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

interface MeasurementColumn {
  key: keyof Measurement
  label: string
  unit: string
  format?: (v: number) => string
}

const columns: MeasurementColumn[] = [
  { key: 'weight_kg', label: '体重', unit: 'kg' },
  { key: 'knee_extension_strength_left', label: '膝伸展筋力(左)', unit: 'kgf' },
  { key: 'knee_extension_strength_right', label: '膝伸展筋力(右)', unit: 'kgf' },
  { key: 'wbi_left', label: 'WBI(左)', unit: '%' },
  { key: 'wbi_right', label: 'WBI(右)', unit: '%' },
  { key: 'tug_seconds', label: 'TUG', unit: '秒', format: (v) => v.toFixed(1) },
  { key: 'single_leg_stance_seconds', label: '片脚立位', unit: '秒', format: (v) => v.toFixed(1) },
  { key: 'nrs_pain_score', label: 'NRS', unit: '/10' },
  { key: 'mmt_score', label: 'MMT', unit: '' },
  { key: 'percent_mv', label: '%MV', unit: '%' },
]

export function PatientMeasurementsTab({ patientId }: PatientMeasurementsTabProps) {
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 6)
    return d.toISOString().slice(0, 10)
  })
  const [endDate, setEndDate] = useState(todayString)

  const fetchMeasurements = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.getPatientMeasurements(patientId, startDate, endDate)
      setMeasurements(response.data?.measurements ?? [])
    } catch {
      setError('測定値の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [patientId, startDate, endDate])

  useEffect(() => {
    fetchMeasurements()
  }, [fetchMeasurements])

  const formatValue = (measurement: Measurement, col: MeasurementColumn): string => {
    const val = measurement[col.key]
    if (val == null) return '-'
    const num = Number(val)
    if (Number.isNaN(num)) return '-'
    if (col.format) return `${col.format(num)}${col.unit}`
    return `${num}${col.unit}`
  }

  return (
    <div aria-label="測定値">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Ruler size={20} className="text-[#1E40AF]" />
        <h2 className="text-lg font-semibold text-gray-900">測定値一覧</h2>
      </div>

      {/* Date Filters */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <label htmlFor="measurement-start-date" className="block text-base font-medium text-gray-700 mb-1">
            開始日
          </label>
          <input
            id="measurement-start-date"
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
          <label htmlFor="measurement-end-date" className="block text-base font-medium text-gray-700 mb-1">
            終了日
          </label>
          <input
            id="measurement-end-date"
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
            onClick={fetchMeasurements}
            className="mt-2 px-3 py-1.5 bg-red-600 text-white rounded-lg text-base
              hover:bg-red-700 transition-colors min-h-[44px]"
          >
            再試行
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && measurements.length === 0 && (
        <div className="text-center py-8">
          <Ruler size={36} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">測定値データがありません</p>
        </div>
      )}

      {/* Measurement Table */}
      {!isLoading && !error && measurements.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-500">{measurements.length}件</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-base" aria-label="測定値一覧">
              <thead>
                <tr className="border-b border-gray-200">
                  <th scope="col" className="text-left py-3 px-2 font-medium text-gray-700 whitespace-nowrap sticky left-0 bg-white">
                    測定日
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      scope="col"
                      className="text-center py-3 px-2 font-medium text-gray-700 whitespace-nowrap"
                    >
                      {col.label}
                    </th>
                  ))}
                  <th scope="col" className="text-left py-3 px-2 font-medium text-gray-700 whitespace-nowrap">
                    備考
                  </th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((m) => (
                  <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 text-gray-900 whitespace-nowrap sticky left-0 bg-white">
                      {m.measured_date}
                    </td>
                    {columns.map((col) => (
                      <td key={col.key} className="py-3 px-2 text-center text-gray-700 whitespace-nowrap">
                        {formatValue(m, col)}
                      </td>
                    ))}
                    <td className="py-3 px-2 text-gray-600 max-w-[200px] truncate">
                      {m.notes ?? '-'}
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
