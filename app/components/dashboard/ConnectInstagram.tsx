'use client'

interface ConnectInstagramProps {
  error?: string | null
}

const ERROR_MESSAGES: Record<string, string> = {
  no_instagram:
    'No Instagram Business or Creator account found connected to your Facebook Pages. Please link your Instagram account to a Facebook Page in Meta Business Suite.',
  no_pages:
    'No Facebook Pages found for your account. You need a Facebook Page connected to an Instagram Business/Creator account.',
  auth_failed: 'Authentication failed. Please try again.',
  auth_cancelled: 'Authentication was cancelled.',
}

export function ConnectInstagram({ error }: ConnectInstagramProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full">
        {/* Instagram gradient icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-xl">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg text-center">
          <h1 className="text-2xl font-bold text-card-foreground mb-2">Instagram Dashboard</h1>
          <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
            Connect your Instagram Business or Creator account to view your analytics, track performance, and get AI-powered reel suggestions.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm text-left">
              {ERROR_MESSAGES[error] || error}
            </div>
          )}

          <a
            href="/api/instagram/auth"
            className="block w-full py-3 px-6 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
          >
            Connect with Instagram
          </a>

          <div className="mt-8 space-y-3 text-left">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Requirements</p>
            {[
              'Instagram Business or Creator account',
              'Facebook Page connected to your Instagram',
              'Meta Developer app with Graph API access',
            ].map((req) => (
              <div key={req} className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center mt-0.5 shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{req}</span>
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Copy <code className="bg-muted px-1 py-0.5 rounded text-xs">.env.local.example</code> to <code className="bg-muted px-1 py-0.5 rounded text-xs">.env.local</code> and add your Meta App credentials.
          </p>
        </div>
      </div>
    </div>
  )
}
