"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Clock, Users, Home, Loader2, AlertCircle } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/hooks/auth"
import type { Matkul } from "@/lib/api"

type SubjectStatus = "ongoing" | "upcoming" | "completed"

interface SubjectCardData {
  id: string
  name: string
  classLabel: string
  time: string
  status: SubjectStatus
  presentStudents?: number
  totalStudents?: number
  meetingNumber?: number
  meetingDate?: string
}

function formatDateHuman(date: Date) {
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function getSubjectData(matkul: Matkul): SubjectCardData {
  const today = new Date()
  const todayKey = today.toISOString().slice(0, 10)

  const sortedPertemuan = (matkul.pertemuan_list || []).slice().sort((a, b) =>
    a.tanggal.localeCompare(b.tanggal)
  )

  const pertemuanToday = sortedPertemuan.find((pertemuan) =>
    pertemuan.tanggal.slice(0, 10) === todayKey
  )

  const upcomingPertemuan = sortedPertemuan.find((pertemuan) =>
    pertemuan.tanggal.slice(0, 10) > todayKey
  )

  const fallbackPertemuan = sortedPertemuan[sortedPertemuan.length - 1]
  const targetPertemuan = pertemuanToday || upcomingPertemuan || fallbackPertemuan

  let status: SubjectStatus = "upcoming"
  if (targetPertemuan?.status === "Sedang Berlangsung") {
    status = "ongoing"
  } else if (targetPertemuan?.status === "Selesai") {
    status = "completed"
  }

  const classLabel = matkul.class_info?.no_kelas
    ? `Kelas ${matkul.class_info.no_kelas}`
    : matkul.class_info?.gedung
    ? matkul.class_info.gedung
    : "Kelas Belum Ditentukan"

  return {
    id: matkul._id,
    name: matkul.nama_matkul,
    classLabel,
    time: `${matkul.jam_awal} - ${matkul.jam_akhir}`,
    status,
    presentStudents: targetPertemuan?.present_count,
    totalStudents: targetPertemuan?.total_enrolled,
    meetingNumber: targetPertemuan?.pertemuan,
    meetingDate: targetPertemuan?.tanggal
      ? formatDateHuman(new Date(targetPertemuan.tanggal))
      : undefined,
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  ? process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "")
  : "http://localhost:8000"

export default function Dashboard() {
  const router = useRouter()
  const { user, token, loading, isAuthenticated } = useAuth()
  const [matkulList, setMatkulList] = useState<Matkul[]>([])
  const [loadingMatkul, setLoadingMatkul] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect unauthenticated user
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [loading, isAuthenticated, router])

  // Fetch Matkul data
  useEffect(() => {
    let isMounted = true

    const loadMatkul = async () => {
      if (!token) {
        if (isMounted) setLoadingMatkul(false)
        return
      }
      try {
        if (isMounted) {
          setLoadingMatkul(true)
          setError(null)
        }

        const response = await fetch(`${API_BASE_URL}/matkul/`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login")
            return
          }
          const errorText = await response.text()
          throw new Error(errorText || "Gagal memuat data mata kuliah")
        }

        const data: Matkul[] = await response.json()
        if (isMounted) setMatkulList(data)
      } catch (err: any) {
        if (isMounted) setError(err.message || "Gagal memuat data mata kuliah")
      } finally {
        if (isMounted) setLoadingMatkul(false)
      }
    }

    loadMatkul()
    return () => {
      isMounted = false
    }
  }, [token, router])

  const subjects = useMemo<SubjectCardData[]>(() => {
    return matkulList.map(getSubjectData).sort((a, b) => {
      const order: Record<SubjectStatus, number> = {
        ongoing: 0,
        upcoming: 1,
        completed: 2,
      }
      return order[a.status] - order[b.status]
    })
  }, [matkulList])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Memuat sesi Anda...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const todayLabel = formatDateHuman(new Date())

  return (
    <DashboardLayout>
      <div className="px-8 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Home size={16} />
          <span>/</span>
          <span className="font-medium text-slate-900">Dashboard</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Selamat datang, {user?.nama || "Dosen"}
          </h1>
          <p className="text-slate-500">Tanggal hari ini: {todayLabel}</p>
        </div>

        <div>
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Mata Kuliah Anda</h2>
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {loadingMatkul ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-slate-500" />
            </div>
          ) : subjects.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500">
              Tidak ada mata kuliah yang terdaftar untuk akun ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-900">{subject.name}</h3>
                    <p className="text-sm text-slate-500">{subject.classLabel}</p>
                  </div>

                  <div className="flex items-center gap-2 text-slate-900 font-semibold mb-4">
                    <Clock size={20} className="text-blue-600" />
                    <span>{subject.time}</span>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Mahasiswa yang Hadir</p>
                    {subject.status === "upcoming" ? (
                      <div className="text-sm font-medium text-slate-700">KELAS BELUM DIMULAI</div>
                    ) : (
                      <div className="text-sm font-semibold text-slate-900">{subject.presentStudents || 0}/{subject.totalStudents || 0} hadir</div>
                    )}
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Status</p>

                    {subject.meetingNumber != null ? (
                      <div className="mb-2">
                        <div className="text-sm text-slate-600">Pertemuan ke-{subject.meetingNumber}</div>
                        {subject.meetingDate ? (
                          <div className="text-xs text-slate-500 mt-1">{subject.meetingDate}</div>
                        ) : null}
                      </div>
                    ) : null}

                    {subject.status === "ongoing" ? (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-slate-700">Sedang berlangsung</span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Live
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{
                              width: subject.presentStudents && subject.totalStudents
                                ? `${Math.min(
                                    100,
                                    (subject.presentStudents / subject.totalStudents) * 100
                                  )}%`
                                : "0%",
                            }}
                          />
                        </div>
                      </>
                    ) : subject.status === "completed" ? (
                      <div className="text-sm text-slate-600 flex items-center justify-between flex-wrap gap-2">
                        <span>Pertemuan terakhir sudah selesai.</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-700">
                          Selesai
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-slate-400 py-6">
                        <Users size={20} />
                        <span className="text-sm font-medium">Menunggu waktu mulai</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border-t border-slate-200 px-8 py-4 text-center">
        <p className="text-xs text-slate-500">© 2026 SIAK Universitas Pendidikan Indonesia. All rights reserved.</p>
      </div>
    </DashboardLayout>
  )
}
