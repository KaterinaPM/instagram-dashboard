export default function TermsOfService() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px', fontFamily: 'system-ui, sans-serif', color: '#111827', lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Terms of Service</h1>
      <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 40 }}>Last updated: April 2025</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>About this app</h2>
        <p style={{ color: '#374151' }}>
          This is a personal Instagram analytics tool that lets you view performance data for your own Instagram
          Business or Creator account. By connecting your account, you agree to these terms.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Use of the service</h2>
        <ul style={{ color: '#374151', paddingLeft: 20 }}>
          <li>This tool is for personal use to view your own Instagram analytics.</li>
          <li>You must own or have authorised access to any Instagram account you connect.</li>
          <li>You may not use this tool to access another person's account without their permission.</li>
          <li>You are responsible for keeping your login session secure.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Data accuracy</h2>
        <p style={{ color: '#374151' }}>
          All analytics data is retrieved directly from the Meta Graph API and displayed as-is. We do not
          modify, estimate, or guarantee the accuracy of any metrics. Discrepancies between this dashboard
          and the Instagram app may occur due to API delays or metric definitions (e.g. "reach" vs "views").
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>No warranties</h2>
        <p style={{ color: '#374151' }}>
          This tool is provided "as is" without any warranties. We are not responsible for any decisions
          made based on the data shown, or for any interruption in service caused by changes to the Meta API.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Meta platform policy</h2>
        <p style={{ color: '#374151' }}>
          Use of this app is also subject to <a href="https://developers.facebook.com/terms/" target="_blank" rel="noopener noreferrer" style={{ color: '#8b5cf6' }}>Meta's Platform Terms</a> and
          the <a href="https://developers.facebook.com/devpolicy/" target="_blank" rel="noopener noreferrer" style={{ color: '#8b5cf6' }}>Meta Platform Developer Policies</a>,
          since the app accesses Instagram data through the Meta Graph API.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Changes</h2>
        <p style={{ color: '#374151' }}>
          These terms may be updated from time to time. Continued use of the app after changes constitutes acceptance.
        </p>
      </section>
    </div>
  )
}
