import { useRef, useEffect } from 'react'
import type { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { drawSkeleton, drawKeypoints } from '../lib/pose-utils'

interface SkeletonCanvasProps {
  landmarks: NormalizedLandmark[] | null
  isVisible: boolean
  width: number
  height: number
}

export function SkeletonCanvas({ landmarks, isVisible, width, height }: SkeletonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, width, height)

    if (!isVisible || !landmarks) return

    drawSkeleton(ctx, landmarks, width, height)
    drawKeypoints(ctx, landmarks, width, height)
  }, [landmarks, isVisible, width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    />
  )
}
