import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CameraView } from '../CameraView'

// useCamera モック（vi.mock のファクトリ内でトップレベル変数を参照しない）
vi.mock('../../hooks/useCamera', () => ({
  useCamera: vi.fn(),
}))

// usePoseDetection モック
vi.mock('../../hooks/usePoseDetection', () => ({
  usePoseDetection: vi.fn(),
}))

// SkeletonCanvas モック（canvas描画を省略）
vi.mock('../SkeletonCanvas', () => ({
  SkeletonCanvas: vi.fn(() => <canvas data-testid="skeleton-canvas" />),
}))

import { useCamera } from '../../hooks/useCamera'
import { usePoseDetection } from '../../hooks/usePoseDetection'

const mockStopCamera = vi.fn()
const mockVideoRef = { current: null }

beforeEach(() => {
  vi.mocked(useCamera).mockReturnValue({
    stream: null,
    videoRef: mockVideoRef,
    error: null,
    isLoading: true,
    stopCamera: mockStopCamera,
  })
  vi.mocked(usePoseDetection).mockReturnValue({
    landmarks: null,
    error: null,
    isModelLoading: false,
  })
  mockStopCamera.mockClear()
})

describe('CameraView', () => {
  it('カメラ起動中はローディング表示が出る', () => {
    render(<CameraView showSkeleton={false} onSkeletonToggle={vi.fn()} />)
    expect(screen.getByTestId('camera-loading')).toBeInTheDocument()
    expect(screen.getByText('カメラを起動中...')).toBeInTheDocument()
  })

  it('カメラ取得成功後（isLoading: false）はローディング表示が消える', () => {
    vi.mocked(useCamera).mockReturnValue({
      stream: {} as MediaStream,
      videoRef: mockVideoRef,
      error: null,
      isLoading: false,
      stopCamera: mockStopCamera,
    })
    render(<CameraView showSkeleton={false} onSkeletonToggle={vi.fn()} />)
    expect(screen.queryByTestId('camera-loading')).toBeNull()
  })

  it('video 要素が存在する', () => {
    render(<CameraView showSkeleton={false} onSkeletonToggle={vi.fn()} />)
    expect(screen.getByTestId('camera-video')).toBeInTheDocument()
  })

  it('ミラー表示の CSS が video に適用される', () => {
    render(<CameraView showSkeleton={false} onSkeletonToggle={vi.fn()} />)
    const video = screen.getByTestId('camera-video')
    expect(video).toHaveStyle({ transform: 'scaleX(-1)' })
  })

  it('カメラエラー時にエラーメッセージが表示される', () => {
    vi.mocked(useCamera).mockReturnValue({
      stream: null,
      videoRef: mockVideoRef,
      error: 'カメラの使用が許可されていません。ブラウザのアドレスバー近くの「許可」をタップしてください。',
      isLoading: false,
      stopCamera: mockStopCamera,
    })
    render(<CameraView showSkeleton={false} onSkeletonToggle={vi.fn()} />)
    expect(screen.getByTestId('camera-error')).toBeInTheDocument()
    expect(screen.getByText(/カメラの使用が許可されていません/)).toBeInTheDocument()
  })

  it('showSkeleton: true の時に SkeletonCanvas が表示される', () => {
    vi.mocked(useCamera).mockReturnValue({
      stream: {} as MediaStream,
      videoRef: mockVideoRef,
      error: null,
      isLoading: false,
      stopCamera: mockStopCamera,
    })
    render(<CameraView showSkeleton={true} onSkeletonToggle={vi.fn()} />)
    expect(screen.getByTestId('skeleton-canvas')).toBeInTheDocument()
  })

  it('showSkeleton: false の時に SkeletonCanvas が表示されない', () => {
    vi.mocked(useCamera).mockReturnValue({
      stream: {} as MediaStream,
      videoRef: mockVideoRef,
      error: null,
      isLoading: false,
      stopCamera: mockStopCamera,
    })
    render(<CameraView showSkeleton={false} onSkeletonToggle={vi.fn()} />)
    expect(screen.queryByTestId('skeleton-canvas')).toBeNull()
  })

  it('骨格点トグルボタンが存在する', () => {
    render(<CameraView showSkeleton={false} onSkeletonToggle={vi.fn()} />)
    expect(screen.getByTestId('skeleton-toggle-button')).toBeInTheDocument()
  })

  it('骨格点トグルボタンクリックで onSkeletonToggle が呼ばれる', () => {
    const mockToggle = vi.fn()
    render(<CameraView showSkeleton={false} onSkeletonToggle={mockToggle} />)
    fireEvent.click(screen.getByTestId('skeleton-toggle-button'))
    expect(mockToggle).toHaveBeenCalled()
  })

  it('showSkeleton: true の時にトグルボタンの aria-label が「骨格点を非表示」', () => {
    render(<CameraView showSkeleton={true} onSkeletonToggle={vi.fn()} />)
    expect(screen.getByLabelText('骨格点を非表示')).toBeInTheDocument()
  })

  it('showSkeleton: false の時にトグルボタンの aria-label が「骨格点を表示」', () => {
    render(<CameraView showSkeleton={false} onSkeletonToggle={vi.fn()} />)
    expect(screen.getByLabelText('骨格点を表示')).toBeInTheDocument()
  })

  it('骨格点モデルロード中の表示（showSkeleton: true, isModelLoading: true）', () => {
    vi.mocked(useCamera).mockReturnValue({
      stream: {} as MediaStream,
      videoRef: mockVideoRef,
      error: null,
      isLoading: false,
      stopCamera: mockStopCamera,
    })
    vi.mocked(usePoseDetection).mockReturnValue({
      landmarks: null,
      error: null,
      isModelLoading: true,
    })
    render(<CameraView showSkeleton={true} onSkeletonToggle={vi.fn()} />)
    expect(screen.getByTestId('model-loading')).toBeInTheDocument()
    expect(screen.getByText('骨格点モデルを読み込み中...')).toBeInTheDocument()
  })

  it('骨格点未検出時の案内表示（showSkeleton: true, landmarks: null, isModelLoading: false）', () => {
    vi.mocked(useCamera).mockReturnValue({
      stream: {} as MediaStream,
      videoRef: mockVideoRef,
      error: null,
      isLoading: false,
      stopCamera: mockStopCamera,
    })
    vi.mocked(usePoseDetection).mockReturnValue({
      landmarks: null,
      error: null,
      isModelLoading: false,
    })
    render(<CameraView showSkeleton={true} onSkeletonToggle={vi.fn()} />)
    expect(screen.getByTestId('skeleton-not-detected')).toBeInTheDocument()
    expect(screen.getByText('全身が画面に映るよう調整してください')).toBeInTheDocument()
  })
})
