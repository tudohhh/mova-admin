"use client"
import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"

export function useOrders(limit = 20) {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createBrowserClient()

    async function load() {
      const { data } = await supabase
        .from("orders")
        .select("*, client:profiles!client_id(full_name, phone)")
        .order("created_at", { ascending: false })
        .limit(limit)
      setOrders(data ?? [])
      setLoading(false)
    }

    load()
    const ch = supabase.channel("orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [limit])

  return { orders, loading }
}