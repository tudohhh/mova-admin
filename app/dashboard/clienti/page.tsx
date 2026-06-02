"use client"
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import clsx from "clsx"

export default function ClientiPage() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const supabase = createBrowserClient()
    async function load() {
      const { data } = await supabase
        .from("profiles")
        .select("*, orders:orders(count)")
        .eq("role", "client")
        .order("created_at", { ascending: false })
      setClients(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = clients.filter(c =>
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium text-gray-900">Clienți</h1>
        <span className="text-sm text-gray-400">{filtered.length} clienți</span>
      </div>

      <input
        type="text" value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Caută după nume, email sau telefon..."
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
      />

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading && <p className="p-4 text-sm text-gray-400">Se încarcă...</p>}
        {!loading && filtered.length === 0 && <p className="p-4 text-sm text-gray-400">Niciun client găsit.</p>}
        {filtered.map(client => (
          <div key={client.id} className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
            <div className="w-9 h-9 rounded-full bg-[#E1F5EE] flex items-center justify-center text-sm font-medium text-[#0F6E56] flex-shrink-0">
              {(client.full_name ?? "?")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{client.full_name || "Fără nume"}</p>
              <p className="text-xs text-gray-400">{client.email}{client.phone ? " · " + client.phone : ""}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">
                {new Date(client.created_at).toLocaleDateString("ro")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}