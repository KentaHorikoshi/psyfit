import { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowLeft, Play, Pause, Check, ChevronRight } from 'lucide-react'

interface ExercisePlayerFullscreenOverlayProps {
  exerciseName: string
  videoRef: React.RefObject<HTMLVideoElement>
  videoStreamUrl: string | null
  thumbnailUrl?: string
  currentSet: number
  totalSets: number
  isLastSet: boolean
  loopCount: number
  totalReps: number
  isPlaying: boolean
  isCompleting: boolean
  onPlayPause: () => void
  onNextSet: () => void
  onComplete: () => void
  onClose: () => void
  onVideoEnded: () => void
  onTimeUpdate: () => void
}

const AUTO_HIDE_DELAY = 3000

export function ExercisePlayerFullscreenOverlay({
  exerciseName,
  videoRef,
  videoStreamUrl,
  thumbnailUrl,
  currentSet,
  totalSets,
  isLastSet,
  loopCount,
  totalReps,
  isPlaying,
  isCompleting,
  onPlayPause,
  onNextSet,
  onComplete,
  onClose,
  onVideoEnded,
  onTimeUpdate,
}: ExercisePlayerFullscreenOverlayProps) {
  // 種目名・再生ボタンのみ auto-hide
  const [showTopControls, setShowTopControls] = useState(true)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetHideTimer = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    setShowTopControls(true)
    if (isPlaying) {
      hideTimerRef.current = setTimeout(() => setShowTopControls(false), AUTO_HIDE_DELAY)
    }
  }, [isPlaying])

  useEffect(() => {
    if (!isPlaying) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      setShowTopControls(true)
    } else {
      resetHideTimer()
    }
  }, [isPlaying, resetHideTimer])

  useEffect(() => {
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current) }
  }, [])

  const handleScreenTap = () => {
    if (isPlaying) {
      resetHideTimer()
    } else {
      onPlayPause()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black"
      style={{ height: '100dvh' }}
      data-testid="fullscreen-overlay"
    >
      {/* Video */}
      <video
        ref={videoRef}
        data-testid="fullscreen-video"
        src={videoStreamUrl ?? undefined}
        poster={thumbnailUrl}
        preload="metadata"
        className="absolute inset-0 w-full h-full object-contain"
        aria-label={`${exerciseName}の動画`}
        playsInline
        onClick={handleScreenTap}
        onPlay={() => resetHideTimer()}
        onEnded={() => onVideoEnded()}
        onTimeUpdate={onTimeUpdate}
      />

      {/* Tap area */}
      <button
        className="absolute inset-0 w-full h-full z-[5] bg-transparent cursor-pointer"
        onClick={handleScreenTap}
        aria-label={showTopControls ? 'コントロールを非表示' : 'コントロールを表示'}
        tabIndex={-1}
      />

      {/* Top bar — 種目名・戻るボタン (auto-hide) */}
      <div
        className={`
          absolute top-0 inset-x-0 z-10 px-4 py-3
          bg-gradient-to-b from-black/60 to-transparent
          flex items-center gap-3
          transition-opacity duration-300
          ${showTopControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      >
        <button
          onClick={onClose}
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="フルスクリーンを終了"
        >
          <ArrowLeft size={24} className="text-white" />
        </button>
        <h2 className="text-white text-lg font-bold truncate flex-1">
          {exerciseName}
        </h2>
      </div>

      {/* Center play/pause button (auto-hide) */}
      <div
        className={`
          absolute inset-0 z-[6] flex items-center justify-center
          transition-opacity duration-300 pointer-events-none
          ${showTopControls ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPlayPause()
            resetHideTimer()
          }}
          className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label={isPlaying ? '一時停止' : '再生'}
        >
          {isPlaying ? (
            <Pause size={32} className="text-[#1E40AF]" />
          ) : (
            <Play size={32} className="text-[#1E40AF] ml-1" />
          )}
        </button>
      </div>

      {/* Bottom bar — セット数・回数・ボタン (常時表示) */}
      <div className="absolute bottom-0 inset-x-0 z-10 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-black/70 to-transparent">
        {/* カウンター */}
        <div className="flex items-center gap-4 mb-3">
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-2"
          >
            <span className="text-white/80 text-base">セット</span>
            <span className="text-2xl font-bold text-white">
              {currentSet} / {totalSets}
            </span>
          </div>
          <div
            role="status"
            aria-live="polite"
            aria-label={`実施回数 ${loopCount}回`}
            className="flex items-center gap-1"
          >
            <span className="text-white/80 text-sm">回数</span>
            <span className="text-2xl font-bold text-[#10B981]">{loopCount}</span>
            <span className="text-white/60 text-sm">/ {totalReps}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          {!isLastSet && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onNextSet()
              }}
              className="flex-1 min-h-[48px] px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white flex items-center justify-center gap-2"
              aria-label="次のセットへ進む"
            >
              次のセット
              <ChevronRight size={20} />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation()
              onComplete()
            }}
            disabled={isCompleting}
            className={`
              flex-1 min-h-[48px] px-4 py-3 rounded-xl font-medium transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
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
      </div>
    </div>
  )
}
