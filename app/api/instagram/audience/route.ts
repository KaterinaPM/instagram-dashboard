import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getActiveAccount } from '@/lib/session'
import { getAudienceInsights } from '@/lib/instagram'

export async function GET() {
  const cookieStore = await cookies()
  const account = getActiveAccount(cookieStore)

  if (!account) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const audience = await getAudienceInsights(account.igAccountId, account.accessToken)
    return NextResponse.json(audience)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch audience insights' }, { status: 500 })
  }
}
