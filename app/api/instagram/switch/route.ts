import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { parseAccountsCookie, writeActiveAccountCookie } from '@/lib/session'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

  let igAccountId: string
  try {
    const body = await request.json()
    igAccountId = body.igAccountId
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { accounts } = parseAccountsCookie(cookieStore)
  const exists = accounts.some(a => a.igAccountId === igAccountId)

  if (!exists) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }

  writeActiveAccountCookie(cookieStore, igAccountId)
  return NextResponse.json({ success: true })
}
