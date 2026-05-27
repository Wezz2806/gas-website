import { User } from '../types';

// Development: Vite proxy mengarahkan /api → XAMPP lokal
// Production:  VITE_API_BASE_URL diisi URL Railway (misal: https://gas-website.up.railway.app/api)
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Helper untuk melakukan HTTP request dengan penanganan error terstandar.
 */
async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    // PENTING: credentials 'include' memastikan session cookie PHP dikirim/diterima dengan benar
    credentials: 'include',
  };

  try {
    const response = await fetch(url, config);
    
    // Parse response body sebagai JSON jika memungkinkan
    let data: any;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text || 'Terjadi kesalahan pada respon server.' };
    }

    if (!response.ok) {
      throw new Error(data.message || `Request gagal dengan status ${response.status}`);
    }

    return data as T;
  } catch (error: any) {
    console.error(`API Error pada ${url}:`, error);
    throw new Error(error.message || 'Koneksi ke server gagal. Harap periksa jaringan Anda.');
  }
}

export const authService = {
  /**
   * Pendaftaran akun baru (Lokal).
   */
  async register(fullName: string, email: string, password: string, role: 'student' | 'teacher'): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(`${API_BASE}/register.php`, {
      method: 'POST',
      body: JSON.stringify({ full_name: fullName, email, password, role }),
    });
  },

  /**
   * Masuk menggunakan email & sandi (Lokal).
   */
  async login(email: string, password: string): Promise<{ success: boolean; message: string; user: User }> {
    return apiRequest<{ success: boolean; message: string; user: User }>(`${API_BASE}/login.php`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },



  /**
   * Memeriksa apakah terdapat sesi login aktif di server.
   */
  async checkSession(): Promise<{ success: boolean; user: User }> {
    return apiRequest<{ success: boolean; user: User }>(`${API_BASE}/session.php`, {
      method: 'GET',
    });
  },

  /**
   * Keluar dari sesi (Logout).
   */
  async logout(): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(`${API_BASE}/logout.php`, {
      method: 'POST',
    });
  },

  /**
   * Meminta kode OTP lupa password.
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(`${API_BASE}/forgot-password.php`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Mereset password dengan OTP verifikasi.
   */
  async resetPassword(email: string, otpCode: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(`${API_BASE}/reset-password.php`, {
      method: 'POST',
      body: JSON.stringify({ email, otp_code: otpCode, new_password: newPassword }),
    });
  },

  /**
   * Memperbarui profil pengguna.
   */
  async updateProfile(formData: FormData): Promise<{ success: boolean; message: string; user: User }> {
    try {
      const response = await fetch(`${API_BASE}/update-profile.php`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      let data: any;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text || 'Terjadi kesalahan pada respon server.' };
      }

      if (!response.ok) {
        throw new Error(data.message || `Request gagal dengan status ${response.status}`);
      }

      return data as { success: boolean; message: string; user: User };
    } catch (error: any) {
      console.error(`API Error pada updateProfile:`, error);
      throw new Error(error.message || 'Koneksi ke server gagal. Harap periksa jaringan Anda.');
    }
  }
};
