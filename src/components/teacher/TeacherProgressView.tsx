import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  Award, 
  Flame, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  ArrowUpDown,
  GraduationCap
} from 'lucide-react';

interface StudentProgress {
  id: number;
  full_name: string;
  email: string;
  eco_points: number;
  streak: number;
  avatar_url: string | null;
  total_submissions: number;
  avg_grade: number | null;
  status: 'LULUS' | 'BELUM LULUS' | 'Belum Ada Nilai';
}

type SortField = 'full_name' | 'eco_points' | 'streak' | 'avg_grade';
type SortOrder = 'asc' | 'desc';

export default function TeacherProgressView() {
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('full_name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const fetchProgress = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/teacher/student-progress.php', {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setStudents(data.students || []);
      } else {
        setError(data.message || 'Gagal memuat kemajuan siswa.');
      }
    } catch (err) {
      setError('Koneksi gagal. Pastikan XAMPP Apache dan MySQL berjalan aktif.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default to high-to-low for points/grades
    }
  };

  // Export mock CSV
  const handleExportCSV = () => {
    if (students.length === 0) return;
    
    // Create CSV header & content
    const headers = 'ID,Nama Lengkap,Email,Eco-Points,Streak Harian,Tugas Dikumpul,Rata-rata Nilai,Status Kelulusan\n';
    const rows = students.map(s => 
      `${s.id},"${s.full_name}",${s.email},${s.eco_points},${s.streak},${s.total_submissions},${s.avg_grade || 0},${s.status}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Kemajuan_Siswa_GAS_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccess('Laporan kemajuan CSV berhasil diekspor.');
    setTimeout(() => setSuccess(''), 3000);
  };

  // Filter & Sort logic
  const filteredAndSorted = students
    .filter(s => s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle null average grades gracefully in comparison
      if (sortField === 'avg_grade') {
        valA = valA !== null ? valA : -1;
        valB = valB !== null ? valB : -1;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // KPI Calculations
  const classAvgGrade = students.filter(s => s.avg_grade !== null).length > 0
    ? round(students.reduce((acc, curr) => acc + (curr.avg_grade || 0), 0) / students.filter(s => s.avg_grade !== null).length, 1)
    : 0;

  const passRatePercent = students.length > 0
    ? round((students.filter(s => s.status === 'LULUS').length / students.length) * 100, 0)
    : 0;

  function round(value: number, precision: number) {
    const multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center text-left">
        <div>
          <h2 className="font-display font-black text-2xl text-[#154212]">Laporan Kemajuan Siswa</h2>
          <p className="text-xs text-gray-500">Pantau akumulasi skor Eco-Points, rekor streak harian, dan evaluasi hasil belajar akhir seluruh siswa.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportCSV}
            disabled={loading || students.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-[#154212] text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
          
          <button 
            onClick={fetchProgress}
            disabled={loading}
            className="flex items-center justify-center p-2 border border-gray-200 bg-white rounded-xl hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-700 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        {/* Total Students */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Mahasiswa</span>
            <h4 className="text-xl font-bold text-gray-800 mt-0.5">{students.length} Siswa</h4>
          </div>
        </div>

        {/* Average Class Grade */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Rata-rata Nilai Kelas</span>
            <h4 className="text-xl font-bold text-gray-800 mt-0.5">{classAvgGrade} / 100</h4>
          </div>
        </div>

        {/* Class Pass Rate */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Kelulusan Kelas</span>
            <h4 className="text-xl font-bold text-gray-800 mt-0.5">{passRatePercent}% Lulus</h4>
          </div>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center text-left">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 focus:border-[#154212] focus:bg-white text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none transition-all" 
            placeholder="Cari siswa berdasarkan nama atau email..."
          />
        </div>
      </div>

      {/* Main progress table */}
      {loading ? (
        <div className="py-24 flex flex-col justify-center items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
          <span className="text-xs text-gray-400 font-bold">Sedang memproses laporan kemajuan...</span>
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="py-16 text-center text-xs text-gray-400 font-semibold border-2 border-dashed border-gray-200 rounded-3xl bg-white">
          Siswa tidak ditemukan.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('full_name')}>
                    <div className="flex items-center gap-1">
                      <span>Nama Lengkap</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </th>
                  <th className="py-4 px-6 text-center cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('eco_points')}>
                    <div className="flex items-center justify-center gap-1">
                      <span>Eco-Points</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </th>
                  <th className="py-4 px-6 text-center cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('streak')}>
                    <div className="flex items-center justify-center gap-1">
                      <span>Streak</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </th>
                  <th className="py-4 px-6 text-center">Tugas Dikumpul</th>
                  <th className="py-4 px-6 text-center cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('avg_grade')}>
                    <div className="flex items-center justify-center gap-1">
                      <span>Rata-rata LKM</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </th>
                  <th className="py-4 px-6 text-center">Status Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {filteredAndSorted.map((student) => {
                  const statusColors = 
                    student.status === 'LULUS' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
                    student.status === 'BELUM LULUS' ? 'bg-red-50 text-red-800 border-red-100' :
                    'bg-gray-100 text-gray-500 border-gray-200';

                  return (
                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Name Card */}
                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-3">
                          {student.avatar_url ? (
                            <img src={student.avatar_url} alt={student.full_name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold font-sans">
                              {student.full_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-[#1a1c1c]">{student.full_name}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">{student.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Eco Points */}
                      <td className="py-4.5 px-6 text-center font-bold text-emerald-850">
                        {student.eco_points} EP
                      </td>

                      {/* Streak */}
                      <td className="py-4.5 px-6 text-center text-amber-700 font-extrabold">
                        🔥 {student.streak}
                      </td>

                      {/* Submissions count */}
                      <td className="py-4.5 px-6 text-center text-gray-600 font-medium">
                        {student.total_submissions} Pertemuan
                      </td>

                      {/* Average Grade */}
                      <td className="py-4.5 px-6 text-center font-mono font-bold text-sm">
                        {student.avg_grade !== null ? (
                          <span className={student.avg_grade >= 75 ? 'text-[#006e1c]' : 'text-gray-700'}>
                            {student.avg_grade}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>

                      {/* Status badge */}
                      <td className="py-4.5 px-6 text-center">
                        <span className={`inline-block border px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase ${statusColors}`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
