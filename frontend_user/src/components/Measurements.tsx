import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiClient } from '../lib/api-client'
import { ChevronLeft, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { Measurement } from '../lib/api-types'

interface MeasurementType {
  key: keyof Measurement
  label: string
  color: string
  enabled: boolean
}

export function Measurements() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Date filters - default to current month
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])

  // Measurement types to display
  const [measurementTypes, setMeasurementTypes] = useState<MeasurementType[]>([
    { key: 'weight_kg', label: '体重 (kg)', color: '#1E66F5', enabled: true },
    { key: 'body_fat_percentage', label: '体脂肪率 (%)', color: '#EF4444', enabled: false },
    { key: 'muscle_mass_kg', label: '筋肉量 (kg)', color: '#16A34A', enabled: false },
    { key: 'nrs_pain', label: '痛み (NRS)', color: '#F59E0B', enabled: false },
  ])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate])

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMeasurements()
    }
  }, [isAuthenticated, user, startDate, endDate])

  const fetchMeasurements = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.getMeasurements({
        start_date: startDate,
        end_date: endDate,
      })
      setMeasurements(response.data?.measurements || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    fetchMeasurements()
  }

  const handleBack = () => {
    navigate(-1)
  }

  const toggleMeasurementType = (key: keyof Measurement) => {
    setMeasurementTypes((prev) =>
      prev.map((type) =>
        type.key === key ? { ...type, enabled: !type.enabled } : type
      )
    )
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

  // Prepare chart data
  const chartData = measurements
    .slice()
    .reverse()
    .map((m) => ({
      date: new Date(m.measured_date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
      weight_kg: m.weight_kg,
      body_fat_percentage: m.body_fat_percentage,
      muscle_mass_kg: m.muscle_mass_kg,
      nrs_pain: m.nrs_pain,
    }))

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
          <h1 className="text-xl font-bold text-gray-900 ml-2">測定値グラフ</h1>
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
        {!isLoading && !error && measurements.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">測定データがありません</p>
            <p className="text-gray-400 text-sm mt-2">測定値を記録するとグラフが表示されます</p>
          </div>
        )}

        {/* Chart and Controls */}
        {!isLoading && !error && measurements.length > 0 && (
          <div className="space-y-6">
            {/* Measurement Type Selector */}
            <section className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="text-sm font-medium text-gray-700 mb-3">表示する項目</h2>
              <div className="space-y-2">
                {measurementTypes.map((type) => (
                  <label
                    key={type.key}
                    className="flex items-center gap-3 min-h-[44px] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={type.enabled}
                      onChange={() => toggleMeasurementType(type.key)}
                      className="w-5 h-5 rounded border-gray-300 text-[#1E40AF]
                        focus:ring-2 focus:ring-[#1E40AF]"
                      aria-label={type.label}
                    />
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: type.color }}
                      />
                      <span className="text-sm text-gray-900">{type.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* Chart */}
            <section className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-medium text-gray-700">推移グラフ</h2>
                <span className="text-xs text-gray-500">{measurements.length}件</span>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />

                  {measurementTypes.map(
                    (type) =>
                      type.enabled && (
                        <Line
                          key={type.key}
                          type="monotone"
                          dataKey={type.key}
                          stroke={type.color}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                          name={type.label}
                        />
                      )
                  )}
                </LineChart>
              </ResponsiveContainer>
            </section>

            {/* Data Table */}
            <section className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="text-sm font-medium text-gray-700 mb-3">測定値一覧</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-600 font-medium">日付</th>
                      {measurementTypes
                        .filter((t) => t.enabled)
                        .map((type) => (
                          <th key={type.key} className="text-right py-2 text-gray-600 font-medium">
                            {type.label.split(' ')[0]}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {measurements.map((m) => (
                      <tr key={m.id} className="border-b border-gray-100 last:border-0">
                        <td className="py-2 text-gray-900">
                          {new Date(m.measured_date).toLocaleDateString('ja-JP')}
                        </td>
                        {measurementTypes
                          .filter((t) => t.enabled)
                          .map((type) => (
                            <td key={type.key} className="text-right py-2 text-gray-700">
                              {m[type.key] !== null && m[type.key] !== undefined
                                ? Number(m[type.key]).toFixed(1)
                                : '-'}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

export default Measurements
