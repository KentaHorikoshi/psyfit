import { useState, useEffect, useCallback } from 'react'

interface UseFullscreenPlayerReturn {
  isFullscreen: boolean
  enterFullscreen: () => void
  exitFullscreen: () => void
}

export function useFullscreenPlayer(): UseFullscreenPlayerReturn {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const enterFullscreen = useCallback(() => {
    setIsFullscreen(true)
    document.body.style.overflow = 'hidden'
  }, [])

  const exitFullscreen = useCallback(() => {
    setIsFullscreen(false)
    document.body.style.overflow = ''
  }, [])

  // Escape key to exit fullscreen
  useEffect(() => {
    if (!isFullscreen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        exitFullscreen()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen, exitFullscreen])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return { isFullscreen, enterFullscreen, exitFullscreen }
}
