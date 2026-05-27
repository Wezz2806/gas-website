import { useState, useEffect } from 'react';
import { Tab } from '../types';
import { 
  UserCheck, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  BookOpen, 
  ExternalLink,
  ChevronRight,
  Leaf,
  Sun,
  X,
  TrendingUp,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { submissionService } from '../services/submissionService';

interface DashboardViewProps {
  setActiveTab: (tab: Tab) => void;
}

export default function DashboardView({ 
  setActiveTab
}: DashboardViewProps) {
  const { user, updateUserStreak } = useAuth();
  const [hasCheckedInToday, setHasCheckedInToday] = useState(() => {
    const today = new Date().toLocaleDateString('sv-SE');
    return user?.last_checkin === today;
  });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (user) {
      const today = new Date().toLocaleDateString('sv-SE');
      setHasCheckedInToday(user.last_checkin === today);
    }
  }, [user]);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const subs = await submissionService.getSubmissions();
        const completedCount = Object.keys(subs).filter(key => 
          ['m1', 'm2', 'm3', 'm4'].includes(key)
        ).length;
        setProgress(Math.round((completedCount / 4) * 100));
      } catch (err) {
        console.error('Failed to fetch submissions for dashboard progress:', err);
      }
    };
    fetchProgress();
  }, []);

  const handleCheckIn = async () => {
    if (hasCheckedInToday) return;

    try {
      const response = await fetch('/api/checkin.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      const data = await response.json();
      if (data.success) {
        setHasCheckedInToday(true);
        if (updateUserStreak) {
          updateUserStreak(data.streak, data.last_checkin);
        }
      } else {
        alert(data.message || 'Gagal melakukan presensi.');
      }
    } catch (err) {
      console.error('Checkin error:', err);
      alert('Koneksi ke server gagal.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <section className="text-left bg-gradient-to-r from-emerald-50 to-[#F5F5DC] p-6 rounded-3xl border border-[#c2c9bb]/40">
        <div className="flex items-center gap-2">
          <span className="text-[#006e1c] font-bold text-xs uppercase tracking-widest bg-emerald-100 px-2.5 py-1 rounded-full">
            Status Siswa Aktif
          </span>
        </div>
        <h2 className="font-display font-black text-2xl md:text-3xl text-[#154212] mt-2 mb-1">
          Selamat datang kembali, Siswa!
        </h2>
        <p className="font-sans text-sm text-[#42493e] leading-relaxed">
          Kontribusi harian Anda untuk keberlanjutan dimulai di sini. Siap melangkah dan belajar hari ini?
        </p>
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Check-in Section (The Focus Card) */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden transition-all hover:shadow-md">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#91f78e] opacity-15 rounded-full blur-3xl"></div>
          
          <div className="z-10 shrink-0 flex flex-col items-center gap-3">
            <button 
              onClick={handleCheckIn}
              disabled={hasCheckedInToday}
              className={`w-full px-5 py-3 rounded-2xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                hasCheckedInToday 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-250 cursor-default animate-none'
                  : 'bg-[#006e1c] hover:bg-[#154212] text-white hover:scale-105 active:scale-95 animate-pulse'
              }`}
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>{hasCheckedInToday ? 'Presensi Tercatat' : 'Kirim Presensi Kehadiran'}</span>
            </button>

            <div className="text-xs font-bold text-[#154212] bg-[#bcf0ae]/30 border border-[#9dd090]/40 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm w-full justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>Total Kehadiran: {user ? user.streak : 0} Hari</span>
            </div>
          </div>

          <div className="z-10 text-center md:text-left flex-1">
            <h3 className="font-display font-bold text-lg md:text-xl text-[#154212] mb-1.5">
              {hasCheckedInToday ? 'Anda sudah presensi hari ini!' : 'Kirim presensi kehadiran untuk hari ini!'}
            </h3>
            <p className="font-sans text-xs md:sm text-[#42493e] mb-4">
              {hasCheckedInToday 
                ? 'Kehadiran Anda telah tercatat untuk Seminar Keberlanjutan pagi ini.'
                : 'Catat kehadiran Anda hari ini untuk mengonfirmasi kehadiran (sehari sekali).'
              }
            </p>

          </div>

          <div className="ml-auto z-10 hidden md:block w-32 shrink-0">
            <img 
              alt="Sustainability Seedling" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFNzpArEJR6rxBIVU-inZ_WFUuSVcNLTRbQbNSufHW-yjok5m3xhNw3aNOcYeMTN1pFxtv-qwLnc2Iq6YoGlYOk__sqvwSYUT7KBmrp8cEERoM4sdpTGLz5gRm6ntIjX2TTNSguxiaAZ2kIqmAf2eL2diza-1YuPYC6KYQ2FTTStIk0XZfaNPSKQZqNSrbOp_bgpu4QHNUvVOG5U5ashfBNrpppIKHZ6tWb-9sBPP3u7dwgAHtsZ5p9LlGU_6ip-Yeal6tJwvXtR6V" 
              referrerPolicy="no-referrer"
              className="w-24 h-24 object-cover rounded-2xl shadow-md border-4 border-white transform rotate-3 hover:rotate-0 transition-transform duration-300"
            />
          </div>
        </div>

        {/* EcoLab Progress Card */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-[#e4e4cc] rounded-2xl text-[#393a29]">
              <Sun className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Modul EcoLab</span>
          </div>

          <div className="my-4 text-left">
            <h4 className="font-display font-bold text-base md:text-lg text-[#154212] mb-1">
              Analisis Jejak Karbon
            </h4>
            <p className="text-xs text-[#42493e]">Siklus Fermentasi Air Hidro dan Penguraian</p>
          </div>

          <div className="mt-auto">
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-[#42493e]">Progres Eksperimen</span>
              <span className="text-[#154212] font-bold">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#006e1c] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <button 
              onClick={() => setActiveTab('ecolab')}
              className="mt-4 w-full py-2.5 px-4 bg-gray-50 border border-gray-100 text-[#154212] font-bold text-xs rounded-xl hover:bg-[#e4e4cc] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Lanjutkan Eksperimen</span> 
              <ArrowRight className="w-4 h-4 text-[#006e1c]" />
            </button>
          </div>
        </div>
        {/* EcoPedia Highlight Card */}
        <div className="col-span-12 bg-[#154212] text-white rounded-3xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between relative overflow-hidden transition-all hover:shadow-xl">
          <div className="absolute right-[-5%] bottom-[-20%] opacity-15">
            <BookOpen className="w-56 h-56" />
          </div>
          
          <div className="space-y-4 md:max-w-2xl z-10 text-left">
            <span className="text-[10px] uppercase font-bold text-[#bcf0ae] tracking-widest bg-white/10 px-2.5 py-1 rounded-full w-fit">Bacaan Hari Ini</span>
            <h4 className="font-display font-bold text-lg md:text-xl tracking-tight">
              Masa Depan Tenaga Hidrogen
            </h4>
            <p className="text-xs text-[#bcf0ae] opacity-90 leading-relaxed">
              Jelajahi bagaimana energi hidrogen hijau dan elektrolisis berbasis mikro canopy mengubah secara mendasar sirkulasi emisi di lanskap pabrik berat sirkuler.
            </p>
          </div>

          <div className="mt-4 md:mt-0 z-10 shrink-0">
            <button 
              onClick={() => setActiveTab('ecopedia')}
              className="bg-[#91f78e] hover:bg-white text-[#002201] text-xs font-bold px-5 py-3 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105"
            >
              <span>Baca Sekarang</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Gamified Achievements Box */}
      <section className="bg-white rounded-3xl p-6 border border-gray-100 text-left">
        <h4 className="font-display font-bold text-base text-[#154212] mb-1">Misi Mingguan Berjalan</h4>
        <p className="text-xs text-gray-500 mb-4">Selesaikan misi berikut untuk menyelesaikan pembelajaran sirkular Anda.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#f3f3f4] rounded-2xl flex items-center justify-between border border-gray-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">Selesaikan Evaluasi EcoChallenge</p>
                <p className="text-[10px] text-gray-500">Mencapai &gt;=80% pada Posttest</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#006e1c] bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              Wajib
            </span>
          </div>

          <div className="p-4 bg-[#f3f3f4] rounded-2xl flex items-center justify-between border border-gray-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">Unggah LKM di EcoLab</p>
                <p className="text-[10px] text-gray-500">Kirim laporan observasi biologis</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#006e1c] bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              Wajib
            </span>
          </div>
        </div>
      </section>

    </div>
  );
}
