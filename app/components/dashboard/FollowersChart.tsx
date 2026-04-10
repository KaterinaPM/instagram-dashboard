'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface IGInsights {
  data: { name: string; values: { value: number; end_time: string }[] }[]
}

export function FollowersChart({ insights, currentFollowers }: { insights: IGInsights | null; currentFollowers: number }) {
  const metric = insights?.data?.find(d => d.name === 'follower_count')
  const hasData = metric && metric.values.length > 0

  // follower_count returns daily DELTAS (change per day), not totals.
  // Reconstruct cumulative total by working backwards from current count.
  const chartData = (() => {
    if (!hasData) return []
    const values = metric!.values // sorted oldest → newest
    // Build cumulative totals
    let running = currentFollowers
    const points = [...values].reverse().map(v => {
      const point = {
        date: new Date(v.end_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        followers: Math.max(0, running),
        delta: v.value,
      }
      running -= v.value
      return point
    }).reverse()
    return points
  })()

  const first = chartData[0]?.followers ?? 0
  const last  = chartData[chartData.length - 1]?.followers ?? currentFollowers
  const gained = last - first
  const gainedSign = gained >= 0 ? '+' : ''
  const avgPerDay = chartData.length > 1 ? (gained / (chartData.length - 1)) : 0

  // Find best single-day gain
  const bestDay = hasData
    ? metric!.values.reduce((a, b) => b.value > a.value ? b : a)
    : null

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Follower growth</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Since account start</div>
        </div>
        {hasData && (
          <div style={{ display: 'flex', gap: 24, textAlign: 'right' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{currentFollowers.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>total followers</div>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: gained >= 0 ? '#10b981' : '#ef4444' }}>{gainedSign}{gained}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>since start</div>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#8b5cf6' }}>{avgPerDay >= 0 ? '+' : ''}{avgPerDay.toFixed(1)}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>avg / day</div>
            </div>
          </div>
        )}
      </div>

      {!hasData ? (
        <div style={{ height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <div style={{ fontSize: 32 }}>📈</div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>No growth data yet</div>
          <div style={{ fontSize: 11, color: '#d1d5db', textAlign: 'center' }}>Insights populate after 24–48h</div>
        </div>
      ) : (
        <>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} interval={Math.floor(chartData.length / 6)} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 12 }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload
                    return (
                      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 12px', fontSize: 12 }}>
                        <div style={{ fontWeight: 600, color: '#111827', marginBottom: 4 }}>{label}</div>
                        <div style={{ color: '#8b5cf6' }}>👥 {d.followers.toLocaleString()} followers</div>
                        {d.delta !== 0 && (
                          <div style={{ color: d.delta >= 0 ? '#10b981' : '#ef4444', marginTop: 2 }}>
                            {d.delta >= 0 ? '+' : ''}{d.delta} that day
                          </div>
                        )}
                      </div>
                    )
                  }}
                />
                <Area type="monotone" dataKey="followers" stroke="#8b5cf6" strokeWidth={2} fill="url(#fg)" dot={false} activeDot={{ r: 4, fill: '#8b5cf6' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {bestDay && bestDay.value > 0 && (
            <div style={{ marginTop: 16, padding: '10px 14px', background: '#f5f3ff', borderRadius: 10, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>🚀</span>
              <span style={{ color: '#6b7280' }}>Best day: </span>
              <span style={{ fontWeight: 600, color: '#7c3aed' }}>
                +{bestDay.value} followers
              </span>
              <span style={{ color: '#6b7280' }}>on {new Date(bestDay.end_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
