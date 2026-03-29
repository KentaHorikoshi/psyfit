import React, { useRef } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { useCamera } from '../hooks/useCamera'
import { usePoseDetection } from '../hooks/usePoseDetection'
import { SkeletonCanvas } from './SkeletonCanvas'

interface CameraViewProps {
  showSkeleton: boolean
  onSkeletonToggle: () => void
}

export function CameraView({ showSkeleton, onSkeletonToggle }: CameraViewProps) {
  const { videoRef, error, isLoading } = useCamera()
  const { landmarks, isModelLoading } = usePoseDetection(videoRef, { enabled: showSkeleton })
  const containerRef = useRef<HTMLDivElement>(null)

  // コンテナサイズを動的に取得（骨格点Canvasのサイズ合わせ用）
  const containerWidth = containerRef.current?.clientWidth ?? window.innerWidth
  const containerHeight = containerRef.current?.clientHeight ?? window.innerHeight


  return (
    <div
      ref={containerRef}
      className="absolute inset-0 bg-black overflow-hidden"
      data-testid="camera-view"
    >
      {/* カメラ映像 */}
      <video
        ref={videoRef as React.RefObject<HTMLVideoElement>}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
        aria-label="カメラ映像"
        data-testid="camera-video"
      />

      {/* 骨格点Canvas（ミラー表示に合わせてscaleX(-1)） */}
      {showSkeleton && (
        <div
          className="absolute inset-0"
          style={{ transform: 'scaleX(-1)' }}
          aria-hidden="true"
        >
          <SkeletonCanvas
            landmarks={landmarks}
            isVisible={showSkeleton}
            width={containerWidth}
            height={containerHeight}
          />
        </div>
      )}

      {/* ローディング表示 */}
      {isLoading && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/60"
          data-testid="camera-loading"
        >
          <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
          <p className="text-white text-base">カメラを起動中...</p>
        </div>
      )}

      {/* モデルロード表示 */}
      {!isLoading && showSkeleton && isModelLoading && (
        <div
          className="absolute bottom-20 left-0 right-0 flex items-center justify-center"
          data-testid="model-loading"
        >
          <div className="flex items-center gap-2 bg-black/60 rounded-lg px-4 py-2">
            <Loader2 className="w-4 h-4 text-white animate-spin" />
            <p className="text-white text-sm">骨格点モデルを読み込み中...</p>
          </div>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 px-6"
          data-testid="camera-error"
        >
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-white text-base text-center leading-relaxed">{error}</p>
        </div>
      )}

      {/* 骨格点未検出時の案内 */}
      {!isLoading && showSkeleton && !isModelLoading && landmarks === null && !error && (
        <div
          className="absolute bottom-20 left-0 right-0 flex items-center justify-center"
          data-testid="skeleton-not-detected"
        >
          <div className="flex items-center gap-2 bg-black/60 rounded-lg px-4 py-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <p className="text-white text-sm">全身が画面に映るよう調整してください</p>
          </div>
        </div>
      )}

      {/* 骨格点トグルボタン */}
      <button
        onClick={(e) => { e.stopPropagation(); onSkeletonToggle() }}
        aria-label={showSkeleton ? '骨格点を非表示' : '骨格点を表示'}
        className={`absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full transition-colors ${
          showSkeleton ? 'bg-green-500/60' : 'bg-black/40 hover:bg-black/60'
        }`}
        data-testid="skeleton-toggle-button"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          {/* 人体シルエットアイコン */}
          <circle cx="12" cy="4" r="2" />
          <line x1="12" y1="6" x2="12" y2="14" />
          <line x1="8" y1="9" x2="16" y2="9" />
          <line x1="12" y1="14" x2="8" y2="20" />
          <line x1="12" y1="14" x2="16" y2="20" />
        </svg>
      </button>
    </div>
  )
}
