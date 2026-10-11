import { useState, useEffect } from 'react';
import { Tab, Room } from '../types';
import { 
  CalendarCheck, 
  ArrowRight, 
  BookOpen, 
  ExternalLink,
  Leaf,
  FlaskConical,
  Video,
  HelpCircle,
  Contact,
  Sun,
  Clock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { submissionService } from '../services/submissionService';
import { attendanceService } from '../services/attendanceService';

interface DashboardViewProps {
  setActiveTab: (tab: Tab) => void;
  currentRoom?: Room | null;
}

export default function DashboardView({ 
  setActiveTab,
  currentRoom
}: DashboardViewProps) {
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [attendanceSummary, setAttendanceSummary] = useState<any | null>(null);

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

  useEffect(() => {
    if (!currentRoom?.id) return;
    attendanceService.getSessions(currentRoom.id)
      .then(res => {
        if (res.summary) setAttendanceSummary(res.summary);
        const open = res.sessions?.find(s => s.status === 'open');
        setActiveSession(open || null);
      })
      .catch(err => {
        console.error('Failed to fetch attendance for dashboard:', err);
      });
  }, [currentRoom?.id]);

  const navCards = [
    { id: 'ecolab' as Tab, label: 'EcoLab', desc: 'Praktikum & LKM Kimia Hijau', icon: FlaskConical, color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
    { id: 'ecopedia' as Tab, label: 'EcoPedia', desc: 'Buku Pembelajaran & Ekoenzim', icon: BookOpen, color: 'text-teal-700 bg-teal-50 border-teal-100' },
    { id: 'ecocreation' as Tab, label: 'EcoCreation', desc: 'Video & Aksi Nyata Murid', icon: Video, color: 'text-blue-700 bg-blue-50 border-blue-100' },
    { id: 'ecochallenge' as Tab, label: 'EcoChallenge', desc: 'Evaluasi & Forum Diskusi', icon: HelpCircle, color: 'text-amber-700 bg-amber-50 border-amber-100' },
    { id: 'absensi' as Tab, label: 'Absensi', desc: 'Presensi Sesi Pembelajaran', icon: CalendarCheck, color: 'text-indigo-700 bg-indigo-50 border-indigo-100' },
    { id: 'ecocontact' as Tab, label: 'EcoContact', desc: 'Kontak Dosen, Guru & Mentor', icon: Contact, color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Banner Utama Kelas */}
      <section className="text-left bg-gradient-to-r from-emerald-50 via-[#f4fbe9] to-[#F5F5DC] p-6 sm:p-8 rounded-3xl border border-[#c2c9bb]/40 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full opacity-5 pointer-events-none flex items-center justify-end pr-6">
          <Leaf className="w-64 h-64 text-emerald-900" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[#006e1c] font-bold text-xs uppercase tracking-widest bg-emerald-100/90 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {currentRoom ? `Ruang Kelas Aktif` : 'Status Murid Aktif'}
            </span>
            {currentRoom && (
              <span className="text-stone-600 font-mono text-xs bg-stone-100/90 px-3 py-1 rounded-full border border-stone-200">
                Kunci: {currentRoom.room_key}
              </span>
            )}
          </div>

          <h2 className="font-display font-black text-2xl md:text-3xl text-[#154212] tracking-tight">
            {currentRoom ? currentRoom.name : 'Halo, Sahabat GAS!'}
          </h2>
          <p className="font-sans text-sm text-[#42493e] mt-2 leading-relaxed max-w-3xl">
            {currentRoom?.description || 'Selamat datang di ruang pembelajaran Green Action Students. Bersama-sama kita ubah ilmu menjadi aksi nyata penyelamatan lingkungan.'}
          </p>
        </div>
      </section>

      {/* Grid Informasi Utama */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sesi Absensi & Status Kehadiran */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-display font-bold text-base md:text-lg text-[#154212]">
                  Status Presensi Pembelajaran
                </h3>
                <p className="text-xs text-stone-500">
                  Pantau keterisian absensi pada setiap sesi pertemuan kelas
                </p>
              </div>
            </div>

            {attendanceSummary && (
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Tingkat Hadir</span>
                <span className="text-lg font-black text-emerald-700">{attendanceSummary.percentage}%</span>
              </div>
            )}
          </div>

          {activeSession ? (
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/60 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Sesi Terbuka Sekarang</span>
                </div>
                <h4 className="font-bold text-sm text-emerald-950">{activeSession.title}</h4>
                <p className="text-xs text-emerald-800/80 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  Tanggal: {activeSession.session_date} {activeSession.has_code ? '• Memerlukan Kode Sesi' : ''}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('absensi')}
                className="px-4 py-2.5 rounded-xl bg-[#006e1c] hover:bg-[#154212] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <span>Buka Presensi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 mb-6 text-left flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs text-stone-600">
                <span className="font-semibold text-stone-800">Tidak ada sesi presensi yang sedang berlangsung.</span> Anda dapat meninjau riwayat kehadiran Anda di menu Absensi.
              </div>
            </div>
          )}

          {/* Quick Shortcuts Pembelajaran */}
          <div className="text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-3">
              Akses Cepat Modul Pembelajaran
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {navCards.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer group hover:shadow-sm hover:-translate-y-0.5 ${item.color}`}
                  >
                    <Icon className="w-5 h-5 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="block text-xs font-bold">{item.label}</span>
                    <span className="text-[10px] opacity-80 line-clamp-1">{item.desc}</span>
                  </button>
                );
              })}
            </div>
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
              Petualangan belajar hari ini dimulai dari LKM!
            </h4>
            <p className="text-xs text-[#42493e] leading-relaxed">
              Di dalam LKM, kamu akan menemukan kasus menarik, aktivitas seru, dan tantangan yang akan membantumu memahami materi sekaligus melatih kemampuan memecahkan masalah. Yuk, buka LKM sekarang!
            </p>
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
          
          <div className="space-y-2 md:max-w-2xl z-10 text-left">
            <span className="text-[10px] uppercase font-bold text-[#bcf0ae] tracking-widest bg-white/10 px-2.5 py-1 rounded-full w-fit inline-block">Bacaan Hari Ini</span>
            <h4 className="font-display font-bold text-lg md:text-xl tracking-tight">
              Ingin tahu lebih banyak? Jelajahi Referensi Belajar!
            </h4>
            <p className="text-xs text-[#bcf0ae] opacity-90 leading-relaxed">
              Bacaan yang tersedia akan membantumu memahami materi lebih mendalam serta memberikan inspirasi untuk melakukan aksi nyata yang bermanfaat bagi lingkungan. Selamat membaca!
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
    </div>
  );
}
