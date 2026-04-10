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
function getInteractions(insights: InsightItem[]) {
  return getIns(insights, 'total_interactions')
}
function avg(nums: number[]) {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0
}
function fmt(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : Math.round(n).toString() }
function fmtDate(ts: string) { return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }

export function StoriesReels({ media }: { media: IGMedia[] }) {
  const [tab, setTab] = useState<'reels' | 'photos'>('reels')
  const reels = media.filter(m => m.media_type === 'REEL' || m.media_type === 'VIDEO')
  const photos = media.filter(m => m.media_type === 'IMAGE' || m.media_type === 'CAROUSEL_ALBUM')
  const items = tab === 'reels' ? reels : photos

  const stats = tab === 'reels' ? [
    { label: 'Avg Reach', value: fmt(avg(reels.map(r => getIns(r.insights, 'reach')))), color: '#8b5cf6' },
    { label: 'Avg Interactions', value: fmt(avg(reels.map(r => getInteractions(r.insights)))), color: '#ec4899' },
    { label: 'Avg Saved', value: fmt(avg(reels.map(r => getIns(r.insights, 'saved')))), color: '#3b82f6' },
  ] : [
    { label: 'Total Posts', value: photos.length.toString(), color: '#f59e0b' },
    { label: 'Avg Reach', value: fmt(avg(photos.map(p => getIns(p.insights, 'reach')))), color: '#8b5cf6' },
    { label: 'Avg Saved', value: fmt(avg(photos.map(p => getIns(p.insights, 'saved')))), color: '#3b82f6' },
  ]

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 24 }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['reels', 'photos'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            background: tab === t ? '#111827' : '#f3f4f6', color: tab === t ? '#fff' : '#6b7280', transition: 'all 0.15s'
          }}>
            {t === 'reels' ? 'Reels' : 'Photos'} ({t === 'reels' ? reels.length : photos.length})
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {stats.map(({ label, value, color }) => (
          <div key={label} style={{ background: '#f9fafb', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color }}>{value || '0'}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* List */}
      {items.length === 0
        ? <p style={{ fontSize: 13, color: '#9ca3af' }}>No {tab} found.</p>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {items.slice(0, 6).map(item => {
            const interactions = getInteractions(item.insights)
            const reach = getIns(item.insights, 'reach')
            const saved = getIns(item.insights, 'saved')
            const thumb = item.thumbnail_url || item.media_url
            return (
              <a key={item.id} href={item.permalink} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 10, textDecoration: 'none', transition: 'background 0.15s' }}
                onMouseOver={e => (e.currentTarget.style.background = '#f9fafb')}
                onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: '#f3f4f6', flexShrink: 0 }}>
                  {thumb ? <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', fontSize: 18 }}>▶</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: '#111827', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.caption?.slice(0, 60) || '(no caption)'}
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{fmtDate(item.timestamp)}</div>
                </div>
                <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
                  {[[reach, 'reach'], [interactions, 'interact.'], [saved, 'saved']].filter(([v]) => (v as number) > 0).map(([v, lbl]) => (
                    <div key={lbl as string} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{fmt(v as number)}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af' }}>{lbl}</div>
                    </div>
                  ))}
                </div>
              </a>
            )
          })}
        </div>
      }
    </div>
  )
}
