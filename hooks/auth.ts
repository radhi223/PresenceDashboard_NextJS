import { useState, useEffect } from "react";

interface JadwalMengajar {
  nama_mk: string;
  waktu_mulai: string;
  waktu_selesai: string;
  class_id: string;
}

interface UserInfo {
  id: string;
  nama: string;
  akun_upi: string;
  jabatan: string;
}

export function useAuth() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user and token from localStorage on mount
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      const accessToken = localStorage.getItem("access_token");
      
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
      if (accessToken) {
        setToken(accessToken);
      }
      setLoading(false);
    }
  }, []);

  const login = (userData: UserInfo, accessToken: string) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("access_token", accessToken);
    setUser(userData);
    setToken(accessToken);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    setUser(null);
    setToken(null);
  };

  const isAuthenticated = !!user && !!token;

  return {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
  };
}