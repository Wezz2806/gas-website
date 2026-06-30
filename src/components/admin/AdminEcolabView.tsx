import React, { useState, useEffect } from 'react';
import { FlaskConical, Plus, Edit, Trash2, Check, AlertCircle, Loader2, Download, Eye } from 'lucide-react';
import { Meeting } from '../../types';

export default function AdminEcolabView() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Material Modal States
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  // Material Form Fields
  const [formId, setFormId] = useState('');
  const [formNumber, setFormNumber] = useState(1);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIcon, setFormIcon] = useState('science');
  const [formEmbedUrl, setFormEmbedUrl] = useState('');
  const [formDownloadUrl, setFormDownloadUrl] = useState('');

  const [isSavingMaterial, setIsSavingMaterial] = useState(false);
  const [saveMaterialSuccess, setSaveMaterialSuccess] = useState(false);
  const [saveMaterialError, setSaveMaterialError] = useState<string | null>(null);

  // Deletion States
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);
  const [isDeletingMeeting, setIsDeletingMeeting] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

  const fetchMeetings = () => {
    setIsLoadingMeetings(true);
    fetch(`${API_BASE}/ecolab.php`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.meetings) {
          setMeetings(data.meetings);
        } else {
          setError(data.message || 'Gagal memuat materi LKM.');
        }
      })
      .catch(() => {
        setError('Masalah koneksi jaringan saat memuat materi.');
      })
      .finally(() => {
        setIsLoadingMeetings(false);
      });
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleOpenAddMaterial = () => {
    setSelectedMeeting(null);
    setFormId('');
    setFormNumber(meetings.length + 1);
    setFormTitle('');
    setFormDescription('');
    setFormIcon('science');
    setFormEmbedUrl('');
    setFormDownloadUrl('');
    setSaveMaterialSuccess(false);
    setSaveMaterialError(null);
    setIsMaterialModalOpen(true);
  };

  const handleOpenEditMaterial = (m: Meeting) => {
    setSelectedMeeting(m);
    setFormId(m.id);
    setFormNumber(m.number);
    setFormTitle(m.title);
    setFormDescription(m.description);
    setFormIcon(m.icon);
    setFormEmbedUrl((m as any).embed_url || '');
    setFormDownloadUrl((m as any).download_url || '');
    setSaveMaterialSuccess(false);
    setSaveMaterialError(null);
    setIsMaterialModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!selectedMeeting) {
      // Auto generate id based on meeting number
      setFormId(`m${formNumber}`);
    }
  };

  const handleNumberChange = (num: number) => {
    setFormNumber(num);
    if (!selectedMeeting) {
      setFormId(`m${num}`);
    }
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId.trim()) {
      setSaveMaterialError('ID Pertemuan wajib diisi.');
      return;
    }

    setIsSavingMaterial(true);
    setSaveMaterialError(null);
    setSaveMaterialSuccess(false);

    try {
      const res = await fetch(`${API_BASE}/ecolab.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: formId,
          number: formNumber,
          title: formTitle,
          description: formDescription,
          icon: formIcon,
          status: 'ongoing', // default status
          embed_url: formEmbedUrl,
          download_url: formDownloadUrl
        }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setSaveMaterialSuccess(true);
        fetchMeetings();
        setTimeout(() => {
          setIsMaterialModalOpen(false);
        }, 1200);
      } else {
        setSaveMaterialError(data.message || 'Gagal menyimpan materi LKM.');
      }
    } catch (err) {
      setSaveMaterialError('Terjadi kesalahan koneksi.');
    } finally {
      setIsSavingMaterial(false);
    }
  };

  const handleDeleteMeeting = async () => {
    if (!meetingToDelete) return;
    setIsDeletingMeeting(true);
    try {
      const res = await fetch(`${API_BASE}/ecolab.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          id: meetingToDelete.id
        }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        fetchMeetings();
        setMeetingToDelete(null);
      } else {
        alert(data.message || 'Gagal menghapus materi.');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setIsDeletingMeeting(false);
    }
  };

  return (
    <div className="space-y-10 text-left">
      {/* Page Header */}
      <header className="flex justify-between items-center flex-wrap gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="font-display font-black text-2xl text-slate-800 flex items-center gap-2">
            <FlaskConical className="w-7 h-7 text-cyan-600" />
            Kelola Laboratorium EcoLab
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Atur dan publikasikan materi lembar kerja mahasiswa (LKM) untuk siswa.
          </p>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-150 rounded-2xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* SECTION 1: KELOLA MATERI LKM */}
      <section className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h3 className="font-display font-bold text-slate-800 text-base">
              Kelola Materi Lembar Kerja Mahasiswa (LKM)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Daftar modul pertemuan LKM untuk diunduh dan dibaca siswa.
            </p>
          </div>
          <button
            onClick={handleOpenAddMaterial}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tambah LKM Baru</span>
          </button>
        </div>

        {isLoadingMeetings ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase font-bold tracking-wider">
                  <th className="py-3 px-4 w-16">No</th>
                  <th className="py-3 px-4 w-20">ID</th>
                  <th className="py-3 px-4">Judul LKM & Deskripsi</th>
                  <th className="py-3 px-4 w-28">Ikon</th>
                  <th className="py-3 px-4 text-right w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {meetings.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-500">Pertemuan {m.number}</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono">{m.id}</span></td>
                    <td className="py-3 px-4 space-y-1">
                      <p className="font-bold text-slate-800">{m.title}</p>
                      <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-1">{m.description}</p>
                      <div className="flex gap-3 text-[10px] text-cyan-600 font-medium pt-1">
                        <a href={(m as any).embed_url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-0.5">
                          <Eye className="w-3 h-3" /> Embed Link
                        </a>
                        <a href={(m as any).download_url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-0.5">
                          <Download className="w-3 h-3" /> Download Link
                        </a>
                      </div>
                    </td>
                    <td className="py-3 px-4 capitalize font-mono text-slate-500">{m.icon}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditMaterial(m)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="Sunting LKM"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setMeetingToDelete(m)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Hapus LKM"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {meetings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                      Belum ada materi LKM yang terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* MODAL 1: ADD / EDIT MATERIAL LKM */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="bg-slate-900 px-6 py-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-cyan-400" />
                <h4 className="font-display font-bold text-sm">
                  {selectedMeeting ? 'Edit Modul Pertemuan LKM' : 'Tambah Modul Pertemuan LKM Baru'}
                </h4>
              </div>
              <button 
                onClick={() => setIsMaterialModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="p-6 space-y-4 text-left">
              {saveMaterialSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Modul LKM berhasil disimpan!</span>
                </div>
              )}
              {saveMaterialError && (
                <div className="p-4 bg-rose-50 border border-rose-250 text-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{saveMaterialError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ID Pertemuan (Unique)</label>
                    <input 
                      type="text" 
                      required
                      disabled={!!selectedMeeting}
                      value={formId}
                      onChange={(e) => setFormId(e.target.value)}
                      placeholder="Contoh: m1, m2, m3, dsb."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:bg-slate-50 disabled:text-slate-450 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nomor Pertemuan (Order)</label>
                    <input 
                      type="number" 
                      required
                      min={1}
                      value={formNumber}
                      onChange={(e) => handleNumberChange(parseInt(e.target.value) || 1)}
                      placeholder="Contoh: 1"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Judul Modul LKM</label>
                    <input 
                      type="text" 
                      required
                      value={formTitle}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Masukkan judul LKM..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ikon Tampilan</label>
                    <select
                      value={formIcon}
                      onChange={(e) => setFormIcon(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    >
                      <option value="science">Flask / Science (Kimia)</option>
                      <option value="groups">Groups / Users (Sosial)</option>
                      <option value="biotech">Microscope / Biotech (Laborat)</option>
                      <option value="inventory">Package / Inventory (Aset)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Embed Link Google Drive (Preview)</label>
                    <input 
                      type="text" 
                      value={formEmbedUrl}
                      onChange={(e) => setFormEmbedUrl(e.target.value)}
                      placeholder="https://drive.google.com/.../preview"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Download Link Google Drive / PDF</label>
                    <input 
                      type="text" 
                      value={formDownloadUrl}
                      onChange={(e) => setFormDownloadUrl(e.target.value)}
                      placeholder="https://drive.google.com/.../view?usp=sharing"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deskripsi Modul LKM</label>
                <textarea 
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ringkasan tugas / eksperimen LKM ini..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMaterialModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingMaterial}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSavingMaterial && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{selectedMeeting ? 'Simpan Suntingan' : 'Tambah Modul'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DELETE CONFIRMATION MATERI LKM */}
      {meetingToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[95] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-bold text-sm text-slate-800">Hapus Modul LKM ini?</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Apakah Anda yakin ingin menghapus modul LKM Pertemuan {meetingToDelete.number} <strong>"{meetingToDelete.title}"</strong>? Aksi ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMeetingToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteMeeting}
                disabled={isDeletingMeeting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeletingMeeting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Hapus Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
