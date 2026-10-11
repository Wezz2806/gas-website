// src/services/attendanceService.ts
import { AttendanceSession, AttendanceStatus } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const attendanceService = {
  async getSessions(roomId: number): Promise<{
    sessions: AttendanceSession[];
    summary?: { total: number; hadir: number; izin: number; sakit: number; alpa: number; counted: number; percentage: number };
    total_members?: number;
  }> {
    const res = await fetch(`${API_BASE}/room-attendance.php?action=list_sessions&room_id=${roomId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal memuat sesi absensi');
    }
    return data;
  },

  async getSessionDetail(roomId: number, sessionId: number): Promise<{
    session: { id: number; title: string; session_date: string; access_code: string | null; status: 'open' | 'closed' };
    students: Array<{
      id: number;
      full_name: string;
      email: string;
      avatar_url: string | null;
      status: AttendanceStatus | null;
      note: string | null;
      marked_by: 'self' | 'admin' | null;
      checked_in_at: string | null;
    }>;
  }> {
    const res = await fetch(`${API_BASE}/room-attendance.php?action=session_detail&room_id=${roomId}&session_id=${sessionId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal memuat detail sesi absensi');
    }
    return data;
  },

  async checkIn(sessionId: number, accessCode?: string): Promise<string> {
    const res = await fetch(`${API_BASE}/room-attendance.php`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({
        action: 'check_in',
        session_id: sessionId,
        access_code: accessCode || ''
      })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal melakukan absensi');
    }
    return data.message || 'Absensi berhasil';
  },

  async createSession(payload: {
    room_id: number;
    title: string;
    session_date: string;
    meeting_id?: string | null;
    access_code?: string;
    generate_code?: boolean;
    duration_minutes?: number;
  }): Promise<{ session_id: number; message: string }> {
    const res = await fetch(`${API_BASE}/room-attendance.php`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ action: 'create_session', ...payload })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal membuka sesi absensi');
    }
    return data;
  },

  async updateSession(payload: {
    session_id: number;
    title: string;
    session_date: string;
    access_code?: string;
  }): Promise<void> {
    const res = await fetch(`${API_BASE}/room-attendance.php`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ action: 'update_session', ...payload })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal memperbarui sesi absensi');
    }
  },

  async setStatus(sessionId: number, status: 'open' | 'closed'): Promise<void> {
    const res = await fetch(`${API_BASE}/room-attendance.php`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ action: 'set_status', session_id: sessionId, status })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal mengubah status sesi');
    }
  },

  async deleteSession(sessionId: number): Promise<void> {
    const res = await fetch(`${API_BASE}/room-attendance.php`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ action: 'delete_session', session_id: sessionId })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal menghapus sesi');
    }
  },

  async mark(payload: {
    session_id: number;
    student_id: number;
    status: AttendanceStatus | '';
    note?: string;
  }): Promise<void> {
    const res = await fetch(`${API_BASE}/room-attendance.php`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ action: 'mark', ...payload })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal menyimpan status murid');
    }
  },

  async bulkMark(sessionId: number, status: AttendanceStatus): Promise<string> {
    const res = await fetch(`${API_BASE}/room-attendance.php`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ action: 'bulk_mark', session_id: sessionId, status })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal menandai seluruh murid');
    }
    return data.message;
  },

  async getRecap(roomId: number): Promise<{
    sessions: Array<{ id: number; title: string; session_date: string; status: 'open' | 'closed' }>;
    members: Array<{ id: number; full_name: string; email: string; avatar_url: string | null }>;
    records: Array<{ session_id: number; student_id: number; status: AttendanceStatus; note: string | null }>;
  }> {
    const res = await fetch(`${API_BASE}/room-attendance.php?action=recap&room_id=${roomId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal memuat rekap absensi');
    }
    return data;
  }
};
