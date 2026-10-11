import React, { useState } from 'react';
import { Tab, Room } from '../types';
import { 
  Sparkles,
  HelpCircle,
  LogOut,
  User as UserIcon,
  Shield,
  X,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const getImageUrl = (path: string | null) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) return path;
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
  const BACKEND_URL = API_BASE.replace(/\/api$/, '') || '';
  return `${BACKEND_URL}${path}`;
};



interface HeaderProps {
  activeTab: Tab;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isTeacher?: boolean;
  currentRoom?: Room | null;
  onBackToRooms?: () => void;
}

export default function Header({ 
  activeTab, 
  searchQuery, 
  setSearchQuery, 
  isTeacher = false,
  currentRoom,
  onBackToRooms
}: HeaderProps) {
  const { user, logout, updateUserProfile } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Edit Profile States
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editFullName, setEditFullName] = useState(user ? user.full_name : '');
  const [editEmail, setEditEmail] = useState(user ? user.email : '');
  const [editOldPassword, setEditOldPassword] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user && user.avatar_url ? getImageUrl(user.avatar_url) : '');
  const [deleteAvatar, setDeleteAvatar] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension !== 'jpg' && extension !== 'jpeg') {
        setUpdateError('Hanya file foto profil dengan format JPG atau JPEG yang diizinkan.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setUpdateError('Ukuran file foto profil maksimal adalah 2MB.');
        return;
      }

      setUpdateError('');
      setAvatarFile(file);
      setDeleteAvatar(false);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleOpenEditProfile = () => {
    if (user) {
      setEditFullName(user.full_name);
      setEditEmail(user.email);
      setEditOldPassword('');
      setEditNewPassword('');
      setEditConfirmPassword('');
      setAvatarFile(null);
      setAvatarPreview(user.avatar_url ? getImageUrl(user.avatar_url) : '');
      setDeleteAvatar(false);
    }
    setUpdateError('');
    setUpdateSuccess(false);
    setShowProfileMenu(false);
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError('');
    setUpdateSuccess(false);

    if (editNewPassword || editConfirmPassword || editOldPassword) {
      if (!editOldPassword) {
        setUpdateError('Password lama harus diisi untuk mengubah password.');
        return;
      }
      if (editNewPassword !== editConfirmPassword) {
        setUpdateError('Password baru dan konfirmasi password tidak cocok.');
        return;
      }
      if (editNewPassword.length < 6) {
        setUpdateError('Password baru minimal terdiri dari 6 karakter.');
        return;
      }
    }

    const formData = new FormData();
    formData.append('full_name', editFullName);
    formData.append('email', editEmail);
    if (editOldPassword) {
      formData.append('old_password', editOldPassword);
    }
    if (editNewPassword) {
      formData.append('new_password', editNewPassword);
    }
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }
    if (deleteAvatar) {
      formData.append('delete_avatar', '1');
    }

    try {
      await updateUserProfile(formData);
      setUpdateSuccess(true);
      setTimeout(() => {
        setShowEditProfileModal(false);
      }, 1500);
    } catch (err: any) {
      setUpdateError(err.message || 'Gagal memperbarui profil.');
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard GAS';
      case 'ecolab': return 'Proyek Aksi EcoLab';
      case 'ecopedia': return 'Ruang Belajar EcoPedia';
      case 'ecocreation': return 'Galeri Video EcoCreation';
      case 'ecochallenge': return 'Evaluasi EcoChallenge';
      case 'absensi': return 'Presensi Kehadiran Kelas';
      case 'ecocontact': return 'EcoContact Kelas';
      // Admin Panel tabs
      case 'admin-dashboard' as any: return 'Pusat Kontrol Administrator';
      case 'admin-rooms' as any: return 'Kelola Kelas';
      case 'admin-users' as any: return 'Manajemen Pengguna';
      default: return 'Green Action for Sustainability';
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-[#ffffff] border-b border-[#c2c9bb] flex justify-between items-center pl-16 pr-4 lg:px-6 z-40 shadow-sm">
      {/* Page Title Label & Room Breadcrumb */}
      <div className="flex items-center gap-3">
        {onBackToRooms && (
          <button
            onClick={onBackToRooms}
            title="Kembali ke Daftar Kelas"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer border border-stone-200"
          >
            <span>← Kelas</span>
          </button>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-sm md:text-base lg:text-lg text-[#154212] tracking-tight line-clamp-1">
              {getPageTitle()}
            </h2>
            {currentRoom && (
              <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 truncate max-w-[200px]">
                {currentRoom.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Center Title — hidden on small screens */}
      <div className="flex-grow justify-center items-center mx-4 hidden md:flex">
        <span className="font-display font-bold text-xs lg:text-base text-[#154212] tracking-wide text-center">
          Green Action for Sustainability
        </span>
      </div>

      {/* Right Tools Area */}
      <div className="flex items-center gap-4">






        {/* Student Profile Widget dengan Dropdown Keluar (Logout) */}
        <div className="relative flex items-center pl-4 border-l border-[#c2c9bb]">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 focus:outline-none cursor-pointer group"
          >
            <div className="text-right hidden md:block">
              <p className="font-sans text-xs font-bold text-[#154212] group-hover:text-[#276e23] transition-colors">
                {user ? user.full_name : 'Guest'}
              </p>
              <p className="text-[10px] text-[#72796e] font-sans tracking-wide capitalize">
                {user ? user.role : 'Eco-Explorer'}
              </p>
            </div>
            
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#91f78e] shadow-sm relative group-hover:scale-105 transition-transform">
              {user && user.avatar_url ? (
                <img 
                  alt="Profil Murid" 
                  src={getImageUrl(user.avatar_url)}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#154212] flex items-center justify-center text-white font-bold text-sm uppercase">
                  {user ? user.full_name.substring(0, 2) : 'GS'}
                </div>
              )}
              <div className="absolute inset-0 bg-[#154212]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </button>

          {/* Panel Dropdown Menu Profil */}
          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl shadow-xl border border-[#c2c9bb] py-2.5 z-50 text-left animate-in fade-in duration-200">
              <div className="px-4 py-2 border-b border-gray-100 mb-1.5">
                <p className="text-xs font-bold text-[#1a1c1c] truncate">{user ? user.full_name : 'Guest User'}</p>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">{user ? user.email : ''}</p>
              </div>

              <div className="px-1.5 space-y-0.5">
                <button 
                  onClick={handleOpenEditProfile}
                  className="w-full px-3 py-2 flex items-center gap-2.5 text-xs text-gray-700 rounded-xl hover:bg-gray-50 font-semibold cursor-pointer transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-emerald-600" />
                  <span>Edit Profil</span>
                </button>

                <div className="w-full px-3 py-2 flex items-center gap-2.5 text-xs text-gray-600 rounded-xl hover:bg-gray-50">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span className="capitalize">Role: {user ? user.role : 'Guest'}</span>
                </div>
                
                <button 
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2.5 text-xs text-red-600 rounded-xl hover:bg-red-50 font-bold cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Edit Profil */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="bg-[#154212] p-5 text-white flex justify-between items-center text-left">
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-[#91f78e]" />
                <h4 className="font-display font-bold text-sm">Edit Profil Pengguna</h4>
              </div>
              <button 
                type="button"
                onClick={() => setShowEditProfileModal(false)} 
                className="text-white hover:text-red-350 p-1.5 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 text-left max-h-[80vh] overflow-y-auto">
              {updateError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-semibold leading-relaxed">
                  {updateError}
                </div>
              )}
              {updateSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold leading-relaxed">
                  Profil Anda berhasil diperbarui!
                </div>
              )}

              {/* Upload Foto Profil */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-150">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#91f78e] shadow-sm flex-shrink-0 relative">
                  {avatarPreview ? (
                    <img 
                      alt="Avatar Preview" 
                      src={avatarPreview}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#154212] flex items-center justify-center text-white font-bold text-lg">
                      {editFullName ? editFullName.substring(0, 2).toUpperCase() : 'US'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-[#42493e] mb-1.5">Foto Profil (JPG/JPEG, Maks 2MB)</label>
                  <input 
                    type="file"
                    accept=".jpg,.jpeg"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#bcf0ae]/30 file:text-[#006e1c] hover:file:bg-[#bcf0ae]/50 cursor-pointer"
                  />
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview('');
                        setDeleteAvatar(true);
                      }}
                      className="mt-1.5 text-[10px] font-bold text-red-650 hover:text-red-800 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus Foto Profil</span>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#42493e] uppercase mb-1">Nama Lengkap</label>
                <input 
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full bg-[#f3f3f4] border border-[#c2c9bb] rounded-xl px-3.5 py-2.5 text-xs text-[#1a1c1c] focus:outline-none focus:ring-1 focus:ring-[#154212]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#42493e] uppercase mb-1">Email</label>
                <input 
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-[#f3f3f4] border border-[#c2c9bb] rounded-xl px-3.5 py-2.5 text-xs text-[#1a1c1c] focus:outline-none focus:ring-1 focus:ring-[#154212]"
                />
              </div>

              {/* Ubah Password (Opsional) */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150 space-y-3">
                <span className="text-[10px] font-black tracking-widest text-[#154212] uppercase block">Ubah Password (Opsional)</span>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Password Lama</label>
                  <input 
                    type="password"
                    value={editOldPassword}
                    onChange={(e) => setEditOldPassword(e.target.value)}
                    placeholder="Masukkan password saat ini"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#1a1c1c] focus:outline-none focus:ring-1 focus:ring-[#154212]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Password Baru</label>
                    <input 
                      type="password"
                      value={editNewPassword}
                      onChange={(e) => setEditNewPassword(e.target.value)}
                      placeholder="Min 6 karakter"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#1a1c1c] focus:outline-none focus:ring-1 focus:ring-[#154212]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Konfirmasi Password Baru</label>
                    <input 
                      type="password"
                      value={editConfirmPassword}
                      onChange={(e) => setEditConfirmPassword(e.target.value)}
                      placeholder="Ulangi password baru"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#1a1c1c] focus:outline-none focus:ring-1 focus:ring-[#154212]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-400 hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex items-center gap-1 px-5 py-2.5 bg-[#154212] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow border border-[#91f78e]/10"
                >
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
              <LogOut className="w-5 h-5 animate-pulse" />
            </div>
            
            <h3 className="font-display font-bold text-base text-gray-900 mb-2">
              Konfirmasi Logout
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              Apakah Anda yakin ingin keluar dari akun Anda? Sesi Anda saat ini akan diakhiri.
            </p>

            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
              >
                Kembali
              </button>
              <button 
                type="button" 
                onClick={async () => {
                  setShowLogoutConfirm(false);
                  await logout();
                }}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm hover:shadow-md transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
