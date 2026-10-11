import React, { useState, useEffect } from 'react';
import { RoomContact } from '../types';
import { contactService } from '../services/contactService';
import { 
  Contact, 
  Phone, 
  Mail, 
  Clock, 
  Building2, 
  MessageSquare, 
  User, 
  Loader2, 
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface EcoContactViewProps {
  roomId: number;
}

const getAvatarUrl = (path: string | null) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) return path;
  if (path.startsWith('./')) {
    return path.substring(1); // e.g. './azza.jpg' -> '/azza.jpg'
  }
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
  const BACKEND_URL = API_BASE.replace(/\/api$/, '') || '';
  return `${BACKEND_URL}${path.startsWith('/') ? path : '/' + path}`;
};

export default function EcoContactView({ roomId }: EcoContactViewProps) {
  const [contacts, setContacts] = useState<RoomContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadContacts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await contactService.getRoomContacts(roomId);
      setContacts(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memuat kontak kelas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      loadContacts();
    }
  }, [roomId]);

  const formatWaNumber = (phone: string | null) => {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }
    return cleaned;
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-[#f4fbe9] to-[#F5F5DC] p-6 sm:p-8 rounded-3xl border border-[#c2c9bb]/40 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#006e1c] font-bold text-xs uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <Contact className="w-3.5 h-3.5" />
              EcoContact
            </span>
          </div>
          <h2 className="font-display font-black text-2xl md:text-3xl text-[#154212] tracking-tight">
            Pusat Informasi & Kontak Pembimbing
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Terhubung langsung dengan guru, dosen, dan tim fasilitator kelas. Jangan ragu berkonsultasi mengenai materi Kimia Hijau, proyek Ekoenzim, atau kendala praktikum.
          </p>
        </div>

        <button
          onClick={loadContacts}
          disabled={loading}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
          <span className="text-xs text-stone-500 font-semibold">Memuat kontak pembimbing kelas...</span>
        </div>
      ) : contacts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-16 text-center">
          <Contact className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-700">Belum Ada Kontak untuk Kelas Ini</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Guru atau administrator belum menambahkan informasi kontak pembimbing untuk kelas ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact) => {
            const avatarSrc = getAvatarUrl(contact.avatar_url);
            const waNumber = formatWaNumber(contact.phone);

            return (
              <div
                key={contact.id}
                className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Avatar & Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 border-2 border-emerald-100 shrink-0 shadow-xs relative">
                      {avatarSrc ? (
                        <img 
                          src={avatarSrc} 
                          alt={contact.name} 
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            // Fallback jika file foto lokal 404
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400 bg-emerald-50 text-emerald-700">
                          <User className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                        {contact.role || 'Pembimbing'}
                      </span>
                      <h3 className="font-display font-bold text-base text-stone-900 leading-snug line-clamp-2">
                        {contact.name}
                      </h3>
                      {contact.instansi && (
                        <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-1.5 truncate">
                          <Building2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="truncate">{contact.instansi}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Info Details */}
                  {(contact.office_hours || contact.email || contact.phone) ? (
                    <div className="space-y-2 py-3 border-t border-stone-100 text-xs text-stone-600">
                      {contact.office_hours && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="text-[11px] text-stone-500">Jam Konsultasi:</span>
                          <span className="font-semibold text-stone-700 ml-auto">{contact.office_hours}</span>
                        </div>
                      )}
                      {contact.email && (
                        <div className="flex items-center gap-2 truncate">
                          <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate text-stone-700">{contact.email}</span>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="text-stone-700 font-mono text-[11px]">{contact.phone}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-3 border-t border-stone-100 text-[11px] text-stone-400 italic flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 shrink-0"></span>
                      <span>Konsultasi melalui koordinator atau saat sesi tatap muka kelas</span>
                    </div>
                  )}
                </div>

                {/* Direct Action Buttons (hanya jika ada kontak aktif) */}
                {((contact.phone && waNumber) || contact.email) && (
                  <div className="pt-4 mt-2 border-t border-stone-100 flex items-center gap-2">
                    {contact.phone && waNumber && (
                      <a
                        href={`https://wa.me/${waNumber}?text=Halo%20${encodeURIComponent(contact.name)},%20saya%20siswa%20GAS%20ingin%20berkonsultasi.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}?subject=Konsultasi%20Kelas%20GAS`}
                        className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        title="Kirim Email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span className={contact.phone ? 'hidden sm:inline' : 'inline'}>Email</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
