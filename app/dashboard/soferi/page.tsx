"use client"
export const dynamic = "force-dynamic"

import { useState } from "react"
import { useDrivers } from "@/hooks/useDrivers"
import { createBrowserClient } from "@/lib/supabase/client"
import clsx from "clsx"

const STATUS_LABEL: Record<string, string> = { online: "Liber", busy: "Ocupat", offline: "Offline" }
const STATUS_COLOR: Record<string, string> = {
  online: "bg-[#E1F5EE] text-[#0F6E56]", busy: "bg-amber-50 text-amber-700", offline: "bg-gray-100 text-gray-500",
}

export default function SoferiPage() {
  const { drivers, loading } = useDrivers()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", vehicle_model: "", vehicle_plate: "" })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    const supabase = createBrowserClient()
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: Math.random().toString(36).slice(-10) + "A1!",
      options: { data: { full_name: form.full_name } }
    })
    if (authError || !data.user) { setError(authError?.message ?? "Eroare"); setSaving(false); return }
    await supabase.from("profiles").update({ role: "driver", phone: form.phone }).eq("id", data.user.id)
    await supabase.from("drivers").insert({ profile_id: data.user.id, vehicle_model: form.vehicle_model, vehicle_plate: form.vehicle_plate })
    setForm({ full_name: "", email: "", phone: "", vehicle_model: "", vehicle_plate: "" })
    setAdding(false)
    setSaving(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium text-gray-900">Șoferi</h1>
        <button onClick={() => setAdding(!adding)} className="text-sm bg-[#1D9E75] text-white px-3 py-1.5 rounded-lg hover:bg-[#0F6E56] transition-colors">+ Adaugă șofer</button>
      </div>
      {adding && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <h2 className="text-sm font-medium text-gray-900">Șofer nou</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "full_name", label: "Nume complet", placeholder: "Ion Popescu" },
              { key: "email", label: "Email", placeholder: "ion@email.com" },
              { key: "phone", label: "Telefon", placeholder: "07xx xxx xxx" },
              { key: "vehicle_model", label: "Mașina", placeholder: "Dacia Logan" },
              { key: "vehicle_plate", label: "Număr înmatriculare", placeholder: "BT 01 XYZ" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                <input type={key === "email" ? "email" : "text"} value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" />
              </div>
            ))}
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="text-sm bg-[#1D9E75] text-white px-4 py-2 rounded-lg hover:bg-[#0F6E56] disabled:opacity-50 transition-colors">{saving ? "Se salvează..." : "Salvează"}</button>
            <button type="button" onClick={() => setAdding(false)} className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">Anulează</button>
          </div>
        </form>
      )}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading && <p className="p-4 text-sm text-gray-400">Se încarcă...</p>}
        {!loading && drivers.length === 0 && <p className="p-4 text-sm text-gray-400">Niciun șofer înregistrat.</p>}
        {drivers.map(driver => (
          <div key={driver.id} className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50">
            <div className="w-9 h-9 rounded-full bg-[#E1F5EE] flex items-center justify-center text-sm font-medium text-[#0F6E56] flex-shrink-0">
              {(driver.profile?.full_name ?? "?")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{driver.profile?.full_name ?? "Șofer"}</p>
              <p className="text-xs text-gray-400">{driver.profile?.phone ?? ""}{driver.vehicle_model ? ` · ${driver.vehicle_model}` : ""}{driver.vehicle_plate ? ` · ${driver.vehicle_plate}` : ""}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLOR[driver.status])}>{STATUS_LABEL[driver.status]}</span>
              <p className="text-xs text-gray-400">★ {Number(driver.rating).toFixed(1)} · {driver.total_orders} curse</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}