import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getActiveAccount } from '@/lib/session'
import { getAccountInsights } from '@/lib/instagram'

export async function GET() {
  const cookieStore = await cookies()
  const account = getActiveAccount(cookieStore)

  if (!account) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const insights = await getAccountInsights(account.igAccountId, account.accessToken)
    return NextResponse.json(insights)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 })
  }
}
