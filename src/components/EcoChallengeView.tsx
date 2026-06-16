import React, { useState } from 'react';
import { 
  ExternalLink, 
  Award, 
  ClipboardCheck,
  FileText,
  CheckCircle
} from 'lucide-react';

const POSTTEST_LINK: string = 'https://docs.google.com/forms/d/e/1FAIpQLSf6uF2yKz8Z1gD2Wv5B_QzM79U7z_4eR6s7t8_2wY_9cWqG-Q/viewform?usp=sf_link';
const ANGKET_LINK: string = 'https://docs.google.com/forms/d/e/1FAIpQLSf6uF2yKz8Z1gD2Wv5B_QzM79U7z_4eR6s7t8_2wY_9cWqG-Q/viewform?usp=sf_link'; // Silakan sesuaikan link angket respon peserta didik di sini

interface EcoChallengeViewProps {}

export default function EcoChallengeView({}: EcoChallengeViewProps) {
  const [submittedPosttest, setSubmittedPosttest] = useState(false);
  const [submittedAngket, setSubmittedAngket] = useState(false);

  const handleOpenPosttest = () => {
    setSubmittedPosttest(true);
    if (POSTTEST_LINK && POSTTEST_LINK !== '#') {
      window.open(POSTTEST_LINK, '_blank');
    } else {
      alert('Link posttest belum tersedia.');
    }
  };

  const handleOpenAngket = () => {
    setSubmittedAngket(true);
    if (ANGKET_LINK && ANGKET_LINK !== '#') {
      window.open(ANGKET_LINK, '_blank');
    } else {
      alert('Link angket respon belum tersedia.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">

      {/* Header Banner */}
      <section className="text-left bg-gradient-to-r from-emerald-50 to-[#F5F5DC] p-6 md:p-8 rounded-3xl border border-[#c2c9bb]/40 flex flex-col md:flex-row items-center gap-6">
        <div className="shrink-0 p-4 bg-white rounded-2xl shadow border-2 border-[#91f78e]">
          <Award className="w-12 h-12 text-[#154212] fill-amber-100" />
        </div>
        <div>
          <h2 className="font-display font-black text-xl md:text-2xl text-[#154212] mb-1">
            Evaluasi Akhir & Angket Respon
          </h2>
          <p className="font-sans text-xs md:text-sm text-[#42493e] leading-relaxed">
            Silakan isi Posttest Evaluasi Akhir dan Angket Respon Peserta Didik melalui tautan di bawah ini untuk melengkapi rangkaian aktivitas pembelajaran.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        
        {/* Posttest Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between space-y-6 transition-all hover:shadow-md">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-[#154212] rounded-2xl">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-[#154212]">Posttest Evaluasi</h3>
                <p className="text-xs text-gray-400">Menguji Pemahaman Materi</p>
              </div>
            </div>
            <p className="text-xs text-[#42493e] leading-relaxed">
              Uji pemahaman Anda mengenai materi green chemistry, eco enzyme, dan solusi aksi nyata keberlanjutan lingkungan yang telah dipelajari.
            </p>
          </div>

          <div className="space-y-3">
            {submittedPosttest && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-[11px] text-emerald-950 font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#006e1c] shrink-0" />
                <span>Link Posttest telah dibuka di tab baru.</span>
              </div>
            )}
            <button
              onClick={handleOpenPosttest}
              className="w-full bg-[#154212] hover:bg-emerald-800 text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{submittedPosttest ? 'Buka Ulang Posttest' : 'Buka Posttest (Google Form)'}</span>
            </button>
          </div>
        </div>

        {/* Angket Respon Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between space-y-6 transition-all hover:shadow-md">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-[#154212] rounded-2xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-[#154212]">Angket Respon</h3>
                <p className="text-xs text-gray-400">Feedback Proses Belajar</p>
              </div>
            </div>
            <p className="text-xs text-[#42493e] leading-relaxed">
              Berikan respon dan tanggapan Anda selaku peserta didik mengenai pengalaman belajar menggunakan platform GAS Website ini.
            </p>
          </div>

          <div className="space-y-3">
            {submittedAngket && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-[11px] text-emerald-950 font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#006e1c] shrink-0" />
                <span>Link Angket Respon telah dibuka di tab baru.</span>
              </div>
            )}
            <button
              onClick={handleOpenAngket}
              className="w-full bg-[#154212] hover:bg-emerald-800 text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{submittedAngket ? 'Buka Ulang Angket Respon' : 'Buka Angket Respon'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
