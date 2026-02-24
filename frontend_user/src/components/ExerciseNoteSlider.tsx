import { useState, useEffect, useRef, useCallback } from 'react'

interface ExerciseNoteSliderProps {
  description: string
  intervalMs?: number
}

function parseNotes(description: string): string[] {
  return description
    .split('\n')
    .map((line) => line.replace(/^・/, '').trim())
    .filter((line) => line.length > 0)
}

export function ExerciseNoteSlider({
  description,
  intervalMs = 4000,
}: ExerciseNoteSliderProps) {
  const notes = parseNotes(description)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartXRef = useRef<number | null>(null)

  const noteCount = notes.length

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % noteCount)
  }, [noteCount])

  const pauseAutoPlay = useCallback(() => {
    setIsPaused(true)
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current)
    }
    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false)
    }, 10000)
  }, [])

  // Auto-play
  useEffect(() => {
    if (noteCount <= 1 || isPaused) return

    const timer = setInterval(goToNext, intervalMs)
    return () => clearInterval(timer)
  }, [noteCount, isPaused, intervalMs, goToNext])

  // Cleanup pause timer
  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current)
      }
    }
  }, [])

  const handleDotClick = (index: number) => {
    goTo(index)
    pauseAutoPlay()
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    touchStartXRef.current = touch.clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return
    const touch = e.changedTouches[0]
    if (!touch) return
    const diff = touchStartXRef.current - touch.clientX
    touchStartXRef.current = null

    if (Math.abs(diff) < 50) return

    pauseAutoPlay()
    if (diff > 0) {
      // Swipe left -> next
      setCurrentIndex((prev) => (prev + 1) % noteCount)
    } else {
      // Swipe right -> prev
      setCurrentIndex((prev) => (prev - 1 + noteCount) % noteCount)
    }
  }

  if (noteCount === 0) return null

  if (noteCount === 1) {
    return (
      <div className="bg-blue-50 rounded-lg px-4 py-3">
        <p className="text-gray-700 text-base">{notes[0]}</p>
      </div>
    )
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="運動の注意事項"
      className="bg-blue-50 rounded-lg px-4 py-3"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Counter */}
      <div className="flex justify-end mb-1">
        <span className="text-xs text-gray-400">
          {currentIndex + 1} / {noteCount}
        </span>
      </div>

      {/* Note content */}
      <div aria-live="polite" className="min-h-[48px] flex items-center">
        <p className="text-gray-700 text-base transition-opacity duration-300">
          {notes[currentIndex]}
        </p>
      </div>

      {/* Dot indicators */}
      <div
        role="tablist"
        aria-label="メモの切り替え"
        className="flex justify-center gap-2 mt-2"
      >
        {notes.map((_, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={index === currentIndex}
            aria-label={`${index + 1}番目のメモ`}
            onClick={() => handleDotClick(index)}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#1E40AF] rounded-full`}
          >
            <span
              className={`block w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
                index === currentIndex ? 'bg-[#1E40AF]' : 'bg-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
