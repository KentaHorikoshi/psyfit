import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * ローカルタイムゾーン（JST）基準で今日の日付文字列を返す (YYYY-MM-DD)
 * new Date().toISOString() はUTC基準のため、JST 0:00〜8:59 に前日の日付になる問題を回避
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
