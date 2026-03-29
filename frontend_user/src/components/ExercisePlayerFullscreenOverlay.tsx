import { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowLeft, Play, Pause, Check, ChevronRight, Camera, Video } from 'lucide-react'
import { usePoseDetection } from '../hooks/usePoseDetection'
import { SkeletonCanvas } from './SkeletonCanvas'
import { CameraView } from './CameraView'

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
  isLooping: React.MutableRefObject<boolean>
  viewMode: 'video' | 'camera'
  showVideoSkeleton: boolean
  showCameraSkeleton: boolean
  onViewModeToggle: () => void
  onVideoSkeletonToggle: () => void
  onCameraSkeletonToggle: () => void
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
  isLooping,
  viewMode,
  showVideoSkeleton,
  showCameraSkeleton,
  onViewModeToggle,
  onVideoSkeletonToggle,
  onCameraSkeletonToggle,
}: ExercisePlayerFullscreenOverlayProps) {
  // 種目名・再生ボタンのみ auto-hide
  const [showTopControls, setShowTopControls] = useState(true)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // videoモード用骨格点検出
  const { landmarks: videoLandmarks } = usePoseDetection(videoRef, {
    enabled: showVideoSkeleton && viewMode === 'video',
  })

  // video要素のサイズ（SkeletonCanvas用）
  const videoWidth = videoRef.current?.videoWidth ?? window.innerWidth
  const videoHeight = videoRef.current?.videoHeight ?? window.innerHeight

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

  const currentSkeletonVisible = viewMode === 'video' ? showVideoSkeleton : showCameraSkeleton
  const handleSkeletonToggle = viewMode === 'video' ? onVideoSkeletonToggle : onCameraSkeletonToggle

  return (
    <div
      className="fixed inset-0 z-50 bg-black"
      style={{ height: '100dvh' }}
      data-testid="fullscreen-overlay"
    >
      {/* Video（cameraモード時も非表示にしない: DOMに残してvideoRefを維持） */}
      <video
        ref={videoRef}
        data-testid="fullscreen-video"
        src={videoStreamUrl ?? undefined}
        poster={thumbnailUrl}
        preload="metadata"
        className={`absolute inset-0 w-full h-full object-contain ${viewMode === 'camera' ? 'hidden' : ''}`}
        aria-label={`${exerciseName}の動画`}
        playsInline
        onClick={handleScreenTap}
        onPlay={() => {
          if (isLooping.current) {
            isLooping.current = false
          } else {
            resetHideTimer()
          }
        }}
        onEnded={() => onVideoEnded()}
        onTimeUpdate={onTimeUpdate}
      />

      {/* 骨格点Canvas（videoモード時） */}
      {viewMode === 'video' && (
        <SkeletonCanvas
          landmarks={videoLandmarks}
          isVisible={showVideoSkeleton}
          width={videoWidth}
          height={videoHeight}
        />
      )}

      {/* カメラビュー（cameraモード時） */}
      {viewMode === 'camera' && (
        <CameraView
          showSkeleton={showCameraSkeleton}
          onSkeletonToggle={onCameraSkeletonToggle}
        />
      )}

      {/* Tap area */}
      <button
        className="absolute inset-0 w-full h-full z-[5] bg-transparent cursor-pointer"
        onClick={handleScreenTap}
        aria-label={showTopControls ? 'コントロールを非表示' : 'コントロールを表示'}
        tabIndex={-1}
      />

      {/* Top bar — 種目名・戻るボタン・カメラ/骨格点ボタン (auto-hide) */}
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

        {/* 骨格点トグルボタン */}
        <button
          onClick={(e) => { e.stopPropagation(); handleSkeletonToggle() }}
          aria-label={currentSkeletonVisible ? '骨格点を非表示' : '骨格点を表示'}
          className={`w-11 h-11 flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
            currentSkeletonVisible ? 'bg-green-500/40' : 'hover:bg-white/20'
          }`}
          data-testid="skeleton-toggle-button"
        >
          {/* 人体シルエットアイコン（インライン SVG） */}
          <svg
            viewBox="0 0 24 24"
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <circle cx="12" cy="4" r="2" />
            <line x1="12" y1="6" x2="12" y2="14" />
            <line x1="8" y1="9" x2="16" y2="9" />
            <line x1="12" y1="14" x2="8" y2="20" />
            <line x1="12" y1="14" x2="16" y2="20" />
          </svg>
        </button>

        {/* カメラ/動画切り替えボタン */}
        <button
          onClick={(e) => { e.stopPropagation(); onViewModeToggle() }}
          aria-label={viewMode === 'video' ? 'カメラを起動' : '動画に戻る'}
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          data-testid="view-mode-toggle-button"
        >
          {viewMode === 'video' ? (
            <Camera size={22} className="text-white" />
          ) : (
            <Video size={22} className="text-white" />
          )}
        </button>
      </div>

      {/* Center play/pause button（videoモードのみ表示、auto-hide） */}
      {viewMode === 'video' && (
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
      )}

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
