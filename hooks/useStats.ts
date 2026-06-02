"use client"
import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"

export function useStats() {
  const [stats, setStats] = useState({
    orders_today: 0, revenue_today: 0,
    drivers_online: 0, drivers_busy: 0,
    avg_time_minutes: 18, loading: true,
  })

  useEffect(() => {
    const supabase = createBrowserClient()

    async function load() {
      const today = new Date().toISOString().split("T")[0]
      const [o, r, d] = await Promise.all([
        supabase.from("orders").select("id", { count: "exact" }).gte("created_at", today),
        supabase.from("orders").select("price").gte("created_at", today).eq("status", "completed"),
        supabase.from("drivers").select("status"),
      ])
      setStats({
        orders_today: o.count ?? 0,
        revenue_today: r.data?.reduce((s, x) => s + Number(x.price), 0) ?? 0,
        drivers_online: d.data?.filter(x => x.status === "online").length ?? 0,
        drivers_busy: d.data?.filter(x => x.status === "busy").length ?? 0,
        avg_time_minutes: 18,
        loading: false,
      })
    }

    load()
    const ch = supabase.channel("stats")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "drivers" }, load)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  return stats
}