"use client"

import { useState } from "react"
import { ConnectScreen } from "./components/ConnectScreen"
import { LoadingScreen } from "./components/LoadingScreen"

export default function Home() {
  const [showLoading, setShowLoading] = useState(false)

  const handleConnect = () => {
    setShowLoading(true)
  }

  return (
    <>
      {!showLoading && <ConnectScreen onConnect={handleConnect} />}
      {showLoading && <LoadingScreen />}
    </>
  )
}
