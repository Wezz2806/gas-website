import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Award, 
  Clock, 
  Flame, 
  ArrowRight, 
  User, 
  AlertCircle, 
  RefreshCw,
  TrendingUp,
  FileCheck2
} from 'lucide-react';
import { TeacherTab } from '../../types';

interface DashboardStats {
  total_students: number;
  total_pending_submissions: number;
  average_points: number;
  average_streak: number;
}

interface StudentItem {
  id: number;
  full_name: string;
  email: string;
  eco_points: number;
  streak: number;
  avatar_url: string | null;
}

interface ActivityItem {
  id: number;
  submitted_at: string;
  status: string;
  student_name: string;
  meeting_id: string;
}

interface TeacherDashboardViewProps {
  setActiveTab: (tab: TeacherTab) => void;
}

export default function TeacherDashboardView({ setActiveTab }: TeacherDashboardViewProps) {
  const [stats, setStats] = useState<DashboardStats>({
    total_students: 0,
    total_pending_submissions: 0,
    average_points: 0,
    average_streak: 0
  });
  const [topStudents, setTopStudents] = useState<StudentItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/teacher/dashboard-stats.php', {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setTopStudents(data.top_students || []);
        setRecentActivity(data.recent_activity || []);
      } else {
        setError(data.message || 'Gagal memuat data statistik.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Koneksi gagal. Silakan coba beberapa saat lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center text-left">
        <div>
          <h2 className="font-display font-black text-2xl text-[#154212]">Dashboard Guru</h2>
          <p className="text-xs text-gray-500">Pantau aktivitas, kemajuan kelas, dan kelola tugas mahasiswa dalam satu dashboard terpadu.</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-white rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-800 text-xs font-semibold text-left">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-bold">Perhatian</p>
            <p className="text-gray-600 mt-0.5">{error} (Silakan pastikan tabel basis data ter-migrate dengan benar)</p>
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
        
        {/* Total Students Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Siswa</span>
            <h4 className="text-xl font-bold text-gray-800 mt-0.5">
              {loading ? '...' : stats.total_students}
            </h4>
          </div>
        </div>

        {/* Pending Submissions Card */}
        <div 
          onClick={() => setActiveTab('teacher-submissions')}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer"
        >
          <div className={`p-3 rounded-2xl ${stats.total_pending_submissions > 0 ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-gray-50 text-gray-400'}`}>
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Tugas Menunggu</span>
            <h4 className="text-xl font-bold text-gray-800 mt-0.5 flex items-center gap-1.5">
              {loading ? '...' : stats.total_pending_submissions}
              {stats.total_pending_submissions > 0 && (
                <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">Butuh Dinilai</span>
              )}
            </h4>
          </div>
        </div>

        {/* Average Eco-Points Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#91f78e]/10 text-emerald-800 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Rata-rata Poin</span>
            <h4 className="text-xl font-bold text-gray-800 mt-0.5">
              {loading ? '...' : stats.average_points} <span className="text-xs font-normal text-gray-450">EP</span>
            </h4>
          </div>
        </div>

        {/* Average Streak Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Rata-rata Streak</span>
            <h4 className="text-xl font-bold text-gray-800 mt-0.5">
              {loading ? '...' : stats.average_streak} <span className="text-xs font-normal text-gray-450">Hari</span>
            </h4>
          </div>
        </div>

      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        
        {/* Left: Top Students Leaderboard (7 Columns) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-display font-bold text-base text-[#154212] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Siswa Teraktif (Top 5)</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Daftar siswa dengan poin tertinggi di kelas Anda.</p>
              </div>
              <button 
                onClick={() => setActiveTab('teacher-progress')}
                className="text-xs font-bold text-[#006e1c] hover:text-[#154212] flex items-center gap-1 hover:underline transition-all"
              >
                <span>Semua Siswa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center items-center">
                <div className="w-6 h-6 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : topStudents.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400 font-semibold border-2 border-dashed border-gray-100 rounded-2xl">
                Belum ada data siswa terdaftar.
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {topStudents.map((student, idx) => (
                  <div key={student.id} className="py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-50 text-[#006e1c] text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {student.avatar_url ? (
                        <img 
                          src={student.avatar_url} 
                          alt={student.full_name} 
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <h5 className="font-bold text-sm text-[#1a1c1c]">{student.full_name}</h5>
                        <p className="text-[10px] text-gray-400 mt-0.5">{student.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-[#154212]">{student.eco_points} EP</span>
                        <p className="text-[9px] text-gray-400 mt-0.5">Akumulasi Poin</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-amber-600 flex items-center justify-end gap-0.5">
                          🔥 {student.streak}
                        </span>
                        <p className="text-[9px] text-gray-400 mt-0.5">Streak</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Recent Submissions / Activity Feed (5 Columns) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-display font-bold text-base text-[#154212] flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  <span>Aktivitas Pengumpulan</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Tugas LKM terbaru yang diserahkan siswa.</p>
              </div>
              <button 
                onClick={() => setActiveTab('teacher-submissions')}
                className="text-xs font-bold text-[#006e1c] hover:text-[#154212] flex items-center gap-1 hover:underline transition-all"
              >
                <span>Review Tugas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center items-center">
                <div className="w-6 h-6 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400 font-semibold border-2 border-dashed border-gray-100 rounded-2xl">
                Belum ada pengumpulan tugas masuk.
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-3 bg-gray-50/60 hover:bg-gray-50 border border-gray-100 rounded-2xl flex items-start gap-3 transition-colors">
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${activity.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#1a1c1c] truncate">{activity.student_name}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Mengumpulkan LKM: <span className="font-semibold text-emerald-800 uppercase">{activity.meeting_id}</span>
                      </p>
                      <span className="text-[9px] text-gray-400 block mt-1.5">
                        {new Date(activity.submitted_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })} WIB
                      </span>
                    </div>
                    <div>
                      {activity.status === 'pending' ? (
                        <span className="text-[8px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          Pending
                        </span>
                      ) : (
                        <span className="text-[8px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Selesai
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
