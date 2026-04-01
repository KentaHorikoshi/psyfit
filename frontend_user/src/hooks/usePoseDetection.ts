import { useState, useEffect, useRef, RefObject } from 'react'
import type { NormalizedLandmark, PoseLandmarker as PoseLandmarkerType } from '@mediapipe/tasks-vision'

export interface UsePoseDetectionOptions {
  enabled: boolean
}

export interface UsePoseDetectionReturn {
  landmarks: NormalizedLandmark[] | null
  error: string | null
  isModelLoading: boolean
}

// モジュールスコープでインスタンスをキャッシュ（一度だけ初期化）
let poseLandmarkerInstance: PoseLandmarkerType | null = null
let initPromise: Promise<PoseLandmarkerType> | null = null

const WASM_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm'
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'

async function getPoseLandmarker(): Promise<PoseLandmarkerType> {
  if (poseLandmarkerInstance) return poseLandmarkerInstance
  if (initPromise) return initPromise

  initPromise = (async () => {
    const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')
    const vision = await FilesetResolver.forVisionTasks(WASM_CDN)
    poseLandmarkerInstance = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
    })
    return poseLandmarkerInstance
  })()

  return initPromise
}

// テスト用にキャッシュをリセットする関数
export function _resetPoseLandmarkerCache(): void {
  poseLandmarkerInstance = null
  initPromise = null
}

export function usePoseDetection(
  videoRef: RefObject<HTMLVideoElement | null>,
  options: UsePoseDetectionOptions,
): UsePoseDetectionReturn {
  const [landmarks, setLandmarks] = useState<NormalizedLandmark[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isModelLoading, setIsModelLoading] = useState(false)
  const rafIdRef = useRef<number | null>(null)

  const { enabled } = options

  useEffect(() => {
    if (!enabled) {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
      setLandmarks(null)
      return
    }

    let cancelled = false
    setIsModelLoading(true)
    setError(null)

    getPoseLandmarker()
      .then(landmarker => {
        if (cancelled) return

        setIsModelLoading(false)

        let lastVideoTime = -1

        const detect = () => {
          if (cancelled) return

          const video = videoRef.current
          if (
            video &&
            video.readyState >= 2 &&
            video.currentTime !== lastVideoTime
          ) {
            lastVideoTime = video.currentTime
            try {
              const result = landmarker.detectForVideo(video, performance.now())
              setLandmarks(result.landmarks[0] ?? null)
            } catch {
              // 検出エラーは無視して継続
            }
          }

          rafIdRef.current = requestAnimationFrame(detect)
        }

        rafIdRef.current = requestAnimationFrame(detect)
      })
      .catch(() => {
        if (!cancelled) {
          setIsModelLoading(false)
          setError('骨格点検出の初期化に失敗しました。再度お試しください。')
        }
      })

    return () => {
      cancelled = true
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }
  }, [enabled, videoRef])

  return { landmarks, error, isModelLoading }
}
