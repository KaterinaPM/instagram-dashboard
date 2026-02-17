"use client"

import { ManychatLogo } from "./ManychatLogo"

interface ConnectScreenProps {
  onConnect: () => void
}

export function ConnectScreen({ onConnect }: ConnectScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-br from-[#667eea] to-[#764ba2]">
      <div className="text-center max-w-[480px] z-10">
        <div className="w-20 h-20 bg-white rounded-[20px] flex items-center justify-center mx-auto mb-8 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
          <ManychatLogo className="w-12 h-12" color="#667eea" />
        </div>

        <h1 className="text-[32px] font-bold text-white mb-4 leading-tight">
          Welcome to Manychat AI
        </h1>

        <p className="text-lg text-white/90 mb-12 leading-relaxed">
          Connect your Instagram to get started with AI-powered automation
        </p>

        <button
          onClick={onConnect}
          className="bg-white text-[#667eea] border-none px-8 py-4 rounded-xl font-semibold text-base cursor-pointer inline-flex items-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_30px_rgba(0,0,0,0.2)] active:translate-y-0"
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
