"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Home, AlertCircle, CalendarDays, TrendingUp } from "lucide-react"
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

interface TrendPoint {
  month: string
  attendance: number
}

interface DistributionPoint {
  range: string
  students: number
}

interface StudentSummary {
  user_id: string
  name: string
  attendance_percent: number
  attended_sessions: number
  total_sessions: number
}

interface MatkulComparison {
  matkul_id: string
  nama_matkul: string
  attendance_count: number
  total_enrolled: number
  attendance_percent: number
}

interface HistoryRow {
  pertemuan: string
  tanggal: string
  kehadiran: string
}

interface ReportSummary {
  trend: TrendPoint[]
  distribution: DistributionPoint[]
  students: StudentSummary[]
  pertemuan_history: HistoryRow[]
  default_student_id?: string | null
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  ? process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "")
  : "http://localhost:8000"

export default function Laporan() {
  const router = useRouter()
  const { token, loading, isAuthenticated } = useAuth()
  const [matkulList, setMatkulList] = useState<Matkul[]>([])
  const [selectedMatkulId, setSelectedMatkulId] = useState<string>("")
  const [loadingMatkul, setLoadingMatkul] = useState(true)
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [comparisonData, setComparisonData] = useState<MatkulComparison[]>([])
  const [loadingComparison, setLoadingComparison] = useState(true)
  const [comparisonError, setComparisonError] = useState<string | null>(null)

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

  useEffect(() => {
    const loadSummary = async () => {
      if (!token || !selectedMatkulId) {
        setSummary(null)
        return
      }

      try {
        setLoadingSummary(true)
        setSummaryError(null)

        const response = await fetch(`${API_BASE_URL}/matkul/${selectedMatkulId}/report-summary`, {
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
          throw new Error(errorText || "Gagal memuat ringkasan laporan")
        }

        const data: ReportSummary = await response.json()
        setSummary(data)
        const defaultStudent = data.default_student_id || data.students?.[0]?.user_id || ""
        setSelectedStudentId(defaultStudent)
      } catch (err: any) {
        setSummary(null)
        setSummaryError(err.message || "Gagal memuat ringkasan laporan")
      } finally {
        setLoadingSummary(false)
      }
    }

    loadSummary()
  }, [token, selectedMatkulId, router])

  useEffect(() => {
    const loadComparison = async () => {
      if (!token) {
        setComparisonData([])
        setLoadingComparison(false)
        return
      }

      try {
        setLoadingComparison(true)
        setComparisonError(null)

        const response = await fetch(`${API_BASE_URL}/matkul/attendance-distribution`, {
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
          throw new Error(errorText || "Gagal memuat distribusi kehadiran")
        }

        const data: MatkulComparison[] = await response.json()
        setComparisonData(data)
      } catch (err: any) {
        setComparisonData([])
        setComparisonError(err.message || "Gagal memuat distribusi kehadiran")
      } finally {
        setLoadingComparison(false)
      }
    }

    loadComparison()
  }, [token, router])

  const selectedMatkul = useMemo(() => matkulList.find((m) => m._id === selectedMatkulId) || null, [matkulList, selectedMatkulId])
  const trendData = summary?.trend?.length ? summary.trend : [{ month: "Mg 1", attendance: 0 }]
  const selectedStudent = summary?.students?.find((student) => student.user_id === selectedStudentId) || summary?.students?.[0] || null
  const attendancePercent = selectedStudent?.attendance_percent || 0
  const circumference = 2 * Math.PI * 90
  const dashArray = `${(attendancePercent / 100) * circumference} ${circumference}`
  const historyRows = summary?.pertemuan_history || []
  const trendDelta = useMemo(() => {
    if (!summary?.trend || summary.trend.length < 2) return null
    const first = summary.trend[0].attendance
    const last = summary.trend[summary.trend.length - 1].attendance
    return Number((last - first).toFixed(1))
  }, [summary])
  const comparisonChartData = useMemo(() => {
    if (comparisonData.length === 0) {
      return [
        { matkul: "Belum ada data", hadir: 0, total: 0, percentage: 0 },
      ]
    }
    return comparisonData.map((item) => ({
      matkul: item.nama_matkul,
      hadir: item.attendance_count,
      total: item.total_enrolled,
      percentage: item.attendance_percent,
    }))
  }, [comparisonData])

  if (loading || !isAuthenticated) {
    return null
  }

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
        <div className="flex justify-end w-full">
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Mata Kuliah</label>
            <Select
              value={selectedMatkulId}
              onValueChange={(value) => setSelectedMatkulId(value)}
              disabled={loadingMatkul || matkulList.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih mata kuliah" />
              </SelectTrigger>
              <SelectContent align="end">
                {matkulList.map((matkul) => (
                  <SelectItem key={matkul._id} value={matkul._id}>
                    {matkul.nama_matkul}
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
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <p className="text-xs uppercase text-slate-500 tracking-wide">Tren Kehadiran Kelas</p>
                <h3 className="text-lg font-bold text-slate-900">Rata-rata kehadiran per minggu</h3>
              </div>
              {trendDelta !== null && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded ${trendDelta >= 0 ? "bg-green-50 text-green-600" : "bg-rose-50 text-rose-600"}`}>
                  <TrendingUp size={16} />
                  <span className="text-sm font-semibold">{trendDelta > 0 ? "+" : ""}{trendDelta}%</span>
                </div>
              )}
            </CardHeader>
            <CardContent className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#94A3B8" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#94A3B8" style={{ fontSize: "12px" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="attendance" stroke="#2563EB" dot={{ fill: "#2563EB", r: 4 }} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-xs uppercase text-slate-500 tracking-wide">Perbandingan Kehadiran</p>
              <h3 className="text-lg font-bold text-slate-900">Jumlah hadir antar mata kuliah</h3>
            </CardHeader>
            <CardContent className="h-[220px]">
              {loadingComparison ? (
                <div className="flex items-center justify-center h-full text-sm text-slate-500">Memuat data perbandingan...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="matkul" stroke="#94A3B8" style={{ fontSize: "12px" }} />
                    <YAxis stroke="#94A3B8" style={{ fontSize: "12px" }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: "8px" }}
                      formatter={(value: any, _name, props) => {
                        const total = props?.payload?.total ?? 0
                        return [`${value}/${total} hadir`, "Mahasiswa"]
                      }}
                    />
                    <Bar dataKey="hadir" fill="#60A5FA" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase text-slate-500 tracking-wide">Persentase Kehadiran</p>
                  <h3 className="text-lg font-bold text-slate-900">Pilih mahasiswa untuk melihat detail</h3>
                </div>
                <div className="min-w-[160px]">
                  <Select
                    value={selectedStudentId}
                    onValueChange={setSelectedStudentId}
                    disabled={!summary || summary.students.length === 0}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Pilih mahasiswa" />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {summary?.students?.map((student) => (
                        <SelectItem key={student.user_id} value={student.user_id}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="90" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="10"
                    strokeDasharray={dashArray}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-slate-900">{attendancePercent}%</span>
                  <span className="text-xs text-slate-500 uppercase mt-1">Kehadiran</span>
                </div>
              </div>
              {selectedStudent ? (
                <div className="text-center text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">{selectedStudent.name}</p>
                  <p>{selectedStudent.attended_sessions}/{selectedStudent.total_sessions} pertemuan hadir</p>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Belum ada data mahasiswa.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {summaryError && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span>{summaryError}</span>
          </div>
        )}

        {comparisonError && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span>{comparisonError}</span>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-slate-500" />
              Detail Riwayat Pertemuan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSummary ? (
              <div className="text-center py-10 text-slate-500">Memuat laporan...</div>
            ) : historyRows.length === 0 ? (
              <div className="text-center py-10 text-slate-400">Belum ada data pertemuan untuk mata kuliah ini.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase">
                      <th className="px-3 md:px-4 py-3 font-semibold">Pertemuan</th>
                      <th className="px-3 md:px-4 py-3 font-semibold">Tanggal</th>
                      <th className="px-3 md:px-4 py-3 font-semibold text-right">Kehadiran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyRows.map((row, idx) => (
                      <tr key={`${row.pertemuan}-${idx}`} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-3 md:px-4 py-3 text-sm font-medium text-slate-900">{row.pertemuan}</td>
                        <td className="px-3 md:px-4 py-3 text-sm text-slate-600">
                          {row.tanggal ? new Date(row.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                        </td>
                        <td className="px-3 md:px-4 py-3 text-sm font-semibold text-right text-slate-900">{row.kehadiran}</td>
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
