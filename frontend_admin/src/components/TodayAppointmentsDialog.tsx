import { useState, useEffect, useCallback } from 'react'
import { X, Calendar } from 'lucide-react'
import { api } from '../lib/api'
import type { TodayAppointmentPatient, PatientStatus } from '../lib/api-types'

interface TodayAppointmentsDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onPatientClick: (patientId: string) => void
}

function AppointmentStatusBadge({ status }: { status: PatientStatus }) {
  const statusStyles = {
    '急性期': 'bg-red-100 text-red-700 border-red-200',
    '回復期': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    '維持期': 'bg-green-100 text-green-700 border-green-200',
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[status]}`}
    >
      {status}
    </span>
  )
}

export function TodayAppointmentsDialog({
  isOpen,
  onOpenChange,
  onPatientClick,
}: TodayAppointmentsDialogProps) {
  const [patients, setPatients] = useState<TodayAppointmentPatient[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const fetchAppointments = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await api.getTodayAppointments()
        if (response.status === 'success' && response.data) {
          setPatients(response.data.patients)
        }
      } catch {
        setError('来院予定の取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [isOpen])

  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const handlePatientClick = (patientId: string) => {
    onOpenChange(false)
    onPatientClick(patientId)
  }

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="today-appointments-dialog-title"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h2
              id="today-appointments-dialog-title"
              className="text-xl font-bold text-gray-900"
            >
              本日の来院予定
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E40AF] mx-auto mb-3" />
                <p className="text-gray-500 text-base">読み込み中...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-base" role="alert">
              {error}
            </div>
          )}

          {!isLoading && !error && patients.length === 0 && (
            <p className="text-gray-500 text-center py-12 text-base">
              本日の来院予定はありません
            </p>
          )}

          {!isLoading && !error && patients.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                {patients.length}名の来院予定があります
              </p>
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handlePatientClick(patient.id)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && handlePatientClick(patient.id)
                  }
                  className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-[#3B82F6] hover:shadow-md transition-all cursor-pointer min-h-[44px]"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {patient.name.charAt(0)}
                  </div>

                  {/* Patient Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 text-base">
                      {patient.name}
                      <span className="text-sm text-gray-500 ml-2 font-normal">
                        ({patient.age}歳 / {patient.gender})
                      </span>
                    </h3>
                    <p className="text-sm text-gray-600">{patient.condition}</p>
                  </div>

                  {/* Status Badge */}
                  <AppointmentStatusBadge status={patient.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors min-h-[44px] text-base"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}

export default TodayAppointmentsDialog
