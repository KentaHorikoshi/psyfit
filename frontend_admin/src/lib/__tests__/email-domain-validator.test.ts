import { describe, it, expect } from 'vitest'
import { levenshteinDistance, suggestDomain, applyDomainSuggestion } from '../email-domain-validator'

describe('levenshteinDistance', () => {
  it('同一文字列は距離0', () => {
    expect(levenshteinDistance('gmail.com', 'gmail.com')).toBe(0)
  })

  it('1文字置換は距離1', () => {
    expect(levenshteinDistance('gmial.com', 'gmail.com')).toBe(2) // transposition = 2 ops
    expect(levenshteinDistance('gmal.com', 'gmail.com')).toBe(1)  // 1 deletion
  })

  it('空文字列は文字列長を返す', () => {
    expect(levenshteinDistance('', 'abc')).toBe(3)
    expect(levenshteinDistance('abc', '')).toBe(3)
  })

  it('maxDistanceを超えるとmaxDistance+1を返す', () => {
    expect(levenshteinDistance('abcdef', 'xyz', 2)).toBe(3)
  })
})

describe('suggestDomain', () => {
  it('gmial.com → gmail.com を提案', () => {
    expect(suggestDomain('user@gmial.com')).toBe('gmail.com')
  })

  it('gmal.com → gmail.com を提案', () => {
    expect(suggestDomain('user@gmal.com')).toBe('gmail.com')
  })

  it('gamil.com → gmail.com を提案', () => {
    expect(suggestDomain('user@gamil.com')).toBe('gmail.com')
  })

  it('yaho.co.jp → yahoo.co.jp を提案', () => {
    expect(suggestDomain('user@yaho.co.jp')).toBe('yahoo.co.jp')
  })

  it('hotmal.com → hotmail.com を提案', () => {
    expect(suggestDomain('user@hotmal.com')).toBe('hotmail.com')
  })

  it('outlok.com → outlook.com を提案', () => {
    expect(suggestDomain('user@outlok.com')).toBe('outlook.com')
  })

  it('正しいドメインは提案なし', () => {
    expect(suggestDomain('user@gmail.com')).toBeNull()
    expect(suggestDomain('user@yahoo.co.jp')).toBeNull()
    expect(suggestDomain('user@hotmail.com')).toBeNull()
    expect(suggestDomain('user@icloud.com')).toBeNull()
  })

  it('未知ドメインは提案なし', () => {
    expect(suggestDomain('user@company.co.jp')).toBeNull()
    expect(suggestDomain('user@example.com')).toBeNull()
    expect(suggestDomain('user@myserver.net')).toBeNull()
  })

  it('@なしは提案なし', () => {
    expect(suggestDomain('usergmail.com')).toBeNull()
  })

  it('空のドメイン部分は提案なし', () => {
    expect(suggestDomain('user@')).toBeNull()
  })

  it('距離3以上は提案なし', () => {
    expect(suggestDomain('user@xyzabc.com')).toBeNull()
  })

  it('大文字小文字を無視する', () => {
    expect(suggestDomain('user@GMIAL.COM')).toBe('gmail.com')
    expect(suggestDomain('user@Gmail.Com')).toBeNull() // exact match (case-insensitive)
  })

  it('携帯キャリアドメインのタイポを検知', () => {
    expect(suggestDomain('user@docmo.ne.jp')).toBe('docomo.ne.jp')
  })
})

describe('applyDomainSuggestion', () => {
  it('ドメイン部分を置換する', () => {
    expect(applyDomainSuggestion('user@gmial.com', 'gmail.com')).toBe('user@gmail.com')
  })

  it('@なしの場合はそのまま返す', () => {
    expect(applyDomainSuggestion('usergmail', 'gmail.com')).toBe('usergmail')
  })

  it('複数@がある場合は最後の@で分割', () => {
    expect(applyDomainSuggestion('user@name@gmial.com', 'gmail.com')).toBe('user@name@gmail.com')
  })
})
