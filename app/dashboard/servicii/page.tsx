"use client"
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import clsx from "clsx"

export default function ServiciiPage() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createBrowserClient()
    async function load() {
      const { data } = await supabase.from("services").select("*").order("name")
      setServices(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function toggleActive(id: string, active: boolean) {
    setSaving(id)
    const supabase = createBrowserClient()
    await supabase.from("services").update({ active: !active }).eq("id", id)
    setServices(s => s.map(x => x.id === id ? { ...x, active: !active } : x))
    setSaving(null)
  }

  async function updatePrice(id: string, field: string, value: string) {
    const supabase = createBrowserClient()
    await supabase.from("services").update({ [field]: Number(value) }).eq("id", id)
    setServices(s => s.map(x => x.id === id ? { ...x, [field]: Number(value) } : x))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-lg font-medium text-gray-900">Servicii & Prețuri</h1>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading && <p className="p-4 text-sm text-gray-400">Se încarcă...</p>}
        {services.map(service => (
          <div key={service.id} className="p-4 border-b border-gray-50 last:border-0">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-gray-900">{service.name}</p>
                <p className="text-xs text-gray-400">{service.description}</p>
              </div>
              <button
                onClick={() => toggleActive(service.id, service.active)}
                disabled={saving === service.id}
                className={clsx(
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                  service.active ? "bg-[#E1F5EE] text-[#0F6E56]" : "bg-gray-100 text-gray-400"
                )}
              >
                {service.active ? "Activ" : "Inactiv"}
              </button>
            </div>
            <div className="flex gap-4 mt-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Preț bază (lei)</label>
                <input
                  type="number" defaultValue={service.base_price}
                  onBlur={e => updatePrice(service.id, "base_price", e.target.value)}
                  className="w-24 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
                />
              </div>
              {service.price_per_km !== null && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Preț/km (lei)</label>
                  <input
                    type="number" defaultValue={service.price_per_km}
                    onBlur={e => updatePrice(service.id, "price_per_km", e.target.value)}
                    className="w-24 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}