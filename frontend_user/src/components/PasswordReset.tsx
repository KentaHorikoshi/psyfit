import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Eye, EyeOff, Heart, Mail, CheckCircle } from 'lucide-react'
import { z } from 'zod'

// Validation schemas
const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('メールアドレスの形式が正しくありません'),
})

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

type EmailFormData = z.infer<typeof emailSchema>
type PasswordFormData = z.infer<typeof passwordSchema>
type EmailValidationErrors = Partial<Record<keyof EmailFormData, string>>
type PasswordValidationErrors = Partial<Record<keyof PasswordFormData, string>>

export function PasswordReset() {
  const { token } = useParams<{ token?: string }>()

  // Determine which screen to show based on token presence
  const isSetPasswordScreen = Boolean(token)

  // Email form state
  const [email, setEmail] = useState('')
  const [emailValidationErrors, setEmailValidationErrors] = useState<EmailValidationErrors>({})
  const [emailSent, setEmailSent] = useState(false)

  // Password form state
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
  const [passwordValidationErrors, setPasswordValidationErrors] = useState<PasswordValidationErrors>({})
  const [passwordChanged, setPasswordChanged] = useState(false)

  // Common state
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  // Email form handlers
  const validateEmail = (): boolean => {
    const result = emailSchema.safeParse({ email })

    if (!result.success) {
      const errors: EmailValidationErrors = {}
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof EmailFormData
        if (!errors[field]) {
          errors[field] = err.message
        }
      })
      setEmailValidationErrors(errors)
      return false
    }

    setEmailValidationErrors({})
    return true
  }

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setApiError(null)

    if (!validateEmail()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/v1/auth/password_reset_request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setEmailSent(true)
      } else {
        setApiError(data.message || 'エラーが発生しました')
      }
    } catch {
      setApiError('ネットワークエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (apiError) {
      setApiError(null)
    }
    if (emailValidationErrors.email) {
      setEmailValidationErrors((prev) => ({ ...prev, email: undefined }))
    }
  }

  // Password form handlers
  const validatePassword = (): boolean => {
    const result = passwordSchema.safeParse({ password, passwordConfirmation })

    if (!result.success) {
      const errors: PasswordValidationErrors = {}
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof PasswordFormData
        if (!errors[field]) {
          errors[field] = err.message
        }
      })
      setPasswordValidationErrors(errors)
      return false
    }

    setPasswordValidationErrors({})
    return true
  }

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setApiError(null)

    if (!validatePassword()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/v1/auth/password_reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          new_password: password,
          new_password_confirmation: passwordConfirmation,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setPasswordChanged(true)
      } else {
        setApiError(data.message || 'エラーが発生しました')
      }
    } catch {
      setApiError('ネットワークエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (apiError) {
      setApiError(null)
    }
    if (passwordValidationErrors.password) {
      setPasswordValidationErrors((prev) => ({ ...prev, password: undefined }))
    }
  }

  const handlePasswordConfirmationChange = (value: string) => {
    setPasswordConfirmation(value)
    if (apiError) {
      setApiError(null)
    }
    if (passwordValidationErrors.passwordConfirmation) {
      setPasswordValidationErrors((prev) => ({ ...prev, passwordConfirmation: undefined }))
    }
  }

  // Get first validation error for alert display
  const firstEmailError = emailValidationErrors.email
  const firstPasswordError = passwordValidationErrors.password || passwordValidationErrors.passwordConfirmation

  // Render email sent success screen
  if (emailSent) {
    return (
      <div className="min-h-screen bg-white flex flex-col" style={{ maxWidth: '390px', margin: '0 auto' }}>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Mail size={32} className="text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-[#0B1220] mb-4">
            メールを送信しました
          </h1>

          <p className="text-[#334155] text-center mb-8">
            {email} にパスワードリセット用のリンクを送信しました。メールに記載されたリンクからパスワードを再設定してください。
          </p>

          <Link
            to="/login"
            className="text-[#1E40AF] hover:underline text-base py-2 px-4 min-h-[44px] flex items-center"
          >
            ログイン画面に戻る
          </Link>
        </div>
      </div>
    )
  }

  // Render password changed success screen
  if (passwordChanged) {
    return (
      <div className="min-h-screen bg-white flex flex-col" style={{ maxWidth: '390px', margin: '0 auto' }}>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={32} className="text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-[#0B1220] mb-4">
            パスワードを変更しました
          </h1>

          <p className="text-[#334155] text-center mb-8">
            新しいパスワードでログインしてください。
          </p>

          <Link
            to="/login"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#1E40AF] text-white font-medium rounded-xl min-h-[44px] hover:bg-[#1E3A8A] transition-colors"
          >
            ログイン画面へ
          </Link>
        </div>
      </div>
    )
  }

  // Render set password screen (with token)
  if (isSetPasswordScreen) {
    return (
      <div className="min-h-screen bg-white flex flex-col" style={{ maxWidth: '390px', margin: '0 auto' }}>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 bg-[#1E40AF] rounded-3xl flex items-center justify-center mb-6">
            <Heart size={40} className="text-white" fill="white" />
          </div>

          <h1 className="text-2xl font-bold text-[#0B1220] mb-2">
            新しいパスワードを設定
          </h1>
          <p className="text-[#334155] text-base mb-8 text-center">
            8文字以上のパスワードを設定してください
          </p>

          <form onSubmit={handlePasswordSubmit} className="w-full max-w-sm space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                label="新しいパスワード"
                placeholder="パスワードを入力"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                error={passwordValidationErrors.password}
                disabled={isLoading}
                autoComplete="new-password"
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

            <div className="relative">
              <Input
                type={showPasswordConfirmation ? 'text' : 'password'}
                label="パスワード（確認）"
                placeholder="パスワードを再入力"
                value={passwordConfirmation}
                onChange={(e) => handlePasswordConfirmationChange(e.target.value)}
                error={passwordValidationErrors.passwordConfirmation}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                className="absolute right-3 top-[38px] p-2 text-gray-500 hover:text-gray-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={showPasswordConfirmation ? 'パスワードを非表示' : 'パスワードを表示'}
                disabled={isLoading}
              >
                {showPasswordConfirmation ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* API error */}
            {apiError && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
              >
                {apiError}
              </div>
            )}

            {/* Validation error alert */}
            {firstPasswordError && !apiError && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
              >
                {firstPasswordError}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full min-h-[44px]"
              isLoading={isLoading}
            >
              {isLoading ? '設定中...' : 'パスワードを設定'}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  // Render email input screen (default)
  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ maxWidth: '390px', margin: '0 auto' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 bg-[#1E40AF] rounded-3xl flex items-center justify-center mb-6">
          <Heart size={40} className="text-white" fill="white" />
        </div>

        <h1 className="text-2xl font-bold text-[#0B1220] mb-2">
          パスワードリセット
        </h1>
        <p className="text-[#334155] text-base mb-8 text-center">
          登録されているメールアドレスを入力してください
        </p>

        <form onSubmit={handleEmailSubmit} className="w-full max-w-sm space-y-4">
          <Input
            type="email"
            label="メールアドレス"
            placeholder="example@mail.com"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            error={emailValidationErrors.email}
            disabled={isLoading}
            autoComplete="email"
          />

          {/* API error */}
          {apiError && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
            >
              {apiError}
            </div>
          )}

          {/* Validation error alert */}
          {firstEmailError && !apiError && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
            >
              {firstEmailError}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full min-h-[44px]"
            isLoading={isLoading}
          >
            {isLoading ? '送信中...' : 'リセットリンクを送信'}
          </Button>

          <div className="text-center">
            <Link
              to="/login"
              className="text-[#1E40AF] hover:underline text-base py-2 px-4 min-h-[44px] inline-flex items-center"
            >
              ログイン画面に戻る
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PasswordReset
