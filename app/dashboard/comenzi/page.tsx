"use client"
export const dynamic = "force-dynamic"

import { useState } from "react"
import { useOrders } from "@/hooks/useOrders"
import { createBrowserClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { ro } from "date-fns/locale"
import clsx from "clsx"

const STATUS_LABEL: Record<string, string> = {
  pending: "Așteptare", assigned: "Alocat", in_progress: "În curs",
  completed: "Finalizat", cancelled: "Anulat",
}
const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700", assigned: "bg-blue-50 text-blue-700",
  in_progress: "bg-[#E1F5EE] text-[#0F6E56]", completed: "bg-gray-100 text-gray-500",
  cancelled: "bg-red-50 text-red-600",
}

export default function ComenziPage() {
  const { orders, loading } = useOrders(50)
  const [filter, setFilter] = useState("all")

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter)

  async function updateStatus(id: string, status: string) {
    const supabase = createBrowserClient()
    await supabase.from("orders").update({ status }).eq("id", id)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium text-gray-900">Comenzi live</h1>
        <span className="text-sm text-gray-400">{filtered.length} comenzi</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {["all","pending","assigned","in_progress","completed","cancelled"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={clsx("px-3 py-1 rounded-full text-xs font-medium transition-colors",
              filter === s ? "bg-[#1D9E75] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            )}>
            {s === "all" ? "Toate" : STATUS_LABEL[s]}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading && <p className="p-4 text-sm text-gray-400">Se încarcă...</p>}
        {!loading && filtered.length === 0 && <p className="p-4 text-sm text-gray-400">Nicio comandă.</p>}
        {filtered.map(order => (
          <div key={order.id} className="flex items-start gap-4 p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50">
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{order.client?.full_name ?? "Client necunoscut"}</span>
                <span className="text-xs text-gray-400">{order.client?.phone ?? ""}</span>
              </div>
              <p className="text-xs text-gray-400 truncate">{order.pickup_address}{order.dropoff_address ? " → " + order.dropoff_address : ""}</p>
              {order.notes && <p className="text-xs text-gray-400 italic">{order.notes}</p>}
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <span className="text-sm font-medium text-gray-700">{order.price} lei</span>
              <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLOR[order.status])}>{STATUS_LABEL[order.status]}</span>
              <p className="text-xs text-gray-300">{format(new Date(order.created_at), "HH:mm", { locale: ro })}</p>
              {order.status === "pending" && <button onClick={() => updateStatus(order.id, "assigned")} className="text-xs text-[#1D9E75] hover:underline">Alocă manual</button>}
              {order.status === "in_progress" && <button onClick={() => updateStatus(order.id, "completed")} className="text-xs text-[#1D9E75] hover:underline">Marchează finalizat</button>}
              {(order.status === "pending" || order.status === "assigned") && <button onClick={() => updateStatus(order.id, "cancelled")} className="text-xs text-red-400 hover:underline">Anulează</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}