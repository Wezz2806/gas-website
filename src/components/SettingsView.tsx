import React, { useState } from 'react';
import { 
  Shield, 
  Bell, 
  Save, 
  CheckCircle,
  Sparkles,
  Eye,
  Globe,
  Settings as SettingsIcon,
  RefreshCcw,
  Target
} from 'lucide-react';

interface SettingsProps {}

export default function SettingsView({}: SettingsProps) {
  const [prefNotification, setPrefNotification] = useState(true);
  const [prefWeeklySummary, setPrefWeeklySummary] = useState(true);
  const [prefDarkmode, setPrefDarkmode] = useState(false);
  const [prefLanguage, setPrefLanguage] = useState('id');
  const [weeklyGoal, setWeeklyGoal] = useState('2');
  const [focusModule, setFocusModule] = useState('ecopedia');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleResetCache = () => {
    if (confirm('Apakah Anda yakin ingin menyetel ulang preferensi cache lokal? Semua pengaturan visual akan dikembalikan ke bawaan.')) {
      setPrefNotification(true);
      setPrefWeeklySummary(true);
      setPrefDarkmode(false);
      setPrefLanguage('id');
      setWeeklyGoal('2');
      setFocusModule('ecopedia');
      alert('Cache preferensi lokal berhasil dibersihkan.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Settings Welcome Layout */}
      <header className="text-left bg-white p-6 rounded-3xl border border-gray-150 shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#bcf0ae]/20 rounded-2xl border border-[#9dd090]/35 text-[#154212]">
            <SettingsIcon className="w-8 h-8 animate-spin-slow" />
          </div>
          <div className="text-left">
            <h3 className="font-display font-black text-lg text-[#154212]">Pengaturan Platform GAS</h3>
            <p className="text-xs text-[#72796e] font-sans">Kustomisasi preferensi tampilan, target sirkular, dan notifikasi Anda</p>
          </div>
        </div>
      </header>

      {/* Main Settings Form grids */}
      <div className="grid grid-cols-12 gap-8 text-left">
        
        {/* Settings editing block - 8 columns */}
        <div className="col-span-12 lg:col-span-8 bg-white p-6 md:p-8 rounded-3xl border border-gray-150 shadow-sm">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {/* Save success toast inline */}
            {saveSuccess && (
              <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 p-3.5 rounded-2xl flex items-center gap-2 text-xs animate-in fade-in duration-200">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-semibold">Berhasil! Preferensi pengaturan Anda telah berhasil disimpan.</span>
              </div>
            )}

            {/* Section 1: Tampilan & Antarmuka */}
            <div className="space-y-4">
              <h4 className="font-display font-bold text-xs text-[#154212] uppercase tracking-wider border-b border-gray-50 pb-2.5 flex items-center gap-2">
                <Eye className="w-4.5 h-4.5 text-emerald-700" /> Tampilan & Antarmuka
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#42493e] uppercase mb-1.5 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> Bahasa Platform
                  </label>
                  <select 
                    value={prefLanguage}
                    onChange={(e) => setPrefLanguage(e.target.value)}
                    className="w-full bg-[#f3f3f4] border border-gray-250 rounded-xl px-3.5 py-2.5 text-xs text-[#1a1c1c] focus:outline-none focus:ring-1 focus:ring-[#154212]"
                  >
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English (US)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#42493e] uppercase mb-1.5 flex items-center gap-1">
                    Tema Warna
                  </label>
                  <div className="flex gap-4 items-center h-10">
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                      <input 
                        type="radio" 
                        name="theme" 
                        checked={!prefDarkmode}
                        onChange={() => setPrefDarkmode(false)}
                        className="text-emerald-700 focus:ring-emerald-600 cursor-pointer"
                      />
                      <span>Mode Terang (Bawaan)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                      <input 
                        type="radio" 
                        name="theme" 
                        checked={prefDarkmode}
                        onChange={() => setPrefDarkmode(true)}
                        className="text-emerald-700 focus:ring-emerald-600 cursor-pointer"
                      />
                      <span>Mode Gelap</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Target Pembelajaran Sirkular */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h4 className="font-display font-bold text-xs text-[#154212] uppercase tracking-wider border-b border-gray-50 pb-2.5 flex items-center gap-2">
                <Target className="w-4.5 h-4.5 text-emerald-700" /> Target Pembelajaran Sirkular
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#42493e] uppercase mb-1.5">Target Membaca Mingguan</label>
                  <select 
                    value={weeklyGoal}
                    onChange={(e) => setWeeklyGoal(e.target.value)}
                    className="w-full bg-[#f3f3f4] border border-gray-250 rounded-xl px-3.5 py-2.5 text-xs text-[#1a1c1c] focus:outline-none focus:ring-1 focus:ring-[#154212]"
                  >
                    <option value="1">1 Buku</option>
                    <option value="2">2 Buku</option>
                    <option value="5">5 Buku</option>
                    <option value="10">10 Buku</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#42493e] uppercase mb-1.5">Fokus Studi Utama</label>
                  <select 
                    value={focusModule}
                    onChange={(e) => setFocusModule(e.target.value)}
                    className="w-full bg-[#f3f3f4] border border-gray-250 rounded-xl px-3.5 py-2.5 text-xs text-[#1a1c1c] focus:outline-none focus:ring-1 focus:ring-[#154212]"
                  >
                    <option value="ecopedia">EcoPedia (Buku & Modul Bacaan)</option>
                    <option value="ecolab">EcoLab (Proyek & LKPD Kelas)</option>
                    <option value="ecocreation">EcoCreation (Video Kreasi & Inovasi)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Notifikasi & Peringatan */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h4 className="font-display font-bold text-xs text-[#154212] uppercase tracking-wider border-b border-gray-50 pb-2.5 flex items-center gap-2">
                <Bell className="w-4.5 h-4.5 text-emerald-700" /> Preferensi Notifikasi & LKM
              </h4>

              <div className="space-y-3.5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={prefNotification}
                    onChange={(e) => setPrefNotification(e.target.checked)}
                    className="mt-1 text-emerald-700 rounded-md focus:ring-emerald-600 border-gray-200 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-800">Kirim Peringatan Hari Seminar</span>
                    <p className="text-[10px] text-gray-400">Aktifkan pengingat instan Seminar Keberlanjutan 15 menit sebelum pembukaan dimulai.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={prefWeeklySummary}
                    onChange={(e) => setPrefWeeklySummary(e.target.checked)}
                    className="mt-1 text-emerald-700 rounded-md focus:ring-emerald-600 border-gray-200 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-800">Dapatkan Buletin Rangkap Karbon</span>
                    <p className="text-[10px] text-gray-400">Terima rangkuman mingguan offset emisi CO2 Anda via email setiap Senin pagi.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center flex-wrap gap-3">
              <button 
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-[#154212] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow border border-[#91f78e]/10"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan</span>
              </button>

              <button 
                type="button"
                onClick={handleResetCache}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCcw className="w-3.5 h-3.5 text-gray-500" />
                <span>Reset Preferensi</span>
              </button>
            </div>
          </form>
        </div>

        {/* Privacy Terms side widget - 4 columns */}
        <aside className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-150 space-y-4 shadow-sm">
            <div className="p-2 bg-emerald-100 text-[#154212] rounded-xl w-fit">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="font-display font-semibold text-[#154212] text-sm">Privasi & Standar Hijau</h4>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              GAS berkomitmen menjaga kerahasiaan data murid sirkular secara penuh. Seluruh data progres evaluasi, check-in seminar, dan file LKM disimpan privat di dalam memori database terenkripsi demi keamanan Anda.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
