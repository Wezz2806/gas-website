import { useState, useEffect } from 'react';
import { Tab } from '../types';
import { 
  LayoutDashboard, 
  BookOpen, 
  FlaskConical, 
  Newspaper, 
  Video, 
  HelpCircle, 
  LifeBuoy,
  Leaf,
  Phone,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ecopedia' as Tab, label: 'EcoPedia', icon: BookOpen },
    { id: 'ecolab' as Tab, label: 'EcoLab', icon: FlaskConical },
    { id: 'ecoupdate' as Tab, label: 'EcoUpdate', icon: Newspaper },
    { id: 'ecocreation' as Tab, label: 'EcoCreation', icon: Video },
    { id: 'ecochallenge' as Tab, label: 'EcoChallenge', icon: HelpCircle },
    { id: 'ecocontact' as Tab, label: 'EcoContact', icon: Phone },
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
      <div className={`px-4 mb-8 flex items-center gap-3 ${compact ? 'justify-center px-2' : ''}`}>
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
              {!compact && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className={`mt-auto pt-4 border-t border-[#2d5a27] space-y-1 ${compact ? 'px-0' : 'px-4'}`}>
        <button
          onClick={() => handleNavClick('support')}
          title={compact ? 'Dukungan & FAQ' : undefined}
          className={`w-full text-left py-2.5 flex items-center transition-colors text-xs font-semibold cursor-pointer rounded-lg ${
            compact ? 'justify-center px-2' : 'px-4 gap-3'
          } ${
            activeTab === 'support'
              ? 'bg-[#91f78e] text-[#002201] shadow-inner'
              : 'text-[#bcf0ae] hover:text-white hover:bg-white/5'
          }`}
        >
          <LifeBuoy className="w-4 h-4 shrink-0" />
          {!compact && <span>Dukungan & FAQ</span>}
        </button>
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
