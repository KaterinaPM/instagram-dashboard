import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

// ── Types ──────────────────────────────────────────────────────────────────

export interface AccountEntry {
  igAccountId: string
  accessToken: string
  username: string
  name: string
  profilePictureUrl: string
  expiresAt: number   // ms timestamp
  addedAt: number     // ms timestamp
}

export interface AccountsPayload {
  accounts: AccountEntry[]
}

export type AccountMeta = Omit<AccountEntry, 'accessToken'>

// ── Cookie names ───────────────────────────────────────────────────────────

const ACCOUNTS_COOKIE = 'ig_accounts'
const ACTIVE_COOKIE   = 'ig_active'
const SIXTY_DAYS      = 60 * 24 * 60 * 60   // seconds

const ACCOUNTS_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: SIXTY_DAYS,
  path: '/',
  sameSite: 'lax' as const,
}

// ig_active is NOT httpOnly so the client can read it for instant rendering
const ACTIVE_OPTS = {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  maxAge: SIXTY_DAYS,
  path: '/',
  sameSite: 'lax' as const,
}

// ── Read helpers ───────────────────────────────────────────────────────────

export function parseAccountsCookie(cookieStore: ReadonlyRequestCookies): AccountsPayload {
  const raw = cookieStore.get(ACCOUNTS_COOKIE)?.value
  if (!raw) return { accounts: [] }
  try {
    const parsed = JSON.parse(raw)
    return { accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [] }
  } catch {
    return { accounts: [] }
  }
}

export function getActiveAccountId(cookieStore: ReadonlyRequestCookies): string | null {
  const raw = cookieStore.get(ACTIVE_COOKIE)?.value
  if (!raw) return null
  try {
    return JSON.parse(raw).igAccountId ?? null
  } catch {
    return null
  }
}

export function getActiveAccount(cookieStore: ReadonlyRequestCookies): AccountEntry | null {
  const { accounts } = parseAccountsCookie(cookieStore)
  if (!accounts.length) return null

  const activeId = getActiveAccountId(cookieStore)
  if (activeId) {
    const match = accounts.find(a => a.igAccountId === activeId)
    if (match) return match
  }
  // Fall back to first account if active id not found
  return accounts[0]
}

// ── Write helpers ──────────────────────────────────────────────────────────

export function writeAccountsCookie(
  cookieStore: ReadonlyRequestCookies,
  payload: AccountsPayload
): void {
  ;(cookieStore as unknown as { set: (name: string, value: string, opts: object) => void }).set(
    ACCOUNTS_COOKIE,
    JSON.stringify(payload),
    ACCOUNTS_OPTS
  )
}

export function writeActiveAccountCookie(
  cookieStore: ReadonlyRequestCookies,
  igAccountId: string
): void {
  ;(cookieStore as unknown as { set: (name: string, value: string, opts: object) => void }).set(
    ACTIVE_COOKIE,
    JSON.stringify({ igAccountId }),
    ACTIVE_OPTS
  )
}

export function upsertAccount(
  cookieStore: ReadonlyRequestCookies,
  entry: AccountEntry
): { ok: true } | { ok: false; error: string } {
  const { accounts } = parseAccountsCookie(cookieStore)
  const existingIdx = accounts.findIndex(a => a.igAccountId === entry.igAccountId)

  if (existingIdx >= 0) {
    // Update existing — refresh token + expiry
    accounts[existingIdx] = { ...accounts[existingIdx], ...entry }
  } else {
    if (accounts.length >= 5) {
      return { ok: false, error: 'max_accounts' }
    }
    accounts.push(entry)
  }

  writeAccountsCookie(cookieStore, { accounts })
  writeActiveAccountCookie(cookieStore, entry.igAccountId)
  return { ok: true }
}

export function removeAccountFromCookie(
  cookieStore: ReadonlyRequestCookies,
  igAccountId: string
): number {
  const { accounts } = parseAccountsCookie(cookieStore)
  const remaining = accounts.filter(a => a.igAccountId !== igAccountId)

  if (remaining.length === 0) {
    clearAllAccountCookies(cookieStore)
    return 0
  }

  writeAccountsCookie(cookieStore, { accounts: remaining })

  // If the removed account was active, switch to the first remaining
  const activeId = getActiveAccountId(cookieStore)
  if (activeId === igAccountId) {
    writeActiveAccountCookie(cookieStore, remaining[0].igAccountId)
  }

  return remaining.length
}

export function clearAllAccountCookies(cookieStore: ReadonlyRequestCookies): void {
  const cs = cookieStore as unknown as { delete: (name: string) => void }
  cs.delete(ACCOUNTS_COOKIE)
  cs.delete(ACTIVE_COOKIE)
  // Also clean up the old single-account cookie if it exists
  cs.delete('instagram_session')
}

export function updateAccountToken(
  cookieStore: ReadonlyRequestCookies,
  igAccountId: string,
  accessToken: string,
  expiresAt: number
): void {
  const { accounts } = parseAccountsCookie(cookieStore)
  const idx = accounts.findIndex(a => a.igAccountId === igAccountId)
  if (idx >= 0) {
    accounts[idx] = { ...accounts[idx], accessToken, expiresAt }
    writeAccountsCookie(cookieStore, { accounts })
  }
}
