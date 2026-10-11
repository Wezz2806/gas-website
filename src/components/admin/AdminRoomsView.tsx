import React, { useState, useEffect } from 'react';
import { Room, RoomMember, Book, Meeting } from '../../types';
import { roomService } from '../../services/roomService';
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
  Trophy, 
  Sparkles,
  ExternalLink,
  UserX,
  BookOpen,
  FlaskConical,
  Layers,
  FileText
} from 'lucide-react';

export default function AdminRoomsView() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal Create / Edit
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formKey, setFormKey] = useState('');
  const [formCover, setFormCover] = useState('');
  const [formGamification, setFormGamification] = useState(false);
  const [formActive, setFormActive] = useState(true);

  // Modal Members
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedRoomForMembers, setSelectedRoomForMembers] = useState<Room | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Modal Content Management per Room
  const [showContentModal, setShowContentModal] = useState(false);
  const [selectedRoomForContent, setSelectedRoomForContent] = useState<Room | null>(null);
  const [contentTab, setContentTab] = useState<'ecopedia' | 'ecolab'>('ecopedia');
  const [roomBooks, setRoomBooks] = useState<Book[]>([]);
  const [roomMeetings, setRoomMeetings] = useState<Meeting[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [contentActionLoading, setContentActionLoading] = useState(false);

  // Content: Book form state
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [formBookTitle, setFormBookTitle] = useState('');
  const [formBookCategory, setFormBookCategory] = useState('Kimia Hijau');
  const [formBookCover, setFormBookCover] = useState('');
  const [formBookFlipUrl, setFormBookFlipUrl] = useState('');
  const [formBookPdfUrl, setFormBookPdfUrl] = useState('');
  const [formBookDesc, setFormBookDesc] = useState('');

  // Content: Meeting form state
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [formMeetingNumber, setFormMeetingNumber] = useState(1);
  const [formMeetingTitle, setFormMeetingTitle] = useState('');
  const [formMeetingDesc, setFormMeetingDesc] = useState('');
  const [formMeetingEmbed, setFormMeetingEmbed] = useState('');
  const [formMeetingDownload, setFormMeetingDownload] = useState('');
  const [formMeetingStatus, setFormMeetingStatus] = useState<'completed' | 'ongoing' | 'scheduled'>('scheduled');

  // Copied room key feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

  const handleOpenCreate = () => {
    setEditingRoom(null);
    setFormName('');
    setFormDesc('');
    setFormKey(`GAS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
    setFormCover('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80');
    setFormGamification(false);
    setFormActive(true);
    setShowModal(true);
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setFormName(room.name);
    setFormDesc(room.description || '');
    setFormKey(room.room_key);
    setFormCover(room.cover_image || '');
    setFormGamification(Boolean(room.gamification_enabled));
    setFormActive(Boolean(room.is_active));
    setShowModal(true);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formKey.trim()) return;

    try {
      setActionLoading(true);
      setError('');
      if (editingRoom) {
        await roomService.updateRoom({
          id: editingRoom.id,
          name: formName.trim(),
          description: formDesc.trim(),
          room_key: formKey.trim().toUpperCase(),
          cover_image: formCover.trim(),
          gamification_enabled: formGamification,
          is_active: formActive
        });
        setSuccess('Kelas berhasil diperbarui!');
      } else {
        await roomService.createRoom({
          name: formName.trim(),
          description: formDesc.trim(),
          room_key: formKey.trim().toUpperCase(),
          cover_image: formCover.trim(),
          gamification_enabled: formGamification
        });
        setSuccess('Kelas baru berhasil dibuat!');
      }
      setShowModal(false);
      await fetchRooms();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan kelas');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRoom = async (room: Room) => {
    if (!window.confirm(`Yakin ingin menghapus kelas "${room.name}"? Semua materi, tugas, dan anggota di kelas ini akan terhapus!`)) {
      return;
    }

    try {
      setActionLoading(true);
      await roomService.deleteRoom(room.id);
      setSuccess(`Kelas "${room.name}" berhasil dihapus.`);
      await fetchRooms();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus kelas');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenMembers = async (room: Room) => {
    setSelectedRoomForMembers(room);
    setShowMembersModal(true);
    try {
      setLoadingMembers(true);
      const data = await roomService.getRoomMembers(room.id);
      setMembers(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat anggota');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleRemoveMember = async (member: RoomMember) => {
    if (!selectedRoomForMembers) return;
    if (!window.confirm(`Keluarkan ${member.full_name} dari kelas ini?`)) return;

    try {
      await roomService.removeRoomMember(selectedRoomForMembers.id, member.id);
      setMembers(prev => prev.filter(m => m.id !== member.id));
      await fetchRooms();
    } catch (err: any) {
      alert(err.message || 'Gagal mengeluarkan murid');
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ── Room Content Handlers ────────────────────────────────────────
  const fetchRoomContent = async (roomId: number) => {
    try {
      setLoadingContent(true);
      const [books, meetings] = await Promise.all([
        roomService.getRoomEcopedia(roomId),
        roomService.getRoomMeetings(roomId)
      ]);
      setRoomBooks(books);
      setRoomMeetings(meetings);
    } catch (err: any) {
      console.error(err);
      setError('Gagal memuat materi dan pertemuan kelas.');
    } finally {
      setLoadingContent(false);
    }
  };

  const handleOpenContent = async (room: Room) => {
    setSelectedRoomForContent(room);
    setContentTab('ecopedia');
    setShowBookForm(false);
    setShowMeetingForm(false);
    setShowContentModal(true);
    await fetchRoomContent(room.id);
  };

  const handleOpenAddBook = () => {
    setEditingBookId(null);
    setFormBookTitle('');
    setFormBookCategory('Kimia Hijau');
    setFormBookCover('./Cover Buku 1.png');
    setFormBookFlipUrl('');
    setFormBookPdfUrl('#');
    setFormBookDesc('');
    setShowBookForm(true);
  };

  const handleOpenEditBook = (book: Book) => {
    setEditingBookId(book.id);
    setFormBookTitle(book.title);
    setFormBookCategory(book.category || 'Kimia Hijau');
    setFormBookCover(book.coverUrl || '');
    setFormBookFlipUrl(book.flipUrl || '');
    setFormBookPdfUrl(book.pdfUrl || '#');
    setFormBookDesc(book.description || '');
    setShowBookForm(true);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomForContent || !formBookTitle.trim()) return;

    try {
      setContentActionLoading(true);
      await roomService.saveRoomEcopedia(selectedRoomForContent.id, {
        id: editingBookId ? Number(editingBookId) : 0,
        title: formBookTitle.trim(),
        category: formBookCategory.trim(),
        cover_url: formBookCover.trim(),
        flip_url: formBookFlipUrl.trim(),
        pdf_url: formBookPdfUrl.trim() || '#',
        description: formBookDesc.trim()
      });
      setShowBookForm(false);
      await fetchRoomContent(selectedRoomForContent.id);
      setSuccess('Buku materi berhasil disimpan!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan buku');
    } finally {
      setContentActionLoading(false);
    }
  };

  const handleDeleteBook = async (book: Book) => {
    if (!selectedRoomForContent) return;
    if (!window.confirm(`Hapus buku "${book.title}" dari kelas ini?`)) return;

    try {
      setContentActionLoading(true);
      await roomService.deleteRoomEcopedia(selectedRoomForContent.id, Number(book.id));
      await fetchRoomContent(selectedRoomForContent.id);
      setSuccess('Buku materi berhasil dihapus.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus buku');
    } finally {
      setContentActionLoading(false);
    }
  };

  const handleOpenAddMeeting = () => {
    setEditingMeetingId(null);
    const nextNum = (roomMeetings.length > 0 ? Math.max(...roomMeetings.map(m => m.number || 0)) : 0) + 1;
    setFormMeetingNumber(nextNum);
    setFormMeetingTitle('');
    setFormMeetingDesc('');
    setFormMeetingEmbed('');
    setFormMeetingDownload('');
    setFormMeetingStatus('scheduled');
    setShowMeetingForm(true);
  };

  const handleOpenEditMeeting = (m: Meeting) => {
    setEditingMeetingId(m.id);
    setFormMeetingNumber(m.number || 1);
    setFormMeetingTitle(m.title);
    setFormMeetingDesc(m.description || '');
    setFormMeetingEmbed((m as any).embed_url || '');
    setFormMeetingDownload((m as any).download_url || '');
    setFormMeetingStatus(m.status || 'scheduled');
    setShowMeetingForm(true);
  };

  const handleSaveMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomForContent || !formMeetingTitle.trim()) return;

    try {
      setContentActionLoading(true);
      await roomService.saveRoomMeeting(selectedRoomForContent.id, {
        id: editingMeetingId && !isNaN(Number(editingMeetingId)) ? Number(editingMeetingId) : 0,
        meeting_code: `m${formMeetingNumber}`,
        number: formMeetingNumber,
        title: formMeetingTitle.trim(),
        description: formMeetingDesc.trim(),
        embed_url: formMeetingEmbed.trim(),
        download_url: formMeetingDownload.trim(),
        status: formMeetingStatus
      });
      setShowMeetingForm(false);
      await fetchRoomContent(selectedRoomForContent.id);
      setSuccess('Pertemuan/LKM kelas berhasil disimpan!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan pertemuan');
    } finally {
      setContentActionLoading(false);
    }
  };

  const handleDeleteMeeting = async (m: Meeting) => {
    if (!selectedRoomForContent) return;
    if (!window.confirm(`Hapus pertemuan "${m.title}" dari kelas ini?`)) return;

    try {
      setContentActionLoading(true);
      await roomService.deleteRoomMeeting(selectedRoomForContent.id, Number(m.id));
      await fetchRoomContent(selectedRoomForContent.id);
      setSuccess('Pertemuan/LKM berhasil dihapus.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus pertemuan');
    } finally {
      setContentActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header Bar ────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold mb-2">
            <DoorOpen className="w-3.5 h-3.5 text-cyan-600" />
            <span>Manajemen Ruang Kelas</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Kelola Kelas (Rooms)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Buat kelas pembelajaran baru, atur kunci masuk murid (room key), dan tentukan pengaturan gamifikasi.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Kelas Baru</span>
        </button>
      </div>

      {/* ── Notifications ─────────────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* ── Content Grid / Table ───────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-600 mb-2" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
          <DoorOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Belum Ada Kelas</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            Klik tombol di bawah untuk membuat kelas pertama beserta kunci masuk bagi murid.
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 text-white font-bold text-xs"
          >
            + Buat Kelas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const cover = room.cover_image || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80';
            const isGamified = Boolean(room.gamification_enabled);
            const isActive = Boolean(room.is_active);

            return (
              <div 
                key={room.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 bg-slate-100 overflow-hidden">
                    <img src={cover} alt={room.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                    
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md text-white backdrop-blur-md ${isActive ? 'bg-emerald-600/80' : 'bg-rose-600/80'}`}>
                        {isActive ? 'Aktif' : 'Non-aktif'}
                      </span>
                    </div>

                    {isGamified && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-amber-950 font-bold text-[10px]">
                        <Trophy className="w-3 h-3" />
                        <span>Gamifikasi ON</span>
                      </div>
                    )}

                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-base font-bold text-white line-clamp-1">{room.name}</h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Room Key Badge with Copy */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kunci Kelas (Room Key)</span>
                        <span className="font-mono font-bold text-sm text-cyan-800 tracking-wider">{room.room_key}</span>
                      </div>
                      <button
                        onClick={() => handleCopyKey(room.room_key)}
                        title="Salin Kunci Kelas"
                        className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                      >
                        {copiedKey === room.room_key ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {room.description || 'Tidak ada deskripsi.'}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenMembers(room)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center gap-1.5 font-semibold text-slate-700 transition-colors cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5 text-cyan-600" />
                        <span>{room.members_count || 0} Murid</span>
                      </button>

                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center gap-1.5 text-slate-500 font-medium">
                        <span className="text-[11px]">Dibuat: {room.creator_name || 'Admin'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenContent(room)}
                    className="p-2 rounded-xl text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="Kelola Materi EcoPedia & Tugas EcoLab kelas ini"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Kelola Konten</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(room)}
                    className="p-2 rounded-xl text-slate-600 hover:bg-white hover:text-cyan-700 border border-transparent hover:border-slate-200 transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDeleteRoom(room)}
                    className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-200 transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal Create / Edit Room ───────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold font-display text-slate-900">
                {editingRoom ? 'Edit Kelas' : 'Buat Kelas Baru'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Kelas *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kimia Hijau Kelas 10-A"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kunci Kelas (Custom Key) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: GAS-KIMIA1"
                  value={formKey}
                  onChange={(e) => setFormKey(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 text-sm font-mono uppercase tracking-wider font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-600 bg-slate-50"
                />
                <p className="text-[11px] text-slate-400 mt-1">Kunci ini akan dimasukkan murid untuk bergabung ke kelas ini.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Deskripsi Kelas
                </label>
                <textarea
                  rows={3}
                  placeholder="Deskripsi singkat mengenai proyek atau materi di kelas ini..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  URL Cover Gambar
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formCover}
                  onChange={(e) => setFormCover(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-600"
                />
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="gamification_toggle"
                  checked={formGamification}
                  onChange={(e) => setFormGamification(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-amber-300 cursor-pointer"
                />
                <label htmlFor="gamification_toggle" className="text-xs text-slate-700 cursor-pointer">
                  <span className="font-bold block text-amber-900">Aktifkan Fitur Gamifikasi di Kelas Ini</span>
                  Jika diaktifkan, murid di kelas ini dapat mengumpulkan Eco-Points, Daily Streak, dan bersaing di Leaderboard kelas.
                </label>
              </div>

              {editingRoom && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active_toggle"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300 cursor-pointer"
                  />
                  <label htmlFor="is_active_toggle" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Status Kelas Aktif
                  </label>
                </div>
              )}

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Simpan Kelas</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Anggota Kelas ────────────────────────────────────── */}
      {showMembersModal && selectedRoomForMembers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold font-display text-slate-900">
                  Daftar Murid: {selectedRoomForMembers.name}
                </h3>
                <p className="text-xs text-slate-500">Kunci Kelas: <span className="font-mono font-bold text-cyan-700">{selectedRoomForMembers.room_key}</span></p>
              </div>
              <button
                onClick={() => setShowMembersModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loadingMembers ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Belum ada murid yang bergabung dengan kelas ini.
                </div>
              ) : (
                members.map((m) => (
                  <div 
                    key={m.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center text-xs overflow-hidden">
                        {m.avatar_url ? <img src={m.avatar_url} alt="" className="w-full h-full object-cover" /> : m.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{m.full_name}</p>
                        <p className="text-[11px] text-slate-400">{m.email} • Bergabung: {new Date(m.joined_at).toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {Boolean(selectedRoomForMembers.gamification_enabled) && (
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                          {m.eco_points} Pts
                        </span>
                      )}
                      <button
                        onClick={() => handleRemoveMember(m)}
                        title="Keluarkan murid"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowMembersModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Kelola Konten Kelas (EcoPedia & EcoLab) ──────────── */}
      {showContentModal && selectedRoomForContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-4xl w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200">
                    Kunci: {selectedRoomForContent.room_key}
                  </span>
                </div>
                <h3 className="text-xl font-bold font-display text-slate-900">
                  Kelola Konten: {selectedRoomForContent.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Kelola modul bacaan EcoPedia dan LKPD pertemuan EcoLab yang tampil bagi murid di kelas ini.
                </p>
              </div>
              <button
                onClick={() => setShowContentModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Sub-Tabs Switcher */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pt-3 pb-1">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setContentTab('ecopedia');
                    setShowBookForm(false);
                  }}
                  className={`pb-2.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                    contentTab === 'ecopedia'
                      ? 'border-cyan-600 text-cyan-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Materi EcoPedia</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-100 text-cyan-800 font-mono">
                    {roomBooks.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setContentTab('ecolab');
                    setShowMeetingForm(false);
                  }}
                  className={`pb-2.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                    contentTab === 'ecolab'
                      ? 'border-cyan-600 text-cyan-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Pertemuan & LKPD EcoLab</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-100 text-cyan-800 font-mono">
                    {roomMeetings.length}
                  </span>
                </button>
              </div>

              {contentTab === 'ecopedia' && !showBookForm && (
                <button
                  onClick={handleOpenAddBook}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Buku</span>
                </button>
              )}

              {contentTab === 'ecolab' && !showMeetingForm && (
                <button
                  onClick={handleOpenAddMeeting}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Pertemuan</span>
                </button>
              )}
            </div>

            {/* Modal Body / Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {loadingContent ? (
                <div className="flex items-center justify-center py-16 text-slate-400">
                  <Loader2 className="w-7 h-7 animate-spin text-cyan-600" />
                </div>
              ) : contentTab === 'ecopedia' ? (
                /* ── TAB ECOPEDIA ── */
                <div>
                  {showBookForm ? (
                    <form onSubmit={handleSaveBook} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-slate-800">
                          {editingBookId ? 'Edit Buku Materi' : 'Tambah Buku Materi Baru'}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setShowBookForm(false)}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          Batal
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Judul Buku *</label>
                          <input
                            type="text"
                            required
                            placeholder="Judul buku modul..."
                            value={formBookTitle}
                            onChange={(e) => setFormBookTitle(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Kategori</label>
                          <input
                            type="text"
                            placeholder="Kimia Hijau / Ekoenzim"
                            value={formBookCategory}
                            onChange={(e) => setFormBookCategory(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-cyan-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">URL Cover Buku</label>
                          <input
                            type="text"
                            placeholder="./Cover Buku 1.png atau https://..."
                            value={formBookCover}
                            onChange={(e) => setFormBookCover(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">URL FlipHTML5 (Interaktif)</label>
                          <input
                            type="text"
                            placeholder="https://online.fliphtml5.com/..."
                            value={formBookFlipUrl}
                            onChange={(e) => setFormBookFlipUrl(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-cyan-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Deskripsi Singkat</label>
                        <textarea
                          rows={2}
                          placeholder="Ringkasan materi atau tujuan modul..."
                          value={formBookDesc}
                          onChange={(e) => setFormBookDesc(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowBookForm(false)}
                          className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={contentActionLoading}
                          className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1.5"
                        >
                          {contentActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Simpan Buku</span>}
                        </button>
                      </div>
                    </form>
                  ) : null}

                  {roomBooks.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                      Belum ada buku khusus di kelas ini. Klik "Tambah Buku" untuk membuat materi.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {roomBooks.map((b) => (
                        <div key={b.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex gap-3.5 justify-between">
                          <div className="flex gap-3">
                            <div className="w-14 h-18 rounded-lg bg-slate-200 overflow-hidden shrink-0 shadow-2xs">
                              {b.coverUrl ? (
                                <img src={b.coverUrl} alt={b.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <BookOpen className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                                {b.category || 'Materi'}
                              </span>
                              <h5 className="font-bold text-xs text-slate-800 line-clamp-2 mt-1">{b.title}</h5>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{b.description || 'Tidak ada deskripsi.'}</p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5 shrink-0 justify-start">
                            <button
                              onClick={() => handleOpenEditBook(b)}
                              title="Edit Buku"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBook(b)}
                              title="Hapus Buku"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* ── TAB ECOLAB ── */
                <div>
                  {showMeetingForm ? (
                    <form onSubmit={handleSaveMeeting} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-slate-800">
                          {editingMeetingId ? 'Edit Pertemuan & LKPD' : 'Tambah Pertemuan Baru'}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setShowMeetingForm(false)}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          Batal
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Pertemuan Ke- *</label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={formMeetingNumber}
                            onChange={(e) => setFormMeetingNumber(Number(e.target.value))}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-cyan-500"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Judul Topik / Pertemuan *</label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: Mengapa Green Chemistry Penting?"
                            value={formMeetingTitle}
                            onChange={(e) => setFormMeetingTitle(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-cyan-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Deskripsi Lembar Kerja</label>
                        <textarea
                          rows={2}
                          placeholder="Tujuan analisis lembar kerja murid..."
                          value={formMeetingDesc}
                          onChange={(e) => setFormMeetingDesc(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Embed Preview URL (Google Drive preview)</label>
                          <input
                            type="text"
                            placeholder="https://drive.google.com/file/d/.../preview"
                            value={formMeetingEmbed}
                            onChange={(e) => setFormMeetingEmbed(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-cyan-500 font-mono text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Download URL</label>
                          <input
                            type="text"
                            placeholder="https://drive.google.com/file/d/.../view"
                            value={formMeetingDownload}
                            onChange={(e) => setFormMeetingDownload(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-cyan-500 font-mono text-[11px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Status Pertemuan</label>
                        <select
                          value={formMeetingStatus}
                          onChange={(e) => setFormMeetingStatus(e.target.value as any)}
                          className="w-full sm:w-48 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="scheduled">Terjadwal (Scheduled)</option>
                          <option value="ongoing">Sedang Berlangsung (Ongoing)</option>
                          <option value="completed">Selesai (Completed)</option>
                        </select>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowMeetingForm(false)}
                          className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={contentActionLoading}
                          className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1.5"
                        >
                          {contentActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Simpan Pertemuan</span>}
                        </button>
                      </div>
                    </form>
                  ) : null}

                  {roomMeetings.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                      Belum ada pertemuan LKPD di kelas ini. Klik "Tambah Pertemuan" untuk membuatnya.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {roomMeetings.map((m) => (
                        <div key={m.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center text-xs shrink-0">
                              LKM {m.number}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-xs text-slate-800">{m.title}</h5>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  m.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : m.status === 'ongoing'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-200 text-slate-600'
                                }`}>
                                  {m.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{m.description || 'Tidak ada deskripsi.'}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleOpenEditMeeting(m)}
                              title="Edit Pertemuan"
                              className="p-2 rounded-xl text-slate-500 hover:text-cyan-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMeeting(m)}
                              title="Hapus Pertemuan"
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowContentModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
