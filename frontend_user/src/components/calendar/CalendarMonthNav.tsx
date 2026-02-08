import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMonthLabel } from './calendar-utils'

interface CalendarMonthNavProps {
  year: number
  month: number
  onPrevMonth: () => void
  onNextMonth: () => void
  onToday: () => void
}

export function CalendarMonthNav({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarMonthNavProps) {
  return (
    <div className="flex items-center justify-between px-2 py-2">
      <button
        onClick={onPrevMonth}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="前月"
      >
        <ChevronLeft size={24} className="text-gray-700" />
      </button>

      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-gray-900">
          {formatMonthLabel(year, month)}
        </span>
        <button
          onClick={onToday}
          className="px-3 py-1 text-sm font-medium text-[#1E40AF] bg-blue-50 rounded-full hover:bg-blue-100 transition-colors min-h-[32px]"
          aria-label="今月に移動"
        >
          今日
        </button>
      </div>

      <button
        onClick={onNextMonth}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="翌月"
      >
        <ChevronRight size={24} className="text-gray-700" />
      </button>
    </div>
  )
}
