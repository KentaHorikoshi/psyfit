import { useState, useEffect } from 'react'
import { Search, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react'
import type { PatientsListResponse, PatientStatus, StaffOption } from '../lib/api-types'

interface PatientListProps {
  data: PatientsListResponse
  isLoading: boolean
  onSearch: (query: string) => void
  onFilterStatus: (status: PatientStatus | 'all') => void
  onFilterStaff: (staffId: string) => void
  staffOptions: StaffOption[]
  onPageChange: (page: number) => void
  onPatientClick: (path: string) => void
  onCreatePatient?: () => void
}

function StatusBadge({ status }: { status: PatientStatus }) {
  const statusStyles = {
    '急性期': 'bg-red-100 text-red-700 border-red-200',
    '回復期': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    '維持期': 'bg-green-100 text-green-700 border-green-200',
  }

  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[status]}`}
    >
      {status}
    </span>
  )
}

export function PatientList({
  data,
  isLoading,
  onSearch,
  onFilterStatus,
  onFilterStaff,
  staffOptions,
  onPageChange,
  onPatientClick,
  onCreatePatient,
}: PatientListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<PatientStatus | 'all'>('all')
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all')

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, onSearch])

  const handleStatusChange = (status: string) => {
    const statusValue = status as PatientStatus | 'all'
    setSelectedStatus(statusValue)
    onFilterStatus(statusValue)
  }

  const handleStaffChange = (staffId: string) => {
    setSelectedStaffId(staffId)
    onFilterStaff(staffId)
  }

  const handleRowClick = (patientId: string) => {
    onPatientClick(`/patients/${patientId}`)
  }

  const handlePreviousPage = () => {
    if (data.meta.page > 1) {
      onPageChange(data.meta.page - 1)
    }
  }

  const handleNextPage = () => {
    if (data.meta.page < data.meta.total_pages) {
      onPageChange(data.meta.page + 1)
    }
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">患者一覧</h1>
          <p className="text-gray-600">全{data.meta.total}件の患者を管理できます</p>
        </div>
        {onCreatePatient && (
          <button
            onClick={onCreatePatient}
            className="flex items-center gap-2 px-4 py-3 bg-[#1E40AF] text-white font-medium rounded-lg hover:bg-[#1E3A8A] transition-colors min-h-[44px]"
            aria-label="新規患者登録"
          >
            <UserPlus className="w-5 h-5" />
            新規患者登録
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Box */}
          <div className="relative">
            <label htmlFor="patient-search" className="sr-only">
              患者検索
            </label>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="patient-search"
              type="text"
              placeholder="患者名、カナで検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-base min-h-[44px]"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter" className="sr-only">
              ステータスで絞り込み
            </label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-base min-h-[44px]"
              aria-label="ステータスで絞り込み"
            >
              <option value="all">すべて</option>
              <option value="急性期">急性期</option>
              <option value="回復期">回復期</option>
              <option value="維持期">維持期</option>
            </select>
          </div>

          {/* Staff Filter */}
          <div>
            <label htmlFor="staff-filter" className="sr-only">
              担当職員で絞り込み
            </label>
            <select
              id="staff-filter"
              value={selectedStaffId}
              onChange={(e) => handleStaffChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-base min-h-[44px]"
              aria-label="担当職員で絞り込み"
            >
              <option value="all">担当職員: すべて</option>
              {staffOptions.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && data.patients.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">患者が見つかりません</p>
        </div>
      )}

      {/* Patient Table */}
      {!isLoading && data.patients.length > 0 && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
                    >
                      患者名
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
                    >
                      年齢
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
                    >
                      性別
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
                    >
                      疾患名
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
                    >
                      ステータス
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
                    >
                      担当職員
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
                    >
                      最終運動日
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.patients.map((patient) => (
                    <tr
                      key={patient.id}
                      onClick={() => handleRowClick(patient.id)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">{patient.name_kana}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{patient.age}</td>
                      <td className="px-6 py-4 text-gray-900">{patient.gender}</td>
                      <td className="px-6 py-4 text-gray-900">{patient.condition}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={patient.status} />
                      </td>
                      <td className="px-6 py-4 text-gray-900">{patient.staff_name}</td>
                      <td className="px-6 py-4 text-gray-900">
                        {patient.last_exercise_at || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              ページ {data.meta.page} / {data.meta.total_pages}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={data.meta.page === 1}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                aria-label="前へ"
              >
                <ChevronLeft className="w-4 h-4" />
                前へ
              </button>
              <button
                onClick={handleNextPage}
                disabled={data.meta.page === data.meta.total_pages}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                aria-label="次へ"
              >
                次へ
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default PatientList
