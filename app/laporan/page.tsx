"use client"

import { useState } from "react"
import { TrendingUp, Home, ChevronDown } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface DetailRiwayat {
  pertemuan: string
  tanggal: string
  kehadiran: string
}

const trendData = [
  { month: "Mg 1", attendance: 65 },
  { month: "Mg 4", attendance: 72 },
  { month: "Mg 8", attendance: 78 },
  { month: "Mg 12", attendance: 85 },
  { month: "Mg 14", attendance: 88 },
]

const distributionData = [
  { range: "<50%", students: 2 },
  { range: "50-70%", students: 5 },
  { range: "70-90%", students: 8 },
  { range: ">90%", students: 10 },
]

const detailData: DetailRiwayat[] = [
  { pertemuan: "Pertemuan 1", tanggal: "02 Jan 2026", kehadiran: "15/42" },
  { pertemuan: "Pertemuan 2", tanggal: "09 Jan 2026", kehadiran: "14/42" },
  { pertemuan: "Pertemuan 3", tanggal: "16 Jan 2026", kehadiran: "12/42" },
]

const pieData = [
  { name: "Hadir", value: 85, color: "#2563EB" },
  { name: "Tidak Hadir", value: 15, color: "#E5E7EB" },
]

export default function Laporan() {
  const [selectedStudent, setSelectedStudent] = useState("Budi Santoso (TI-2021)")
  const [selectedCourse, setSelectedCourse] = useState("System Cerdas")

  return (
    <DashboardLayout>
      {/* Breadcrumb */}
      <div className="px-6 md:px-8 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Home size={16} />
          <span>/</span>
          <span className="font-medium text-slate-900">Laporan</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="flex items-end justify-end gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Mata Kuliah</label>
            <button className="w-full md:w-64 flex items-center justify-between px-3 py-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors">
              <span className="text-sm text-slate-700">{selectedCourse}</span>
              <ChevronDown size={16} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          {/* Trend Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Tren Kehadiran Kelas</h3>
                <p className="text-xs text-slate-500 mt-1">Rata-rata kehadiran per minggu</p>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded">
                <TrendingUp size={16} className="text-green-600" />
                <span className="text-sm font-semibold text-green-600">+2.4%</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" style={{ fontSize: "12px" }} />
                <YAxis stroke="#94A3B8" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="#2563EB"
                  dot={{ fill: "#2563EB", r: 4 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Distribution Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-2">Distribusi Kehadiran</h3>
            <p className="text-xs text-slate-500 mb-4">Jumlah siswa berdasarkan persentase</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="range" stroke="#94A3B8" style={{ fontSize: "12px" }} />
                <YAxis stroke="#94A3B8" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="students" fill="#60A5FA" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Percentage Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-2">Persentase Kehadiran</h3>
            <p className="text-xs text-slate-500 mb-4">Pilih mahasiswa untuk melihat detail</p>

            {/* Dropdown */}
            <div className="mb-6">
              <button className="w-full flex items-center justify-between px-3 py-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors">
                <span className="text-sm text-slate-700">{selectedStudent}</span>
                <ChevronDown size={16} className="text-slate-400" />
              </button>
            </div>

            {/* Circular Progress */}
            <div className="flex justify-center items-center">
              <div className="relative w-32 md:w-48 h-32 md:h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                  {/* Background circle */}
                  <circle cx="100" cy="100" r="90" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                  {/* Progress circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="8"
                    strokeDasharray={`${(85 / 100) * 565.48} 565.48`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl md:text-4xl font-bold text-slate-900">85%</span>
                  <span className="text-xs text-slate-500 uppercase mt-1">Kehadiran</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center mt-6 text-xs">
              <div className="flex items-center gap-2 justify-center">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <span className="text-slate-700 font-medium">Hadir</span>
                <span className="text-slate-500">12 Pertemuan</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                <span className="text-slate-700 font-medium">Tidak Hadir</span>
                <span className="text-slate-500">2 Pertemuan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Table */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6 shadow-sm overflow-hidden">
          <h3 className="text-base font-bold text-slate-900 mb-6">Detail Riwayat Pertemuan</h3>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-3 md:px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Pertemuan
                  </th>
                  <th className="text-left px-3 md:px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Tanggal
                  </th>
                  <th className="text-right px-3 md:px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Kehadiran
                  </th>
                </tr>
              </thead>
              <tbody>
                {detailData.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-3 md:px-4 py-3 text-sm text-slate-900 font-medium">{row.pertemuan}</td>
                    <td className="px-3 md:px-4 py-3 text-sm text-slate-600">{row.tanggal}</td>
                    <td className="text-right px-3 md:px-4 py-3 text-sm text-slate-900 font-semibold">
                      {row.kehadiran}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-slate-200 px-6 md:px-8 py-4 text-center">
        <p className="text-xs text-slate-500">© 2026 SIAK Universitas Pendidikan Indonesia. All rights reserved.</p>
      </div>
    </DashboardLayout>
  )
}
