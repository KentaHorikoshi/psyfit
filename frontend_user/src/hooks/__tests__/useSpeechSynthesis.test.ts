import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSpeechSynthesis } from '../useSpeechSynthesis'

const createMockVoice = (lang: string, name: string): SpeechSynthesisVoice => ({
  lang,
  name,
  voiceURI: name,
  localService: true,
  default: false,
})

// SpeechSynthesisUtterance のモック（jsdom環境では未定義のため）
class MockSpeechSynthesisUtterance {
  text: string
  lang: string = ''
  rate: number = 1
  voice: SpeechSynthesisVoice | null = null
  onend: (() => void) | null = null

  constructor(text: string) {
    this.text = text
  }
}

function setupSpeechSynthesisMock(voices: SpeechSynthesisVoice[] = []) {
  // speak 呼び出し時に onend を即時発火 → チェーン読み上げのテストを可能にする
  const mockSpeak = vi.fn().mockImplementation((utterance: MockSpeechSynthesisUtterance) => {
    utterance.onend?.()
  })
  const mockCancel = vi.fn()
  const mockGetVoices = vi.fn().mockReturnValue(voices)

  Object.defineProperty(window, 'speechSynthesis', {
    value: {
      speak: mockSpeak,
      cancel: mockCancel,
      getVoices: mockGetVoices,
      onvoiceschanged: null,
    },
    writable: true,
    configurable: true,
  })

  // SpeechSynthesisUtterance をグローバルにモック
  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    value: MockSpeechSynthesisUtterance,
    writable: true,
    configurable: true,
  })

  return { mockSpeak, mockCancel, mockGetVoices }
}

describe('useSpeechSynthesis', () => {
  beforeEach(() => {
    // 各テスト前にデフォルトのモックを設定
    setupSpeechSynthesisMock()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    // speechSynthesis を復元（削除されていた場合）
    if (!('speechSynthesis' in window)) {
      Object.defineProperty(window, 'speechSynthesis', {
        value: { speak: vi.fn(), cancel: vi.fn(), getVoices: vi.fn().mockReturnValue([]), onvoiceschanged: null },
        writable: true,
        configurable: true,
      })
    }
  })

  describe('speak()', () => {
    it('should call speechSynthesis.speak for each line of text', () => {
      vi.useFakeTimers()
      const { mockSpeak } = setupSpeechSynthesisMock()
      const { result } = renderHook(() => useSpeechSynthesis())

      act(() => {
        result.current.speak('・膝をゆっくり伸ばす\n・10秒キープする\n・ゆっくり戻す')
      })
      act(() => { vi.runAllTimers() })

      expect(mockSpeak).toHaveBeenCalledTimes(3)
      vi.useRealTimers()
    })

    it('should call cancel() before speaking to stop previous speech', () => {
      const { mockSpeak, mockCancel } = setupSpeechSynthesisMock()
      const { result } = renderHook(() => useSpeechSynthesis())

      act(() => {
        result.current.speak('テスト')
      })

      // cancel は speak より前に呼ばれる
      const cancelCallOrder = mockCancel.mock.invocationCallOrder[0]
      const speakCallOrder = mockSpeak.mock.invocationCallOrder[0]
      expect(cancelCallOrder).toBeLessThan(speakCallOrder)
    })

    it('should strip leading bullet (・) from each line', () => {
      vi.useFakeTimers()
      const { mockSpeak } = setupSpeechSynthesisMock()
      const { result } = renderHook(() => useSpeechSynthesis())

      act(() => {
        result.current.speak('・膝をゆっくり伸ばす\n・10秒キープする')
      })
      act(() => { vi.runAllTimers() })

      expect(mockSpeak).toHaveBeenCalledTimes(2)
      const firstUtterance = mockSpeak.mock.calls[0][0] as SpeechSynthesisUtterance
      expect(firstUtterance.text).toBe('膝をゆっくり伸ばす')
      const secondUtterance = mockSpeak.mock.calls[1][0] as SpeechSynthesisUtterance
      expect(secondUtterance.text).toBe('10秒キープする')
      vi.useRealTimers()
    })

    it('should filter out empty lines', () => {
      vi.useFakeTimers()
      const { mockSpeak } = setupSpeechSynthesisMock()
      const { result } = renderHook(() => useSpeechSynthesis())

      act(() => {
        result.current.speak('最初の文\n\n三番目の文')
      })
      act(() => { vi.runAllTimers() })

      expect(mockSpeak).toHaveBeenCalledTimes(2)
      vi.useRealTimers()
    })

    it('should set lang to ja-JP on each utterance', () => {
      const { mockSpeak } = setupSpeechSynthesisMock()
      const { result } = renderHook(() => useSpeechSynthesis())

      act(() => {
        result.current.speak('テスト文章')
      })

      const utterance = mockSpeak.mock.calls[0][0] as SpeechSynthesisUtterance
      expect(utterance.lang).toBe('ja-JP')
    })

    it('should set rate to 0.75 on each utterance', () => {
      const { mockSpeak } = setupSpeechSynthesisMock()
      const { result } = renderHook(() => useSpeechSynthesis())

      act(() => {
        result.current.speak('テスト文章')
      })

      const utterance = mockSpeak.mock.calls[0][0] as SpeechSynthesisUtterance
      expect(utterance.rate).toBe(0.75)
    })
  })

  describe('stop()', () => {
    it('should call speechSynthesis.cancel when stop() is called', () => {
      const { mockCancel } = setupSpeechSynthesisMock()
      const { result } = renderHook(() => useSpeechSynthesis())

      act(() => {
        result.current.stop()
      })

      expect(mockCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('ja-JP voice selection', () => {
    it('should set utterance.voice to ja-JP voice when available', () => {
      const jaVoice = createMockVoice('ja-JP', 'Japanese Voice')
      const { mockSpeak } = setupSpeechSynthesisMock([jaVoice])
      const { result } = renderHook(() => useSpeechSynthesis())

      act(() => {
        result.current.speak('テスト')
      })

      const utterance = mockSpeak.mock.calls[0][0] as SpeechSynthesisUtterance
      expect(utterance.voice).toBe(jaVoice)
    })

    it('should not set utterance.voice when no ja-JP voice is available', () => {
      const enVoice = createMockVoice('en-US', 'English Voice')
      const { mockSpeak } = setupSpeechSynthesisMock([enVoice])
      const { result } = renderHook(() => useSpeechSynthesis())

      act(() => {
        result.current.speak('テスト')
      })

      const utterance = mockSpeak.mock.calls[0][0] as SpeechSynthesisUtterance
      // voiceRef.current が null のまま → voice プロパティはデフォルト値
      expect(utterance.voice).toBeNull()
    })

    it('should update voiceRef after onvoiceschanged fires', () => {
      // 初回は空、onvoiceschanged 後に ja-JP が利用可能になる
      const jaVoice = createMockVoice('ja-JP', 'Japanese Voice')
      const mockGetVoices = vi.fn()
        .mockReturnValueOnce([])      // 初回 loadVoices
        .mockReturnValue([jaVoice])   // onvoiceschanged 後

      Object.defineProperty(window, 'speechSynthesis', {
        value: {
          speak: vi.fn(),
          cancel: vi.fn(),
          getVoices: mockGetVoices,
          onvoiceschanged: null,
        },
        writable: true,
        configurable: true,
      })

      const { result } = renderHook(() => useSpeechSynthesis())

      // onvoiceschanged を発火させる
      act(() => {
        if (window.speechSynthesis.onvoiceschanged) {
          ;(window.speechSynthesis.onvoiceschanged as EventListener)(new Event('voiceschanged'))
        }
      })

      // onvoiceschanged 後に speak すると ja-JP voice がセットされる
      act(() => {
        result.current.speak('テスト')
      })

      const utterance = (window.speechSynthesis.speak as ReturnType<typeof vi.fn>).mock.calls[0][0] as SpeechSynthesisUtterance
      expect(utterance.voice).toBe(jaVoice)
    })
  })

  describe('non-supported browser', () => {
    it('should not throw and be no-op when speechSynthesis is not available', () => {
      // speechSynthesis を削除して未サポート環境をシミュレート
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).speechSynthesis

      const { result } = renderHook(() => useSpeechSynthesis())

      expect(result.current.isSupported).toBe(false)

      // speak と stop が例外を投げないこと
      expect(() => {
        act(() => {
          result.current.speak('テスト')
          result.current.stop()
        })
      }).not.toThrow()
    })
  })

  describe('isSupported', () => {
    it('should return true when speechSynthesis is available', () => {
      setupSpeechSynthesisMock()
      const { result } = renderHook(() => useSpeechSynthesis())
      expect(result.current.isSupported).toBe(true)
    })
  })
})
