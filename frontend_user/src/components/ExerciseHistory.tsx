import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ChevronLeft } from 'lucide-react'
import { useCalendarData } from './calendar/useCalendarData'
import { CalendarMonthNav } from './calendar/CalendarMonthNav'
import { CalendarGrid } from './calendar/CalendarGrid'
import { DayDetailPanel } from './calendar/DayDetailPanel'
import { ConditionGraph } from './calendar/ConditionGraph'
import { formatDateKey } from './calendar/calendar-utils'

export function ExerciseHistory() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const { recordsByDate, exercises, assignedCount, isLoading, error, retry } =
    useCalendarData(currentYear, currentMonth)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate])

  const handlePrevMonth = useCallback(() => {
    setSelectedDate(null)
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1)
      setCurrentMonth(11)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }, [currentMonth])

  const handleNextMonth = useCallback(() => {
    setSelectedDate(null)
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1)
      setCurrentMonth(0)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }, [currentMonth])

  const handleToday = useCallback(() => {
    const now = new Date()
    setCurrentYear(now.getFullYear())
    setCurrentMonth(now.getMonth())
    setSelectedDate(now)
  }, [])

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date)
  }, [])

  const handleBack = () => {
    navigate(-1)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ maxWidth: '390px', margin: '0 auto' }}>
        <div role="status" className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E40AF] mx-auto mb-4" />
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const selectedKey = selectedDate ? formatDateKey(selectedDate) : null
  const selectedRecords = selectedKey ? recordsByDate[selectedKey] || [] : []

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{ maxWidth: '390px', margin: '0 auto' }}>
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <div className="flex items-center">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="戻る"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 ml-2">運動履歴</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-4">
        {/* Month Navigation */}
        <CalendarMonthNav
          year={currentYear}
          month={currentMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
        />

        {/* Loading State */}
        {isLoading && (
          <div role="status" className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E40AF] mx-auto mb-4" />
            <p className="text-gray-500">読み込み中...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 mb-3">{error}</p>
            <button
              onClick={retry}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium
                hover:bg-red-700 transition-colors min-h-[44px]"
              aria-label="再試行"
            >
              再試行
            </button>
          </div>
        )}

        {/* Calendar Grid */}
        {!isLoading && !error && (
          <>
            <CalendarGrid
              year={currentYear}
              month={currentMonth}
              recordsByDate={recordsByDate}
              assignedCount={assignedCount}
              exercises={exercises}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              nextVisitDate={user.next_visit_date}
              previousVisitDate={user.previous_visit_date}
            />

            {/* Condition Graph */}
            <div className="mt-4">
              <ConditionGraph year={currentYear} month={currentMonth} />
            </div>

            {/* Day Detail Panel */}
            {selectedDate && (
              <div className="mt-4">
                <DayDetailPanel
                  date={selectedDate}
                  records={selectedRecords}
                  exercises={exercises}
                  isNextVisit={selectedKey === user.next_visit_date}
                  isPreviousVisit={selectedKey === user.previous_visit_date}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default ExerciseHistory
