"use client"

import { useState } from "react"
import { Day0Flow } from "./Day0Flow"
import { HomeTab } from "./HomeTab"

export function AppContainer() {
  const [view, setView] = useState<'home' | 'chat'>('chat')

  const handleStartChat = () => {
    setView('chat')
  }

  const handleExitChat = () => {
    setView('home')
  }

  if (view === 'home') {
    return <HomeTab onStartChat={handleStartChat} />
  }

  return <Day0Flow onExit={handleExitChat} />
}
