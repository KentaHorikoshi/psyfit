import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { ExerciseNoteSlider } from '../ExerciseNoteSlider'

describe('ExerciseNoteSlider', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('空・単一項目の表示', () => {
    it('空文字列の場合、何も表示しない', () => {
      const { container } = render(<ExerciseNoteSlider description="" />)
      expect(container.firstChild).toBeNull()
    })

    it('空白のみの場合、何も表示しない', () => {
      const desc = '  \n  \n  '
      const { container } = render(<ExerciseNoteSlider description={desc} />)
      expect(container.firstChild).toBeNull()
    })

    it('1項目のみの場合、静的にテキストを表示する', () => {
      render(<ExerciseNoteSlider description="肘が90度以上曲がり1秒キープしたら達成" />)
      expect(screen.getByText('肘が90度以上曲がり1秒キープしたら達成')).toBeInTheDocument()
    })

    it('1項目のみの場合、ドットインジケーターを表示しない', () => {
      render(<ExerciseNoteSlider description="肘が90度以上曲がり1秒キープしたら達成" />)
      expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    })
  })

  describe('複数項目の表示', () => {
    const multiLineDesc = '手だけを動かさないように注意\n下半身は動かさないようにする\n手を真上に上げた際に脱力する'

    it('最初の項目を表示する', () => {
      render(<ExerciseNoteSlider description={multiLineDesc} />)
      expect(screen.getByText('手だけを動かさないように注意')).toBeInTheDocument()
    })

    it('ドットインジケーターを項目数分表示する', () => {
      render(<ExerciseNoteSlider description={multiLineDesc} />)
      const dots = screen.getAllByRole('tab')
      expect(dots).toHaveLength(3)
    })

    it('カウンター「1 / 3」を表示する', () => {
      render(<ExerciseNoteSlider description={multiLineDesc} />)
      expect(screen.getByText('1 / 3')).toBeInTheDocument()
    })

    it('先頭の「・」を除去して表示する', () => {
      const desc = '・手だけを動かさない\n・下半身は動かさない'
      render(<ExerciseNoteSlider description={desc} />)
      expect(screen.getByText('手だけを動かさない')).toBeInTheDocument()
    })
  })

  describe('自動スライド', () => {
    const desc = '項目1\n項目2\n項目3'

    it('4秒後に次の項目に切り替わる', () => {
      render(<ExerciseNoteSlider description={desc} />)
      expect(screen.getByText('項目1')).toBeInTheDocument()

      act(() => { vi.advanceTimersByTime(4000) })
      expect(screen.getByText('項目2')).toBeInTheDocument()
      expect(screen.getByText('2 / 3')).toBeInTheDocument()
    })

    it('最後の項目の次は先頭に戻る', () => {
      render(<ExerciseNoteSlider description={desc} />)

      act(() => { vi.advanceTimersByTime(4000) }) // -> 2
      act(() => { vi.advanceTimersByTime(4000) }) // -> 3
      act(() => { vi.advanceTimersByTime(4000) }) // -> 1
      expect(screen.getByText('項目1')).toBeInTheDocument()
      expect(screen.getByText('1 / 3')).toBeInTheDocument()
    })

    it('カスタム間隔を設定できる', () => {
      render(<ExerciseNoteSlider description={desc} intervalMs={2000} />)
      expect(screen.getByText('項目1')).toBeInTheDocument()

      act(() => { vi.advanceTimersByTime(2000) })
      expect(screen.getByText('項目2')).toBeInTheDocument()
    })
  })

  describe('手動操作', () => {
    const desc = '項目A\n項目B\n項目C'

    it('ドットクリックで該当項目に移動する', () => {
      render(<ExerciseNoteSlider description={desc} />)

      const dots = screen.getAllByRole('tab')
      fireEvent.click(dots[2]!)
      expect(screen.getByText('項目C')).toBeInTheDocument()
      expect(screen.getByText('3 / 3')).toBeInTheDocument()
    })

    it('ドットクリック後、自動スライドが一時停止する', () => {
      render(<ExerciseNoteSlider description={desc} />)

      const dots = screen.getAllByRole('tab')
      fireEvent.click(dots[1]!)
      expect(screen.getByText('項目B')).toBeInTheDocument()

      // 4秒経っても切り替わらない（一時停止中）
      act(() => { vi.advanceTimersByTime(4000) })
      expect(screen.getByText('項目B')).toBeInTheDocument()

      // 10秒後に自動再開
      act(() => { vi.advanceTimersByTime(10000) })
      act(() => { vi.advanceTimersByTime(4000) })
      expect(screen.getByText('項目C')).toBeInTheDocument()
    })
  })

  describe('アクセシビリティ', () => {
    const desc = '項目1\n項目2'

    it('aria-roledescription="carousel" が設定されている', () => {
      render(<ExerciseNoteSlider description={desc} />)
      const carousel = screen.getByRole('region')
      expect(carousel).toHaveAttribute('aria-roledescription', 'carousel')
    })

    it('aria-live="polite" でスクリーンリーダーに通知する', () => {
      render(<ExerciseNoteSlider description={desc} />)
      const liveRegion = screen.getByRole('region').querySelector('[aria-live="polite"]')
      expect(liveRegion).toBeInTheDocument()
    })

    it('ドットに aria-label が設定されている', () => {
      render(<ExerciseNoteSlider description={desc} />)
      const dots = screen.getAllByRole('tab')
      expect(dots[0]).toHaveAttribute('aria-label', '1番目のメモ')
      expect(dots[1]).toHaveAttribute('aria-label', '2番目のメモ')
    })

    it('アクティブなドットに aria-selected="true" が設定されている', () => {
      render(<ExerciseNoteSlider description={desc} />)
      const dots = screen.getAllByRole('tab')
      expect(dots[0]).toHaveAttribute('aria-selected', 'true')
      expect(dots[1]).toHaveAttribute('aria-selected', 'false')
    })
  })
})
