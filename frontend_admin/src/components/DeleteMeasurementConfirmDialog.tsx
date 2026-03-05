import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { api } from '../lib/api'
import type { Measurement } from '../lib/api-types'

interface DeleteMeasurementConfirmDialogProps {
  isOpen: boolean
  patientId: string
  measurement: Measurement | null
  onClose: () => void
  onSuccess: () => void
}

export function DeleteMeasurementConfirmDialog({
  isOpen,
  patientId,
  measurement,
  onClose,
  onSuccess,
}: DeleteMeasurementConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!measurement) return

    try {
      setIsDeleting(true)
      setError(null)
      await api.deleteMeasurement(patientId, measurement.id)
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    setError(null)
    onClose()
  }

  if (!isOpen || !measurement) return null

  const formatVal = (val: string | number | undefined | null, unit: string): string => {
    if (val == null) return '-'
    return `${val}${unit}`
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-measurement-dialog-title"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 id="delete-measurement-dialog-title" className="text-xl font-bold text-gray-900">
              測定値データ削除の確認
            </h2>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">
              測定日: <span className="font-semibold text-gray-900">{measurement.measured_date}</span>
            </p>
            <p className="text-sm text-gray-600 mb-1">
              体重: <span className="font-semibold text-gray-900">{formatVal(measurement.weight_kg, 'kg')}</span>
            </p>
            <p className="text-sm text-gray-600 mb-1">
              NRS: <span className="font-semibold text-gray-900">{formatVal(measurement.nrs_pain_score, '/10')}</span>
            </p>
            <p className="text-sm text-gray-600">
              MMT: <span className="font-semibold text-gray-900">{formatVal(measurement.mmt_score, '')}</span>
            </p>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            この操作は取り消せません。この測定値データを削除してもよろしいですか？
          </p>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4" role="alert">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isDeleting}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2 min-h-[44px]"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 min-h-[44px]"
            >
              {isDeleting ? '削除中...' : '削除する'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
