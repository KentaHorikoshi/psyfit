import type { CompletionStatus, CalendarDay } from './calendar-utils'

interface CalendarDayCellProps {
  day: CalendarDay
  status: CompletionStatus
  isSelected: boolean
  onClick: (date: Date) => void
}

function getStatusLabel(status: CompletionStatus): string {
  switch (status) {
    case 'full':
      return '全完了'
    case 'partial':
      return '一部完了'
    case 'none':
      return '未実施'
    case 'outside':
      return ''
  }
}

function getStatusClasses(status: CompletionStatus, isCurrentMonth: boolean): string {
  if (!isCurrentMonth) {
    return 'text-gray-300 bg-gray-50'
  }
  switch (status) {
    case 'full':
      return 'bg-green-500 text-white font-bold'
    case 'partial':
      return 'bg-amber-100 text-amber-700 font-medium'
    case 'none':
    default:
      return 'bg-white text-gray-900'
  }
}

export function CalendarDayCell({
  day,
  status,
  isSelected,
  onClick,
}: CalendarDayCellProps) {
  const { date, isCurrentMonth, isToday } = day
  const dayNumber = date.getDate()
  const dayOfWeek = date.getDay()

  const statusClasses = getStatusClasses(status, isCurrentMonth)

  const ringClass = isSelected
    ? 'ring-2 ring-[#1E40AF] bg-blue-50'
    : isToday
      ? 'ring-2 ring-[#1E40AF]'
      : ''

  // 日曜=赤, 土曜=青（月外の日は除く）
  const textColorOverride =
    isCurrentMonth && status !== 'full'
      ? dayOfWeek === 0
        ? 'text-red-500'
        : dayOfWeek === 6
          ? 'text-blue-500'
          : ''
      : ''

  const statusLabel = isCurrentMonth ? getStatusLabel(status) : ''
  const dateLabel = `${date.getMonth() + 1}月${dayNumber}日`
  const ariaLabel = statusLabel ? `${dateLabel} ${statusLabel}` : dateLabel

  return (
    <button
      type="button"
      onClick={() => onClick(date)}
      disabled={!isCurrentMonth}
      className={`
        aspect-square w-full flex items-center justify-center
        rounded-lg text-base transition-colors
        ${statusClasses}
        ${ringClass}
        ${textColorOverride}
        ${isCurrentMonth ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-default'}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF]
      `}
      aria-label={ariaLabel}
      aria-current={isToday ? 'date' : undefined}
    >
      {dayNumber}
    </button>
  )
}
