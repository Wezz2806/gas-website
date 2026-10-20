import { useState, useEffect } from 'react';
import { Tab, Room, Assignment, AttendanceStatus } from '../types';
import { 
  CalendarCheck, 
  ArrowRight, 
  BookOpen, 
  Newspaper,
  ExternalLink,
  Leaf,
  FlaskConical,
  Video,
  HelpCircle,
  Contact,
  Sun,
  Clock,
  Sparkles,
  CheckCircle2,
  ClipboardList,
  Plus,
  MessageSquare,
  Award,
  Calendar,
  Loader2,
  Send,
  Info,
  AlertCircle,
  KeyRound,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { submissionService } from '../services/submissionService';
import { attendanceService } from '../services/attendanceService';
import { assignmentService } from '../services/assignmentService';
import AssignmentModal from './assignment/AssignmentModal';
import AssignmentFormModal from './assignment/AssignmentFormModal';

interface DashboardViewProps {
  setActiveTab: (tab: Tab) => void;
  currentRoom?: Room | null;
}

export default function DashboardView({ 
  setActiveTab,
  currentRoom
}: DashboardViewProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [progress, setProgress] = useState(0);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [attendanceSummary, setAttendanceSummary] = useState<any | null>(null);

  // Assignments state
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchAssignments = async () => {
    if (!currentRoom?.id) return;
    try {
      setIsLoadingAssignments(true);
      const res = await assignmentService.getAssignments(currentRoom.id);
      setAssignments(res.assignments);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [currentRoom?.id]);

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

  // Quick attendance check-in states for student dashboard
  const [quickStatus, setQuickStatus] = useState<AttendanceStatus>('hadir');
  const [quickCode, setQuickCode] = useState('');
  const [quickNote, setQuickNote] = useState('');
  const [isSubmittingQuickAtt, setIsSubmittingQuickAtt] = useState(false);
  const [quickAttFeedback, setQuickAttFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const fetchAttendance = () => {
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
  };

  useEffect(() => {
    fetchAttendance();
  }, [currentRoom?.id]);

  const handleQuickCheckIn = async (sessionId: number, requiresCode: boolean) => {
    if (quickStatus === 'hadir' && requiresCode && !quickCode.trim()) {
      setQuickAttFeedback({ success: false, message: 'Masukkan kode akses presensi yang diberikan guru.' });
      return;
    }
    if ((quickStatus === 'izin' || quickStatus === 'sakit') && !quickNote.trim()) {
      const label = quickStatus === 'izin' ? 'izin' : 'sakit';
      setQuickAttFeedback({ success: false, message: `Mohon tuliskan keterangan/alasan ${label} Anda.` });
      return;
    }

    try {
      setIsSubmittingQuickAtt(true);
      setQuickAttFeedback(null);
      const msg = await attendanceService.checkIn(sessionId, quickCode.trim(), quickStatus, quickNote.trim());
      setQuickAttFeedback({ success: true, message: msg });
      setQuickCode('');
      setQuickNote('');
      fetchAttendance();
    } catch (err: any) {
      setQuickAttFeedback({ success: false, message: err.message || 'Gagal mengirim presensi.' });
    } finally {
      setIsSubmittingQuickAtt(false);
    }
  };

  const hasCheckedIn = Boolean(activeSession?.my_status && activeSession.my_status !== 'alpa');

  const navCards = [
    { id: 'ecolab' as Tab, label: 'EcoLab', desc: 'Praktikum & LKM Kimia Hijau', icon: FlaskConical, color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
    { id: 'ecopedia' as Tab, label: 'EcoPedia', desc: 'Buku Pembelajaran & Ekoenzim', icon: BookOpen, color: 'text-teal-700 bg-teal-50 border-teal-100' },
    { id: 'ecoupdate' as Tab, label: 'EcoUpdate', desc: 'Warta Sains & Aksi Lingkungan', icon: Newspaper, color: 'text-lime-700 bg-lime-50 border-lime-100' },
    { id: 'ecocreation' as Tab, label: 'EcoCreation', desc: 'Video & Aksi Nyata Murid', icon: Video, color: 'text-blue-700 bg-blue-50 border-blue-100' },
    { id: 'ecochallenge' as Tab, label: 'EcoChallenge', desc: 'Evaluasi & Forum Diskusi', icon: HelpCircle, color: 'text-amber-700 bg-amber-50 border-amber-100' },
    { id: 'absensi' as Tab, label: 'Absensi', desc: 'Presensi Sesi Pembelajaran', icon: CalendarCheck, color: 'text-indigo-700 bg-indigo-50 border-indigo-100' },
    { id: 'ecocontact' as Tab, label: 'EcoContact', desc: 'Kontak Dosen, Guru & Mentor', icon: Contact, color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
  ];

  const getDueBadge = (dateStr: string | null) => {
    if (!dateStr) return { text: 'Tanpa batas waktu', className: 'bg-stone-100 text-stone-600' };
    const due = new Date(dateStr);
    const now = new Date();
    const isOverdue = due < now;
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    const isNear = diffHours > 0 && diffHours <= 24;

    const formatted = due.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    if (isOverdue) {
      return { text: `Lewat: ${formatted}`, className: 'bg-rose-50 text-rose-700 border border-rose-200' };
    }
    if (isNear) {
      return { text: `Segera: ${formatted}`, className: 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' };
    }
    return { text: `Tenggat: ${formatted}`, className: 'bg-stone-100 text-stone-700 border border-stone-200' };
  };

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

      {/* ── BANNER PERINGATAN SESI ABSENSI AKTIF ── */}
      {activeSession && (
        <section className={`rounded-3xl p-5 sm:p-7 text-left transition-all shadow-sm border ${
          hasCheckedIn
            ? 'bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-white border-emerald-200'
            : 'bg-gradient-to-r from-amber-50/95 via-orange-50/60 to-white border-amber-300 ring-2 ring-amber-400/20'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 ${
                  hasCheckedIn
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-900'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${hasCheckedIn ? 'bg-emerald-600' : 'bg-amber-600 animate-ping'}`} />
                  {hasCheckedIn ? 'Sesi Presensi Diikuti' : 'Sesi Presensi Sedang Berlangsung!'}
                </span>

                <span className="text-[11px] font-bold text-stone-500 bg-white/80 px-2.5 py-0.5 rounded-lg border border-stone-200/60 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-stone-400" />
                  {activeSession.session_date}
                </span>

                {activeSession.has_code && !hasCheckedIn && (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-amber-600" />
                    Memerlukan Kode Guru
                  </span>
                )}
              </div>

              <h3 className="font-display font-black text-lg md:text-xl text-stone-800">
                {activeSession.title}
              </h3>

              {hasCheckedIn ? (
                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 pt-1">
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Status Anda: {activeSession.my_status === 'hadir' ? 'Hadir' : (activeSession.my_status === 'izin' ? 'Izin' : 'Sakit')}
                  </span>
                  {activeSession.my_checked_in_at && (
                    <span className="text-stone-400">
                      Tercatat pukul {new Date(activeSession.my_checked_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </span>
                  )}
                  {activeSession.my_note && (
                    <span className="text-stone-500 italic">
                      ("{activeSession.my_note}")
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
                  Guru telah membuka sesi presensi pertemuan kelas. Silakan pilih status kehadiran Anda (<strong>Hadir</strong>, <strong>Izin</strong>, atau <strong>Sakit</strong>) di bawah ini sebelum sesi berakhir.
                </p>
              )}
            </div>

            <div className="shrink-0 flex items-center gap-2 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('absensi')}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Menu Absensi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Check-in Controls jika murid belum mengisi */}
          {!hasCheckedIn && !isAdmin && (
            <div className="mt-4 pt-4 border-t border-amber-200/60 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Presensi Cepat dari Dashboard:
                </span>

                {/* Segmented Buttons: Hadir | Izin | Sakit */}
                <div className="inline-flex p-1 bg-white/90 rounded-2xl gap-1 self-start sm:self-auto border border-stone-200">
                  <button
                    type="button"
                    onClick={() => setQuickStatus('hadir')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      quickStatus === 'hadir'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-stone-600 hover:text-emerald-800'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Hadir</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuickStatus('izin')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      quickStatus === 'izin'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-stone-600 hover:text-blue-800'
                    }`}
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Izin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuickStatus('sakit')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      quickStatus === 'sakit'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-stone-600 hover:text-amber-800'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Sakit</span>
                  </button>
                </div>
              </div>

              {/* Input & Tombol Submit */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                {quickStatus === 'hadir' ? (
                  <>
                    {activeSession.has_code ? (
                      <div className="relative flex-1 sm:max-w-xs">
                        <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Ketik Kode Presensi Guru"
                          maxLength={10}
                          value={quickCode}
                          onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-mono uppercase font-bold tracking-wider focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all placeholder:font-sans placeholder:normal-case placeholder:font-normal placeholder:text-stone-400"
                        />
                      </div>
                    ) : (
                      <div className="text-xs text-stone-500 flex-1 py-1 italic">
                        Sesi terbuka tanpa kode akses. Klik tombol untuk konfirmasi kehadiran.
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleQuickCheckIn(activeSession.id, activeSession.has_code)}
                      disabled={isSubmittingQuickAtt}
                      className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingQuickAtt ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
                      <span>Konfirmasi Hadir</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder={
                          quickStatus === 'izin'
                            ? "Tuliskan alasan izin (contoh: Mengikuti lomba OSN, ada keperluan keluarga)..."
                            : "Tuliskan keterangan sakit (contoh: Demam & flu, istirahat dokter)..."
                        }
                        maxLength={200}
                        value={quickNote}
                        onChange={(e) => setQuickNote(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all placeholder:text-stone-400"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuickCheckIn(activeSession.id, false)}
                      disabled={isSubmittingQuickAtt}
                      className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                        quickStatus === 'izin'
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-amber-600 hover:bg-amber-700'
                      }`}
                    >
                      {isSubmittingQuickAtt ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>Kirim Keterangan {quickStatus === 'izin' ? 'Izin' : 'Sakit'}</span>
                    </button>
                  </>
                )}
              </div>

              {quickAttFeedback && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  quickAttFeedback.success 
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' 
                    : 'bg-rose-100 text-rose-900 border border-rose-200'
                }`}>
                  {quickAttFeedback.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{quickAttFeedback.message}</span>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ── BOX TUGAS & PERINTAH KELAS ── */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 text-left space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#154212] to-[#006e1c] flex items-center justify-center text-[#91f78e] shadow-xs shrink-0">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base sm:text-lg text-[#154212]">
                  Perintah & Tugas Siswa
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {assignments.length} Perintah / Tugas
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Pantau perintah atau tugas kelas, serahkan berkas pekerjaan, dan diskusikan materi bersama
              </p>
            </div>
          </div>

          {isAdmin && currentRoom && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#006e1c] hover:bg-[#154212] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tugas / Perintah</span>
            </button>
          )}
        </div>

        {/* List / Grid of Assignments */}
        {isLoadingAssignments ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-stone-400">
            <Loader2 className="w-7 h-7 animate-spin text-[#006e1c]" />
            <span className="text-xs font-semibold">Memuat daftar tugas & perintah...</span>
          </div>
        ) : assignments.length === 0 ? (
          <div className="py-10 px-6 rounded-2xl bg-stone-50/70 border border-dashed border-stone-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="font-bold text-sm text-stone-800">Belum Ada Perintah atau Tugas Aktif</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Pengajar belum menerbitkan perintah atau penugasan untuk kelas ini. Tugas baru dan instruksi pengumpulan akan tampil di sini.
              </p>
            </div>
            {isAdmin && currentRoom && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-2 px-4 py-2 rounded-xl bg-[#006e1c] text-white text-xs font-bold hover:bg-[#154212] transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Tugas / Perintah Pertama</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((assign) => {
              const due = getDueBadge(assign.due_date);
              const sub = assign.my_submission;

              return (
                <div
                  key={assign.id}
                  onClick={() => setSelectedAssignmentId(assign.id)}
                  className="p-5 rounded-2xl bg-gradient-to-b from-[#fcfdfa] to-white border border-stone-200/90 hover:border-[#006e1c]/40 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${due.className}`}>
                        {due.text}
                      </span>
                      <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1">
                        <Award className="w-3 h-3 text-emerald-700" />
                        {assign.max_points} Poin
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-sm text-[#154212] group-hover:text-[#006e1c] transition-colors line-clamp-2 leading-snug">
                      {assign.title}
                    </h4>

                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed font-sans">
                      {assign.description || 'Klik untuk membuka rincian petunjuk tugas dan ruang diskusi.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {/* Status Badges */}
                      {!isAdmin ? (
                        sub ? (
                          sub.status === 'graded' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 truncate">
                              Nilai: {sub.grade}/{assign.max_points}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Diserahkan</span>
                            </span>
                          )
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Belum Diserahkan</span>
                          </span>
                        )
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {assign.submissions_count || 0} Terkumpul
                        </span>
                      )}

                      {/* Discussion count */}
                      <span className="text-[10px] text-stone-400 flex items-center gap-1 shrink-0">
                        <MessageSquare className="w-3 h-3 text-stone-400" />
                        <span>{assign.comments_count || 0}</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-stone-50 group-hover:bg-[#006e1c] group-hover:text-white text-stone-700 text-[11px] font-bold transition-all flex items-center gap-1 shrink-0"
                    >
                      <span>Buka Tugas</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
            <div className={`p-4 sm:p-5 rounded-2xl border mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left ${
              hasCheckedIn
                ? 'bg-emerald-50/80 border-emerald-200/80'
                : 'bg-amber-50/90 border-amber-200'
            }`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${hasCheckedIn ? 'bg-emerald-600' : 'bg-amber-600 animate-ping'}`} />
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${hasCheckedIn ? 'text-emerald-800' : 'text-amber-800'}`}>
                    {hasCheckedIn ? 'Sesi Presensi Diikuti' : 'Sesi Terbuka — Belum Mengisi'}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-stone-900">{activeSession.title}</h4>
                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 mt-1">
                  <span className="flex items-center gap-1 text-stone-500">
                    <Clock className="w-3.5 h-3.5" />
                    {activeSession.session_date}
                  </span>
                  {hasCheckedIn && (
                    <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Status: {activeSession.my_status === 'hadir' ? 'Hadir' : (activeSession.my_status === 'izin' ? 'Izin' : 'Sakit')}
                    </span>
                  )}
                  {activeSession.has_code && !hasCheckedIn && (
                    <span className="text-[10px] text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md font-semibold">
                      Kunci: Kode Guru
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setActiveTab('absensi')}
                className={`px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
                  hasCheckedIn
                    ? 'bg-[#006e1c] hover:bg-[#154212]'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                <span>{hasCheckedIn ? 'Rincian Absensi' : 'Isi Presensi Sekarang'}</span>
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

      {/* Detail & Submission Assignment Modal */}
      {selectedAssignmentId && (
        <AssignmentModal
          assignmentId={selectedAssignmentId}
          roomName={currentRoom?.name || 'Ruang Kelas'}
          onClose={() => setSelectedAssignmentId(null)}
          onAssignmentDeleted={() => {
            setSelectedAssignmentId(null);
            fetchAssignments();
          }}
          onAssignmentUpdated={() => {
            fetchAssignments();
          }}
        />
      )}

      {/* Create Assignment Modal for Admin */}
      {showCreateModal && currentRoom && (
        <AssignmentFormModal
          roomId={currentRoom.id}
          roomName={currentRoom.name}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchAssignments();
          }}
        />
      )}
    </div>
  );
}

