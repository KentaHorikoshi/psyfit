import type { Exercise } from '../lib/api-types'
import { Play, Check } from 'lucide-react'

const CATEGORY_LABELS: Record<Exercise['category'], string> = {
  upper_body: '上半身',
  lower_body: '下半身',
  core: '体幹',
  stretch: 'ストレッチ',
}

const CATEGORY_COLORS: Record<Exercise['category'], string> = {
  upper_body: 'bg-blue-100 text-blue-700',
  lower_body: 'bg-purple-100 text-purple-700',
  core: 'bg-orange-100 text-orange-700',
  stretch: 'bg-green-100 text-green-700',
}

interface ExerciseCardProps {
  exercise: Exercise
  onStart: (exercise: Exercise) => void
  isCompleted?: boolean
}

export function ExerciseCard({ exercise, onStart, isCompleted = false }: ExerciseCardProps) {
  const handleClick = () => {
    onStart(exercise)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onStart(exercise)
    }
  }

  const ariaLabel = `${exercise.name} ${exercise.sets}セット${exercise.reps}回${
    exercise.duration_seconds ? ` ${exercise.duration_seconds}秒` : ''
  }${isCompleted ? ' 完了' : ''}`

  return (
    <article
      role="article"
      aria-label={ariaLabel}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={`
        relative rounded-xl border transition-all cursor-pointer
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2
        ${isCompleted
          ? 'bg-green-50 border-green-200 hover:border-green-300'
          : 'bg-white border-gray-200 hover:border-[#1E40AF] hover:shadow-md'
        }
      `}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-t-xl overflow-hidden bg-gray-100">
        {exercise.thumbnail_url ? (
          <img
            src={exercise.thumbnail_url}
            alt={`${exercise.name}のサムネイル`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play size={48} className="text-gray-300" />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
            <Play size={32} className="text-[#1E40AF] ml-1" />
          </div>
        </div>

        {/* Category badge */}
        <span className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[exercise.category]}`}>
          {CATEGORY_LABELS[exercise.category]}
        </span>

        {/* Completed badge */}
        {isCompleted && (
          <div className="absolute top-3 right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <Check size={20} className="text-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900">{exercise.name}</h3>
          {isCompleted && (
            <span className="text-green-600 text-sm font-medium ml-2">完了</span>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {exercise.description}
        </p>

        {/* Exercise info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>{exercise.sets}セット</span>
            <span>×</span>
            <span>{exercise.reps}回</span>
            {exercise.duration_seconds && (
              <>
                <span>·</span>
                <span>{exercise.duration_seconds}秒</span>
              </>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onStart(exercise)
            }}
            className="min-w-[88px] min-h-[44px] px-4 py-2 bg-[#1E40AF] hover:bg-[#1E3A8A] text-white rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2"
            aria-label={`${exercise.name}を開始`}
          >
            {isCompleted ? 'もう一度' : '始める'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default ExerciseCard
