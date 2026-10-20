import { useState, useEffect } from 'react';
import { Tab, Room } from '../types';
import { attendanceService } from '../services/attendanceService';
import { 
  LayoutDashboard, 
  BookOpen, 
  FlaskConical, 
  Newspaper,
  Video, 
  HelpCircle, 
  Leaf,
  CalendarCheck,
  Contact,
  ArrowLeft,
  DoorOpen,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  currentRoom?: Room | null;
  onBackToRooms?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, currentRoom, onBackToRooms }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasOpenAttendance, setHasOpenAttendance] = useState(false);

  useEffect(() => {
    if (!currentRoom?.id) return;
    attendanceService.getSessions(currentRoom.id)
      .then(res => {
        const open = res.sessions?.some(s => s.status === 'open' && (!s.my_status || s.my_status === 'alpa'));
        setHasOpenAttendance(Boolean(open));
      })
      .catch(() => {});
  }, [currentRoom?.id, activeTab]);

  const navItems = [
    { id: 'dashboard' as Tab, label: 'Dashboard Kelas', icon: LayoutDashboard },
    { id: 'ecolab' as Tab, label: 'EcoLab', icon: FlaskConical },
    { id: 'ecopedia' as Tab, label: 'EcoPedia', icon: BookOpen },
    { id: 'ecoupdate' as Tab, label: 'EcoUpdate', icon: Newspaper },
    { id: 'ecocreation' as Tab, label: 'EcoCreation', icon: Video },
    { id: 'ecochallenge' as Tab, label: 'EcoChallenge', icon: HelpCircle },
    { id: 'absensi' as Tab, label: 'Absensi', icon: CalendarCheck },
    { id: 'ecocontact' as Tab, label: 'EcoContact', icon: Contact },
  ];

  // Close mobile sidebar on route change
  const handleNavClick = (tab: Tab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const NavContent = ({ compact = false }: { compact?: boolean }) => (
    <>
      {/* Brand Header */}
      <div className={`px-4 mb-4 flex items-center gap-3 ${compact ? 'justify-center px-2' : ''}`}>
        <div className="w-10 h-10 shrink-0 rounded-xl bg-[#91f78e] shadow-inner flex items-center justify-center text-[#154212] transition-transform hover:scale-110 cursor-pointer">
          <Leaf className="w-6 h-6 fill-current" />
        </div>
        {!compact && (
          <div>
            <h1 className="font-display font-black text-2xl tracking-tight text-white flex items-center gap-1.5">
              GAS
            </h1>
            <p className="font-sans text-[10px] text-[#a1d494] opacity-90 tracking-wide leading-tight">
              From Knowledge to Sustainable Action
            </p>
          </div>
        )}
      </div>

      {/* Back to Classes / Current Room Info Pill */}
      {onBackToRooms && !compact && (
        <div className="px-4 mb-6">
          <button
            onClick={onBackToRooms}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-2 border border-white/10 transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#91f78e] group-hover:-translate-x-0.5 transition-transform" />
            <span className="truncate">Semua Kelas</span>
          </button>
          {currentRoom && (
            <div className="mt-2 px-3 py-2 rounded-xl bg-[#0e300b] border border-[#23581c] text-left">
              <span className="text-[10px] uppercase font-bold text-[#91f78e] tracking-wider block">Kelas Aktif:</span>
              <p className="text-xs font-bold text-white truncate">{currentRoom.name}</p>
              <p className="text-[10px] text-emerald-300/80 font-mono mt-0.5">Kunci: {currentRoom.room_key}</p>
            </div>
          )}
        </div>
      )}

      {/* Primary Navigation links */}
      <nav className="flex-grow space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              title={compact ? item.label : undefined}
              className={`w-full text-left py-3 flex items-center transition-all duration-200 cursor-pointer text-sm font-medium border-l-4 ${
                compact ? 'justify-center px-2' : 'px-5 gap-3.5'
              } ${
                isActive
                  ? 'bg-[#91f78e] text-[#002201] rounded-r-3xl font-semibold border-[#006e1c] shadow-md'
                  : 'text-[#bcf0ae] hover:text-white hover:bg-white/5 border-transparent hover:translate-x-1'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#006e1c] fill-[#91f78e]' : ''}`} />
              {!compact && (
                <span className="flex-1 flex items-center justify-between">
                  <span>{item.label}</span>
                  {item.id === 'absensi' && hasOpenAttendance && (
                    <span className="flex items-center gap-1 bg-amber-400 text-amber-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                      Buka
                    </span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Nav / Partner Logos */}
      <div className={`mt-auto pt-4 border-t border-[#2d5a27] flex items-center justify-center gap-4 ${compact ? 'flex-col px-0' : 'px-4'}`}>
        <img src="/edu_stem_logo.jpg" alt="Edu STEM Center" className="h-10 object-contain rounded-lg bg-white p-1 shadow-sm" />
        <img src="/unesa_logo.png" alt="UNESA" className="h-10 object-contain" />
      </div>
    </>

  );

  return (
    <>
      {/* ===== MOBILE: Hamburger trigger button (shown only on small screens) ===== */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Buka Menu"
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-[#154212] text-white flex items-center justify-center shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ===== MOBILE: Backdrop overlay ===== */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ===== MOBILE: Drawer sidebar (slides in from left) ===== */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-screen w-64 bg-[#154212] flex flex-col py-6 text-white shadow-2xl z-50 overflow-y-auto transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button inside drawer */}
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Tutup Menu"
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <NavContent compact={false} />
      </aside>

      {/* ===== DESKTOP: Fixed full sidebar (hidden below lg) ===== */}
      <aside
        id="main-sidebar"
        className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-[#154212] flex-col py-6 text-white shadow-xl z-50 overflow-y-auto"
      >
        <NavContent compact={false} />
      </aside>
    </>
  );
}
