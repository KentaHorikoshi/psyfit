import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Heart, ArrowLeft, Mail } from 'lucide-react'
import { api } from '../lib/api'

export function ForgotPassword() {
  const navigate = useNavigate()
  const [staffId, setStaffId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [validationError, setValidationError] = useState<string | undefined>()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!staffId.trim()) {
      setValidationError('職員IDを入力してください')
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError(null)
      await api.requestStaffPasswordReset({ staff_id: staffId.trim() })
      setIsSubmitted(true)
    } catch {
      // Backend always returns success for security (no information leakage).
      // If it does fail (network error etc), show a generic message.
      setSubmitError('リクエストの送信に失敗しました。しばらく待ってから再試行してください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStaffIdChange = (value: string) => {
    setStaffId(value)
    if (validationError) {
      setValidationError(undefined)
    }
    if (submitError) {
      setSubmitError(null)
    }
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
              パスワードリセット
            </h1>
            <p className="text-[#64748B] text-sm text-center">
              職員IDを入力してください。登録されたメールアドレスにリセット手順を送信します。
            </p>
          </div>

          {isSubmitted ? (
            /* Success state */
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Mail size={32} className="text-green-600" />
              </div>
              <div>
                <p className="text-base font-medium text-[#0B1220] mb-2">
                  メールを送信しました
                </p>
                <p className="text-sm text-[#64748B]">
                  登録されたメールアドレスにパスワードリセットの手順を送信しました。メールをご確認ください。
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                ログイン画面に戻る
              </Button>
            </div>
          ) : (
            /* Form state */
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                type="text"
                label="職員ID"
                placeholder="例: STF001"
                value={staffId}
                onChange={(e) => handleStaffIdChange(e.target.value)}
                error={validationError}
                disabled={isSubmitting}
                autoComplete="username"
              />

              {submitError && (
                <div
                  role="alert"
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                >
                  {submitError}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
              >
                {isSubmitting ? '送信中...' : 'リセットメールを送信'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-1 text-[#1E40AF] hover:underline text-sm py-2 px-4 min-h-[44px]"
                  disabled={isSubmitting}
                >
                  <ArrowLeft size={16} />
                  ログイン画面に戻る
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
