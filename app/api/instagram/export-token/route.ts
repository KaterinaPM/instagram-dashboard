import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getActiveAccount } from '@/lib/session'

// One-time helper: visit this URL while logged in to get your token values
// for pasting into Netlify env vars as PUBLIC_IG_TOKEN + PUBLIC_IG_ACCOUNT_ID.
// You can delete this file after setup.

export async function GET() {
  const cookieStore = await cookies()
  const account = getActiveAccount(cookieStore)

  if (!account) {
    return NextResponse.json(
      { error: 'Not logged in — connect your Instagram first, then visit this URL.' },
      { status: 401 }
    )
  }

  return NextResponse.json({
    instructions: 'Copy these two values into Netlify → Site configuration → Environment variables, then trigger a new deploy.',
    PUBLIC_IG_TOKEN: account.accessToken,
    PUBLIC_IG_ACCOUNT_ID: account.igAccountId,
    username: account.username,
    tokenExpiresAt: new Date(account.expiresAt).toISOString(),
  })
}
