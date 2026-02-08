import type { ExerciseRecordWithExercise } from '../../lib/api-types'
import type { CalendarDay } from './calendar-utils'
import { getCalendarDays, getCompletionStatus, formatDateKey } from './calendar-utils'
import { CalendarDayCell } from './CalendarDayCell'

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const

interface CalendarGridProps {
  year: number
  month: number
  recordsByDate: Record<string, ExerciseRecordWithExercise[]>
  assignedCount: number
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
}

export function CalendarGrid({
  year,
  month,
  recordsByDate,
  assignedCount,
  selectedDate,
  onSelectDate,
}: CalendarGridProps) {
  const days: CalendarDay[] = getCalendarDays(year, month)
  const selectedKey = selectedDate ? formatDateKey(selectedDate) : null

  return (
    <div>
      {/* カレンダーグリッド */}
      <div role="grid" aria-label="カレンダー">
        {/* 曜日ヘッダー */}
        <div role="row" className="grid grid-cols-7 mb-1">
          {WEEKDAY_LABELS.map((label, i) => (
            <div
              key={label}
              role="columnheader"
              className={`text-center text-sm font-medium py-2 ${
                i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        {/* 日付グリッド */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const key = formatDateKey(day.date)
            const status = day.isCurrentMonth
              ? getCompletionStatus(recordsByDate[key], assignedCount)
              : 'outside'
            const isSelected = key === selectedKey

            return (
              <CalendarDayCell
                key={key}
                day={day}
                status={status}
                isSelected={isSelected}
                onClick={onSelectDate}
              />
            )
          })}
        </div>
      </div>

      {/* 凡例 */}
      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-green-500" />
          <span>全完了</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-amber-100 border border-amber-300" />
          <span>一部実施</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-white border border-gray-300" />
          <span>未実施</span>
        </div>
      </div>
    </div>
  )
}
