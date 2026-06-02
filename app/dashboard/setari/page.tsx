"use client"
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"

export default function SetariPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ full_name: "", phone: "" })
  const [pwForm, setPwForm] = useState({ current: "", new: "", confirm: "" })
  const [pwError, setPwError] = useState("")
  const [pwSaved, setPwSaved] = useState(false)

  useEffect(() => {
    const supabase = createBrowserClient()
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setProfile(data)
      setForm({ full_name: data?.full_name ?? "", phone: data?.phone ?? "" })
      setLoading(false)
    }
    load()
  }, [])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from("profiles").update({ full_name: form.full_name, phone: form.phone }).eq("id", user!.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwError("")
    if (pwForm.new !== pwForm.confirm) { setPwError("Parolele nu coincid"); return }
    if (pwForm.new.length < 6) { setPwError("Parola trebuie să aibă minim 6 caractere"); return }
    const supabase = createBrowserClient()
    const { error } = await supabase.auth.updateUser({ password: pwForm.new })
    if (error) { setPwError(error.message); return }
    setPwForm({ current: "", new: "", confirm: "" })
    setPwSaved(true)
    setTimeout(() => setPwSaved(false), 2000)
  }

  if (loading) return <div className="max-w-2xl mx-auto"><p className="text-sm text-gray-400">Se încarcă...</p></div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-lg font-medium text-gray-900">Setări</h1>

      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
        <h2 className="text-sm font-medium text-gray-900">Profil</h2>
        <form onSubmit={saveProfile} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Nume complet</label>
            <input type="text" value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Telefon</label>
            <input type="text" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Email</label>
            <input type="email" value={profile?.email ?? ""} disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400" />
          </div>
          <button type="submit" disabled={saving}
            className="bg-[#1D9E75] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0F6E56] disabled:opacity-50 transition-colors">
            {saved ? "✓ Salvat" : saving ? "Se salvează..." : "Salvează"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
        <h2 className="text-sm font-medium text-gray-900">Schimbă parola</h2>
        <form onSubmit={savePassword} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Parolă nouă</label>
            <input type="password" value={pwForm.new}
              onChange={e => setPwForm(f => ({ ...f, new: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Confirmă parola nouă</label>
            <input type="password" value={pwForm.confirm}
              onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" />
          </div>
          {pwError && <p className="text-xs text-red-500">{pwError}</p>}
          <button type="submit"
            className="bg-[#1D9E75] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0F6E56] transition-colors">
            {pwSaved ? "✓ Parolă schimbată" : "Schimbă parola"}
          </button>
        </form>
      </div>
    </div>
  )
}