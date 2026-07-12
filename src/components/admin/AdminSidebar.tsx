import React from 'react';
import { AdminTab } from '../../types';
import { 
  LayoutDashboard, 
  Users, 
  Leaf,
  LogOut,
  BookOpen,
  Newspaper,
  PhoneCall,
  FlaskConical,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}

export default function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const { logout, user } = useAuth();

  const navItems = [
    { id: 'admin-dashboard' as AdminTab, label: 'Dashboard Admin', icon: LayoutDashboard },
    { id: 'admin-users' as AdminTab, label: 'Manajemen Pengguna', icon: Users },
    { id: 'admin-ecopedia' as AdminTab, label: 'Kelola EcoPedia', icon: BookOpen },
    { id: 'admin-ecolab' as AdminTab, label: 'Kelola EcoLab', icon: FlaskConical },
    { id: 'admin-ecochallenge' as AdminTab, label: 'Kelola EcoChallenge', icon: ClipboardList },
    { id: 'admin-ecoupdate' as AdminTab, label: 'Kelola EcoUpdate', icon: Newspaper },
    { id: 'admin-ecocontact' as AdminTab, label: 'Kelola EcoContact', icon: PhoneCall },
  ];

  return (
    <aside 
      id="admin-sidebar"
      className="fixed left-0 top-0 h-screen w-64 bg-[#0b1b2e] flex flex-col py-6 text-white shadow-xl z-50 overflow-y-auto"
    >
      {/* Brand Header */}
      <div className="px-6 mb-8 flex items-center gap-3 text-left">
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
      <nav id="admin-sidebar-nav" className="flex-grow space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left py-3.5 px-6 flex items-center gap-3.5 transition-all duration-200 cursor-pointer text-sm font-medium border-l-4 ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 rounded-r-3xl font-semibold border-cyan-400 scale-[0.98] shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5 border-transparent hover:translate-x-1'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : ''}`} />
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
    </aside>
  );
}
