import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useCamera } from '../useCamera'

const mockStop = vi.fn()
const mockTrack = { stop: mockStop }
const mockStream = {
  getTracks: () => [mockTrack],
  getVideoTracks: () => [mockTrack],
}

const mockPlay = vi.fn().mockResolvedValue(undefined)

beforeEach(() => {
  mockStop.mockClear()
  mockPlay.mockClear()

  Object.defineProperty(navigator, 'mediaDevices', {
    value: {
      getUserMedia: vi.fn().mockResolvedValue(mockStream),
    },
    writable: true,
    configurable: true,
  })

  // HTMLVideoElement.srcObject setter mock
  Object.defineProperty(HTMLVideoElement.prototype, 'srcObject', {
    set: vi.fn(),
    get: vi.fn(() => null),
    configurable: true,
  })

  vi.spyOn(HTMLVideoElement.prototype, 'play').mockImplementation(mockPlay)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useCamera', () => {
  it('マウント時に getUserMedia を facingMode: user で呼び出す', async () => {
    renderHook(() => useCamera())

    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        video: { facingMode: 'user' },
        audio: false,
      })
    })
  })

  it('stream取得成功後に isLoading が false になる', async () => {
    const { result } = renderHook(() => useCamera())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('stream取得成功後に stream が設定される', async () => {
    const { result } = renderHook(() => useCamera())

    await waitFor(() => {
      expect(result.current.stream).toBe(mockStream)
    })
  })

  it('stream取得成功後にisLoadingがfalseになり streamが設定される', async () => {
    const { result } = renderHook(() => useCamera())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.stream).toBe(mockStream)
    })
  })

  it('NotAllowedError 時に日本語エラーメッセージが設定される', async () => {
    const permissionError = new Error('Permission denied')
    permissionError.name = 'NotAllowedError'
    vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockRejectedValueOnce(permissionError)

    const { result } = renderHook(() => useCamera())

    await waitFor(() => {
      expect(result.current.error).toContain('カメラの使用が許可されていません')
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('NotFoundError 時に日本語エラーメッセージが設定される', async () => {
    const notFoundError = new Error('No camera found')
    notFoundError.name = 'NotFoundError'
    vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockRejectedValueOnce(notFoundError)

    const { result } = renderHook(() => useCamera())

    await waitFor(() => {
      expect(result.current.error).toContain('カメラが見つかりません')
    })
  })

  it('その他のエラー時にデフォルトエラーメッセージが設定される', async () => {
    vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockRejectedValueOnce(new Error('Unknown'))

    const { result } = renderHook(() => useCamera())

    await waitFor(() => {
      expect(result.current.error).toContain('カメラの起動に失敗しました')
    })
  })

  it('stopCamera() 呼び出しで track.stop() が実行される', async () => {
    const { result } = renderHook(() => useCamera())

    await waitFor(() => {
      expect(result.current.stream).not.toBeNull()
    })

    act(() => {
      result.current.stopCamera()
    })

    expect(mockStop).toHaveBeenCalled()
  })

  it('アンマウント時に track.stop() が自動実行される', async () => {
    const { unmount } = renderHook(() => useCamera())

    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled()
    })

    unmount()

    expect(mockStop).toHaveBeenCalled()
  })

  it('videoRef が返される', async () => {
    const { result } = renderHook(() => useCamera())

    expect(result.current.videoRef).toBeDefined()
    expect(typeof result.current.videoRef).toBe('object')
  })

  it('成功時は error が null', async () => {
    const { result } = renderHook(() => useCamera())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeNull()
  })
})
