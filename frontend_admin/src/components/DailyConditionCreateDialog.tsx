import { useState } from 'react'
import { X } from 'lucide-react'
import { api } from '../lib/api'
import type { CreateDailyConditionRequest } from '../lib/api-types'

function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

interface FormErrors {
  recorded_date?: string
  pain_level?: string
  body_condition?: string
}

interface DailyConditionCreateDialogProps {
  isOpen: boolean
  patientId: string
  onClose: () => void
  onSuccess: () => void
}

export function DailyConditionCreateDialog({
  isOpen,
  patientId,
  onClose,
  onSuccess,
}: DailyConditionCreateDialogProps) {
  const [formData, setFormData] = useState<CreateDailyConditionRequest>({
    recorded_date: todayString(),
    pain_level: 0,
    body_condition: 5,
    notes: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.recorded_date) {
      newErrors.recorded_date = '記録日を入力してください'
    }

    if (formData.pain_level < 0 || formData.pain_level > 10 || !Number.isInteger(formData.pain_level)) {
      newErrors.pain_level = '0〜10の整数を入力してください'
    }

    if (formData.body_condition < 0 || formData.body_condition > 10 || !Number.isInteger(formData.body_condition)) {
      newErrors.body_condition = '0〜10の整数を入力してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNumberChange = (field: 'pain_level' | 'body_condition', value: string) => {
    const num = value === '' ? 0 : parseInt(value, 10)
    setFormData((prev) => ({ ...prev, [field]: isNaN(num) ? prev[field] : num }))

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setIsSubmitting(true)
      setSubmitError(null)

      await api.createPatientDailyCondition(patientId, {
        recorded_date: formData.recorded_date,
        pain_level: formData.pain_level,
        body_condition: formData.body_condition,
        notes: formData.notes || undefined,
      })

      setSubmitSuccess(true)
      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 1000)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '登録に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      recorded_date: todayString(),
      pain_level: 0,
      body_condition: 5,
      notes: '',
    })
    setErrors({})
    setSubmitError(null)
    setSubmitSuccess(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="condition-create-dialog-title"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 id="condition-create-dialog-title" className="text-2xl font-bold text-gray-900">
            体調データ登録
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
          {/* Recorded Date */}
          <div>
            <label htmlFor="condition-create-date" className="block text-sm font-medium text-gray-700 mb-1">
              記録日 <span className="text-red-500">*</span>
            </label>
            <input
              id="condition-create-date"
              type="date"
              value={formData.recorded_date}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, recorded_date: e.target.value }))
                if (errors.recorded_date) {
                  setErrors((prev) => {
                    const next = { ...prev }
                    delete next.recorded_date
                    return next
                  })
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.recorded_date}
              aria-describedby={errors.recorded_date ? 'condition-create-date-error' : undefined}
            />
            {errors.recorded_date && (
              <p id="condition-create-date-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.recorded_date}
              </p>
            )}
          </div>

          {/* Pain Level */}
          <div>
            <label htmlFor="condition-create-pain" className="block text-sm font-medium text-gray-700 mb-1">
              痛みの程度（0〜10） <span className="text-red-500">*</span>
            </label>
            <input
              id="condition-create-pain"
              type="number"
              min={0}
              max={10}
              step={1}
              value={formData.pain_level}
              onChange={(e) => handleNumberChange('pain_level', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.pain_level}
              aria-describedby={errors.pain_level ? 'condition-create-pain-error' : undefined}
            />
            <p className="mt-1 text-sm text-gray-500">0: 痛みなし → 10: 激しい痛み</p>
            {errors.pain_level && (
              <p id="condition-create-pain-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.pain_level}
              </p>
            )}
          </div>

          {/* Body Condition */}
          <div>
            <label htmlFor="condition-create-body" className="block text-sm font-medium text-gray-700 mb-1">
              体の調子（0〜10） <span className="text-red-500">*</span>
            </label>
            <input
              id="condition-create-body"
              type="number"
              min={0}
              max={10}
              step={1}
              value={formData.body_condition}
              onChange={(e) => handleNumberChange('body_condition', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.body_condition}
              aria-describedby={errors.body_condition ? 'condition-create-body-error' : undefined}
            />
            <p className="mt-1 text-sm text-gray-500">0: 悪い → 10: 良い</p>
            {errors.body_condition && (
              <p id="condition-create-body-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.body_condition}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="condition-create-notes" className="block text-sm font-medium text-gray-700 mb-1">
              備考
            </label>
            <textarea
              id="condition-create-notes"
              rows={3}
              value={formData.notes || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base resize-none"
              placeholder="備考があれば入力してください"
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
              <p className="text-sm text-green-700">体調データを登録しました</p>
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
              {isSubmitting ? '登録中...' : '登録'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
