import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Shield, 
  UserMinus, 
  AlertTriangle, 
  User, 
  Check, 
  X,
  UserCog
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface UserData {
  id: number;
  full_name: string;
  email: string;
  role: 'student' | 'admin';
  avatar_url: string | null;
  eco_points: number;
  streak: number;
  auth_provider: 'local' | 'google';
  last_login: string | null;
  created_at: string;
}

const getImageUrl = (path: string | null) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
  const BACKEND_URL = API_BASE.replace(/\/api$/, '') || '';
  return `${BACKEND_URL}${path}`;
};

export default function AdminUsersView() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal / Confirm States
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<'student' | 'admin' | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
      const url = `${API_BASE}/admin/users.php?search=${encodeURIComponent(search)}&role=${encodeURIComponent(roleFilter)}`;
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        showNotification(data.message || 'Gagal mengambil data pengguna.', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Koneksi gagal. Silakan coba beberapa saat lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, roleFilter]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleRoleChange = async (userId: number, role: 'student' | 'admin') => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${API_BASE}/admin/update-role.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message || 'Role berhasil diperbarui.', 'success');
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      } else {
        showNotification(data.message || 'Gagal memperbarui role.', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Terjadi kesalahan koneksi.', 'error');
    } finally {
      setUpdatingRoleId(null);
      setSelectedRole(null);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${API_BASE}/admin/delete-user.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message || 'Pengguna berhasil dihapus.', 'success');
        setUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        showNotification(data.message || 'Gagal menghapus pengguna.', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Terjadi kesalahan koneksi.', 'error');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const adminUsers = users.filter(u => u.role === 'admin');
  const studentUsers = users.filter(u => u.role === 'student');

  const renderUserRow = (item: UserData, showAttendance: boolean) => {
    const isSelf = currentUser?.id === item.id;
    return (
      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
        {/* Name / Email / Avatar */}
        <td className="py-4 px-6 flex items-center gap-3">
          {item.avatar_url ? (
            <img 
              src={getImageUrl(item.avatar_url)} 
              alt={item.full_name} 
              className="w-9 h-9 rounded-full object-cover border border-gray-150"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-gray-400 border border-gray-150">
              <User className="w-4 h-4" />
            </div>
          )}
          <div>
            <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
              {item.full_name}
              {isSelf && (
                <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded-full">
                  Anda
                </span>
              )}
            </h5>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">{item.email}</p>
          </div>
        </td>

        {/* Role selector / label */}
        <td className="py-4 px-6">
          {updatingRoleId === item.id ? (
            <div className="flex items-center gap-1.5">
              <select 
                defaultValue={item.role}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                className="border border-gray-200 rounded-lg p-1 text-xs focus:ring-1 focus:ring-cyan-500 outline-none bg-white"
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
              <button 
                onClick={() => handleRoleChange(item.id, selectedRole || item.role)}
                className="p-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg cursor-pointer"
                title="Simpan"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => { setUpdatingRoleId(null); setSelectedRole(null); }}
                className="p-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg cursor-pointer"
                title="Batal"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                item.role === 'admin' 
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                  : 'bg-blue-50 text-blue-700 border border-blue-100'
              }`}>
                {item.role === 'admin' ? 'Admin' : 'Siswa'}
              </span>
              {!isSelf && (
                <button 
                  onClick={() => { setUpdatingRoleId(item.id); setSelectedRole(item.role); }}
                  className="text-gray-400 hover:text-cyan-600 transition-colors p-1"
                  title="Ubah Peran"
                >
                  <UserCog className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </td>

        {/* Attendance (Only for Students, completely omitted for Admins) */}
        {showAttendance && (
          <td className="py-4 px-6 text-center">
            <span className="font-extrabold text-slate-800">
              🔥 {item.streak} Hari
            </span>
          </td>
        )}


        {/* Action buttons */}
        <td className="py-4 px-6 text-center">
          {!isSelf ? (
            <button
              onClick={() => setConfirmDeleteId(item.id)}
              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all hover:scale-105 cursor-pointer"
              title="Hapus Akun Pengguna"
            >
              <UserMinus className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-[10px] text-gray-400 font-medium italic">Tidak ada aksi</span>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Header */}
      <div>
        <h2 className="font-display font-black text-2xl text-slate-800">Manajemen Pengguna</h2>
        <p className="text-xs text-gray-500">Lihat, cari, ganti role (siswa/admin), atau hapus akun pengguna terdaftar.</p>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-5 right-5 p-4 rounded-2xl shadow-lg border text-xs font-semibold z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 ${
          notification.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-150 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari nama atau email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
          />
        </div>
        
        {/* Role Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
          >
            <option value="">Semua Peran</option>
            <option value="student">Siswa (Student)</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
      </div>

      {/* Users Containers */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-150 p-20 flex flex-col justify-center items-center gap-3">
          <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-gray-400 font-semibold">Memuat daftar pengguna...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Box 1: Administrator */}
          {(roleFilter === '' || roleFilter === 'admin') && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-display font-bold text-slate-800 text-sm">Daftar Administrator</h3>
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {adminUsers.length}
                  </span>
                </div>
              </div>
              
              {adminUsers.length === 0 ? (
                <div className="py-10 text-center text-xs text-gray-400 italic">
                  Tidak ada administrator ditemukan.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/20 border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        <th className="py-4 px-6">Pengguna</th>
                        <th className="py-4 px-6">Peran (Role)</th>
                        <th className="py-4 px-6 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
                      {adminUsers.map((item) => renderUserRow(item, false))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Box 2: Siswa */}
          {(roleFilter === '' || roleFilter === 'student') && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="font-display font-bold text-slate-800 text-sm">Daftar Siswa (Student)</h3>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {studentUsers.length}
                  </span>
                </div>
              </div>
              
              {studentUsers.length === 0 ? (
                <div className="py-10 text-center text-xs text-gray-400 italic">
                  Tidak ada siswa ditemukan.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/20 border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        <th className="py-4 px-6">Pengguna</th>
                        <th className="py-4 px-6">Peran (Role)</th>
                        <th className="py-4 px-6 text-center">Total Kehadiran</th>
                        <th className="py-4 px-6 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
                      {studentUsers.map((item) => renderUserRow(item, true))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modals */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full border border-gray-100 shadow-2xl text-center">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-bounce" />
            <h4 className="font-display font-black text-lg text-slate-800">Hapus Pengguna?</h4>
            <p className="text-xs text-gray-500 mt-2">
              Aksi ini bersifat permanen. Seluruh data progres kuis, koin, riwayat, dan unggahan video pengguna ini akan terhapus sepenuhnya.
            </p>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={() => handleDeleteUser(confirmDeleteId)}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
