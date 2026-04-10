const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0'

function getRedirectUri() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  return `${baseUrl}/api/instagram/callback`
}

export function getAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    redirect_uri: getRedirectUri(),
    scope: 'instagram_basic,instagram_manage_insights,instagram_manage_comments,pages_read_engagement,pages_show_list,business_management',
    response_type: 'code',
  })
  return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`
}

export async function exchangeCodeForToken(code: string) {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    client_secret: process.env.INSTAGRAM_APP_SECRET!,
    redirect_uri: getRedirectUri(),
    code,
  })
  const res = await fetch(`${GRAPH_API_BASE}/oauth/access_token?${params.toString()}`)
  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`)
  return res.json()
}

export async function getLongLivedToken(shortLivedToken: string) {
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: process.env.INSTAGRAM_APP_ID!,
    client_secret: process.env.INSTAGRAM_APP_SECRET!,
    fb_exchange_token: shortLivedToken,
  })
  const res = await fetch(`${GRAPH_API_BASE}/oauth/access_token?${params.toString()}`)
  if (!res.ok) throw new Error(`Long-lived token failed: ${await res.text()}`)
  return res.json()
}

export async function refreshLongLivedToken(accessToken: string): Promise<{ access_token: string; expires_in: number }> {
  const params = new URLSearchParams({
    grant_type: 'ig_refresh_token',
    access_token: accessToken,
  })
  const res = await fetch(`${GRAPH_API_BASE}/oauth/access_token?${params.toString()}`)
  if (!res.ok) throw new Error(`Token refresh failed: ${await res.text()}`)
  return res.json()
}

export async function getInstagramBusinessAccount(accessToken: string) {
  // Approach 1: standard /me/accounts (direct page roles)
  const pagesRes = await fetch(
    `${GRAPH_API_BASE}/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${accessToken}`
  )
  const pages = await pagesRes.json()

  if (pages.data && pages.data.length > 0) {
    for (const page of pages.data) {
      const igAccountId = page.instagram_business_account?.id
      if (igAccountId) {
        return { igAccountId, pageAccessToken: page.access_token }
      }
      const igRes = await fetch(
        `${GRAPH_API_BASE}/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
      )
      const igData = await igRes.json()
      if (igData.instagram_business_account?.id) {
        return { igAccountId: igData.instagram_business_account.id, pageAccessToken: page.access_token }
      }
    }
    throw new Error('NO_INSTAGRAM')
  }

  // Approach 2: Pages managed through Meta Business Suite
  const bizRes = await fetch(`${GRAPH_API_BASE}/me/businesses?access_token=${accessToken}`)
  const bizData = await bizRes.json()

  if (bizData.data && bizData.data.length > 0) {
    for (const business of bizData.data) {
      const bizPagesRes = await fetch(
        `${GRAPH_API_BASE}/${business.id}/owned_pages?fields=id,name,access_token,instagram_business_account&access_token=${accessToken}`
      )
      const bizPages = await bizPagesRes.json()

      if (bizPages.data && bizPages.data.length > 0) {
        for (const page of bizPages.data) {
          const igAccountId = page.instagram_business_account?.id
          if (igAccountId) {
            return { igAccountId, pageAccessToken: page.access_token }
          }
        }
      }

      const clientPagesRes = await fetch(
        `${GRAPH_API_BASE}/${business.id}/client_pages?fields=id,name,access_token,instagram_business_account&access_token=${accessToken}`
      )
      const clientPages = await clientPagesRes.json()

      if (clientPages.data && clientPages.data.length > 0) {
        for (const page of clientPages.data) {
          const igAccountId = page.instagram_business_account?.id
          if (igAccountId) {
            return { igAccountId, pageAccessToken: page.access_token }
          }
        }
      }
    }
  }

  throw new Error('NO_PAGES')
}

export async function getIGProfile(igAccountId: string, accessToken: string) {
  const fields = 'id,name,username,biography,followers_count,follows_count,media_count,profile_picture_url,website'
  const res = await fetch(`${GRAPH_API_BASE}/${igAccountId}?fields=${fields}&access_token=${accessToken}`)
  if (!res.ok) throw new Error('Failed to fetch profile')
  return res.json()
}

export async function getIGMedia(igAccountId: string, accessToken: string, limit = 20) {
  const fields = 'id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink'
  const res = await fetch(
    `${GRAPH_API_BASE}/${igAccountId}/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`
  )
  if (!res.ok) throw new Error('Failed to fetch media')
  return res.json()
}

export async function getMediaInsights(mediaId: string, accessToken: string, mediaType: string) {
  const isVideo = mediaType === 'VIDEO' || mediaType === 'REEL'

  // plays/video_views/ig_reels_aggregated_all_plays_count deprecated in API v22.0+
  // Use reach, saved, total_interactions, ig_reels_avg_watch_time, ig_reels_video_view_total_time
  const metricSets = isVideo
    ? [
        'reach,saved,total_interactions,ig_reels_avg_watch_time,ig_reels_video_view_total_time,follows,profile_visits',
        'reach,saved,total_interactions,ig_reels_avg_watch_time,ig_reels_video_view_total_time',
        'reach,saved,total_interactions',
        'reach,saved',
      ]
    : ['reach,impressions,saved,total_interactions,follows,profile_visits', 'reach,impressions,saved,total_interactions', 'reach,saved']

  for (const metric of metricSets) {
    const res = await fetch(`${GRAPH_API_BASE}/${mediaId}/insights?metric=${metric}&access_token=${accessToken}`)
    if (res.ok) {
      const json = await res.json()
      if (json.data) return json
    }
  }

  return { data: [] }
}

export async function getAccountInsights(igAccountId: string, accessToken: string) {
  // The API only returns ~30 days per request, so we page backwards in 30-day
  // chunks until we get no more follower_count data (max 2 years back).
  const CHUNK_DAYS = 30
  const MAX_CHUNKS = 24 // up to ~2 years
  const allValues: { value: number; end_time: string }[] = []
  let until = Math.floor(Date.now() / 1000)

  for (let i = 0; i < MAX_CHUNKS; i++) {
    const since = until - CHUNK_DAYS * 24 * 60 * 60
    const res = await fetch(
      `${GRAPH_API_BASE}/${igAccountId}/insights?metric=follower_count,impressions,reach,profile_views&period=day&since=${since}&until=${until}&access_token=${accessToken}`
    )
    if (!res.ok) break
    const json = await res.json()
    const followerMetric = json.data?.find((d: { name: string }) => d.name === 'follower_count')
    const chunk: { value: number; end_time: string }[] = followerMetric?.values ?? []

    // Stop if empty or all zeros (no data this far back)
    const hasRealData = chunk.some((v: { value: number }) => v.value !== 0)
    if (!chunk.length || !hasRealData) break

    // Prepend to keep chronological order
    allValues.unshift(...chunk)
    until = since
  }

  // Deduplicate by end_time, keep chronological order
  const seen = new Set<string>()
  const deduped = allValues.filter(v => {
    if (seen.has(v.end_time)) return false
    seen.add(v.end_time)
    return true
  })

  return {
    data: [{
      name: 'follower_count',
      values: deduped,
    }]
  }
}

export async function getMediaComments(mediaId: string, accessToken: string) {
  const fields = 'id,text,timestamp,username,replies{id,text,timestamp,username}'
  const res = await fetch(
    `${GRAPH_API_BASE}/${mediaId}/comments?fields=${fields}&limit=50&access_token=${accessToken}`
  )
  if (!res.ok) return { data: [] }
  const json = await res.json()
  return json
}

export async function getAudienceInsights(igAccountId: string, accessToken: string) {
  // Try full set first, fall back if some metrics aren't available
  const metricSets = [
    'audience_gender_age,audience_country,audience_city,audience_locale,online_followers',
    'audience_gender_age,audience_country,audience_city,online_followers',
    'audience_gender_age,audience_country,audience_city',
  ]
  for (const metrics of metricSets) {
    const res = await fetch(
      `${GRAPH_API_BASE}/${igAccountId}/insights?metric=${metrics}&period=lifetime&access_token=${accessToken}`
    )
    if (res.ok) {
      const json = await res.json()
      if (json.data) return json
    }
  }
  return { data: [] }
}
