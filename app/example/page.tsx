"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, LogOut, Clock, BookOpen } from "lucide-react";

export default function ExamplePage() {
  const router = useRouter();
  
  // ✅ Cara memanggil auth hook
  const { user, token, loading, isAuthenticated, logout } = useAuth();

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>You need to login to access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push("/login")}
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle logout
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-12">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
            <User className="h-6 w-6 text-slate-600" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Example - Auth Hook Demo
          </span>
        </div>
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">
            Selamat Datang, {user?.nama}! 👋
          </h1>
          <p className="text-slate-500">
            Ini adalah contoh halaman yang menggunakan useAuth hook
          </p>
        </div>

        {/* User Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Pengguna
            </CardTitle>
            <CardDescription>
              Data user diambil dari auth hook: <code className="text-xs bg-slate-100 px-2 py-1 rounded">const &#123; user &#125; = useAuth()</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">ID</p>
                <p className="text-lg font-semibold text-slate-900">{user?.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Nama Lengkap</p>
                <p className="text-lg font-semibold text-slate-900">{user?.nama}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Akun UPI</p>
                <p className="text-lg font-semibold text-slate-900">{user?.akun_upi}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Jabatan</p>
                <Badge variant="secondary" className="text-sm">
                  {user?.jabatan}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Token Information */}
        <Card>
          <CardHeader>
            <CardTitle>Access Token</CardTitle>
            <CardDescription>
              Token diambil dari: <code className="text-xs bg-slate-100 px-2 py-1 rounded">const &#123; token &#125; = useAuth()</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-100 p-4 rounded-lg font-mono text-xs break-all">
              {token ? token : "No token available"}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Token ini digunakan untuk autentikasi API requests
            </p>
          </CardContent>
        </Card>

        {/* Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status Autentikasi</CardTitle>
            <CardDescription>
              Cek status: <code className="text-xs bg-slate-100 px-2 py-1 rounded">const &#123; isAuthenticated &#125; = useAuth()</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Is Authenticated:</span>
              <Badge variant={isAuthenticated ? "default" : "destructive"}>
                {isAuthenticated ? "✓ Logged In" : "✗ Not Logged In"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Loading State:</span>
              <Badge variant="outline">
                {loading ? "Loading..." : "Ready"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Code Example */}
        <Card>
          <CardHeader>
            <CardTitle>💡 Cara Penggunaan</CardTitle>
            <CardDescription>Contoh kode di halaman ini</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
{`import { useAuth } from "@/hooks/auth";

export default function ExamplePage() {
  // Panggil hook
  const { user, token, loading, isAuthenticated, logout } = useAuth();

  // Handle loading
  if (loading) return <div>Loading...</div>;

  // Handle not authenticated
  if (!isAuthenticated) return <div>Please login</div>;

  // Akses data user
  return (
    <div>
      <h1>Welcome, {user?.nama}</h1>
      <p>Akun UPI: {user?.akun_upi}</p>
      <p>Jabatan: {user?.jabatan}</p>
      
      {/* Loop jadwal mengajar */}
      {user?.jadwal_mengajar.map((jadwal) => (
        <div key={jadwal.class_id}>
          <p>{jadwal.nama_mk}</p>
          <p>{jadwal.waktu_mulai} - {jadwal.waktu_selesai}</p>
        </div>
      ))}
      
      <button onClick={logout}>Logout</button>
    </div>
  );
}`}
            </pre>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
