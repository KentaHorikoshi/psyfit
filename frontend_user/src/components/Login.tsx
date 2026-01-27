import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Eye, EyeOff, Heart } from 'lucide-react'
import { z } from 'zod'

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('メールアドレスの形式が正しくありません'),
  password: z
    .string()
    .min(1, 'パスワードを入力してください'),
})

type LoginFormData = z.infer<typeof loginSchema>
type ValidationErrors = Partial<Record<keyof LoginFormData, string>>

export function Login() {
  const navigate = useNavigate()
  const { login, isLoading, error: authError, clearError, isAuthenticated } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const isLoggingInRef = useRef(false)

  // Redirect if already authenticated (but not during login flow)
  useEffect(() => {
    if (isAuthenticated && !isLoggingInRef.current) {
      navigate('/home', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const validateForm = (): boolean => {
    const result = loginSchema.safeParse({ email, password })

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
      isLoggingInRef.current = true
      await login(email, password)
      navigate('/welcome')
    } catch {
      isLoggingInRef.current = false
      // Error is handled by AuthContext
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (authError) {
      clearError()
    }
    if (validationErrors.email) {
      setValidationErrors((prev) => ({ ...prev, email: undefined }))
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
  const firstValidationError = validationErrors.email || validationErrors.password

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ maxWidth: '390px', margin: '0 auto' }}>
      {/* Logo Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 bg-[#1E40AF] rounded-3xl flex items-center justify-center mb-6">
          <Heart size={40} className="text-white" fill="white" />
        </div>

        <h1 className="text-2xl font-bold text-[#0B1220] mb-2">
          サイテック フィットネス
        </h1>
        <p className="text-[#334155] font-medium text-base mb-12">
          毎日の運動をサポート
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <Input
            type="email"
            label="メールアドレス"
            placeholder="example@mail.com"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            error={validationErrors.email}
            disabled={isLoading}
            autoComplete="email"
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
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
            >
              {authError}
            </div>
          )}

          {/* Validation error alert */}
          {firstValidationError && !authError && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
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
              className="text-[#1E40AF] hover:underline text-base py-2 px-4 min-h-[44px]"
              disabled={isLoading}
            >
              パスワードをお忘れですか？
            </button>
          </div>
        </form>
      </div>

      {/* Demo hint - for development only */}
      {import.meta.env.DEV && (
        <div className="px-6 pb-8">
          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-sm text-gray-600 text-center">
              <strong>開発用:</strong> test@example.com / password123
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
