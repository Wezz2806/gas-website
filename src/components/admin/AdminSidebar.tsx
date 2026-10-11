import React, { useState, useEffect } from 'react';
import { AdminTab } from '../../types';
import { 
  LayoutDashboard, 
  DoorOpen,
  Users, 
  Leaf,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}

export default function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'admin-dashboard' as AdminTab, label: 'Dashboard Admin', icon: LayoutDashboard },
    { id: 'admin-rooms' as AdminTab, label: 'Kelola Kelas', icon: DoorOpen },
    { id: 'admin-users' as AdminTab, label: 'Manajemen Pengguna', icon: Users },
  ];

  const handleNavClick = (tab: AdminTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const NavContent = () => (
    <>
      {/* Brand Header */}
      <div className="px-6 mb-6 flex items-center gap-3 text-left">
        <div className="w-10 h-10 rounded-xl bg-cyan-400 shadow-inner flex items-center justify-center text-slate-900 transition-transform hover:scale-110 cursor-pointer">
          <Leaf className="w-6 h-6 fill-current" />
        </div>
        <div>
          <h1 className="font-display font-black text-2xl tracking-tight text-white flex items-center gap-1.5">
            GAS <span className="text-[10px] bg-cyan-400 text-slate-950 font-bold px-1.5 py-0.5 rounded-md uppercase">ADMIN</span>
          </h1>
          <p className="font-sans text-xs text-cyan-300 opacity-90 tracking-wider">
            Control Center
          </p>
        </div>
      </div>

      {/* User Info card in sidebar */}
      <div className="mx-4 mb-6 px-4 py-3 bg-white/5 rounded-2xl border border-white/10 text-left">
        <p className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Administrator</p>
        <h5 className="font-bold text-xs text-white mt-1 truncate">{user?.full_name || 'System Admin'}</h5>
        <p className="text-[10px] text-gray-400 truncate mt-0.5">{user?.email}</p>
      </div>

      {/* Primary Navigation links */}
      <nav id="admin-sidebar-nav" className="flex-grow space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-left py-3.5 px-6 flex items-center gap-3.5 transition-all duration-200 cursor-pointer text-sm font-medium border-l-4 ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 rounded-r-3xl font-semibold border-cyan-400 scale-[0.98] shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5 border-transparent hover:translate-x-1'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-cyan-400' : ''}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Partner Logos */}
      <div className="mt-auto px-4 pt-4 border-t border-slate-800 flex items-center justify-center gap-4">
        <img src="/edu_stem_logo.jpg" alt="Edu STEM Center" className="h-10 object-contain rounded-lg bg-white p-1 shadow-sm" />
        <img src="/unesa_logo.png" alt="UNESA" className="h-10 object-contain" />
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Buka Menu Admin"
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-[#0b1b2e] text-cyan-400 flex items-center justify-center shadow-lg border border-cyan-500/30"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-screen w-64 bg-[#0b1b2e] flex flex-col py-6 text-white shadow-2xl z-50 overflow-y-auto transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Tutup Menu"
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside 
        id="admin-sidebar"
        className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-[#0b1b2e] flex-col py-6 text-white shadow-xl z-50 overflow-y-auto"
      >
        <NavContent />
      </aside>
    </>
  );
}
