export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px', fontFamily: 'system-ui, sans-serif', color: '#111827', lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 40 }}>Last updated: April 2025</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>What this app does</h2>
        <p style={{ color: '#374151' }}>
          This is a personal Instagram analytics dashboard. It connects to your Instagram Business or Creator account
          via the Meta (Facebook) API and displays your own content performance data — things like reach, views,
          saves, and follower growth. It does not post on your behalf, and it does not share your data with anyone.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>What data we access</h2>
        <p style={{ color: '#374151' }}>When you connect your Instagram account, we access:</p>
        <ul style={{ color: '#374151', paddingLeft: 20, marginTop: 8 }}>
          <li>Your Instagram profile (name, username, bio, profile picture, follower count)</li>
          <li>Your recent posts and reels (captions, media type, timestamps)</li>
          <li>Insights for your content (reach, views, saves, impressions)</li>
          <li>Your account-level insights (follower growth, profile visits)</li>
        </ul>
        <p style={{ color: '#374151', marginTop: 12 }}>
          We do <strong>not</strong> access your messages, contacts, or any data beyond what is needed to display your analytics.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>How we store your data</h2>
        <p style={{ color: '#374151' }}>
          Your Instagram access token is stored in an encrypted HTTP-only cookie on your browser. It is not saved
          to any external database or server. The cookie expires after 60 days, after which you'll need to reconnect.
          No one else can access your token.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Third-party services</h2>
        <p style={{ color: '#374151' }}>
          This app uses the <strong>Meta Graph API</strong> to retrieve your Instagram data. By connecting your account,
          you are also subject to <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer" style={{ color: '#8b5cf6' }}>Meta's Privacy Policy</a>.
          We do not use any advertising networks, analytics trackers, or other third-party services.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Your rights</h2>
        <p style={{ color: '#374151' }}>
          You can disconnect your Instagram account at any time using the "Disconnect" option in the dashboard.
          This immediately deletes your access token from the cookie. You can also revoke access directly from
          your <a href="https://www.instagram.com/accounts/manage_access/" target="_blank" rel="noopener noreferrer" style={{ color: '#8b5cf6' }}>Instagram settings</a>.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Contact</h2>
        <p style={{ color: '#374151' }}>
          This is a personal tool. If you have questions, you can reach out via Instagram.
        </p>
      </section>
    </div>
  )
}
