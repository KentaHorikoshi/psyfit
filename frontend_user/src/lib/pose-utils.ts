import type { NormalizedLandmark } from '@mediapipe/tasks-vision'

// MediaPipe Pose Landmarkerの主要接続（全身骨格）
export const POSE_CONNECTIONS: [number, number][] = [
  // 顔
  [0, 1], [1, 2], [2, 3], [3, 7],
  [0, 4], [4, 5], [5, 6], [6, 8],
  // 肩・腕
  [11, 12],
  [11, 13], [13, 15],
  [12, 14], [14, 16],
  // 胴体
  [11, 23], [12, 24],
  [23, 24],
  // 脚
  [23, 25], [25, 27], [27, 29], [27, 31],
  [24, 26], [26, 28], [28, 30], [28, 32],
]

const SKELETON_COLOR = 'rgba(16, 185, 129, 0.8)'
const KEYPOINT_COLOR = 'rgba(16, 185, 129, 1.0)'
const KEYPOINT_BORDER_COLOR = 'rgba(255, 255, 255, 0.8)'
const MIN_VISIBILITY = 0.5

export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number,
): void {
  ctx.strokeStyle = SKELETON_COLOR
  ctx.lineWidth = 2

  for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
    const start = landmarks[startIdx]
    const end = landmarks[endIdx]

    if (!start || !end) continue
    if ((start.visibility ?? 0) < MIN_VISIBILITY) continue
    if ((end.visibility ?? 0) < MIN_VISIBILITY) continue

    ctx.beginPath()
    ctx.moveTo(start.x * width, start.y * height)
    ctx.lineTo(end.x * width, end.y * height)
    ctx.stroke()
  }
}

export function drawKeypoints(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number,
): void {
  for (const landmark of landmarks) {
    if ((landmark.visibility ?? 0) < MIN_VISIBILITY) continue

    const x = landmark.x * width
    const y = landmark.y * height

    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fillStyle = KEYPOINT_COLOR
    ctx.fill()

    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.strokeStyle = KEYPOINT_BORDER_COLOR
    ctx.lineWidth = 1
    ctx.stroke()
  }
}
