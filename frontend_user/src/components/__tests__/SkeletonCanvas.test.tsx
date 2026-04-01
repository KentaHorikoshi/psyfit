import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import type { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { SkeletonCanvas } from '../SkeletonCanvas'

const mockClearRect = vi.fn()
const mockBeginPath = vi.fn()
const mockMoveTo = vi.fn()
const mockLineTo = vi.fn()
const mockStroke = vi.fn()
const mockArc = vi.fn()
const mockFill = vi.fn()

const mockCtx = {
  clearRect: mockClearRect,
  beginPath: mockBeginPath,
  moveTo: mockMoveTo,
  lineTo: mockLineTo,
  stroke: mockStroke,
  arc: mockArc,
  fill: mockFill,
  strokeStyle: '',
  fillStyle: '',
  lineWidth: 0,
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    mockCtx as unknown as CanvasRenderingContext2D,
  )
})

const makeLandmarks = (count = 33, visibility = 0.9): NormalizedLandmark[] =>
  Array.from({ length: count }, (_, i) => ({
    x: i * 0.03,
    y: i * 0.03,
    z: 0,
    visibility,
  }))

describe('SkeletonCanvas', () => {
  it('canvas 要素が描画される', () => {
    const { container } = render(
      <SkeletonCanvas landmarks={null} isVisible={false} width={640} height={480} />,
    )
    expect(container.querySelector('canvas')).not.toBeNull()
  })

  it('isVisible: false の時は clearRect のみ呼ばれる', () => {
    render(
      <SkeletonCanvas
        landmarks={makeLandmarks()}
        isVisible={false}
        width={640}
        height={480}
      />,
    )
    expect(mockClearRect).toHaveBeenCalledWith(0, 0, 640, 480)
    expect(mockStroke).not.toHaveBeenCalled()
    expect(mockFill).not.toHaveBeenCalled()
  })

  it('landmarks が null の時は clearRect のみ呼ばれる', () => {
    render(
      <SkeletonCanvas landmarks={null} isVisible={true} width={640} height={480} />,
    )
    expect(mockClearRect).toHaveBeenCalledWith(0, 0, 640, 480)
    expect(mockStroke).not.toHaveBeenCalled()
    expect(mockFill).not.toHaveBeenCalled()
  })

  it('isVisible: true かつ landmarks ありで stroke が呼ばれる', () => {
    render(
      <SkeletonCanvas
        landmarks={makeLandmarks()}
        isVisible={true}
        width={640}
        height={480}
      />,
    )
    expect(mockStroke).toHaveBeenCalled()
  })

  it('isVisible: true かつ landmarks ありで fill が呼ばれる', () => {
    render(
      <SkeletonCanvas
        landmarks={makeLandmarks()}
        isVisible={true}
        width={640}
        height={480}
      />,
    )
    expect(mockFill).toHaveBeenCalled()
  })

  it('canvas の width/height が props に合わせて設定される', () => {
    const { container } = render(
      <SkeletonCanvas landmarks={null} isVisible={false} width={320} height={240} />,
    )
    const canvas = container.querySelector('canvas')!
    expect(canvas.width).toBe(320)
    expect(canvas.height).toBe(240)
  })

  it('pointer-events-none クラスが設定される', () => {
    const { container } = render(
      <SkeletonCanvas landmarks={null} isVisible={false} width={640} height={480} />,
    )
    const canvas = container.querySelector('canvas')!
    expect(canvas.className).toContain('pointer-events-none')
  })

  it('aria-hidden="true" が設定される', () => {
    const { container } = render(
      <SkeletonCanvas landmarks={null} isVisible={false} width={640} height={480} />,
    )
    const canvas = container.querySelector('canvas')!
    expect(canvas.getAttribute('aria-hidden')).toBe('true')
  })
})
