import { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { api } from '../lib/api'
import type { CreatePatientRequest, PatientStatus } from '../lib/api-types'

interface PatientCreateDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface FormData {
  user_code: string
  name: string
  name_kana: string
  email: string
  birth_date: string
  password: string
  gender: string
  phone: string
  status: PatientStatus
  condition: string
}

interface FormErrors {
  user_code?: string
  name?: string
  email?: string
  birth_date?: string
  password?: string
  general?: string
}

const initialFormData: FormData = {
  user_code: '',
  name: '',
  name_kana: '',
  email: '',
  birth_date: '',
  password: '',
  gender: '',
  phone: '',
  status: '維持期',
  condition: '',
}

export function PatientCreateDialog({
  isOpen,
  onOpenChange,
  onSuccess,
}: PatientCreateDialogProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [savedPassword, setSavedPassword] = useState('')

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData)
      setErrors({})
      setShowSuccess(false)
      setSavedPassword('')
    }
  }, [isOpen])

  // Password complexity checks
  const passwordLengthMet = formData.password.length >= 8
  const passwordComplexityMet = (() => {
    let types = 0
    if (/[a-z]/.test(formData.password)) types++
    if (/[A-Z]/.test(formData.password)) types++
    if (/[0-9]/.test(formData.password)) types++
    if (/[^a-zA-Z0-9]/.test(formData.password)) types++
    return types >= 2
  })()

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.user_code.trim()) {
      newErrors.user_code = '患者コードを入力してください'
    }

    if (!formData.name.trim()) {
      newErrors.name = '氏名を入力してください'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください'
    }

    if (!formData.birth_date) {
      newErrors.birth_date = '生年月日を入力してください'
    }

    if (!formData.password) {
      newErrors.password = 'パスワードを入力してください'
    } else if (!passwordLengthMet || !passwordComplexityMet) {
      newErrors.password = 'パスワードは8文字以上、2種類以上の文字を含めてください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const requestData: CreatePatientRequest = {
        user_code: formData.user_code,
        name: formData.name,
        name_kana: formData.name_kana,
        email: formData.email,
        birth_date: formData.birth_date,
        password: formData.password,
        gender: formData.gender,
        phone: formData.phone,
        status: formData.status,
        condition: formData.condition,
      }

      await api.createPatient(requestData)

      // Save password for display
      setSavedPassword(formData.password)
      setShowSuccess(true)
      onSuccess()
    } catch (error) {
      const err = error as Error & { errors?: Record<string, string[]> }

      if (err.errors?.user_code) {
        setErrors({ user_code: 'この患者コードは既に使用されています' })
      } else if (err.errors?.email_bidx) {
        setErrors({ email: 'このメールアドレスは既に使用されています' })
      } else {
        setErrors({ general: err.message || '登録に失敗しました' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="dialog-title" className="text-xl font-bold text-gray-900">
            新規患者登録
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State */}
        {showSuccess ? (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                患者を登録しました
              </h3>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">初期パスワード（印刷用）</p>
              <p className="text-lg font-mono font-semibold text-gray-900 bg-white p-3 rounded border border-gray-200">
                {savedPassword}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                このパスワードは患者様に安全にお伝えください。
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 px-4 bg-[#1E40AF] text-white font-medium rounded-lg hover:bg-[#1E3A8A] transition-colors min-h-[44px]"
            >
              閉じる
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6">
            {/* General Error */}
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {errors.general}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* User Code */}
              <div>
                <label htmlFor="user_code" className="block text-sm font-medium text-gray-700 mb-1">
                  患者コード <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="user_code"
                  name="user_code"
                  value={formData.user_code}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-base min-h-[44px] ${
                    errors.user_code ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="USR001"
                />
                {errors.user_code && (
                  <p className="mt-1 text-sm text-red-500">{errors.user_code}</p>
                )}
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  氏名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-base min-h-[44px] ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="山田 太郎"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Name Kana */}
              <div>
                <label htmlFor="name_kana" className="block text-sm font-medium text-gray-700 mb-1">
                  フリガナ
                </label>
                <input
                  type="text"
                  id="name_kana"
                  name="name_kana"
                  value={formData.name_kana}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-base min-h-[44px]"
                  placeholder="ヤマダ タロウ"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-base min-h-[44px] ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="yamada@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Birth Date */}
              <div>
                <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-1">
                  生年月日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="birth_date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-base min-h-[44px] ${
                    errors.birth_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.birth_date && (
                  <p className="mt-1 text-sm text-red-500">{errors.birth_date}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  パスワード <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-base min-h-[44px] ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="8文字以上"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
                {/* Password Requirements */}
                <div className="mt-2 space-y-1">
                  <div
                    data-testid="password-length-check"
                    className={`flex items-center text-sm ${
                      passwordLengthMet ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    8文字以上
                  </div>
                  <div
                    data-testid="password-complexity-check"
                    className={`flex items-center text-sm ${
                      passwordComplexityMet ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    2種類以上の文字
                  </div>
                </div>
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  性別
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-base min-h-[44px]"
                >
                  <option value="">選択してください</option>
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                  <option value="other">その他</option>
                </select>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  電話番号
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-base min-h-[44px]"
                  placeholder="090-1234-5678"
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  病期
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-base min-h-[44px]"
                >
                  <option value="急性期">急性期</option>
                  <option value="回復期">回復期</option>
                  <option value="維持期">維持期</option>
                </select>
              </div>

              {/* Condition */}
              <div className="md:col-span-2">
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                  疾患・身体状態
                </label>
                <input
                  type="text"
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-base min-h-[44px]"
                  placeholder="変形性膝関節症"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors min-h-[44px]"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 bg-[#1E40AF] text-white font-medium rounded-lg hover:bg-[#1E3A8A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
              >
                {isSubmitting ? '登録中...' : '登録'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default PatientCreateDialog
