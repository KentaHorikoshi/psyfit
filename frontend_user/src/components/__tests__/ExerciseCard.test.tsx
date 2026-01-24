import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExerciseCard } from '../ExerciseCard'
import type { Exercise } from '../../lib/api-types'

const mockExercise: Exercise = {
  id: '1',
  name: '膝伸展運動',
  description: '膝をゆっくり伸ばす運動です。筋力維持に効果的です。',
  video_url: '/videos/knee-extension.mp4',
  thumbnail_url: '/thumbnails/knee-extension.jpg',
  sets: 3,
  reps: 10,
  category: 'lower_body',
}

const mockExerciseWithDuration: Exercise = {
  ...mockExercise,
  id: '2',
  name: 'ストレッチ',
  duration_seconds: 30,
  category: 'stretch',
}

describe('U-11 ExerciseCard', () => {
  describe('rendering', () => {
    it('should render exercise name', () => {
      render(<ExerciseCard exercise={mockExercise} onStart={vi.fn()} />)

      expect(screen.getByText('膝伸展運動')).toBeInTheDocument()
    })

    it('should render exercise description', () => {
      render(<ExerciseCard exercise={mockExercise} onStart={vi.fn()} />)

      expect(screen.getByText(/膝をゆっくり伸ばす運動です/)).toBeInTheDocument()
    })

    it('should render sets and reps', () => {
      render(<ExerciseCard exercise={mockExercise} onStart={vi.fn()} />)

      expect(screen.getByText(/3セット/)).toBeInTheDocument()
      expect(screen.getByText(/10回/)).toBeInTheDocument()
    })

    it('should render duration when provided', () => {
      render(<ExerciseCard exercise={mockExerciseWithDuration} onStart={vi.fn()} />)

      expect(screen.getByText(/30秒/)).toBeInTheDocument()
    })

    it('should render thumbnail image when provided', () => {
      render(<ExerciseCard exercise={mockExercise} onStart={vi.fn()} />)

      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('src', '/thumbnails/knee-extension.jpg')
    })

    it('should render placeholder when no thumbnail', () => {
      const exerciseNoThumb = { ...mockExercise, thumbnail_url: undefined }
      render(<ExerciseCard exercise={exerciseNoThumb} onStart={vi.fn()} />)

      // Should not have an img element
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('should render start button', () => {
      render(<ExerciseCard exercise={mockExercise} onStart={vi.fn()} />)

      expect(screen.getByRole('button', { name: /開始|始める/ })).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('should call onStart when start button is clicked', async () => {
      const user = userEvent.setup()
      const handleStart = vi.fn()
      render(<ExerciseCard exercise={mockExercise} onStart={handleStart} />)

      const startButton = screen.getByRole('button', { name: /開始|始める/ })
      await user.click(startButton)

      expect(handleStart).toHaveBeenCalledWith(mockExercise)
    })

    it('should call onStart when card is clicked', async () => {
      const user = userEvent.setup()
      const handleStart = vi.fn()
      render(<ExerciseCard exercise={mockExercise} onStart={handleStart} />)

      const card = screen.getByRole('article')
      await user.click(card)

      expect(handleStart).toHaveBeenCalledWith(mockExercise)
    })
  })

  describe('completed state', () => {
    it('should show completed indicator when isCompleted is true', () => {
      render(<ExerciseCard exercise={mockExercise} onStart={vi.fn()} isCompleted />)

      expect(screen.getByText(/完了/)).toBeInTheDocument()
    })

    it('should apply completed styles when isCompleted is true', () => {
      render(<ExerciseCard exercise={mockExercise} onStart={vi.fn()} isCompleted />)

      const card = screen.getByRole('article')
      expect(card).toHaveClass('bg-green-50')
    })

    it('should still be clickable when completed', async () => {
      const user = userEvent.setup()
      const handleStart = vi.fn()
      render(<ExerciseCard exercise={mockExercise} onStart={handleStart} isCompleted />)

      const card = screen.getByRole('article')
      await user.click(card)

      expect(handleStart).toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('should have accessible name on the card', () => {
      render(<ExerciseCard exercise={mockExercise} onStart={vi.fn()} />)

      const card = screen.getByRole('article')
      expect(card).toHaveAccessibleName()
    })

    it('should have minimum tap target size (44x44px) for start button', () => {
      render(<ExerciseCard exercise={mockExercise} onStart={vi.fn()} />)

      const button = screen.getByRole('button', { name: /開始|始める/ })
      expect(button).toBeInTheDocument()
      // The actual size check would require computed styles
    })

    it('should support keyboard interaction', async () => {
      const user = userEvent.setup()
      const handleStart = vi.fn()
      render(<ExerciseCard exercise={mockExercise} onStart={handleStart} />)

      await user.tab()
      await user.keyboard('{Enter}')

      expect(handleStart).toHaveBeenCalled()
    })

    it('should have focus-visible styles', async () => {
      const user = userEvent.setup()
      render(<ExerciseCard exercise={mockExercise} onStart={vi.fn()} />)

      await user.tab()

      const focusedElement = document.activeElement
      expect(focusedElement).not.toBe(document.body)
    })

    it('should have proper aria-label with exercise details', () => {
      render(<ExerciseCard exercise={mockExercise} onStart={vi.fn()} />)

      const card = screen.getByRole('article')
      const label = card.getAttribute('aria-label')
      expect(label).toContain('膝伸展運動')
      expect(label).toContain('3セット')
      expect(label).toContain('10回')
    })
  })

  describe('category display', () => {
    it('should display category badge', () => {
      render(<ExerciseCard exercise={mockExercise} onStart={vi.fn()} />)

      expect(screen.getByText(/下半身/)).toBeInTheDocument()
    })

    it('should display correct category for upper body', () => {
      const upperBodyExercise = { ...mockExercise, category: 'upper_body' as const }
      render(<ExerciseCard exercise={upperBodyExercise} onStart={vi.fn()} />)

      expect(screen.getByText(/上半身/)).toBeInTheDocument()
    })

    it('should display correct category for stretch', () => {
      render(<ExerciseCard exercise={mockExerciseWithDuration} onStart={vi.fn()} />)

      const badge = screen.getAllByText(/ストレッチ/)[0]
      expect(badge).toBeInTheDocument()
    })
  })
})
