"use client"
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import clsx from "clsx"

const ZILE = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"]

export default function RapoartePage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createBrowserClient()
    async function load() {
      const today = new Date()
      const day7 = new Date(today)
      day7.setDate(day7.getDate() - 6)

      const [ordersRes, driversRes, clientsRes] = await Promise.all([
        supabase.from("orders").select("price, status, created_at").gte("created_at", day7.toISOString()),
        supabase.from("drivers").select("status, total_orders, earnings_today"),
        supabase.from("profiles").select("id", { count: "exact" }).eq("role", "client"),
      ])

      const orders = ordersRes.data ?? []
      const drivers = driversRes.data ?? []

      const completed = orders.filter(o => o.status === "completed")
      const revenue = completed.reduce((s, o) => s + Number(o.price), 0)

      // Comenzi pe zile
      const byDay: Record<string, number> = {}
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        byDay[d.toISOString().split("T")[0]] = 0
      }
      orders.forEach(o => {
        const day = o.created_at.split("T")[0]
        if (byDay[day] !== undefined) byDay[day]++
      })

      setStats({
        total_orders: orders.length,
        completed: completed.length,
        revenue,
        avg: completed.length ? (revenue / completed.length).toFixed(0) : 0,
        drivers_total: drivers.length,
        drivers_online: drivers.filter(d => d.status !== "offline").length,
        clients_total: clientsRes.count ?? 0,
        byDay: Object.entries(byDay).map(([date, count], i) => ({
          label: ZILE[new Date(date).getDay() === 0 ? 6 : new Date(date).getDay() - 1],
          count,
          date,
        })),
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="max-w-5xl mx-auto"><p className="text-sm text-gray-400">Se încarcă...</p></div>

  const maxCount = Math.max(...(stats?.byDay.map((d: any) => d.count) ?? [1]), 1)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-lg font-medium text-gray-900">Rapoarte</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Comenzi 7 zile", value: stats.total_orders },
          { label: "Finalizate", value: stats.completed },
          { label: "Venituri 7 zile", value: stats.revenue.toLocaleString("ro") + " lei" },
          { label: "Valoare medie", value: stats.avg + " lei" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-medium text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h2 className="text-sm font-medium text-gray-900 mb-4">Comenzi ultimele 7 zile</h2>
        <div className="flex items-end gap-2 h-32">
          {stats.byDay.map((d: any) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">{d.count || ""}</span>
              <div
                className="w-full bg-[#1D9E75] rounded-t-md transition-all"
                style={{ height: `${Math.max((d.count / maxCount) * 100, d.count ? 8 : 2)}%`, opacity: d.count ? 1 : 0.15 }}
              />
              <span className="text-xs text-gray-400">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {[
          { label: "Total șoferi", value: stats.drivers_total, sub: `${stats.drivers_online} activi azi` },
          { label: "Total clienți", value: stats.clients_total, sub: "înregistrați" },
          { label: "Rată finalizare", value: stats.total_orders ? Math.round((stats.completed / stats.total_orders) * 100) + "%" : "—", sub: "din total comenzi" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-medium text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}