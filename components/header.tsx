"use client"

import { Bell, Settings } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/auth"

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()

  // Get initials from user name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

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
              <p className="text-sm font-semibold text-slate-900">
                {user?.nama || "User"}
              </p>
              <p className="text-xs text-slate-500">
                {user?.jabatan || "Dosen"}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              {user?.nama ? getInitials(user.nama) : "U"}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
