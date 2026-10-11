import React, { useState, useEffect } from 'react';
import { Room, RoomMember, Book, Meeting, AttendanceSession, AttendanceStatus, RoomContact } from '../../types';
import { roomService } from '../../services/roomService';
import { attendanceService } from '../../services/attendanceService';
import { contactService } from '../../services/contactService';
import AdminEcolabView from './AdminEcolabView';
import AdminEcocreationView from './AdminEcocreationView';
import AdminEcochallengeView from './AdminEcochallengeView';
import { 
  ArrowLeft, 
  LayoutDashboard, 
  Users, 
  FlaskConical, 
  BookOpen, 
  CalendarCheck, 
  Video, 
  HelpCircle, 
  Contact, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  KeyRound, 
  Copy, 
  Check, 
  Loader2, 
  Search, 
  FileSpreadsheet,
  DoorOpen,
  UserX,
  RefreshCw,
  Building2,
  Phone,
  Mail,
  User
} from 'lucide-react';

export type WorkspaceTab = 
  | 'ringkasan'
  | 'anggota'
  | 'ecolab'
  | 'ecopedia'
  | 'absensi'
  | 'ecocreation'
  | 'ecochallenge'
  | 'kontak'
  | 'pengaturan';

interface AdminClassWorkspaceProps {
  room: Room;
  onBack: () => void;
  onRoomUpdated: () => void;
  allRooms?: Room[];
}

export default function AdminClassWorkspace({
  room,
  onBack,
  onRoomUpdated,
  allRooms = []
}: AdminClassWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('ringkasan');
  const [copiedKey, setCopiedKey] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(room.room_key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const tabItems = [
    { id: 'ringkasan' as WorkspaceTab, label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'anggota' as WorkspaceTab, label: 'Anggota', icon: Users },
    { id: 'ecolab' as WorkspaceTab, label: 'EcoLab', icon: FlaskConical },
    { id: 'ecopedia' as WorkspaceTab, label: 'EcoPedia', icon: BookOpen },
    { id: 'absensi' as WorkspaceTab, label: 'Absensi', icon: CalendarCheck },
    { id: 'ecocreation' as WorkspaceTab, label: 'EcoCreation', icon: Video },
    { id: 'ecochallenge' as WorkspaceTab, label: 'EcoChallenge', icon: HelpCircle },
    { id: 'kontak' as WorkspaceTab, label: 'Kontak', icon: Contact },
    { id: 'pengaturan' as WorkspaceTab, label: 'Pengaturan', icon: Settings },
  ];

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

      {/* Sticky / Top Breadcrumb & Class Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="Kembali ke Semua Kelas"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-700" />
            <span className="hidden sm:inline">Semua Kelas</span>
          </button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-900 border border-cyan-200">
                Workspace Kelas
              </span>
              <button
                onClick={handleCopyKey}
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                title="Salin Kunci Kelas"
              >
                <span>Kunci: {room.room_key}</span>
                {copiedKey ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
              </button>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                Boolean(room.is_active) 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {Boolean(room.is_active) ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>

            <h2 className="font-display font-black text-xl md:text-2xl text-slate-800 truncate">
              {room.name}
            </h2>
          </div>
        </div>

        <div className="text-xs text-slate-400 self-start md:self-auto shrink-0">
          ID #{room.id}
        </div>
      </div>

      {/* Horizontal Tab Navigation Bar (Scrollable on mobile) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-xs overflow-x-auto scrollbar-none flex items-center gap-1">
        {tabItems.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-900 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-700' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="transition-all">
        {activeTab === 'ringkasan' && (
          <TabRingkasan 
            room={room} 
            setActiveTab={setActiveTab} 
          />
        )}

        {activeTab === 'anggota' && (
          <TabAnggota 
            roomId={room.id} 
            showToast={showToast} 
          />
        )}

        {activeTab === 'ecolab' && (
          <TabEcoLab 
            roomId={room.id} 
            showToast={showToast} 
          />
        )}

        {activeTab === 'ecopedia' && (
          <TabEcoPedia 
            roomId={room.id} 
            showToast={showToast} 
          />
        )}

        {activeTab === 'absensi' && (
          <TabAbsensi 
            roomId={room.id} 
            showToast={showToast} 
          />
        )}

        {activeTab === 'ecocreation' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs">
            <AdminEcocreationView roomId={room.id} />
          </div>
        )}

        {activeTab === 'ecochallenge' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs">
            <AdminEcochallengeView roomId={room.id} />
          </div>
        )}

        {activeTab === 'kontak' && (
          <TabKontak 
            roomId={room.id} 
            allRooms={allRooms} 
            showToast={showToast} 
          />
        )}

        {activeTab === 'pengaturan' && (
          <TabPengaturan 
            room={room} 
            onBack={onBack} 
            onRoomUpdated={onRoomUpdated} 
            showToast={showToast} 
          />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. TAB RINGKASAN
// ─────────────────────────────────────────────────────────────────────────────
function TabRingkasan({ room, setActiveTab }: { room: Room; setActiveTab: (t: WorkspaceTab) => void }) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    roomService.getRoomStats(room.id)
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [room.id]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
        <span className="text-xs text-slate-400 font-semibold">Memuat ringkasan kelas...</span>
      </div>
    );
  }

  const stats = data?.stats || {};
  const lkmPerMeeting = data?.lkm_per_meeting || [];
  const recent = data?.recent_submissions || [];

  return (
    <div className="space-y-6">
      {/* 4 Cards Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveTab('anggota')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-cyan-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Murid Terdaftar</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-black text-slate-800">{stats.members_count || 0}</span>
          <span className="text-[10px] text-cyan-600 font-bold block mt-1 group-hover:underline">Kelola Murid →</span>
        </div>

        <div 
          onClick={() => setActiveTab('ecolab')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-cyan-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LKM Menunggu</span>
            <FlaskConical className="w-4 h-4 text-emerald-600" />
          </div>
          <span className={`text-2xl font-black ${stats.lkm_pending > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
            {stats.lkm_pending || 0}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">dari {stats.lkm_total || 0} Submisi</span>
        </div>

        <div 
          onClick={() => setActiveTab('absensi')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-cyan-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tingkat Kehadiran</span>
            <CalendarCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-black text-indigo-700">{stats.attendance_rate || 0}%</span>
          <span className="text-[10px] text-slate-400 block mt-1">{stats.sessions_total || 0} Sesi Selesai</span>
        </div>

        <div 
          onClick={() => setActiveTab('ecocreation')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-cyan-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Video Menunggu</span>
            <Video className="w-4 h-4 text-rose-600" />
          </div>
          <span className={`text-2xl font-black ${stats.videos_pending > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
            {stats.videos_pending || 0}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">dari {stats.videos_total || 0} Video</span>
        </div>
      </div>

      {/* Progres LKM Per Pertemuan & Submisi Terkini */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Progres LKM */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-base text-slate-800">
                Progres Pengumpulan LKM Pertemuan
              </h3>
              <p className="text-xs text-slate-400">Status submisi LKM untuk setiap nomor pertemuan kelas ini</p>
            </div>
            <button
              onClick={() => setActiveTab('ecolab')}
              className="text-xs font-bold text-cyan-600 hover:text-cyan-700 cursor-pointer"
            >
              Lihat di EcoLab →
            </button>
          </div>

          {lkmPerMeeting.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 italic">
              Belum ada pertemuan LKM yang diset di kelas ini.
            </div>
          ) : (
            <div className="space-y-3">
              {lkmPerMeeting.map((m: any) => (
                <div key={m.meeting_code} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded-md">
                      LKM {m.number} ({m.meeting_code})
                    </span>
                    <h5 className="font-bold text-xs text-slate-800 mt-1 truncate">{m.title}</h5>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-800">{m.submitted} Mengumpulkan</span>
                    <span className="text-[10px] text-emerald-600 font-semibold block">{m.graded} Dinilai</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submisi LKM Terkini */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="font-display font-bold text-base text-slate-800 mb-1">
            Submisi LKM Terbaru
          </h3>
          <p className="text-xs text-slate-400 mb-4">Aktivitas pengumpulan terkini murid</p>

          {recent.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 italic">
              Belum ada berkas LKM yang dikumpulkan.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recent.map((item: any, idx: number) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <span className="font-bold text-slate-800 truncate block">{item.who}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Modul {item.meeting_id}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    item.status === 'graded' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.status === 'graded' ? 'Dinilai' : 'Menunggu'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. TAB ANGGOTA
// ─────────────────────────────────────────────────────────────────────────────
function TabAnggota({ roomId, showToast }: { roomId: number; showToast: (m: string, t?: any) => void }) {
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [removingId, setRemovingId] = useState<number | null>(null);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await roomService.getRoomMembers(roomId);
      setMembers(data);
    } catch (err: any) {
      showToast(err.message || 'Gagal memuat anggota', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [roomId]);

  const handleRemove = async (userId: number, name: string) => {
    if (!window.confirm(`Keluarkan murid "${name}" dari kelas ini?`)) return;
    setRemovingId(userId);
    try {
      await roomService.removeRoomMember(roomId, userId);
      showToast(`Murid "${name}" berhasil dikeluarkan dari kelas.`);
      setMembers(prev => prev.filter(m => m.id !== userId));
    } catch (err: any) {
      showToast(err.message || 'Gagal mengeluarkan murid.', 'error');
    } finally {
      setRemovingId(null);
    }
  };

  const filtered = members.filter(m => 
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-800">
            Daftar Murid Terdaftar ({members.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Murid yang telah bergabung ke kelas ini dengan kunci kelas</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari murid..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 italic">
          Tidak ada murid ditemukan.
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-4">Murid</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Tanggal Bergabung</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-900">{m.full_name}</td>
                  <td className="py-3 px-4 text-slate-500">{m.email}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    {new Date(m.joined_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleRemove(m.id, m.full_name)}
                      disabled={removingId === m.id}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] transition-colors cursor-pointer"
                      title="Keluarkan dari kelas"
                    >
                      {removingId === m.id ? 'Memproses...' : 'Keluarkan'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. TAB ECOLAB (Pertemuan LKM CRUD + Penilaian)
// ─────────────────────────────────────────────────────────────────────────────
function TabEcoLab({ roomId, showToast }: { roomId: number; showToast: (m: string, t?: any) => void }) {
  const [subTab, setSubTab] = useState<'grading' | 'meetings'>('grading');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal meeting
  const [showModal, setShowModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<any | null>(null);
  const [fNumber, setFNumber] = useState(1);
  const [fCode, setFCode] = useState('m1');
  const [fTitle, setFTitle] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fIcon, setFIcon] = useState('science');
  const [fStatus, setFStatus] = useState('scheduled');
  const [fEmbed, setFEmbed] = useState('');
  const [fDownload, setFDownload] = useState('');

  const loadMeetings = async () => {
    setLoading(true);
    try {
      const data = await roomService.getRoomMeetings(roomId);
      setMeetings(data);
    } catch (err: any) {
      showToast(err.message || 'Gagal memuat pertemuan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subTab === 'meetings') {
      loadMeetings();
    }
  }, [subTab, roomId]);

  const handleOpenAdd = () => {
    setEditingMeeting(null);
    const nextNum = meetings.length + 1;
    setFNumber(nextNum);
    setFCode(`m${nextNum}`);
    setFTitle('');
    setFDesc('');
    setFIcon('science');
    setFStatus('scheduled');
    setFEmbed('');
    setFDownload('');
    setShowModal(true);
  };

  const handleOpenEdit = (m: Meeting) => {
    setEditingMeeting(m);
    setFNumber(m.number);
    setFCode(m.id);
    setFTitle(m.title);
    setFDesc(m.description);
    setFIcon(m.icon);
    setFStatus(m.status);
    setFEmbed((m as any).embed_url || '');
    setFDownload((m as any).download_url || '');
    setShowModal(true);
  };

  const handleSaveMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fTitle.trim()) {
      showToast('Judul pertemuan wajib diisi.', 'error');
      return;
    }
    try {
      await roomService.saveRoomMeeting(roomId, {
        id: editingMeeting ? Number(editingMeeting.id) || 0 : 0,
        number: fNumber,
        meeting_code: fCode,
        title: fTitle,
        description: fDesc,
        icon: fIcon,
        status: fStatus,
        embed_url: fEmbed,
        download_url: fDownload
      });
      showToast('Pertemuan berhasil disimpan.');
      setShowModal(false);
      loadMeetings();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan pertemuan', 'error');
    }
  };

  const handleDeleteMeeting = async (m: Meeting) => {
    if (!window.confirm(`Hapus pertemuan "${m.title}"?`)) return;
    try {
      await roomService.deleteRoomMeeting(roomId, Number(m.id) || 0);
      showToast('Pertemuan berhasil dihapus.');
      loadMeetings();
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus pertemuan', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab switcher */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setSubTab('grading')}
          className={`pb-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            subTab === 'grading'
              ? 'border-cyan-600 text-cyan-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Penilaian LKM & Jurnal
        </button>
        <button
          onClick={() => setSubTab('meetings')}
          className={`pb-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            subTab === 'meetings'
              ? 'border-cyan-600 text-cyan-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Kelola Pertemuan Modul LKM
        </button>
      </div>

      {subTab === 'grading' ? (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs">
          <AdminEcolabView roomId={roomId} />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-800">
                Daftar Pertemuan EcoLab ({meetings.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Atur tautan Google Drive / PDF embed dan berkas download per pertemuan</p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pertemuan</span>
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {meetings.map((m) => (
                <div key={m.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-900">
                        Pertemuan #{m.number} ({m.id})
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        m.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        m.status === 'ongoing' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 mt-1">{m.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{m.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {(m as any).embed_url && (
                        <a href={(m as any).embed_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-cyan-600" title="Link Embed">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {(m as any).download_url && (
                        <a href={(m as any).download_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-cyan-600" title="Link Download">
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMeeting(m)}
                        className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                        title="Hapus Pertemuan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal Form Meeting */}
          {showModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 text-left shadow-2xl">
                <h3 className="font-display font-bold text-lg text-slate-800">
                  {editingMeeting ? 'Edit Pertemuan' : 'Tambah Pertemuan Baru'}
                </h3>
                <form onSubmit={handleSaveMeeting} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Nomor Pertemuan</label>
                      <input
                        type="number"
                        min={1}
                        value={fNumber}
                        onChange={(e) => setFNumber(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Kode Sesi</label>
                      <input
                        type="text"
                        value={fCode}
                        onChange={(e) => setFCode(e.target.value)}
                        placeholder="m1"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-cyan-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Judul Pertemuan</label>
                    <input
                      type="text"
                      value={fTitle}
                      onChange={(e) => setFTitle(e.target.value)}
                      placeholder="Contoh: Mengapa green chemistry penting?"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Deskripsi / Sasaran</label>
                    <textarea
                      rows={2}
                      value={fDesc}
                      onChange={(e) => setFDesc(e.target.value)}
                      placeholder="Lembar Kerja Murid..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Status</label>
                      <select
                        value={fStatus}
                        onChange={(e) => setFStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="scheduled">Scheduled (Dijadwalkan)</option>
                        <option value="ongoing">Ongoing (Sedang Berjalan)</option>
                        <option value="completed">Completed (Selesai)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Ikon</label>
                      <select
                        value={fIcon}
                        onChange={(e) => setFIcon(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="groups">Groups</option>
                        <option value="science">Science</option>
                        <option value="biotech">Biotech</option>
                        <option value="inventory">Inventory</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Link Embed Google Drive / Preview</label>
                    <input
                      type="text"
                      value={fEmbed}
                      onChange={(e) => setFEmbed(e.target.value)}
                      placeholder="https://drive.google.com/file/d/.../preview"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Link Unduhan Berkas / Download</label>
                    <input
                      type="text"
                      value={fDownload}
                      onChange={(e) => setFDownload(e.target.value)}
                      placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

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
                      className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs cursor-pointer"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. TAB ECOPEDIA (Buku Pembelajaran Kelas CRUD)
// ─────────────────────────────────────────────────────────────────────────────
function TabEcoPedia({ roomId, showToast }: { roomId: number; showToast: (m: string, t?: any) => void }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState<any | null>(null);
  const [fTitle, setFTitle] = useState('');
  const [fCategory, setFCategory] = useState('Kimia Hijau');
  const [fCover, setFCover] = useState('');
  const [fFlip, setFFlip] = useState('');
  const [fPdf, setFPdf] = useState('#');
  const [fDesc, setFDesc] = useState('');
  const [fContent, setFContent] = useState('');

  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = await roomService.getRoomEcopedia(roomId);
      setBooks(data);
    } catch (err: any) {
      showToast(err.message || 'Gagal memuat buku', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [roomId]);

  const handleOpenAdd = () => {
    setEditingBook(null);
    setFTitle('');
    setFCategory('Kimia Hijau');
    setFCover('./Cover Buku 1.png');
    setFFlip('');
    setFPdf('#');
    setFDesc('');
    setFContent('');
    setShowModal(true);
  };

  const handleOpenEdit = (b: Book) => {
    setEditingBook(b);
    setFTitle(b.title);
    setFCategory(b.category);
    setFCover(b.coverUrl);
    setFFlip(b.flipUrl || '');
    setFPdf(b.pdfUrl || '#');
    setFDesc(b.description || '');
    setFContent(b.content || '');
    setShowModal(true);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fTitle.trim()) {
      showToast('Judul buku wajib diisi.', 'error');
      return;
    }
    try {
      await roomService.saveRoomEcopedia(roomId, {
        id: editingBook ? Number(editingBook.id) || 0 : 0,
        title: fTitle,
        category: fCategory,
        cover_url: fCover,
        flip_url: fFlip,
        pdf_url: fPdf,
        description: fDesc,
        content: fContent
      });
      showToast('Buku berhasil disimpan.');
      setShowModal(false);
      loadBooks();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan buku', 'error');
    }
  };

  const handleDeleteBook = async (b: Book) => {
    if (!window.confirm(`Hapus buku "${b.title}"?`)) return;
    try {
      await roomService.deleteRoomEcopedia(roomId, Number(b.id) || 0);
      showToast('Buku berhasil dihapus.');
      loadBooks();
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus buku', 'error');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-800">
            Daftar Modul & Buku EcoPedia Kelas ({books.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Kelola pustaka bacaan interaktif FlipHTML5 dan referensi PDF untuk kelas ini</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Buku Materi</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
        </div>
      ) : books.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 italic">
          Belum ada buku materi khusus di kelas ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {books.map((b) => (
            <div key={b.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex gap-4">
              <div className="w-20 h-28 rounded-xl overflow-hidden bg-slate-200 shrink-0 shadow-xs border border-slate-300">
                <img src={b.coverUrl || './Cover Buku 1.png'} alt={b.title} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded-md inline-block mb-1">
                    {b.category || 'Materi'}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">{b.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{b.content || b.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2 mt-2">
                  <div className="flex items-center gap-2">
                    {b.flipUrl && (
                      <a href={b.flipUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-cyan-600 hover:underline flex items-center gap-1">
                        <span>Flipbook</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBook(b)}
                      className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                      title="Hapus Buku"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Book */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 text-left shadow-2xl">
            <h3 className="font-display font-bold text-lg text-slate-800">
              {editingBook ? 'Edit Buku Materi' : 'Tambah Buku Materi Baru'}
            </h3>
            <form onSubmit={handleSaveBook} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Judul Buku</label>
                <input
                  type="text"
                  value={fTitle}
                  onChange={(e) => setFTitle(e.target.value)}
                  placeholder="Contoh: Solusi Sat-Set untuk Penyelamatan Bumi"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Kategori</label>
                  <input
                    type="text"
                    value={fCategory}
                    onChange={(e) => setFCategory(e.target.value)}
                    placeholder="Kimia Hijau / Ekoenzim"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">URL Sampul (Cover)</label>
                  <input
                    type="text"
                    value={fCover}
                    onChange={(e) => setFCover(e.target.value)}
                    placeholder="./Cover Buku 1.png"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Link FlipHTML5 (Flipbook)</label>
                <input
                  type="text"
                  value={fFlip}
                  onChange={(e) => setFFlip(e.target.value)}
                  placeholder="https://online.fliphtml5.com/..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Ringkasan / Konten Pembelajaran</label>
                <textarea
                  rows={4}
                  value={fContent}
                  onChange={(e) => setFContent(e.target.value)}
                  placeholder="Penjelasan ringkas materi buku..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

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
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. TAB ABSENSI (Manajemen Sesi, Koreksi Hadir/Izin/Sakit/Alpa, Rekap & CSV)
// ─────────────────────────────────────────────────────────────────────────────
function TabAbsensi({ roomId, showToast }: { roomId: number; showToast: (m: string, t?: any) => void }) {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Sub-view: sessions list vs recap matrix
  const [viewMode, setViewMode] = useState<'sessions' | 'recap'>('sessions');

  // Modal Create / Edit Session
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSession, setEditingSession] = useState<any | null>(null);
  const [sTitle, setSTitle] = useState('');
  const [sDate, setSDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [sCode, setSCode] = useState('');
  const [sDuration, setSDuration] = useState(0);

  // Modal Detail / Koreksi Kehadiran Sesi
  const [detailSession, setDetailSession] = useState<AttendanceSession | null>(null);
  const [detailStudents, setDetailStudents] = useState<any[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Recap data
  const [recapData, setRecapData] = useState<any | null>(null);
  const [loadingRecap, setLoadingRecap] = useState(false);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getSessions(roomId);
      setSessions(data.sessions || []);
    } catch (err: any) {
      showToast(err.message || 'Gagal memuat sesi absensi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [roomId]);

  const handleOpenAddSession = () => {
    setEditingSession(null);
    setSTitle(`Pertemuan ${sessions.length + 1}`);
    setSDate(new Date().toISOString().split('T')[0]);
    setSCode('');
    setSDuration(90);
    setShowSessionModal(true);
  };

  const handleOpenEditSession = (s: AttendanceSession) => {
    setEditingSession(s);
    setSTitle(s.title);
    setSDate(s.session_date);
    setSCode(s.access_code || '');
    setSDuration(0);
    setShowSessionModal(true);
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sTitle.trim()) {
      showToast('Judul sesi wajib diisi.', 'error');
      return;
    }
    try {
      if (editingSession) {
        await attendanceService.updateSession({
          session_id: editingSession.id,
          title: sTitle,
          session_date: sDate,
          access_code: sCode
        });
        showToast('Sesi absensi diperbarui.');
      } else {
        await attendanceService.createSession({
          room_id: roomId,
          title: sTitle,
          session_date: sDate,
          access_code: sCode,
          duration_minutes: sDuration
        });
        showToast('Sesi absensi berhasil dibuka.');
      }
      setShowSessionModal(false);
      loadSessions();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan sesi', 'error');
    }
  };

  const handleToggleStatus = async (s: AttendanceSession) => {
    const nextStatus = s.status === 'open' ? 'closed' : 'open';
    try {
      await attendanceService.setStatus(s.id, nextStatus);
      showToast(nextStatus === 'open' ? 'Sesi dibuka kembali.' : 'Sesi ditutup.');
      loadSessions();
    } catch (err: any) {
      showToast(err.message || 'Gagal mengubah status sesi', 'error');
    }
  };

  const handleDeleteSession = async (s: AttendanceSession) => {
    if (!window.confirm(`Hapus sesi absensi "${s.title}" beserta seluruh catatan hadir murid?`)) return;
    try {
      await attendanceService.deleteSession(s.id);
      showToast('Sesi absensi dihapus.');
      loadSessions();
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus sesi', 'error');
    }
  };

  const handleOpenDetail = async (s: AttendanceSession) => {
    setDetailSession(s);
    setLoadingDetail(true);
    try {
      const data = await attendanceService.getSessionDetail(roomId, s.id);
      setDetailStudents(data.students || []);
    } catch (err: any) {
      showToast(err.message || 'Gagal memuat catatan sesi', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleMarkStatus = async (studentId: number, status: AttendanceStatus | '', note?: string) => {
    if (!detailSession) return;
    try {
      await attendanceService.mark({
        session_id: detailSession.id,
        student_id: studentId,
        status,
        note
      });
      // update state locally
      setDetailStudents(prev => prev.map(item => item.id === studentId ? { ...item, status: status || null, note: note || null } : item));
      loadSessions(); // update counts
    } catch (err: any) {
      showToast(err.message || 'Gagal mengupdate status', 'error');
    }
  };

  const handleBulkMark = async (status: AttendanceStatus) => {
    if (!detailSession) return;
    if (!window.confirm(`Tandai semua murid yang belum ada catatan sebagai "${status}"?`)) return;
    try {
      const msg = await attendanceService.bulkMark(detailSession.id, status);
      showToast(msg);
      const data = await attendanceService.getSessionDetail(roomId, detailSession.id);
      setDetailStudents(data.students || []);
      loadSessions();
    } catch (err: any) {
      showToast(err.message || 'Gagal menandai murid', 'error');
    }
  };

  const loadRecap = async () => {
    setLoadingRecap(true);
    try {
      const data = await attendanceService.getRecap(roomId);
      setRecapData(data);
    } catch (err: any) {
      showToast(err.message || 'Gagal memuat rekap', 'error');
    } finally {
      setLoadingRecap(false);
    }
  };

  const handleExportCSV = () => {
    if (!recapData) return;
    const { sessions: sList, members: mList, records: rList } = recapData;
    
    // Header CSV: Nama, Email, [Sesi 1..n], Total Hadir, % Kehadiran
    const headers = ['Nama Murid', 'Email', ...sList.map((s: any) => `"${s.title} (${s.session_date})"`), 'Total Hadir', 'Persentase'];
    
    const rows = mList.map((m: any) => {
      let hadirCount = 0;
      const sessionCols = sList.map((s: any) => {
        const record = rList.find((r: any) => r.session_id === s.id && r.student_id === m.id);
        const status = record?.status || (s.status === 'closed' ? 'alpa' : '-');
        if (status === 'hadir') hadirCount++;
        return status.toUpperCase();
      });
      const pct = sList.length > 0 ? Math.round((hadirCount / sList.length) * 100) : 0;
      return [
        `"${m.full_name}"`,
        `"${m.email}"`,
        ...sessionCols,
        hadirCount,
        `${pct}%`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_absensi_kelas_${roomId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-800">
            Sistem Absensi Kelas
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Buka sesi presensi, atur kode akses, pantau dan koreksi kehadiran murid</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('sessions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'sessions' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Daftar Sesi ({sessions.length})
            </button>
            <button
              onClick={() => { setViewMode('recap'); loadRecap(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'recap' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Rekap Matriks
            </button>
          </div>

          <button
            onClick={handleOpenAddSession}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buka Sesi Baru</span>
          </button>
        </div>
      </div>

      {viewMode === 'sessions' ? (
        loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 italic">
            Belum ada sesi absensi di kelas ini. Klik tombol "Buka Sesi Baru" untuk memulai presensi.
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => {
              const isOpen = s.status === 'open';
              return (
                <div 
                  key={s.id} 
                  className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isOpen ? 'bg-cyan-50/30 border-cyan-300' : 'bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                        {s.session_date}
                      </span>
                      <button
                        onClick={() => handleToggleStatus(s)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                          isOpen ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {isOpen ? '● Sesi Terbuka' : 'Sesi Ditutup'}
                      </button>
                      {s.access_code && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                          <KeyRound className="w-3 h-3 text-amber-600" />
                          Kode: {s.access_code}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{s.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                      <span className="text-emerald-700 font-bold">{s.hadir_count} Hadir</span>
                      <span className="text-blue-700 font-bold">{s.izin_count} Izin</span>
                      <span className="text-amber-700 font-bold">{s.sakit_count} Sakit</span>
                      <span className="text-rose-700 font-bold">{s.alpa_count} Alpa</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenDetail(s)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Koreksi & Presensi Murid
                    </button>
                    <button
                      onClick={() => handleOpenEditSession(s)}
                      className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
                      title="Edit Sesi"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSession(s)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                      title="Hapus Sesi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* View Rekap Matriks */
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 font-semibold">Rekap Kehadiran Seluruh Murid per Sesi Pertemuan</span>
            <button
              onClick={handleExportCSV}
              disabled={!recapData || recapData.members.length === 0}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>
          </div>

          {loadingRecap ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
            </div>
          ) : !recapData || recapData.members.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 italic">
              Belum ada data untuk direkap.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                  <tr>
                    <th className="py-3 px-3 sticky left-0 bg-slate-50 z-10">Murid</th>
                    {recapData.sessions.map((s: any) => (
                      <th key={s.id} className="py-3 px-2 text-center truncate max-w-[100px]" title={s.title}>
                        {s.title}
                      </th>
                    ))}
                    <th className="py-3 px-3 text-center">Hadir</th>
                    <th className="py-3 px-3 text-center">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recapData.members.map((m: any) => {
                    let totalHadir = 0;
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-bold sticky left-0 bg-white z-10 truncate max-w-[160px]">
                          {m.full_name}
                        </td>
                        {recapData.sessions.map((s: any) => {
                          const record = recapData.records.find((r: any) => r.session_id === s.id && r.student_id === m.id);
                          const status = record?.status || (s.status === 'closed' ? 'alpa' : null);
                          if (status === 'hadir') totalHadir++;

                          return (
                            <td key={s.id} className="py-2.5 px-2 text-center font-bold text-[10px]">
                              {status === 'hadir' && <span className="text-emerald-700">H</span>}
                              {status === 'izin' && <span className="text-blue-700">I</span>}
                              {status === 'sakit' && <span className="text-amber-700">S</span>}
                              {status === 'alpa' && <span className="text-rose-700">A</span>}
                              {!status && <span className="text-slate-300">-</span>}
                            </td>
                          );
                        })}
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900">{totalHadir}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-700">
                          {recapData.sessions.length > 0 ? Math.round((totalHadir / recapData.sessions.length) * 100) : 0}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Buka / Edit Sesi Absensi */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 text-left shadow-2xl">
            <h3 className="font-display font-bold text-lg text-slate-800">
              {editingSession ? 'Edit Sesi Absensi' : 'Buka Sesi Absensi Baru'}
            </h3>
            <form onSubmit={handleSaveSession} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Judul / Topik Pertemuan</label>
                <input
                  type="text"
                  value={sTitle}
                  onChange={(e) => setSTitle(e.target.value)}
                  placeholder="Contoh: Sesi Praktikum 1: Kimia Hijau"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tanggal Sesi</label>
                <input
                  type="date"
                  value={sDate}
                  onChange={(e) => setSDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Kode Akses Sesi (Opsional)</label>
                  <button
                    type="button"
                    onClick={() => {
                      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                      let code = '';
                      for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
                      setSCode(code);
                    }}
                    className="text-[10px] text-cyan-600 font-bold hover:underline cursor-pointer"
                  >
                    Acak Kode
                  </button>
                </div>
                <input
                  type="text"
                  value={sCode}
                  onChange={(e) => setSCode(e.target.value.toUpperCase())}
                  placeholder="Kosongkan bila presensi bebas kode"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {!editingSession && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Batas Waktu Buka (Menit)</label>
                  <input
                    type="number"
                    min={0}
                    step={15}
                    value={sDuration}
                    onChange={(e) => setSDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <span className="text-[10px] text-slate-400">0 = sesi tetap terbuka sampai ditutup manual</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs cursor-pointer"
                >
                  Simpan Sesi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Presensi Murid */}
      {detailSession && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 text-left shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded-md">
                  Presensi: {detailSession.session_date}
                </span>
                <h3 className="font-display font-bold text-lg text-slate-800 mt-1">
                  {detailSession.title}
                </h3>
              </div>
              <button
                onClick={() => setDetailSession(null)}
                className="text-slate-400 hover:text-slate-700 p-1 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Bulk Action */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-600">Aksi Cepat Murid Belum Tercatat:</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleBulkMark('hadir')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[10px] cursor-pointer"
                >
                  Tandai Hadir Semua
                </button>
                <button
                  onClick={() => handleBulkMark('alpa')}
                  className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-[10px] cursor-pointer"
                >
                  Tandai Alpa Semua
                </button>
              </div>
            </div>

            {loadingDetail ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
              </div>
            ) : detailStudents.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 italic">
                Belum ada murid di kelas ini.
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {detailStudents.map((st) => (
                  <div key={st.id} className="p-3 rounded-xl bg-slate-50 border border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h5 className="font-bold text-xs text-slate-900 truncate">{st.full_name}</h5>
                      <p className="text-[10px] text-slate-400">{st.email}</p>
                      {st.checked_in_at && (
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                          Check-in: {new Date(st.checked_in_at).toLocaleTimeString('id-ID')} ({st.marked_by})
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {(['hadir', 'izin', 'sakit', 'alpa'] as AttendanceStatus[]).map((stt) => {
                        const isCurrent = st.status === stt;
                        return (
                          <button
                            key={stt}
                            onClick={() => handleMarkStatus(st.id, isCurrent ? '' : stt)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                              isCurrent
                                ? stt === 'hadir' ? 'bg-emerald-600 text-white' :
                                  stt === 'izin' ? 'bg-blue-600 text-white' :
                                  stt === 'sakit' ? 'bg-amber-600 text-white' : 'bg-rose-600 text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {stt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. TAB KONTAK (EcoContact Per Kelas)
// ─────────────────────────────────────────────────────────────────────────────
function TabKontak({ 
  roomId, 
  allRooms, 
  showToast 
}: { 
  roomId: number; 
  allRooms: Room[]; 
  showToast: (m: string, t?: any) => void 
}) {
  const [contacts, setContacts] = useState<RoomContact[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal create / edit
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<any | null>(null);
  const [cName, setCName] = useState('');
  const [cRole, setCRole] = useState('');
  const [cInstansi, setCInstansi] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cHours, setCHours] = useState('');
  const [cAvatar, setCAvatar] = useState('');
  const [cSort, setCSort] = useState(0);

  // Modal Copy From Room
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copySourceRoomId, setCopySourceRoomId] = useState<number>(0);
  const [isCopying, setIsCopying] = useState(false);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const data = await contactService.getRoomContacts(roomId);
      setContacts(data);
    } catch (err: any) {
      showToast(err.message || 'Gagal memuat kontak', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, [roomId]);

  const handleOpenAdd = () => {
    setEditingContact(null);
    setCName('');
    setCRole('Guru Kimia & Fasilitator');
    setCInstansi('Universitas Negeri Surabaya');
    setCEmail('');
    setCPhone('');
    setCHours('08.00 - 15.00 WIB');
    setCAvatar('./azza.jpg');
    setCSort(contacts.length);
    setShowModal(true);
  };

  const handleOpenEdit = (c: RoomContact) => {
    setEditingContact(c);
    setCName(c.name);
    setCRole(c.role || '');
    setCInstansi(c.instansi || '');
    setCEmail(c.email || '');
    setCPhone(c.phone || '');
    setCHours(c.office_hours || '');
    setCAvatar(c.avatar_url || '');
    setCSort(c.sort_order || 0);
    setShowModal(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim()) {
      showToast('Nama kontak wajib diisi.', 'error');
      return;
    }
    try {
      await contactService.saveRoomContact(roomId, {
        id: editingContact ? editingContact.id : undefined,
        name: cName,
        role: cRole,
        instansi: cInstansi,
        email: cEmail,
        phone: cPhone,
        office_hours: cHours,
        avatar_url: cAvatar,
        sort_order: cSort
      });
      showToast('Kontak berhasil disimpan.');
      setShowModal(false);
      loadContacts();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan kontak', 'error');
    }
  };

  const handleDeleteContact = async (c: RoomContact) => {
    if (!window.confirm(`Hapus kontak "${c.name}"?`)) return;
    try {
      await contactService.deleteRoomContact(roomId, c.id);
      showToast('Kontak dihapus.');
      loadContacts();
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus kontak', 'error');
    }
  };

  const handleCopyFromRoom = async () => {
    if (copySourceRoomId <= 0) {
      showToast('Pilih kelas sumber kontak.', 'error');
      return;
    }
    setIsCopying(true);
    try {
      const msg = await contactService.copyFromRoom(roomId, copySourceRoomId);
      showToast(msg);
      setShowCopyModal(false);
      loadContacts();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyalin kontak', 'error');
    } finally {
      setIsCopying(false);
    }
  };

  const otherRooms = allRooms.filter(r => r.id !== roomId);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-800">
            Daftar EcoContact Kelas ({contacts.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Kontak dosen pembimbing, guru, dan fasilitator yang tampil pada sidebar murid kelas ini</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {otherRooms.length > 0 && (
            <button
              onClick={() => { setCopySourceRoomId(otherRooms[0].id); setShowCopyModal(true); }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-cyan-700" />
              <span>Salin dari Kelas Lain</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kontak Baru</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 italic">
          Belum ada kontak pembimbing di kelas ini. Anda dapat menambahkan kontak baru atau menyalin dari kelas lain.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((c) => (
            <div key={c.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                    {c.avatar_url ? (
                      <img src={c.avatar_url.startsWith('./') ? c.avatar_url.substring(1) : c.avatar_url} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded-md inline-block mb-0.5">
                      {c.role || 'Pembimbing'}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 truncate">{c.name}</h4>
                    {c.instansi && <p className="text-[11px] text-slate-400 truncate">{c.instansi}</p>}
                  </div>
                </div>

                <div className="space-y-1 mt-3 pt-3 border-t border-slate-200/60 text-[11px] text-slate-600">
                  {c.office_hours && <p className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-cyan-600" /> Jam: {c.office_hours}</p>}
                  {c.email && <p className="flex items-center gap-1.5 truncate"><Mail className="w-3 h-3 text-cyan-600" /> {c.email}</p>}
                  {c.phone && <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-cyan-600" /> {c.phone}</p>}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-end gap-1.5">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteContact(c)}
                  className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                  title="Hapus Kontak"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Contact */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto space-y-4 text-left shadow-2xl">
            <h3 className="font-display font-bold text-lg text-slate-800">
              {editingContact ? 'Edit Kontak Pembimbing' : 'Tambah Kontak Baru'}
            </h3>
            <form onSubmit={handleSaveContact} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  placeholder="Contoh: Azza Nuriah Widowati, M.Pd."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Peran / Jabatan</label>
                  <input
                    type="text"
                    value={cRole}
                    onChange={(e) => setCRole(e.target.value)}
                    placeholder="Guru / Promotor"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Instansi / Lembaga</label>
                  <input
                    type="text"
                    value={cInstansi}
                    onChange={(e) => setCInstansi(e.target.value)}
                    placeholder="UNESA"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={cEmail}
                    onChange={(e) => setCEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nomor WhatsApp</label>
                  <input
                    type="text"
                    value={cPhone}
                    onChange={(e) => setCPhone(e.target.value)}
                    placeholder="08155..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Jam Konsultasi</label>
                <input
                  type="text"
                  value={cHours}
                  onChange={(e) => setCHours(e.target.value)}
                  placeholder="08.00 - 15.00 WIB"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">URL Avatar / File Foto</label>
                <input
                  type="text"
                  value={cAvatar}
                  onChange={(e) => setCAvatar(e.target.value)}
                  placeholder="./azza.jpg atau URL gambar"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

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
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs cursor-pointer"
                >
                  Simpan Kontak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Salin dari Kelas Lain */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 text-left shadow-2xl">
            <h3 className="font-display font-bold text-lg text-slate-800">
              Salin Kontak dari Kelas Lain
            </h3>
            <p className="text-xs text-slate-500">
              Seluruh kontak dari kelas sumber akan diduplikasi ke kelas ini tanpa menghapus kontak yang sudah ada.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Pilih Kelas Sumber</label>
              <select
                value={copySourceRoomId}
                onChange={(e) => setCopySourceRoomId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {otherRooms.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.room_key})</option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCopyModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCopyFromRoom}
                disabled={isCopying}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
              >
                {isCopying ? 'Menyalin...' : 'Salin Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. TAB PENGATURAN (Edit Kelas, Aktif/Nonaktif, Hapus)
// ─────────────────────────────────────────────────────────────────────────────
function TabPengaturan({ 
  room, 
  onBack, 
  onRoomUpdated, 
  showToast 
}: { 
  room: Room; 
  onBack: () => void; 
  onRoomUpdated: () => void; 
  showToast: (m: string, t?: any) => void 
}) {
  const [name, setName] = useState(room.name);
  const [desc, setDesc] = useState(room.description || '');
  const [key, setKey] = useState(room.room_key);
  const [cover, setCover] = useState(room.cover_image || '');
  const [isActive, setIsActive] = useState(Boolean(room.is_active));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim()) {
      showToast('Nama kelas dan kunci kelas wajib diisi.', 'error');
      return;
    }
    setSaving(true);
    try {
      await roomService.updateRoom({
        id: room.id,
        name,
        description: desc,
        room_key: key,
        cover_image: cover,
        is_active: isActive ? 1 : 0
      });
      showToast('Perubahan informasi kelas berhasil disimpan.');
      onRoomUpdated();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan perubahan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmation = prompt(`PERINGATAN: Ketik nama kelas "${room.name}" persis untuk mengonfirmasi penghapusan kelas ini:`);
    if (confirmation !== room.name) {
      showToast('Konfirmasi nama tidak cocok. Penghapusan dibatalkan.', 'error');
      return;
    }

    setDeleting(true);
    try {
      await roomService.deleteRoom(room.id);
      showToast(`Kelas "${room.name}" berhasil dihapus.`);
      onRoomUpdated();
      onBack();
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus kelas.', 'error');
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Pengaturan */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xs">
        <h3 className="font-display font-bold text-lg text-slate-800 mb-1">
          Pengaturan Informasi Kelas
        </h3>
        <p className="text-xs text-slate-400 mb-6">Ubah data identitas, kunci akses murid, gambar sampul, dan status aktif kelas</p>

        <form onSubmit={handleSave} className="space-y-4 max-w-xl">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Nama Ruang Kelas</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-slate-800"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Kunci Kelas (Room Key)</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
            <span className="text-[10px] text-slate-400">Kunci ini dibagikan ke murid untuk bergabung ke kelas</span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Deskripsi Kelas</label>
            <textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">URL Gambar Sampul (Cover Image)</label>
            <input
              type="text"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-xs font-bold text-slate-700">Status Kelas Aktif (Dapat diakses murid)</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone: Hapus Kelas */}
      <div className="bg-rose-50/60 rounded-3xl border border-rose-200 p-6 md:p-8">
        <h4 className="font-display font-bold text-base text-rose-900 mb-1">
          Zona Berbahaya: Hapus Ruang Kelas
        </h4>
        <p className="text-xs text-rose-700 leading-relaxed max-w-xl mb-4">
          Menghapus kelas ini akan membersihkan seluruh data turunan kelas, termasuk sesi absensi, catatan kontak, keanggotaan murid, dan penyesuaian materi kelas. Tindakan ini tidak dapat dibatalkan.
        </p>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          <span>{deleting ? 'Menghapus Kelas...' : 'Hapus Kelas Ini Secara Permanen'}</span>
        </button>
      </div>
    </div>
  );
}
