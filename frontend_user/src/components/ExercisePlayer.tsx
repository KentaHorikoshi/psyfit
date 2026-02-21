import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiClient } from '../lib/api-client'
import type { Exercise } from '../lib/api-types'
import { ArrowLeft, Play, Pause, Check, ChevronRight } from 'lucide-react'

export function ExercisePlayer() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  const [currentSet, setCurrentSet] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [todayCount, setTodayCount] = useState(0)
  const [completionError, setCompletionError] = useState<string | null>(null)
  const [videoStreamUrl, setVideoStreamUrl] = useState<string | null>(null)
  const [videoError, setVideoError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate])

  useEffect(() => {
    async function fetchExercise() {
      if (!isAuthenticated || !id) return

      try {
        setIsLoading(true)
        setError(null)
        setNotFound(false)
        const response = await apiClient.getExercise(id)
        if (response.status === 'success' && response.data) {
          setExercise(response.data)
        } else {
          setNotFound(true)
        }
      } catch {
        setError('エラーが発生しました。再度お試しください。')
      } finally {
        setIsLoading(false)
      }
    }

    fetchExercise()
  }, [isAuthenticated, id])

  // Fetch video token after exercise is loaded
  useEffect(() => {
    async function fetchVideoToken() {
      if (!exercise || !isAuthenticated) return

      try {
        setVideoError(null)
        const response = await apiClient.getVideoToken(exercise.id)
        if (response.status === 'success' && response.data) {
          const streamUrl = apiClient.getVideoStreamUrl(exercise.id, response.data.token)
          setVideoStreamUrl(streamUrl)
        }
      } catch {
        setVideoError('動画の読み込みに失敗しました。再度お試しください。')
      }
    }

    fetchVideoToken()
  }, [exercise, isAuthenticated])

  const handlePlayPause = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleNextSet = () => {
    if (exercise && currentSet < exercise.sets) {
      setCurrentSet(prev => prev + 1)
      // Reset video to beginning for next set
      if (videoRef.current) {
        videoRef.current.currentTime = 0
      }
    }
  }

  const handleComplete = async () => {
    if (!exercise || isCompleting) return

    try {
      setIsCompleting(true)
      setCompletionError(null)

      const response = await apiClient.createExerciseRecord({
        exercise_id: exercise.id,
        completed_sets: currentSet,
        completed_reps: exercise.reps,
      })

      const count = (response.data as { today_count?: number })?.today_count
      setTodayCount(count ?? 1)
      setIsCompleted(true)

      // Navigate to celebration after short delay
      setTimeout(() => {
        navigate('/celebration', { state: { exerciseName: exercise.name } })
      }, 1500)
    } catch {
      setCompletionError('記録の保存に失敗しました。再度お試しください。')
    } finally {
      setIsCompleting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ maxWidth: '390px', margin: '0 auto' }}>
        <div role="status" className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E40AF] mx-auto mb-4" />
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

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

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col" style={{ maxWidth: '390px', margin: '0 auto' }}>
        <header className="bg-white border-b border-gray-200 px-4 py-4">
          <button
            onClick={() => navigate('/exercise-menu')}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF]"
            aria-label="戻る"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <div role="alert" className="text-center">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-[#1E40AF] underline hover:no-underline min-h-[44px]"
            >
              再読み込み
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !exercise) {
    return (
      <div className="min-h-screen bg-white flex flex-col" style={{ maxWidth: '390px', margin: '0 auto' }}>
        <header className="bg-white border-b border-gray-200 px-4 py-4">
          <button
            onClick={() => navigate('/exercise-menu')}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF]"
            aria-label="戻る"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">運動が見つかりません</p>
            <button
              onClick={() => navigate('/exercise-menu')}
              className="text-[#1E40AF] underline hover:no-underline min-h-[44px]"
            >
              メニューに戻る
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isLastSet = currentSet >= exercise.sets

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{ maxWidth: '390px', margin: '0 auto' }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/exercise-menu')}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF]"
            aria-label="戻る"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 ml-2 truncate">{exercise.name}</h1>
        </div>
      </header>

      {/* Video section */}
      <div className="relative bg-black aspect-video">
        <video
          ref={videoRef}
          data-testid="exercise-video"
          src={videoStreamUrl ?? undefined}
          poster={exercise.thumbnail_url}
          className="w-full h-full object-contain cursor-pointer"
          aria-label={`${exercise.name}の動画`}
          playsInline
          onClick={handlePlayPause}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Play/Pause overlay button */}
        <button
          onClick={handlePlayPause}
          className={`
            absolute inset-0 flex items-center justify-center
            transition-opacity duration-300
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset
            ${isPlaying
              ? 'opacity-0 pointer-events-none focus-visible:opacity-100 focus-visible:pointer-events-auto'
              : 'opacity-100 bg-black/20 hover:bg-black/30'
            }
          `}
          aria-label={isPlaying ? '一時停止' : '再生'}
        >
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
            {isPlaying ? (
              <Pause size={32} className="text-[#1E40AF]" />
            ) : (
              <Play size={32} className="text-[#1E40AF] ml-1" />
            )}
          </div>
        </button>
      </div>

      {/* Exercise info */}
      <main className="flex-1 bg-white">
        {/* Set counter with live region */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div
            role="status"
            aria-live="polite"
            className="flex items-center justify-center gap-4"
          >
            <span className="text-gray-500">セット</span>
            <span className="text-3xl font-bold text-[#1E40AF]">
              {currentSet} / {exercise.sets}
            </span>
          </div>
          <p className="text-center text-gray-500 mt-1">
            {exercise.reps}回 × {exercise.sets}セット
            {exercise.duration_seconds && ` (${exercise.duration_seconds}秒)`}
          </p>
        </div>

        {/* Description */}
        <div className="px-4 py-4">
          <p className="text-gray-600">{exercise.description}</p>
        </div>

        {/* Video error */}
        {videoError && (
          <div role="alert" className="px-4 py-3 mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-center">{videoError}</p>
          </div>
        )}

        {/* Completion success message */}
        {isCompleted && (
          <div className="px-4 py-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">お疲れ様でした！</p>
            <p className="text-gray-500 mt-2">記録を保存しました</p>
            {exercise && (exercise.daily_frequency ?? 1) > 1 && (
              <p className="text-blue-600 font-medium mt-2">
                本日 {todayCount}/{exercise.daily_frequency}回 完了
              </p>
            )}
          </div>
        )}

        {/* Completion error */}
        {completionError && (
          <div role="alert" className="px-4 py-3 mx-4 mb-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-center">{completionError}</p>
          </div>
        )}
      </main>

      {/* Bottom actions */}
      {!isCompleted && (
        <div className="bg-white border-t border-gray-200 p-4 space-y-3">
          {!isLastSet && (
            <button
              onClick={handleNextSet}
              className="w-full min-h-[52px] px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] flex items-center justify-center gap-2"
              aria-label="次のセットへ進む"
            >
              次のセット
              <ChevronRight size={20} />
            </button>
          )}

          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className={`
              w-full min-h-[52px] px-6 py-3 rounded-xl font-medium transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2
              ${isLastSet
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-[#1E40AF] hover:bg-[#1E3A8A] text-white'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            aria-label={isLastSet ? '運動を完了する' : '完了して記録する'}
          >
            {isCompleting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                保存中...
              </span>
            ) : isLastSet ? (
              <span className="flex items-center justify-center gap-2">
                <Check size={20} />
                運動を完了
              </span>
            ) : (
              '完了'
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default ExercisePlayer
