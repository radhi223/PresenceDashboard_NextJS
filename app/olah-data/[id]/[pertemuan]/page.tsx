"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/hooks/auth"
import { fetchPertemuanDetail, type PertemuanDetail, type StudentAttendance } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Loader2, Users, CheckCircle2, XCircle, Search, Edit, Plus } from "lucide-react"

export default function DetailPertemuanPage() {
  const params = useParams()
  const router = useRouter()
  const { token, loading: authLoading } = useAuth()
  
  const [data, setData] = useState<PertemuanDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const id = params?.id as string
  const pertemuan = params?.pertemuan as string

  useEffect(() => {
    if (authLoading) return
    if (!token) {
      router.push("/login")
      return
    }

    const loadData = async () => {
      try {
        setLoading(true)
        const result = await fetchPertemuanDetail(token, id, parseInt(pertemuan))
        setData(result)
      } catch (err: any) {
        setError(err.message || "Gagal memuat data pertemuan")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [token, authLoading, id, pertemuan, router])

  // Simple formatting for date
  const formattedDate = data?.tanggal 
    ? new Date(data.tanggal).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    : "-"

  // Filter & Pagination Logic
  const filteredStudents = data?.students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.nim.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage)

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-red-500">
          <h2 className="text-xl font-bold">Error</h2>
          <p>{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Kembali
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Beranda</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/olah-data">Mata Kuliah</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Detail Pertemuan</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detail Pertemuan</h1>
          <p className="text-muted-foreground mt-1">
            Mata Kuliah: {data?.matkul_name} - Pertemuan {data?.pertemuan} ({formattedDate})
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Mahasiswa</p>
                <h3 className="text-2xl font-bold">{data?.total_mahasiswa}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hadir</p>
                <h3 className="text-2xl font-bold">{data?.hadir}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tidak Hadir</p>
                <h3 className="text-2xl font-bold">{data?.tidak_hadir}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari mahasiswa..."
              className="pl-8 bg-white"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Tambah
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="border rounded-md bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">NO</TableHead>
                <TableHead>NAMA MAHASISWA</TableHead>
                <TableHead>NIM</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead className="text-right">WAKTU ABSEN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((student, index) => (
                  <TableRow key={student.id}>
                    <TableCell>{startIndex + index + 1}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.nim}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={
                          student.status === "Hadir" 
                            ? "bg-green-100 text-green-700 hover:bg-green-100" 
                            : "bg-red-100 text-red-700 hover:bg-red-100"
                        }
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                            student.status === "Hadir" ? "bg-green-600" : "bg-red-600"
                        }`} />
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">
                      {student.waktu_absen !== "-" ? student.waktu_absen : "-"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Tidak ada data mahasiswa.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredStudents.length)} dari {filteredStudents.length} mahasiswa
            </div>
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) setCurrentPage(p => p - 1)
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink 
                        href="#" 
                        isActive={currentPage === page}
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(page)
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) setCurrentPage(p => p + 1)
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
