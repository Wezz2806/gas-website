import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Send, 
  MapPin, 
  Clock, 
  CheckCircle,
  User,
  BookOpen
} from 'lucide-react';

interface EcoContactViewProps {}

const teacherInfo = {
  name: 'Pak Ahmad Rifa\'i, S.Pd.',
  subject: 'Guru Kimia & Koordinator GAS',
  email: 'ahmad.rifai@sekolah.sch.id',
  phone: '0812-3456-7890',
  officeHours: 'Senin–Jumat, 08.00–15.00 WIB',
  location: 'Ruang Guru Lt. 2, Lab Kimia',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtRaF3N8yCBiYfLhuRpzfcdjfE7CHzcuQRfQpBFIbGIHz4ol-yq5s2ontlbkkO1PE3vyXwPXFrdVH0LVL-2_34uafPrXxR9ppQAK9-V23jX8lDmtIxfdoK5pddLNa9k2a-ZlqjSYnO2UNMgSEyWmQG9lBIAmF4N1drnsAinDqbVhmouTuNl6WVftABSp0KZuFPKDcGwbIKY7d5qgYMCw3hcqJfZNsRK1tBuzVr5wBlzQxv86YHEWrcGZ92Ne3vtu-PqL23edAmHUkR',
};

export default function EcoContactView({}: EcoContactViewProps) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim() || !message.trim()) return;
    setLoading(true);
    // Simulate sending
    await new Promise(r => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">

      {/* Header */}
      <header className="text-left">
        <h2 className="font-display font-black text-2xl text-[#154212] mb-2">
          EcoContact — Hubungi Guru
        </h2>
        <p className="font-sans text-sm text-[#42493e] max-w-2xl leading-relaxed">
          Ada pertanyaan tentang materi, LKM, atau proyek GAS? Kirim pesan langsung ke guru pengajar atau hubungi melalui kontak yang tersedia.
        </p>
      </header>

      <div className="grid grid-cols-12 gap-8">

        {/* Left: Contact Form */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-display font-bold text-base text-[#154212] mb-5 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#006e1c]" />
              Kirim Pesan ke Guru
            </h3>

            {sent ? (
              <div className="py-10 flex flex-col items-center justify-center text-center space-y-3 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-9 h-9 text-[#006e1c]" />
                </div>
                <div>
                  <p className="font-bold text-base text-[#154212]">Pesan Terkirim!</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs">
                    Guru akan merespons pesan Anda dalam waktu 1×24 jam pada hari kerja.
                  </p>
                </div>
                <button
                  onClick={() => { setSent(false); setName(''); setSubject(''); setMessage(''); }}
                  className="text-xs font-bold text-[#154212] hover:underline cursor-pointer"
                >
                  Kirim pesan lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#42493e] uppercase tracking-wider mb-1">Nama Lengkap Anda</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama Anda"
                      className="w-full bg-[#f3f3f4] border border-[#c2c9bb] focus:border-[#154212] focus:bg-white text-xs text-[#1a1c1c] rounded-xl pl-10 pr-4 py-2.5 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#42493e] uppercase tracking-wider mb-1">Perihal / Subjek</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <BookOpen className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Misal: Pertanyaan tentang LKM Meeting 2"
                      className="w-full bg-[#f3f3f4] border border-[#c2c9bb] focus:border-[#154212] focus:bg-white text-xs text-[#1a1c1c] rounded-xl pl-10 pr-4 py-2.5 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#42493e] uppercase tracking-wider mb-1">Isi Pesan</label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tulis pertanyaan atau pesan Anda di sini..."
                    className="w-full bg-[#f3f3f4] border border-[#c2c9bb] focus:border-[#154212] focus:bg-white text-xs text-[#1a1c1c] rounded-xl px-4 py-2.5 focus:outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#154212] hover:bg-[#276e23] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirim Pesan</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right: Teacher Info */}
        <aside className="col-span-12 lg:col-span-5 space-y-6">
          {/* Teacher profile card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={teacherInfo.avatar}
                alt={teacherInfo.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#91f78e]"
              />
              <div>
                <h4 className="font-display font-bold text-sm text-[#154212]">{teacherInfo.name}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{teacherInfo.subject}</p>
              </div>
            </div>

            <div className="space-y-3 border-t border-gray-100 pt-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-[#006e1c]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email</p>
                  <a href={`mailto:${teacherInfo.email}`} className="text-xs text-[#154212] font-semibold hover:underline">
                    {teacherInfo.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-[#006e1c]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">WhatsApp / Telepon</p>
                  <a href={`tel:${teacherInfo.phone.replace(/-/g, '')}`} className="text-xs text-[#154212] font-semibold hover:underline">
                    {teacherInfo.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-[#006e1c]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Jam Konsultasi</p>
                  <p className="text-xs text-[#154212] font-semibold">{teacherInfo.officeHours}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[#006e1c]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Lokasi</p>
                  <p className="text-xs text-[#154212] font-semibold">{teacherInfo.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="bg-[#F5F5DC] border border-[#c2c9bb]/50 rounded-2xl p-4 text-left">
            <p className="text-xs text-[#42493e] leading-relaxed font-medium">
              💡 <strong>Tips:</strong> Untuk respons lebih cepat, sertakan nomor LKM dan nama proyek yang ingin ditanyakan dalam pesan Anda.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
