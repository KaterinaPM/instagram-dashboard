"use client"

import { ManychatLogo } from "./ManychatLogo"

interface ConnectScreenProps {
  onConnect: () => void
}

export function ConnectScreen({ onConnect }: ConnectScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-br from-primary to-primary/80">
      <div className="text-center max-w-[480px] z-10">
        <div className="w-20 h-20 bg-card rounded-[20px] flex items-center justify-center mx-auto mb-8 shadow-xl">
          <ManychatLogo className="w-12 h-12" color="var(--primary)" />
        </div>

        <h1 className="text-[32px] font-bold text-primary-foreground mb-4 leading-tight">
          Welcome to Manychat AI
        </h1>

        <p className="text-lg text-primary-foreground/90 mb-12 leading-relaxed">
          Connect your Instagram to get started with AI-powered automation
        </p>

        <button
          onClick={onConnect}
          className="bg-card text-primary border-none px-8 py-4 rounded-xl font-semibold text-base cursor-pointer inline-flex items-center gap-3 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
            <circle cx="18" cy="6" r="1" fill="currentColor"/>
          </svg>
          Connect Instagram
        </button>
      </div>
    </div>
  )
}
