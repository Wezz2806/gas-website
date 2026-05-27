import React, { useEffect, useState } from 'react';
import { 
  Users, 
  FlaskConical, 
  Microscope, 
  Package, 
  Plus, 
  Trash2, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  X,
  FileText,
  Loader2,
  Calendar,
  Lock,
  ChevronRight
} from 'lucide-react';

interface Meeting {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  status: 'completed' | 'ongoing' | 'scheduled';
  submissions_count: number;
  pending_count: number;
  material_file: string | null;
  material_original_name: string | null;
}

export default function TeacherMeetingsView() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states for creating a new meeting
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMeetingId, setNewMeetingId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newNumber, setNewNumber] = useState(1);
  const [newIcon, setNewIcon] = useState('science');
  const [formLoading, setFormLoading] = useState(false);

  // File upload state
  const [uploadingMeetingId, setUploadingMeetingId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(-1);

  const fetchMeetings = async () => {
    setLoading(true);
    setError('');
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${API_BASE}/teacher/meetings.php`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setMeetings(data.meetings || []);
      } else {
        setError(data.message || 'Gagal memuat data pertemuan.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Koneksi gagal. Silakan periksa jaringan server Apache Anda.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const getMeetingIcon = (iconName: string) => {
    switch (iconName) {
      case 'groups': return Users;
      case 'science': return FlaskConical;
      case 'biotech': return Microscope;
      case 'inventory': return Package;
      default: return FlaskConical;
    }
  };

  // Change meeting status
  const handleStatusChange = async (meetingId: string, currentMeeting: Meeting, newStatus: 'completed' | 'ongoing' | 'scheduled') => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${API_BASE}/teacher/meetings.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          id: meetingId,
          number: currentMeeting.number,
          title: currentMeeting.title,
          description: currentMeeting.description,
          icon: currentMeeting.icon,
          status: newStatus
        }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Status pertemuan berhasil diperbarui.');
        fetchMeetings();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Gagal memperbarui status.');
      }
    } catch (err) {
      setError('Gagal mengirim data pembaruan status.');
    }
  };

  // Upload PDF material handler
  const handleMaterialUpload = async (meetingId: string, file: File) => {
    setUploadingMeetingId(meetingId);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('meeting_id', meetingId);
    formData.append('material_file', file);

    try {
      // Simulate progressive file upload animation
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${API_BASE}/teacher/upload-material.php`, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData,
        credentials: 'include'
      });
      clearInterval(interval);
      setUploadProgress(100);

      const data = await res.json();
      if (data.success) {
        setSuccess('Buku Panduan / Materi LKM berhasil diunggah.');
        fetchMeetings();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Gagal mengunggah materi.');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi saat mengunggah materi.');
    } finally {
      setTimeout(() => {
        setUploadingMeetingId(null);
        setUploadProgress(-1);
      }, 500);
    }
  };

  // Create new meeting
  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeetingId || !newTitle || !newNumber) {
      alert('Harap isi semua field utama.');
      return;
    }
    setFormLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${API_BASE}/teacher/meetings.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          id: newMeetingId,
          number: newNumber,
          title: newTitle,
          description: newDesc,
          icon: newIcon,
          status: 'scheduled'
        }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Pertemuan baru berhasil dibuat!');
        fetchMeetings();
        setShowAddModal(false);
        setNewMeetingId('');
        setNewTitle('');
        setNewDesc('');
        setNewNumber(meetings.length + 2);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        alert(data.message || 'Gagal membuat pertemuan.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi server.');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete meeting
  const handleDeleteMeeting = async (meetingId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pertemuan ini? Semua pengumpulan tugas siswa untuk pertemuan ini juga akan terhapus secara permanen.')) {
      return;
    }

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${API_BASE}/teacher/meetings.php`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ id: meetingId }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Pertemuan berhasil dihapus.');
        fetchMeetings();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Gagal menghapus pertemuan.');
      }
    } catch (err) {
      setError('Koneksi gagal saat menghapus data.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center text-left">
        <div>
          <h2 className="font-display font-black text-2xl text-[#154212]">Manajemen Pertemuan</h2>
          <p className="text-xs text-gray-500">Buat agenda mingguan baru, kendalikan status akses materi, dan unggah berkas Lembar Kerja Mahasiswa (LKM).</p>
        </div>
        <button 
          onClick={() => {
            setNewNumber(meetings.length + 1);
            setNewMeetingId(`meeting_${meetings.length + 1}`);
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#154212] hover:bg-[#276e23] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#154212]/10 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pertemuan</span>
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

      {/* Loading state */}
      {loading ? (
        <div className="py-24 flex flex-col justify-center items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
          <span className="text-xs text-gray-400 font-bold">Sedang mengambil daftar agenda...</span>
        </div>
      ) : meetings.length === 0 ? (
        <div className="py-16 text-center text-xs text-gray-400 font-semibold border-2 border-dashed border-gray-200 rounded-3xl">
          Belum ada pertemuan terdaftar. Klik "Tambah Pertemuan" untuk memulai.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {meetings.map((meeting) => {
            const IconComponent = getMeetingIcon(meeting.icon);
            const isOngoing = meeting.status === 'ongoing';
            const isCompleted = meeting.status === 'completed';
            const isScheduled = meeting.status === 'scheduled';

            return (
              <div 
                key={meeting.id}
                className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                  isOngoing ? 'border-amber-400 shadow-md ring-1 ring-amber-300' :
                  isCompleted ? 'border-emerald-500/30' :
                  'border-gray-150 grayscale'
                }`}
              >
                <div>
                  {/* Top line with Icon & Delete */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${
                      isCompleted ? 'bg-emerald-50 text-[#006e1c]' : 
                      isOngoing ? 'bg-amber-50 text-amber-700' : 
                      'bg-gray-100 text-gray-400'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status Selector Dropdown */}
                      <select 
                        value={meeting.status}
                        onChange={(e) => handleStatusChange(meeting.id, meeting, e.target.value as any)}
                        className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full border cursor-pointer focus:outline-none ${
                          isCompleted ? 'bg-emerald-100 text-[#006e1c] border-emerald-200' :
                          isOngoing ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          'bg-gray-100 text-gray-500 border-gray-200'
                        }`}
                      >
                        <option value="completed">Completed / Selesai</option>
                        <option value="ongoing">Ongoing / Aktif</option>
                        <option value="scheduled">Scheduled / Terkunci</option>
                      </select>

                      <button 
                        onClick={() => handleDeleteMeeting(meeting.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                        title="Hapus Pertemuan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Text details */}
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                    PERTEMUAN {meeting.number}
                  </span>
                  <h4 className="font-display font-bold text-base text-[#154212] mb-1">
                    {meeting.title}
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">
                    {meeting.description || 'Tidak ada deskripsi pertemuan.'}
                  </p>
                </div>

                {/* Submissions count summary */}
                <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-[#42493e] uppercase">Penyerahan LKM Siswa</span>
                  <div className="flex gap-2">
                    <span className="text-xs font-bold text-gray-700 bg-white border border-gray-200 px-2 py-0.5 rounded-lg shadow-sm">
                      {meeting.submissions_count} Total
                    </span>
                    {meeting.pending_count > 0 && (
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg shadow-sm">
                        {meeting.pending_count} Belum Dinilai
                      </span>
                    )}
                  </div>
                </div>

                {/* Material Upload segment */}
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Buku Panduan Pertemuan</span>
                    {meeting.material_file ? (
                      <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1 mt-0.5 truncate" title={meeting.material_original_name || ''}>
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{meeting.material_original_name}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        <span>Materi belum tersedia</span>
                      </span>
                    )}
                  </div>

                  <div className="shrink-0">
                    {uploadingMeetingId === meeting.id ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{uploadProgress}%</span>
                      </div>
                    ) : (
                      <label className="flex items-center gap-1 px-3 py-1.5 border border-emerald-600 bg-emerald-50 text-[#006e1c] hover:bg-emerald-100/60 rounded-xl text-xs font-bold cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Unggah PDF</span>
                        <input 
                          type="file" 
                          accept=".pdf,.docx,.doc" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleMaterialUpload(meeting.id, e.target.files[0]);
                            }
                          }}
                          className="hidden" 
                        />
                      </label>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add New Meeting Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <div className="bg-[#154212] p-5 text-white flex justify-between items-center">
              <h4 className="font-display font-bold text-sm">Tambah Pertemuan Baru</h4>
              <button onClick={() => setShowAddModal(false)} className="text-white hover:text-red-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="p-6 space-y-4">
              {/* Meeting ID */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-[#42493e] uppercase tracking-wider">ID Pertemuan (Key Unik)</label>
                <input 
                  type="text" 
                  value={newMeetingId}
                  onChange={(e) => setNewMeetingId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-[#154212] focus:bg-white text-xs rounded-xl px-4 py-2.5 focus:outline-none transition-all" 
                  placeholder="meeting_5"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Meeting Number */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-[#42493e] uppercase tracking-wider">Pertemuan Ke-</label>
                  <input 
                    type="number" 
                    value={newNumber}
                    onChange={(e) => setNewNumber(parseInt(e.target.value) || 1)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#154212] focus:bg-white text-xs rounded-xl px-4 py-2.5 focus:outline-none transition-all" 
                    min={1}
                    required
                  />
                </div>

                {/* Icon selection */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-[#42493e] uppercase tracking-wider">Pilih Ikon Visual</label>
                  <select 
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#154212] focus:bg-white text-xs rounded-xl px-3 py-2.5 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="science">science (Reaktor/Gelas Kimia)</option>
                    <option value="groups">groups (Kolaborasi Siswa)</option>
                    <option value="biotech">biotech (Mikroskop)</option>
                    <option value="inventory">inventory (Paket/Kotak)</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-[#42493e] uppercase tracking-wider">Judul Topik Pembelajaran</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-[#154212] focus:bg-white text-xs rounded-xl px-4 py-2.5 focus:outline-none transition-all" 
                  placeholder="Uji Kandungan Ecoenzim Skala Sekolah"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-[#42493e] uppercase tracking-wider">Deskripsi Singkat Pembelajaran</label>
                <textarea 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-[#154212] focus:bg-white text-xs rounded-xl px-4 py-2.5 focus:outline-none transition-all h-20 resize-none" 
                  placeholder="Deskripsikan secara singkat capaian materi pertemuan ini..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-150">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={formLoading}
                  className="px-4 py-2 bg-[#154212] hover:bg-[#276e23] text-white text-xs font-bold rounded-xl shadow-lg transition-all"
                >
                  {formLoading ? 'Menyimpan...' : 'Simpan Pertemuan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
