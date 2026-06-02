"use client"
import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"

export function useDrivers() {
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createBrowserClient()

    async function load() {
      const { data } = await supabase
        .from("drivers")
        .select("*, profile:profiles!profile_id(full_name, phone, email)")
        .order("status")
      setDrivers(data ?? [])
      setLoading(false)
    }

    load()
    const ch = supabase.channel("drivers")
      .on("postgres_changes", { event: "*", schema: "public", table: "drivers" }, load)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  return { drivers, loading }
}