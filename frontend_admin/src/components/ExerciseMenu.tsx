import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, ChevronDown, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { ja } from 'react-day-picker/locale'
import { format, parse } from 'date-fns'
import 'react-day-picker/style.css'
import { api } from '../lib/api'
import type { ExerciseMaster, BatchExerciseAssignmentRequest } from '../lib/api-types'

export function ExerciseMenu() {
  const { id: patientId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [exercises, setExercises] = useState<ExerciseMaster[]>([])
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set())
  const [exerciseSettings, setExerciseSettings] = useState<Record<string, { sets: number; reps: number; daily_frequency: number }>>({})
  const [painFlag, setPainFlag] = useState(false)
  const [reason, setReason] = useState('')
  const [nextVisitDate, setNextVisitDate] = useState('')
  const [expandedMajors, setExpandedMajors] = useState<Set<string>>(new Set())
  const [expandedMinors, setExpandedMinors] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Fetch exercise masters and patient exercises on mount
  useEffect(() => {
    if (!patientId) return

    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [mastersResponse, assignedResponse, patientResponse] = await Promise.all([
          api.getExerciseMasters(),
          api.getPatientExercises(patientId),
          api.getPatientDetail(patientId),
        ])

        const fetchedExercises = mastersResponse.data?.exercises || []
        setExercises(fetchedExercises)

        // Expand all major categories by default
        const majors = new Set(fetchedExercises.map(e => e.body_part_major || 'その他'))
        setExpandedMajors(majors)

        // Pre-select assigned exercises and initialize their settings
        const assignments = assignedResponse.data?.assignments || []
        const assignedIds = new Set(assignments.map(a => a.exercise_id))
        setSelectedExercises(assignedIds)

        // Expand minor categories that have assigned exercises
        const assignedMinors = new Set<string>()
        fetchedExercises.forEach(ex => {
          if (assignedIds.has(ex.id)) {
            const minorKey = `${ex.body_part_major || 'その他'}::${ex.body_part_minor || 'その他'}`
            assignedMinors.add(minorKey)
          }
        })
        setExpandedMinors(assignedMinors)

        // Initialize exercise settings from assigned exercises
        const initialSettings: Record<string, { sets: number; reps: number; daily_frequency: number }> = {}
        assignments.forEach(assignment => {
          initialSettings[assignment.exercise_id] = {
            sets: assignment.sets,
            reps: assignment.reps,
            daily_frequency: assignment.daily_frequency ?? 1,
          }
        })
        setExerciseSettings(initialSettings)

        // Pre-populate next visit date
        if (patientResponse.data?.next_visit_date) {
          setNextVisitDate(patientResponse.data.next_visit_date)
        }
      } catch {
        setFetchError('運動マスタの取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [patientId])

  const toggleMajor = (major: string) => {
    setExpandedMajors((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(major)) {
        newSet.delete(major)
      } else {
        newSet.add(major)
      }
      return newSet
    })
  }

  const toggleMinor = (minorKey: string) => {
    setExpandedMinors((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(minorKey)) {
        newSet.delete(minorKey)
      } else {
        newSet.add(minorKey)
      }
      return newSet
    })
  }

  const toggleExercise = (exerciseId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId)
    if (!exercise) return

    setSelectedExercises((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId)
        // Remove settings when deselecting
        setExerciseSettings((prevSettings) => {
          const newSettings = { ...prevSettings }
          delete newSettings[exerciseId]
          return newSettings
        })
      } else {
        newSet.add(exerciseId)
        // Initialize settings with defaults when selecting
        setExerciseSettings((prevSettings) => ({
          ...prevSettings,
          [exerciseId]: {
            sets: exercise.recommended_sets,
            reps: exercise.recommended_reps,
            daily_frequency: 1,
          },
        }))
      }
      return newSet
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedExercises.size === 0) {
      setSubmitError('運動を1つ以上選択してください')
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError(null)

      const assignments = Array.from(selectedExercises).map(exerciseId => {
        const settings = exerciseSettings[exerciseId]
        return {
          exercise_id: exerciseId,
          sets: settings?.sets || 1,
          reps: settings?.reps || 1,
          daily_frequency: settings?.daily_frequency || 1,
        }
      })

      const data: BatchExerciseAssignmentRequest = {
        assignments,
        pain_flag: painFlag,
        reason,
        next_visit_date: nextVisitDate || undefined,
      }

      await api.assignExercises(patientId!, data)

      // Success - navigate back
      navigate(`/patients/${patientId}`)
    } catch {
      setSubmitError('運動メニューの保存に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Group exercises by body_part_major → body_part_minor
  const groupedExercises = exercises.reduce((acc, exercise) => {
    const major = exercise.body_part_major || 'その他'
    const minor = exercise.body_part_minor || 'その他'
    if (!acc[major]) {
      acc[major] = {}
    }
    if (!acc[major][minor]) {
      acc[major][minor] = []
    }
    acc[major][minor].push(exercise)
    return acc
  }, {} as Record<string, Record<string, ExerciseMaster[]>>)

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div role="status" className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E40AF] mx-auto mb-4" />
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    )
  }

  // Fetch error state
  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{fetchError}</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (exercises.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">運動マスタがありません</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(`/patients/${patientId}`)}
          className="flex items-center gap-2 text-[#3B82F6] hover:text-[#1E40AF] mb-4 min-h-[44px]"
          aria-label="戻る"
        >
          <ArrowLeft className="w-5 h-5" />
          患者詳細に戻る
        </button>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">運動メニュー設定</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exercise Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">運動項目を選択</h2>

              <div className="space-y-6">
                {Object.entries(groupedExercises).map(([major, minorGroups]) => {
                  const allMajorExercises = Object.values(minorGroups).flat()
                  const selectedCount = allMajorExercises.filter(e => selectedExercises.has(e.id)).length

                  return (
                    <div key={major} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleMajor(major)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors min-h-[44px]"
                        aria-label={`大分類: ${major}`}
                        aria-expanded={expandedMajors.has(major)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-8 bg-[#3B82F6] rounded"></div>
                          <h3 className="text-xl font-bold text-gray-900">{major}</h3>
                          <span className="text-sm text-gray-500">
                            ({selectedCount}/{allMajorExercises.length})
                          </span>
                        </div>
                        {expandedMajors.has(major) ? (
                          <ChevronDown className="w-6 h-6 text-gray-600" />
                        ) : (
                          <ChevronRight className="w-6 h-6 text-gray-600" />
                        )}
                      </button>
                      {expandedMajors.has(major) && (
                        <div className="p-4 bg-white space-y-3">
                          {Object.entries(minorGroups).map(([minor, minorExercises]) => {
                            const minorKey = `${major}::${minor}`
                            const minorSelectedCount = minorExercises.filter(e => selectedExercises.has(e.id)).length

                            return (
                              <div key={minor} className="border border-gray-100 rounded-lg overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => toggleMinor(minorKey)}
                                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/50 hover:bg-gray-100/50 transition-colors min-h-[44px]"
                                  aria-label={`中分類: ${minor}`}
                                  aria-expanded={expandedMinors.has(minorKey)}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-1 h-6 bg-[#10B981] rounded"></div>
                                    <h4 className="text-base font-semibold text-gray-800">{minor}</h4>
                                    <span className="text-sm text-gray-500">
                                      ({minorSelectedCount}/{minorExercises.length})
                                    </span>
                                  </div>
                                  {expandedMinors.has(minorKey) ? (
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                  ) : (
                                    <ChevronRight className="w-5 h-5 text-gray-500" />
                                  )}
                                </button>
                                {expandedMinors.has(minorKey) && (
                                  <div className="space-y-2 p-3 bg-white">
                                    {minorExercises.map((exercise) => (
                                      <label
                                        key={exercise.id}
                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100 min-h-[44px]"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={selectedExercises.has(exercise.id)}
                                          onChange={() => toggleExercise(exercise.id)}
                                          className="mt-1 w-5 h-5 text-[#3B82F6] border-gray-300 rounded focus:ring-[#3B82F6] cursor-pointer"
                                          aria-label={exercise.name}
                                        />
                                        <div className="flex-1">
                                          <p className="font-medium text-gray-900">{exercise.name}</p>
                                          <p className="text-sm text-gray-600 mt-1">{exercise.description}</p>
                                          <p className="text-sm text-gray-500 mt-1">
                                            {exercise.recommended_sets}セット × {exercise.recommended_reps}回
                                          </p>
                                        </div>
                                      </label>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          <div className="space-y-6">
            {/* Selected Count */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">選択中の運動</h3>
              <p className="text-3xl font-bold text-[#3B82F6]">{selectedExercises.size} 種目</p>
            </div>

            {/* Exercise Settings */}
            {Array.from(selectedExercises).length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">運動設定</h3>
                <div className="space-y-4">
                  {Array.from(selectedExercises).map((exerciseId) => {
                    const exercise = exercises.find(e => e.id === exerciseId)
                    if (!exercise) return null
                    const settings = exerciseSettings[exerciseId]
                    if (!settings) return null

                    return (
                      <div key={exerciseId} className="border border-gray-200 rounded-lg p-4">
                        <p className="font-medium text-gray-900 mb-3 text-sm">{exercise.name}</p>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label htmlFor={`sets-${exerciseId}`} className="block text-xs text-gray-700 mb-1">
                              セット数
                            </label>
                            <input
                              id={`sets-${exerciseId}`}
                              type="number"
                              min="1"
                              max="10"
                              value={settings.sets}
                              onChange={(e) => {
                                const raw = parseInt(e.target.value)
                                const value = Number.isNaN(raw) ? 1 : Math.max(1, Math.min(10, raw))
                                setExerciseSettings(prev => ({
                                  ...prev,
                                  [exerciseId]: { sets: value, reps: prev[exerciseId]?.reps ?? 1, daily_frequency: prev[exerciseId]?.daily_frequency ?? 1 }
                                }))
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none text-sm"
                              aria-label={`${exercise.name}のセット数`}
                            />
                          </div>
                          <div>
                            <label htmlFor={`reps-${exerciseId}`} className="block text-xs text-gray-700 mb-1">
                              回数
                            </label>
                            <input
                              id={`reps-${exerciseId}`}
                              type="number"
                              min="1"
                              max="50"
                              value={settings.reps}
                              onChange={(e) => {
                                const raw = parseInt(e.target.value)
                                const value = Number.isNaN(raw) ? 1 : Math.max(1, Math.min(50, raw))
                                setExerciseSettings(prev => ({
                                  ...prev,
                                  [exerciseId]: { sets: prev[exerciseId]?.sets ?? 1, reps: value, daily_frequency: prev[exerciseId]?.daily_frequency ?? 1 }
                                }))
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none text-sm"
                              aria-label={`${exercise.name}の回数`}
                            />
                          </div>
                          <div>
                            <label htmlFor={`freq-${exerciseId}`} className="block text-xs text-gray-700 mb-1">
                              1日目標回数
                            </label>
                            <input
                              id={`freq-${exerciseId}`}
                              type="number"
                              min="1"
                              max="10"
                              value={settings.daily_frequency}
                              onChange={(e) => {
                                const raw = parseInt(e.target.value)
                                const value = Number.isNaN(raw) ? 1 : Math.max(1, Math.min(10, raw))
                                setExerciseSettings(prev => ({
                                  ...prev,
                                  [exerciseId]: { sets: prev[exerciseId]?.sets ?? 1, reps: prev[exerciseId]?.reps ?? 1, daily_frequency: value }
                                }))
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none text-sm"
                              aria-label={`${exercise.name}の1日目標回数`}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Pain Flag */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">痛みの状態</h3>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">痛みフラグ</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={painFlag}
                    onChange={(e) => setPainFlag(e.target.checked)}
                    className="sr-only peer"
                    aria-label="痛みフラグ"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#3B82F6] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B82F6]"></div>
                </div>
              </label>
              {painFlag && (
                <div className="mt-4">
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                    理由 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    placeholder="痛みの理由や詳細を記入してください"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none resize-none text-base"
                    aria-label="理由"
                  />
                </div>
              )}
            </div>

            {/* Next Visit Date */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">次回来院日</h3>
              {nextVisitDate && (
                <div className="flex items-center justify-between mb-3">
                  <p className="text-base text-gray-900 font-medium">
                    {format(parse(nextVisitDate, 'yyyy-MM-dd', new Date()), 'yyyy年M月d日')}
                  </p>
                  <button
                    type="button"
                    onClick={() => setNextVisitDate('')}
                    className="text-sm text-gray-500 hover:text-gray-700 underline min-h-[44px] min-w-[44px] px-2"
                  >
                    クリア
                  </button>
                </div>
              )}
              <DayPicker
                mode="single"
                locale={ja}
                selected={nextVisitDate ? parse(nextVisitDate, 'yyyy-MM-dd', new Date()) : undefined}
                onSelect={(day) => {
                  if (day) {
                    setNextVisitDate(format(day, 'yyyy-MM-dd'))
                  } else {
                    setNextVisitDate('')
                  }
                }}
                style={{
                  '--rdp-accent-color': '#1E40AF',
                  '--rdp-accent-background-color': '#DBEAFE',
                  '--rdp-day-width': '48px',
                  '--rdp-day-height': '48px',
                  fontSize: '16px',
                } as React.CSSProperties}
                aria-label="次回来院日を選択"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={selectedExercises.size === 0 || isSubmitting}
              className="w-full bg-[#1E40AF] hover:bg-[#1E3A8A] text-white py-3 px-6 rounded-lg font-medium transition-colors shadow-md flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed min-h-[44px]"
              aria-label="保存"
            >
              <Save className="w-5 h-5" />
              {isSubmitting ? '保存中...' : '保存'}
            </button>
          </div>
        </div>

        {/* Submit error message */}
        {submitError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl" role="alert">
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}
      </form>
    </div>
  )
}
