import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Heart, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { api } from '../lib/api'
import { z } from 'zod'

const passwordSchema = z.object({
  password: z
    .string()
    .min(1, 'パスワードを入力してください')
    .min(8, 'パスワードは8文字以上で入力してください'),
  passwordConfirmation: z
    .string()
    .min(1, 'パスワード（確認）を入力してください'),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: 'パスワードが一致しません',
  path: ['passwordConfirmation'],
})

type PasswordFormData = z.infer<typeof passwordSchema>
type ValidationErrors = Partial<Record<keyof PasswordFormData, string>>

export function ForgotPasswordReset() {
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>()

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  const validate = (): boolean => {
    const result = passwordSchema.safeParse({ password, passwordConfirmation })

    if (!result.success) {
      const errors: ValidationErrors = {}
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof PasswordFormData
        if (!errors[field]) {
          errors[field] = err.message
        }
      })
      setValidationErrors(errors)
      return false
    }

    setValidationErrors({})
    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validate()) {
      return
    }

    if (!token) {
      setSubmitError('トークンが無効です')
      return
    }

    try {
      setIsSubmitting(true)
      await api.resetPasswordWithToken({
        token,
        new_password: password,
        new_password_confirmation: passwordConfirmation,
      })
      setIsCompleted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'パスワードの更新に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (submitError) setSubmitError(null)
    if (validationErrors.password) {
      setValidationErrors((prev) => ({ ...prev, password: undefined }))
    }
  }

  const handlePasswordConfirmationChange = (value: string) => {
    setPasswordConfirmation(value)
    if (submitError) setSubmitError(null)
    if (validationErrors.passwordConfirmation) {
      setValidationErrors((prev) => ({ ...prev, passwordConfirmation: undefined }))
    }
  }

  const firstError = validationErrors.password || validationErrors.passwordConfirmation

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <div>
                <p className="text-base font-medium text-[#0B1220] mb-2">
                  パスワードを変更しました
                </p>
                <p className="text-sm text-[#64748B]">
                  新しいパスワードでログインしてください。
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                ログイン画面へ
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Logo Area */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-[#1E40AF] rounded-2xl flex items-center justify-center mb-4">
              <Heart size={32} className="text-white" fill="white" />
            </div>

            <h1 className="text-xl font-bold text-[#0B1220] mb-1">
              新しいパスワードを設定
            </h1>
            <p className="text-[#64748B] text-sm text-center">
              8文字以上のパスワードを設定してください
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                label="新しいパスワード"
                placeholder="パスワードを入力"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                error={validationErrors.password}
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] p-2 text-gray-500 hover:text-gray-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={showPassword ? 'パスワードを非表示' : 'パスワードを表示'}
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="relative">
              <Input
                type={showPasswordConfirmation ? 'text' : 'password'}
                label="パスワード（確認）"
                placeholder="パスワードを再入力"
                value={passwordConfirmation}
                onChange={(e) => handlePasswordConfirmationChange(e.target.value)}
                error={validationErrors.passwordConfirmation}
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                className="absolute right-3 top-[38px] p-2 text-gray-500 hover:text-gray-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={showPasswordConfirmation ? 'パスワードを非表示' : 'パスワードを表示'}
                disabled={isSubmitting}
              >
                {showPasswordConfirmation ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* API error */}
            {submitError && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
              >
                {submitError}
              </div>
            )}

            {/* Validation error */}
            {firstError && !submitError && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
              >
                {firstError}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isSubmitting}
            >
              {isSubmitting ? '設定中...' : 'パスワードを設定'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordReset
