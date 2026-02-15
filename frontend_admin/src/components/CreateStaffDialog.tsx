import { useState, useMemo } from 'react'
import { Check, X } from 'lucide-react'
import { api } from '../lib/api'
import type { CreateStaffRequest } from '../lib/api-types'

interface FormErrors {
  name?: string
  name_kana?: string
  email?: string
  password?: string
}

interface PasswordStrengthProps {
  password: string
}

function PasswordStrength({ password }: PasswordStrengthProps) {
  const hasMinLength = password.length >= 8

  const characterTypes = useMemo(() => {
    let types = 0
    if (/[a-z]/.test(password)) types++
    if (/[A-Z]/.test(password)) types++
    if (/[0-9]/.test(password)) types++
    if (/[^a-zA-Z0-9]/.test(password)) types++
    return types
  }, [password])

  const hasMinTypes = characterTypes >= 2

  return (
    <div className="mt-2 space-y-1">
      <div
        data-testid="password-length-check"
        className={`flex items-center gap-2 text-sm ${hasMinLength ? 'text-green-600' : 'text-gray-500'}`}
      >
        {hasMinLength ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
        8文字以上
      </div>
      <div
        data-testid="password-complexity-check"
        className={`flex items-center gap-2 text-sm ${hasMinTypes ? 'text-green-600' : 'text-gray-500'}`}
      >
        {hasMinTypes ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
        2種類以上の文字
      </div>
    </div>
  )
}

interface CreateStaffDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateStaffDialog({ isOpen, onClose, onSuccess }: CreateStaffDialogProps) {
  const [formData, setFormData] = useState<Partial<CreateStaffRequest>>({
    role: 'staff',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

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

    const password = formData.password || ''
    const hasMinLength = password.length >= 8
    let characterTypes = 0
    if (/[a-z]/.test(password)) characterTypes++
    if (/[A-Z]/.test(password)) characterTypes++
    if (/[0-9]/.test(password)) characterTypes++
    if (/[^a-zA-Z0-9]/.test(password)) characterTypes++

    if (!hasMinLength || characterTypes < 2) {
      newErrors.password = 'パスワードは8文字以上、2種類以上の文字を含めてください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: keyof CreateStaffRequest, value: string) => {
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

    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError(null)

      await api.createStaff(formData as CreateStaffRequest)

      setSubmitSuccess(true)
      setTimeout(() => {
        onSuccess()
        onClose()
        setFormData({ role: 'staff' })
        setSubmitSuccess(false)
      }, 1500)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '登録に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({ role: 'staff' })
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
      aria-labelledby="dialog-title"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 id="dialog-title" className="text-2xl font-bold text-gray-900">
            新規職員登録
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              氏名 <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          {/* Name Kana */}
          <div>
            <label htmlFor="name_kana" className="block text-sm font-medium text-gray-700 mb-1">
              フリガナ <span className="text-red-500">*</span>
            </label>
            <input
              id="name_kana"
              type="text"
              value={formData.name_kana || ''}
              onChange={(e) => handleChange('name_kana', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.name_kana}
              aria-describedby={errors.name_kana ? 'name_kana-error' : undefined}
            />
            {errors.name_kana && (
              <p id="name_kana-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.name_kana}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              パスワード <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              value={formData.password || ''}
              onChange={(e) => handleChange('password', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : 'password-requirements'}
            />
            <PasswordStrength password={formData.password || ''} />
            {errors.password && (
              <p id="password-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.password}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              権限 <span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              value={formData.role || 'staff'}
              onChange={(e) => handleChange('role', e.target.value as 'manager' | 'staff')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
            >
              <option value="staff">スタッフ</option>
              <option value="manager">マネージャー</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              部署
            </label>
            <input
              id="department"
              type="text"
              value={formData.department || ''}
              onChange={(e) => handleChange('department', e.target.value)}
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
              <p className="text-sm text-green-700">職員を登録しました</p>
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
