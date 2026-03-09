interface EmailDomainSuggestionProps {
  suggestedEmail: string
  onApply: () => void
  onDismiss: () => void
}

export function EmailDomainSuggestion({
  suggestedEmail,
  onApply,
  onDismiss,
}: EmailDomainSuggestionProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-1.5 flex items-center gap-2 flex-wrap bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-lg text-sm"
    >
      <span>
        もしかして <strong>{suggestedEmail}</strong> ？
      </span>
      <div className="flex gap-2 ml-auto">
        <button
          type="button"
          onClick={onApply}
          className="px-3 py-1 bg-amber-600 text-white rounded text-sm font-medium hover:bg-amber-700 transition-colors min-h-[32px]"
        >
          修正する
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="px-3 py-1 border border-amber-300 text-amber-700 rounded text-sm hover:bg-amber-100 transition-colors min-h-[32px]"
        >
          このまま
        </button>
      </div>
    </div>
  )
}
