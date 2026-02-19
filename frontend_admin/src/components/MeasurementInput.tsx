import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import type { MeasurementInput as MeasurementInputType } from '../lib/api-types'

interface FormErrors {
  measured_date?: string
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

const calculateWBI = (strengthN: number | undefined, weightKg: number | undefined): number | undefined => {
  if (strengthN === undefined || weightKg === undefined || weightKg <= 0) return undefined
  const strengthKgf = strengthN / 9.80665
  return Math.round((strengthKgf / weightKg) * 100 * 100) / 100
}

export function MeasurementInput() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [formData, setFormData] = useState<Partial<MeasurementInputType>>({
    measured_date: new Date().toISOString().split('T')[0],
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.measured_date) {
      newErrors.measured_date = '測定日を入力してください'
    }

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

  const handleChange = (field: keyof MeasurementInputType, value: string) => {
    setFormData(prev => {
      const newData = { ...prev }

      if (field === 'measured_date' || field === 'notes') {
        newData[field] = value
      } else {
        newData[field] = value === '' ? undefined : parseFloat(value)
      }

      // Auto-calculate WBI when weight or knee strength changes
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

    // Clear error for this field
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field as keyof FormErrors]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!id) return

    try {
      setIsSubmitting(true)
      setSubmitError(null)

      // Only send fields that have values
      const dataToSubmit: Partial<MeasurementInputType> = {
        measured_date: formData.measured_date!,
      }

      if (formData.weight_kg !== undefined) dataToSubmit.weight_kg = formData.weight_kg
      if (formData.knee_extension_strength_left !== undefined)
        dataToSubmit.knee_extension_strength_left = formData.knee_extension_strength_left
      if (formData.knee_extension_strength_right !== undefined)
        dataToSubmit.knee_extension_strength_right = formData.knee_extension_strength_right
      if (formData.wbi_left !== undefined) dataToSubmit.wbi_left = formData.wbi_left
      if (formData.wbi_right !== undefined) dataToSubmit.wbi_right = formData.wbi_right
      if (formData.tug_seconds !== undefined) dataToSubmit.tug_seconds = formData.tug_seconds
      if (formData.single_leg_stance_seconds !== undefined)
        dataToSubmit.single_leg_stance_seconds = formData.single_leg_stance_seconds
      if (formData.nrs_pain_score !== undefined) dataToSubmit.nrs_pain_score = formData.nrs_pain_score
      if (formData.mmt_score !== undefined) dataToSubmit.mmt_score = formData.mmt_score
      if (formData.percent_mv !== undefined) dataToSubmit.percent_mv = formData.percent_mv
      if (formData.notes) dataToSubmit.notes = formData.notes

      await api.createMeasurement(id, dataToSubmit as MeasurementInputType)

      navigate(`/patients/${id}`)
    } catch {
      setSubmitError('測定値の保存に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate(`/patients/${id}`)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">測定値入力</h1>
        <p className="text-gray-600">患者の測定値を記録します</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Measured Date */}
          <div>
            <label htmlFor="measured_date" className="block text-sm font-medium text-gray-700 mb-2">
              測定日 <span className="text-red-500">*</span>
            </label>
            <input
              id="measured_date"
              type="date"
              value={formData.measured_date || ''}
              onChange={e => handleChange('measured_date', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              required
              aria-invalid={!!errors.measured_date}
              aria-describedby={errors.measured_date ? 'measured_date-error' : undefined}
            />
            {errors.measured_date && (
              <p id="measured_date-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.measured_date}
              </p>
            )}
          </div>

          {/* Weight */}
          <div>
            <label htmlFor="weight_kg" className="block text-sm font-medium text-gray-700 mb-2">
              体重 (kg)
            </label>
            <input
              id="weight_kg"
              type="number"
              step="0.1"
              min="0"
              max="499.99"
              value={formData.weight_kg ?? ''}
              onChange={e => handleChange('weight_kg', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.weight_kg}
              aria-describedby={errors.weight_kg ? 'weight_kg-error' : undefined}
            />
            {errors.weight_kg && (
              <p id="weight_kg-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.weight_kg}
              </p>
            )}
          </div>

          {/* Knee Extension Strength Left */}
          <div>
            <label htmlFor="knee_extension_strength_left" className="block text-sm font-medium text-gray-700 mb-2">
              膝伸展筋力 左 (N)
            </label>
            <input
              id="knee_extension_strength_left"
              type="number"
              step="0.1"
              min="0"
              max="500"
              value={formData.knee_extension_strength_left ?? ''}
              onChange={e => handleChange('knee_extension_strength_left', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.knee_extension_strength_left}
              aria-describedby={errors.knee_extension_strength_left ? 'knee_extension_strength_left-error' : undefined}
            />
            {errors.knee_extension_strength_left && (
              <p id="knee_extension_strength_left-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.knee_extension_strength_left}
              </p>
            )}
          </div>

          {/* Knee Extension Strength Right */}
          <div>
            <label htmlFor="knee_extension_strength_right" className="block text-sm font-medium text-gray-700 mb-2">
              膝伸展筋力 右 (N)
            </label>
            <input
              id="knee_extension_strength_right"
              type="number"
              step="0.1"
              min="0"
              max="500"
              value={formData.knee_extension_strength_right ?? ''}
              onChange={e => handleChange('knee_extension_strength_right', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.knee_extension_strength_right}
              aria-describedby={errors.knee_extension_strength_right ? 'knee_extension_strength_right-error' : undefined}
            />
            {errors.knee_extension_strength_right && (
              <p id="knee_extension_strength_right-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.knee_extension_strength_right}
              </p>
            )}
          </div>

          {/* WBI Left */}
          <div>
            <label htmlFor="wbi_left" className="block text-sm font-medium text-gray-700 mb-2">
              WBI 左 (0-200)
            </label>
            <input
              id="wbi_left"
              type="number"
              step="0.01"
              value={formData.wbi_left ?? ''}
              onChange={e => handleChange('wbi_left', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.wbi_left}
              aria-describedby={errors.wbi_left ? 'wbi_left-error' : undefined}
              placeholder="自動計算されます"
            />
            {errors.wbi_left && (
              <p id="wbi_left-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.wbi_left}
              </p>
            )}
          </div>

          {/* WBI Right */}
          <div>
            <label htmlFor="wbi_right" className="block text-sm font-medium text-gray-700 mb-2">
              WBI 右 (0-200)
            </label>
            <input
              id="wbi_right"
              type="number"
              step="0.01"
              value={formData.wbi_right ?? ''}
              onChange={e => handleChange('wbi_right', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.wbi_right}
              aria-describedby={errors.wbi_right ? 'wbi_right-error' : undefined}
              placeholder="自動計算されます"
            />
            {errors.wbi_right && (
              <p id="wbi_right-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.wbi_right}
              </p>
            )}
          </div>

          {/* TUG */}
          <div>
            <label htmlFor="tug_seconds" className="block text-sm font-medium text-gray-700 mb-2">
              TUG (秒)
            </label>
            <input
              id="tug_seconds"
              type="number"
              step="0.1"
              min="0"
              max="999.99"
              value={formData.tug_seconds ?? ''}
              onChange={e => handleChange('tug_seconds', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.tug_seconds}
              aria-describedby={errors.tug_seconds ? 'tug_seconds-error' : undefined}
            />
            {errors.tug_seconds && (
              <p id="tug_seconds-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.tug_seconds}
              </p>
            )}
          </div>

          {/* Single Leg Stance */}
          <div>
            <label htmlFor="single_leg_stance_seconds" className="block text-sm font-medium text-gray-700 mb-2">
              片脚立位 (秒)
            </label>
            <input
              id="single_leg_stance_seconds"
              type="number"
              step="0.1"
              min="0"
              max="999.99"
              value={formData.single_leg_stance_seconds ?? ''}
              onChange={e => handleChange('single_leg_stance_seconds', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.single_leg_stance_seconds}
              aria-describedby={errors.single_leg_stance_seconds ? 'single_leg_stance_seconds-error' : undefined}
            />
            {errors.single_leg_stance_seconds && (
              <p id="single_leg_stance_seconds-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.single_leg_stance_seconds}
              </p>
            )}
          </div>

          {/* NRS Pain Score */}
          <div>
            <label htmlFor="nrs_pain_score" className="block text-sm font-medium text-gray-700 mb-2">
              NRS痛みスコア (0-10)
            </label>
            <input
              id="nrs_pain_score"
              type="number"
              min="0"
              max="10"
              value={formData.nrs_pain_score ?? ''}
              onChange={e => handleChange('nrs_pain_score', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.nrs_pain_score}
              aria-describedby={errors.nrs_pain_score ? 'nrs_pain_score-error' : undefined}
            />
            {errors.nrs_pain_score && (
              <p id="nrs_pain_score-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.nrs_pain_score}
              </p>
            )}
          </div>

          {/* MMT Score */}
          <div>
            <label htmlFor="mmt_score" className="block text-sm font-medium text-gray-700 mb-2">
              MMTスコア (0-5)
            </label>
            <input
              id="mmt_score"
              type="number"
              min="0"
              max="5"
              value={formData.mmt_score ?? ''}
              onChange={e => handleChange('mmt_score', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.mmt_score}
              aria-describedby={errors.mmt_score ? 'mmt_score-error' : undefined}
            />
            {errors.mmt_score && (
              <p id="mmt_score-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.mmt_score}
              </p>
            )}
          </div>

          {/* Percent MV */}
          <div>
            <label htmlFor="percent_mv" className="block text-sm font-medium text-gray-700 mb-2">
              ％MV 筋質量 (%)
            </label>
            <input
              id="percent_mv"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.percent_mv ?? ''}
              onChange={e => handleChange('percent_mv', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.percent_mv}
              aria-describedby={errors.percent_mv ? 'percent_mv-error' : undefined}
            />
            {errors.percent_mv && (
              <p id="percent_mv-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.percent_mv}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              備考
            </label>
            <textarea
              id="notes"
              rows={4}
              value={formData.notes || ''}
              onChange={e => handleChange('notes', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base"
              placeholder="特記事項があれば入力してください"
            />
          </div>
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl" role="alert">
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2 min-h-[44px]"
            aria-label="キャンセル"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-[#1E40AF] text-white rounded-lg font-medium hover:bg-[#1E3A8A] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2 min-h-[44px]"
            aria-label="保存"
          >
            {isSubmitting ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default MeasurementInput
