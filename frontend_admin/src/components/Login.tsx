import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Eye, EyeOff, Heart } from 'lucide-react'
import { z } from 'zod'

// Validation schema
const loginSchema = z.object({
  staffId: z
    .string()
    .min(1, '職員IDを入力してください'),
  password: z
    .string()
    .min(1, 'パスワードを入力してください'),
})

type LoginFormData = z.infer<typeof loginSchema>
type ValidationErrors = Partial<Record<keyof LoginFormData, string>>

export function Login() {
  const navigate = useNavigate()
  const { login, isLoading, error: authError, clearError, isAuthenticated } = useAuth()

  const [staffId, setStaffId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const validateForm = (): boolean => {
    const result = loginSchema.safeParse({ staffId, password })

    if (!result.success) {
      const errors: ValidationErrors = {}
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof LoginFormData
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

    if (!validateForm()) {
      return
    }

    try {
      await login(staffId, password)
      navigate('/dashboard')
    } catch {
      // Error is handled by AuthContext
    }
  }

  const handleStaffIdChange = (value: string) => {
    setStaffId(value)
    if (authError) {
      clearError()
    }
    if (validationErrors.staffId) {
      setValidationErrors((prev) => ({ ...prev, staffId: undefined }))
    }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (authError) {
      clearError()
    }
    if (validationErrors.password) {
      setValidationErrors((prev) => ({ ...prev, password: undefined }))
    }
  }

  const handlePasswordReset = () => {
    navigate('/password-reset')
  }

  // Get first validation error for alert
  const firstValidationError = validationErrors.staffId || validationErrors.password

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Logo Area */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-[#1E40AF] rounded-2xl flex items-center justify-center mb-4">
              <Heart size={32} className="text-white" fill="white" />
            </div>

            <h1 className="text-xl font-bold text-[#0B1220] mb-1">
              サイテック病院
            </h1>
            <p className="text-[#64748B] text-sm">
              リハビリ支援システム - 職員ログイン
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="text"
              label="職員ID"
              placeholder="例: STF001"
              value={staffId}
              onChange={(e) => handleStaffIdChange(e.target.value)}
              error={validationErrors.staffId}
              disabled={isLoading}
              autoComplete="username"
            />

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                label="パスワード"
                placeholder="パスワードを入力"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                error={validationErrors.password}
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] p-2 text-gray-500 hover:text-gray-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={showPassword ? 'パスワードを非表示' : 'パスワードを表示'}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Auth error from context */}
            {authError && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
              >
                {authError}
              </div>
            )}

            {/* Validation error alert */}
            {firstValidationError && !authError && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
              >
                {firstValidationError}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handlePasswordReset}
                className="text-[#1E40AF] hover:underline text-sm py-2 px-4 min-h-[44px]"
                disabled={isLoading}
              >
                パスワードをお忘れですか？
              </button>
            </div>
          </form>
        </div>

        {/* Session timeout notice */}
        <p className="text-center text-xs text-[#64748B] mt-4">
          セキュリティのため、15分間操作がない場合は自動的にログアウトされます
        </p>

        {/* Demo hint - for development only */}
        {import.meta.env.DEV && (
          <div className="mt-4 bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              <strong>開発用:</strong> MGR001 / Manager1! または STF001 / Staff123!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Login
