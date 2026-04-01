import { useCallback, useEffect, useRef } from 'react'

export function useSpeechSynthesis() {
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const generationRef = useRef(0)

  // ja-JP 音声を取得（onvoiceschanged でブラウザ準備完了後に再取得）
  useEffect(() => {
    if (!isSupported) return
    const loadVoices = () => {
      voiceRef.current = window.speechSynthesis.getVoices().find(v => v.lang === 'ja-JP') ?? null
    }
    loadVoices() // 一部ブラウザは初回同期で取得可能
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [isSupported])

  const speak = useCallback((text: string) => {
    if (!isSupported) return
    window.speechSynthesis.cancel()

    const generation = ++generationRef.current

    // 箇条書き（・）を1文ずつ分割し、onend でチェーンして読み上げる
    // → モバイル途中停止バグ回避 & 文間に間隔を設けてスムーズな読み上げを実現
    const sentences = text
      .split('\n')
      .map(line => line.replace(/^・/, '').trim())
      .filter(Boolean)

    let index = 0
    const speakNext = () => {
      if (generationRef.current !== generation) return
      if (index >= sentences.length) return
      const utterance = new SpeechSynthesisUtterance(sentences[index++])
      utterance.lang = 'ja-JP'
      utterance.rate = 0.75
      if (voiceRef.current) utterance.voice = voiceRef.current
      utterance.onend = () => {
        setTimeout(() => {
          if (generationRef.current !== generation) return
          window.speechSynthesis.resume() // iOS pause バグ対策: onend 後に synthesis が paused 状態になる
          speakNext()
        }, 600)
      }
      window.speechSynthesis.speak(utterance)
    }
    speakNext()
  }, [isSupported])

  const stop = useCallback(() => {
    if (!isSupported) return
    generationRef.current++
    window.speechSynthesis.cancel()
  }, [isSupported])

  return { speak, stop, isSupported }
}
