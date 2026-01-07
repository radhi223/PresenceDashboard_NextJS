"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Home, BookOpen, Clock, ChevronDown, ChevronUp } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/hooks/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Pertemuan {
  pertemuan: number
  tanggal: string
  status: "Selesai" | "Sedang Berlangsung" | "Belum Dimulai"
  present_count: number
  total_enrolled: number
  attendance_ratio: string
  is_rescheduled?: boolean
}

interface Matkul {
  _id: string
  nama_matkul: string
  sks: number
  account_id: string
  class_id: string
  hari: string
  jam_awal: string
  jam_akhir: string
  tanggal_awal: string
  pertemuan_list: Pertemuan[]
  class_info?: {
    _id: string
    no_kelas?: string
    gedung?: string
    fakultas?: string
  }
}

export default function OlahDataPage() {
  const router = useRouter()
  const { user, token, loading, isAuthenticated, logout } = useAuth()
  const [matkulList, setMatkulList] = useState<Matkul[]>([])
  const [loadingMatkul, setLoadingMatkul] = useState(true)
  const [error, setError] = useState("")
  const [expandedMatkul, setExpandedMatkul] = useState<string | null>(null)

  // Fetch Matkul data
  useEffect(() => {
    const fetchMatkul = async () => {
      if (!token) {
        console.log("No token available, skipping fetch")
        setLoadingMatkul(false)
        return
      }

      try {
        setLoadingMatkul(true)
        setError("")
        
        console.log("Fetching matkul with token:", token ? "Token exists" : "No token")
        
        // First test if the server is reachable
        const testResponse = await fetch("http://localhost:8000/matkul/test")
        if (!testResponse.ok) {
          throw new Error("FastAPI server is not reachable. Make sure it's running on port 8000.")
        }
        
        const response = await fetch("http://localhost:8000/matkul/", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        })

        console.log("Response status:", response.status)
        console.log("Response ok:", response.ok)

        if (!response.ok) {
          const errorText = await response.text()
          console.log("Error response:", errorText)
          
          // Handle 401 Unauthorized (expired token)
          if (response.status === 401) {
            console.log("Token expired, redirecting to login")
            logout() // Clear stored credentials
            router.push("/login")
            return
          }
          
          throw new Error(`Failed to fetch matkul data: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        console.log("Matkul data received:", data)
        setMatkulList(data)
      } catch (err: any) {
        const errorMessage = err.message || "Failed to load mata kuliah"
        setError(errorMessage)
        console.error("Error fetching matkul:", err)
      } finally {
        setLoadingMatkul(false)
      }
    }

    fetchMatkul()
  }, [token])

  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [loading, isAuthenticated, router])

  const toggleMatkulExpansion = (matkulId: string) => {
    setExpandedMatkul(expandedMatkul === matkulId ? null : matkulId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Selesai":
        return "bg-green-100 text-green-800 border-green-200"
      case "Sedang Berlangsung":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Belum Dimulai":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  // Handle not authenticated
  if (!isAuthenticated) {
    return null // Will redirect via useEffect
  }

  return (
    <DashboardLayout>
      {/* Breadcrumb */}
      <div className="px-8 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Home size={16} />
          <span>/</span>
          <span className="font-medium text-slate-900">Olah Data</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Olah Data Presensi</h1>
          <p className="text-slate-600">
            Kelola data presensi mahasiswa untuk mata kuliah yang Anda ampu
          </p>
        </div>

        {/* Loading State */}
        {loadingMatkul && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
              <p className="text-slate-600">Memuat mata kuliah...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 font-medium">Error: {error}</p>
          </div>
        )}

        {/* Matkul List */}
        {!loadingMatkul && !error && (
          <>
            {matkulList.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Tidak ada mata kuliah
                </h3>
                <p className="text-slate-500">
                  Anda belum memiliki mata kuliah yang terdaftar dalam sistem.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matkulList.map((matkul) => (
                  <Card key={matkul._id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-bold text-slate-900">
                        {matkul.nama_matkul}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                          {matkul.sks} SKS
                        </span>
                        <span>{matkul.hari}</span>
                        {matkul.class_info?.no_kelas && (
                          <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full font-medium">
                            Kelas {matkul.class_info.no_kelas}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Schedule */}
                      <div className="flex items-center gap-2 text-slate-700">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-medium">
                          {matkul.jam_awal} - {matkul.jam_akhir}
                        </span>
                      </div>

                      {/* Lihat Pertemuan Button */}
                      <Button
                        onClick={() => toggleMatkulExpansion(matkul._id)}
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 h-10 text-sm font-medium border-slate-200 hover:bg-slate-50"
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>Lihat Pertemuan</span>
                        {expandedMatkul === matkul._id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>

                      {/* Start Date */}
                      <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                        Dimulai: {new Date(matkul.tanggal_awal).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>

                      {/* Pertemuan List (Expandable) */}
                      {expandedMatkul === matkul._id && matkul.pertemuan_list && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <h4 className="text-sm font-semibold text-slate-900 mb-3">
                            Daftar Pertemuan ({matkul.pertemuan_list.length})
                          </h4>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {matkul.pertemuan_list.map((pertemuan) => (
                              <div
                                key={pertemuan.pertemuan}
                                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                onClick={() => {
                                  router.push(`/olah-data/${matkul._id}/${pertemuan.pertemuan}`)
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-medium text-slate-900">
                                    Pertemuan {pertemuan.pertemuan}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {new Date(pertemuan.tanggal).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {/* Attendance Info */}
                                  {pertemuan.status === "Selesai" && (
                                    <span className="text-xs text-slate-600 bg-slate-200 px-2 py-1 rounded font-medium">
                                      {pertemuan.attendance_ratio}
                                    </span>
                                  )}
                                  {pertemuan.status === "Sedang Berlangsung" && (
                                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded font-medium">
                                      Live: {pertemuan.attendance_ratio}
                                    </span>
                                  )}
                                  {pertemuan.status === "Belum Dimulai" && pertemuan.total_enrolled > 0 && (
                                    <span className="text-xs text-slate-400 px-2 py-1 rounded font-medium">
                                      0/{pertemuan.total_enrolled}
                                    </span>
                                  )}
                                  {/* Status Badge */}
                                  <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-1">
                                      {pertemuan.is_rescheduled && (
                                        <Badge variant="outline" className="h-5 text-[10px] px-1.5 border-orange-200 bg-orange-50 text-orange-700 font-bold whitespace-nowrap">
                                          Reschedule
                                        </Badge>
                                      )}
                                      <span className={`text-xs px-2 py-1 rounded-full border font-medium whitespace-nowrap ${getStatusColor(pertemuan.status)}`}>
                                        {pertemuan.status}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-slate-200 px-8 py-4 text-center">
        <p className="text-xs text-slate-500">
          © 2026 SIAK Universitas Pendidikan Indonesia. All rights reserved.
        </p>
      </div>
    </DashboardLayout>
  )
}