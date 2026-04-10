'use client'

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
function fmt(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString() }

const TYPE_LABELS: Record<string, string> = { IMAGE: 'Photo', VIDEO: 'Video', CAROUSEL_ALBUM: 'Carousel', REEL: 'Reel' }
const TYPE_COLORS: Record<string, string> = { IMAGE: '#3b82f6', VIDEO: '#8b5cf6', CAROUSEL_ALBUM: '#f59e0b', REEL: '#ec4899' }

export function PostsGrid({ media }: { media: IGMedia[] }) {
  if (!media.length) return null

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Recent Posts</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {media.slice(0, 12).map(item => {
          const thumb = item.thumbnail_url || item.media_url
          const plays = getIns(item.insights, 'plays')
          const color = TYPE_COLORS[item.media_type] || '#6b7280'
          const label = TYPE_LABELS[item.media_type] || item.media_type

          return (
            <a key={item.id} href={item.permalink} target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', borderRadius: 12, overflow: 'hidden', position: 'relative', aspectRatio: '1', background: '#f3f4f6', textDecoration: 'none' }}
              className="post-card"
            >
              {thumb
                ? <img src={thumb} alt={item.caption?.slice(0, 30)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 24 }}>📷</div>
              }
              <div style={{ position: 'absolute', top: 8, left: 8, background: color, color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20 }}>
                {label}
              </div>
              <div className="post-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'flex-end', padding: 10 }}>
                <div style={{ display: 'flex', gap: 10, color: '#fff', fontSize: 11 }}>
                  <span>❤️ {fmt(item.like_count || 0)}</span>
                  <span>💬 {fmt(item.comments_count || 0)}</span>
                  {plays > 0 && <span>▶ {fmt(plays)}</span>}
                </div>
              </div>
            </a>
          )
        })}
      </div>
      <style>{`.post-card:hover .post-overlay { opacity: 1 !important }`}</style>
    </div>
  )
}
