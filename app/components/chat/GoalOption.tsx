interface GoalOptionProps {
  label: string
  icon: string
  description: string
  onClick: () => void
  disabled?: boolean
}

export function GoalOption({ label, icon, description, onClick, disabled = false }: GoalOptionProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-secondary border border-border rounded-lg p-3 text-left hover:border-primary hover:ring-2 hover:ring-ring transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex items-start gap-2.5">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <div className="font-semibold text-card-foreground text-sm mb-0.5">{label}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
    </button>
  )
}
