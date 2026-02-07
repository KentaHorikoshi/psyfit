import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiClient } from '../lib/api-client'
import type { Exercise, ExerciseRecordWithExercise } from '../lib/api-types'
import { Dumbbell, Edit, History, TrendingUp, Flame, Sun, Moon, CloudSun, Home as HomeIcon, User, ClipboardEdit, CheckCircle2 } from 'lucide-react'

function getGreeting(): { text: string; Icon: typeof Sun } {
  const hour = new Date().getHours()
  if (hour < 12) {
    return { text: 'おはようございます！', Icon: Sun }
  } else if (hour < 18) {
    return { text: 'こんにちは！', Icon: CloudSun }
  } else {
    return { text: 'こんばんは！', Icon: Moon }
  }
}

interface MenuCardProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
}

function MenuCard({ icon, label, onClick }: MenuCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:border-[#1E40AF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2 min-h-[72px]"
      aria-label={label}
    >
      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mr-4 shrink-0">
        {icon}
      </div>
      <span className="text-gray-900 text-lg font-medium">{label}</span>
    </button>
  )
}

export function Home() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading } = useAuth()

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [todayRecords, setTodayRecords] = useState<ExerciseRecordWithExercise[]>([])
  const [exercisesLoading, setExercisesLoading] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  // Fetch today's exercises and records
  useEffect(() => {
    async function fetchTodayData() {
      if (!isAuthenticated) return

      try {
        setExercisesLoading(true)
        const today = new Date().toISOString().split('T')[0]

        const [exercisesRes, recordsRes] = await Promise.all([
          apiClient.getUserExercises(),
          apiClient.getExerciseRecords({ start_date: today, end_date: today }),
        ])

        if (exercisesRes.status === 'success' && exercisesRes.data) {
          setExercises(exercisesRes.data.exercises)
        }
        if (recordsRes.status === 'success' && recordsRes.data) {
          setTodayRecords(recordsRes.data.records)
        }
      } catch {
        // Silently handle errors for exercise list
      } finally {
        setExercisesLoading(false)
      }
    }

    fetchTodayData()
  }, [isAuthenticated])

  const greeting = useMemo(() => getGreeting(), [])
  const GreetingIcon = greeting.Icon

  // Calculate completed exercise IDs from today's records
  const completedExerciseIds = useMemo(() => {
    return new Set(todayRecords.map(record => record.exercise_id))
  }, [todayRecords])

  // Calculate remaining exercises count
  const remainingCount = useMemo(() => {
    return exercises.filter(ex => !completedExerciseIds.has(ex.id)).length
  }, [exercises, completedExerciseIds])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ maxWidth: '390px', margin: '0 auto' }}>
        <div role="status" className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E40AF] mx-auto mb-4" />
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

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ maxWidth: '390px', margin: '0 auto' }}>
      {/* Header with greeting */}
      <header className="px-6 pt-8 pb-6 bg-gradient-to-b from-blue-50 to-white">
        <h1 className="text-2xl text-gray-900 flex items-center gap-2">
          <GreetingIcon size={28} className="text-[#1E40AF]" />
          <span>
            {greeting.text}
            <br />
            {user.name}さん
          </span>
        </h1>
      </header>

      {/* Continue days card */}
      <section className="px-6 -mt-2 mb-6" aria-label="継続状況">
        <div className="bg-gradient-to-br from-[#1E40AF] to-[#1E3A8A] text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 mb-1 text-sm">継続日数</p>
              <div className="flex items-baseline">
                <span className="text-5xl font-bold">{continueDays}</span>
                <span className="text-xl ml-2">日</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Flame size={32} className="text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* Main menu */}
      <main className="px-6 mb-6 flex-1">
        <div className="space-y-3">
          {/* 運動するボタン: 未実施あり→強調色 / 全実施済み→グレー */}
          {!exercisesLoading && exercises.length > 0 && remainingCount === 0 ? (
            <button
              onClick={() => navigate('/exercise-menu')}
              className="w-full flex items-center p-4 bg-gray-100 border border-gray-200 rounded-xl hover:border-gray-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2 min-h-[72px]"
              aria-label="運動する（すべて完了）"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4 shrink-0">
                <CheckCircle2 size={24} className="text-green-600" />
              </div>
              <div>
                <span className="text-gray-500 text-lg font-medium">運動する</span>
                <p className="text-green-600 text-sm font-medium">完了！</p>
              </div>
            </button>
          ) : !exercisesLoading && exercises.length > 0 && remainingCount > 0 ? (
            <button
              onClick={() => navigate('/exercise-menu')}
              className="w-full flex items-center p-4 bg-[#1E40AF] border border-[#1E40AF] rounded-xl hover:bg-[#1E3A8A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2 min-h-[72px]"
              aria-label={`運動する（残り${remainingCount}件）`}
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4 shrink-0">
                <Dumbbell size={24} className="text-white" />
              </div>
              <div>
                <span className="text-white text-lg font-medium">運動する</span>
                <p className="text-blue-200 text-sm font-medium">残り {remainingCount} 件</p>
              </div>
            </button>
          ) : (
            <MenuCard
              icon={<Dumbbell size={24} className="text-[#1E40AF]" />}
              label="運動する"
              onClick={() => navigate('/exercise-menu')}
            />
          )}
          <MenuCard
            icon={<Edit size={24} className="text-[#1E40AF]" />}
            label="記録する"
            onClick={() => navigate('/record')}
          />
          <MenuCard
            icon={<History size={24} className="text-[#1E40AF]" />}
            label="履歴を見る"
            onClick={() => navigate('/history')}
          />
          <MenuCard
            icon={<ClipboardEdit size={24} className="text-[#1E40AF]" />}
            label="体調を入力"
            onClick={() => navigate('/condition-input')}
          />
        </div>

        {/* Secondary link */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/measurements')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] min-h-[52px]"
            aria-label="測定値を見る"
          >
            <div className="flex items-center">
              <TrendingUp size={20} className="text-[#1E40AF] mr-3" />
              <span className="text-gray-600">測定値を見る</span>
            </div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M7.5 15L12.5 10L7.5 5" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </main>

      {/* Footer navigation */}
      <nav aria-label="メインナビゲーション" className="border-t border-gray-200 bg-white px-6 py-2 pb-6">
        <div className="flex justify-around">
          <Link
            to="/home"
            className="flex flex-col items-center py-2 px-4 text-[#1E40AF] min-h-[44px]"
            aria-current="page"
          >
            <HomeIcon size={24} />
            <span className="text-xs mt-1">ホーム</span>
          </Link>
          <Link
            to="/profile"
            className="flex flex-col items-center py-2 px-4 text-gray-500 hover:text-gray-700 min-h-[44px]"
          >
            <User size={24} />
            <span className="text-xs mt-1">マイページ</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}

export default Home
