'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ConnectInstagram } from '@/app/components/dashboard/ConnectInstagram'
import { ProfileHeader } from '@/app/components/dashboard/ProfileHeader'
import { StatsGrid } from '@/app/components/dashboard/StatsGrid'
import { FollowersChart } from '@/app/components/dashboard/FollowersChart'
import { ReelLeaderboard } from '@/app/components/dashboard/ReelLeaderboard'
import { ContentInsights } from '@/app/components/dashboard/ContentInsights'
import { ReelSuggestions } from '@/app/components/dashboard/ReelSuggestions'
import { PostsGrid } from '@/app/components/dashboard/PostsGrid'
import { AudienceInsights } from '@/app/components/dashboard/AudienceInsights'
import { CommentsView } from '@/app/components/dashboard/CommentsView'
import { AccountSwitcher, type AccountMeta } from '@/app/components/dashboard/AccountSwitcher'

interface IGProfile {
  id: string; name: string; username: string; biography: string
  followers_count: number; follows_count: number; media_count: number
  profile_picture_url: string; website: string
}
interface IGInsights {
  data: { name: string; values: { value: number; end_time: string }[] }[]
}
interface IGMedia {
  id: string; caption: string; media_type: string
  media_url: string; thumbnail_url: string; timestamp: string
  like_count: number; comments_count: number; permalink: string
  insights: { name: string; values: { value: number }[] }[]
}
interface AudienceData {
  data: { name: string; period: string; values: { value: Record<string, number> }[] }[]
}
interface MediaWithComments {
  mediaId: string; caption: string; media_type: string; thumbnail_url: string
  permalink: string; timestamp: string; like_count: number; comments_count: number
  comments: { id: string; text: string; timestamp: string; username: string; replies?: { data: { id: string; text: string; timestamp: string; username: string }[] } }[]
}

type Tab = 'reels' | 'overview' | 'posts' | 'audience' | 'comments'

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [loading, setLoading]         = useState(true)
  const [connected, setConnected]     = useState(false)
  const [profile, setProfile]         = useState<IGProfile | null>(null)
  const [media, setMedia]             = useState<IGMedia[]>([])
  const [insights, setInsights]       = useState<IGInsights | null>(null)
  const [audience, setAudience]         = useState<AudienceData | null>(null)
  const [comments, setComments]         = useState<MediaWithComments[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentsError, setCommentsError]     = useState<string | null>(null)
  const [fetchError, setFetchError]     = useState<string | null>(null)
  const [activeTab, setActiveTab]     = useState<Tab>('reels')
  const [accounts, setAccounts]       = useState<AccountMeta[]>([])
  const [activeAccountId, setActiveAccountId] = useState<string>('')

  const urlError = searchParams.get('error')

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setFetchError(null)
    try {
      const [profileRes, accountsRes] = await Promise.all([
        fetch('/api/instagram/profile'),
        fetch('/api/instagram/accounts'),
      ])

      if (profileRes.status === 401) {
        setConnected(false)
        setLoading(false)
        return
      }
      if (!profileRes.ok) throw new Error('profile_error')

      const profileData: IGProfile = await profileRes.json()
      setProfile(profileData)
      setConnected(true)

      if (accountsRes.ok) {
        const { accounts: accs, activeAccountId: activeId } = await accountsRes.json()
        setAccounts(accs)
        setActiveAccountId(activeId ?? accs[0]?.igAccountId ?? '')

        const active = accs.find((a: AccountMeta) => a.igAccountId === activeId)
        if (active && (active.expiresAt - Date.now()) < THIRTY_DAYS) {
          fetch('/api/instagram/refresh', { method: 'POST' }).catch(() => {})
        }
      }

      const [mediaRes, insightsRes, audienceRes] = await Promise.all([
        fetch('/api/instagram/media'),
        fetch('/api/instagram/insights'),
        fetch('/api/instagram/audience'),
      ])
      if (mediaRes.ok)    { const { data } = await mediaRes.json(); setMedia(data || []) }
      if (insightsRes.ok) setInsights(await insightsRes.json())
      if (audienceRes.ok) setAudience(await audienceRes.json())
    } catch {
      setFetchError('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSwitch(igAccountId: string) {
    setLoading(true)
    await fetch('/api/instagram/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ igAccountId }),
    })
    setActiveAccountId(igAccountId)
    await fetchData()
  }

  function handleAddAccount() {
    router.push('/api/instagram/auth')
  }

  async function handleLogout(igAccountId?: string) {
    const res = await fetch('/api/instagram/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(igAccountId ? { igAccountId } : {}),
    })
    const { remainingCount } = await res.json()
    if (remainingCount > 0) {
      await fetchData()
    } else {
      setConnected(false)
      setProfile(null)
      setMedia([])
      setInsights(null)
      setAudience(null)
      setComments([])
      setAccounts([])
      router.replace('/dashboard')
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #e5e7eb', borderTopColor: '#8b5cf6', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ fontSize: 13, color: '#9ca3af' }}>Loading your Instagram data…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )

  if (!connected) return <ConnectInstagram error={urlError} />

  async function loadComments() {
    if (comments.length > 0) return // already loaded
    setCommentsLoading(true)
    setCommentsError(null)
    try {
      const res = await fetch('/api/instagram/comments')
      if (!res.ok) {
        const err = await res.json()
        setCommentsError(err.error || 'Failed to load comments')
      } else {
        const { data } = await res.json()
        setComments(data || [])
      }
    } catch {
      setCommentsError('Failed to load comments')
    } finally {
      setCommentsLoading(false)
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'reels',    label: '🎬 Reels' },
    { key: 'overview', label: '📊 Overview' },
    { key: 'audience', label: '👥 Audience' },
    { key: 'comments', label: '💬 Comments' },
    { key: 'posts',    label: '🖼 Posts' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Nav */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ width: 24, height: 24, borderRadius: 8, background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Instagram</span>
          </div>

          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 4 }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => { setActiveTab(t.key); if (t.key === 'comments') loadComments() }} style={{
                padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
                background: activeTab === t.key ? '#111827' : 'transparent',
                color: activeTab === t.key ? '#fff' : '#6b7280',
                fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
              }}>{t.label}</button>
            ))}
          </div>

          <div style={{ flexShrink: 0 }}>
            <AccountSwitcher
              accounts={accounts}
              activeAccountId={activeAccountId}
              onSwitch={handleSwitch}
              onAddAccount={handleAddAccount}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {fetchError && (
          <div style={{ marginBottom: 20, padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, color: '#dc2626', fontSize: 13 }}>
            {fetchError}
          </div>
        )}

        <ProfileHeader profile={profile} onLogout={() => handleLogout(profile?.id)} />

        {activeTab === 'reels' && (
          <>
            <ReelLeaderboard media={media} followersCount={profile?.followers_count ?? 0} />
            <ContentInsights media={media} />
            <ReelSuggestions media={media} />
          </>
        )}

        {activeTab === 'overview' && (
          <>
            <StatsGrid profile={profile} insights={insights} media={media} />
            <FollowersChart insights={insights} currentFollowers={profile?.followers_count ?? 0} />
          </>
        )}

        {activeTab === 'audience' && (
          <>
            <div style={{ marginBottom: 24 }}>
              <FollowersChart insights={insights} currentFollowers={profile?.followers_count ?? 0} />
            </div>
            <AudienceInsights audience={audience} />
          </>
        )}

        {activeTab === 'comments' && (
          <CommentsView data={comments} loading={commentsLoading} error={commentsError} />
        )}

        {activeTab === 'posts' && (
          <PostsGrid media={media} />
        )}
      </div>
    </div>
  )
}
