"use client"
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { createBrowserClient } from "@/lib/supabase/client"
import { LayoutDashboard, ListChecks, Car, Users, BarChart2, Tag, Settings, LogOut, Menu, X } from "lucide-react"
import clsx from "clsx"

const nav = [
  { href: "/dashboard",          label: "Overview",           icon: LayoutDashboard },
  { href: "/dashboard/comenzi",  label: "Comenzi live",       icon: ListChecks },
  { href: "/dashboard/soferi",   label: "Șoferi",             icon: Car },
  { href: "/dashboard/clienti",  label: "Clienți",            icon: Users },
  { href: "/dashboard/rapoarte", label: "Rapoarte",           icon: BarChart2 },
  { href: "/dashboard/servicii", label: "Servicii & prețuri", icon: Tag },
  { href: "/dashboard/setari",   label: "Setări",             icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push("/login")
    })
  }, [])

  async function handleLogout() {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full w-52 bg-white border-r border-gray-100 py-4">
      <div className="px-4 pb-4 border-b border-gray-100 mb-2">
        <span className="text-xl font-semibold">MO<span className="text-[#1D9E75]">VA</span></span>
        <p className="text-xs text-gray-400 mt-0.5">Admin</p>
      </div>
      <nav className="flex-1 px-2 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} onClick={() => setOpen(false)}
            className={clsx("flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
              pathname === href ? "bg-[#E1F5EE] text-[#0F6E56] font-medium" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            )}>
            <Icon size={16} />{label}
          </Link>
        ))}
      </nav>
      <div className="px-2 pt-2 border-t border-gray-100">
        <button onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 w-full transition-colors">
          <LogOut size={16} />Ieși din cont
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="hidden md:flex flex-shrink-0"><Sidebar /></div>
      {open && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="flex flex-col flex-shrink-0 shadow-xl"><Sidebar /></div>
          <div className="flex-1 bg-black/30" onClick={() => setOpen(false)} />
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
          <span className="text-lg font-semibold">MO<span className="text-[#1D9E75]">VA</span></span>
          <button onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}