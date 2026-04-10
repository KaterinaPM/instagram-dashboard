import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getActiveAccount } from '@/lib/session'

const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0'

export async function GET() {
  const cookieStore = await cookies()
  const account = getActiveAccount(cookieStore)

  if (!account) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Grab first 3 reels
  const mediaRes = await fetch(
    `${GRAPH_API_BASE}/${account.igAccountId}/media?fields=id,caption,media_type,timestamp&limit=10&access_token=${account.accessToken}`
  )
  const mediaData = await mediaRes.json()
  const reels = (mediaData.data || []).filter((m: { media_type: string }) =>
    m.media_type === 'REEL' || m.media_type === 'VIDEO'
  ).slice(0, 3)

  // For each reel, try every metric combo and show raw response
  const results = await Promise.all(reels.map(async (reel: { id: string; caption: string; media_type: string; timestamp: string }) => {
    const metricCombos = [
      'reach,saved,total_interactions,ig_reels_avg_watch_time,ig_reels_video_view_total_time',
      'reach,saved,total_interactions',
      'total_interactions',
      'ig_reels_avg_watch_time',
      'ig_reels_video_view_total_time',
      'reach,saved',
    ]

    const attempts: { metrics: string; ok: boolean; data: unknown }[] = []
    for (const metrics of metricCombos) {
      const res = await fetch(
        `${GRAPH_API_BASE}/${reel.id}/insights?metric=${metrics}&access_token=${account.accessToken}`
      )
      const json = await res.json()
      attempts.push({ metrics, ok: res.ok, data: json })
    }

    return {
      id: reel.id,
      caption: reel.caption?.slice(0, 60),
      media_type: reel.media_type,
      timestamp: reel.timestamp,
      attempts,
    }
  }))

  return NextResponse.json({ results })
}
