// src/services/roomService.ts
import { Room, RoomMember, Book, Meeting } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const roomService = {
  // ── Student / User Methods ──────────────────────────────────────
  async getMyRooms(): Promise<Room[]> {
    const response = await fetch(`${API_BASE}/rooms.php?action=my_rooms`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal memuat daftar kelas');
    }
    return data.rooms || [];
  },

  async getRoomDetail(roomId: number): Promise<Room> {
    const response = await fetch(`${API_BASE}/rooms.php?action=detail&id=${roomId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal memuat informasi kelas');
    }
    return data.room;
  },

  async joinRoom(roomKey: string): Promise<Room> {
    const response = await fetch(`${API_BASE}/rooms.php`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({ action: 'join', room_key: roomKey })
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Kunci kelas salah atau tidak aktif');
    }
    return data.room;
  },

  async leaveRoom(roomId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/rooms.php`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({ action: 'leave', room_id: roomId })
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal keluar dari kelas');
    }
  },

  // ── Admin Methods ───────────────────────────────────────────────
  async getAdminRooms(): Promise<Room[]> {
    const response = await fetch(`${API_BASE}/admin/rooms.php`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal memuat kelas');
    }
    return data.rooms || [];
  },

  async getRoomStats(roomId: number): Promise<any> {
    const response = await fetch(`${API_BASE}/admin/room-stats.php?room_id=${roomId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal memuat statistik kelas');
    }
    return data;
  },

  async createRoom(payload: {
    name: string;
    description: string;
    room_key: string;
    cover_image?: string;
    copy_contacts_from?: number;
  }): Promise<{ room_id: number; message: string }> {
    const response = await fetch(`${API_BASE}/admin/rooms.php`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        action: 'create',
        ...payload
      })
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal membuat kelas');
    }
    return data;
  },

  async updateRoom(payload: {
    id: number;
    name: string;
    description: string;
    room_key: string;
    cover_image?: string;
    is_active?: boolean | number;
  }): Promise<void> {
    const response = await fetch(`${API_BASE}/admin/rooms.php`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        action: 'update',
        ...payload,
        is_active: payload.is_active !== undefined ? (payload.is_active ? 1 : 0) : 1
      })
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal memperbarui kelas');
    }
  },

  async deleteRoom(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/admin/rooms.php`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({ action: 'delete', id })
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal menghapus kelas');
    }
  },

  async getRoomMembers(roomId: number): Promise<RoomMember[]> {
    const response = await fetch(`${API_BASE}/admin/room-members.php?room_id=${roomId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal memuat anggota kelas');
    }
    return data.members || [];
  },

  async removeRoomMember(roomId: number, userId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/admin/room-members.php`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({ action: 'remove', room_id: roomId, user_id: userId })
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal mengeluarkan murid dari kelas');
    }
  },

  // ── Room-Specific Content ───────────────────────────────────────
  async getRoomEcopedia(roomId: number): Promise<Book[]> {
    const response = await fetch(`${API_BASE}/room-content.php?room_id=${roomId}&type=ecopedia`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal memuat buku kelas');
    }
    return (data.books || []).map((b: any) => ({
      id: String(b.id),
      title: b.title || '',
      coverUrl: b.cover_url || '',
      category: b.category || 'Materi',
      tagClass: 'bg-emerald-100 text-emerald-800',
      icon: 'science',
      description: b.description || '',
      content: b.content || '',
      pdfUrl: b.pdf_url || '#',
      flipUrl: b.flip_url || ''
    }));
  },

  async saveRoomEcopedia(roomId: number, book: any): Promise<void> {
    const response = await fetch(`${API_BASE}/room-content.php`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        action: 'save_ecopedia',
        room_id: roomId,
        ...book
      })
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal menyimpan buku');
    }
  },

  async deleteRoomEcopedia(roomId: number, bookId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/room-content.php`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        action: 'delete_ecopedia',
        room_id: roomId,
        id: bookId
      })
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal menghapus buku');
    }
  },

  async getRoomMeetings(roomId: number): Promise<Meeting[]> {
    const response = await fetch(`${API_BASE}/room-content.php?room_id=${roomId}&type=meetings`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal memuat pertemuan kelas');
    }
    return (data.meetings || []).map((m: any) => ({
      id: m.meeting_code || String(m.id),
      number: Number(m.number),
      title: m.title || '',
      description: m.description || '',
      icon: m.icon || 'science',
      status: m.status || 'scheduled',
      embed_url: m.embed_url || '',
      download_url: m.download_url || ''
    }));
  },

  async saveRoomMeeting(roomId: number, meeting: any): Promise<void> {
    const response = await fetch(`${API_BASE}/room-content.php`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        action: 'save_meeting',
        room_id: roomId,
        ...meeting
      })
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal menyimpan pertemuan');
    }
  },

  async deleteRoomMeeting(roomId: number, meetingId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/room-content.php`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        action: 'delete_meeting',
        room_id: roomId,
        id: meetingId
      })
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal menghapus pertemuan');
    }
  }
};
