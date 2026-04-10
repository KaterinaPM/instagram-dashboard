'use client'

interface IGProfile {
  name: string; username: string; biography: string
  followers_count: number; follows_count: number; media_count: number
  profile_picture_url: string; website: string
}

function fmtCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function ProfileHeader({ profile, onLogout }: { profile: IGProfile | null; onLogout: () => void }) {
  if (!profile) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      {/* Avatar */}
      <div style={{ width: 60, height: 60, borderRadius: '50%', padding: 2, background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', flexShrink: 0 }}>
        <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#fff' }}>
          {profile.profile_picture_url
            ? <img src={profile.profile_picture_url} alt={profile.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#8b5cf6', background: '#f5f3ff' }}>{profile.username?.[0]?.toUpperCase()}</div>
          }
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{profile.name || profile.username}</span>
          {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#8b5cf6', textDecoration: 'none' }}>{profile.website.replace(/^https?:\/\//, '')}</a>}
        </div>
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>@{profile.username}</div>
        {profile.biography && <div style={{ fontSize: 13, color: '#374151', marginTop: 6, lineHeight: 1.5 }}>{profile.biography}</div>}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 32 }}>
        {[['Followers', profile.followers_count], ['Following', profile.follows_count], ['Posts', profile.media_count]].map(([label, val]) => (
          <div key={label as string} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{fmtCount(val as number)}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <button onClick={onLogout} style={{ fontSize: 12, color: '#9ca3af', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 12px', background: 'none', cursor: 'pointer', flexShrink: 0 }}>
        Disconnect
      </button>
    </div>
  )
}
