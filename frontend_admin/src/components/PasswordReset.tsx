import { useState, useMemo } from 'react'
import { Check, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'

interface FormErrors {
  current_password?: string
  new_password?: string
  new_password_confirmation?: string
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

interface PasswordMatchProps {
  password: string
  confirmPassword: string
}

function PasswordMatch({ password, confirmPassword }: PasswordMatchProps) {
  const isMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword

  return (
    <div className="mt-2">
      <div
        data-testid="password-match-check"
        className={`flex items-center gap-2 text-sm ${isMatch ? 'text-green-600' : 'text-gray-500'}`}
      >
        {isMatch ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
        パスワードが一致
      </div>
    </div>
  )
}

export function PasswordReset() {
  const { logout } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!currentPassword.trim()) {
      newErrors.current_password = '現在のパスワードを入力してください'
    }

    const hasMinLength = newPassword.length >= 8
    let characterTypes = 0
    if (/[a-z]/.test(newPassword)) characterTypes++
    if (/[A-Z]/.test(newPassword)) characterTypes++
    if (/[0-9]/.test(newPassword)) characterTypes++
    if (/[^a-zA-Z0-9]/.test(newPassword)) characterTypes++

    if (!hasMinLength || characterTypes < 2) {
      newErrors.new_password = 'パスワードは8文字以上、2種類以上の文字を含めてください'
    }

    if (newPassword !== confirmPassword) {
      newErrors.new_password_confirmation = 'パスワードが一致しません'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: keyof FormErrors, value: string) => {
    if (field === 'current_password') {
      setCurrentPassword(value)
    } else if (field === 'new_password') {
      setNewPassword(value)
    } else if (field === 'new_password_confirmation') {
      setConfirmPassword(value)
    }

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
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

      await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      })

      setSubmitSuccess(true)

      // Auto logout after 2 seconds
      setTimeout(() => {
        logout()
      }, 2000)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'パスワードの変更に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">パスワード変更</h1>
        <p className="text-gray-600">自分のパスワードを変更できます。変更後は再ログインが必要です。</p>
      </div>

      {/* Password Change Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 max-w-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Password */}
          <div>
            <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-1">
              現在のパスワード <span className="text-red-500">*</span>
            </label>
            <input
              id="current_password"
              type="password"
              value={currentPassword}
              onChange={(e) => handleChange('current_password', e.target.value)}
              autoComplete="current-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.current_password}
              aria-describedby={errors.current_password ? 'current_password-error' : undefined}
            />
            {errors.current_password && (
              <p id="current_password-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.current_password}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
              新しいパスワード <span className="text-red-500">*</span>
            </label>
            <input
              id="new_password"
              type="password"
              value={newPassword}
              onChange={(e) => handleChange('new_password', e.target.value)}
              autoComplete="new-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.new_password}
              aria-describedby={errors.new_password ? 'new_password-error' : 'password-requirements'}
            />
            <PasswordStrength password={newPassword} />
            {errors.new_password && (
              <p id="new_password-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.new_password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="new_password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
              新しいパスワード（確認） <span className="text-red-500">*</span>
            </label>
            <input
              id="new_password_confirmation"
              type="password"
              value={confirmPassword}
              onChange={(e) => handleChange('new_password_confirmation', e.target.value)}
              autoComplete="new-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-base min-h-[44px]"
              aria-invalid={!!errors.new_password_confirmation}
              aria-describedby={errors.new_password_confirmation ? 'new_password_confirmation-error' : undefined}
            />
            <PasswordMatch password={newPassword} confirmPassword={confirmPassword} />
            {errors.new_password_confirmation && (
              <p id="new_password_confirmation-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.new_password_confirmation}
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
              <p className="text-sm text-green-700">パスワードを変更しました。ログイン画面に移動します...</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || submitSuccess}
              className="w-full px-6 py-3 bg-[#1E40AF] text-white rounded-lg font-medium hover:bg-[#1E3A8A] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2 min-h-[44px]"
            >
              {isSubmitting ? '変更中...' : 'パスワードを変更'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PasswordReset
