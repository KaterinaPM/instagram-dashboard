"use client"

import { ManychatLogo } from "./ManychatLogo"

interface HomeTabProps {
  onStartChat: () => void
}

export function HomeTab({ onStartChat }: HomeTabProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {/* Phone Mockup Container */}
      <div className="h-[760px] w-[380px] bg-muted rounded-[48px] p-3 shadow-2xl">
        <div className="bg-card rounded-[36px] h-full flex flex-col relative overflow-hidden">

          {/* Phone Header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
            <ManychatLogo className="w-10 h-10" color="var(--primary)" />
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-card-foreground font-semibold text-sm">Manychat AI</span>
                <div className="w-1.5 h-1.5 bg-chart-1 rounded-full"></div>
              </div>
              <div className="text-muted-foreground text-xs">Ready to help</div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex items-center justify-center">
            <div className="text-center">
              <ManychatLogo className="w-16 h-16 mx-auto mb-6" color="var(--primary)" />
              <h2 className="text-card-foreground text-xl font-semibold mb-2">Welcome to Manychat AI</h2>
              <p className="text-muted-foreground text-sm mb-6 px-8">
                Your AI assistant is ready to help you automate conversations and grow your business
              </p>
              <button
                onClick={onStartChat}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Start Chat
              </button>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="border-t border-border px-4 py-3">
            <div className="flex items-center justify-around">
              <button className="flex flex-col items-center gap-1 text-primary">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
                <span className="text-xs font-medium">Home</span>
              </button>

              <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-card-foreground transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span className="text-xs font-medium">Inbox</span>
              </button>

              <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-card-foreground transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                </svg>
                <span className="text-xs font-medium">Assistant</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
