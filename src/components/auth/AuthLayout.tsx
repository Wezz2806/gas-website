import React from 'react';
import { Leaf, Sprout, Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center p-4 md:p-6 font-sans">
      
      {/* Container Card dengan Glassmorphism Premium */}
      <div className="w-full max-w-5xl bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-[#154212]/15 flex flex-col md:flex-row min-h-[600px] animate-in fade-in zoom-in-95 duration-500">
        
        {/* Panel Kiri - Branding & Nilai Keberlanjutan (Eco-Branding) */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-[#154212] via-[#1b5318] to-[#0d2e0b] p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          
          {/* Efek Partikel Daun Melayang Latar Belakang */}
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="absolute top-10 left-10 w-8 h-8 border border-white rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-16 h-16 border-2 border-white/50 rounded-full animate-ping duration-1000"></div>
            <div className="absolute top-1/2 left-1/3 w-4 h-4 bg-white rounded-full"></div>
          </div>
          
          {/* Logo & Judul Platform */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="bg-[#91f78e]/20 p-2.5 rounded-2xl border border-[#91f78e]/35 backdrop-blur-md">
              <Sprout className="w-7 h-7 text-[#91f78e] fill-current animate-bounce" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl tracking-wide">GAS Website</h1>
              <p className="text-[10px] text-[#91f78e] font-semibold tracking-widest uppercase">Edukasi Keberlanjutan</p>
            </div>
          </div>
          
          {/* Quotes/Branding Banner dengan Aesthetics Premium */}
          <div className="relative z-10 my-10 md:my-0 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 text-xs font-semibold text-[#91f78e]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Satu Aksi, Sejuta Dampak</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-black leading-tight">
              Langkah Kecil untuk <span className="text-[#91f78e]">Bumi</span> yang Lebih <span className="text-[#91f78e]">Hijau</span>.
            </h2>
            <p className="text-xs text-gray-300 leading-relaxed max-w-sm">
              Bergabunglah untuk melihat berbagai kasus lingkungan di sekitar kita serta melakukan aksi nyata berkelanjutan bagi lingkungan
            </p>
          </div>
          
          {/* Footer Panel Kiri */}
          <div className="relative z-10 pt-6 border-t border-white/15 flex items-center justify-between text-xs text-gray-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-[#91f78e] fill-current" />
              <span>Green & Sustainable</span>
            </span>
            <span>v1.0.0</span>
          </div>
          
        </div>

        {/* Panel Kanan - Container Formulir Dinamis */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white relative">
          
          {/* Efek Daun Latar Belakang Halus */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#154212]/5 rounded-bl-full pointer-events-none"></div>
          
          <div className="w-full max-w-md mx-auto">
            {children}
          </div>
          
        </div>

      </div>
    </div>
  );
}
