import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  exchangeCodeForToken,
  getLongLivedToken,
  getInstagramBusinessAccount,
  getIGProfile,
} from '@/lib/instagram'
import { upsertAccount } from '@/lib/session'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/dashboard?error=auth_cancelled', request.url))
  }

  try {
    const tokenData = await exchangeCodeForToken(code)
    if (!tokenData.access_token) throw new Error('No access token received')

    const longLivedData = await getLongLivedToken(tokenData.access_token)
    const accessToken = longLivedData.access_token || tokenData.access_token
    const expiresIn = longLivedData.expires_in || 3600

    const igData = await getInstagramBusinessAccount(accessToken)

    // Fetch profile metadata to store in the cookie (for account switcher UI)
    const profile = await getIGProfile(igData.igAccountId, igData.pageAccessToken)

    const cookieStore = await cookies()
    const result = upsertAccount(cookieStore, {
      igAccountId: igData.igAccountId,
      accessToken: igData.pageAccessToken,
      username: profile.username || '',
      name: profile.name || '',
      profilePictureUrl: profile.profile_picture_url || '',
      expiresAt: Date.now() + expiresIn * 1000,
      addedAt: Date.now(),
    })

    if (!result.ok) {
      return NextResponse.redirect(new URL(`/dashboard?error=${result.error}`, request.url))
    }

    return NextResponse.redirect(new URL('/dashboard', request.url))
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown'
    const errorParam =
      message === 'NO_INSTAGRAM' ? 'no_instagram'
      : message === 'NO_PAGES'  ? 'no_pages'
      : 'auth_failed'
    return NextResponse.redirect(new URL(`/dashboard?error=${errorParam}`, request.url))
  }
}
