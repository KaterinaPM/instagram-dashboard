'use client'

import { useState, useRef, useEffect } from 'react'

export interface AccountMeta {
  igAccountId: string
  username: string
  name: string
  profilePictureUrl: string
  expiresAt: number
  addedAt: number
}

interface AccountSwitcherProps {
  accounts: AccountMeta[]
  activeAccountId: string
  onSwitch: (igAccountId: string) => void
  onAddAccount: () => void
  onLogout: (igAccountId?: string) => void
}

function Avatar({ account, size = 28 }: { account: AccountMeta; size?: number }) {
  if (account.profilePictureUrl) {
    return (
      <img
        src={account.profilePictureUrl}
        alt={account.username}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    )
  }
  const colors = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b']
  const color = colors[account.username.charCodeAt(0) % colors.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: size * 0.4, fontWeight: 700, flexShrink: 0,
    }}>
      {account.username[0]?.toUpperCase()}
    </div>
  )
}

function daysLeft(expiresAt: number) {
  const days = Math.floor((expiresAt - Date.now()) / (1000 * 60 * 60 * 24))
  return days
}

export function AccountSwitcher({ accounts, activeAccountId, onSwitch, onAddAccount, onLogout }: AccountSwitcherProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const activeAccount = accounts.find(a => a.igAccountId === activeAccountId) ?? accounts[0]

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!activeAccount) return null

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 6px',
          border: '1px solid #e5e7eb', borderRadius: 24, background: '#fff',
          cursor: 'pointer', transition: 'border-color 0.15s',
        }}
        onMouseOver={e => (e.currentTarget.style.borderColor = '#d1d5db')}
        onMouseOut={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
      >
        <Avatar account={activeAccount} size={26} />
        <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>@{activeAccount.username}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: '#9ca3af', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 240,
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 100, overflow: 'hidden',
        }}>
          {/* Account list */}
          <div style={{ padding: '6px 6px 0' }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '6px 8px 4px' }}>
              Connected accounts
            </p>
            {accounts.map(acc => {
              const isActive = acc.igAccountId === activeAccountId
              const days = daysLeft(acc.expiresAt)
              return (
                <button
                  key={acc.igAccountId}
                  onClick={() => { if (!isActive) { onSwitch(acc.igAccountId); setOpen(false) } }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 10, border: 'none', cursor: isActive ? 'default' : 'pointer',
                    background: isActive ? '#f5f3ff' : 'transparent', textAlign: 'left', transition: 'background 0.15s',
                  }}
                  onMouseOver={e => { if (!isActive) e.currentTarget.style.background = '#f9fafb' }}
                  onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ position: 'relative' }}>
                    <Avatar account={acc} size={32} />
                    {isActive && (
                      <div style={{
                        position: 'absolute', bottom: -1, right: -1,
                        width: 10, height: 10, borderRadius: '50%',
                        background: '#10b981', border: '2px solid #fff',
                      }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      @{acc.username}
                    </div>
                    <div style={{ fontSize: 11, color: days < 7 ? '#ef4444' : '#9ca3af' }}>
                      {days < 0 ? 'Session expired' : `${days}d left`}
                    </div>
                  </div>
                  {isActive && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7l3.5 3.5L12 3" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: '#f3f4f6', margin: '6px 0' }} />

          {/* Add account */}
          <div style={{ padding: '0 6px 6px' }}>
            {accounts.length < 5 && (
              <button
                onClick={() => { onAddAccount(); setOpen(false) }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: 'transparent', textAlign: 'left', transition: 'background 0.15s',
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#f9fafb')}
                onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 18, fontWeight: 300 }}>+</div>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Add account</span>
              </button>
            )}

            {/* Disconnect active */}
            <button
              onClick={() => { onLogout(activeAccount.igAccountId); setOpen(false) }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'transparent', textAlign: 'left', transition: 'background 0.15s',
              }}
              onMouseOver={e => (e.currentTarget.style.background = '#fef2f2')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#ef4444' }}>Disconnect @{activeAccount.username}</span>
            </button>

            {/* Disconnect all (if more than one) */}
            {accounts.length > 1 && (
              <button
                onClick={() => { onLogout(); setOpen(false) }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: 'transparent', textAlign: 'left', transition: 'background 0.15s',
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#fef2f2')}
                onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: 32, height: 32 }} />
                <span style={{ fontSize: 12, color: '#9ca3af' }}>Disconnect all accounts</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
