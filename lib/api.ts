const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000";

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const target = path.startsWith("http")
    ? path
    : `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(target, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = await response.json();
      if (body?.detail) {
        message = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
      }
    } catch (_err) {
      // ignore body parse errors and fall back to status text
    }
    throw new Error(message || "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export interface LoginPayload {
  akun_upi: string;
  password: string;
}

export interface UserInfo {
  id: string;
  nama: string;
  akun_upi: string;
  jabatan: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserInfo;
}

export interface PertemuanSummary {
  pertemuan: number;
  tanggal: string;
  status: "Selesai" | "Sedang Berlangsung" | "Belum Dimulai";
  present_count: number;
  total_enrolled: number;
  attendance_ratio: string;
}

export interface Matkul {
  _id: string;
  nama_matkul: string;
  sks: number;
  account_id: string;
  class_id: string;
  hari: string;
  jam_awal: string;
  jam_akhir: string;
  tanggal_awal: string;
  pertemuan_list?: PertemuanSummary[];
  class_info?: {
    _id: string;
    no_kelas?: string;
    gedung?: string;
    fakultas?: string;
  };
}

export interface AttendanceAttendee {
  timestamp?: string;
  full_name: string;
  category: string;
}

export interface AttendanceReport {
  scenario: string;
  start_time: string;
  end_time: string;
  total_attendance: number;
  attendees: AttendanceAttendee[];
}

export function loginAccount(payload: LoginPayload) {
  return apiFetch<LoginResponse>("/account/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function fetchMatkul(token: string) {
  return apiFetch<Matkul[]>("/matkul/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function fetchAttendanceReportBySchedule(
  token: string,
  params: { courseName: string; meetingDate: string }
) {
  const search = new URLSearchParams({
    course_name: params.courseName,
    meeting_date: params.meetingDate,
  });

  return apiFetch<AttendanceReport>(`/attendance/report/by-schedule?${search.toString()}` , {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export interface StudentAttendance {
  id: string;
  name: string;
  nim: string;
  status: "Hadir" | "Tidak Hadir";
  waktu_absen: string;
}

export interface PertemuanDetail {
  matkul_name: string;
  pertemuan: number;
  tanggal: string;
  status: string;
  total_mahasiswa: number;
  hadir: number;
  tidak_hadir: number;
  students: StudentAttendance[];
}

export function fetchPertemuanDetail(token: string, matkulId: string, pertemuanKe: number) {
  return apiFetch<PertemuanDetail>(`/matkul/${matkulId}/pertemuan/${pertemuanKe}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export { API_BASE_URL };
