'use client'

interface IGInsights {
  data: { name: string; values: { value: number; end_time: string }[] }[]
}
interface IGMedia {
  like_count: number
  comments_count: number
  insights: { name: string; values: { value: number }[] }[]
}
interface IGProfile { followers_count: number }

function getTotal(insights: IGInsights | null, name: string) {
  return insights?.data?.find(d => d.name === name)?.values.reduce((s, v) => s + v.value, 0) ?? 0
}
function engagementRate(media: IGMedia[], followers: number) {
  if (!media.length || !followers) return 0
  const total = media.reduce((s, m) => s + (m.like_count || 0) + (m.comments_count || 0), 0)
  return (total / media.length / followers) * 100
}
function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return Math.round(n).toString()
}

export function StatsGrid({ profile, insights, media }: { profile: IGProfile | null; insights: IGInsights | null; media: IGMedia[] }) {
  const reach = getTotal(insights, 'reach')
  const impressions = getTotal(insights, 'impressions')
  const eng = engagementRate(media, profile?.followers_count ?? 0)

  const cards = [
    { label: 'Followers', value: profile ? fmt(profile.followers_count) : '—', sub: 'Total', color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Engagement', value: eng ? `${eng.toFixed(2)}%` : '—', sub: 'Avg rate', color: '#ec4899', bg: '#fdf2f8' },
    { label: 'Reach', value: reach ? fmt(reach) : '—', sub: 'Last 30 days', color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Impressions', value: impressions ? fmt(impressions) : '—', sub: 'Last 30 days', color: '#10b981', bg: '#f0fdf4' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
      {cards.map(({ label, value, sub, color, bg }) => (
        <div key={label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{label}</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{sub}</div>
        </div>
      ))}
    </div>
  )
}
