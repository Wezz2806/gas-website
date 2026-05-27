import React from 'react';
import { TeacherTab } from '../../types';
import { 
  LayoutDashboard, 
  BookOpen, 
  FlaskConical, 
  GraduationCap, 
  HelpCircle, 
  BarChart3, 
  Leaf,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TeacherSidebarProps {
  activeTab: TeacherTab;
  setActiveTab: (tab: TeacherTab) => void;
}

export default function TeacherSidebar({ activeTab, setActiveTab }: TeacherSidebarProps) {
  const { logout, user } = useAuth();

  const navItems = [
    { id: 'teacher-dashboard' as TeacherTab, label: 'Dashboard Guru', icon: LayoutDashboard },
    { id: 'teacher-meetings' as TeacherTab, label: 'Manajemen Pertemuan', icon: FlaskConical },
    { id: 'teacher-submissions' as TeacherTab, label: 'Review & Nilai LKM', icon: GraduationCap },
    { id: 'teacher-quiz' as TeacherTab, label: 'Manajemen Kuis', icon: HelpCircle },
    { id: 'teacher-progress' as TeacherTab, label: 'Laporan Kemajuan', icon: BarChart3 },
  ];

  return (
    <aside 
      id="teacher-sidebar"
      className="fixed left-0 top-0 h-screen w-70 bg-[#0d2e0b] flex flex-col py-6 text-white shadow-xl z-50 overflow-y-auto"
    >
      {/* Brand Header */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#91f78e] shadow-inner flex items-center justify-center text-[#154212] transition-transform hover:scale-110 cursor-pointer">
          <Leaf className="w-6 h-6 fill-current" />
        </div>
        <div>
          <h1 className="font-display font-black text-2xl tracking-tight text-white flex items-center gap-1.5">
            GAS <span className="text-[10px] bg-amber-400 text-amber-950 font-bold px-1.5 py-0.5 rounded-md uppercase">GURU</span>
          </h1>
          <p className="font-sans text-xs text-[#a1d494] opacity-90 tracking-wider">
            Teacher Panel
          </p>
        </div>
      </div>

      {/* User Info card in sidebar */}
      <div className="mx-4 mb-6 px-4 py-3 bg-white/5 rounded-2xl border border-white/10 text-left">
        <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Guru Aktif</p>
        <h5 className="font-bold text-xs text-white mt-1 truncate">{user?.full_name || 'Educator'}</h5>
        <p className="text-[10px] text-gray-400 truncate mt-0.5">{user?.email}</p>
      </div>

      {/* Primary Navigation links */}
      <nav id="teacher-sidebar-nav" className="flex-grow space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left py-3.5 px-6 flex items-center gap-3.5 transition-all duration-200 cursor-pointer text-sm font-medium border-l-4 ${
                isActive
                  ? 'bg-[#91f78e] text-[#002201] rounded-r-3xl font-semibold border-[#006e1c] scale-[0.98] shadow-md'
                  : 'text-[#bcf0ae] hover:text-white hover:bg-white/5 border-transparent hover:translate-x-1'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#006e1c] fill-[#91f78e]' : ''}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout button at bottom */}
      <div className="mt-auto px-4 pt-4 border-t border-[#1d421a]">
        <button
          onClick={logout}
          className="w-full text-left py-2.5 px-4 rounded-xl flex items-center gap-3 text-xs font-semibold text-rose-300 hover:text-rose-100 hover:bg-rose-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Sesi (Logout)</span>
        </button>
      </div>
    </aside>
  );
}
