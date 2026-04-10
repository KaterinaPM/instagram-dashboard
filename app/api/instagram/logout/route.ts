import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { removeAccountFromCookie, clearAllAccountCookies, parseAccountsCookie } from '@/lib/session'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

  let igAccountId: string | undefined
  try {
    const body = await request.json()
    igAccountId = body.igAccountId
  } catch {
    // No body — log out all
  }

  if (igAccountId) {
    const remainingCount = removeAccountFromCookie(cookieStore, igAccountId)
    return NextResponse.json({ success: true, remainingCount })
  } else {
    clearAllAccountCookies(cookieStore)
    return NextResponse.json({ success: true, remainingCount: 0 })
  }
}
