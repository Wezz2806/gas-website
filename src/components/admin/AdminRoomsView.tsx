import React, { useState, useEffect } from 'react';
import { Room } from '../../types';
import { roomService } from '../../services/roomService';
import AdminClassWorkspace from './AdminClassWorkspace';
import { 
  DoorOpen, 
  Plus, 
  Users, 
  KeyRound, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Sparkles,
  ExternalLink,
  BookOpen,
  FlaskConical,
  Layers,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';

interface AdminRoomsViewProps {
  initialSelectedRoomId?: number | null;
  onClearInitialRoom?: () => void;
}

export default function AdminRoomsView({ 
  initialSelectedRoomId,
  onClearInitialRoom 
}: AdminRoomsViewProps = {}) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal Create / Quick Edit
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formKey, setFormKey] = useState('');
  const [formCover, setFormCover] = useState('');
  const [formCopyContacts, setFormCopyContacts] = useState<number>(0);
  const [formActive, setFormActive] = useState(true);

  // Copied feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await roomService.getAdminRooms();
      setRooms(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat kelas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Handle auto-opening class if initialSelectedRoomId passed
  useEffect(() => {
    if (initialSelectedRoomId && rooms.length > 0) {
      const match = rooms.find(r => r.id === initialSelectedRoomId);
      if (match) {
        setSelectedRoom(match);
      }
      if (onClearInitialRoom) {
        onClearInitialRoom();
      }
    }
  }, [initialSelectedRoomId, rooms]);

  const handleOpenCreate = () => {
    setEditingRoom(null);
    setFormName('');
    setFormDesc('');
    // Auto-generate suggested key: GAS- + 4 random uppercase chars
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randKey = 'GAS-';
    for (let i = 0; i < 4; i++) randKey += chars[Math.floor(Math.random() * chars.length)];
    setFormKey(randKey);
    setFormCover('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80');
    setFormCopyContacts(rooms.length > 0 ? rooms[0].id : 0);
    setFormActive(true);
    setShowModal(true);
  };

  const handleOpenEdit = (room: Room, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingRoom(room);
    setFormName(room.name);
    setFormDesc(room.description || '');
    setFormKey(room.room_key);
    setFormCover(room.cover_image || '');
    setFormCopyContacts(0);
    setFormActive(Boolean(room.is_active));
    setShowModal(true);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formKey.trim()) {
      showToast('Nama kelas dan kunci kelas wajib diisi.', 'error');
      return;
    }

    try {
      setActionLoading(true);
      if (editingRoom) {
        await roomService.updateRoom({
          id: editingRoom.id,
          name: formName.trim(),
          description: formDesc.trim(),
          room_key: formKey.trim().toUpperCase(),
          cover_image: formCover.trim(),
          is_active: formActive ? 1 : 0
        });
        showToast('Kelas berhasil diperbarui.');
      } else {
        const res = await roomService.createRoom({
          name: formName.trim(),
          description: formDesc.trim(),
          room_key: formKey.trim().toUpperCase(),
          cover_image: formCover.trim(),
          copy_contacts_from: formCopyContacts > 0 ? formCopyContacts : undefined
        });
        showToast(res.message || 'Kelas berhasil dibuat.');
      }
      setShowModal(false);
      await fetchRooms();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan kelas', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRoom = async (room: Room, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const conf = prompt(`Ketik nama kelas "${room.name}" untuk mengonfirmasi penghapusan kelas ini:`);
    if (conf !== room.name) {
      showToast('Konfirmasi tidak cocok. Penghapusan dibatalkan.', 'error');
      return;
    }

    try {
      setActionLoading(true);
      await roomService.deleteRoom(room.id);
      showToast('Kelas berhasil dihapus.');
      if (selectedRoom?.id === room.id) {
        setSelectedRoom(null);
      }
      await fetchRooms();
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus kelas', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyKey = (key: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // If a room is selected, render the Class Workspace
  if (selectedRoom) {
    return (
      <AdminClassWorkspace
        room={selectedRoom}
        onBack={() => {
          setSelectedRoom(null);
          fetchRooms();
        }}
        onRoomUpdated={fetchRooms}
        allRooms={rooms}
      />
    );
  }

  // Filtered rooms
  const filteredRooms = rooms.filter(r => {
    const matchesSearch = 
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.room_key.toLowerCase().includes(search.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'active') return Boolean(r.is_active);
    if (statusFilter === 'inactive') return !Boolean(r.is_active);
    return true;
  });

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 p-4 rounded-2xl shadow-xl border text-xs font-bold z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 flex items-center gap-2 ${
          toast.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-900 border border-cyan-200">
              Modul Kelola Kelas
            </span>
          </div>
          <h2 className="font-display font-black text-2xl md:text-3xl text-slate-800 tracking-tight">
            Kelola Kelas Pembelajaran
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Setiap kelas memiliki materi EcoPedia, pertemuan EcoLab, sesi absensi, galeri EcoCreation, evaluasi EcoChallenge, dan kontak tersendiri.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs hover:shadow-md cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kelas Baru</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-800 text-xs font-semibold">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p>{error}</p>
          </div>
          <button
            onClick={fetchRooms}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition-all self-start sm:self-auto cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama kelas atau kunci..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-slate-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="active">Kelas Aktif</option>
            <option value="inactive">Kelas Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Grid Kelas */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Memuat daftar kelas...</span>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center">
          <DoorOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Tidak Ada Kelas Ditemukan</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search ? 'Coba ubah kata kunci pencarian Anda.' : 'Mulai dengan menambahkan kelas baru untuk murid.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => {
            const cover = room.cover_image || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80';
            const isActive = Boolean(room.is_active);

            return (
              <div
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-cyan-400 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Card Cover */}
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img 
                      src={cover} 
                      alt={room.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleCopyKey(room.room_key, e)}
                        className="text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-1 rounded-lg bg-black/60 text-white backdrop-blur-md border border-white/20 hover:bg-black/80 transition-colors flex items-center gap-1"
                        title="Klik untuk menyalin kunci kelas"
                      >
                        <span>Kunci: {room.room_key}</span>
                        {copiedKey === room.room_key ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-300" />}
                      </button>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md border ${
                        isActive 
                          ? 'bg-emerald-500/80 text-white border-emerald-300/40' 
                          : 'bg-slate-700/80 text-slate-200 border-white/20'
                      }`}>
                        {isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-base font-bold text-white leading-snug drop-shadow-sm line-clamp-1 group-hover:text-cyan-200 transition-colors">
                        {room.name}
                      </h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4">
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {room.description || 'Tidak ada deskripsi untuk kelas ini.'}
                    </p>

                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Murid</span>
                        <span className="text-sm font-black text-slate-800">{room.members_count || 0}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">EcoLab</span>
                        <span className="text-sm font-black text-slate-800">{room.meetings_count || 0} LKM</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">EcoPedia</span>
                        <span className="text-sm font-black text-slate-800">{room.materials_count || 0} Buku</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-5 pt-0 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleOpenEdit(room, e)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                      title="Edit Info Kelas"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteRoom(room, e)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                      title="Hapus Kelas"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedRoom(room)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer group-hover:translate-x-0.5"
                  >
                    <span>Kelola Kelas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah / Edit Kelas */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 text-left shadow-2xl">
            <h3 className="font-display font-bold text-lg text-slate-800">
              {editingRoom ? 'Edit Informasi Kelas' : 'Tambah Ruang Kelas Baru'}
            </h3>
            <p className="text-xs text-slate-500">
              {editingRoom 
                ? 'Perbarui nama, deskripsi, atau kunci akses untuk kelas ini.' 
                : 'Kelas baru otomatis memiliki template materi EcoPedia & EcoLab standar yang dapat disesuaikan kemudian.'
              }
            </p>

            <form onSubmit={handleSaveRoom} className="space-y-3.5 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nama Ruang Kelas</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Kelas Kimia Hijau X-A"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Kunci Kelas (Room Key)</label>
                <input
                  type="text"
                  value={formKey}
                  onChange={(e) => setFormKey(e.target.value.toUpperCase())}
                  placeholder="GAS-KIMIA1"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
                <span className="text-[10px] text-slate-400">Murid memasukkan kunci ini untuk bergabung</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Penjelasan sasaran pembelajaran kelas..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">URL Gambar Sampul (Cover Image)</label>
                <input
                  type="text"
                  value={formCover}
                  onChange={(e) => setFormCover(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {!editingRoom && rooms.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Salin Kontak EcoContact dari Kelas Lain</label>
                  <select
                    value={formCopyContacts}
                    onChange={(e) => setFormCopyContacts(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value={0}>Jangan salin (mulai dengan kontak kosong)</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.room_key})</option>
                    ))}
                  </select>
                </div>
              )}

              {editingRoom && (
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formActive}
                      onChange={(e) => setFormActive(e.target.checked)}
                      className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="text-xs font-bold text-slate-700">Status Kelas Aktif</span>
                  </label>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Menyimpan...' : editingRoom ? 'Simpan Perubahan' : 'Buat Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
