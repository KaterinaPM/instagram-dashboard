interface ActionButtonsProps {
  actions: string[]
  onAction: (action: string) => void
  disabled?: boolean
}

export function ActionButtons({ actions, onAction, disabled = false }: ActionButtonsProps) {
  const getButtonStyle = (action: string) => {
    if (action.toLowerCase().includes('approve') || action.toLowerCase().includes('yes')) {
      return 'bg-chart-1 text-primary-foreground hover:opacity-90'
    }
    if (action.toLowerCase().includes('reject') || action.toLowerCase().includes('not')) {
      return 'bg-secondary text-muted-foreground hover:bg-muted border border-border'
    }
    return 'bg-primary text-primary-foreground hover:opacity-90'
  }

  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {actions.map((action) => (
        <button
          key={action}
          onClick={() => onAction(action)}
          disabled={disabled}
          className={`px-4 py-2 rounded-lg font-medium text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed ${getButtonStyle(action)}`}
        >
          {action}
        </button>
      ))}
    </div>
  )
}
