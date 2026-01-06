"use client"
import { Clock, Users, Home } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

interface Subject {
  id: string
  name: string
  code: string
  class: string
  time: string
  status: "ongoing" | "upcoming"
  presentStudents?: number
  totalStudents?: number
}

const mockSubjects: Subject[] = [
  {
    id: "1",
    name: "System Cerdas",
    code: "301",
    class: "Kelas 301",
    time: "07:00 - 08:40",
    status: "ongoing",
    presentStudents: 24,
    totalStudents: 32,
  },
  {
    id: "2",
    name: "Computer Vision",
    code: "302",
    class: "Kelas 302",
    time: "10:00 - 12:30",
    status: "upcoming",
  },
]

export default function Dashboard() {
  const today = new Date().toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <DashboardLayout>
      {/* Breadcrumb */}
      <div className="px-8 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Home size={16} />
          <span>/</span>
          <span className="font-medium text-slate-900">Dashboard</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome, Dr. Rani Megasari, S.Kom., M.T.</h1>
          <p className="text-slate-500">Current Date: {today}</p>
        </div>

        {/* Your Subjects Section */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Subjects</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockSubjects.map((subject) => (
              <div
                key={subject.id}
                className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Subject Header */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900">{subject.name}</h3>
                  <p className="text-sm text-slate-500">Kelas {subject.code}</p>
                </div>

                {/* Time */}
                <div className="flex items-center gap-2 text-slate-900 font-semibold mb-4">
                  <Clock size={20} className="text-blue-600" />
                  <span>{subject.time}</span>
                </div>

                {/* Status */}
                <div className="border-t border-slate-200 pt-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Status</p>

                  {subject.status === "ongoing" ? (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-slate-700">Students Present</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Ongoing
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{
                            width: `${(subject.presentStudents! / subject.totalStudents!) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-right text-sm font-semibold text-slate-900 mt-2">
                        {subject.presentStudents}/{subject.totalStudents}
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-slate-400 py-6">
                      <Users size={20} />
                      <span className="text-sm font-medium">CLASS HAS NOT STARTED</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-slate-200 px-8 py-4 text-center">
        <p className="text-xs text-slate-500">© 2026 SIAK Universitas Pendidikan Indonesia. All rights reserved.</p>
      </div>
    </DashboardLayout>
  )
}
