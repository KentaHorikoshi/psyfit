import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Flame, Sparkles } from 'lucide-react'

function getMotivationalMessage(continueDays: number): string {
  if (continueDays === 0) {
    return '今日から始めましょう！'
  } else if (continueDays < 7) {
    return 'その調子！'
  } else if (continueDays < 30) {
    return '素晴らしい！'
  } else if (continueDays < 100) {
    return '継続は力なり！'
  } else {
    return '驚異的な継続力です！'
  }
}

export function Welcome() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading } = useAuth()
  const hasNavigatedRef = useRef(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  // Auto-navigate after 3 seconds
  useEffect(() => {
    if (!user || hasNavigatedRef.current) return

    const timer = setTimeout(() => {
      if (!hasNavigatedRef.current) {
        hasNavigatedRef.current = true
        navigate('/home', { replace: true })
      }
    }, 3000)

    return () => {
      clearTimeout(timer)
    }
  }, [user, navigate])

  const handleSkip = () => {
    if (hasNavigatedRef.current) return
    hasNavigatedRef.current = true
    navigate('/home', { replace: true })
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ maxWidth: '390px', margin: '0 auto' }}>
        <div role="status" className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981] mx-auto mb-4" />
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null
  }

  const continueDays = user.continue_days
  const motivationalMessage = getMotivationalMessage(continueDays)

  return (
    <main
      className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex flex-col items-center justify-center animate-fadeIn"
      style={{ maxWidth: '390px', margin: '0 auto' }}
    >
      {/* Welcome Message */}
      <div className="text-center px-6 mb-8 animate-slideUp">
        <h1 className="text-2xl text-gray-900 mb-2">
          おかえりなさい
          <br />
          {user.name}さん
        </h1>
        <div className="flex items-center justify-center gap-2 text-green-600 mt-4">
          <Sparkles size={20} />
          <p className="text-lg">{motivationalMessage}</p>
          <Sparkles size={20} />
        </div>
      </div>

      {/* Continue Days Display */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-8 mx-6 shadow-lg animate-scaleIn">
        <div className="text-center">
          <p className="text-green-100 mb-2 text-base">継続日数</p>
          <div className="flex items-baseline justify-center">
            <span className="text-7xl font-bold">{continueDays}</span>
            <span className="text-3xl ml-3">日</span>
          </div>
          <div className="mt-4 w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
            <Flame size={32} className="text-white" />
          </div>
        </div>
      </div>

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="mt-12 text-gray-500 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 rounded px-4 py-2 min-h-[44px]"
        aria-label="タップしてスキップ"
      >
        タップしてスキップ
      </button>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.6s ease-out 0.2s both;
        }

        .animate-scaleIn {
          animation: scaleIn 0.6s ease-out 0.4s both;
        }
      `}</style>
    </main>
  )
}

export default Welcome
