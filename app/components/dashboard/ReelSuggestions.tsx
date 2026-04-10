'use client'

interface IGMedia {
  caption: string; media_type: string; timestamp: string
  like_count: number; comments_count: number
  insights: { name: string; values: { value: number }[] }[]
}

function getIns(insights: { name: string; values: { value: number }[] }[], name: string) {
  return insights?.find(i => i.name === name)?.values?.[0]?.value ?? 0
}
function getBestDay(media: IGMedia[]) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const byDay: Record<number, number[]> = {}
  media.forEach(m => {
    const d = new Date(m.timestamp).getDay()
    const e = (m.like_count || 0) + (m.comments_count || 0)
    if (!byDay[d]) byDay[d] = []
    byDay[d].push(e)
  })
  let best = 2, bestAvg = 0
  Object.entries(byDay).forEach(([d, vals]) => {
    const a = vals.reduce((x, v) => x + v, 0) / vals.length
    if (a > bestAvg) { bestAvg = a; best = parseInt(d) }
  })
  return days[best]
}

export function ReelSuggestions({ media }: { media: IGMedia[] }) {
  const reels = media.filter(m => m.media_type === 'REEL' || m.media_type === 'VIDEO')
  const bestDay = getBestDay(media)
  const avgPlays = reels.length ? reels.reduce((s, r) => s + getIns(r.insights, 'plays'), 0) / reels.length : 3000
  const tags = media.flatMap(m => (m.caption?.match(/#[\w]+/g) || []))
  const counts: Record<string, number> = {}
  tags.forEach(t => { counts[t] = (counts[t] || 0) + 1 })
  const topTags = Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 2).map(([t]) => t)
  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}K+` : `${Math.round(n)}+`

  const suggestions = [
    { emoji: '🎬', title: 'Behind-the-scenes', tag: 'High reach', tagBg: '#f5f3ff', tagColor: '#7c3aed',
      reason: topTags.length ? `Your top hashtags (${topTags.join(', ')}) show your audience loves authentic content.` : 'BTS content drives saves and new followers.',
      time: `${bestDay}, 6–8 PM`, plays: fmt(avgPlays * 1.3) },
    { emoji: '💡', title: 'Tips & tutorials', tag: 'Saves', tagBg: '#eff6ff', tagColor: '#2563eb',
      reason: 'Educational reels get 2–3× more saves, boosting your algorithmic reach.',
      time: `${bestDay}, 12–2 PM`, plays: fmt(avgPlays * 1.2) },
    { emoji: '🔥', title: 'Trending audio reel', tag: 'Trending', tagBg: '#fff7ed', tagColor: '#c2410c',
      reason: 'Reels with trending audio reach up to 10× more non-followers.',
      time: 'Tue or Thu, 7–9 PM', plays: fmt(avgPlays * 1.8) },
    { emoji: '📣', title: 'Q&A response reel', tag: 'Engagement', tagBg: '#fdf2f8', tagColor: '#be185d',
      reason: 'Responding to followers with video boosts comments and DMs.',
      time: `${bestDay}, 5–7 PM`, plays: fmt(avgPlays * 1.1) },
  ]

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Reel Suggestions</span>
        <span style={{ fontSize: 10, fontWeight: 600, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', color: '#fff', padding: '2px 8px', borderRadius: 20 }}>AI</span>
      </div>
      <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>Based on your account performance</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {suggestions.map((s, i) => (
          <div key={i} style={{ background: '#f9fafb', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{s.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{s.title}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, background: s.tagBg, color: s.tagColor, padding: '2px 8px', borderRadius: 20 }}>{s.tag}</span>
                </div>
                <p style={{ fontSize: 11, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>{s.reason}</p>
                <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 11, color: '#9ca3af' }}>
                  <span>🕐 {s.time}</span>
                  <span>▶ ~{s.plays} plays</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
