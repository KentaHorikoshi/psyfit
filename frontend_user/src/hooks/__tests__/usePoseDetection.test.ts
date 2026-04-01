import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// @mediapipe/tasks-vision をモック
const mockDetectForVideo = vi.fn().mockReturnValue({
  landmarks: [[
    { x: 0.5, y: 0.5, z: 0, visibility: 0.9 },
  ]],
})

const mockPoseLandmarker = {
  detectForVideo: mockDetectForVideo,
}

vi.mock('@mediapipe/tasks-vision', () => ({
  PoseLandmarker: {
    createFromOptions: vi.fn().mockResolvedValue(mockPoseLandmarker),
  },
  FilesetResolver: {
    forVisionTasks: vi.fn().mockResolvedValue({}),
  },
}))

// モック後にimport
import { usePoseDetection, _resetPoseLandmarkerCache } from '../usePoseDetection'

// requestAnimationFrame のモック
let rafCallback: FrameRequestCallback | null = null
const mockRaf = vi.fn((cb: FrameRequestCallback) => {
  rafCallback = cb
  return 1
})
const mockCancelRaf = vi.fn()

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', mockRaf)
  vi.stubGlobal('cancelAnimationFrame', mockCancelRaf)
  vi.stubGlobal('performance', { now: () => 1000 })
  rafCallback = null
  mockRaf.mockClear()
  mockCancelRaf.mockClear()
  mockDetectForVideo.mockClear()
  _resetPoseLandmarkerCache()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const makeVideoRef = (overrides: Partial<HTMLVideoElement> = {}) => ({
  current: {
    readyState: 4,
    currentTime: 1.0,
    ...overrides,
  } as HTMLVideoElement,
})

describe('usePoseDetection', () => {
  it('enabled: false の時は getPoseLandmarker を呼ばない', async () => {
    const { PoseLandmarker } = await import('@mediapipe/tasks-vision')
    const videoRef = makeVideoRef()
    renderHook(() => usePoseDetection(videoRef, { enabled: false }))

    await new Promise(r => setTimeout(r, 50))
    expect(PoseLandmarker.createFromOptions).not.toHaveBeenCalled()
  })

  it('enabled: false の時は landmarks が null のまま', () => {
    const videoRef = makeVideoRef()
    const { result } = renderHook(() => usePoseDetection(videoRef, { enabled: false }))
    expect(result.current.landmarks).toBeNull()
  })

  it('enabled: true になると PoseLandmarker.createFromOptions が呼ばれる', async () => {
    const { PoseLandmarker } = await import('@mediapipe/tasks-vision')
    const videoRef = makeVideoRef()
    renderHook(() => usePoseDetection(videoRef, { enabled: true }))

    await waitFor(() => {
      expect(PoseLandmarker.createFromOptions).toHaveBeenCalled()
    })
  })

  it('初期化成功後に isModelLoading が false になる', async () => {
    const videoRef = makeVideoRef()
    const { result } = renderHook(() => usePoseDetection(videoRef, { enabled: true }))

    await waitFor(() => {
      expect(result.current.isModelLoading).toBe(false)
    })
  })

  it('初期化後に requestAnimationFrame が呼ばれる', async () => {
    const videoRef = makeVideoRef()
    renderHook(() => usePoseDetection(videoRef, { enabled: true }))

    await waitFor(() => {
      expect(mockRaf).toHaveBeenCalled()
    })
  })

  it('rAFコールバックが実行されると detectForVideo が呼ばれる', async () => {
    const videoRef = makeVideoRef()
    renderHook(() => usePoseDetection(videoRef, { enabled: true }))

    await waitFor(() => {
      expect(rafCallback).not.toBeNull()
    })

    act(() => {
      if (rafCallback) rafCallback(performance.now())
    })

    expect(mockDetectForVideo).toHaveBeenCalled()
  })

  it('初期化失敗時に error が設定される', async () => {
    const { PoseLandmarker } = await import('@mediapipe/tasks-vision')
    vi.mocked(PoseLandmarker.createFromOptions).mockRejectedValueOnce(new Error('Init failed'))

    const videoRef = makeVideoRef()
    const { result } = renderHook(() => usePoseDetection(videoRef, { enabled: true }))

    await waitFor(() => {
      expect(result.current.error).toContain('骨格点検出の初期化に失敗しました')
    })
  })

  it('アンマウント時に cancelAnimationFrame が呼ばれる', async () => {
    const videoRef = makeVideoRef()
    const { unmount } = renderHook(() => usePoseDetection(videoRef, { enabled: true }))

    await waitFor(() => {
      expect(mockRaf).toHaveBeenCalled()
    })

    unmount()
    expect(mockCancelRaf).toHaveBeenCalled()
  })

  it('enabled が true→false になると cancelAnimationFrame が呼ばれる', async () => {
    const videoRef = makeVideoRef()
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => usePoseDetection(videoRef, { enabled }),
      { initialProps: { enabled: true } },
    )

    await waitFor(() => {
      expect(mockRaf).toHaveBeenCalled()
    })

    rerender({ enabled: false })
    expect(mockCancelRaf).toHaveBeenCalled()
  })

  it('video.readyState < 2 の時は detectForVideo を呼ばない', async () => {
    const videoRef = makeVideoRef({ readyState: 1 })
    renderHook(() => usePoseDetection(videoRef, { enabled: true }))

    await waitFor(() => {
      expect(rafCallback).not.toBeNull()
    })

    act(() => {
      if (rafCallback) rafCallback(performance.now())
    })

    expect(mockDetectForVideo).not.toHaveBeenCalled()
  })
})
