import React, { useState, useEffect } from 'react';
import { PhoneCall, Plus, Edit, Trash2, Check, AlertCircle, Loader2, Upload } from 'lucide-react';

interface ContactMember {
  id: number;
  name: string;
  role: string;
  program: string;
  instansi: string;
  email: string;
  phone: string;
  office_hours: string;
  avatar: string;
  sort_order: number;
}

export default function AdminEcocontactView() {
  const [members, setMembers] = useState<ContactMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ContactMember | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formProgram, setFormProgram] = useState('');
  const [formInstansi, setFormInstansi] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formOfficeHours, setFormOfficeHours] = useState('');
  const [formAvatar, setFormAvatar] = useState('');
  const [formSortOrder, setFormSortOrder] = useState(0);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Image Upload State
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    moduleType: string,
    callback: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', moduleType);

    try {
      const res = await fetch(`${API_BASE}/upload-image.php`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.url) {
        callback(data.url);
      } else {
        alert(data.message || 'Gagal mengunggah gambar.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi saat mengunggah.');
    } finally {
      setIsUploading(false);
    }
  };

  // Delete States
  const [memberToDelete, setMemberToDelete] = useState<ContactMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMembers = () => {
    setIsLoading(true);
    setError(null);
    fetch(`${API_BASE}/ecocontact.php`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.members) {
          setMembers(data.members);
        } else {
          setError(data.message || 'Gagal memuat kontak.');
        }
      })
      .catch(err => {
        console.error(err);
        setError('Koneksi internet bermasalah.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleOpenAdd = () => {
    setSelectedMember(null);
    setFormName('');
    setFormRole('');
    setFormProgram('');
    setFormInstansi('');
    setFormEmail('');
    setFormPhone('');
    setFormOfficeHours('');
    setFormAvatar('');
    setFormSortOrder(members.length > 0 ? Math.max(...members.map(m => m.sort_order)) + 1 : 0);
    setSaveSuccess(false);
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: ContactMember) => {
    setSelectedMember(member);
    setFormName(member.name);
    setFormRole(member.role);
    setFormProgram(member.program);
    setFormInstansi(member.instansi);
    setFormEmail(member.email);
    setFormPhone(member.phone);
    setFormOfficeHours(member.office_hours);
    setFormAvatar(member.avatar);
    setFormSortOrder(member.sort_order);
    setSaveSuccess(false);
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const payload = {
        id: selectedMember ? selectedMember.id : undefined,
        name: formName,
        role: formRole,
        program: formProgram,
        instansi: formInstansi,
        email: formEmail,
        phone: formPhone,
        office_hours: formOfficeHours,
        avatar: formAvatar,
        sort_order: formSortOrder
      };

      const res = await fetch(`${API_BASE}/ecocontact.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        fetchMembers();
        setTimeout(() => {
          setIsModalOpen(false);
        }, 1200);
      } else {
        setSaveError(data.message || 'Gagal menyimpan kontak.');
      }
    } catch (err) {
      setSaveError('Terjadi kesalahan jaringan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!memberToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/ecocontact.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          id: memberToDelete.id
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchMembers();
        setMemberToDelete(null);
      } else {
        alert(data.message || 'Gagal menghapus kontak.');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <header className="flex justify-between items-center flex-wrap gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="font-display font-black text-2xl text-slate-800 flex items-center gap-2">
            <PhoneCall className="w-7 h-7 text-cyan-600" />
            Kelola Personel EcoContact
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Tambah, ubah, dan hapus kontak guru, peneliti, promotor, atau tim pengembang aplikasi.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kontak Baru</span>
        </button>
      </header>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-150 rounded-2xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
        </div>
      ) : (
        <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Foto</th>
                  <th className="py-4 px-6">Nama Personel</th>
                  <th className="py-4 px-6">Jabatan / Peran</th>
                  <th className="py-4 px-6">Instansi</th>
                  <th className="py-4 px-6">No HP & Email</th>
                  <th className="py-4 px-6">Urutan</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-50">
                        <img 
                          src={member.avatar} 
                          alt="" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80';
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {member.name}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-md font-bold text-[9px] uppercase">
                        {member.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {member.instansi}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      <div>WA: {member.phone || '-'}</div>
                      <div className="text-[10px] text-slate-400">{member.email || '-'}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-bold">
                      {member.sort_order}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(member)}
                          className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all cursor-pointer"
                          title="Sunting Kontak"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setMemberToDelete(member)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                          title="Hapus Kontak"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {members.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                      Belum ada kontak personel yang tersedia. Klik tombol di kanan atas untuk membuat baru.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="bg-slate-900 px-6 py-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-cyan-400" />
                <h4 className="font-display font-bold text-sm">
                  {selectedMember ? 'Edit Data Personel' : 'Tambah Personel EcoContact Baru'}
                </h4>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-left max-h-[75vh] overflow-y-auto">
              {saveSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Personel berhasil disimpan!</span>
                </div>
              )}
              {saveError && (
                <div className="p-4 bg-rose-50 border border-rose-250 text-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{saveError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Lengkap & Gelar</label>
                  <input 
                    type="text" 
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Azza Nuriah Widowati, M.Pd."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Peran / Jabatan</label>
                  <input 
                    type="text" 
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="Contoh: Guru & Peneliti / Promotor"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Program Studi (Opsional)</label>
                  <input 
                    type="text" 
                    value={formProgram}
                    onChange={(e) => setFormProgram(e.target.value)}
                    placeholder="Contoh: S3 Pendidikan Sains"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Instansi</label>
                  <input 
                    type="text" 
                    required
                    value={formInstansi}
                    onChange={(e) => setFormInstansi(e.target.value)}
                    placeholder="Contoh: Universitas Negeri Surabaya"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                  <input 
                    type="email" 
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="Contoh: azzanuriahw@gmail.com"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">No WhatsApp / HP</label>
                  <input 
                    type="text" 
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="Contoh: 081554319722"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jam Konsultasi (Opsional)</label>
                  <input 
                    type="text" 
                    value={formOfficeHours}
                    onChange={(e) => setFormOfficeHours(e.target.value)}
                    placeholder="Contoh: 08.00 - 15.00 WIB"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Urutan Tampilan (Sort Order)</label>
                  <input 
                    type="number" 
                    required
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(parseInt(e.target.value) || 0)}
                    placeholder="0 untuk guru utama, 1, 2, dst."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Foto / Avatar Personel</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="text" 
                    value={formAvatar}
                    onChange={(e) => setFormAvatar(e.target.value)}
                    placeholder="Contoh: ./azza.jpg atau unggah..."
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  <label className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                    {isUploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-slate-600" />
                    )}
                    <span>Unggah</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      disabled={isUploading}
                      onChange={(e) => handleUploadImage(e, 'ecocontact', setFormAvatar)} 
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{selectedMember ? 'Simpan Suntingan' : 'Tambah Personel'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[95] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-bold text-sm text-slate-800">Hapus Personel Kontak?</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Apakah Anda yakin ingin menghapus personel <strong>"{memberToDelete.name}"</strong>? Aksi ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Hapus Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
