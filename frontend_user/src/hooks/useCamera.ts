import { useState, useRef, useEffect, useCallback, RefObject } from 'react'

export interface UseCameraReturn {
  stream: MediaStream | null
  videoRef: RefObject<HTMLVideoElement | null>
  error: string | null
  isLoading: boolean
  stopCamera: () => void
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return 'カメラの使用が許可されていません。ブラウザのアドレスバー近くの「許可」をタップしてください。'
    }
    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      return 'カメラが見つかりません。カメラが接続されているか確認してください。'
    }
  }
  return 'カメラの起動に失敗しました。再度お試しください。'
}

export function useCamera(): UseCameraReturn {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setStream(null)
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const startCamera = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        })

        if (cancelled) {
          mediaStream.getTracks().forEach(track => track.stop())
          return
        }

        streamRef.current = mediaStream
        setStream(mediaStream)

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          await videoRef.current.play()
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    startCamera()

    return () => {
      cancelled = true
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }, [])

  return { stream, videoRef, error, isLoading, stopCamera }
}
