interface Metric {
  id: string
  label: string
  value: string
  icon: string
}

interface InsightCardProps {
  metrics: Metric[]
}

export function InsightCard({ metrics }: InsightCardProps) {
  return (
    <div className="bg-muted border border-border rounded-xl p-3 my-3">
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((metric) => (
          <div key={metric.id} className="bg-secondary/50 rounded-lg p-2.5">
            <div className="text-xl mb-1.5">{metric.icon}</div>
            <div className="text-xs text-muted-foreground mb-0.5">{metric.label}</div>
            <div className="font-bold text-card-foreground text-sm">{metric.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
