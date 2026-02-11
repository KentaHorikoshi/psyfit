import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { api } from '../lib/api'
import type { StaffMember, UpdateStaffRequest, AssignedPatientSummary } from '../lib/api-types'
import { PatientAssignmentSelector } from './PatientAssignmentSelector'

type TabKey = 'info' | 'patients'

interface FormErrors {
  name?: string
  name_kana?: string
  email?: string
  department?: string
}

interface EditStaffDialogProps {
  isOpen: boolean
  staff: StaffMember | null
  onClose: () => void
  onSuccess: () => void
}

export function EditStaffDialog({ isOpen, onClose, onSuccess, staff }: EditStaffDialogProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('info')
  const [formData, setFormData] = useState<UpdateStaffRequest>({})
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [assignedPatients, setAssignedPatients] = useState<AssignedPatientSummary[]>([])
  const [isSavingPatients, setIsSavingPatients] = useState(false)
  const [patientSaveSuccess, setPatientSaveSuccess] = useState(false)

  useEffect(() => {
    if (staff && isOpen) {
      setFormData({
        name: staff.name,
        name_kana: staff.name_kana,
        email: staff.email,
        role: staff.role,
        department: staff.department,
      })
      setErrors({})
      setSubmitError(null)
      setSubmitSuccess(false)
      setPatientSaveSuccess(false)
      setActiveTab('info')
      loadAssignedPatients(staff.id)
    }
  }, [staff, isOpen])

  const loadAssignedPatients = async (staffId: string) => {
    try {
      const response = await api.getStaffAssignedPatients(staffId)
      if (response.status === 'success' && response.data) {
        setAssignedPatients(response.data.patients)
      }
    } catch {
      setAssignedPatients([])
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name?.trim()) {
      newErrors.name = '氏名を入力してください'
    }

    if (!formData.name_kana?.trim()) {
      newErrors.name_kana = 'フリガナを入力してください'
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'メールアドレスを入力してください'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください'
    }

    if (!formData.department?.trim()) {
      newErrors.department = '部署を入力してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: keyof UpdateStaffRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field as keyof FormErrors]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !staff) return

    try {
      setIsSubmitting(true)
      setSubmitError(null)

      await api.updateStaff(staff.id, formData)

      setSubmitSuccess(true)
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1000)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '更新に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSavePatients = async (patientIds: string[]) => {
    if (!staff) return

    try {
      setIsSavingPatients(true)
      await api.updateStaffAssignedPatients(staff.id, patientIds)
      await loadAssignedPatients(staff.id)
      setPatientSaveSuccess(true)
      setTimeout(() => setPatientSaveSuccess(false), 2000)
    } finally {
      setIsSavingPatients(false)
    }
  }

  const handleClose = () => {
    setFormData({})
    setErrors({})
    setSubmitError(null)
    setSubmitSuccess(false)
    setPatientSaveSuccess(false)
    onClose()
  }

  if (!isOpen || !staff) return null

  const tabBaseClass =
    'px-4 py-3 font-medium text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] min-h-[44px]'
  const tabActiveClass = 'border-b-2 border-[#1E40AF] text-[#1E40AF]'
  const tabInactiveClass = 'text-gray-500 hover:text-gray-700'

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-dialog-title"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 id="edit-dialog-title" className="text-2xl font-bold text-gray-900">
            職員編集
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 flex" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'info'}
            aria-controls="tab-panel-info"
            onClick={() => setActiveTab('info')}
            className={`${tabBaseClass} ${activeTab === 'info' ? tabActiveClass : tabInactiveClass}`}
          >
            基本情報
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'patients'}
            aria-controls="tab-panel-patients"
            onClick={() => setActiveTab('patients')}
            className={`${tabBaseClass} ${activeTab === 'patients' ? tabActiveClass : tabInactiveClass}`}
          >
            担当患者
          </button>
        </div>

        {/* Tab Content: Info */}
        {activeTab === 'info' && (
          <form
            id="tab-panel-info"
            role="tabpanel"
            onSubmit={handleSubmit}
            className="p-6 space-y-4"
          >
            {/* Staff ID (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">職員ID</label>
              <div className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 min-h-[44px] flex items-center">
                {staff.staff_id}
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                氏名 <span className="text-red-500">*</span>
              </label>
              <input
                id="edit-name"
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'edit-name-error' : undefined}
              />
              {errors.name && (
                <p id="edit-name-error" role="alert" className="mt-1 text-sm text-red-600">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Name Kana */}
            <div>
              <label
                htmlFor="edit-name_kana"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                フリガナ <span className="text-red-500">*</span>
              </label>
              <input
                id="edit-name_kana"
                type="text"
                value={formData.name_kana || ''}
                onChange={(e) => handleChange('name_kana', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
                aria-invalid={!!errors.name_kana}
                aria-describedby={errors.name_kana ? 'edit-name_kana-error' : undefined}
              />
              {errors.name_kana && (
                <p id="edit-name_kana-error" role="alert" className="mt-1 text-sm text-red-600">
                  {errors.name_kana}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="edit-email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                id="edit-email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'edit-email-error' : undefined}
              />
              {errors.email && (
                <p id="edit-email-error" role="alert" className="mt-1 text-sm text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label
                htmlFor="edit-role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                権限 <span className="text-red-500">*</span>
              </label>
              <select
                id="edit-role"
                value={formData.role || 'staff'}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              >
                <option value="staff">スタッフ</option>
                <option value="manager">マネージャー</option>
              </select>
            </div>

            {/* Department */}
            <div>
              <label
                htmlFor="edit-department"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                部署 <span className="text-red-500">*</span>
              </label>
              <input
                id="edit-department"
                type="text"
                value={formData.department || ''}
                onChange={(e) => handleChange('department', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
                aria-invalid={!!errors.department}
                aria-describedby={errors.department ? 'edit-department-error' : undefined}
              />
              {errors.department && (
                <p id="edit-department-error" role="alert" className="mt-1 text-sm text-red-600">
                  {errors.department}
                </p>
              )}
            </div>

            {/* Submit Error */}
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl" role="alert">
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            )}

            {/* Submit Success */}
            {submitSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl" role="alert">
                <p className="text-sm text-green-700">職員情報を更新しました</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2 min-h-[44px]"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSubmitting || submitSuccess}
                className="px-6 py-3 bg-[#1E40AF] text-white rounded-lg font-medium hover:bg-[#1E3A8A] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2 min-h-[44px]"
              >
                {isSubmitting ? '更新中...' : '更新'}
              </button>
            </div>
          </form>
        )}

        {/* Tab Content: Patients */}
        {activeTab === 'patients' && (
          <div id="tab-panel-patients" role="tabpanel" className="p-6">
            {patientSaveSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-4" role="alert">
                <p className="text-sm text-green-700">担当患者を更新しました</p>
              </div>
            )}
            <PatientAssignmentSelector
              staffId={staff.id}
              currentAssignments={assignedPatients}
              onSave={handleSavePatients}
              isSaving={isSavingPatients}
            />
          </div>
        )}
      </div>
    </div>
  )
}
