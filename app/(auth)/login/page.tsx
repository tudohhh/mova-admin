"use client"
export const dynamic = "force-dynamic"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const supabase = createBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError("Email sau parolă incorectă")
      setLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">MO<span className="text-[#1D9E75]">VA</span></h1>
          <p className="text-sm text-gray-400 mt-1">Admin Dashboard</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
              placeholder="admin@mova.ro" required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Parolă</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
              placeholder="••••••••" required
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full bg-[#1D9E75] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#0F6E56] disabled:opacity-50 transition-colors"
          >
            {loading ? "Se încarcă..." : "Intră în cont"}
          </button>
        </form>
      </div>
    </div>
  )
}