import { useCallback, useEffect, useRef } from 'react'

export function useSpeechSynthesis() {
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null)

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

  // アンマウント時に keepAlive を確実にクリア
  useEffect(() => {
    return () => {
      if (keepAliveRef.current) clearInterval(keepAliveRef.current)
    }
  }, [])

  const speak = useCallback((text: string) => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current)
      keepAliveRef.current = null
    }

    // 箇条書き（・）を1文ずつ分割し、まとめてキューに積む
    // onend チェーン + setTimeout 方式は iOS で断続感が出るため廃止
    const sentences = text
      .split('\n')
      .map(line => line.replace(/^・/, '').trim())
      .filter(Boolean)

    if (sentences.length === 0) return

    sentences.forEach(sentence => {
      const utterance = new SpeechSynthesisUtterance(sentence)
      utterance.lang = 'ja-JP'
      utterance.rate = 0.75
      if (voiceRef.current) utterance.voice = voiceRef.current
      window.speechSynthesis.speak(utterance)
    })

    // iOS: speechSynthesis が約15秒後に自動で pause 状態になるバグ対策
    // 14秒ごとに resume() を呼んでスリープを防ぐ
    keepAliveRef.current = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(keepAliveRef.current!)
        keepAliveRef.current = null
        return
      }
      window.speechSynthesis.resume()
    }, 14000)
  }, [isSupported])

  const stop = useCallback(() => {
    if (!isSupported) return
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current)
      keepAliveRef.current = null
    }
    window.speechSynthesis.cancel()
  }, [isSupported])

  return { speak, stop, isSupported }
}
