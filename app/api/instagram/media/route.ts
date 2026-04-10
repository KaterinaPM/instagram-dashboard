import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getActiveAccount } from '@/lib/session'
import { getIGMedia, getMediaInsights } from '@/lib/instagram'

export async function GET() {
  const cookieStore = await cookies()
  const account = getActiveAccount(cookieStore)

  if (!account) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const mediaData = await getIGMedia(account.igAccountId, account.accessToken, 20)

    const mediaWithInsights = await Promise.all(
      (mediaData.data || []).map(async (item: Record<string, unknown>) => {
        try {
          const insights = await getMediaInsights(
            item.id as string,
            account.accessToken,
            item.media_type as string
          )
          return { ...item, insights: insights.data || [] }
        } catch {
          return { ...item, insights: [] }
        }
      })
    )

    return NextResponse.json({ data: mediaWithInsights })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
  }
}
