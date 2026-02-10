import { useState, useEffect, useMemo } from 'react'
import { Search } from 'lucide-react'
import { api } from '../lib/api'
import type { AssignedPatientSummary } from '../lib/api-types'

interface PatientOption {
  id: string
  name: string
  name_kana: string
}

interface PatientAssignmentSelectorProps {
  staffId: string
  currentAssignments: AssignedPatientSummary[]
  onSave: (patientIds: string[]) => Promise<void>
  isSaving: boolean
}

export function PatientAssignmentSelector({
  staffId,
  currentAssignments,
  onSave,
  isSaving,
}: PatientAssignmentSelectorProps) {
  const [allPatients, setAllPatients] = useState<PatientOption[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setSelectedIds(new Set(currentAssignments.map((a) => a.id)))
  }, [currentAssignments])

  useEffect(() => {
    loadPatients()
  }, [staffId])

  const loadPatients = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await api.getPatients({ per_page: '1000' })
      if (response.status === 'success' && response.data) {
        setAllPatients(
          response.data.patients.map((p) => ({
            id: p.id,
            name: p.name,
            name_kana: p.name_kana,
          }))
        )
      }
    } catch {
      setError('患者一覧の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return allPatients
    const query = searchQuery.toLowerCase()
    return allPatients.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.name_kana.toLowerCase().includes(query)
    )
  }, [allPatients, searchQuery])

  const handleToggle = (patientId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(patientId)) {
        next.delete(patientId)
      } else {
        next.add(patientId)
      }
      return next
    })
  }

  const handleSave = () => {
    onSave(Array.from(selectedIds))
  }

  const hasChanges = useMemo(() => {
    const currentIds = new Set(currentAssignments.map((a) => a.id))
    if (currentIds.size !== selectedIds.size) return true
    for (const id of selectedIds) {
      if (!currentIds.has(id)) return true
    }
    return false
  }, [currentAssignments, selectedIds])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">患者一覧を読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl" role="alert">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="患者名で検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
          aria-label="患者名で検索"
        />
      </div>

      {/* Selection summary */}
      <p className="text-sm text-gray-600">
        {selectedIds.size}名選択中 / 全{allPatients.length}名
      </p>

      {/* Patient list */}
      <div className="border border-gray-200 rounded-lg max-h-[300px] overflow-y-auto">
        {filteredPatients.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? '検索結果がありません' : '患者が登録されていません'}
          </div>
        ) : (
          <ul role="listbox" aria-label="担当患者選択">
            {filteredPatients.map((patient) => (
              <li
                key={patient.id}
                role="option"
                aria-selected={selectedIds.has(patient.id)}
                className="border-b border-gray-100 last:border-b-0"
              >
                <label className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(patient.id)}
                    onChange={() => handleToggle(patient.id)}
                    className="w-5 h-5 rounded border-gray-300 text-[#1E40AF] focus:ring-[#1E40AF]"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{patient.name}</div>
                    <div className="text-sm text-gray-500">{patient.name_kana}</div>
                  </div>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Save button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="px-6 py-3 bg-[#1E40AF] text-white rounded-lg font-medium hover:bg-[#1E3A8A] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2 min-h-[44px]"
        >
          {isSaving ? '保存中...' : '担当患者を保存'}
        </button>
      </div>
    </div>
  )
}
