import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { AuthPage } from '../../types';

interface RegisterPageProps {
  onNavigate: (page: AuthPage) => void;
  onRegister: (fullName: string, email: string, password: string, role: 'student' | 'teacher') => Promise<void>;
}

export default function RegisterPage({ onNavigate, onRegister }: RegisterPageProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validasi
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Seluruh field wajib diisi.');
      return;
    }

    if (password.length < 8) {
      setError('Password harus minimal 8 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      await onRegister(fullName, email, password, 'student');
      setSuccess('Pendaftaran berhasil! Silakan masuk menggunakan akun baru Anda.');
      
      // Bersihkan form
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      // Auto redirect ke login setelah 3 detik
      setTimeout(() => {
        onNavigate('login');
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Judul Halaman */}
      <div className="space-y-1 text-center md:text-left">
        <h3 className="text-2xl font-display font-extrabold text-[#1a1c1c]">Daftar Akun Baru</h3>
        <p className="text-xs text-[#42493e] font-medium leading-relaxed">
          Mulai kontribusi hijau Anda dengan membuat akun GAS hari ini.
        </p>
      </div>

      {/* Alert Error */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-red-700 text-xs font-semibold animate-in shake duration-300">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{error}</p>
        </div>
      )}

      {/* Alert Sukses */}
      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-250 rounded-2xl flex items-start gap-2.5 text-emerald-800 text-xs font-semibold animate-in fade-in duration-300">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{success}</p>
        </div>
      )}

      {/* Formulir Registrasi */}
      <form onSubmit={handleSubmit} className="space-y-3">
        
        {/* Input Nama Lengkap */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-[#42493e] uppercase tracking-wider">Nama Lengkap</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <User className="w-4 h-4" />
            </span>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#f3f3f4] border border-[#c2c9bb] focus:border-[#154212] focus:bg-white text-xs text-[#1a1c1c] rounded-xl pl-10 pr-4 py-2.5 focus:outline-none transition-all duration-200" 
              placeholder="Rizky Pratama"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Input Email */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-[#42493e] uppercase tracking-wider">Alamat Email</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <Mail className="w-4 h-4" />
            </span>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#f3f3f4] border border-[#c2c9bb] focus:border-[#154212] focus:bg-white text-xs text-[#1a1c1c] rounded-xl pl-10 pr-4 py-2.5 focus:outline-none transition-all duration-200" 
              placeholder="rizky@sekolah.sch.id"
              required
              disabled={loading}
            />
          </div>
        </div>


        {/* Input Password */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-[#42493e] uppercase tracking-wider">Kata Sandi (Min. 8 Karakter)</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" />
            </span>
            <input 
              type={showPassword ? 'text' : 'password'} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#f3f3f4] border border-[#c2c9bb] focus:border-[#154212] focus:bg-white text-xs text-[#1a1c1c] rounded-xl pl-10 pr-10 py-2.5 focus:outline-none transition-all duration-200" 
              placeholder="••••••••"
              required
              disabled={loading}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Input Konfirmasi Password */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-[#42493e] uppercase tracking-wider">Konfirmasi Kata Sandi</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" />
            </span>
            <input 
              type={showConfirmPassword ? 'text' : 'password'} 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#f3f3f4] border border-[#c2c9bb] focus:border-[#154212] focus:bg-white text-xs text-[#1a1c1c] rounded-xl pl-10 pr-10 py-2.5 focus:outline-none transition-all duration-200" 
              placeholder="••••••••"
              required
              disabled={loading}
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tombol Submit */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#154212] hover:bg-[#276e23] active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg shadow-[#154212]/10 transition-all duration-200 cursor-pointer"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Daftar Akun</span>
            </>
          )}
        </button>

      </form>



      {/* Navigasi Masuk */}
      <div className="text-center">
        <p className="text-xs text-[#42493e] font-semibold">
          Sudah memiliki akun?{' '}
          <button 
            type="button"
            onClick={() => onNavigate('login')}
            className="text-[#154212] hover:text-[#276e23] hover:underline font-bold transition-all ml-0.5 cursor-pointer"
          >
            Masuk Sekarang
          </button>
        </p>
      </div>

    </div>
  );
}
