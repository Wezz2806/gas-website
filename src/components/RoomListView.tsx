import React, { useState, useEffect } from 'react';
import { Room } from '../types';
import { useAuth } from '../context/AuthContext';
import { roomService } from '../services/roomService';
import { 
  BookOpen, 
  Users, 
  KeyRound, 
  ArrowRight, 
  LogOut, 
  User as UserIcon, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Leaf,
  Plus
} from 'lucide-react';

interface RoomListViewProps {
  onSelectRoom: (room: Room) => void;
}

export default function RoomListView({ onSelectRoom }: RoomListViewProps) {
  const { user, logout } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinKey, setJoinKey] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await roomService.getMyRooms();
      setRooms(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinKey.trim()) return;

    try {
      setJoinLoading(true);
      setJoinError('');
      setJoinSuccess('');
      const joinedRoom = await roomService.joinRoom(joinKey.trim());
      setJoinSuccess(`Berhasil bergabung ke kelas "${joinedRoom.name}"!`);
      setJoinKey('');
      await fetchRooms();
      setTimeout(() => {
        setShowJoinModal(false);
        setJoinSuccess('');
      }, 1200);
    } catch (err: any) {
      setJoinError(err.message || 'Kunci kelas tidak valid atau gagal bergabung.');
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF7ED] text-stone-800 font-sans selection:bg-[#91f78e] selection:text-[#002201]">
      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#154212]/10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#91f78e] shadow-inner flex items-center justify-center text-[#154212] transition-transform hover:scale-105">
              <Leaf className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-2xl tracking-tight text-[#154212]">GAS</span>
                <span className="text-xs bg-[#154212]/10 text-[#154212] font-bold px-2 py-0.5 rounded-full">Ruang Belajar</span>
              </div>
              <p className="font-sans text-[11px] text-stone-500 font-medium">From Knowledge to Sustainable Action</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#154212] text-white text-sm font-semibold hover:bg-[#1a5317] transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-[#91f78e]" />
              <span>Gabung Kelas</span>
            </button>

            <div className="h-8 w-px bg-stone-200 hidden sm:block" />

            {/* User Profile Pill */}
            <div className="flex items-center gap-3 pl-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[#154212] font-bold text-sm overflow-hidden">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-5 h-5 text-emerald-700" />
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-stone-900 leading-tight">{user?.full_name}</p>
                <p className="text-[11px] text-stone-500 capitalize">{user?.role === 'admin' ? 'Administrator' : 'Murid'}</p>
              </div>

              <button
                onClick={logout}
                title="Keluar Akun"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content Container ─────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Banner Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#154212] to-[#25631e] text-white p-8 sm:p-12 mb-10 shadow-xl border border-white/10">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
            <Leaf className="w-96 h-96 -mr-20 -mt-20" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-medium text-emerald-200 mb-4 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-[#91f78e]" />
              <span>Portal Pembelajaran Berkelanjutan</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-white mb-3">
              Halo, {user?.full_name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed mb-6 font-normal">
              Pilih kelas Anda di bawah ini untuk mempelajari modul Ekoenzim & Kimia Hijau, mengunggah LKM, mengumpulkan karya inovasi, dan berdiskusi.
            </p>

            <button
              onClick={() => setShowJoinModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#91f78e] text-[#002201] text-sm font-bold hover:bg-[#80e57d] hover:shadow-lg transition-all cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Masukkan Kunci Kelas Baru</span>
            </button>
          </div>
        </section>

        {/* ── Grid Kelas ─────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold font-display text-stone-900">Kelas Terdaftar</h2>
              <p className="text-xs text-stone-500">Daftar kelas yang sedang Anda ikuti</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
              {rooms.length} Kelas
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-stone-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#154212] mb-3" />
              <p className="text-sm font-medium">Memuat daftar kelas...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300 shadow-xs max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#154212] flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                <KeyRound className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-1">Belum Terdaftar di Kelas</h3>
              <p className="text-xs text-stone-500 mb-6 leading-relaxed">
                Anda belum bergabung dengan kelas manapun. Masukkan kunci kelas yang diberikan oleh guru/admin untuk memulai.
              </p>
              <button
                onClick={() => setShowJoinModal(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#154212] text-white text-sm font-semibold hover:bg-[#1a5317] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#91f78e]" />
                <span>Gabung ke Kelas Pertama</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => {
                const cover = room.cover_image || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80';
                return (
                  <div
                    key={room.id}
                    className="group bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300 flex flex-col"
                  >
                    {/* Card Cover */}
                    <div className="relative h-44 overflow-hidden bg-stone-100">
                      <img 
                        src={cover} 
                        alt={room.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                      
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg bg-black/50 text-white backdrop-blur-md border border-white/20">
                          Kunci: {room.room_key}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="text-lg font-bold text-white leading-snug drop-shadow-sm line-clamp-1">
                          {room.name}
                        </h3>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
                        {room.description || 'Tidak ada deskripsi untuk kelas ini.'}
                      </p>

                      <div className="space-y-4 pt-3 border-t border-stone-100">
                        <div className="flex items-center justify-between text-xs text-stone-500">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Users className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{room.members_count || 0} Murid</span>
                          </span>
                          <span className="text-[11px] text-stone-400">
                            {room.creator_name ? `Oleh: ${room.creator_name}` : 'GAS Admin'}
                          </span>
                        </div>

                        <button
                          onClick={() => onSelectRoom(room)}
                          className="w-full py-3 px-4 rounded-xl bg-[#154212] hover:bg-[#1a5317] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer group-hover:translate-x-0.5"
                        >
                          <span>Masuk ke Kelas</span>
                          <ArrowRight className="w-4 h-4 text-[#91f78e]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* ── Modal Gabung Kelas ────────────────────────────────────────── */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#154212] flex items-center justify-center border border-emerald-100">
                <KeyRound className="w-6 h-6" />
              </div>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinError('');
                  setJoinSuccess('');
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 text-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <h3 className="text-xl font-bold font-display text-stone-900 mb-1">Gabung ke Kelas</h3>
            <p className="text-xs text-stone-500 mb-6">
              Masukkan kunci kelas unik yang diberikan guru atau admin untuk mengakses modul belajar.
            </p>

            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Kunci Kelas (Room Key)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: GAS-KIMIA1"
                  value={joinKey}
                  onChange={(e) => setJoinKey(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 text-sm font-mono uppercase font-bold tracking-wider rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#154212] focus:border-transparent bg-stone-50"
                  autoFocus
                />
              </div>

              {joinError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{joinError}</span>
                </div>
              )}

              {joinSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{joinSuccess}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-stone-200 text-stone-600 font-semibold text-xs hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={joinLoading || !joinKey.trim()}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#154212] hover:bg-[#1a5317] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  {joinLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#91f78e]" />
                      <span>Memeriksa...</span>
                    </>
                  ) : (
                    <span>Gabung Sekarang</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
