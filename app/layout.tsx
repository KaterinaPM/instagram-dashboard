import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Instagram Dashboard",
  description: "Instagram analytics dashboard",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
