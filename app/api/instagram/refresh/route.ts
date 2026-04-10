import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getActiveAccount, updateAccountToken, parseAccountsCookie } from '@/lib/session'
import { refreshLongLivedToken } from '@/lib/instagram'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

  let targetId: string | undefined
  try {
    const body = await request.json()
    targetId = body.igAccountId
  } catch {
    // Use active account
  }

  let account
  if (targetId) {
    const { accounts } = parseAccountsCookie(cookieStore)
    account = accounts.find(a => a.igAccountId === targetId)
  } else {
    account = getActiveAccount(cookieStore)
  }

  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }

  try {
    const refreshed = await refreshLongLivedToken(account.accessToken)
    const newExpiresAt = Date.now() + refreshed.expires_in * 1000
    updateAccountToken(cookieStore, account.igAccountId, refreshed.access_token, newExpiresAt)
    return NextResponse.json({ success: true, expiresAt: newExpiresAt })
  } catch {
    return NextResponse.json({ error: 'Token refresh failed' }, { status: 500 })
  }
}
