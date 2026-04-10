import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { parseAccountsCookie, getActiveAccountId } from '@/lib/session'

export async function GET() {
  const cookieStore = await cookies()
  const { accounts } = parseAccountsCookie(cookieStore)
  const activeAccountId = getActiveAccountId(cookieStore) ?? accounts[0]?.igAccountId ?? null

  // Strip tokens before sending to client
  const safeAccounts = accounts.map(({ igAccountId, username, name, profilePictureUrl, expiresAt, addedAt }) => ({
    igAccountId, username, name, profilePictureUrl, expiresAt, addedAt,
  }))

  return NextResponse.json({ accounts: safeAccounts, activeAccountId })
}
