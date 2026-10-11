import React, { useEffect, useState } from 'react';
import { 
  Users, 
  DoorOpen,
  FileSpreadsheet, 
  Video, 
  CalendarCheck,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  Sparkles,
  Shield,
  Layers
} from 'lucide-react';
import { AdminTab } from '../../types';

interface DashboardStats {
  total_users: number;
  total_students: number;
  total_admins: number;
  total_rooms: number;
  active_rooms: number;
  total_submissions: number;
  pending_submissions: number;
  total_videos: number;
  pending_videos: number;
  total_journals: number;
  total_surveys: number;
  total_tests: number;
  open_attendance: number;
}

interface RoomSummary {
  id: number;
  name: string;
  room_key: string;
  cover_image: string | null;
  is_active: number | boolean;
  members_count: number;
  pending_lkm: number;
  pending_videos: number;
  open_sessions: number;
}

interface ActivityItem {
  type: string;
  text: string;
  room_id: number | null;
  room_name: string | null;
  at: string;
}

interface AdminDashboardViewProps {
  setActiveTab: (tab: AdminTab) => void;
  onSelectRoom?: (roomId: number) => void;
}

export default function AdminDashboardView({ setActiveTab, onSelectRoom }: AdminDashboardViewProps) {
  const [stats, setStats] = useState<DashboardStats>({
    total_users: 0,
    total_students: 0,
    total_admins: 0,
    total_rooms: 0,
    active_rooms: 0,
    total_submissions: 0,
    pending_submissions: 0,
    total_videos: 0,
    pending_videos: 0,
    total_journals: 0,
    total_surveys: 0,
    total_tests: 0,
    open_attendance: 0,
  });
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${API_BASE}/admin/dashboard-stats.php`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRooms(data.rooms || []);
        setActivity(data.activity || []);
      } else {
        setError(data.message || 'Gagal memuat statistik admin.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Koneksi ke server gagal. Pastikan backend aktif.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleOpenRoom = (roomId: number) => {
    if (onSelectRoom) {
      onSelectRoom(roomId);
    }
    setActiveTab('admin-rooms');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300 text-left">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-900 border border-cyan-200">
              Pusat Kontrol
            </span>
            <span className="text-xs text-slate-400">GAS Management System</span>
          </div>
          <h2 className="font-display font-black text-2xl md:text-3xl text-slate-800 tracking-tight">
            Dashboard Administrator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ringkasan lintas kelas, status pengumpulan modul murid, dan pemantauan aktivitas pembelajaran.
          </p>
        </div>
        <button 
          onClick={fetchStats}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-600 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-800 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Informasi Sistem</p>
            <p className="text-slate-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Grid Utama Statistik */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Kelas */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-cyan-50 text-cyan-700 rounded-2xl shrink-0">
            <DoorOpen className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">Total Kelas</span>
            <h4 className="text-2xl font-black text-slate-800 mt-0.5">
              {loading ? '...' : stats.total_rooms}
            </h4>
            <span className="text-[10px] text-emerald-600 font-semibold">{stats.active_rooms} Kelas Aktif</span>
          </div>
        </div>

        {/* Total Murid */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">Total Murid</span>
            <h4 className="text-2xl font-black text-slate-800 mt-0.5">
              {loading ? '...' : stats.total_students}
            </h4>
            <span className="text-[10px] text-slate-400 font-medium">{stats.total_users} Total Akun</span>
          </div>
        </div>

        {/* LKM Pending Grading */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">LKM Perlu Dinilai</span>
            <h4 className="text-2xl font-black text-amber-700 mt-0.5">
              {loading ? '...' : stats.pending_submissions}
            </h4>
            <span className="text-[10px] text-slate-400 font-medium">dari {stats.total_submissions} LKM</span>
          </div>
        </div>

        {/* Video Pending Review */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-700 rounded-2xl shrink-0">
            <Video className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">Video Review</span>
            <h4 className="text-2xl font-black text-rose-700 mt-0.5">
              {loading ? '...' : stats.pending_videos}
            </h4>
            <span className="text-[10px] text-slate-400 font-medium">dari {stats.total_videos} Video</span>
          </div>
        </div>
      </div>

      {/* Section: Ringkasan Seluruh Kelas */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-600" />
              <h3 className="font-display font-bold text-lg text-slate-800">
                Ringkasan Kelas Pembelajaran
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik pada kelas untuk membuka seluruh modul pengelolaan kelas tersebut.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('admin-rooms')}
            className="flex items-center gap-1.5 text-xs font-bold text-cyan-700 hover:text-cyan-800 cursor-pointer self-start sm:self-auto"
          >
            <span>Buka Semua Kelas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {rooms.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">
            Belum ada kelas yang terdaftar.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => {
              const hasActionNeeded = room.pending_lkm > 0 || room.pending_videos > 0;
              return (
                <div
                  key={room.id}
                  onClick={() => handleOpenRoom(room.id)}
                  className="p-5 rounded-2xl border border-slate-200/80 hover:border-cyan-400 hover:shadow-md transition-all cursor-pointer bg-slate-50/50 hover:bg-white flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                        {room.room_key}
                      </span>
                      {hasActionNeeded && (
                        <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          Perlu Tindakan
                        </span>
                      )}
                    </div>

                    <h4 className="font-display font-bold text-sm text-slate-800 group-hover:text-cyan-700 transition-colors line-clamp-1">
                      {room.name}
                    </h4>

                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200/60 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Murid</span>
                        <span className="text-sm font-bold text-slate-800">{room.members_count}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">LKM Menunggu</span>
                        <span className={`text-sm font-bold ${room.pending_lkm > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                          {room.pending_lkm}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Review Video</span>
                        <span className={`text-sm font-bold ${room.pending_videos > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                          {room.pending_videos}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-cyan-600 group-hover:text-cyan-700">
                    <span>Masuk ke Kelas</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid: Perlu Tindakan & Aktivitas Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Box: Komposisi Pengguna */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2 mb-6">
              <TrendingUp className="w-4 h-4 text-cyan-600" />
              <span>Komposisi Pengguna Website</span>
            </h3>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-500" /> Murid (Student)
                  </span>
                  <span className="text-slate-800 font-bold">
                    {stats.total_students} ({stats.total_users > 0 ? Math.round((stats.total_students / stats.total_users) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${stats.total_users > 0 ? (stats.total_students / stats.total_users) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-500" /> Administrator
                  </span>
                  <span className="text-slate-800 font-bold">
                    {stats.total_admins} ({stats.total_users > 0 ? Math.round((stats.total_admins / stats.total_users) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${stats.total_users > 0 ? (stats.total_admins / stats.total_users) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setActiveTab('admin-users')}
              className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>Kelola Pengguna Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Box: Aktivitas Terbaru Sistem */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-cyan-600" />
              <span>Aktivitas Terbaru Kelas</span>
            </h3>

            {activity.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 italic">
                Belum ada aktivitas tercatat.
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {activity.map((act, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-xs"
                  >
                    <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-700 font-medium truncate">{act.text}</p>
                      {act.room_name && (
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                          Kelas: {act.room_name}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                      {act.at ? new Date(act.at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400 font-semibold italic">
            * Seluruh perubahan tersimpan otomatis di database server GAS.
          </div>
        </div>
      </div>

    </div>
  );
}
