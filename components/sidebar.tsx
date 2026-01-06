"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Activity, BookOpen, FileText } from "lucide-react"

const menuItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Monitoring",
    href: "/monitoring",
    icon: Activity,
  },
  {
    label: "Olah Data",
    href: "/olah-data",
    icon: BookOpen,
  },
  {
    label: "Laporan",
    href: "/laporan",
    icon: FileText,
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-slate-800 text-slate-100 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-sm">📚</span>
          </div>
          <span className="text-xl font-bold text-white">SIAKKu</span>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6">
        <p className="text-xs font-semibold text-slate-400 uppercase px-2 mb-4">Menu</p>
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-700">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
