"use client"

import { Bell, Settings } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Left Side - Empty for balance */}
        <div></div>

        {/* Right Side - User Info */}
        <div className="flex items-center gap-6">
          {/* Notifications */}
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell size={20} className="text-slate-600" />
          </button>

          {/* Settings */}
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Settings size={20} className="text-slate-600" />
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">Dr. Rani Megasari</p>
              <p className="text-xs text-slate-500">Dosen</p>
            </div>
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              RM
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
