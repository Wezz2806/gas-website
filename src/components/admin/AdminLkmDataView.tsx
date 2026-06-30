import React, { useState, useEffect } from 'react';
import { ClipboardList, Loader2, Eye, Download, Calendar, User, FileText, ArrowRight } from 'lucide-react';
import { Meeting } from '../../types';

interface StudentSubmission {
  id: number;
  meeting_id: string;
  meeting_title: string | null;
  filename: string;
  original_name: string;
  status: 'pending' | 'graded';
  submitted_at: string;
  student_name: string;
  student_email: string;
}

export default function AdminLkmDataView() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Manage Panel State
  const [selectedLkmId, setSelectedLkmId] = useState<string | null>(null);
  const [selectedLkmNumber, setSelectedLkmNumber] = useState<number | null>(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

  const fetchMeetings = () => {
    setIsLoadingMeetings(true);
    fetch(`${API_BASE}/ecolab.php`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.meetings) {
          // Sort meetings by number to ensure LKM 1, 2, 3, 4 ordering
          const sorted = [...data.meetings].sort((a, b) => a.number - b.number);
          setMeetings(sorted);
        } else {
          setError(data.message || 'Gagal memuat materi LKM.');
        }
      })
      .catch(() => {
        setError('Masalah koneksi jaringan saat memuat materi LKM.');
      })
      .finally(() => {
        setIsLoadingMeetings(false);
      });
  };

  const fetchSubmissions = () => {
    setIsLoadingSubmissions(true);
    setError(null);
    fetch(`${API_BASE}/ecolab.php?action=get_submissions`, { credentials: 'include' })
      .then(async res => {
        const data = await res.json();
        if (res.ok && data.success && data.submissions) {
          setSubmissions(data.submissions);
        } else {
          setError(data.message || `Error ${res.status}: Gagal memuat data pengumpulan.`);
        }
      })
      .catch(err => {
        console.error('Error fetching submissions:', err);
        setError('Masalah koneksi jaringan saat memuat data pengumpulan.');
      })
      .finally(() => {
        setIsLoadingSubmissions(false);
      });
  };

  useEffect(() => {
    fetchMeetings();
    fetchSubmissions();
  }, []);

  // Filter submissions by the selected meeting_id
  const filteredSubmissions = submissions.filter(
    (sub) => sub.meeting_id === selectedLkmId
  );

  const selectedMeetingInfo = meetings.find((m) => m.id === selectedLkmId);

  // Standard LKM numbers to ensure we always show LKM 1, 2, 3, 4
  const lkmNumbers = [1, 2, 3, 4];

  return (
    <div className="space-y-10 text-left">
      {/* Page Header */}
      <header className="flex justify-between items-center flex-wrap gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="font-display font-black text-2xl text-slate-800 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-cyan-600" />
            Kelola Data LKM Siswa
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Pantau dan unduh berkas Laporan Lembar Kerja Mahasiswa (LKM) yang dikirimkan oleh siswa.
          </p>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-150 rounded-2xl flex items-center gap-3 text-rose-800 text-sm animate-in fade-in duration-200">
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* SECTION 1: LKM Grid (4 Boxes) */}
      <section className="space-y-4">
        <h3 className="font-display font-bold text-slate-800 text-sm">
          Pilih Modul LKM untuk Dikelola:
        </h3>
        
        {isLoadingMeetings ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {lkmNumbers.map((num) => {
              // Find the corresponding meeting from the DB (using Number() to ensure type-safe comparison)
              const dbMeeting = meetings.find((m) => Number(m.number) === num);
              const totalSubs = submissions.filter(
                (sub) => sub.meeting_id === (dbMeeting?.id || `m${num}`)
              ).length;

              return (
                <div 
                  key={num} 
                  className={`bg-white border rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                    selectedLkmNumber === num 
                      ? 'border-cyan-500 ring-2 ring-cyan-500/20 scale-[1.02]' 
                      : 'border-slate-200 hover:border-slate-350 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="px-3 py-1 bg-cyan-55 bg-opacity-20 text-cyan-700 font-extrabold text-[10px] uppercase rounded-full">
                        LKM {num}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {totalSubs} Submisi
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-sm text-slate-800 line-clamp-1">
                        {dbMeeting ? dbMeeting.title : `Modul Pertemuan ${num}`}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {dbMeeting ? dbMeeting.description : 'Materi LKM belum diisi di menu Kelola EcoLab.'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-auto">
                    <button
                      onClick={() => {
                        setSelectedLkmNumber(num);
                        setSelectedLkmId(dbMeeting?.id || `m${num}`);
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        selectedLkmNumber === num
                          ? 'bg-cyan-600 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>Kelola</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 2: Kelola Data Panel (Only visible when LKM is selected) */}
      {selectedLkmId && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          <div className="border-b border-slate-100 pb-4 flex justify-between items-center flex-wrap gap-3">
            <div>
              <h3 className="font-display font-black text-slate-800 text-base">
                Kelola Data Pengumpulan: LKM {selectedLkmNumber}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {selectedMeetingInfo 
                  ? `"${selectedMeetingInfo.title}"` 
                  : 'Modul penelitian pembelajaran lingkungan hidup.'}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedLkmId(null);
                setSelectedLkmNumber(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              Tutup Panel
            </button>
          </div>

          {isLoadingSubmissions ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-455 uppercase font-bold tracking-wider">
                    <th className="py-3.5 px-4 w-1/3">Nama Siswa</th>
                    <th className="py-3.5 px-4">Berkas Laporan LKM</th>
                    <th className="py-3.5 px-4">Waktu Pengumpulan</th>
                    <th className="py-3.5 px-4 text-right w-44">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 space-y-0.5">
                        <p className="font-bold text-slate-800 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {sub.student_name}
                        </p>
                        <p className="text-[10px] text-slate-455">{sub.student_email}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-cyan-500 shrink-0" />
                          <span className="font-medium text-slate-750 truncate max-w-[200px]" title={sub.original_name}>
                            {sub.original_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(sub.submitted_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <a
                            href={`/uploads/submissions/${sub.filename}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Baca</span>
                          </a>
                          <a
                            href={`/uploads/submissions/${sub.filename}`}
                            download={sub.original_name}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer border border-cyan-100"
                          >
                            <Download className="w-3.5 h-3.5 text-cyan-600" />
                            <span>Download</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredSubmissions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                        Belum ada siswa yang mengumpulkan laporan untuk LKM {selectedLkmNumber}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
