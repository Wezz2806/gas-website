// src/services/contactService.ts
import { RoomContact } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const contactService = {
  async getRoomContacts(roomId: number): Promise<RoomContact[]> {
    const res = await fetch(`${API_BASE}/room-contacts.php?room_id=${roomId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal memuat kontak kelas');
    }
    return (data.contacts || []).map((c: any) => ({
      id: Number(c.id),
      room_id: Number(c.room_id),
      name: c.name || '',
      role: c.role || null,
      instansi: c.instansi || null,
      email: c.email || null,
      phone: c.phone || null,
      office_hours: c.office_hours || null,
      avatar_url: c.avatar_url || null,
      sort_order: Number(c.sort_order || 0)
    }));
  },

  async saveRoomContact(roomId: number, contact: {
    id?: number;
    name: string;
    role?: string;
    instansi?: string;
    email?: string;
    phone?: string;
    office_hours?: string;
    avatar_url?: string;
    sort_order?: number;
  }): Promise<void> {
    const res = await fetch(`${API_BASE}/room-contacts.php`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({
        action: 'save',
        room_id: roomId,
        ...contact
      })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal menyimpan kontak');
    }
  },

  async deleteRoomContact(roomId: number, contactId: number): Promise<void> {
    const res = await fetch(`${API_BASE}/room-contacts.php`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({
        action: 'delete',
        room_id: roomId,
        id: contactId
      })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal menghapus kontak');
    }
  },

  async copyFromRoom(roomId: number, fromRoomId: number): Promise<string> {
    const res = await fetch(`${API_BASE}/room-contacts.php`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({
        action: 'copy_from',
        room_id: roomId,
        from_room_id: fromRoomId
      })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal menyalin kontak');
    }
    return data.message || 'Kontak berhasil disalin';
  }
};
