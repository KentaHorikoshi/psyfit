import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { api } from '../lib/api'
import type { PatientDetail, UpdatePatientRequest, PatientStatus } from '../lib/api-types'

interface FormErrors {
  name?: string
  email?: string
  birth_date?: string
}

interface PatientEditDialogProps {
  isOpen: boolean
  patient: PatientDetail | null
  onClose: () => void
  onSuccess: () => void
}

export function PatientEditDialog({ isOpen, onClose, onSuccess, patient }: PatientEditDialogProps) {
  const [formData, setFormData] = useState<UpdatePatientRequest>({})
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    if (patient && isOpen) {
      setFormData({
        name: patient.name,
        name_kana: patient.name_kana,
        email: patient.email,
        birth_date: patient.birth_date,
        gender: patient.gender,
        phone: patient.phone || '',
        status: patient.status,
        condition: patient.condition,
      })
      setErrors({})
      setSubmitError(null)
      setSubmitSuccess(false)
    }
  }, [patient, isOpen])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name?.trim()) {
      newErrors.name = '氏名を入力してください'
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'メールアドレスを入力してください'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください'
    }

    if (!formData.birth_date) {
      newErrors.birth_date = '生年月日を入力してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: keyof UpdatePatientRequest, value: string) => {
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

    if (!validateForm() || !patient) return

    try {
      setIsSubmitting(true)
      setSubmitError(null)

      await api.updatePatient(patient.id, formData)

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

  const handleClose = () => {
    setFormData({})
    setErrors({})
    setSubmitError(null)
    setSubmitSuccess(false)
    onClose()
  }

  if (!isOpen || !patient) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="patient-edit-dialog-title"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 id="patient-edit-dialog-title" className="text-2xl font-bold text-gray-900">
            患者情報編集
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="patient-edit-name" className="block text-sm font-medium text-gray-700 mb-1">
              氏名 <span className="text-red-500">*</span>
            </label>
            <input
              id="patient-edit-name"
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'patient-edit-name-error' : undefined}
            />
            {errors.name && (
              <p id="patient-edit-name-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          {/* Name Kana */}
          <div>
            <label htmlFor="patient-edit-name-kana" className="block text-sm font-medium text-gray-700 mb-1">
              フリガナ
            </label>
            <input
              id="patient-edit-name-kana"
              type="text"
              value={formData.name_kana || ''}
              onChange={(e) => handleChange('name_kana', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="patient-edit-email" className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              id="patient-edit-email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'patient-edit-email-error' : undefined}
            />
            {errors.email && (
              <p id="patient-edit-email-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          {/* Birth Date */}
          <div>
            <label htmlFor="patient-edit-birth-date" className="block text-sm font-medium text-gray-700 mb-1">
              生年月日 <span className="text-red-500">*</span>
            </label>
            <input
              id="patient-edit-birth-date"
              type="date"
              value={formData.birth_date || ''}
              onChange={(e) => handleChange('birth_date', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.birth_date}
              aria-describedby={errors.birth_date ? 'patient-edit-birth-date-error' : undefined}
            />
            {errors.birth_date && (
              <p id="patient-edit-birth-date-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.birth_date}
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label htmlFor="patient-edit-gender" className="block text-sm font-medium text-gray-700 mb-1">
              性別
            </label>
            <select
              id="patient-edit-gender"
              value={formData.gender || ''}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
            >
              <option value="">選択してください</option>
              <option value="male">男性</option>
              <option value="female">女性</option>
              <option value="other">その他</option>
            </select>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="patient-edit-phone" className="block text-sm font-medium text-gray-700 mb-1">
              電話番号
            </label>
            <input
              id="patient-edit-phone"
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
            />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="patient-edit-status" className="block text-sm font-medium text-gray-700 mb-1">
              病期ステータス
            </label>
            <select
              id="patient-edit-status"
              value={formData.status || ''}
              onChange={(e) => handleChange('status', e.target.value as PatientStatus)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
            >
              <option value="急性期">急性期</option>
              <option value="回復期">回復期</option>
              <option value="維持期">維持期</option>
            </select>
          </div>

          {/* Condition */}
          <div>
            <label htmlFor="patient-edit-condition" className="block text-sm font-medium text-gray-700 mb-1">
              疾患・身体状態
            </label>
            <input
              id="patient-edit-condition"
              type="text"
              value={formData.condition || ''}
              onChange={(e) => handleChange('condition', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
            />
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
              <p className="text-sm text-green-700">患者情報を更新しました</p>
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
      </div>
    </div>
  )
}
