"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Home, AlertCircle, CalendarDays, Layers } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/hooks/auth"
import type { Matkul } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ReportState {
  totalAttendance: number
  attendees: {
    name: string
    category: string
    timestamp?: string
  }[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  ? process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "")
  : "http://localhost:8000"

export default function Laporan() {
  const router = useRouter()
  const { token, loading, isAuthenticated } = useAuth()
  const [matkulList, setMatkulList] = useState<Matkul[]>([])
  const [selectedMatkulId, setSelectedMatkulId] = useState<string>("")
  const [selectedPertemuan, setSelectedPertemuan] = useState<number | null>(null)
  const [loadingMatkul, setLoadingMatkul] = useState(true)
  const [loadingReport, setLoadingReport] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reportError, setReportError] = useState<string | null>(null)
  const [report, setReport] = useState<ReportState | null>(null)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [loading, isAuthenticated, router])

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
          throw new Error(errorText || "Gagal memuat daftar mata kuliah")
        }

        const data: Matkul[] = await response.json()
        if (isMounted) {
          setMatkulList(data)
          if (data.length > 0) {
            setSelectedMatkulId(data[0]._id)
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || "Gagal memuat daftar mata kuliah")
      } finally {
        if (isMounted) setLoadingMatkul(false)
      }
    }

    loadMatkul()
    return () => {
      isMounted = false
    }
  }, [token, router])

  const selectedMatkul = useMemo(() => {
    return matkulList.find((matkul) => matkul._id === selectedMatkulId) || null
  }, [matkulList, selectedMatkulId])

  useEffect(() => {
    if (!selectedMatkul) {
      setSelectedPertemuan(null)
      return
    }

    const existing = selectedMatkul.pertemuan_list?.find(
      (item) => item.pertemuan === selectedPertemuan
    )
    if (!existing) {
      const defaultPertemuan = selectedMatkul.pertemuan_list?.find(
        (item) => item.status === "Sedang Berlangsung"
      ) || selectedMatkul.pertemuan_list?.[0]
      setSelectedPertemuan(defaultPertemuan ? defaultPertemuan.pertemuan : null)
    }
  }, [selectedMatkul])

  useEffect(() => {
    const loadReport = async () => {
      if (!token || !selectedMatkul || selectedPertemuan === null) {
        setReport(null)
        return
      }

      const pertemuanInfo = selectedMatkul.pertemuan_list?.find(
        (item) => item.pertemuan === selectedPertemuan
      )

      if (!pertemuanInfo) {
        setReport(null)
        return
      }

      try {
        setLoadingReport(true)
        setReportError(null)
        const meetingDate = pertemuanInfo.tanggal.slice(0, 10)
        const query = new URLSearchParams({
          course_name: selectedMatkul.nama_matkul,
          meeting_date: meetingDate,
        })

        const response = await fetch(`${API_BASE_URL}/attendance/report/by-schedule?${query.toString()}`, {
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
          throw new Error(errorText || "Gagal memuat laporan presensi")
        }

        const data = await response.json()
        setReport({
          totalAttendance: data.total_attendance,
          attendees: data.attendees.map((attendee: { full_name: string; category: string; timestamp?: string }) => ({
            name: attendee.full_name,
            category: attendee.category,
            timestamp: attendee.timestamp,
          })),
        })
      } catch (err: any) {
        setReport(null)
        setReportError(err.message || "Gagal memuat laporan presensi")
      } finally {
        setLoadingReport(false)
      }
    }

    loadReport()
  }, [token, selectedMatkul, selectedPertemuan, router])

  if (loading) {
    return null
  }

  if (!isAuthenticated) {
    return null
  }

  const pertemuanList = selectedMatkul?.pertemuan_list || []
  const activePertemuan = pertemuanList.find((item) => item.pertemuan === selectedPertemuan)
  const totalEnrolled = activePertemuan?.total_enrolled || 0
  const hadir = report?.totalAttendance || 0
  const tidakHadir = Math.max(0, totalEnrolled - hadir)
  const attendanceRate = totalEnrolled > 0 ? Math.round((hadir / totalEnrolled) * 100) : 0

  return (
    <DashboardLayout>
      <div className="px-6 md:px-8 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Home size={16} />
          <span>/</span>
          <span className="font-medium text-slate-900">Laporan</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end gap-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Mata Kuliah</label>
            <Select
              value={selectedMatkulId}
              onValueChange={(value) => {
                setSelectedMatkulId(value)
                setSelectedPertemuan(null)
              }}
              disabled={loadingMatkul || matkulList.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih mata kuliah" />
              </SelectTrigger>
              <SelectContent>
                {matkulList.map((matkul) => (
                  <SelectItem key={matkul._id} value={matkul._id}>
                    {matkul.nama_matkul}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Pertemuan</label>
            <Select
              value={selectedPertemuan?.toString() || ""}
              onValueChange={(value) => setSelectedPertemuan(Number(value))}
              disabled={!selectedMatkul || pertemuanList.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih pertemuan" />
              </SelectTrigger>
              <SelectContent>
                {pertemuanList.map((pertemuan) => (
                  <SelectItem key={pertemuan.pertemuan} value={pertemuan.pertemuan.toString()}>
                    Pertemuan {pertemuan.pertemuan} • {new Date(pertemuan.tanggal).toLocaleDateString("id-ID")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-slate-500 uppercase tracking-wide">Total Kehadiran</CardTitle>
            </CardHeader>
            <CardContent className="text-4xl font-bold text-slate-900">
              {loadingReport ? "-" : hadir}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-slate-500 uppercase tracking-wide">Terdaftar</CardTitle>
            </CardHeader>
            <CardContent className="text-4xl font-bold text-slate-900">
              {totalEnrolled}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-slate-500 uppercase tracking-wide">Persentase</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900">{attendanceRate}%</div>
              <p className="text-sm text-slate-500 mt-2">
                {hadir} hadir • {tidakHadir} belum hadir
              </p>
            </CardContent>
          </Card>
        </div>

        {reportError && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span>{reportError}</span>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-slate-500" />
              Detail Kehadiran Pertemuan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingReport ? (
              <div className="text-center py-10 text-slate-500">Memuat laporan...</div>
            ) : !report || report.attendees.length === 0 ? (
              <div className="text-center py-10 text-slate-400">Belum ada data kehadiran untuk pertemuan ini.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase">
                      <th className="py-3 pr-4 font-semibold">Nama</th>
                      <th className="py-3 pr-4 font-semibold">Kategori</th>
                      <th className="py-3 font-semibold text-right">Waktu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.attendees.map((attendee, idx) => (
                      <tr key={`${attendee.name}-${idx}`} className="border-b border-slate-100">
                        <td className="py-3 pr-4 text-sm font-medium text-slate-900">{attendee.name}</td>
                        <td className="py-3 pr-4 text-sm text-slate-600 flex items-center gap-2">
                          <Layers className="h-4 w-4 text-slate-400" />
                          {attendee.category}
                        </td>
                        <td className="py-3 text-sm text-slate-600 text-right">
                          {attendee.timestamp
                            ? new Date(attendee.timestamp).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="bg-white border-t border-slate-200 px-6 md:px-8 py-4 text-center">
        <p className="text-xs text-slate-500">© 2026 SIAK Universitas Pendidikan Indonesia. All rights reserved.</p>
      </div>
    </DashboardLayout>
  )
}
