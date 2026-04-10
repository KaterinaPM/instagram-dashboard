'use client'

import { useState } from 'react'

interface InsightItem { name: string; values: { value: number }[] }
interface IGMedia {
  id: string; caption: string; media_type: string
  media_url: string; thumbnail_url: string; timestamp: string
  like_count: number; comments_count: number; permalink: string
  insights: InsightItem[]
}

function getIns(insights: InsightItem[], name: string) {
  return insights?.find(i => i.name === name)?.values?.[0]?.value ?? 0
}
function fmtWatch(ms: number) {
  if (!ms) return '0s'
  const s = ms / 1000
  if (s >= 60) return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`
  return `${s.toFixed(1)}s`
}
function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return Math.round(n).toString()
}
function fmtDate(ts: string) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
function shortCaption(c: string) {
  if (!c) return '(no caption)'
  return c.replace(/#\w+/g, '').trim().slice(0, 55) || c.slice(0, 55)
}
function pct(num: number, den: number) {
  if (!den) return '—'
  return `${((num / den) * 100).toFixed(1)}%`
}

type SortKey = 'reach' | 'follows' | 'profile_visits' | 'interactions' | 'saved' | 'watch_time' | 'engagement'

export function ReelLeaderboard({ media, followersCount }: { media: IGMedia[]; followersCount: number }) {
  const [sortBy, setSortBy] = useState<SortKey>('follows')
  const [showAll, setShowAll] = useState(false)

  const reels = media.filter(m => m.media_type === 'REEL' || m.media_type === 'VIDEO')

  const scored = reels.map(r => {
    const reach         = getIns(r.insights, 'reach')
    const saved         = getIns(r.insights, 'saved')
    const interactions  = getIns(r.insights, 'total_interactions')
    const avgWatchMs    = getIns(r.insights, 'ig_reels_avg_watch_time')
    const follows       = getIns(r.insights, 'follows')
    const profileVisits = getIns(r.insights, 'profile_visits')
    const eng           = followersCount ? ((r.like_count + r.comments_count) / followersCount) * 100 : 0
    return { ...r, reach, saved, interactions, avgWatchMs, follows, profileVisits, eng }
  })

  const insightsAvailable = scored.some(r => r.reach > 0 || r.interactions > 0)

  const sorted = [...scored].sort((a, b) => {
    if (!insightsAvailable) return (b.like_count + b.comments_count) - (a.like_count + a.comments_count)
    if (sortBy === 'follows')        return b.follows - a.follows
    if (sortBy === 'profile_visits') return b.profileVisits - a.profileVisits
    if (sortBy === 'reach')          return b.reach - a.reach
    if (sortBy === 'interactions')   return b.interactions - a.interactions
    if (sortBy === 'saved')          return b.saved - a.saved
    if (sortBy === 'watch_time')     return b.avgWatchMs - a.avgWatchMs
    if (sortBy === 'engagement')     return b.eng - a.eng
    return 0
  })

  const visible = showAll ? sorted : sorted.slice(0, 5)
  const topReel = sorted[0]

  const sortOptions: { key: SortKey; label: string; color: string }[] = [
    { key: 'follows',        label: '👣 Follows',        color: '#10b981' },
    { key: 'profile_visits', label: '🔍 Profile visits',  color: '#f59e0b' },
    { key: 'reach',          label: '👁 Reach',           color: '#8b5cf6' },
    { key: 'interactions',   label: '💫 Interactions',    color: '#ec4899' },
    { key: 'watch_time',     label: '⏱ Avg Watch',       color: '#3b82f6' },
    { key: 'saved',          label: '🔖 Saves',           color: '#6366f1' },
    { key: 'engagement',     label: '📈 Engagement',      color: '#f97316' },
  ]
  const activeColor = sortOptions.find(o => o.key === sortBy)?.color ?? '#10b981'

  if (!reels.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '24px', marginBottom: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
        No reels found in your recent posts.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 24 }}>

      {!insightsAvailable && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16 }}>⏳</span>
          <span style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>Insights not available yet. </span>
          <span style={{ fontSize: 13, color: '#a16207' }}>Rankings are based on likes & comments in the meantime.</span>
        </div>
      )}

      {/* ── Hero card ── */}
      {topReel && (
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #831843 100%)', borderRadius: 20, padding: '28px 32px', color: '#fff', display: 'flex', gap: 24, alignItems: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: 14, overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(255,255,255,0.3)' }}>
            {topReel.thumbnail_url || topReel.media_url
              ? <img src={topReel.thumbnail_url || topReel.media_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🎬</div>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>🏆 Your best performing reel</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shortCaption(topReel.caption)}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{fmtDate(topReel.timestamp)}</div>
          </div>

          {insightsAvailable ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flexShrink: 0 }}>
              {/* Row 1: growth metrics */}
              <div style={{ display: 'flex', gap: 28 }}>
                {[
                  { icon: '👣', val: fmt(topReel.follows),        lbl: 'Follows' },
                  { icon: '🔍', val: fmt(topReel.profileVisits),  lbl: 'Profile visits' },
                  { icon: '👁', val: fmt(topReel.reach),          lbl: 'Reach' },
                ].map(({ icon, val, lbl }) => (
                  <div key={lbl} style={{ textAlign: 'center', minWidth: 56 }}>
                    <div style={{ fontSize: 16, marginBottom: 4, lineHeight: 1 }}>{icon}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>{lbl}</div>
                  </div>
                ))}
              </div>
              {/* Row 2: engagement metrics */}
              <div style={{ display: 'flex', gap: 28, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                {[
                  { icon: '💫', val: fmt(topReel.interactions),     lbl: 'Interactions' },
                  { icon: '⏱',  val: fmtWatch(topReel.avgWatchMs),  lbl: 'Avg watch' },
                  { icon: '🔖', val: fmt(topReel.saved),            lbl: 'Saved' },
                ].map(({ icon, val, lbl }) => (
                  <div key={lbl} style={{ textAlign: 'center', minWidth: 56 }}>
                    <div style={{ fontSize: 16, marginBottom: 4, lineHeight: 1 }}>{icon}</div>
                    <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>{lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 28, flexShrink: 0 }}>
              {[
                { icon: '❤️', val: fmt(topReel.like_count),     lbl: 'Likes' },
                { icon: '💬', val: fmt(topReel.comments_count), lbl: 'Comments' },
              ].map(({ icon, val, lbl }) => (
                <div key={lbl} style={{ textAlign: 'center', minWidth: 48 }}>
                  <div style={{ fontSize: 18, marginBottom: 6, lineHeight: 1 }}>{icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{lbl}</div>
                </div>
              ))}
            </div>
          )}

          <a href={topReel.permalink} target="_blank" rel="noopener noreferrer"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 500, flexShrink: 0, alignSelf: 'flex-start' }}>
            View →
          </a>
        </div>
      )}

      {/* ── Ranked list ── */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>All reels ranked</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {sortOptions.map(o => (
              <button key={o.key} onClick={() => setSortBy(o.key)} style={{
                padding: '5px 12px', borderRadius: 20, border: `1px solid ${sortBy === o.key ? o.color : '#e5e7eb'}`,
                background: sortBy === o.key ? o.color : '#fff', color: sortBy === o.key ? '#fff' : '#6b7280',
                fontSize: 11, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s'
              }}>{o.label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {visible.map((r, i) => {
            const val = sortBy === 'follows' ? r.follows : sortBy === 'profile_visits' ? r.profileVisits : sortBy === 'reach' ? r.reach : sortBy === 'interactions' ? r.interactions : sortBy === 'saved' ? r.saved : sortBy === 'watch_time' ? r.avgWatchMs : r.eng
            const maxVal = sorted[0] ? (sortBy === 'follows' ? sorted[0].follows : sortBy === 'profile_visits' ? sorted[0].profileVisits : sortBy === 'reach' ? sorted[0].reach : sortBy === 'interactions' ? sorted[0].interactions : sortBy === 'saved' ? sorted[0].saved : sortBy === 'watch_time' ? sorted[0].avgWatchMs : sorted[0].eng) : 1
            const barPct = maxVal > 0 ? (val / maxVal) * 100 : 0
            const thumb = r.thumbnail_url || r.media_url
            const displayVal = sortBy === 'engagement' ? `${r.eng.toFixed(1)}%` : sortBy === 'watch_time' ? fmtWatch(r.avgWatchMs) : fmt(val)

            return (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 10, transition: 'background 0.15s' }}
                onMouseOver={e => (e.currentTarget.style.background = '#f9fafb')}
                onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: 24, textAlign: 'center', fontSize: 13, fontWeight: 700, color: i < 3 ? activeColor : '#d1d5db', flexShrink: 0 }}>{i + 1}</div>
                <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: '#f3f4f6', flexShrink: 0 }}>
                  {thumb ? <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎬</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shortCaption(r.caption)}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{fmtDate(r.timestamp)}</div>
                  <div style={{ marginTop: 6, height: 4, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${barPct}%`, background: activeColor, borderRadius: 4, transition: 'width 0.4s ease' }} />
                  </div>
                </div>

                {/* Stats — always show follows + profile visits + primary sort value */}
                <div style={{ display: 'flex', gap: 12, flexShrink: 0, textAlign: 'center' }}>
                  <div style={{ minWidth: 48 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: activeColor }}>{displayVal}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>
                      {sortBy === 'watch_time' ? 'avg watch' : sortBy === 'interactions' ? 'interact.' : sortBy === 'profile_visits' ? 'profile v.' : sortBy}
                    </div>
                  </div>
                  {sortBy !== 'follows' && insightsAvailable && (
                    <div style={{ minWidth: 40 }}>
                      <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>{fmt(r.follows)}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af' }}>follows</div>
                    </div>
                  )}
                  {sortBy !== 'profile_visits' && insightsAvailable && (
                    <div style={{ minWidth: 40 }}>
                      <div style={{ fontSize: 12, color: '#374151' }}>{fmt(r.profileVisits)}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af' }}>profile v.</div>
                    </div>
                  )}
                  {sortBy !== 'reach' && (
                    <div style={{ minWidth: 40 }}>
                      <div style={{ fontSize: 12, color: '#374151' }}>{fmt(r.reach)}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af' }}>reach</div>
                    </div>
                  )}
                  {insightsAvailable && (
                    <div style={{ minWidth: 48 }}>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{pct(r.follows, r.reach)}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af' }}>follow rate</div>
                    </div>
                  )}
                </div>
                <a href={r.permalink} target="_blank" rel="noopener noreferrer"
                  style={{ color: '#d1d5db', textDecoration: 'none', fontSize: 16, flexShrink: 0 }}>↗</a>
              </div>
            )
          })}
        </div>

        {sorted.length > 5 && (
          <button onClick={() => setShowAll(!showAll)} style={{ marginTop: 12, width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: 10, background: '#f9fafb', color: '#6b7280', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
            {showAll ? 'Show less ↑' : `Show all ${sorted.length} reels ↓`}
          </button>
        )}
      </div>
    </div>
  )
}
