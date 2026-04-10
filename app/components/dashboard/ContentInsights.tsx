'use client'

interface InsightItem { name: string; values: { value: number }[] }
interface IGMedia {
  id: string; caption: string; media_type: string; timestamp: string
  like_count: number; comments_count: number; insights: InsightItem[]
}

function getIns(insights: InsightItem[], name: string) {
  return insights?.find(i => i.name === name)?.values?.[0]?.value ?? 0
}
function getEngagement(insights: InsightItem[]) {
  return getIns(insights, 'total_interactions') || getIns(insights, 'reach')
}
function avg(arr: number[]) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0 }
function fmt(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : Math.round(n).toString() }

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOUR_SLOTS = ['6–9am', '9am–12', '12–3pm', '3–6pm', '6–9pm', '9pm+']

export function ContentInsights({ media }: { media: IGMedia[] }) {
  const reels = media.filter(m => m.media_type === 'REEL' || m.media_type === 'VIDEO')
  if (!reels.length) return null

  // ── Day of week analysis ──
  const dayData = DAY_NAMES.map((day, i) => {
    const dayReels = reels.filter(r => new Date(r.timestamp).getDay() === i)
    return {
      day,
      count: dayReels.length,
      avgEngagement: avg(dayReels.map(r => getEngagement(r.insights))),
      avgReach: avg(dayReels.map(r => getIns(r.insights, 'reach'))),
    }
  })
  const maxAvgEng = Math.max(...dayData.map(d => d.avgEngagement), 1)
  const bestDay = dayData.reduce((a, b) => b.avgEngagement > a.avgEngagement ? b : a)

  // ── Hour of day analysis ──
  const hourData = HOUR_SLOTS.map((slot, i) => {
    const hourReels = reels.filter(r => {
      const h = new Date(r.timestamp).getHours()
      return h >= [6, 9, 12, 15, 18, 21][i] && h < [9, 12, 15, 18, 21, 24][i]
    })
    return { slot, count: hourReels.length, avgEngagement: avg(hourReels.map(r => getEngagement(r.insights))) }
  })
  const maxHourEng = Math.max(...hourData.map(d => d.avgEngagement), 1)
  const bestHour = hourData.reduce((a, b) => b.avgEngagement > a.avgEngagement ? b : a)

  // ── Hashtag analysis ──
  const hashtagStats: Record<string, { engagement: number[]; reach: number[]; count: number }> = {}
  reels.forEach(r => {
    const tags = r.caption?.match(/#[\w]+/g) || []
    tags.forEach(tag => {
      const t = tag.toLowerCase()
      if (!hashtagStats[t]) hashtagStats[t] = { engagement: [], reach: [], count: 0 }
      hashtagStats[t].engagement.push(getEngagement(r.insights))
      hashtagStats[t].reach.push(getIns(r.insights, 'reach'))
      hashtagStats[t].count++
    })
  })
  const topHashtags = Object.entries(hashtagStats)
    .filter(([, v]) => v.count >= 1)
    .map(([tag, v]) => ({ tag, avgEngagement: avg(v.engagement), avgReach: avg(v.reach), count: v.count }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement)
    .slice(0, 8)
  const maxTagEng = Math.max(...topHashtags.map(t => t.avgEngagement), 1)

  // ── Caption length analysis ──
  const withLength = reels.map(r => ({
    len: (r.caption || '').length,
    engagement: getEngagement(r.insights),
  }))
  const short = withLength.filter(r => r.len < 100)
  const medium = withLength.filter(r => r.len >= 100 && r.len < 300)
  const long = withLength.filter(r => r.len >= 300)
  const captionData = [
    { label: 'Short (<100)', avg: avg(short.map(r => r.engagement)), count: short.length },
    { label: 'Medium (100–300)', avg: avg(medium.map(r => r.engagement)), count: medium.length },
    { label: 'Long (300+)', avg: avg(long.map(r => r.engagement)), count: long.length },
  ]
  const maxCap = Math.max(...captionData.map(c => c.avg), 1)
  const bestCaption = captionData.reduce((a, b) => b.avg > a.avg ? b : a)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 24 }}>

      {/* ── Section header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ height: 1, flex: 1, background: '#e5e7eb' }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Content intelligence</span>
        <div style={{ height: 1, flex: 1, background: '#e5e7eb' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Day of week */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Best day to post</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>Avg interactions by day of week</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 80 }}>
            {dayData.map(d => {
              const h = d.avgEngagement > 0 ? Math.max((d.avgEngagement / maxAvgEng) * 72, 6) : 4
              const isBest = d.day === bestDay.day
              return (
                <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: '100%', height: h, borderRadius: 4, background: isBest ? '#ec4899' : '#e0e7ff', transition: 'height 0.3s' }} title={`${d.day}: ${fmt(d.avgEngagement)} avg interactions`} />
                  <div style={{ fontSize: 10, color: isBest ? '#ec4899' : '#9ca3af', fontWeight: isBest ? 700 : 400 }}>{d.day}</div>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: 14, padding: '10px 14px', background: '#fdf2f8', borderRadius: 10, fontSize: 12 }}>
            <span style={{ fontWeight: 600, color: '#be185d' }}>{bestDay.day}</span>
            <span style={{ color: '#6b7280' }}> gets the most interactions — avg </span>
            <span style={{ fontWeight: 600, color: '#111827' }}>{fmt(bestDay.avgEngagement)}</span>
          </div>
        </div>

        {/* Time of day */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Best time to post</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>Avg interactions by time slot</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {hourData.filter(h => h.count > 0).map(h => {
              const pct = h.avgEngagement > 0 ? (h.avgEngagement / maxHourEng) * 100 : 0
              const isBest = h.slot === bestHour.slot
              return (
                <div key={h.slot} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 64, fontSize: 11, color: isBest ? '#7c3aed' : '#9ca3af', fontWeight: isBest ? 600 : 400, flexShrink: 0 }}>{h.slot}</div>
                  <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: isBest ? '#8b5cf6' : '#c4b5fd', borderRadius: 4 }} />
                  </div>
                  <div style={{ width: 32, fontSize: 11, color: '#6b7280', textAlign: 'right' }}>{h.count}</div>
                </div>
              )
            })}
          </div>
          {bestHour.count > 0 && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: '#f5f3ff', borderRadius: 10, fontSize: 12 }}>
              <span style={{ fontWeight: 600, color: '#7c3aed' }}>{bestHour.slot}</span>
              <span style={{ color: '#6b7280' }}> is your sweet spot — avg </span>
              <span style={{ fontWeight: 600, color: '#111827' }}>{fmt(bestHour.avgEngagement)}</span> interactions
            </div>
          )}
        </div>

        {/* Hashtag performance */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Top hashtags by interactions</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14 }}>Which tags correlate with more engagement</div>
          {topHashtags.length === 0
            ? <div style={{ fontSize: 12, color: '#9ca3af' }}>No hashtags found in captions.</div>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {topHashtags.map((t, i) => (
                  <div key={t.tag} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 18, fontSize: 11, fontWeight: 700, color: i < 3 ? '#ec4899' : '#d1d5db' }}>{i + 1}</div>
                    <div style={{ width: 110, fontSize: 12, color: '#374151', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.tag}</div>
                    <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(t.avgEngagement / maxTagEng) * 100}%`, background: i === 0 ? '#ec4899' : i === 1 ? '#a855f7' : '#818cf8', borderRadius: 4 }} />
                    </div>
                    <div style={{ width: 36, fontSize: 11, color: '#6b7280', textAlign: 'right' }}>{fmt(t.avgEngagement)}</div>
                  </div>
                ))}
              </div>
            )
          }
        </div>

        {/* Caption length */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Caption length vs interactions</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>Do longer captions drive more engagement?</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 90 }}>
            {captionData.map(c => {
              const h = c.avg > 0 ? Math.max((c.avg / maxCap) * 75, 6) : 4
              const isBest = c.label === bestCaption.label && c.count > 0
              return (
                <div key={c.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: isBest ? '#10b981' : '#9ca3af' }}>{c.count > 0 ? fmt(c.avg) : '—'}</div>
                  <div style={{ width: '100%', height: h, borderRadius: 6, background: isBest ? '#10b981' : c.count ? '#a7f3d0' : '#f3f4f6' }} />
                  <div style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center', lineHeight: 1.3 }}>{c.label}</div>
                  <div style={{ fontSize: 10, color: '#d1d5db' }}>{c.count} reels</div>
                </div>
              )
            })}
          </div>
          {bestCaption.count > 0 && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: '#f0fdf4', borderRadius: 10, fontSize: 12 }}>
              <span style={{ fontWeight: 600, color: '#059669' }}>{bestCaption.label}</span>
              <span style={{ color: '#6b7280' }}> captions average </span>
              <span style={{ fontWeight: 600, color: '#111827' }}>{fmt(bestCaption.avg)}</span> interactions
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
