"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/hooks/auth"
import { fetchPertemuanDetail, updateManualAttendance, type PertemuanDetail, type StudentAttendance } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Loader2, Users, CheckCircle2, XCircle, Save, X, AlertCircle } from "lucide-react"

interface EditableStudent extends StudentAttendance {
    isPresent: boolean
    editedTime: string // Just HH:MM:SS format
}

// Helper to extract time from ISO timestamp (converts to local time)
function extractTimeFromISO(isoString: string): string {
    if (!isoString || isoString === "-") return ""
    try {
        if (isoString.includes("T")) {
            const date = new Date(isoString)
            // Get local time components
            const hours = date.getHours().toString().padStart(2, '0')
            const minutes = date.getMinutes().toString().padStart(2, '0')
            const seconds = date.getSeconds().toString().padStart(2, '0')
            return `${hours}:${minutes}:${seconds}`
        }
        return isoString
    } catch {
        return ""
    }
}

// Helper to create ISO timestamp from date and time (Local -> UTC)
function createISOTimestamp(dateStr: string, timeStr: string): string {
    if (!dateStr || !timeStr) return ""
    try {
        const [year, month, day] = dateStr.split("-").map(Number)
        const [hours, minutes, seconds] = timeStr.split(":").map(Number)
        
        // Create date in local timezone
        const date = new Date(year, month - 1, day, hours, minutes, seconds || 0)
        
        // Return ISO string (UTC)
        return date.toISOString()
    } catch {
        return ""
    }
}

export default function EditPertemuanPage() {
    const params = useParams()
    const router = useRouter()
    const { token, loading: authLoading } = useAuth()

    const [data, setData] = useState<PertemuanDetail | null>(null)
    const [students, setStudents] = useState<EditableStudent[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [validationError, setValidationError] = useState("")
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

                // Initialize editable students - extract time from ISO timestamp
                const editableStudents: EditableStudent[] = result.students.map(student => ({
                    ...student,
                    isPresent: student.status === "Hadir",
                    editedTime: extractTimeFromISO(student.waktu_absen)
                }))
                setStudents(editableStudents)
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

    // Pagination Logic
    const totalPages = Math.ceil(students.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedStudents = students.slice(startIndex, startIndex + itemsPerPage)

    // Handle checkbox change
    const handleCheckboxChange = (studentId: string, checked: boolean) => {
        setValidationError("")
        setStudents(prev => prev.map(s =>
            s.id === studentId
                ? { ...s, isPresent: checked }
                : s
        ))
    }

    // Handle time change
    const handleTimeChange = (studentId: string, time: string) => {
        setValidationError("")
        setStudents(prev => prev.map(s =>
            s.id === studentId
                ? { ...s, editedTime: time }
                : s
        ))
    }

    // Validate before save
    const validate = (): boolean => {
        const invalidStudents = students.filter(s => s.isPresent && !s.editedTime.trim())
        if (invalidStudents.length > 0) {
            const names = invalidStudents.map(s => s.name).join(", ")
            setValidationError(`Mahasiswa berikut harus memiliki waktu absen: ${names}`)
            return false
        }
        return true
    }

    // Handle save
    const handleSave = async () => {
        if (!token || !data) return

        // Optional: Run validation if we want to enforce time entry
        // if (!validate()) return

        try {
            setSaving(true)
            setValidationError("")

            const promises = students.map(s => {
                let timestamp: string | undefined = undefined
                // If student is present and has time, construct timestamp
                if (s.isPresent && s.editedTime && data.tanggal) {
                    const datePart = data.tanggal.includes("T") ? data.tanggal.split("T")[0] : data.tanggal
                    timestamp = createISOTimestamp(datePart, s.editedTime)
                }

                return updateManualAttendance(token, {
                    matkul_id: id,
                    pertemuan: parseInt(pertemuan),
                    student_id: s.id,
                    status: s.isPresent,
                    timestamp: timestamp
                })
            })

            await Promise.all(promises)

            // Navigate back to detail page
            router.push(`/olah-data/${id}/${pertemuan}`)
        } catch (err: any) {
            setValidationError(err.message || "Gagal menyimpan data")
        } finally {
            setSaving(false)
        }
    }

    // Count present students
    const presentCount = students.filter(s => s.isPresent).length

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
                            <BreadcrumbLink href={`/olah-data/${id}/${pertemuan}`}>Detail Pertemuan</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Edit Kehadiran</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Header */}
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">Edit Kehadiran</h1>
                        {data?.is_rescheduled && (
                            <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700 font-semibold">
                                Reschedule
                            </Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Mata Kuliah: {data?.matkul_name}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-slate-600">
                        <span className="font-medium">Pertemuan {data?.pertemuan}</span>
                        <span>•</span>
                        <span>{formattedDate}</span>
                        {data?.jam_awal && data?.jam_akhir && (
                            <>
                                <span>•</span>
                                <span>{data.jam_awal} - {data.jam_akhir}</span>
                            </>
                        )}
                    </div>
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
                                <h3 className="text-2xl font-bold">{students.length}</h3>
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
                                <h3 className="text-2xl font-bold">{presentCount}</h3>
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
                                <h3 className="text-2xl font-bold">{students.length - presentCount}</h3>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Validation Error */}
                {validationError && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm">{validationError}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/olah-data/${id}/${pertemuan}`)}
                        disabled={saving}
                    >
                        <X className="w-4 h-4 mr-2" />
                        Batal
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Simpan
                    </Button>
                </div>

                {/* Data Table */}
                <div className="border rounded-md bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">HADIR</TableHead>
                                <TableHead className="w-[50px]">NO</TableHead>
                                <TableHead>NAMA MAHASISWA</TableHead>
                                <TableHead>NIM</TableHead>
                                <TableHead className="text-right">WAKTU ABSEN</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedStudents.length > 0 ? (
                                paginatedStudents.map((student, index) => (
                                    <TableRow key={student.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={student.isPresent}
                                                onCheckedChange={(checked) => handleCheckboxChange(student.id, checked as boolean)}
                                            />
                                        </TableCell>
                                        <TableCell>{startIndex + index + 1}</TableCell>
                                        <TableCell className="font-medium">{student.name}</TableCell>
                                        <TableCell>{student.nim}</TableCell>
                                        <TableCell className="text-right">
                                            <Input
                                                type="time"
                                                step="1"
                                                className="w-32 ml-auto text-right font-mono text-sm"
                                                value={student.editedTime}
                                                onChange={(e) => handleTimeChange(student.id, e.target.value)}
                                                disabled={!student.isPresent}
                                            />
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
                            Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, students.length)} dari {students.length} mahasiswa
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
