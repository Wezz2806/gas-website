import React, { useState } from 'react';
import { faqsList } from '../data';
import { 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  Mail, 
  Send, 
  CheckCircle, 
  PhoneCall, 
  MessageSquareOff,
  Sparkles
} from 'lucide-react';

interface SupportProps {}

export default function SupportView({}: SupportProps) {
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);
  
  // Contact Form states
  const [supportName, setSupportName] = useState('');
  const [supportSubject, setSupportSubject] = useState('Pertanyaan Umum');
  const [supportMessage, setSupportMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  const toggleFaq = (idx: number) => {
    if (expandedFaqId === idx) {
      setExpandedFaqId(null);
    } else {
      setExpandedFaqId(idx);
    }
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    setMessageSent(true);
    setSupportMessage('');
    setTimeout(() => {
      setMessageSent(false);
    }, 4500);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Search Header layout */}
      <section className="text-left bg-[#154212] p-6 md:p-8 rounded-3xl text-white shadow relative overflow-hidden">
        <div className="absolute right-[-5%] bottom-[-10%] opacity-15">
          <HelpCircle className="w-44 h-44" />
        </div>
        <div className="z-10 relative space-y-2">
          <span className="text-[10px] bg-[#91f78e] text-[#002201] font-bold px-3 py-1 rounded-full uppercase tracking-widest w-fit block">
            Pusat Bantuan Murid
          </span>
          <h2 className="font-display font-black text-xl md:text-2xl mt-1.5">
            Dukungan & FAQ Hub
          </h2>
          <p className="text-xs md:text-sm text-[#bcf0ae] leading-relaxed max-w-2xl">
            Kesulitan mengunggah LKM, memantau pH modul sirkular, atau ingin mengajukan saran riset rewilding kota? Temukan solusi instan di bawah ini.
          </p>
        </div>
      </section>

      {/* Grid: FAQ accordion vs Helpdesk Ticket */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
        
        {/* FAQ Accordion container */}
        <div className="space-y-5">
          <h3 className="font-display font-bold text-sm text-[#154212] tracking-wider uppercase border-b border-gray-100 pb-3 block flex items-center gap-1.5">
            <HelpCircle className="w-4.5 h-4.5 text-[#006e1c]" /> Pertanyaan yang Sering Diajukan
          </h3>

          <div className="space-y-3.5">
            {faqsList.map((faq, idx) => {
              const isExpanded = expandedFaqId === idx;
              return (
                <div 
                  key={idx}
                  className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 text-xs font-bold text-gray-800 text-left flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4.5 h-4.5 text-[#154212]" />
                    ) : (
                      <ChevronDown className="w-4.5 h-4.5 text-gray-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-600 leading-relaxed font-medium animate-in slide-in-from-top-1">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact/Support Helpdesk Submission Box */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-150 shadow-sm space-y-6">
          <h3 className="font-display font-bold text-sm text-[#154212] uppercase tracking-wider border-b border-gray-100 pb-3 block">
            Hubungi Pengasuh Modul / Guru
          </h3>

          {messageSent && (
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-[11px] text-emerald-900 leading-normal flex items-start gap-2 animate-in fade-in duration-200">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-950">Aspirasi Terkirim!</p>
                <p className="text-gray-600 mt-0.5">Pertanyaan Anda otomatis diposkan ke sistem pengajar. Bonus +10 Eco-Points ditanamkan!</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#42493e] uppercase mb-1 flex items-center gap-1">
                Subjek Tiket Pertanyaan
              </label>
              <select 
                value={supportSubject}
                onChange={(e) => setSupportSubject(e.target.value)}
                className="w-full bg-[#f3f3f4] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-[#154212] focus:outline-none"
              >
                <option>Pertanyaan Umum</option>
                <option>Kendala Mengunggah File LKM</option>
                <option>Saran Evaluasi Isu Lingkungan</option>
                <option>Laporan Kerusakan Data Offset</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#42493e] uppercase mb-1">Butir Pesan / Kendala Rinci</label>
              <textarea 
                rows={4}
                required
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Deskripsikan isu sirkuler Anda di mari..."
                className="w-full bg-[#f3f3f4] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-[#154212] focus:outline-none resize-none"
              />
            </div>

            <div className="bg-orange-100/50 p-3 rounded-xl border border-orange-200/50 text-[10px] text-orange-950 font-bold flex items-center gap-1.5 leading-snug">
              <HelpCircle className="w-4 h-4 text-orange-700 shrink-0" />
              <span>Tim pengajar kami akan menanggapi tiket bantuan Anda dalam kurun waktu 1x24 jam kerja.</span>
            </div>

            <button 
              type="submit"
              className="w-full bg-[#154212] hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Tiket Bantuan</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
