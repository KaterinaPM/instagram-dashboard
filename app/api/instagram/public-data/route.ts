import { NextResponse } from 'next/server'
import { getIGProfile, getIGMedia, getMediaInsights, getAccountInsights, getAudienceInsights } from '@/lib/instagram'

// Cache for 1 hour — all visitors share the same fresh data
export const revalidate = 3600

export async function GET() {
  const token     = process.env.PUBLIC_IG_TOKEN
  const accountId = process.env.PUBLIC_IG_ACCOUNT_ID

  if (!token || !accountId) {
    return NextResponse.json({ error: 'Public demo not configured' }, { status: 503 })
  }

  try {
    const [profile, mediaData, insights, audience] = await Promise.all([
      getIGProfile(accountId, token),
      getIGMedia(accountId, token, 20),
      getAccountInsights(accountId, token),
      getAudienceInsights(accountId, token).catch(() => null),
    ])

    const mediaWithInsights = await Promise.all(
      (mediaData.data || []).map(async (item: Record<string, unknown>) => {
        try {
          const ins = await getMediaInsights(item.id as string, token, item.media_type as string)
          return { ...item, insights: ins.data || [] }
        } catch {
          return { ...item, insights: [] }
        }
      })
    )

    return NextResponse.json({ profile, media: mediaWithInsights, insights, audience })
  } catch (err) {
    console.error('Public data fetch failed:', err)
    return NextResponse.json({ error: 'Failed to fetch public data' }, { status: 500 })
  }
}
