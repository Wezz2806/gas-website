import React, { useState, useEffect } from 'react';
import { AttendanceSession, AttendanceStatus } from '../types';
import { attendanceService } from '../services/attendanceService';
import { 
  CalendarCheck, 
  Clock, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  Sparkles,
  Calendar,
  UserCheck,
  ShieldCheck,
  Info,
  Send
} from 'lucide-react';

interface AttendanceViewProps {
  roomId: number;
}

export default function AttendanceView({ roomId }: AttendanceViewProps) {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [summary, setSummary] = useState<any>({
    total: 0,
    hadir: 0,
    izin: 0,
    sakit: 0,
    alpa: 0,
    percentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [codeInputs, setCodeInputs] = useState<Record<number, string>>({});
  const [statusSelections, setStatusSelections] = useState<Record<number, AttendanceStatus>>({});
  const [noteInputs, setNoteInputs] = useState<Record<number, string>>({});
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ id: number; success: boolean; message: string } | null>(null);

  const loadSessions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await attendanceService.getSessions(roomId);
      setSessions(data.sessions || []);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memuat data absensi kelas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      loadSessions();
    }
  }, [roomId]);

  const handleCheckIn = async (sessionId: number, requiresCode: boolean) => {
    const status = statusSelections[sessionId] || 'hadir';
    const code = codeInputs[sessionId] || '';
    const note = noteInputs[sessionId] || '';

    if (status === 'hadir' && requiresCode && !code.trim()) {
      setFeedback({ id: sessionId, success: false, message: 'Masukkan kode akses absensi yang diberikan guru.' });
      return;
    }

    if ((status === 'izin' || status === 'sakit') && !note.trim()) {
      const label = status === 'izin' ? 'izin' : 'sakit';
      setFeedback({ id: sessionId, success: false, message: `Mohon sertakan alasan/keterangan ${label} Anda.` });
      return;
    }

    setSubmittingId(sessionId);
    setFeedback(null);
    try {
      const msg = await attendanceService.checkIn(sessionId, code.trim(), status, note.trim());
      setFeedback({ id: sessionId, success: true, message: msg });
      // Reset input fields for this session
      setCodeInputs(prev => ({ ...prev, [sessionId]: '' }));
      setNoteInputs(prev => ({ ...prev, [sessionId]: '' }));
      // Reload to get updated status and summary
      await loadSessions();
    } catch (err: any) {
      setFeedback({ id: sessionId, success: false, message: err.message || 'Gagal melakukan absensi.' });
    } finally {
      setSubmittingId(null);
    }
  };

  const getStatusBadge = (status: AttendanceStatus | null | undefined, sessionStatus: 'open' | 'closed') => {
    if (status === 'hadir') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Hadir
        </span>
      );
    }
    if (status === 'izin') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          Izin
        </span>
      );
    }
    if (status === 'sakit') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          Sakit
        </span>
      );
    }
    if (status === 'alpa' || sessionStatus === 'closed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          Alpa
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800 border border-cyan-200 animate-pulse">
        <Clock className="w-3.5 h-3.5 text-cyan-600" />
        Belum Mengisi
      </span>
    );
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-[#f4fbe9] to-[#F5F5DC] p-6 sm:p-8 rounded-3xl border border-[#c2c9bb]/40 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#006e1c] font-bold text-xs uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5" />
              Presensi Kelas
            </span>
          </div>
          <h2 className="font-display font-black text-2xl md:text-3xl text-[#154212] tracking-tight">
            Absensi Pembelajaran
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Lakukan presensi pada setiap sesi pertemuan kelas yang dibuka oleh guru. Kehadiran Anda tercatat secara otomatis untuk evaluasi keaktifan belajar.
          </p>
        </div>

        <button
          onClick={loadSessions}
          disabled={loading}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs text-center">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Total Sesi</span>
          <span className="text-2xl font-black text-stone-800 mt-1 block">{summary.total || 0}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs text-center">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Hadir</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{summary.hadir || 0}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs text-center">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Izin</span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">{summary.izin || 0}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs text-center">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Sakit</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">{summary.sakit || 0}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs text-center">
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Alpa</span>
          <span className="text-2xl font-black text-rose-700 mt-1 block">{summary.alpa || 0}</span>
        </div>
        <div className="bg-emerald-800 text-white p-4 rounded-2xl shadow-xs text-center">
          <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">Kehadiran</span>
          <span className="text-2xl font-black text-white mt-1 block">{summary.percentage || 0}%</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Sesi List */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
          <span className="text-xs text-stone-500 font-semibold">Memuat riwayat sesi absensi...</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-16 text-center">
          <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-700">Belum Ada Sesi Absensi</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Guru atau pengajar belum membuka sesi absensi untuk kelas ini. Sesi yang dibuka akan otomatis muncul di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const isOpen = session.status === 'open';
            const hasCheckedIn = Boolean(session.my_status && session.my_status !== 'alpa');
            const canCheckIn = isOpen && !hasCheckedIn;
            const isSubmitting = submittingId === session.id;
            const currentFeedback = feedback?.id === session.id ? feedback : null;

            return (
              <div 
                key={session.id}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all ${
                  isOpen 
                    ? 'border-emerald-300 shadow-sm ring-1 ring-emerald-500/10' 
                    : 'border-stone-200/80'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {session.session_date}
                      </span>
                      {isOpen ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                          Sesi Terbuka
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-lg">
                          Sesi Ditutup
                        </span>
                      )}
                      {session.has_code && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                          <KeyRound className="w-3 h-3 text-amber-600" />
                          Memerlukan Kode
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-bold text-base md:text-lg text-stone-800">
                      {session.title}
                    </h3>

                    {session.my_checked_in_at && (
                      <p className="text-[11px] text-stone-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Tercatat pada: {new Date(session.my_checked_in_at).toLocaleString('id-ID')}
                        {session.my_marked_by === 'admin' ? ' (diverifikasi oleh Guru)' : ''}
                      </p>
                    )}

                    {session.my_note && (
                      <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl mt-1 border border-stone-200/50 flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                        <span>Keterangan: "{session.my_note}"</span>
                      </p>
                    )}
                  </div>

                  {/* Status Kehadiran Saat Ini */}
                  <div className="shrink-0 md:text-right">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Status Kehadiran</span>
                    {getStatusBadge(session.my_status, session.status)}
                  </div>
                </div>

                {/* Form Aksi Presensi Siswa (Hadir / Izin / Sakit) */}
                {canCheckIn && (
                  <div className="mt-5 pt-4 border-t border-stone-100 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Pilih Status Kehadiran Anda:
                      </span>

                      {/* Segmented Option Buttons: Hadir | Izin | Sakit */}
                      <div className="inline-flex p-1 bg-stone-100 rounded-2xl gap-1 self-start sm:self-auto border border-stone-200/60">
                        <button
                          type="button"
                          onClick={() => setStatusSelections(prev => ({ ...prev, [session.id]: 'hadir' }))}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            (statusSelections[session.id] || 'hadir') === 'hadir'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-stone-600 hover:text-emerald-800 hover:bg-white/70'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Hadir</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setStatusSelections(prev => ({ ...prev, [session.id]: 'izin' }))}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            statusSelections[session.id] === 'izin'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-stone-600 hover:text-blue-800 hover:bg-white/70'
                          }`}
                        >
                          <Info className="w-3.5 h-3.5" />
                          <span>Izin</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setStatusSelections(prev => ({ ...prev, [session.id]: 'sakit' }))}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            statusSelections[session.id] === 'sakit'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'text-stone-600 hover:text-amber-800 hover:bg-white/70'
                          }`}
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Sakit</span>
                        </button>
                      </div>
                    </div>

                    {/* Dynamic Action Fields */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                      {(statusSelections[session.id] || 'hadir') === 'hadir' ? (
                        <>
                          {session.has_code ? (
                            <div className="relative flex-1 sm:max-w-xs">
                              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                placeholder="Ketik Kode Presensi Guru"
                                maxLength={10}
                                value={codeInputs[session.id] || ''}
                                onChange={(e) => setCodeInputs(prev => ({ ...prev, [session.id]: e.target.value.toUpperCase() }))}
                                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono uppercase font-bold tracking-wider focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all placeholder:font-sans placeholder:normal-case placeholder:font-normal placeholder:text-stone-400"
                              />
                            </div>
                          ) : (
                            <div className="text-xs text-stone-500 flex-1 py-1 italic">
                              Sesi ini terbuka tanpa kode akses. Klik tombol konfirmasi untuk mencatat kehadiran.
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handleCheckIn(session.id, session.has_code)}
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            {isSubmitting ? (
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
                                statusSelections[session.id] === 'izin'
                                  ? "Tuliskan alasan izin (contoh: Mengikuti lomba OSN, ada urusan keluarga)..."
                                  : "Tuliskan keterangan sakit (contoh: Demam & flu, istirahat dokter)..."
                              }
                              maxLength={200}
                              value={noteInputs[session.id] || ''}
                              onChange={(e) => setNoteInputs(prev => ({ ...prev, [session.id]: e.target.value }))}
                              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all placeholder:text-stone-400"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCheckIn(session.id, false)}
                            disabled={isSubmitting}
                            className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                              statusSelections[session.id] === 'izin'
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-amber-600 hover:bg-amber-700'
                            }`}
                          >
                            {isSubmitting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                            <span>Kirim Keterangan {statusSelections[session.id] === 'izin' ? 'Izin' : 'Sakit'}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {currentFeedback && (
                  <div className={`mt-3 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    currentFeedback.success 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {currentFeedback.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{currentFeedback.message}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
