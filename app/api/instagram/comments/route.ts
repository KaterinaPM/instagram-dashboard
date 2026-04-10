import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getActiveAccount } from '@/lib/session'
import { getIGMedia, getMediaComments } from '@/lib/instagram'

export async function GET() {
  const cookieStore = await cookies()
  const account = getActiveAccount(cookieStore)

  if (!account) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    // Fetch recent media
    const mediaData = await getIGMedia(account.igAccountId, account.accessToken, 20)
    const media = mediaData.data || []

    // Fetch comments for each post that has comments
    const withComments = await Promise.all(
      media
        .filter((item: { comments_count: number }) => item.comments_count > 0)
        .map(async (item: { id: string; caption: string; media_type: string; thumbnail_url: string; media_url: string; permalink: string; timestamp: string; like_count: number; comments_count: number }) => {
          const commentsData = await getMediaComments(item.id, account.accessToken)
          return {
            mediaId: item.id,
            caption: item.caption,
            media_type: item.media_type,
            thumbnail_url: item.thumbnail_url || item.media_url,
            permalink: item.permalink,
            timestamp: item.timestamp,
            like_count: item.like_count,
            comments_count: item.comments_count,
            comments: commentsData.data || [],
          }
        })
    )

    return NextResponse.json({ data: withComments })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}
