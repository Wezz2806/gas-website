import React, { useState, useEffect } from 'react';
import { ClipboardList, Loader2, Eye, Download, Calendar, User, FileText, ArrowRight, Upload, Plus, Trash2, Save, File, Table, Image, FlaskConical } from 'lucide-react';
import { Meeting, JournalRow } from '../../types';

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
  grade?: number | null;
}

export default function AdminEcolabView() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Manage Panel State
  const [selectedLkmId, setSelectedLkmId] = useState<string | null>(null);
  const [selectedLkmNumber, setSelectedLkmNumber] = useState<number | null>(null);

  // Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'lkm' | 'journal'>('lkm');

  // Journal admin states
  const [journalStudents, setJournalStudents] = useState<any[]>([]);
  const [isLoadingJournal, setIsLoadingJournal] = useState(false);
  const [selectedJournalStudent, setSelectedJournalStudent] = useState<any | null>(null);
  const [selectedJournalRows, setSelectedJournalRows] = useState<JournalRow[]>([]);
  const [isLoadingJournalRows, setIsLoadingJournalRows] = useState(false);

  // Grading states
  const [gradingSubmission, setGradingSubmission] = useState<StudentSubmission | null>(null);
  const [tempGrade, setTempGrade] = useState<string>('');
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);

  const handleSaveLkmGrade = () => {
    if (!gradingSubmission) return;
    setIsSubmittingGrade(true);
    fetch(`${API_BASE}/ecolab.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'grade_submission',
        id: gradingSubmission.id,
        grade: tempGrade !== '' ? parseInt(tempGrade, 10) : null
      }),
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Nilai LKM berhasil disimpan!');
          setSubmissions(prev => prev.map(sub => 
            sub.id === gradingSubmission.id 
              ? { ...sub, grade: tempGrade !== '' ? parseInt(tempGrade, 10) : null, status: 'graded' }
              : sub
          ));
          setGradingSubmission(null);
        } else {
          alert(data.message || 'Gagal menyimpan nilai.');
        }
      })
      .catch(() => alert('Terjadi kesalahan jaringan.'))
      .finally(() => setIsSubmittingGrade(false));
  };

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
  const fetchJournalStudents = () => {
    setIsLoadingJournal(true);
    fetch(`${API_BASE}/sustainability-journal.php?action=get_students`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.students) {
          setJournalStudents(data.students);
        } else {
          setError(data.message || 'Gagal memuat data jurnal murid.');
        }
      })
      .catch(() => {
        setError('Masalah koneksi jaringan saat memuat data jurnal.');
      })
      .finally(() => {
        setIsLoadingJournal(false);
      });
  };

  const handleOpenStudentJournal = (student: any) => {
    setSelectedJournalStudent(student);
    setIsLoadingJournalRows(true);
    fetch(`${API_BASE}/sustainability-journal.php?student_id=${student.id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.journal) {
          setSelectedJournalRows(data.journal);
        } else {
          alert(data.message || 'Gagal memuat jurnal murid.');
        }
      })
      .catch(() => {
        alert('Masalah koneksi jaringan saat memuat data jurnal.');
      })
      .finally(() => {
        setIsLoadingJournalRows(false);
      });
  };
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
  }, []);  // Filter submissions by the selected meeting_id
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
            <FlaskConical className="w-7 h-7 text-cyan-600" />
            Kelola EcoLab Murid
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Pantau dan unduh berkas Laporan Lembar Kerja Murid (LKM) serta jurnal monitoring keberlanjutan.
          </p>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-150 rounded-2xl flex items-center gap-3 text-rose-800 text-sm animate-in fade-in duration-200">
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 gap-2 mb-6">
        <button
          onClick={() => setActiveSubTab('lkm')}
          className={`pb-3 px-6 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'lkm'
              ? 'border-cyan-600 text-cyan-600'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          Submisi Berkas LKM
        </button>
        <button
          onClick={() => {
            setActiveSubTab('journal');
            fetchJournalStudents();
          }}
          className={`pb-3 px-6 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'journal'
              ? 'border-cyan-600 text-cyan-600'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          Jurnal Monitoring Keberlanjutan
        </button>
      </div>      {activeSubTab === 'lkm' && (
        <>
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
                    <th className="py-3.5 px-4 w-1/3">Nama Murid</th>
                    <th className="py-3.5 px-4">Berkas Laporan LKM</th>
                    <th className="py-3.5 px-4">Waktu Pengumpulan</th>
                    <th className="py-3.5 px-4">Nilai</th>
                    <th className="py-3.5 px-4 text-right w-56">Aksi</th>
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
                      <td className="py-4 px-4 font-bold text-slate-700">
                        {sub.grade !== null && sub.grade !== undefined ? (
                          <span className="px-2.5 py-1 bg-cyan-50 text-cyan-700 rounded-lg text-xs">
                            {sub.grade}
                          </span>
                        ) : (
                          <span className="text-slate-450 font-normal italic">Belum dinilai</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setGradingSubmission(sub);
                              setTempGrade(sub.grade !== null && sub.grade !== undefined ? sub.grade.toString() : '');
                            }}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer border border-emerald-100"
                          >
                            <ClipboardList className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Nilai</span>
                          </button>
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
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                        Belum ada murid yang mengumpulkan laporan untuk LKM {selectedLkmNumber}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
        </>
      )}
      {activeSubTab === 'journal' && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-display font-bold text-slate-800 text-base">
              Daftar Jurnal Monitoring Keberlanjutan Murid
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Daftar murid yang telah mengisi data pengamatan tabel monitoring keberlanjutan.
            </p>
          </div>

          {isLoadingJournal ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-455 uppercase font-bold tracking-wider">
                    <th className="py-3.5 px-4 w-1/3">Nama Murid</th>
                    <th className="py-3.5 px-4">Waktu Terakhir Diperbarui</th>
                    <th className="py-3.5 px-4 text-right w-44">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {journalStudents.map((stud) => (
                    <tr key={stud.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 space-y-0.5">
                        <p className="font-bold text-slate-800 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {stud.name}
                        </p>
                        <p className="text-[10px] text-slate-455">{stud.email}</p>
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {stud.last_updated ? new Date(stud.last_updated).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '-'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleOpenStudentJournal(stud)}
                          className="px-3.5 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer border border-cyan-100 float-right"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-600" />
                          <span>Lihat Jurnal</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {journalStudents.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-12 text-center text-slate-400 font-medium">
                        Belum ada murid yang mengisi jurnal monitoring keberlanjutan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
      {selectedJournalStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[95] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-slate-900 px-6 py-5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 text-cyan-400" />
                <div>
                  <h4 className="font-display font-bold text-sm">
                    Jurnal Monitoring Keberlanjutan Murid
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Murid: <strong>{selectedJournalStudent.name}</strong> ({selectedJournalStudent.email})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedJournalStudent(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              {isLoadingJournalRows ? (
                <div className="flex flex-col items-center justify-center h-full py-12 gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
                  <span className="text-xs text-gray-500 font-bold">Memuat data jurnal...</span>
                </div>
              ) : (
                <div className="overflow-x-auto border border-emerald-600 rounded-2xl">
                  <table className="w-full text-xs border-collapse border border-emerald-600 text-left min-w-[900px]">
                    <thead>
                      <tr className="bg-emerald-800 text-white font-bold text-center">
                        <th rowSpan={2} className="border border-emerald-600 p-3 w-36">Tanggal</th>
                        <th colSpan={3} className="border border-emerald-600 p-2">Parameter Fisik yang Diamati</th>
                        <th rowSpan={2} className="border border-emerald-600 p-3 min-w-[220px]">Mengapa hal itu bisa terjadi?</th>
                        <th rowSpan={2} className="border border-emerald-600 p-3 min-w-[220px]">Solusi Lanjutan yang Dilakukan</th>
                      </tr>
                      <tr className="bg-emerald-700 text-white font-bold text-center">
                        <th className="border border-emerald-600 p-2 w-36">Warna</th>
                        <th className="border border-emerald-600 p-2 w-36">Aroma</th>
                        <th className="border border-emerald-600 p-2 w-36">Gas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-600 text-emerald-950 font-sans">
                      {selectedJournalRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-emerald-50/20">
                          <td className="border border-emerald-600 p-3 w-36 font-semibold bg-slate-50/50 text-emerald-900">
                            {row.tanggal || '-'}
                          </td>
                          <td className="border border-emerald-600 p-3 w-36 text-emerald-900">
                            {row.warna || '-'}
                          </td>
                          <td className="border border-emerald-600 p-3 w-36 text-emerald-900">
                            {row.aroma || '-'}
                          </td>
                          <td className="border border-emerald-600 p-3 w-36 text-emerald-900">
                            {row.gas || '-'}
                          </td>
                          <td className="border border-emerald-600 p-3 min-w-[220px] whitespace-pre-wrap leading-relaxed text-emerald-900">
                            {row.alasan || '-'}
                          </td>
                          <td className="border border-emerald-600 p-3 min-w-[220px] whitespace-pre-wrap leading-relaxed text-emerald-900">
                            {row.solusi || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-100 shrink-0">
              <button
                onClick={() => setSelectedJournalStudent(null)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Tutup
              </button>
          </div>
        </div>
      </div>
      )}
      {/* Grading Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <h4 className="font-display font-black text-slate-800 text-base mb-2">
              Beri Nilai LKM - {gradingSubmission.student_name}
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Masukkan nilai untuk LKM {selectedLkmNumber}: "{selectedMeetingInfo?.title || `Modul Pertemuan ${selectedLkmNumber}`}"
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nilai (0 - 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-800"
                  placeholder="Masukkan nilai..."
                  value={tempGrade}
                  onChange={(e) => setTempGrade(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={() => setGradingSubmission(null)}
                className="flex-1 py-2.5 text-xs font-bold text-gray-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmittingGrade}
                onClick={handleSaveLkmGrade}
                className="flex-1 py-2.5 bg-cyan-650 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmittingGrade ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Simpan</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
