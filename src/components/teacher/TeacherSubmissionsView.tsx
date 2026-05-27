import React, { useEffect, useState } from 'react';
import { 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  User, 
  Download, 
  PenTool, 
  X, 
  AlertCircle,
  Loader2,
  RefreshCw,
  Search
} from 'lucide-react';

interface Submission {
  id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  meeting_id: string;
  meeting_number: number;
  meeting_title: string;
  filename: string;
  original_name: string;
  grade: number | null;
  teacher_comment: string | null;
  status: 'pending' | 'graded';
  submitted_at: string;
  graded_at: string | null;
}

export default function TeacherSubmissionsView() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtering states
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'graded'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Grading modal states
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [gradeValue, setGradeValue] = useState<number>(85);
  const [commentValue, setCommentValue] = useState<string>('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError('');
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
      const url = filterStatus === 'all' 
        ? `${API_BASE}/teacher/submissions.php` 
        : `${API_BASE}/teacher/submissions.php?status=${filterStatus}`;
        
      const res = await fetch(url, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.submissions || []);
      } else {
        setError(data.message || 'Gagal memuat daftar tugas.');
      }
    } catch (err) {
      setError('Koneksi gagal. Silakan jalankan Apache di XAMPP Control Panel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [filterStatus]);

  const openGradingModal = (sub: Submission) => {
    setSelectedSub(sub);
    setGradeValue(sub.grade !== null ? sub.grade : 85);
    setCommentValue(sub.teacher_comment || '');
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    setSubmitLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${API_BASE}/teacher/grade-submission.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          submission_id: selectedSub.id,
          grade: gradeValue,
          teacher_comment: commentValue
        }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message || 'Tugas berhasil dinilai.');
        setSelectedSub(null);
        fetchSubmissions();
        setTimeout(() => setSuccess(''), 4000);
      } else {
        alert(data.message || 'Gagal menyimpan nilai.');
      }
    } catch (err) {
      alert('Koneksi gagal saat mengirim data penilaian.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Filter list locally by search query
  const filteredSubmissions = submissions.filter(sub => 
    sub.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.student_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.meeting_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.original_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center text-left">
        <div>
          <h2 className="font-display font-black text-2xl text-[#154212]">Review & Nilai LKM</h2>
          <p className="text-xs text-gray-500">Evaluasi lembar kerja siswa, berikan penilaian berkala, serta komentar konstruktif yang terintegrasi Eco-Points.</p>
        </div>
        <button 
          onClick={fetchSubmissions}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-white rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan</span>
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold text-left">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-semibold text-left">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Control filter panel */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 text-left">
        
        {/* Status Filter buttons */}
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${filterStatus === 'all' ? 'bg-[#154212] text-white shadow' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
          >
            Semua ({submissions.length})
          </button>
          <button 
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${filterStatus === 'pending' ? 'bg-amber-600 text-white shadow' : 'bg-amber-50 text-amber-700 hover:bg-amber-100/60'}`}
          >
            Belum Dinilai ({submissions.filter(s => s.status === 'pending').length})
          </button>
          <button 
            onClick={() => setFilterStatus('graded')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${filterStatus === 'graded' ? 'bg-emerald-700 text-white shadow' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/60'}`}
          >
            Sudah Dinilai ({submissions.filter(s => s.status === 'graded').length})
          </button>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-72">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 focus:border-[#154212] focus:bg-white text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none transition-all" 
            placeholder="Cari siswa atau tugas..."
          />
        </div>

      </div>

      {/* Main Table view */}
      {loading ? (
        <div className="py-24 flex flex-col justify-center items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
          <span className="text-xs text-gray-400 font-bold">Sedang mengambil daftar tugas...</span>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="py-16 text-center text-xs text-gray-400 font-semibold border-2 border-dashed border-gray-200 rounded-3xl bg-white">
          Tidak ada pengumpulan tugas yang sesuai dengan kriteria filter.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Siswa</th>
                  <th className="py-4 px-6">Topik Meeting</th>
                  <th className="py-4 px-6">Nama Berkas</th>
                  <th className="py-4 px-6">Tanggal Upload</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Nilai</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {filteredSubmissions.map((sub) => {
                  const isGraded = sub.status === 'graded';
                  return (
                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Student info */}
                      <td className="py-4.5 px-6">
                        <div className="font-bold text-[#1a1c1c]">{sub.student_name}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{sub.student_email}</div>
                      </td>

                      {/* Topic info */}
                      <td className="py-4.5 px-6">
                        <div className="font-semibold text-emerald-950">M{sub.meeting_number}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5 truncate max-w-xs">{sub.meeting_title}</div>
                      </td>

                      {/* Filename */}
                      <td className="py-4.5 px-6 font-mono text-[10px] text-gray-600">
                        <span className="truncate max-w-[150px] block" title={sub.original_name}>
                          {sub.original_name}
                        </span>
                      </td>

                      {/* Submitted date */}
                      <td className="py-4.5 px-6 text-gray-500">
                        {new Date(sub.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Status badge */}
                      <td className="py-4.5 px-6 text-center">
                        {isGraded ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase">
                            Dinilai
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase animate-pulse">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Grade count */}
                      <td className="py-4.5 px-6 text-center font-mono font-bold text-sm">
                        {isGraded ? (
                          <span className={`${sub.grade && sub.grade >= 80 ? 'text-[#006e1c]' : 'text-gray-700'}`}>
                            {sub.grade}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-4.5 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => alert(`Mengunduh file: ${sub.original_name}\n(Pengunduhan file lokal dinonaktifkan di demo)`)}
                            className="p-2 border border-gray-200 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors"
                            title="Unduh Berkas Siswa"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openGradingModal(sub)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#154212] hover:bg-[#276e23] text-white rounded-xl text-[10px] font-bold shadow-sm cursor-pointer"
                          >
                            <PenTool className="w-3 h-3" />
                            <span>{isGraded ? 'Edit Nilai' : 'Beri Nilai'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grading / Penilaian Modal overlay */}
      {selectedSub && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <div className="bg-[#154212] p-5 text-white flex justify-between items-center">
              <div>
                <h4 className="font-display font-bold text-sm">Penilaian Lembar Kerja LKM</h4>
                <p className="text-[10px] text-[#a1d494] mt-0.5">Siswa: {selectedSub.student_name}</p>
              </div>
              <button onClick={() => setSelectedSub(null)} className="text-white hover:text-red-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGradeSubmit} className="p-6 space-y-5">
              
              {/* Task Details Info */}
              <div className="p-3.5 bg-gray-50 border border-gray-150 rounded-2xl space-y-1">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Detail Pengumpulan</div>
                <div className="text-xs text-gray-700">Pertemuan {selectedSub.meeting_number}: <span className="font-bold">{selectedSub.meeting_title}</span></div>
                <div className="text-[10px] text-emerald-800 font-mono mt-1 break-all flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  <span>{selectedSub.original_name}</span>
                </div>
              </div>

              {/* Slider / Grade Value Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold text-[#42493e] uppercase tracking-wider">Nilai Kinerja LKM (0 - 100)</label>
                  <span className="font-mono text-base font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    {gradeValue}
                  </span>
                </div>
                <input 
                  type="range" 
                  min={0} 
                  max={100} 
                  value={gradeValue}
                  onChange={(e) => setGradeValue(parseInt(e.target.value) || 0)}
                  className="w-full accent-emerald-700 h-1.5 cursor-pointer bg-gray-100 rounded-lg"
                />
                
                {/* Gamification Points Indicator */}
                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">
                  {gradeValue >= 90 ? '⭐⭐⭐ Bonus +50 Eco-Points untuk Siswa (Lulus Istimewa)' :
                   gradeValue >= 80 ? '⭐⭐ Bonus +30 Eco-Points untuk Siswa (Lulus Baik)' :
                   gradeValue >= 70 ? '⭐ Bonus +10 Eco-Points untuk Siswa (Lulus Cukup)' :
                   'Siswa belum mencapai batas bonus Eco-Points (< 70)'}
                </div>
              </div>

              {/* Comments/Feedback Textarea */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-[#42493e] uppercase tracking-wider">Ulasan & Komentar Guru</label>
                <textarea 
                  value={commentValue}
                  onChange={(e) => setCommentValue(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-[#154212] focus:bg-white text-xs rounded-xl px-4 py-2.5 focus:outline-none transition-all h-24 resize-none" 
                  placeholder="Berikan masukan berharga mengenai uji reaksi kimia organik/reaktor ekoenzim..."
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-150">
                <button 
                  type="button" 
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={submitLoading}
                  className="px-4 py-2 bg-[#154212] hover:bg-[#276e23] text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5"
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Kirim Penilaian</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
