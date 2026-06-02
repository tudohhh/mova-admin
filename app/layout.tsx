import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "MOVA Admin",
  description: "Platforma de management MOVA",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  )
}