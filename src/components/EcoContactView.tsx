import React from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  GraduationCap,
  MessageCircle,
} from 'lucide-react';

interface EcoContactViewProps {}

export default function EcoContactView({}: EcoContactViewProps) {
  const guruInfo = {
    name: 'Azza Nuriah Widowati, M.Pd.',
    role: 'Guru & Peneliti',
    program: 'S3 Pendidikan Sains',
    instansi: 'Universitas Negeri Surabaya',
    email: 'azzanuriahw@gmail.com',
    phone: '081554319722',
    officeHours: '08.00 - 15.00 WIB',
    avatar: '/azza.jpg'
  };

  const promotorInfo = {
    name: 'Prof. Dr. Endang Susantini, M.Pd.',
    role: 'Promotor',
    instansi: 'Universitas Negeri Surabaya',
    avatar: '/prof endang.jpg'
  };

  const coPromotorInfo = {
    name: 'Prof. Dr. Utiya Azizah, M.Pd.',
    role: 'Co-Promotor',
    instansi: 'Universitas Negeri Surabaya',
    avatar: '/prof utiya.jpg'
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <header className="text-left">
        <h2 className="font-display font-black text-2xl text-[#154212] mb-2">
          EcoContact — Informasi Kontak & Tim Pengembang
        </h2>
        <p className="font-sans text-sm text-[#42493e] max-w-2xl leading-relaxed">
          Hubungi tim peneliti jika ada yang ditanyakan tentang green chemistry, eco enzyme, aksi nyata, dan kegiatan berkelanjutan lainnya untuk lingkungan.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        {/* Left: Guru (Main Contact) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white/95 rounded-3xl p-6 border border-gray-150 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-8 -mt-8 -z-10 opacity-50 blur-lg"></div>
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6 pb-6 border-b border-gray-100">
              <img
                src={guruInfo.avatar}
                alt={guruInfo.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80';
                }}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shrink-0"
              />
              <div className="text-center sm:text-left space-y-2">
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-950 text-[10px] font-bold uppercase tracking-wider rounded-full">
                  {guruInfo.role}
                </span>
                <h3 className="font-display font-black text-lg sm:text-xl text-[#154212] leading-tight">
                  {guruInfo.name}
                </h3>
                <p className="text-xs text-gray-500 font-medium flex items-center justify-center sm:justify-start gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0" />
                  {guruInfo.program}
                </p>
                <p className="text-xs text-gray-500 font-medium flex items-center justify-center sm:justify-start gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                  {guruInfo.instansi}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-display font-bold text-xs text-gray-400 uppercase tracking-widest mb-3">Detail Kontak & Konsultasi</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Email</span>
                  <a href={`mailto:${guruInfo.email}`} className="text-xs text-[#154212] font-semibold hover:underline block break-all">
                    {guruInfo.email}
                  </a>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Jam Konsultasi</span>
                  <p className="text-xs text-[#154212] font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-700" />
                    {guruInfo.officeHours}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <a 
                  href={`https://wa.me/62${guruInfo.phone.substring(1)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#006e1c] hover:bg-[#005215] text-white text-xs font-bold rounded-2xl shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-4.5 h-4.5 fill-current" />
                  <span>Hubungi via WhatsApp ({guruInfo.phone})</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Promotor & Co-Promotor */}
        <aside className="lg:col-span-5 space-y-6">
          {/* Promotor Card */}
          <div className="bg-white/95 rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
            <img
              src={promotorInfo.avatar}
              alt={promotorInfo.name}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80';
              }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-amber-400 shadow-sm shrink-0"
            />
            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 bg-amber-50 text-amber-800 text-[9px] font-bold uppercase tracking-wider rounded-full">
                {promotorInfo.role}
              </span>
              <h4 className="font-display font-bold text-xs sm:text-sm text-[#154212] leading-tight">
                {promotorInfo.name}
              </h4>
              <p className="text-[10px] text-gray-500 font-medium">{promotorInfo.instansi}</p>
            </div>
          </div>

          {/* Co-Promotor Card */}
          <div className="bg-white/95 rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
            <img
              src={coPromotorInfo.avatar}
              alt={coPromotorInfo.name}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1580894732444-8fecef2271ff?auto=format&fit=crop&w=400&q=80';
              }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-emerald-400 shadow-sm shrink-0"
            />
            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[9px] font-bold uppercase tracking-wider rounded-full">
                {coPromotorInfo.role}
              </span>
              <h4 className="font-display font-bold text-xs sm:text-sm text-[#154212] leading-tight">
                {coPromotorInfo.name}
              </h4>
              <p className="text-[10px] text-gray-500 font-medium">{coPromotorInfo.instansi}</p>
            </div>
          </div>
          
          {/* Note/Guidance */}
          <div className="bg-[#F5F5DC] border border-[#c2c9bb]/50 rounded-2xl p-4 text-left">
            <p className="text-[11px] text-[#42493e] leading-relaxed font-medium">
              💡 <strong>Informasi Penelitian:</strong> GAS website ini dikembangkan sebagai bagian pendukung dari penelitian disertasi doktor tentang pengembangan model CASUAL (Case-based Active study for Sustainable Understanding and Action in Learning) yang diimplementasikan di sekolah dalam meningkatkan ecoliteracy dan keterampilan pemecahan masalah.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
