import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Trophy, Star, Sparkles } from 'lucide-react'
import { apiClient } from '../lib/api-client'

interface CelebrationState {
  exerciseName?: string
  setsCompleted?: number
  repsCompleted?: number
}

// Confetti piece component
function ConfettiPiece({ delay, color }: { delay: number; color: string }) {
  return (
    <div
      className={`confetti absolute w-3 h-3 ${color} rounded-full animate-confettiFall`}
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${2 + Math.random() * 2}s`,
      }}
    />
  )
}

export function Celebration() {
  const navigate = useNavigate()
  const location = useLocation()
  const hasNavigatedRef = useRef(false)
  const [navigationTarget, setNavigationTarget] = useState<string | null>(null)

  const state = (location.state as CelebrationState) || {}
  const { exerciseName = '運動', setsCompleted = 0, repsCompleted = 0 } = state

  // Determine navigation target: condition input (first exercise + no condition) or home
  useEffect(() => {
    async function determineTarget() {
      try {
        const today = new Date().toISOString().split('T')[0]
        const [recordsRes, conditionsRes] = await Promise.all([
          apiClient.getExerciseRecords({ start_date: today, end_date: today }),
          apiClient.getMyDailyConditions({ start_date: today, end_date: today }),
        ])

        const recordCount = recordsRes.status === 'success' && recordsRes.data
          ? recordsRes.data.records.length
          : 0
        const conditionCount = conditionsRes.status === 'success' && conditionsRes.data
          ? conditionsRes.data.conditions.length
          : 0

        // First exercise of the day AND no condition recorded yet
        if (recordCount <= 1 && conditionCount === 0) {
          setNavigationTarget('/condition-input')
        } else {
          setNavigationTarget('/home')
        }
      } catch {
        // Fallback to home on error
        setNavigationTarget('/home')
      }
    }

    determineTarget()
  }, [])

  // Auto-navigate after 3 seconds once target is determined
  useEffect(() => {
    if (hasNavigatedRef.current || !navigationTarget) return

    const timer = setTimeout(() => {
      if (!hasNavigatedRef.current) {
        hasNavigatedRef.current = true
        navigate(navigationTarget, { replace: true })
      }
    }, 3000)

    return () => {
      clearTimeout(timer)
    }
  }, [navigate, navigationTarget])

  const handleContinue = () => {
    if (hasNavigatedRef.current) return
    hasNavigatedRef.current = true
    navigate(navigationTarget || '/home', { replace: true })
  }

  // Generate confetti pieces
  const confettiColors = [
    'bg-amber-400',
    'bg-amber-500',
    'bg-yellow-400',
    'bg-orange-400',
    'bg-red-400',
    'bg-pink-400',
  ]

  return (
    <main
      className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex flex-col items-center justify-center overflow-hidden relative animate-fadeIn"
      style={{ maxWidth: '390px', margin: '0 auto' }}
    >
      {/* Confetti Animation */}
      {Array.from({ length: 20 }).map((_, i) => (
        <ConfettiPiece
          key={i}
          delay={i * 0.1}
          color={confettiColors[i % confettiColors.length] as string}
        />
      ))}

      {/* Trophy Icon */}
      <div className="mb-6 animate-bounce">
        <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
          <Trophy size={48} className="text-white" />
        </div>
      </div>

      {/* Celebration Message */}
      <div className="text-center px-6 mb-8 animate-slideUp">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Star size={24} className="text-amber-500 fill-amber-500" />
          <h1 className="text-3xl font-bold text-gray-900">
            おめでとうございます！
          </h1>
          <Star size={24} className="text-amber-500 fill-amber-500" />
        </div>
        <p className="text-lg text-gray-700">よく頑張りました！</p>
      </div>

      {/* Exercise Info Card */}
      <div className="bg-white rounded-2xl p-6 mx-6 shadow-lg border-2 border-amber-200 animate-scaleIn">
        <div className="text-center">
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-1">完了した運動</p>
            <h2 className="text-xl font-bold text-gray-900">{exerciseName}</h2>
          </div>

          {(setsCompleted ?? 0) > 0 && (repsCompleted ?? 0) > 0 && (
            <div className="flex items-center justify-center gap-4 text-gray-700">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-amber-600">{setsCompleted}</span>
                <span className="text-sm">セット</span>
              </div>
              <span className="text-gray-300">×</span>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-amber-600">{repsCompleted}</span>
                <span className="text-sm">回</span>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center justify-center gap-2 text-amber-600">
            <Sparkles size={16} />
            <p className="text-sm font-medium">素晴らしい継続力です！</p>
            <Sparkles size={16} />
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        className="mt-12 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-4 rounded-xl font-medium shadow-lg hover:from-amber-600 hover:to-amber-700 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 min-h-[44px]"
        aria-label="続ける"
      >
        続ける
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

        @keyframes confettiFall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
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

        .animate-confettiFall {
          animation: confettiFall linear infinite;
        }
      `}</style>
    </main>
  )
}

export default Celebration
