import type { ExerciseRecordWithExercise } from '../../lib/api-types'

export type CompletionStatus = 'full' | 'partial' | 'none' | 'outside'

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
}

/**
 * 月のカレンダーグリッド用日付配列を生成（42日分、日曜始まり）
 */
export function getCalendarDays(year: number, month: number): CalendarDay[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const firstDay = new Date(year, month, 1)
  const startOffset = firstDay.getDay() // 日曜=0

  const days: CalendarDay[] = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(year, month, 1 - startOffset + i)
    date.setHours(0, 0, 0, 0)
    days.push({
      date,
      isCurrentMonth: date.getMonth() === month && date.getFullYear() === year,
      isToday: date.getTime() === today.getTime(),
    })
  }
  return days
}

/**
 * API用の開始日・終了日を返す（カレンダーグリッド全体をカバー）
 */
export function getCalendarDateRange(year: number, month: number): { start_date: string; end_date: string } {
  const days = getCalendarDays(year, month)
  const first = days[0]!.date
  const last = days[days.length - 1]!.date
  return {
    start_date: formatDateKey(first),
    end_date: formatDateKey(last),
  }
}

/**
 * "2026年2月" 形式の月ラベル
 */
export function formatMonthLabel(year: number, month: number): string {
  return `${year}年${month + 1}月`
}

/**
 * "2月8日（日）" 形式の日付ヘッダー
 */
export function formatDayHeader(date: Date): string {
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  const m = date.getMonth() + 1
  const d = date.getDate()
  const w = weekdays[date.getDay()]
  return `${m}月${d}日（${w}）`
}

/**
 * 日付キー "YYYY-MM-DD" を生成
 */
export function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 記録を日付キーでグループ化（JST考慮: completed_at をローカル日付に変換）
 */
export function groupRecordsByDate(
  records: ExerciseRecordWithExercise[]
): Record<string, ExerciseRecordWithExercise[]> {
  const grouped: Record<string, ExerciseRecordWithExercise[]> = {}
  for (const record of records) {
    const date = new Date(record.completed_at)
    const key = formatDateKey(date)
    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key]!.push(record)
  }
  return grouped
}

/**
 * その日のレコードから記録時点の割当数を取得（最大値を使用）
 * assigned_count が無い場合は null を返す
 */
export function getSnapshotAssignedCount(
  dateRecords: ExerciseRecordWithExercise[]
): number | null {
  const counts = dateRecords
    .map((r) => r.assigned_count)
    .filter((c): c is number => c != null && c > 0)
  if (counts.length === 0) return null
  return Math.max(...counts)
}

/**
 * 完了ステータス判定
 * レコードに assigned_count（記録時点のスナップショット）がある場合はそれを優先し、
 * ない場合は currentAssignedCount（現在の割当数）にフォールバック
 */
export function getCompletionStatus(
  dateRecords: ExerciseRecordWithExercise[] | undefined,
  currentAssignedCount: number
): CompletionStatus {
  if (!dateRecords || dateRecords.length === 0) {
    return 'none'
  }
  const uniqueExerciseIds = new Set(dateRecords.map((r) => r.exercise_id))
  const snapshotCount = getSnapshotAssignedCount(dateRecords)
  const effectiveCount = snapshotCount ?? currentAssignedCount
  if (uniqueExerciseIds.size >= effectiveCount) {
    return 'full'
  }
  return 'partial'
}
