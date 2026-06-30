import React, { useEffect, useState } from 'react';
import { 
  Users, 
  UserCheck, 
  GraduationCap, 
  ShieldAlert, 
  FileSpreadsheet, 
  Video, 
  Mail, 
  Award,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { AdminTab } from '../../types';

interface DashboardStats {
  total_users: number;
  total_students: number;
  total_admins: number;
  total_submissions: number;
  pending_submissions: number;
  total_videos: number;
  pending_videos: number;
  total_messages: number;
  unread_messages: number;
  total_points: number;
}

interface AdminDashboardViewProps {
  setActiveTab: (tab: AdminTab) => void;
}

export default function AdminDashboardView({ setActiveTab }: AdminDashboardViewProps) {
  const [stats, setStats] = useState<DashboardStats>({
    total_users: 0,
    total_students: 0,
    total_admins: 0,
    total_submissions: 0,
    pending_submissions: 0,
    total_videos: 0,
    pending_videos: 0,
    total_messages: 0,
    unread_messages: 0,
    total_points: 0,
  });
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
      } else {
        setError(data.message || 'Gagal memuat statistik admin.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Koneksi gagal. Pastikan XAMPP dan server database menyala.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center text-left">
        <div>
          <h2 className="font-display font-black text-2xl text-slate-800">Pusat Kontrol Administrator</h2>
          <p className="text-xs text-gray-500">Kelola pengguna website, tinjau performa database, dan koordinasikan peran instruktur/guru.</p>
        </div>
        <button 
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-white rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-600 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-800 text-xs font-semibold text-left">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-bold">Informasi Sistem</p>
            <p className="text-gray-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Grid Utama Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
        
        {/* Total Users */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Pengguna</span>
            <h4 className="text-xl font-bold text-gray-800 mt-0.5">
              {loading ? '...' : stats.total_users}
            </h4>
          </div>
        </div>

        {/* Distributed Eco Points */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Eco-Points</span>
            <h4 className="text-xl font-bold text-gray-800 mt-0.5">
              {loading ? '...' : stats.total_points.toLocaleString('id-ID')} EP
            </h4>
          </div>
        </div>

        {/* Submissions Pending */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">LKM Menunggu Nilai</span>
            <h4 className="text-xl font-bold text-gray-800 mt-0.5 flex items-center gap-1.5">
              {loading ? '...' : stats.pending_submissions}
              {stats.pending_submissions > 0 && (
                <span className="text-[8px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">Pending</span>
              )}
            </h4>
          </div>
        </div>

        {/* Unread Contact Messages */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Pesan Belum Dibaca</span>
            <h4 className="text-xl font-bold text-gray-800 mt-0.5 flex items-center gap-1.5">
              {loading ? '...' : stats.unread_messages}
              {stats.unread_messages > 0 && (
                <span className="text-[8px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold">Baru</span>
              )}
            </h4>
          </div>
        </div>

      </div>

      {/* Grid Distribusi Peran & Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        
        {/* Distribusi Pengguna */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2 mb-6">
              <TrendingUp className="w-4 h-4 text-cyan-600" />
              <span>Komposisi Pengguna</span>
            </h3>
            
            <div className="space-y-4">
              {/* Student progress bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-gray-600 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-blue-500" /> Siswa (Student)
                  </span>
                  <span className="text-gray-800">{stats.total_students} ({stats.total_users > 0 ? Math.round((stats.total_students / stats.total_users) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${stats.total_users > 0 ? (stats.total_students / stats.total_users) * 100 : 0}%` }}
                  />
                </div>
              </div>


              {/* Admin progress bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-gray-600 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" /> Administrator
                  </span>
                  <span className="text-gray-800">{stats.total_admins} ({stats.total_users > 0 ? Math.round((stats.total_admins / stats.total_users) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${stats.total_users > 0 ? (stats.total_admins / stats.total_users) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-150 flex justify-end">
            <button
              onClick={() => setActiveTab('admin-users')}
              className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 hover:underline transition-all cursor-pointer"
            >
              <span>Kelola Pengguna Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Statistik Modul Lainnya */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2 mb-6">
              <ShieldAlert className="w-4 h-4 text-cyan-600" />
              <span>Aktivitas Sistem & Modul</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Pengumpulan LKM</span>
                <span className="text-xl font-bold text-slate-700 mt-1 block">{stats.total_submissions} LKM</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Video EcoCreation</span>
                <span className="text-xl font-bold text-slate-700 mt-1 block flex items-center gap-1.5">
                  {stats.total_videos} Video
                  {stats.pending_videos > 0 && (
                    <span className="text-[8px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">{stats.pending_videos} Review</span>
                  )}
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl col-span-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Hubungan Pesan Kontak</span>
                <span className="text-sm font-semibold text-slate-700 mt-1 block">
                  Total {stats.total_messages} pesan masuk dari siswa.
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-gray-150 flex justify-start text-xs text-gray-400 font-semibold italic">
            * Seluruh hak akses dilindungi oleh sistem token otorisasi GAS Website.
          </div>
        </div>

      </div>

    </div>
  );
}
