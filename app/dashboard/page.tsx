"use client"
export const dynamic = "force-dynamic"

import { useStats } from "@/hooks/useStats"
import { useOrders } from "@/hooks/useOrders"
import { useDrivers } from "@/hooks/useDrivers"
import { format } from "date-fns"
import { ro } from "date-fns/locale"
import clsx from "clsx"

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  assigned: "bg-blue-50 text-blue-700",
  in_progress: "bg-[#E1F5EE] text-[#0F6E56]",
  completed: "bg-gray-100 text-gray-500",
  cancelled: "bg-red-50 text-red-600",
}
const STATUS_LABEL: Record<string, string> = {
  pending: "Așteptare", assigned: "Alocat", in_progress: "În curs",
  completed: "Finalizat", cancelled: "Anulat",
}
const DRIVER_DOT: Record<string, string> = {
  online: "bg-[#1D9E75]", busy: "bg-amber-400", offline: "bg-gray-300",
}

export default function DashboardPage() {
  const stats = useStats()
  const { orders } = useOrders(6)
  const { drivers } = useDrivers()

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-lg font-medium text-gray-900">Overview</h1>
        <p className="text-sm text-gray-400">{format(new Date(), "EEEE, d MMMM yyyy", { locale: ro })}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Comenzi azi", value: stats.loading ? "—" : String(stats.orders_today), sub: "în timp real" },
          { label: "Venituri azi", value: stats.loading ? "—" : stats.revenue_today.toLocaleString("ro") + " lei", sub: "doar finalizate" },
          { label: "Șoferi online", value: stats.loading ? "—" : `${stats.drivers_online + stats.drivers_busy} / ${drivers.length}`, sub: `${stats.drivers_busy} ocupați`, subColor: "text-amber-500" },
          { label: "Timp mediu", value: stats.avg_time_minutes + " min", sub: "per comandă", subColor: "text-gray-400" },
        ].map(({ label, value, sub, subColor = "text-[#1D9E75]" }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-medium text-gray-900">{value}</p>
            {sub && <p className={clsx("text-xs mt-1", subColor)}>{sub}</p>}
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h2 className="text-sm font-medium text-gray-900 mb-3">Comenzi recente</h2>
          <div className="space-y-2">
            {orders.length === 0 && <p className="text-sm text-gray-400">Nicio comandă încă.</p>}
            {orders.map(order => (
              <div key={order.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{order.client?.full_name ?? "Client necunoscut"}</p>
                  <p className="text-xs text-gray-400 truncate">{order.pickup_address}</p>
                </div>
                <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLOR[order.status])}>{STATUS_LABEL[order.status]}</span>
                <span className="text-sm font-medium text-gray-700">{order.price} lei</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h2 className="text-sm font-medium text-gray-900 mb-3">Șoferi</h2>
          <div className="space-y-2">
            {drivers.length === 0 && <p className="text-sm text-gray-400">Niciun șofer înregistrat.</p>}
            {drivers.map(driver => (
              <div key={driver.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className={clsx("w-2 h-2 rounded-full flex-shrink-0", DRIVER_DOT[driver.status])} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{driver.profile?.full_name ?? "Șofer"}</p>
                  <p className="text-xs text-gray-400">{driver.status === "online" ? "Liber" : driver.status === "busy" ? "Ocupat" : "Offline"}{driver.vehicle_model ? " · " + driver.vehicle_model : ""}</p>
                </div>
                <span className="text-xs text-gray-500">★ {Number(driver.rating).toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}