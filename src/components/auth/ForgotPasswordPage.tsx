import React, { useState, useEffect } from 'react';
import { Mail, KeyRound, Lock, Eye, EyeOff, ArrowLeft, RefreshCw, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';
import { AuthPage } from '../../types';

interface ForgotPasswordPageProps {
  onNavigate: (page: AuthPage) => void;
  onForgotPassword: (email: string) => Promise<void>;
  onResetPassword: (email: string, otp: string, newPass: string) => Promise<void>;
}

type Step = 'email' | 'otp' | 'reset';

export default function ForgotPasswordPage({ onNavigate, onForgotPassword, onResetPassword }: ForgotPasswordPageProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  
  // OTP Step States
  const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(''));
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  // Reset Password Step States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Status States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Countdown timer untuk resend OTP
  useEffect(() => {
    if (step !== 'otp' || timer === 0) return;
    
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, timer]);

  // Step 1: Kirim OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email wajib diisi.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onForgotPassword(email);
      setSuccess('Kode OTP verifikasi telah dikirim ke email Anda.');
      setStep('otp');
      setTimer(60);
      setCanResend(false);
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim kode OTP. Silakan periksa kembali email Anda.');
    } finally {
      setLoading(false);
    }
  };

  // Kirim Ulang OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await onForgotPassword(email);
      setSuccess('Kode OTP baru berhasil dikirim ulang ke email Anda.');
      setTimer(60);
      setCanResend(false);
      setOtpCode(Array(6).fill(''));
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim ulang kode OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Menangani input OTP box per digit (Auto-focus next box)
  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const val = element.value;
    const newOtp = [...otpCode];
    newOtp[index] = val.substring(val.length - 1); // Hanya ambil digit terakhir
    setOtpCode(newOtp);

    // Auto focus box berikutnya
    if (val && element.nextSibling) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Pindah ke input sebelumnya saat backspace ditekan
    if (e.key === 'Backspace' && !otpCode[index] && e.currentTarget.previousSibling) {
      (e.currentTarget.previousSibling as HTMLInputElement).focus();
    }
  };

  // Step 2: Verifikasi OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const fullOtp = otpCode.join('');
    
    if (fullOtp.length < 6) {
      setError('Kode OTP harus berisi 6 digit lengkap.');
      return;
    }
    
    // Sukses melangkah ke form Reset Password
    setSuccess('Kode OTP terverifikasi secara lokal! Silakan masukkan sandi baru Anda.');
    setStep('reset');
  };

  // Step 3: Simpan Sandi Baru
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('Sandi baru harus minimal 8 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi sandi tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      const fullOtp = otpCode.join('');
      await onResetPassword(email, fullOtp, newPassword);
      setSuccess('Sandi berhasil diatur ulang! Mengalihkan Anda ke halaman masuk...');
      
      setTimeout(() => {
        onNavigate('login');
      }, 3500);
    } catch (err: any) {
      setError(err.message || 'Gagal mengatur ulang sandi. Silakan ulangi proses dari awal.');
      // Jika error, kembalikan ke step email
      setStep('email');
      setOtpCode(Array(6).fill(''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Tombol Kembali ke Halaman Login */}
      <button 
        onClick={() => onNavigate('login')}
        className="flex items-center gap-1.5 text-xs font-bold text-[#154212] hover:text-[#276e23] transition-all cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke halaman masuk</span>
      </button>

      {/* Judul & Detail Langkah */}
      <div className="space-y-1">
        <h3 className="text-2xl font-display font-extrabold text-[#1a1c1c]">Lupa Kata Sandi</h3>
        
        {step === 'email' && (
          <p className="text-xs text-[#42493e] font-medium leading-relaxed">
            Masukkan alamat email Anda untuk menerima kode verifikasi OTP 6 digit.
          </p>
        )}
        
        {step === 'otp' && (
          <p className="text-xs text-[#42493e] font-medium leading-relaxed">
            Kami telah mengirim kode verifikasi OTP ke <span className="font-bold text-[#1a1c1c]">{email}</span>. Silakan masukkan di bawah.
          </p>
        )}

        {step === 'reset' && (
          <p className="text-xs text-[#42493e] font-medium leading-relaxed">
            Kode terverifikasi! Masukkan kata sandi baru untuk mengamankan akun Anda kembali.
          </p>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-xs font-semibold animate-in shake duration-300">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="leading-relaxed">{error}</p>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-2xl flex items-start gap-3 text-emerald-800 text-xs font-semibold animate-in fade-in duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="leading-relaxed">{success}</p>
        </div>
      )}

      {/* STEP 1: Form Email */}
      {step === 'email' && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-[#42493e] uppercase tracking-wider">Alamat Email Terdaftar</label>
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
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#154212] hover:bg-[#276e23] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg transition-all duration-200 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Kirim Kode OTP Verifikasi</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* STEP 2: Form OTP Input */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="space-y-3">
            <label className="block text-center text-[10px] font-bold text-[#42493e] uppercase tracking-wider">Masukkan 6 Digit OTP</label>
            
            <div className="flex justify-center gap-2">
              {otpCode.map((digit, idx) => (
                <input 
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className="w-12 h-14 text-center bg-[#f3f3f4] border border-[#c2c9bb] focus:border-[#154212] focus:bg-white text-lg font-bold text-[#154212] rounded-xl focus:outline-none transition-all duration-200"
                  required
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <button 
              type="submit" 
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#154212] hover:bg-[#276e23] text-white text-xs font-bold rounded-xl shadow-lg transition-all duration-200 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Verifikasi OTP</span>
            </button>

            <div className="text-center pt-2">
              {canResend ? (
                <button 
                  type="button" 
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-xs font-bold text-[#154212] hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Kirim Ulang Kode OTP</span>
                </button>
              ) : (
                <span className="text-xs text-gray-400 font-medium">
                  Kirim ulang kode OTP dalam <strong className="text-emerald-700 font-bold">{timer}s</strong>
                </span>
              )}
            </div>
          </div>
        </form>
      )}

      {/* STEP 3: Form Set New Password */}
      {step === 'reset' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          
          {/* Input Password Baru */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-[#42493e] uppercase tracking-wider">Kata Sandi Baru</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#f3f3f4] border border-[#c2c9bb] focus:border-[#154212] focus:bg-white text-xs text-[#1a1c1c] rounded-xl pl-10 pr-10 py-3 focus:outline-none transition-all duration-200" 
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
            <label className="block text-[10px] font-bold text-[#42493e] uppercase tracking-wider">Konfirmasi Kata Sandi Baru</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#f3f3f4] border border-[#c2c9bb] focus:border-[#154212] focus:bg-white text-xs text-[#1a1c1c] rounded-xl pl-10 pr-10 py-3 focus:outline-none transition-all duration-200" 
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

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#154212] hover:bg-[#276e23] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg transition-all duration-200 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Simpan Sandi Baru</span>
              </>
            )}
          </button>

        </form>
      )}

      {/* Informasi Tambahan */}
      <div className="p-3 bg-gray-50 border border-gray-150 rounded-2xl flex items-start gap-2.5 text-gray-500 text-[10px] leading-relaxed">
        <ShieldAlert className="w-4 h-4 text-[#154212] shrink-0 mt-0.5" />
        <p>
          Demi menjaga keamanan akun Anda, pastikan sandi baru Anda unik, kuat (minimal 8 karakter kombinasi huruf dan angka), serta tidak mudah ditebak orang lain.
        </p>
      </div>

    </div>
  );
}
