import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { drawSkeleton, drawKeypoints, POSE_CONNECTIONS } from '../pose-utils'

const makeMockCtx = () => ({
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  strokeStyle: '',
  fillStyle: '',
  lineWidth: 0,
})

const makeLandmarks = (count: number, visibility = 0.9): NormalizedLandmark[] =>
  Array.from({ length: count }, (_, i) => ({
    x: i * 0.03,
    y: i * 0.03,
    z: 0,
    visibility,
  }))

describe('POSE_CONNECTIONS', () => {
  it('接続定義が存在する', () => {
    expect(POSE_CONNECTIONS.length).toBeGreaterThan(0)
    for (const [a, b] of POSE_CONNECTIONS) {
      expect(typeof a).toBe('number')
      expect(typeof b).toBe('number')
    }
  })
})

describe('drawSkeleton', () => {
  let ctx: ReturnType<typeof makeMockCtx>

  beforeEach(() => {
    ctx = makeMockCtx()
  })

  it('visibility が高いランドマーク間の接続を描画する', () => {
    const landmarks = makeLandmarks(33, 0.9)
    drawSkeleton(ctx as unknown as CanvasRenderingContext2D, landmarks, 640, 480)
    expect(ctx.stroke).toHaveBeenCalled()
    expect(ctx.beginPath).toHaveBeenCalled()
  })

  it('visibility < 0.5 のランドマークはスキップする', () => {
    // 全ランドマークのvisibilityを0にする
    const landmarks = makeLandmarks(33, 0.0)
    drawSkeleton(ctx as unknown as CanvasRenderingContext2D, landmarks, 640, 480)
    expect(ctx.stroke).not.toHaveBeenCalled()
  })

  it('骨格線の色を rgba(16, 185, 129, 0.8) に設定する', () => {
    const landmarks = makeLandmarks(33, 0.9)
    drawSkeleton(ctx as unknown as CanvasRenderingContext2D, landmarks, 640, 480)
    expect(ctx.strokeStyle).toBe('rgba(16, 185, 129, 0.8)')
  })

  it('ランドマークが空の場合はstrokeを呼ばない', () => {
    drawSkeleton(ctx as unknown as CanvasRenderingContext2D, [], 640, 480)
    expect(ctx.stroke).not.toHaveBeenCalled()
  })

  it('座標をwidth/heightで正規化して描画する', () => {
    // 33点分のランドマークを用意し、index0と1の接続(POSE_CONNECTIONS[0]=[0,1])を検証
    const landmarks = makeLandmarks(33, 0.9)
    // landmark[0] = { x: 0, y: 0 }, landmark[1] = { x: 0.03, y: 0.03 }
    drawSkeleton(ctx as unknown as CanvasRenderingContext2D, landmarks, 100, 100)
    expect(ctx.moveTo).toHaveBeenCalledWith(0, 0)
    expect(ctx.lineTo).toHaveBeenCalledWith(3, 3)
  })
})

describe('drawKeypoints', () => {
  let ctx: ReturnType<typeof makeMockCtx>

  beforeEach(() => {
    ctx = makeMockCtx()
  })

  it('visibility が高いランドマークを描画する', () => {
    const landmarks = makeLandmarks(5, 0.9)
    drawKeypoints(ctx as unknown as CanvasRenderingContext2D, landmarks, 640, 480)
    expect(ctx.fill).toHaveBeenCalledTimes(5)
  })

  it('visibility < 0.5 のランドマークはスキップする', () => {
    const landmarks = makeLandmarks(5, 0.0)
    drawKeypoints(ctx as unknown as CanvasRenderingContext2D, landmarks, 640, 480)
    expect(ctx.fill).not.toHaveBeenCalled()
  })

  it('可視ランドマークと不可視ランドマークが混在する場合、可視のみ描画', () => {
    const landmarks: NormalizedLandmark[] = [
      { x: 0.1, y: 0.1, z: 0, visibility: 0.9 },
      { x: 0.2, y: 0.2, z: 0, visibility: 0.1 },
      { x: 0.3, y: 0.3, z: 0, visibility: 0.8 },
    ]
    drawKeypoints(ctx as unknown as CanvasRenderingContext2D, landmarks, 640, 480)
    expect(ctx.fill).toHaveBeenCalledTimes(2)
  })

  it('ランドマークが空の場合はfillを呼ばない', () => {
    drawKeypoints(ctx as unknown as CanvasRenderingContext2D, [], 640, 480)
    expect(ctx.fill).not.toHaveBeenCalled()
  })
})
