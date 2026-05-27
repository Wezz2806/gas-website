import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { AuthPage } from '../../types';

interface LoginPageProps {
  onNavigate: (page: AuthPage) => void;
  onLogin: (email: string, password: string) => Promise<void>;
}

export default function LoginPage({ onNavigate, onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || 'Gagal masuk. Periksa kembali email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Judul Halaman */}
      <div className="space-y-1.5 text-center md:text-left">
        <h3 className="text-2xl font-display font-extrabold text-[#1a1c1c]">Selamat Datang Kembali!</h3>
        <p className="text-xs text-[#42493e] font-medium leading-relaxed">
          Silakan masuk menggunakan akun Anda untuk melanjutkan aktivitas keberlanjutan.
        </p>
      </div>

      {/* Tampilan Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-xs font-semibold animate-in shake duration-300">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="leading-relaxed">{error}</p>
        </div>
      )}

      {/* Formulir Login */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
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
              className="w-full bg-[#f3f3f4] border border-[#c2c9bb] focus:border-[#154212] focus:bg-white text-xs text-[#1a1c1c] rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-all duration-200" 
              placeholder="nama@sekolah.sch.id"
              required
            />
          </div>
        </div>

        {/* Input Password */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="block text-[10px] font-bold text-[#42493e] uppercase tracking-wider">Kata Sandi</label>
            <button 
              type="button"
              onClick={() => onNavigate('forgot-password')}
              className="text-[10px] font-bold text-[#154212] hover:text-[#276e23] hover:underline transition-all"
            >
              Lupa Sandi?
            </button>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" />
            </span>
            <input 
              type={showPassword ? 'text' : 'password'} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#f3f3f4] border border-[#c2c9bb] focus:border-[#154212] focus:bg-white text-xs text-[#1a1c1c] rounded-xl pl-10 pr-10 py-3 focus:outline-none transition-all duration-200" 
              placeholder="••••••••"
              required
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
              <LogIn className="w-4 h-4" />
              <span>Masuk Sekarang</span>
            </>
          )}
        </button>

      </form>



      {/* Navigasi Daftar */}
      <div className="text-center">
        <p className="text-xs text-[#42493e] font-semibold">
          Belum memiliki akun?{' '}
          <button 
            type="button"
            onClick={() => onNavigate('register')}
            className="text-[#154212] hover:text-[#276e23] hover:underline font-bold transition-all ml-0.5 cursor-pointer"
          >
            Daftar Sekarang
          </button>
        </p>
      </div>

    </div>
  );
}
