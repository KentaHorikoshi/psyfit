import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { api } from '../lib/api'
import type { Measurement, MeasurementInput } from '../lib/api-types'

interface FormErrors {
  weight_kg?: string
  knee_extension_strength_left?: string
  knee_extension_strength_right?: string
  wbi_left?: string
  wbi_right?: string
  tug_seconds?: string
  single_leg_stance_seconds?: string
  nrs_pain_score?: string
  mmt_score?: string
  percent_mv?: string
}

interface MeasurementEditDialogProps {
  isOpen: boolean
  patientId: string
  measurement: Measurement | null
  onClose: () => void
  onSuccess: () => void
}

const calculateWBI = (strengthN: number | undefined, weightKg: number | undefined): number | undefined => {
  if (strengthN === undefined || weightKg === undefined || weightKg <= 0) return undefined
  const strengthKgf = strengthN / 9.80665
  return Math.round((strengthKgf / weightKg) * 100 * 100) / 100
}

const toNum = (val: string | number | undefined | null): number | undefined => {
  if (val == null || val === '') return undefined
  const n = Number(val)
  return isNaN(n) ? undefined : n
}

export function MeasurementEditDialog({
  isOpen,
  patientId,
  measurement,
  onClose,
  onSuccess,
}: MeasurementEditDialogProps) {
  const [formData, setFormData] = useState<Partial<MeasurementInput>>({})
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    if (measurement && isOpen) {
      setFormData({
        measured_date: measurement.measured_date,
        weight_kg: toNum(measurement.weight_kg),
        knee_extension_strength_left: toNum(measurement.knee_extension_strength_left),
        knee_extension_strength_right: toNum(measurement.knee_extension_strength_right),
        wbi_left: toNum(measurement.wbi_left),
        wbi_right: toNum(measurement.wbi_right),
        tug_seconds: toNum(measurement.tug_seconds),
        single_leg_stance_seconds: toNum(measurement.single_leg_stance_seconds),
        nrs_pain_score: toNum(measurement.nrs_pain_score),
        mmt_score: toNum(measurement.mmt_score),
        percent_mv: toNum(measurement.percent_mv),
        notes: measurement.notes || '',
      })
      setErrors({})
      setSubmitError(null)
      setSubmitSuccess(false)
    }
  }, [measurement, isOpen])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (formData.weight_kg !== undefined && (formData.weight_kg <= 0 || formData.weight_kg >= 500)) {
      newErrors.weight_kg = '0より大きく500未満の値を入力してください'
    }
    if (formData.knee_extension_strength_left !== undefined && (formData.knee_extension_strength_left < 0 || formData.knee_extension_strength_left > 500)) {
      newErrors.knee_extension_strength_left = '0〜500の範囲で入力してください (N)'
    }
    if (formData.knee_extension_strength_right !== undefined && (formData.knee_extension_strength_right < 0 || formData.knee_extension_strength_right > 500)) {
      newErrors.knee_extension_strength_right = '0〜500の範囲で入力してください (N)'
    }
    if (formData.wbi_left !== undefined && (formData.wbi_left < 0 || formData.wbi_left > 200)) {
      newErrors.wbi_left = '0〜200の範囲で入力してください'
    }
    if (formData.wbi_right !== undefined && (formData.wbi_right < 0 || formData.wbi_right > 200)) {
      newErrors.wbi_right = '0〜200の範囲で入力してください'
    }
    if (formData.tug_seconds !== undefined && (formData.tug_seconds < 0 || formData.tug_seconds >= 1000)) {
      newErrors.tug_seconds = '0以上1000未満の値を入力してください'
    }
    if (formData.single_leg_stance_seconds !== undefined && (formData.single_leg_stance_seconds < 0 || formData.single_leg_stance_seconds >= 1000)) {
      newErrors.single_leg_stance_seconds = '0以上1000未満の値を入力してください'
    }
    if (formData.nrs_pain_score !== undefined && (formData.nrs_pain_score < 0 || formData.nrs_pain_score > 10)) {
      newErrors.nrs_pain_score = '0〜10の範囲で入力してください'
    }
    if (formData.mmt_score !== undefined && (formData.mmt_score < 0 || formData.mmt_score > 5)) {
      newErrors.mmt_score = '0〜5の範囲で入力してください'
    }
    if (formData.percent_mv !== undefined && (formData.percent_mv < 0 || formData.percent_mv > 100)) {
      newErrors.percent_mv = '0〜100の範囲で入力してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: keyof MeasurementInput, value: string) => {
    setFormData(prev => {
      const newData = { ...prev }

      if (field === 'measured_date' || field === 'notes') {
        newData[field] = value
      } else {
        newData[field] = value === '' ? undefined : parseFloat(value)
      }

      if (field === 'weight_kg' || field === 'knee_extension_strength_left') {
        const weight = field === 'weight_kg' ? (value === '' ? undefined : parseFloat(value)) : newData.weight_kg
        const strengthLeft = field === 'knee_extension_strength_left' ? (value === '' ? undefined : parseFloat(value)) : newData.knee_extension_strength_left
        newData.wbi_left = calculateWBI(strengthLeft, weight)
      }

      if (field === 'weight_kg' || field === 'knee_extension_strength_right') {
        const weight = field === 'weight_kg' ? (value === '' ? undefined : parseFloat(value)) : newData.weight_kg
        const strengthRight = field === 'knee_extension_strength_right' ? (value === '' ? undefined : parseFloat(value)) : newData.knee_extension_strength_right
        newData.wbi_right = calculateWBI(strengthRight, weight)
      }

      return newData
    })

    if (errors[field as keyof FormErrors]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[field as keyof FormErrors]
        return next
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !measurement) return

    try {
      setIsSubmitting(true)
      setSubmitError(null)

      const dataToSubmit: Partial<MeasurementInput> = {}
      if (formData.weight_kg !== undefined) dataToSubmit.weight_kg = formData.weight_kg
      if (formData.knee_extension_strength_left !== undefined) dataToSubmit.knee_extension_strength_left = formData.knee_extension_strength_left
      if (formData.knee_extension_strength_right !== undefined) dataToSubmit.knee_extension_strength_right = formData.knee_extension_strength_right
      if (formData.wbi_left !== undefined) dataToSubmit.wbi_left = formData.wbi_left
      if (formData.wbi_right !== undefined) dataToSubmit.wbi_right = formData.wbi_right
      if (formData.tug_seconds !== undefined) dataToSubmit.tug_seconds = formData.tug_seconds
      if (formData.single_leg_stance_seconds !== undefined) dataToSubmit.single_leg_stance_seconds = formData.single_leg_stance_seconds
      if (formData.nrs_pain_score !== undefined) dataToSubmit.nrs_pain_score = formData.nrs_pain_score
      if (formData.mmt_score !== undefined) dataToSubmit.mmt_score = formData.mmt_score
      if (formData.percent_mv !== undefined) dataToSubmit.percent_mv = formData.percent_mv
      dataToSubmit.notes = formData.notes || undefined

      await api.updateMeasurement(patientId, measurement.id, dataToSubmit as MeasurementInput)

      setSubmitSuccess(true)
      setTimeout(() => {
        onSuccess()
        handleClose()
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

  if (!isOpen || !measurement) return null

  const fieldDef = (id: string, label: string, field: keyof MeasurementInput, opts?: { step?: string; min?: string; max?: string; placeholder?: string }) => (
    <div>
      <label htmlFor={`edit-${id}`} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={`edit-${id}`}
        type="number"
        step={opts?.step || '0.1'}
        min={opts?.min || '0'}
        max={opts?.max}
        value={formData[field] ?? ''}
        onChange={e => handleChange(field, e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
        aria-invalid={!!errors[field as keyof FormErrors]}
        aria-describedby={errors[field as keyof FormErrors] ? `edit-${id}-error` : undefined}
        placeholder={opts?.placeholder}
      />
      {errors[field as keyof FormErrors] && (
        <p id={`edit-${id}-error`} role="alert" className="mt-1 text-sm text-red-600">
          {errors[field as keyof FormErrors]}
        </p>
      )}
    </div>
  )

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="measurement-edit-dialog-title"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 id="measurement-edit-dialog-title" className="text-2xl font-bold text-gray-900">
            測定値編集
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

        <form onSubmit={handleSubmit} className="p-6">
          {/* Measured Date (read-only) */}
          <div className="mb-4">
            <label htmlFor="edit-measured-date" className="block text-sm font-medium text-gray-700 mb-1">
              測定日
            </label>
            <input
              id="edit-measured-date"
              type="date"
              value={formData.measured_date || ''}
              disabled
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base min-h-[44px] bg-gray-50 text-gray-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldDef('weight', '体重 (kg)', 'weight_kg', { max: '499.99' })}
            {fieldDef('knee-left', '膝伸展筋力 左 (N)', 'knee_extension_strength_left', { max: '500' })}
            {fieldDef('knee-right', '膝伸展筋力 右 (N)', 'knee_extension_strength_right', { max: '500' })}
            {fieldDef('wbi-left', 'WBI 左 (0-200)', 'wbi_left', { step: '0.01', placeholder: '自動計算されます' })}
            {fieldDef('wbi-right', 'WBI 右 (0-200)', 'wbi_right', { step: '0.01', placeholder: '自動計算されます' })}
            {fieldDef('tug', 'TUG (秒)', 'tug_seconds', { max: '999.99' })}
            {fieldDef('stance', '片脚立位 (秒)', 'single_leg_stance_seconds', { max: '999.99' })}
            {fieldDef('nrs', 'NRS痛みスコア (0-10)', 'nrs_pain_score', { step: '1', max: '10' })}
            {fieldDef('mmt', 'MMTスコア (0-5)', 'mmt_score', { step: '1', max: '5' })}
            {fieldDef('mv', '％MV 筋質量 (%)', 'percent_mv', { max: '100' })}
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label htmlFor="edit-notes" className="block text-sm font-medium text-gray-700 mb-1">
              備考
            </label>
            <textarea
              id="edit-notes"
              rows={3}
              value={formData.notes || ''}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base resize-none"
              placeholder="備考があれば入力してください"
            />
          </div>

          {submitError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl" role="alert">
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          {submitSuccess && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl" role="alert">
              <p className="text-sm text-green-700">測定値を更新しました</p>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-6">
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
