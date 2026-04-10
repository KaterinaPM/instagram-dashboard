'use client'

import { useState, useMemo } from 'react'

// ── Sentiment / question analysis ──────────────────────────────────────────
const POSITIVE_WORDS = [
  'love', 'amazing', 'awesome', 'great', 'beautiful', 'gorgeous', 'perfect',
  'fantastic', 'incredible', 'inspiring', 'inspired', 'motivating', 'motivated',
  'obsessed', 'wow', 'fire', '🔥', '❤️', '😍', '🥰', '💕', '💪', '👏', '🙌',
  'congrats', 'congratulations', 'well done', 'proud', 'brilliant', 'stunning',
  'favourite', 'favorite', 'best', 'epic', '💯', 'legend', 'iconic',
  'обожаю', 'люблю', 'красиво', 'восхитительно', 'отлично', 'прекрасно',
]

function classifyComment(text: string): 'question' | 'positive' | 'neutral' {
  const t = text.toLowerCase()
  if (text.includes('?')) return 'question'
  if (POSITIVE_WORDS.some(w => t.includes(w))) return 'positive'
  return 'neutral'
}

interface Reply {
  id: string
  text: string
  timestamp: string
  username: string
}

interface Comment {
  id: string
  text: string
  timestamp: string
  username: string
  replies?: { data: Reply[] }
}

interface MediaWithComments {
  mediaId: string
  caption: string
  media_type: string
  thumbnail_url: string
  permalink: string
  timestamp: string
  like_count: number
  comments_count: number
  comments: Comment[]
}

function fmtDate(ts: string) {
  const d = new Date(ts)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function shortCaption(c: string) {
  if (!c) return '(no caption)'
  return c.replace(/#\w+/g, '').trim().slice(0, 50) || c.slice(0, 50)
}

const TYPE_COLORS: Record<string, string> = {
  IMAGE: '#3b82f6', VIDEO: '#8b5cf6', CAROUSEL_ALBUM: '#f59e0b', REEL: '#ec4899'
}
const TYPE_LABELS: Record<string, string> = {
  IMAGE: 'Photo', VIDEO: 'Video', CAROUSEL_ALBUM: 'Carousel', REEL: 'Reel'
}

export function CommentsView({ data, loading, error }: {
  data: MediaWithComments[]
  loading: boolean
  error: string | null
}) {
  const [search, setSearch] = useState('')
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null)
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())

  // All hooks must run before any early returns — compute from data (empty array when no data)
  const allComments = useMemo(() =>
    data.flatMap(post => post.comments.map(c => ({ ...c, post }))),
    [data]
  )

  const filtered = useMemo(() =>
    allComments.filter(c => {
      const matchesSearch = !search || c.text.toLowerCase().includes(search.toLowerCase()) || c.username.toLowerCase().includes(search.toLowerCase())
      const matchesPost = !selectedMedia || c.post.mediaId === selectedMedia
      return matchesSearch && matchesPost
    }),
    [allComments, search, selectedMedia]
  )

  const totalReplies = useMemo(() =>
    allComments.reduce((acc, c) => acc + (c.replies?.data?.length ?? 0), 0),
    [allComments]
  )

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const next = new Set(prev)
      next.has(commentId) ? next.delete(commentId) : next.add(commentId)
      return next
    })
  }

  // ── Analysis ──────────────────────────────────────────────────────────────
  const analysis = useMemo(() => {
    // Top commenters
    const commenterMap: Record<string, { count: number; latestText: string; latestTs: string }> = {}
    allComments.forEach(c => {
      if (!commenterMap[c.username]) commenterMap[c.username] = { count: 0, latestText: '', latestTs: '' }
      commenterMap[c.username].count++
      if (!commenterMap[c.username].latestTs || c.timestamp > commenterMap[c.username].latestTs) {
        commenterMap[c.username].latestText = c.text
        commenterMap[c.username].latestTs = c.timestamp
      }
      // Count replies too
      ;(c.replies?.data ?? []).forEach(r => {
        if (!commenterMap[r.username]) commenterMap[r.username] = { count: 0, latestText: '', latestTs: '' }
        commenterMap[r.username].count++
      })
    })
    const topCommenters = Object.entries(commenterMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 8)
      .map(([username, v]) => ({ username, ...v }))

    // Questions & positive comments
    const questions: typeof allComments = []
    const positives: typeof allComments = []
    allComments.forEach(c => {
      const type = classifyComment(c.text)
      if (type === 'question') questions.push(c)
      else if (type === 'positive') positives.push(c)
    })

    // Deduplicate similar questions (simple: group by first 30 chars)
    const uniqueQuestions = questions.filter((q, i) =>
      questions.findIndex(x => x.text.slice(0, 30) === q.text.slice(0, 30)) === i
    ).slice(0, 8)

    return { topCommenters, questions: uniqueQuestions, positives: positives.slice(0, 6) }
  }, [allComments])

  // Early returns after all hooks
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0', color: '#9ca3af', fontSize: 13 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #e5e7eb', borderTopColor: '#8b5cf6', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          Loading comments…
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '16px 20px', color: '#dc2626', fontSize: 13 }}>
        {error.includes('manage_comments')
          ? <>You need to reconnect your Instagram account to grant the comments permission. Disconnect and reconnect from the account switcher in the top right.</>
          : error}
      </div>
    )
  }

  if (!data.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '60px 24px', textAlign: 'center', color: '#9ca3af' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>No comments yet</div>
        <div style={{ fontSize: 12, marginTop: 6 }}>Comments on your posts will appear here</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Stats bar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Posts with comments', value: data.length, icon: '🖼', color: '#8b5cf6' },
          { label: 'Total comments', value: allComments.length, icon: '💬', color: '#ec4899' },
          { label: 'Total replies', value: totalReplies, icon: '↩️', color: '#3b82f6' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Analysis panels ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>

        {/* Top commenters */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', gridColumn: '1 / 2' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>🌟 Top commenters</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 14 }}>Your most engaged followers — say thanks!</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {analysis.topCommenters.length === 0
              ? <div style={{ fontSize: 12, color: '#9ca3af' }}>No data yet</div>
              : analysis.topCommenters.map((c, i) => (
              <div key={c.username} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? 'linear-gradient(135deg,#f59e0b,#ec4899)' : i === 1 ? 'linear-gradient(135deg,#8b5cf6,#3b82f6)' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: i < 2 ? '#fff' : '#6b7280', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : c.username[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>@{c.username}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.latestText?.slice(0, 35) || '—'}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#8b5cf6', flexShrink: 0 }}>{c.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Questions */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>❓ Questions from followers</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 14 }}>FAQs you might want to answer in a future post</div>
          {analysis.questions.length === 0
            ? <div style={{ fontSize: 12, color: '#9ca3af' }}>No questions found yet</div>
            : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {analysis.questions.map(q => (
                <div key={q.id} style={{ padding: '8px 12px', background: '#fffbeb', borderRadius: 10, borderLeft: '3px solid #f59e0b' }}>
                  <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.4 }}>{q.text}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>@{q.username} · {fmtDate(q.timestamp)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Positive highlights */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>❤️ Positive feedback</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 14 }}>Comments that show your content is resonating</div>
          {analysis.positives.length === 0
            ? <div style={{ fontSize: 12, color: '#9ca3af' }}>No positive comments detected yet</div>
            : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {analysis.positives.map(p => (
                <div key={p.id} style={{ padding: '8px 12px', background: '#f0fdf4', borderRadius: 10, borderLeft: '3px solid #10b981' }}>
                  <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.4 }}>{p.text}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>@{p.username} · on "{shortCaption(p.post.caption)}"</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'flex-start' }}>

        {/* ── Left: post filter ── */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', position: 'sticky', top: 76 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Filter by post</div>
          <button
            onClick={() => setSelectedMedia(null)}
            style={{
              width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', marginBottom: 4, fontSize: 12, fontWeight: 500,
              background: !selectedMedia ? '#f5f3ff' : 'transparent',
              color: !selectedMedia ? '#7c3aed' : '#6b7280',
            }}
          >
            All posts ({allComments.length})
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 500, overflowY: 'auto' }}>
            {data.map(post => (
              <button
                key={post.mediaId}
                onClick={() => setSelectedMedia(post.mediaId === selectedMedia ? null : post.mediaId)}
                style={{
                  width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11,
                  background: selectedMedia === post.mediaId ? '#f5f3ff' : 'transparent',
                  color: selectedMedia === post.mediaId ? '#7c3aed' : '#6b7280',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 6, overflow: 'hidden', background: '#f3f4f6', flexShrink: 0 }}>
                  {post.thumbnail_url
                    ? <img src={post.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📷</div>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500, color: '#374151', fontSize: 11 }}>{shortCaption(post.caption)}</div>
                  <div style={{ color: '#9ca3af', fontSize: 10, marginTop: 1 }}>{post.comments_count} comments</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: comments feed ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14 }}>🔍</div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search comments…"
              style={{ width: '100%', padding: '10px 16px 10px 36px', borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box', color: '#111827' }}
            />
          </div>

          {filtered.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '40px 24px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
              No comments match your search
            </div>
          ) : (
            filtered.map(c => {
              const replies = c.replies?.data ?? []
              const isExpanded = expandedReplies.has(c.id)
              const typeColor = TYPE_COLORS[c.post.media_type] || '#6b7280'
              const typeLabel = TYPE_LABELS[c.post.media_type] || c.post.media_type

              return (
                <div key={c.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

                  {/* Post context bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, overflow: 'hidden', background: '#f3f4f6', flexShrink: 0 }}>
                      {c.post.thumbnail_url
                        ? <img src={c.post.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>📷</div>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {shortCaption(c.post.caption)}
                      </div>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: typeColor, background: `${typeColor}18`, padding: '2px 7px', borderRadius: 20, flexShrink: 0 }}>
                      {typeLabel}
                    </div>
                    <a href={c.post.permalink} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'none', flexShrink: 0 }}>↗</a>
                  </div>

                  {/* Comment */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {c.username?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>@{c.username}</span>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>{fmtDate(c.timestamp)}</span>
                      </div>
                      <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{c.text}</div>

                      {replies.length > 0 && (
                        <button
                          onClick={() => toggleReplies(c.id)}
                          style={{ marginTop: 8, fontSize: 11, color: '#8b5cf6', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500 }}
                        >
                          {isExpanded ? '▲ Hide' : '▼ Show'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Replies */}
                  {isExpanded && replies.length > 0 && (
                    <div style={{ marginTop: 12, marginLeft: 42, display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 16, borderLeft: '2px solid #f3f4f6' }}>
                      {replies.map(r => (
                        <div key={r.id} style={{ display: 'flex', gap: 8 }}>
                          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                            {r.username?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>@{r.username}</span>
                              <span style={{ fontSize: 10, color: '#9ca3af' }}>{fmtDate(r.timestamp)}</span>
                            </div>
                            <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{r.text}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
