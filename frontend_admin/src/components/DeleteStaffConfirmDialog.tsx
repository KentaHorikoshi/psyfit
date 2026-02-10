import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { api } from '../lib/api'
import type { StaffMember } from '../lib/api-types'

interface DeleteStaffConfirmDialogProps {
  isOpen: boolean
  staff: StaffMember | null
  onClose: () => void
  onSuccess: () => void
}

export function DeleteStaffConfirmDialog({
  isOpen,
  staff,
  onClose,
  onSuccess,
}: DeleteStaffConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!staff) return

    try {
      setIsDeleting(true)
      setError(null)
      await api.deleteStaff(staff.id)
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

  if (!isOpen || !staff) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 id="delete-dialog-title" className="text-xl font-bold text-gray-900">
              職員削除の確認
            </h2>
          </div>

          <p className="text-gray-700 mb-2">
            <span className="font-semibold">{staff.name}</span>（{staff.staff_id}）を削除しますか？
          </p>
          <p className="text-sm text-gray-500 mb-4">
            この操作を実行すると、この職員のアカウントは無効化されます。担当患者の割り当ては解除されます。
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
