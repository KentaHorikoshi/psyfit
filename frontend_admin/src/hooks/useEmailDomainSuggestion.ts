import { useState, useCallback } from 'react'
import { suggestDomain, applyDomainSuggestion } from '../lib/email-domain-validator'

interface EmailDomainSuggestionResult {
  /** 提案されたドメイン（提案がない場合は null） */
  suggestion: string | null
  /** 入力されたメールアドレス */
  originalEmail: string
  /** 提案を含む修正後のメールアドレス */
  suggestedEmail: string | null
  /** メールアドレスを検査する（onBlurで呼ぶ） */
  checkEmail: (email: string) => void
  /** 提案を適用し、修正後のメールアドレスを返す */
  applySuggestion: () => string | null
  /** 提案を却下する */
  dismissSuggestion: () => void
}

export function useEmailDomainSuggestion(): EmailDomainSuggestionResult {
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [originalEmail, setOriginalEmail] = useState('')
  const [suggestedEmail, setSuggestedEmail] = useState<string | null>(null)

  const checkEmail = useCallback((email: string) => {
    setOriginalEmail(email)
    const domain = suggestDomain(email)
    setSuggestion(domain)
    if (domain) {
      setSuggestedEmail(applyDomainSuggestion(email, domain))
    } else {
      setSuggestedEmail(null)
    }
  }, [])

  const applySuggestion = useCallback(() => {
    const result = suggestedEmail
    setSuggestion(null)
    setSuggestedEmail(null)
    return result
  }, [suggestedEmail])

  const dismissSuggestion = useCallback(() => {
    setSuggestion(null)
    setSuggestedEmail(null)
  }, [])

  return {
    suggestion,
    originalEmail,
    suggestedEmail,
    checkEmail,
    applySuggestion,
    dismissSuggestion,
  }
}
